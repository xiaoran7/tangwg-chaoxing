"""契约自测：用假上游跑真服务器，断言响应满足脚本 parseExactResponse 的 5 字段校验。

不联网。跑法：python contract_test.py
"""

from __future__ import annotations

import asyncio
import base64
import json
import os
import tempfile
import time

os.environ.setdefault("CPA_API_KEY", "test-key")
os.environ["CACHE_PATH"] = os.path.join(tempfile.mkdtemp(), "t.db")

import httpx  # noqa: E402

import server  # noqa: E402
import upstream  # noqa: E402

# ---- 脚本 parseExactResponse 的判定，原样复刻 ----
REQUIRED_TOP = ("success", "data", "error", "meta")


def parse_exact_response(payload):
    if (
        not isinstance(payload, dict)
        or not isinstance(payload.get("success"), bool)
        or not all(k in payload for k in REQUIRED_TOP)
    ):
        return {"success": False, "error": {"message": "接口响应格式不正确"}}
    return payload


def get_answer_values(response, stem):
    """脚本 getAnswerValues 的等价实现：歧义即失败。"""
    if not response.get("success") or not response.get("data") or not isinstance(response["data"].get("items"), list):
        return None
    items = response["data"]["items"]
    matches = items if len(items) == 1 else [i for i in items if i.get("stem") == stem]
    if len(matches) != 1:
        return None
    answer = matches[0].get("answer")
    if not answer or not isinstance(answer.get("values"), list) or not answer["values"]:
        return None
    if answer.get("kind") in ("none", "missing"):
        return None
    return answer["values"]


# ---- 假上游：按题目返回不同形态，模拟真实 LLM 的各种毛病 ----
UPSTREAM_REPLIES = {
    "clean": '{"values": ["经济基础与上层建筑的矛盾"]}',
    "fenced": '```json\n{"values": ["乙"]}\n```',
    "sloppy": '答案是：B、乙。',                       # 带前缀、字母和句号，应被吸附回「乙」
    "paraphrase": '{"values": ["经济基础和上层建筑之间的矛盾"]}',  # 改写，相似度够高应吸附
    "hallucinate": '{"values": ["资本主义社会的根本矛盾"]}',      # 不在选项里，应判失败
    "abstain": '{"values": []}',                                  # 放弃作答
    "judge_true": '{"values": ["对"]}',
    "multi": '{"values": ["甲", "乙"]}',
    "letter_dot": '{"values": ["B."]}',
    "letter_chinese_dot": '{"values": ["B、"]}',
    "letter_prefix": '{"values": ["选项B"]}',
    "garbage": 'I cannot answer this question.',
}

CURRENT = {"reply": "clean"}
CALLS = {"n": 0}


async def fake_upstream(request: httpx.Request) -> httpx.Response:
    CALLS["n"] += 1
    return httpx.Response(200, json={"choices": [{"message": {"content": CURRENT["reply"]}}]})


def client_for(reply: str):
    CURRENT["reply"] = reply
    # httpx MockTransport 直接顶替真实网络，其余逻辑（重试/解析/吸附/缓存）原样跑
    transport = httpx.MockTransport(fake_upstream)
    return httpx.AsyncClient(transport=transport, timeout=5.0)


