"""UI 冒烟：在真 Chrome 里装载油猴脚本，验证答题面板的端点输入、链路自动判定与模型下拉。

离线运行，不连生产：
  * 起本地 uvicorn（假上游，提供 /v1/models 与 /chat/completions）
  * 注入本地真实前端依赖（Vue / ElementPlus / Pinia / rxjs / md5），不走网络
  * 用 GM_* shim 注入，打开章节页让面板出现

对脚本源码做两处**仅测试用**的替换（不改仓库文件）：
  1. `attachShadow({ mode: "closed" })` -> `"open"`：closed shadow root 外部无法查询，
     真实油猴环境同样查不到，测试需要穿透。
  2. HTTPS 校验放行明文 HTTP：本地测试服务没有证书。

端点与密钥现在默认留空（只读浏览器缓存），所以测试在种配置阶段把 endpoint 指到本地假上游。

前置：前端依赖需在本地，按顺序找
  1) 环境变量 UI_DEPS_DIR
  2) %TEMP%/uideps
缺失时报错并给出下载命令。

跑法：python ui_smoke.py
"""

from __future__ import annotations

import json
import os
import tempfile
import threading
import time
from pathlib import Path

os.environ.setdefault("CPA_API_KEY", "test-key")
os.environ["CACHE_PATH"] = os.path.join(tempfile.mkdtemp(), "ui.db")

import httpx  # noqa: E402
import uvicorn  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

import server  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "tangwg学习通.user.js"
PORT = 18100
BASE = f"http://127.0.0.1:{PORT}"

DEPS = {
    "vue.global.prod.js": "https://lib.baomitu.com/vue/3.4.31/vue.global.prod.js",
    "index.iife.js": "https://lib.baomitu.com/vue-demi/0.14.7/index.iife.js",
    "index.full.min.js": "https://lib.baomitu.com/element-plus/2.7.2/index.full.min.js",
    "pinia.iife.min.js": "https://lib.baomitu.com/pinia/2.3.1/pinia.iife.min.js",
    "rxjs.umd.min.js": "https://lib.baomitu.com/rxjs/7.8.2/rxjs.umd.min.js",
    "md5.min.js": "https://lib.baomitu.com/blueimp-md5/2.19.0/js/md5.min.js",
    "index.css": "https://lib.baomitu.com/element-plus/2.7.2/index.css",
}


def deps_dir() -> Path:
    candidates = [os.getenv("UI_DEPS_DIR"), str(Path(tempfile.gettempdir()) / "uideps")]
    for c in candidates:
        if c and all((Path(c) / f).exists() for f in DEPS):
            return Path(c)
    raise SystemExit(
        "缺少前端依赖目录。先执行：\n"
        "  mkdir -p /tmp/uideps && cd /tmp/uideps && \\\n"
        + " \\\n".join(f"  curl -sS -f --ssl-no-revoke -O {u}" for u in DEPS.values())
        + "\n再用 UI_DEPS_DIR=/tmp/uideps 运行本脚本。"
    )


async def fake_upstream(request: httpx.Request) -> httpx.Response:
    # 代理侧的假 CPA：/v1/models 返回代理模型列表接口要转发的形态
    if request.method == "GET" and request.url.path.endswith("/models"):
        return httpx.Response(200, json={"data": [
            {"id": "gemini-3.8-flash-high", "name": "Gemini 3.8 Flash High"},
            {"id": "gpt-4o-mini", "name": "GPT-4o mini"},
            {"id": "claude-sonnet-5-5"},
        ]})
    return httpx.Response(200, json={"choices": [{"message": {"content": '{"values": ["甲"]}'}}]})


