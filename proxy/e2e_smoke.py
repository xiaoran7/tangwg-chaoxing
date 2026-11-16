"""端到端冒烟：真起 uvicorn，用真实 HTTP 验证模型列表与指定模型搜题。

不联网：CPA 用本地假上游（MockTransport 替换 app.state.client 只能在进程内生效，
所以这里直接用 httpx 打本机 uvicorn，再把 server.app.state.client 换成假上游）。
跑法：python e2e_smoke.py
"""

from __future__ import annotations

import json
import os
import tempfile
import threading
import time

os.environ.setdefault("CPA_API_KEY", "test-key")
os.environ["CACHE_PATH"] = os.path.join(tempfile.mkdtemp(), "e2e.db")

import httpx  # noqa: E402
import uvicorn  # noqa: E402

import server  # noqa: E402

PORT = 18099
BASE = f"http://127.0.0.1:{PORT}"
seen_models: list[str] = []


async def fake_upstream(request: httpx.Request) -> httpx.Response:
    if request.method == "GET" and request.url.path.endswith("/models"):
        return httpx.Response(200, json={"data": [
            {"id": "gemini-3.8-flash-high", "name": "Gemini 3.8 Flash High"},
            {"id": "gpt-4o-mini"},
        ]})
    body = json.loads(request.content)
    seen_models.append(body.get("model"))
    return httpx.Response(200, json={"choices": [{"message": {"content": '{"values": ["甲"]}'}}]})


def main() -> None:
    config = uvicorn.Config(server.app, host="127.0.0.1", port=PORT, log_level="warning")
    srv = uvicorn.Server(config)
    thread = threading.Thread(target=srv.run, daemon=True)
    thread.start()

    with httpx.Client(base_url=BASE, timeout=20.0) as client:
        for _ in range(100):
            try:
                if client.get("/health").status_code == 200:
                    break
            except httpx.HTTPError:
                time.sleep(0.1)
        else:
            raise SystemExit("uvicorn 未能在 10s 内启动")

        # 换掉 app 内部的上游 client（lifespan 已建好真实 client，这里替换成假的）
        server.app.state.client = httpx.AsyncClient(transport=httpx.MockTransport(fake_upstream), timeout=10.0)

        failures: list[str] = []

        resp = client.get("/api/open/v1/models", params={"refresh": "1"}, headers={"X-Consumer-Token": "k"})
        models = resp.json()
        ids = [m["id"] for m in models.get("models", [])]
        ok = resp.status_code == 200 and models.get("success") is True and ids == ["gemini-3.8-flash-high", "gpt-4o-mini"]
        print(f"[{'PASS' if ok else 'FAIL'}] GET /api/open/v1/models -> {resp.status_code} {ids} default={models.get('default')}")
        if not ok:
            failures.append("models endpoint")

        seen_models.clear()
        resp = client.post(
            "/api/open/v1/search/exact",
            headers={"X-Consumer-Token": "k"},
            json={"stem": "E2E 指定模型题", "options": ["甲", "乙"], "type": "0", "model": "gpt-4o-mini"},
        )
        payload = resp.json()
        values = payload.get("data", {}).get("items", [{}])[0].get("answer", {}).get("values")
        ok = resp.status_code == 200 and payload.get("success") is True and values == ["甲"] and set(seen_models) == {"gpt-4o-mini"}
        print(f"[{'PASS' if ok else 'FAIL'}] POST search model=gpt-4o-mini -> {resp.status_code} {values} upstream_models={seen_models}")
        if not ok:
            failures.append("search with model")

        seen_models.clear()
        resp = client.post(
            "/api/open/v1/search/exact",
            headers={"X-Consumer-Token": "k"},
            json={"stem": "E2E 默认模型题", "options": ["甲", "乙"], "type": "0"},
        )
        ok = resp.status_code == 200 and set(seen_models) == {server.upstream.CPA_MODEL}
        print(f"[{'PASS' if ok else 'FAIL'}] POST search 不带 model -> 上游用默认 {list(set(seen_models))}")
        if not ok:
            failures.append("search default model")

        resp = client.post(
            "/api/open/v1/search/exact",
            headers={"X-Consumer-Token": "k"},
            json={
                "stem": "E2E STT 听力题",
                "options": ["甲", "乙"],
                "type": "0",
                "audio_mode": "stt",
                "audio_transcript": "Speaker says the answer is 甲.",
                "audio_hash": "e2e_audio_1",
            },
        )
        payload = resp.json()
        values = payload.get("data", {}).get("items", [{}])[0].get("answer", {}).get("values")
        ok = resp.status_code == 200 and payload.get("success") is True and values == ["甲"]
        print(f"[{'PASS' if ok else 'FAIL'}] POST search audio_mode=stt -> {resp.status_code} {values}")
        if not ok:
            failures.append("search with stt")

    srv.should_exit = True
    thread.join(timeout=10)
    print()
    print("E2E 全部通过 [OK]" if not failures else f"E2E 失败项：{failures}")
    raise SystemExit(1 if failures else 0)


main()