async def main() -> None:
    cases = [
        # (说明, 发给服务的题, 上游回复, 期望是否成功, 期望答案)
        ("标准 JSON", {"stem": "【单选题】资本主义社会的基本矛盾是（  ）",
                  "options": ["生产力与生产关系的矛盾", "经济基础与上层建筑的矛盾"], "type": "0"},
         "clean", True, ["经济基础与上层建筑的矛盾"]),
        ("```json 包裹", {"stem": "【单选题】A?", "options": ["甲", "乙"], "type": "0"},
         "fenced", True, None),
        ("带前缀和标点", {"stem": "【单选题】B?", "options": ["甲", "乙"], "type": "0"},
         "sloppy", True, ["乙"]),
        ("改写措辞(相似度≥85)", {"stem": "【单选题】C?", "options": ["经济基础和上层建筑之间的矛盾", "别的"], "type": "0"},
         "paraphrase", True, ["经济基础和上层建筑之间的矛盾"]),
        ("幻觉(不在选项)", {"stem": "【单选题】D?", "options": ["甲", "乙"], "type": "0"},
         "hallucinate", False, None),
        ("模型放弃", {"stem": "【单选题】E?", "options": ["甲", "乙"], "type": "0"},
         "abstain", False, None),
        ("判断题收敛", {"stem": "判断：地球是圆的", "options": ["对", "错"], "type": "3"},
         "judge_true", True, ["对"]),
        ("多选题", {"stem": "【多选题】马克思主义的基本原理包括", "options": ["甲", "乙"], "type": "1"},
         "multi", True, None),
        ("单字母带英文点", {"stem": "【单选题】G?", "options": ["甲", "乙"], "type": "0"},
         "letter_dot", True, ["乙"]),
        ("单字母带顿号", {"stem": "【单选题】H?", "options": ["甲", "乙"], "type": "0"},
         "letter_chinese_dot", True, ["乙"]),
        ("单字母带选项前缀", {"stem": "【单选题】I?", "options": ["甲", "乙"], "type": "0"},
         "letter_prefix", True, ["乙"]),
        ("非 JSON 输出", {"stem": "【单选题】F?", "options": ["甲", "乙"], "type": "0"},
         "garbage", False, None),
    ]

    failures = []
    for label, req, reply_key, want_ok, want_values in cases:
        reply = UPSTREAM_REPLIES[reply_key]
        transport = httpx.MockTransport(fake_upstream)
        CURRENT["reply"] = reply
        async with httpx.AsyncClient(transport=transport, timeout=5.0) as http:
            server.app.state.client = http
            resp = await server.search(server.SearchRequest(**req), None)
            payload = json.loads(resp.model_dump_json())     # 真实序列化，验证 null 字段在不在

        parsed = parse_exact_response(payload)              # 脚本的第一道闸
        values = get_answer_values(parsed, req["stem"])      # 脚本的第二道闸

        ok_envelope = "success" in parsed and "error" not in (parsed.get("error") or {})
        got_ok = values is not None
        detail = "值不符" if got_ok != want_ok else "OK"
        if got_ok and want_values and values != want_values:
            detail = f"答案不符 -> {values}"
        if got_ok != want_ok:
            failures.append(label)
        flag = "PASS" if detail == "OK" else "FAIL"
        print(f"[{flag}] {label:<22} 成功={got_ok!s:<5} 值={values!s:<40} {detail if detail!='OK' else ''}")

    # 缓存：同一题再问一次，应命中且不重复打上游
    before = CALLS["n"]
    req = {"stem": "缓存题", "options": ["甲", "乙"], "type": "0"}
    CURRENT["reply"] = '{"values": ["甲"]}'
    transport = httpx.MockTransport(fake_upstream)
    async with httpx.AsyncClient(transport=transport, timeout=5.0) as http:
        server.app.state.client = http
        await server.search(server.SearchRequest(**req), None)
        await server.search(server.SearchRequest(**req), None)
    after = CALLS["n"]
    expected_calls = 2 if server.DOUBLE_CHECK else 1
    print(f"[{'PASS' if after - before == expected_calls else 'FAIL'}] 缓存生效            两次相同请求 -> 上游调用 {after - before} 次（应为 {expected_calls}）")
    if after - before != expected_calls:
        failures.append("缓存")

    # 双AI分歧仲裁测试：两次调用返回不同选项，仲裁器裁决
    seq_replies = ['{"values": ["甲"]}', '{"values": ["乙"]}', '{"values": ["乙"]}']
    seq_idx = 0

    async def seq_fake_upstream(request: httpx.Request) -> httpx.Response:
        nonlocal seq_idx
        rep = seq_replies[seq_idx % len(seq_replies)]
        seq_idx += 1
        return httpx.Response(200, json={"choices": [{"message": {"content": rep}}]})

    transport_seq = httpx.MockTransport(seq_fake_upstream)
    async with httpx.AsyncClient(transport=transport_seq, timeout=5.0) as http:
        server.app.state.client = http
        resp = await server.search(server.SearchRequest(stem="仲裁测试题", options=["甲", "乙"], type="0"), None)
        parsed = parse_exact_response(json.loads(resp.model_dump_json()))
        ans = get_answer_values(parsed, "仲裁测试题")
        arb_ok = (ans == ["乙"])
        print(f"[{'PASS' if arb_ok else 'FAIL'}] 双AI分歧仲裁表决    两次不一致(甲 vs 乙) -> 仲裁裁决为乙 -> {ans}")
        if not arb_ok:
            failures.append("双AI分歧仲裁表决")

    # 严格模式测试：关闭仲裁时，两次不一致应直接判定失败
    server.DOUBLE_CHECK_ARBITRATE = False
    seq_idx = 0
    async with httpx.AsyncClient(transport=transport_seq, timeout=5.0) as http:
        server.app.state.client = http
        resp = await server.search(server.SearchRequest(stem="严格复核分歧题", options=["甲", "乙"], type="0"), None)
        parsed = parse_exact_response(json.loads(resp.model_dump_json()))
        ans = get_answer_values(parsed, "严格复核分歧题")
        strict_ok = (ans is None and not parsed.get("success"))
        print(f"[{'PASS' if strict_ok else 'FAIL'}] 严格模式复核拦截  两次不一致且无仲裁 -> 安全拦截放弃作答 -> 成功={parsed.get('success')}")
        if not strict_ok:
            failures.append("严格模式复核拦截")
    server.DOUBLE_CHECK_ARBITRATE = True

    # 听力音频透传测试：验证携带音频时，上游 payload 正确组装 input_audio 结构
    received_audio_content = []

    async def audio_inspect_upstream(request: httpx.Request) -> httpx.Response:
        body = json.loads(request.content)
        content = body["messages"][1]["content"]
        received_audio_content.append(content)
        return httpx.Response(200, json={"choices": [{"message": {"content": '{"values": ["In a bookstore"]}'}}]})

    transport_audio = httpx.MockTransport(audio_inspect_upstream)
    audio_req = server.SearchRequest(
        stem="1. Where does this conversation take place?",
        options=["In a library", "In a bookstore", "In a restaurant"],
        type="0",
        audio=server.AudioData(data="AAAAAud10FakeBase64", format="mp3"),
    )
    async with httpx.AsyncClient(transport=transport_audio, timeout=5.0) as http:
        server.app.state.client = http
        resp = await server.search(audio_req, None)
        parsed = parse_exact_response(json.loads(resp.model_dump_json()))
        ans = get_answer_values(parsed, audio_req.stem)

    has_audio_block = False
    if received_audio_content and isinstance(received_audio_content[0], list):
        for block in received_audio_content[0]:
            if block.get("type") == "input_audio":
                audio_meta = block.get("input_audio", {})
                if audio_meta.get("data") == "AAAAAud10FakeBase64" and audio_meta.get("format") == "mp3":
                    has_audio_block = True
    audio_ok = (ans == ["In a bookstore"] and has_audio_block)
    print(f"[{'PASS' if audio_ok else 'FAIL'}] 听力题目音频透传  正确组装 input_audio 格式并由模型作答 -> {ans}")
    if not audio_ok:
        failures.append("听力题目音频透传")

    # SSE 流式解析 + reasoning_content 隔离 + reasoning_effort 透传测试
    seen_efforts: list[str | None] = []

    class SseChunkStream(httpx.AsyncByteStream):
        def __init__(self, chunks: list[bytes]) -> None:
            self._chunks = chunks

        async def __aiter__(self):
            for ch in self._chunks:
                yield ch

    async def sse_upstream(request: httpx.Request) -> httpx.Response:
        body = json.loads(request.content)
        seen_efforts.append(body.get("reasoning_effort"))
        temp = body.get("temperature")
        if temp == 0.0:
            chunks = [
                b": keep-alive\n\n",
                b'data: {"choices":[{"delta":{"reasoning_content":"\xe6\x80\x9d\xe8\x80\x83\xe4\xb8\xad..."}}]}\n\n',
                b'data: {"choices":[{"delta":{"content":"{\\"values\\":["}}]}\n\n',
                b'data: {"choices":[{"delta":{"content":"\\"\\u7532\\"]}"}}]}\n\n',
                b"data: [DONE]\n\n",
            ]
        elif temp == 0.3:
            chunks = [
                b": keep-alive\n\n",
                b'data: {"choices":[{"delta":{"content":"{\\"values\\":[\\"\\u4e59\\"]}"}}]}\n\n',
                b"data: [DONE]\n\n",
            ]
        else:
            chunks = [
                b'data: {"choices":[{"delta":{"content":"{\\"values\\":[\\"\\u4e59\\"]}"}}]}\n\n',
                b"data: [DONE]\n\n",
            ]
        return httpx.Response(200, headers={"content-type": "text/event-stream"}, stream=SseChunkStream(chunks))

    async with httpx.AsyncClient(transport=httpx.MockTransport(sse_upstream), timeout=5.0) as http:
        server.app.state.client = http
        resp = await server.search(server.SearchRequest(stem="SSE思考强度测试", options=["甲", "乙"], type="0"), None)
        parsed = parse_exact_response(json.loads(resp.model_dump_json()))
        ans = get_answer_values(parsed, "SSE思考强度测试")
    sse_ok = (ans == ["乙"] and seen_efforts == ["low", "low", "medium"])
    print(f"[{'PASS' if sse_ok else 'FAIL'}] SSE流式与思考强度   delta与reasoning隔离 + efforts={seen_efforts} -> {ans}")
    if not sse_ok:
        failures.append("SSE流式与思考强度")

    # 关闭 reasoning_effort 时不应下发该字段
    orig_effort = upstream.CPA_REASONING_EFFORT
    seen_omitted: list[bool] = []

    async def omit_effort_upstream(request: httpx.Request) -> httpx.Response:
        body = json.loads(request.content)
        seen_omitted.append("reasoning_effort" not in body)
        return httpx.Response(200, json={"choices": [{"message": {"content": '{"values": ["甲"]}'}}]})

    try:
        upstream.CPA_REASONING_EFFORT = ""
        async with httpx.AsyncClient(transport=httpx.MockTransport(omit_effort_upstream), timeout=5.0) as http:
            server.app.state.client = http
            await server.search(server.SearchRequest(stem="省略思考强度测试", options=["甲", "乙"], type="0"), None)
    finally:
        upstream.CPA_REASONING_EFFORT = orig_effort
    omit_ok = bool(seen_omitted) and all(seen_omitted)
    print(f"[{'PASS' if omit_ok else 'FAIL'}] 空思考强度省略      CPA_REASONING_EFFORT='' 时不带该字段 -> {seen_omitted}")
    if not omit_ok:
        failures.append("空思考强度省略")

    # 保活帧间隙硬墙钟超时测试：keepalive 每 0.4s 一帧，预算 0.55s 必须在第 2 帧(0.8s)到达前立刻掐断
    class HangingKeepAliveStream(httpx.AsyncByteStream):
        async def __aiter__(self):
            yield b": keep-alive\n\n"
            await asyncio.sleep(0.4)
            yield b": keep-alive\n\n"
            await asyncio.sleep(0.4)
            yield b'data: {"choices":[{"delta":{"content":"{\\"values\\":[\\"\\u7532\\"]}"}}]}\n\n'
            yield b"data: [DONE]\n\n"

    async def hang_sse_upstream(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, headers={"content-type": "text/event-stream"}, stream=HangingKeepAliveStream())

    t0 = time.monotonic()
    timed_out_cleanly = False
    async with httpx.AsyncClient(transport=httpx.MockTransport(hang_sse_upstream), timeout=5.0) as http:
        try:
            await upstream.call_cpa(http, "test", "k", timeout=0.55, deadline=t0 + 0.55)
        except upstream.UpstreamTimeout:
            timed_out_cleanly = True
    elapsed_hang = time.monotonic() - t0
    hang_ok = timed_out_cleanly and (0.45 <= elapsed_hang < 0.72)
    print(f"[{'PASS' if hang_ok else 'FAIL'}] 保活间隙硬墙钟超时  keepalive=0.4s 预算=0.55s 实测={elapsed_hang:.2f}s (未漂移到0.8s)")
    if not hang_ok:
        failures.append("保活间隙硬墙钟超时")

    # 双路慢路协同宽限 + 兜底回退测试
    orig_cfg = (
        upstream.CPA_TIMEOUT,
        upstream.CPA_TOTAL_BUDGET,
        upstream.CPA_PAIR_GRACE,
        upstream.CPA_MIN_ARBITRATE_BUDGET,
    )
    try:
        upstream.CPA_TIMEOUT = 0.65
        upstream.CPA_TOTAL_BUDGET = 0.65
        upstream.CPA_PAIR_GRACE = 0.15
        upstream.CPA_MIN_ARBITRATE_BUDGET = 0.10

        # 4a: 路1秒出，路2卡死被宽限掐断，路3仲裁快返回
        async def straggler_recover_upstream(request: httpx.Request) -> httpx.Response:
            temp = json.loads(request.content).get("temperature")
            if temp == 0.3:
                await asyncio.sleep(5.0)
            return httpx.Response(200, json={"choices": [{"message": {"content": '{"values": ["甲"]}'}}]})

        t_a = time.monotonic()
        async with httpx.AsyncClient(transport=httpx.MockTransport(straggler_recover_upstream), timeout=5.0) as http:
            server.app.state.client = http
            resp = await server.search(server.SearchRequest(stem="慢路宽限仲裁题", options=["甲", "乙"], type="0"), None)
            parsed = parse_exact_response(json.loads(resp.model_dump_json()))
            ans_a = get_answer_values(parsed, "慢路宽限仲裁题")
        elapsed_a = time.monotonic() - t_a
        straggler_a_ok = (ans_a == ["甲"] and elapsed_a < 0.45 and (parsed.get("meta") or {}).get("check_status") == "arbitrated")
        print(f"[{'PASS' if straggler_a_ok else 'FAIL'}] 慢路宽限转仲裁      路2卡5s -> 0.15s掐断转路3 实测={elapsed_a:.2f}s -> {ans_a}")
        if not straggler_a_ok:
            failures.append("慢路宽限转仲裁")

        # 4b: 路1秒出，路2与路3双卡死，预算到点优雅回退路1且不超时
        async def straggler_fallback_upstream(request: httpx.Request) -> httpx.Response:
            temp = json.loads(request.content).get("temperature")
            if temp in (0.3, 0.1):
                await asyncio.sleep(5.0)
            return httpx.Response(200, json={"choices": [{"message": {"content": '{"values": ["乙"]}'}}]})

        t_b = time.monotonic()
        async with httpx.AsyncClient(transport=httpx.MockTransport(straggler_fallback_upstream), timeout=5.0) as http:
            server.app.state.client = http
            resp = await server.search(server.SearchRequest(stem="慢路回退保底题", options=["甲", "乙"], type="0"), None)
            parsed = parse_exact_response(json.loads(resp.model_dump_json()))
            ans_b = get_answer_values(parsed, "慢路回退保底题")
        elapsed_b = time.monotonic() - t_b
        straggler_b_ok = (ans_b == ["乙"] and elapsed_b < 0.85 and (parsed.get("meta") or {}).get("check_status") == "fallback")
        print(f"[{'PASS' if straggler_b_ok else 'FAIL'}] 慢路双卡死保底回退  路2+路3全卡死 -> 0.65s保底回退路1 实测={elapsed_b:.2f}s -> {ans_b}")
        if not straggler_b_ok:
            failures.append("慢路双卡死保底回退")

        # 4c: 路1快速返回垃圾(无效答案)，不应误杀仍在正常思考的路2
        upstream.CPA_TIMEOUT = 1.2
        upstream.CPA_TOTAL_BUDGET = 1.2
        upstream.CPA_PAIR_GRACE = 0.10

        async def fast_invalid_slow_valid_upstream(request: httpx.Request) -> httpx.Response:
            temp = json.loads(request.content).get("temperature")
            if temp == 0.0:
                return httpx.Response(200, json={"choices": [{"message": {"content": "I cannot answer"}}]})
            if temp == 0.3:
                await asyncio.sleep(0.28)
            return httpx.Response(200, json={"choices": [{"message": {"content": '{"values": ["甲"]}'}}]})

        async with httpx.AsyncClient(transport=httpx.MockTransport(fast_invalid_slow_valid_upstream), timeout=5.0) as http:
            server.app.state.client = http
            resp = await server.search(server.SearchRequest(stem="首路无效不误杀题", options=["甲", "乙"], type="0"), None)
            parsed = parse_exact_response(json.loads(resp.model_dump_json()))
            ans_c = get_answer_values(parsed, "首路无效不误杀题")
        no_false_cut_ok = (ans_c == ["甲"])
        print(f"[{'PASS' if no_false_cut_ok else 'FAIL'}] 首路无效不误杀副路  路1废话不触发0.1s宽限，正常等路2(0.28s) -> {ans_c}")
        if not no_false_cut_ok:
            failures.append("首路无效不误杀副路")
    finally:
        (
            upstream.CPA_TIMEOUT,
            upstream.CPA_TOTAL_BUDGET,
            upstream.CPA_PAIR_GRACE,
            upstream.CPA_MIN_ARBITRATE_BUDGET,
        ) = orig_cfg

    # ---- 模型选择：上游列表拉取、按请求指定模型、缓存按模型隔离、白名单 ----
    seen_models: list[str] = []

    async def model_echo_upstream(request: httpx.Request) -> httpx.Response:
        if request.method == "GET" and request.url.path.endswith("/models"):
            return httpx.Response(200, json={
                "data": [
                    {"id": "models/gemini-3.8-flash-high", "name": "Gemini 3.8 Flash (High)"},
                    {"id": "gpt-4o-mini"},
                    {"id": "gpt-4o-mini"},                       # 重复项应被去重
                    "claude-sonnet-5-5",                          # 裸字符串形态
                ]
            })
        body = json.loads(request.content)
        if isinstance(body.get("messages"), list):
            seen_models.append(body.get("model"))
        return httpx.Response(200, json={"choices": [{"message": {"content": '{"values": ["甲"]}'}}]})

    upstream.reset_model_cache()
    async with httpx.AsyncClient(transport=httpx.MockTransport(model_echo_upstream), timeout=5.0) as http:
        server.app.state.client = http
        models_resp = await server.list_models(refresh=True, api_key="k")
    model_ids = [m.id for m in models_resp.models]
    models_ok = (
        models_resp.success
        and model_ids == ["gemini-3.8-flash-high", "gpt-4o-mini", "claude-sonnet-5-5"]
        and models_resp.default == upstream.CPA_MODEL
    )
    print(f"[{'PASS' if models_ok else 'FAIL'}] 上游模型列表拉取    带 models/ 前缀与重复项已归一 -> {model_ids}")
    if not models_ok:
        failures.append("上游模型列表拉取")

    # 请求里指定模型后，实际打到上游的 model 字段必须是它
    seen_models.clear()
    async with httpx.AsyncClient(transport=httpx.MockTransport(model_echo_upstream), timeout=5.0) as http:
        server.app.state.client = http
        resp = await server.search(
            server.SearchRequest(stem="指定模型题", options=["甲", "乙"], type="0", model="gpt-4o-mini"), None
        )
        parsed = parse_exact_response(json.loads(resp.model_dump_json()))
        ans = get_answer_values(parsed, "指定模型题")
    pick_ok = (ans == ["甲"] and seen_models and set(seen_models) == {"gpt-4o-mini"})
    print(f"[{'PASS' if pick_ok else 'FAIL'}] 按请求指定模型      model=gpt-4o-mini -> 上游收到 {seen_models} -> {ans}")
    if not pick_ok:
        failures.append("按请求指定模型")

    # 同一道题换模型必须重新作答，不能命中另一模型的缓存
    seen_models.clear()
    async with httpx.AsyncClient(transport=httpx.MockTransport(model_echo_upstream), timeout=5.0) as http:
        server.app.state.client = http
        await server.search(
            server.SearchRequest(stem="跨模型缓存题", options=["甲", "乙"], type="0", model="gpt-4o-mini"), None
        )
        first_calls = len(seen_models)
        await server.search(
            server.SearchRequest(stem="跨模型缓存题", options=["甲", "乙"], type="0", model="claude-sonnet-5-5"), None
        )
        second_calls = len(seen_models) - first_calls
        await server.search(
            server.SearchRequest(stem="跨模型缓存题", options=["甲", "乙"], type="0", model="gpt-4o-mini"), None
        )
        repeat_calls = len(seen_models) - first_calls - second_calls
    per_model = 2 if server.DOUBLE_CHECK else 1
    cache_iso_ok = first_calls == per_model and second_calls == per_model and repeat_calls == 0
    print(f"[{'PASS' if cache_iso_ok else 'FAIL'}] 跨模型缓存隔离      gpt={first_calls} claude={second_calls} gpt重复={repeat_calls}（每次应为 {per_model}/0）")
    if not cache_iso_ok:
        failures.append("跨模型缓存隔离")

    # 白名单外的模型直接拒绝，不打上游
    orig_allow = list(upstream.MODEL_ALLOWLIST)
    seen_models.clear()
    try:
        upstream.MODEL_ALLOWLIST = ["gpt-4o-mini"]
        async with httpx.AsyncClient(transport=httpx.MockTransport(model_echo_upstream), timeout=5.0) as http:
            server.app.state.client = http
            resp = await server.search(
                server.SearchRequest(stem="白名单题", options=["甲", "乙"], type="0", model="gpt-5"), None
            )
            parsed = parse_exact_response(json.loads(resp.model_dump_json()))
        deny_ok = (not parsed.get("success") and "所选模型不可用" in ((parsed.get("error") or {}).get("message") or "")
                   and not seen_models)
    finally:
        upstream.MODEL_ALLOWLIST = orig_allow
    print(f"[{'PASS' if deny_ok else 'FAIL'}] 模型白名单拦截      gpt-5 不在允许列表 -> 拒绝且未打上游")
    if not deny_ok:
        failures.append("模型白名单拦截")

    # 上游不支持 reasoning_effort：摘掉该字段自动重试一次，而不是整题失败
    effort_reject_calls: list[bool] = []

    async def effort_reject_upstream(request: httpx.Request) -> httpx.Response:
        body = json.loads(request.content)
        has_effort = "reasoning_effort" in body
        effort_reject_calls.append(has_effort)
        if has_effort:
            return httpx.Response(400, json={"error": {"message": "unsupported parameter: reasoning_effort"}})
        return httpx.Response(200, json={"choices": [{"message": {"content": '{"values": ["甲"]}'}}]})

    orig_double = server.DOUBLE_CHECK
    try:
        server.DOUBLE_CHECK = False                           # 单路，便于按顺序断言“拒绝 -> 摘字段 -> 成功”
        async with httpx.AsyncClient(transport=httpx.MockTransport(effort_reject_upstream), timeout=5.0) as http:
            server.app.state.client = http
            resp = await server.search(
                server.SearchRequest(stem="非思考模型题", options=["甲", "乙"], type="0", model="plain-chat"), None
            )
            parsed = parse_exact_response(json.loads(resp.model_dump_json()))
            ans = get_answer_values(parsed, "非思考模型题")
    finally:
        server.DOUBLE_CHECK = orig_double
    degrade_ok = (ans == ["甲"] and effort_reject_calls == [True, False])
    print(f"[{'PASS' if degrade_ok else 'FAIL'}] 思考强度自动降级     上游拒绝 reasoning_effort -> 摘字段重试 -> {effort_reject_calls} -> {ans}")
    if not degrade_ok:
        failures.append("思考强度自动降级")

    # 白名单要同时约束「列表里能看到什么」：面板不能列出选了就会被拒的模型
    orig_allow2 = list(upstream.MODEL_ALLOWLIST)
    try:
        upstream.MODEL_ALLOWLIST = ["gpt-4o-mini"]
        upstream.reset_model_cache()
        async with httpx.AsyncClient(transport=httpx.MockTransport(model_echo_upstream), timeout=5.0) as http:
            filtered = await upstream.fetch_models(http, "k", refresh=True)
        filtered_ids = [m["id"] for m in filtered]
        defaults = upstream.resolve_model(None)
        filter_ok = filtered_ids == ["gpt-4o-mini"] and defaults == "gpt-4o-mini"
        print(f"[{'PASS' if filter_ok else 'FAIL'}] 白名单过滤模型列表  -> {filtered_ids}，默认={defaults}")
        if not filter_ok:
            failures.append("白名单过滤模型列表")
    finally:
        upstream.MODEL_ALLOWLIST = orig_allow2
        upstream.reset_model_cache()

    # 白名单不含 CPA_MODEL 时，默认模型必须自动落到白名单内的第一项，不能自我拒绝
    orig_allow3 = list(upstream.MODEL_ALLOWLIST)
    orig_cpa_model = upstream.CPA_MODEL
    try:
        upstream.MODEL_ALLOWLIST = ["claude-sonnet-5-5"]
        upstream.CPA_MODEL = "gpt-4o-mini"
        fallback_default = upstream.resolve_model(None)
        upstream.reset_model_cache()
        async with httpx.AsyncClient(transport=httpx.MockTransport(model_echo_upstream), timeout=5.0) as http:
            listed = await upstream.fetch_models(http, "k", refresh=True)
        listed_ids = [m["id"] for m in listed]
        listed_default = upstream.effective_default_model()
        # 白名单模式不再往列表里凭空补默认项：列出来的必须都是上游真有的
        fb_ok = (fallback_default == "claude-sonnet-5-5"
                 and listed_default == "claude-sonnet-5-5"
                 and listed_ids == ["claude-sonnet-5-5"])
        print(f"[{'PASS' if fb_ok else 'FAIL'}] 白名单与默认模型冲突  默认回落到白名单内 -> {fallback_default}/{listed_ids}")
        if not fb_ok:
            failures.append("白名单与默认模型冲突")
    finally:
        upstream.MODEL_ALLOWLIST = orig_allow3
        upstream.CPA_MODEL = orig_cpa_model
        upstream.reset_model_cache()

    # ---- STT 转文字与「大模型直听 vs STT」缓存隔离测试 ----
    stt_seen_urls: list[str] = []
    stt_llm_contents: list[object] = []

    async def stt_upstream(request: httpx.Request) -> httpx.Response:
        if request.url.path.endswith("/audio/transcriptions"):
            stt_seen_urls.append(str(request.url))
            return httpx.Response(200, json={"text": "The train leaves at 9:15 AM from platform three."})
        body = json.loads(request.content)
        content = body["messages"][1]["content"]
        stt_llm_contents.append(content)
        if isinstance(content, list):
            return httpx.Response(200, json={"choices": [{"message": {"content": '{"values": ["8:00 AM"]}'}}]})
        ans = "9:15 AM" if "9:15 AM" in str(content) else "8:00 AM"
        return httpx.Response(200, json={"choices": [{"message": {"content": json.dumps({"values": [ans]})}}]})

    fake_audio = server.AudioData(data=base64.b64encode(b"fake-stt-audio").decode("ascii"), format="mp3")
    # 1) 先以默认大模型直听跑一次，缓存「8:00 AM」
    async with httpx.AsyncClient(transport=httpx.MockTransport(stt_upstream), timeout=5.0) as http:
        server.app.state.client = http
        r_llm = await server.search(server.SearchRequest(
            stem="When does the train leave?",
            options=["8:00 AM", "9:15 AM"],
            type="0",
            audio=fake_audio,
            audio_mode="llm",
        ), None)
        ans_llm = get_answer_values(parse_exact_response(json.loads(r_llm.model_dump_json())), "When does the train leave?")

    # 2) 客户端传已转写文本 + audio_mode="stt"：不能命中 llm 缓存，且发给 LLM 为纯文本
    stt_llm_contents.clear()
    async with httpx.AsyncClient(transport=httpx.MockTransport(stt_upstream), timeout=5.0) as http:
        server.app.state.client = http
        r_client_stt = await server.search(server.SearchRequest(
            stem="When does the train leave?",
            options=["8:00 AM", "9:15 AM"],
            type="0",
            audio_mode="stt",
            audio_transcript="The train leaves at 9:15 AM.",
            audio_hash="h_train_1",
        ), None)
        ans_client_stt = get_answer_values(
            parse_exact_response(json.loads(r_client_stt.model_dump_json())),
            "When does the train leave?",
        )
    client_stt_ok = (
        ans_llm == ["8:00 AM"]
        and ans_client_stt == ["9:15 AM"]
        and stt_llm_contents
        and all(isinstance(c, str) and "9:15 AM" in c for c in stt_llm_contents)
    )
    print(f"[{'PASS' if client_stt_ok else 'FAIL'}] 客户端 STT 转写透传与缓存隔离 -> llm={ans_llm} stt={ans_client_stt}")
    if not client_stt_ok:
        failures.append("客户端STT转写与缓存隔离")

    # 3) 服务端 STT（audio_mode="stt" 且带原始 audio）：调 /audio/transcriptions + 缓存防重复转录
    orig_stt_cfg = (upstream.STT_BASE_URL, upstream.STT_API_KEY, upstream.STT_MODEL)
    try:
        upstream.STT_BASE_URL = ""
        upstream.STT_MODEL = ""
        async with httpx.AsyncClient(transport=httpx.MockTransport(stt_upstream), timeout=5.0) as http:
            server.app.state.client = http
            r_unconf = await server.search(server.SearchRequest(
                stem="未配STT服务端测试",
                options=["8:00 AM", "9:15 AM"],
                type="0",
                audio=fake_audio,
                audio_mode="stt",
            ), None)
        unconf_ok = (not r_unconf.success and "STT" in (r_unconf.error.message or ""))
        print(f"[{'PASS' if unconf_ok else 'FAIL'}] 未配 STT 明确提示失败 -> {r_unconf.error.message}")
        if not unconf_ok:
            failures.append("未配STT提示")

        upstream.STT_BASE_URL = "https://stt.example.com/v1"
        upstream.STT_API_KEY = "sk-stt"
        upstream.STT_MODEL = "whisper-large-v3-turbo"
        stt_seen_urls.clear()
        stt_llm_contents.clear()
        async with httpx.AsyncClient(transport=httpx.MockTransport(stt_upstream), timeout=5.0) as http:
            server.app.state.client = http
            r_srv_1 = await server.search(server.SearchRequest(
                stem="Platform test?",
                options=["Platform one", "9:15 AM"],
                type="0",
                audio=fake_audio,
                audio_mode="stt",
            ), None)
            r_srv_2 = await server.search(server.SearchRequest(
                stem="Second question same audio?",
                options=["8:00 AM", "9:15 AM"],
                type="0",
                audio=fake_audio,
                audio_mode="stt",
            ), None)
        ans_srv_2 = get_answer_values(
            parse_exact_response(json.loads(r_srv_2.model_dump_json())),
            "Second question same audio?",
        )
        srv_stt_ok = (
            r_srv_1.success
            and ans_srv_2 == ["9:15 AM"]
            and len(stt_seen_urls) == 1
            and stt_seen_urls[0] == "https://stt.example.com/v1/audio/transcriptions"
            and all(isinstance(c, str) for c in stt_llm_contents)
        )
        print(f"[{'PASS' if srv_stt_ok else 'FAIL'}] 服务端 STT 转写与缓存复用 -> stt_calls={len(stt_seen_urls)} ans={ans_srv_2}")
        if not srv_stt_ok:
            failures.append("服务端STT转写与缓存")

        # 4) 服务端 Deepgram REST 协议适配 + wss:// 拦截
        dg_seen: list[tuple[str, str, str]] = []

        async def dg_upstream(request: httpx.Request) -> httpx.Response:
            if "/v1/listen" in str(request.url):
                dg_seen.append((str(request.url), request.headers.get("authorization", ""), request.headers.get("content-type", "")))
                return httpx.Response(200, json={
                    "results": {"channels": [{"alternatives": [{"transcript": "The secret password is pineapple."}]}]}
                })
            body = json.loads(request.content)
            ans = "pineapple" if "pineapple" in str(body["messages"][1]["content"]) else "apple"
            return httpx.Response(200, json={"choices": [{"message": {"content": json.dumps({"values": [ans]})}}]})

        upstream.STT_BASE_URL = "https://api.deepgram.com/v1/listen"
        upstream.STT_API_KEY = "dg-token"
        upstream.STT_MODEL = "nova-3"
        dg_audio = server.AudioData(data=base64.b64encode(b"fake-dg-audio").decode("ascii"), format="mp3")
        async with httpx.AsyncClient(transport=httpx.MockTransport(dg_upstream), timeout=5.0) as http:
            server.app.state.client = http
            r_dg = await server.search(server.SearchRequest(
                stem="Password?",
                options=["apple", "pineapple"],
                type="0",
                audio=dg_audio,
                audio_mode="stt",
            ), None)
        ans_dg = get_answer_values(parse_exact_response(json.loads(r_dg.model_dump_json())), "Password?")
        dg_ok = (
            ans_dg == ["pineapple"]
            and len(dg_seen) == 1
            and "model=nova-3" in dg_seen[0][0]
            and dg_seen[0][1] == "Token dg-token"
            and dg_seen[0][2] == "audio/mpeg"
        )
        print(f"[{'PASS' if dg_ok else 'FAIL'}] 服务端 Deepgram REST 适配 -> {dg_seen} ans={ans_dg}")
        if not dg_ok:
            failures.append("服务端Deepgram适配")

        wss_rejected = False
        try:
            upstream.parse_stt_target("wss://api.deepgram.com/v2/listen?model=flux-general-en")
        except ValueError as exc:
            wss_rejected = "v1/listen" in str(exc)
        print(f"[{'PASS' if wss_rejected else 'FAIL'}] 服务端拒绝 ws/wss 并给出 Deepgram REST 提示 -> {wss_rejected}")
        if not wss_rejected:
            failures.append("服务端拒绝wss")
    finally:
        upstream.STT_BASE_URL, upstream.STT_API_KEY, upstream.STT_MODEL = orig_stt_cfg

    # 4) reasoning_effort="auto"：模型名含 flash 自动切 high，否则沿用默认 low
    efforts_auto: list[tuple[str, str | None]] = []

    async def effort_auto_upstream(request: httpx.Request) -> httpx.Response:
        if request.url.path.endswith("/models"):
            return httpx.Response(200, json={"data": [
                {"id": "MiniMax-M3.1-Flash"},
                {"id": "gpt-4o-mini"},
                {"id": "gemini-3.8-flash-high"},
            ]})
        body = json.loads(request.content)
        efforts_auto.append((body.get("model", ""), body.get("reasoning_effort")))
        ans = "乙" if body.get("reasoning_effort") == "high" else "甲"
        return httpx.Response(200, json={"choices": [{"message": {"content": json.dumps({"values": [ans]})}}]})

    upstream._model_cache = None
    async with httpx.AsyncClient(transport=httpx.MockTransport(effort_auto_upstream), timeout=5.0) as http:
        server.app.state.client = http
        r_fl = await server.search(server.SearchRequest(
            stem="Flash auto test?", options=["甲", "乙"], type="0",
            model="MiniMax-M3.1-Flash", reasoning_effort="auto",
        ), None)
        r_nf = await server.search(server.SearchRequest(
            stem="Non-flash auto test?", options=["甲", "乙"], type="0",
            model="gpt-4o-mini", reasoning_effort="auto",
        ), None)
    ans_fl = get_answer_values(parse_exact_response(json.loads(r_fl.model_dump_json())), "Flash auto test?")
    ans_nf = get_answer_values(parse_exact_response(json.loads(r_nf.model_dump_json())), "Non-flash auto test?")
    auto_eff_ok = (
        ans_fl == ["乙"]
        and ans_nf == ["甲"]
        and efforts_auto == [
            ("MiniMax-M3.1-Flash", "high"),
            ("MiniMax-M3.1-Flash", "high"),
            ("gpt-4o-mini", "low"),
            ("gpt-4o-mini", "low"),
        ]
    )
    print(f"[{'PASS' if auto_eff_ok else 'FAIL'}] auto 思考强度 flash→high -> {efforts_auto} fl={ans_fl} nf={ans_nf}")
    if not auto_eff_ok:
        failures.append("auto思考强度flash自动high")

    print()
    print("全部通过 [OK]" if not failures else f"失败项：{failures}")
    raise SystemExit(1 if failures else 0)


asyncio.run(main())