GM_SHIM = """
window.GM_addStyle = (css) => { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); };
window.GM_getResourceText = (k) => (window.__RES__ && window.__RES__[k]) || '';
window.GM_getValue = (k, d) => { const v = localStorage.getItem('gm::' + k); return v === null ? d : v; };
window.GM_setValue = (k, v) => { localStorage.setItem('gm::' + k, v); };
window.GM_info = { script: { name: 'tangwg学习通', author: 'tangwg', namespace: 'noshuang', version: '0.7.0', description: 'ui-smoke' } };
window.unsafeWindow = window;
window.GM_xmlhttpRequest = (details) => {
  const xhr = new XMLHttpRequest();
  xhr.open(details.method || 'GET', details.url, true);
  Object.entries(details.headers || {}).forEach(([k, v]) => { try { xhr.setRequestHeader(k, v); } catch (e) {} });
  xhr.timeout = details.timeout || 0;
  xhr.onload = () => details.onload && details.onload({ status: xhr.status, statusText: xhr.statusText, responseText: xhr.responseText, responseHeaders: xhr.getAllResponseHeaders(), finalUrl: details.url });
  xhr.onerror = () => details.onerror && details.onerror({ status: xhr.status, error: 'error' });
  xhr.ontimeout = () => details.ontimeout && details.ontimeout();
  xhr.onabort = () => details.onabort && details.onabort();
  xhr.send(details.data || null);
  return { abort: () => xhr.abort() };
};
"""

FIXTURE = "<!doctype html><html><head><meta charset='utf-8'></head><body></body></html>"


def patched_for_test(src: str) -> str:
    shadow_old = 'shadowHost.attachShadow({ mode: "closed" })'
    shadow_new = 'shadowHost.attachShadow({ mode: "open" })'
    assert shadow_old in src, "脚本的 shadow root 写法变了，需要同步更新测试"
    src = src.replace(shadow_old, shadow_new)
    # 端点与密钥默认留空、只从浏览器缓存读，所以这里不需要再替换内置地址；
    # 测试在种配置阶段直接把 endpoint 指到本地假上游。
    assert 'endpoint: ""' in src, "默认端点不再是空值，需要同步更新测试"
    # 生产环境强制 HTTPS；测试服务是本地明文 HTTP。
    # 模型列表（proxy）、搜题（proxy）与直连各有一次校验，全部放开。
    https_guard = 'if (baseUrl.protocol !== "https:")'
    assert src.count(https_guard) == 3, "HTTPS 校验位置变了，需要同步更新测试"
    src = src.replace(https_guard, 'if (!["https:", "http:"].includes(baseUrl.protocol))')
    return src


def main() -> None:
    deps = deps_dir()
    config = uvicorn.Config(server.app, host="127.0.0.1", port=PORT, log_level="warning")
    srv = uvicorn.Server(config)
    thread = threading.Thread(target=srv.run, daemon=True)
    thread.start()
    for _ in range(120):
        try:
            if httpx.get(f"{BASE}/health", timeout=1.0).status_code == 200:
                break
        except httpx.HTTPError:
            time.sleep(0.1)
    else:
        raise SystemExit("uvicorn 未启动")
    server.app.state.client = httpx.AsyncClient(transport=httpx.MockTransport(fake_upstream), timeout=10.0)

    script_src = patched_for_test(SCRIPT.read_text(encoding="utf-8"))
    stored_config = {
        "version": "0.7.0", "isMinus": False, "position": {"x": "60px", "y": "60px"},
        "menuIndex": "1", "platformName": "cx",
        "platformParams": {
            "cx": {"name": "tangwg学习通", "parts": [{"name": "章节设置", "params": []}]},
            "zhs": {"name": "智慧树", "parts": []}, "unknown": {"name": "未知", "parts": []},
        },
        "otherParams": {"name": "其他参数", "params": [
            {"name": "切换、答题间隔，单位秒", "value": 1, "type": "number", "min": 1},
            {"name": "正确答案率占多少自动提交", "value": 85, "type": "number"},
            {"name": "答案相似度超过多少选择", "value": 85, "type": "number"},
        ]},
        "queryApis": [{"name": "题库", "endpoint": BASE, "mode": "proxy", "token": "",
                       "directDoubleCheck": True, "model": ""}],
    }

    failures: list[str] = []
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 900})
        page_errors: list[str] = []
        page.on("pageerror", lambda e: page_errors.append(str(e)))
        api_log: list[str] = []

        def log_api(route):
            # 直连模式由浏览器直接打上游 /v1/*，uvicorn 里没有这些路由，直接在这里回假数据
            path = route.request.url.split(BASE, 1)[-1].split("?")[0]
            if path.startswith("/stt/v1/"):
                api_log.append(f"{route.request.method} {route.request.url} -> 200 (fake stt)")
                if path == "/stt/v1/models":
                    route.fulfill(status=200, content_type="application/json", body=json.dumps({
                        "data": [
                            {"id": "FunAudioLLM/SenseVoiceSmall", "name": "SenseVoiceSmall"},
                            {"id": "whisper-large-v3-turbo"},
                        ],
                    }, ensure_ascii=False))
                else:
                    route.fulfill(status=200, content_type="application/json", body=json.dumps({"text": "ok"}))
                return
            if path.startswith("/v1/"):
                api_log.append(f"{route.request.method} {route.request.url} -> 200 (fake upstream)")
                if path == "/v1/models":
                    route.fulfill(status=200, content_type="application/json", body=json.dumps({
                        "object": "list",
                        "data": [
                            {"id": "gpt-4o-mini", "object": "model"},
                            {"id": "models/gemini-3.8-flash-high", "object": "model", "name": "Gemini 3.8 Flash High"},
                            {"id": "claude-sonnet-5-5", "object": "model"},
                        ],
                    }, ensure_ascii=False))
                else:
                    route.fulfill(
                        status=200,
                        content_type="text/event-stream",
                        body='data: {"choices":[{"delta":{"content":"{\\"values\\": [\\"甲\\"]}"}}]}\r\n\r\ndata: [DONE]\r\n',
                    )
                return
            resp = route.fetch()
            api_log.append(f"{route.request.method} {route.request.url} -> {resp.status} {resp.text()[:200]}")
            route.fulfill(response=resp)

        page.route(f"{BASE}/**", log_api)
        # 测试里临时填的自定义端点不该真的发出去：立刻失败，让面板的 loading 尽早结束
        page.route("https://my-proxy.example.com/**", lambda r: r.abort())

        page.route("http://mooc1.chaoxing.com/**",
                   lambda r: r.fulfill(status=200, content_type="text/html", body=FIXTURE))
        page.add_init_script(GM_SHIM)
        # 只在首次进入时种配置：刷新页面要能看到用户刚改的值（用 if 而不是无条件写入）
        page.add_init_script(
            f"if (!localStorage.getItem('gm::config')) localStorage.setItem('gm::config', "
            f"{json.dumps(json.dumps(stored_config, ensure_ascii=False))});")
        page.goto("http://mooc1.chaoxing.com/mycourse/studentstudy?chapterId=1&courseId=2&clazzid=3&mooc2=1",
                  wait_until="load", timeout=30000)

        for name, global_name in [
            ("vue.global.prod.js", "Vue"),
            ("index.iife.js", "VueDemi"),
            ("index.full.min.js", "ElementPlus"),
            ("pinia.iife.min.js", "Pinia"),
            ("rxjs.umd.min.js", "rxjs"),
            ("md5.min.js", "md5"),
        ]:
            page.add_script_tag(content=(deps / name).read_text(encoding="utf-8", errors="replace"))
            page.wait_for_function(f"typeof {global_name} !== 'undefined'", timeout=15000)
        css_text = (deps / "index.css").read_text(encoding="utf-8", errors="replace")
        page.add_style_tag(content=css_text)
        # 脚本用 GM_getResourceText 把 ElementPlus CSS 注入 shadow root；shim 里回放同一份
        page.evaluate("(css) => { window.__RES__ = { ElementPlus: css, ElementPlusStyle: css }; }", css_text)
        page.add_script_tag(content="window.Vue = window.Vue || Vue;")
        page.add_script_tag(content=script_src)

        # 面板挂在 open shadow root 里，Playwright 的选择器会自动穿透
        try:
            page.locator(".main-page").first.wait_for(timeout=15000)
        except Exception:  # noqa: BLE001
            page.screenshot(path=str(Path(__file__).parent / "ui_smoke_fail.png"))
            failures.append("面板未渲染")
            print("[FAIL] 面板未渲染，已截图 ui_smoke_fail.png；页面错误:", page_errors[:5])
        else:
            print("[PASS] 面板已渲染")

            page.get_by_role("tab", name="答题").click()
            page.locator(".model-select").first.wait_for(timeout=15000)
            print("[PASS] 模型下拉框存在")

            # 等模型列表回填（onMounted 异步拉取）
            deadline = time.time() + 15
            texts: list[str] = []
            while time.time() < deadline:
                page.locator(".model-select").first.click()
                time.sleep(0.4)
                texts = page.locator(".el-select-dropdown__item").all_inner_texts()
                if any("gpt-4o-mini" in t for t in texts):
                    break
            # 显示名与 id 不同时拼成「名称 · id」，相同时只显示 id
            expected = ["服务端默认（gemini-3.8-flash-high）", "Gemini 3.8 Flash High · gemini-3.8-flash-high",
                        "GPT-4o mini · gpt-4o-mini", "claude-sonnet-5-5"]
            ok = all(any(exp in t for t in texts) for exp in expected)
            print(f"[{'PASS' if ok else 'FAIL'}] 下拉选项来自上游 -> {texts}")
            print("     API:", api_log[-1] if api_log else "(无)")
            if not ok:
                failures.append("下拉选项")

            # 下拉浮层上有一层透明遮罩，普通 click 会被判定为被遮挡；用 JS 直接触发点击
            page.locator(".el-select-dropdown__item", has_text="gpt-4o-mini").first.evaluate("el => el.click()")
            time.sleep(0.6)
            saved = page.evaluate("JSON.parse(localStorage.getItem('gm::config') || '{}').queryApis?.[0]?.model")
            ok = saved == "gpt-4o-mini"
            print(f"[{'PASS' if ok else 'FAIL'}] 选中模型已持久化 -> queryApis[0].model={saved!r}")
            if not ok:
                failures.append("模型持久化")

            # ---- 端点/上游可编辑，且改动能存活（不再被 migrateConfig 覆盖）----------------
            endpoint = page.locator(".endpoint-input input").first
            if not endpoint.count():
                failures.append("端点输入框缺失")
                print("[FAIL] 端点输入框缺失")
            else:
                print("[PASS] 端点输入框存在")
                typed = "https://my-proxy.example.com"
                endpoint.fill(typed)
                endpoint.blur()
                time.sleep(0.6)
                saved_url = page.evaluate("JSON.parse(localStorage.getItem('gm::config') || '{}').queryApis?.[0]?.endpoint")
                ok = saved_url == typed
                print(f"[{'PASS' if ok else 'FAIL'}] 自定义端点已持久化 -> queryApis[0].endpoint={saved_url!r}")
                if not ok:
                    failures.append("端点持久化")

                # 刷新页面后端点必须还是自己填的（曾经被 migrateConfig 强制改回内置值）
                page.reload(wait_until="load")
                for name, global_name in [("vue.global.prod.js", "Vue"), ("index.iife.js", "VueDemi"),
                                          ("index.full.min.js", "ElementPlus"), ("pinia.iife.min.js", "Pinia"),
                                          ("rxjs.umd.min.js", "rxjs"), ("md5.min.js", "md5")]:
                    page.add_script_tag(content=(deps / name).read_text(encoding="utf-8", errors="replace"))
                    page.wait_for_function(f"typeof {global_name} !== 'undefined'", timeout=15000)
                page.add_style_tag(content=css_text)
                page.evaluate("(css) => { window.__RES__ = { ElementPlus: css, ElementPlusStyle: css }; }", css_text)
                page.add_script_tag(content="window.Vue = window.Vue || Vue;")
                page.add_script_tag(content=script_src)
                page.locator(".main-page").first.wait_for(timeout=15000)
                page.get_by_role("tab", name="答题").click()
                page.locator(".endpoint-input input").first.wait_for(timeout=15000)
                survived = page.locator(".endpoint-input input").first.input_value()
                ok = survived == typed
                print(f"[{'PASS' if ok else 'FAIL'}] 刷新后端点仍是自定义值 -> {survived!r}")
                if not ok:
                    failures.append("端点被覆盖")
                # 复位，后面的直连用例仍指向本地假上游
                page.locator(".endpoint-input input").first.fill(BASE)
                page.locator(".endpoint-input input").first.blur()
                time.sleep(0.4)
                page.locator(".model-refresh").first.click()
                # 端点指回可用地址并刷新后，之前选中的模型应重新被列表认出来（不再标「不在当前列表」）
                refilled = False
                for _ in range(80):
                    page.locator(".model-select").first.click()
                    time.sleep(0.3)
                    items = page.locator(".el-select-dropdown__item").all_inner_texts()
                    page.keyboard.press("Escape")
                    if any("GPT-4o mini · gpt-4o-mini" in t for t in items):
                        refilled = True
                        break
                print(f"[{'PASS' if refilled else 'FAIL'}] 端点复位后刷新可重新认出已选模型 -> {items}")
                if not refilled:
                    failures.append("模型列表复位")
                page.screenshot(path=str(Path(__file__).parent / "ui_smoke_proxy.png"))
                # 刷新期间 loadModels 会早退，等它空闲再切模式，否则直连列表不会重拉
                page.locator(".model-refresh").first.click()
                for _ in range(60):
                    if "is-loading" not in (page.locator(".model-refresh").first.get_attribute("class") or ""):
                        break
                    time.sleep(0.25)

            # ---- 地址换成直连形态（以 /v1 结尾）：链路自动切到直连，模型列表换源 -----------
            # 面板不再提供「模式」单选：端点的形态就是链路。
            if page.locator(".mode-group").count():
                failures.append("模式单选应当已删除")
                print("[FAIL] 模式单选仍然存在")
            else:
                print("[PASS] 面板已无「模式」单选")
            endpoint = page.locator(".endpoint-input input").first
            endpoint.fill(f"{BASE}/v1")
            endpoint.blur()
            time.sleep(1.2)
            mode = page.evaluate("JSON.parse(localStorage.getItem('gm::config') || '{}').queryApis?.[0]?.mode")
            ok = mode == "direct"
            print(f"[{'PASS' if ok else 'FAIL'}] 端点填 /v1 后自动判定直连 -> queryApis[0].mode={mode!r}")
            if not ok:
                failures.append("链路自动判定")

            # 直连态下模型列表应走上游 /v1/models
            deadline = time.time() + 15
            texts = []
            while time.time() < deadline:
                page.locator(".model-select").first.click()
                time.sleep(0.4)
                texts = page.locator(".el-select-dropdown__item").all_inner_texts()
                if any("gpt-4o-mini" in t for t in texts):
                    break
            direct_expected = ["未选择模型（直连必须选）", "gpt-4o-mini", "Gemini 3.8 Flash High · gemini-3.8-flash-high"]
            ok = all(any(exp in t for t in texts) for exp in direct_expected)
            print(f"[{'PASS' if ok else 'FAIL'}] 直连链路模型列表来自上游 -> {texts}")
            print("     API:", api_log[-1] if api_log else "(无)")
            if not ok:
                failures.append("直连模型列表")
            page.keyboard.press("Escape")

            # ---- 双路/单路按钮：tooltip 关闭 teleport 后必须留在面板内，不能再飘到 body ----
            page.locator(".direct-check-toggle").first.hover()
            time.sleep(2.5)
            # 浮层若被 teleport 到 body，就会落在 shadow root 之外、拿不到 Element Plus 样式，
            # 表现成面板右侧一个没有样式的灰框（原来的显示 bug）。
            stray = page.evaluate(
                "() => document.body.querySelectorAll(':scope > [class*=\"el-popper\"], :scope > .el-select__popper')"
                ".length")
            ok = stray == 0
            print(f"[{'PASS' if ok else 'FAIL'}] 悬浮/下拉不再在 body 上挂浮层 -> {stray} 个")
            if not ok:
                failures.append("tooltip 飘出面板")
            toggle = page.locator(".direct-check-toggle").first
            label = toggle.inner_text().strip()
            tipped = page.evaluate(
                """() => {
                  // 面板在 shadow root 里，普通 querySelectorAll 穿不进去；递归走一遍所有 shadow root。
                  const walk = (root, out) => {
                    for (const el of root.querySelectorAll('*')) {
                      if (/el-popper/.test(String(el.className || ''))) out.push((el.textContent || '').trim());
                      if (el.shadowRoot) walk(el.shadowRoot, out);
                    }
                    return out;
                  };
                  return walk(document, []).filter(Boolean);
                }""")
            ok = label in ("双路", "单路") and any("少一层复核" in t for t in tipped)
            print(f"[{'PASS' if ok else 'FAIL'}] 双路/单路按钮的提示在面板内显示 -> {label!r}, 浮层={tipped}")
            if not ok:
                failures.append("双路按钮提示")

            # ---- 音频处理切换（大模型直听 vs STT 转文字）+ 小问号提示 + DIY STT 配置 ----------------
            if page.locator(".stt-panel").count():
                failures.append("默认直听模式下不应展示 STT 配置")
                print("[FAIL] 默认模式下 .stt-panel 已渲染")
            else:
                print("[PASS] 默认大模型直听模式下不展开 STT 配置")

            page.locator(".audio-help-icon").first.hover()
            time.sleep(0.8)
            stray_audio = page.evaluate(
                "() => document.body.querySelectorAll(':scope > [class*=\"el-popper\"], :scope > .el-select__popper').length"
            )
            audio_tips = page.evaluate(
                """() => {
                  const walk = (root, out) => {
                    for (const el of root.querySelectorAll('*')) {
                      if (/el-popper/.test(String(el.className || ''))) out.push((el.textContent || '').trim());
                      if (el.shadowRoot) walk(el.shadowRoot, out);
                    }
                    return out;
                  };
                  return walk(document, []).filter(Boolean);
                }"""
            )
            ok = stray_audio == 0 and any("大模型直听" in t and "STT 转文字" in t for t in audio_tips)
            print(f"[{'PASS' if ok else 'FAIL'}] 音频处理小问号悬浮说明在面板内显示 -> stray={stray_audio}, tips={len(audio_tips)}")
            if not ok:
                failures.append("音频小问号提示")

            # 切到「STT 转文字」，验证配置持久化并展开 DIY STT 面板
            page.locator(".audio-mode-group").get_by_text("STT 转文字").click()
            time.sleep(0.5)
            audio_mode_saved = page.evaluate("JSON.parse(localStorage.getItem('gm::config') || '{}').queryApis?.[0]?.audioMode")
            stt_panel_visible = page.locator(".stt-panel").count() > 0
            ok = audio_mode_saved == "stt" and stt_panel_visible
            print(f"[{'PASS' if ok else 'FAIL'}] 切换 STT 转文字并展开 DIY 面板 -> audioMode={audio_mode_saved!r}, visible={stt_panel_visible}")
            if not ok:
                failures.append("STT 模式切换")

            # 悬浮 STT DIY 小问号
            page.locator(".stt-help-icon").first.hover()
            time.sleep(0.8)
            stt_tips = page.evaluate(
                """() => {
                  const walk = (root, out) => {
                    for (const el of root.querySelectorAll('*')) {
                      if (/el-popper/.test(String(el.className || ''))) out.push((el.textContent || '').trim());
                      if (el.shadowRoot) walk(el.shadowRoot, out);
                    }
                    return out;
                  };
                  return walk(document, []).filter(Boolean);
                }"""
            )
            ok = any("/audio/transcriptions" in t and "/v1/listen" in t and "api.siliconflow.cn" in t for t in stt_tips)
            print(f"[{'PASS' if ok else 'FAIL'}] STT DIY 小问号说明含支持协议与端点示例 -> hit={ok}")
            if not ok:
                failures.append("STT 小问号提示")

            # 实时协议识别徽标：wss:// 报错提醒 -> Deepgram REST -> OpenAI 兼容
            stt_ep = page.locator(".stt-endpoint-input input").first
            stt_ep.fill("wss://api.deepgram.com/v2/listen?model=flux-general-en")
            time.sleep(0.2)
            badge_wss = page.locator(".stt-protocol-badge").first.inner_text().strip()
            stt_ep.fill("https://api.deepgram.com/v1/listen")
            time.sleep(0.2)
            badge_dg = page.locator(".stt-protocol-badge").first.inner_text().strip()
            badge_ok = ("不支持 ws/wss" in badge_wss) and ("Deepgram REST" in badge_dg)
            print(f"[{'PASS' if badge_ok else 'FAIL'}] STT 协议徽标实时反馈 -> wss={badge_wss!r}, dg={badge_dg!r}")
            if not badge_ok:
                failures.append("STT 协议徽标")

            # 填写 DIY STT 端点与密钥，刷新拉取 STT 模型并选择
            stt_ep.fill(f"{BASE}/stt/v1")
            stt_ep.blur()
            badge_oai = page.locator(".stt-protocol-badge").first.inner_text().strip()
            print(f"[{'PASS' if 'OpenAI' in badge_oai else 'FAIL'}] OpenAI 兼容端点识别徽标 -> {badge_oai!r}")
            if "OpenAI" not in badge_oai:
                failures.append("STT OpenAI 徽标")
            stt_tk = page.locator(".stt-token-input input").first
            stt_tk.fill("sk-stt-diy")
            stt_tk.blur()
            time.sleep(0.4)
            page.locator(".stt-model-refresh").first.click()
            stt_loaded = False
            stt_items: list[str] = []
            for _ in range(40):
                page.locator(".stt-model-select").first.click()
                time.sleep(0.3)
                stt_items = page.locator(".stt-panel .el-select-dropdown__item").all_inner_texts()
                if any("FunAudioLLM/SenseVoiceSmall" in t for t in stt_items):
                    stt_loaded = True
                    break
            print(f"[{'PASS' if stt_loaded else 'FAIL'}] DIY STT 模型列表拉取 -> {stt_items}")
            if not stt_loaded:
                failures.append("STT 模型列表拉取")
            else:
                page.locator(".stt-panel .el-select-dropdown__item", has_text="FunAudioLLM/SenseVoiceSmall").first.evaluate("el => el.click()")
                time.sleep(0.5)
                saved_stt = page.evaluate(
                    "(() => { const a = JSON.parse(localStorage.getItem('gm::config') || '{}').queryApis?.[0] || {}; "
                    "return { audioMode: a.audioMode, sttEndpoint: a.sttEndpoint, sttToken: a.sttToken, sttModel: a.sttModel }; })()"
                )
                ok = (
                    saved_stt.get("audioMode") == "stt"
                    and saved_stt.get("sttEndpoint") == f"{BASE}/stt/v1"
                    and saved_stt.get("sttToken") == "sk-stt-diy"
                    and saved_stt.get("sttModel") == "FunAudioLLM/SenseVoiceSmall"
                )
                print(f"[{'PASS' if ok else 'FAIL'}] DIY STT 配置全部持久化 -> {saved_stt}")
                if not ok:
                    failures.append("STT 配置持久化")

            # ---- 思考强度行：选中 flash 模型显示 flash 自动: high，切换持久化且小问号留在面板内 ----
            page.locator(".model-select").first.click()
            time.sleep(0.3)
            page.locator(".el-select-dropdown__item", has_text="gemini-3.8-flash-high").first.evaluate("el => el.click()")
            time.sleep(0.3)
            flash_badge = page.locator(".reasoning-effort-badge").first.inner_text().strip()
            page.locator(".reasoning-help-icon").first.hover()
            time.sleep(0.6)
            stray_r = page.evaluate(
                "() => document.body.querySelectorAll(':scope > [class*=\"el-popper\"], :scope > .el-select__popper').length"
            )
            page.locator(".reasoning-effort-group").get_by_text("medium").click()
            time.sleep(0.3)
            eff_saved = page.evaluate("JSON.parse(localStorage.getItem('gm::config') || '{}').queryApis?.[0]?.reasoningEffort")
            eff_ok = ("flash 自动: high" in flash_badge) and (stray_r == 0) and (eff_saved == "medium")
            print(f"[{'PASS' if eff_ok else 'FAIL'}] 思考强度面板联动与持久化 -> badge={flash_badge!r}, stray={stray_r}, saved={eff_saved!r}")
            if not eff_ok:
                failures.append("思考强度UI")

            page.screenshot(path=str(Path(__file__).parent / "ui_smoke_ok.png"))
        browser.close()

    srv.should_exit = True
    thread.join(timeout=5)
    print()
    print("UI 冒烟全部通过 [OK]" if not failures else f"UI 冒烟失败项：{failures}")
    raise SystemExit(1 if failures else 0)


main()
