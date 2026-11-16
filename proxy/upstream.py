"""上游 CPA（OpenAI 兼容）调用层：提示词组装、流式读取、硬墙钟超时与双路协同调度。"""

from __future__ import annotations

import asyncio
import base64
import json
import logging
import os
import re
import time
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit
from collections.abc import Awaitable, Callable
from typing import Any

import httpx
from pydantic import BaseModel

# --------------------------------------------------------------------------- 上游配置

CPA_BASE_URL = os.getenv("CPA_BASE_URL", "https://你的CPA地址/v1").rstrip("/")
CPA_MODEL = os.getenv("CPA_MODEL", "gemini-3.8-flash-high")
CPA_TIMEOUT = float(os.getenv("CPA_TIMEOUT", "75"))             # 单次尝试墙钟预算(秒)
CPA_AUDIO_TIMEOUT = float(os.getenv("CPA_AUDIO_TIMEOUT", "160"))  # 听力单次尝试墙钟预算(秒)
CPA_RETRIES = int(os.getenv("CPA_RETRIES", "1"))                # 总尝试次数
# 流式开关：CPA 的 antigravity 非流式路径(operation=generate)实测比流式(operation=generate_stream)
# 慢约 34%，且尾延迟会长到几十秒；改流式后还能吃到 CPA 的 `: keep-alive` SSE 保活帧。
CPA_STREAM = os.getenv("CPA_STREAM", "true").lower() in ("true", "1", "yes")
# 单次 socket 读超时：必须大于 CPA 的 streaming.keepalive-seconds(15s)，否则保活帧来不及续命就被误杀。
CPA_READ_TIMEOUT = float(os.getenv("CPA_READ_TIMEOUT", "30"))
# 整个搜题请求的墙钟总预算：必须小于油猴脚本的客户端超时(普通 90s / 听力 180s)，
# 否则服务端还在跑、客户端先放弃，nginx 会记 499。默认留 15s/20s 余量给响应回程与网络抖动。
CPA_TOTAL_BUDGET = float(os.getenv("CPA_TOTAL_BUDGET", "75"))
CPA_AUDIO_TOTAL_BUDGET = float(os.getenv("CPA_AUDIO_TOTAL_BUDGET", "160"))
# 双路并行协同宽限：其中一路拿到有效答案后，最多再等另一路多少秒；超时即掐掉慢路，
# 避免被单路上游卡死拖满整场预算(90s 撞车 499)。
CPA_PAIR_GRACE = float(os.getenv("CPA_PAIR_GRACE", "20"))
CPA_AUDIO_PAIR_GRACE = float(os.getenv("CPA_AUDIO_PAIR_GRACE", "35"))
# 剩余预算低于该阈值时跳过第 3 路仲裁，直接回退已有单路答案。
CPA_MIN_ARBITRATE_BUDGET = float(os.getenv("CPA_MIN_ARBITRATE_BUDGET", "12"))
# 思考强度透传：普通双路默认 low（靠双路一致保准确率、砍掉慢账号长思考尾延迟）；
# 分歧时第 3 路仲裁默认 medium；不需要该字段的上游可在 .env 设为空字符串。
CPA_REASONING_EFFORT = os.getenv("CPA_REASONING_EFFORT", "low").strip()
CPA_ARBITRATE_REASONING_EFFORT = os.getenv("CPA_ARBITRATE_REASONING_EFFORT", "medium").strip()
# 上游 /models 列表缓存时长（秒）。面板每次打开会带 refresh=1 强制刷新，平时走缓存。
MODEL_LIST_TTL = float(os.getenv("MODEL_LIST_TTL", "300"))
# 可选服务端 STT（OpenAI /v1/audio/transcriptions 兼容，全部留空则不硬编码）：
# 当客户端选择「STT 转文字」且未在面板自填 STT 端点时使用。
STT_BASE_URL = os.getenv("STT_BASE_URL", "").strip().rstrip("/")
STT_API_KEY = os.getenv("STT_API_KEY", "").strip()
STT_MODEL = os.getenv("STT_MODEL", "").strip()
STT_TIMEOUT = float(os.getenv("STT_TIMEOUT", "60"))
DEFAULT_AUDIO_MODE = os.getenv("DEFAULT_AUDIO_MODE", "llm").strip().lower()
if DEFAULT_AUDIO_MODE not in ("llm", "stt"):
    DEFAULT_AUDIO_MODE = "llm"

AUDIO_MIME_TYPES = {
    "mp3": "audio/mpeg",
    "wav": "audio/wav",
    "ogg": "audio/ogg",
    "m4a": "audio/mp4",
    "aac": "audio/aac",
    "flac": "audio/flac",
    "webm": "audio/webm",
    "weba": "audio/webm",
}

log = logging.getLogger("proxy")


class AudioData(BaseModel):
    data: str = ""                         # Base64 编码的音频内容
    format: str = "mp3"                    # mp3, wav, ogg, m4a, aac 等


class UpstreamTimeout(RuntimeError):
    """上游在预算内没能吐出结果。"""


class UnsupportedParam(RuntimeError):
    """上游明确拒绝了 payload 里的某个可选参数（目前只用于 reasoning_effort 降级）。"""


# --------------------------------------------------------------------------- 模型选择
# 下游脚本可以按请求指定模型（面板下拉框从 /api/open/v1/models 拉取）。白名单为空时
# 放行任意模型名，由上游自己判 404/403；填了白名单则只认列表内的值，防止手改请求乱打上游。

MODEL_ALLOWLIST = [
    m.strip() for m in os.getenv("CPA_MODEL_ALLOWLIST", "").split(",") if m.strip()
]


def _configured_default() -> str:
    """请求不带 model 时实际会用的模型：优先 CPA_MODEL，被白名单排除时退白名单第一项。"""
    if MODEL_ALLOWLIST and CPA_MODEL.lower() not in {m.lower() for m in MODEL_ALLOWLIST}:
        return MODEL_ALLOWLIST[0]
    return CPA_MODEL


def resolve_model(requested: str | None) -> str:
    model = (requested or "").strip()
    if not model:
        return _configured_default()
    if MODEL_ALLOWLIST:
        for allowed in MODEL_ALLOWLIST:
            if allowed.lower() == model.lower():
                return allowed
        raise PermissionError(f"模型 {model} 不在允许列表内")
    return model


def effective_default_model() -> str:
    """面板「服务端默认」标签上要显示的模型名：与 resolve_model(None) 保持一致。"""
    return _configured_default()


def resolve_reasoning_effort(requested: str | None, model: str, *, role: str = "main") -> str:
    """解析最终下发给上游的 reasoning_effort：支持 ``auto``（模型名含 flash 自动设为 high）。"""
    has_flash = "flash" in (model or "").lower()
    env_default = (CPA_ARBITRATE_REASONING_EFFORT if role == "arbitrate" else CPA_REASONING_EFFORT).strip().lower()
    if requested is None:
        if env_default == "auto":
            return "high" if has_flash else ("medium" if role == "arbitrate" else "")
        return env_default
    mode = requested.strip().lower()
    if mode == "auto":
        if has_flash:
            return "high"
        if env_default == "auto":
            return "medium" if role == "arbitrate" else ""
        return env_default
    if mode in ("default", ""):
        return env_default if role == "arbitrate" else ""
    if mode in ("low", "medium", "high"):
        if role == "arbitrate":
            return "high" if mode == "high" else (env_default or "medium")
        return mode
    return env_default


_model_cache: tuple[float, list[dict[str, str]]] | None = None


def _parse_model_list(obj: Any) -> list[dict[str, str]]:
    """把上游 /models 的各种返回形态统一成 [{"id", "name"}]。"""
    raw = obj.get("data") if isinstance(obj, dict) else obj
    if isinstance(raw, dict):
        raw = raw.get("models")
    if not isinstance(raw, list):
        return []
    result: list[dict[str, str]] = []
    seen: set[str] = set()
    for item in raw:
        display = ""
        if isinstance(item, str):
            model_id = item.strip()
        elif isinstance(item, dict):
            model_id = str(item.get("id") or item.get("model") or item.get("name") or "").strip()
            display = str(
                item.get("display_name") or item.get("displayName") or item.get("name") or ""
            ).strip()
            if display == model_id:
                display = ""
        else:
            continue
        if model_id.startswith("models/"):                 # 少数网关带回 OpenAI SDK 的前缀
            model_id = model_id[len("models/"):]
        if not model_id or model_id in seen:
            continue
        seen.add(model_id)
        result.append({"id": model_id, "name": display or model_id})
    return result


async def fetch_models(client: httpx.AsyncClient, api_key: str, refresh: bool = False) -> list[dict[str, str]]:
    """从上游拉取可用模型列表，按 ``MODEL_LIST_TTL`` 缓存。

    CPA（OpenAI 兼容）的 ``GET /v1/models`` 返回 ``{"data": [{"id": "..."}]}``；返回形态不合预期
    时原样抛错，由调用方转成失败信封，不让脚本端假装有模型可选。
    """
    global _model_cache
    now = time.monotonic()
    if not refresh and _model_cache and now - _model_cache[0] < MODEL_LIST_TTL:
        return _model_cache[1]

    headers = {"Authorization": f"Bearer {api_key}"}
    resp = await client.get(f"{CPA_BASE_URL}/models", headers=headers, timeout=httpx.Timeout(15.0, connect=10.0))
    if resp.status_code in (401, 403):
        raise PermissionError("密钥无效或无权限拉取模型列表")
    resp.raise_for_status()
    try:
        models = _parse_model_list(resp.json())
    except ValueError as exc:
        raise RuntimeError(f"上游模型列表不是 JSON: {exc}") from exc
    # 白名单是「面板只能选这些」的约束，列表本身也必须按它过滤：
    # 否则面板会列出选了也会被 resolve_model 拒绝的模型。
    if MODEL_ALLOWLIST:
        allowed = {m.lower() for m in MODEL_ALLOWLIST}
        models = [m for m in models if m["id"].lower() in allowed]
        if not models:
            raise RuntimeError("白名单内的模型在上游不可用")
    if not models:
        raise RuntimeError("上游模型列表为空")
    # 未设白名单时，把默认模型补进列表（少数网关的 /models 不包含默认模型，但实际能调）。
    # 设了白名单就不再补：白名单本身已经限定了可选范围，凭空补一项会给出一个上游没有的选项。
    if not MODEL_ALLOWLIST:
        default_id = _configured_default()
        if default_id not in {m["id"] for m in models}:
            models.insert(0, {"id": default_id, "name": default_id})
    _model_cache = (now, models)
    return models


def reset_model_cache() -> None:
    global _model_cache
    _model_cache = None


# --------------------------------------------------------------------------- 提示词

SYSTEM_PROMPT = """你是一个专业的考试答题助手。请根据题干和上下文直接给出正确答案。

输出规则（极其重要）：
1. 必须输出纯 JSON 对象，绝对不要输出任何解析、前言、markdown代码块或额外文字。
2. 输出格式固定为：{"values": ["答案1", "答案2", ...]}
3. 选择题：values 里的项必须**严格原样复制**题目给出的选项文字，不要带前缀序号、不要改字。
4. 判断题：输出 {"values": ["正确"]} 或 {"values": ["错误"]}。
5. 填空题/阅读匹配/听力综合大题：
   - 包含多道小题、多个空位或表格数据时，请将每道小题的正确选项文本或最终答案依次放入 values 数组！
   - 若题目附带了听力音频，必须完全基于听力录音中陈述的具体事实、数据、人名与细节进行理解作答！
   - 必须按顺序拆成数组元素，绝不要把多道小题挤在一个字符串里。
   - 若题目提示了小题/空位数量（如共有 N 道小题），values 数组中的元素个数必须严格与小题数量一致，严禁少填、漏填或合并！
6. 绝不要放弃作答！严禁输出空数组 {"values": []}！即使上下文或段落不完整，也必须根据已知信息、语境逻辑和专业知识推断出每个空位/小题最可能的答案，并依次填入 values 数组！"""

TYPE_NAMES = {
    "0": "单选题",
    "1": "多选题",
    "2": "填空题",
    "3": "判断题",
    "4": "简答题",
    "6": "简答题",
    "8": "听力/阅读综合大题",
}


def _transcript_section(req: Any) -> str:
    transcript = (getattr(req, "audio_transcript", None) or "").strip()
    if not transcript:
        return ""
    return (
        "【听力音频转写原文（由 STT 语音识别生成，请务必以此为听力事实依据；"
        "注意识别文本可能存在个别同音词或标点误差，请结合语境判断）】：\n"
        f"{transcript}\n\n"
    )


def build_prompt(req: Any) -> str:
    options = [o.strip() for o in req.options if o and o.strip()]
    transcript_block = _transcript_section(req)
    has_raw_audio = bool(req.audio and req.audio.data)
    if not options:
        if req.type == "8" or has_raw_audio:
            audio_hint = (
                "【特别注意：本题附带听力音频，请务必以听力音频中陈述的事实细节为准作答！】\n"
                if has_raw_audio
                else ""
            )
            return (
                "题型：听力/阅读综合复合大题（内含多道选择小题，小题题干与各选项已列于题干文本中）。\n"
                f"{audio_hint}"
                "作答要求：\n"
                "1. 请仔细阅读题干中每一道小题及其选项内容，按小题顺序（第1题至最后一题）在 values 数组中输出各题正确选项的完整文字（或选项字母）。\n"
                "2. values 数组中的元素个数必须严格与小题总数一致，按顺序一一对应，严禁输出额外解析或合并项！\n\n"
                f"{transcript_block}"
                f"题干：\n{req.stem}"
            )
        tname = TYPE_NAMES.get(req.type, "填空题/综合大题")
        return (
            f"题型：{tname}（未给预设选项，请根据题干直接推断作答。若包含多个空位或段落匹配小题，"
            f"请依次在 values 数组中按顺序给出每个空的答案字母如 A-J 或内容）\n"
            f"{transcript_block}"
            f"题干：\n{req.stem}"
        )
    lines = "\n".join(f"{chr(65 + i)}. {opt}" for i, opt in enumerate(options))
    if req.type == "3":
        head = "题型：判断题"
    elif req.type == "1":
        head = "题型：多选题（可能有多个正确答案）"
    else:
        head = "题型：单选题"
    return f"{head}\n\n{transcript_block}题干：{req.stem}\n\n选项：\n{lines}"


def build_arbitrate_prompt(req: Any, options: list[str], discrepancy_report: str) -> str:
    opt_lines = (
        "\n".join(f"{chr(65 + i)}. {opt}" for i, opt in enumerate(options))
        if options
        else "（无预设选项）"
    )
    transcript_block = _transcript_section(req)
    return (
        f"题型：{TYPE_NAMES.get(req.type, '综合题')}\n\n"
        f"题干：\n{req.stem}\n\n"
        f"选项：\n{opt_lines}\n\n"
        f"{transcript_block}"
        f"【前两路答题助手复核核查情况】：\n"
        f"{discrepancy_report}\n\n"
        f"请作为资深命题与阅卷裁判（第 3 路独立终审裁判），深入仔细核实题目事实：\n"
        f"1. 针对【分歧小题/分歧选项】，深入核查材料/音频对话原话细节与转折逻辑（特别注意肯定/否定事实、转折词、时间及干扰项），辨析哪个是正确答案，哪个是干扰项；\n"
        f"2. 请在 analysis 字段中简要说明你的裁判依据与推导理由；\n"
        f"3. 在 values 数组中按题目顺序输出最终裁定的正解列表（共识小题保持共识，分歧小题裁定唯一正解）。\n\n"
        f"输出格式必须为纯 JSON：\n"
        f"{{\n"
        f'  "analysis": "针对分歧点的裁判依据与事实核验说明",\n'
        f'  "values": ["最终答案1", "最终答案2", ...]\n'
        f"}}"
    )


# --------------------------------------------------------------------------- STT 语音转文字


_DEEPGRAM_WS_ONLY_PARAMS = {"encoding", "sample_rate", "eot_threshold", "eot_timeout_ms"}


def parse_stt_target(base_url: str) -> tuple[str, str]:
    """解析 STT 端点，返回 ``(protocol, transcriptions_url)``。

    支持：
      * ``openai``：OpenAI 兼容 ``/v1/audio/transcriptions``（Bearer + multipart/form-data）
      * ``deepgram``：Deepgram REST ``/v1/listen``（Token + 原始音频二进制）
    """
    raw = (base_url or "").strip()
    if not raw:
        return "openai", ""
    if re.match(r"^wss?://", raw, re.I):
        raise ValueError(
            "暂不支持 ws/wss 实时流式端点（网课听力需整段文件识别）。"
            "若使用 Deepgram，请改填 https://api.deepgram.com/v1/listen 并选 nova-3"
        )
    parts = urlsplit(raw)
    clean_path = parts.path.rstrip("/")
    hostname = (parts.hostname or "").lower()
    is_deepgram = bool(re.search(r"/listen$", clean_path, re.I)) or hostname == "deepgram.com" or hostname.endswith(".deepgram.com")
    if is_deepgram:
        if re.search(r"/listen$", clean_path, re.I):
            listen_path = re.sub(r"/v2/listen$", "/v1/listen", clean_path, flags=re.I) if "deepgram.com" in hostname else clean_path
        elif re.search(r"/v\d+$", clean_path, re.I):
            base_ver = "/v1" if "deepgram.com" in hostname and clean_path.lower().endswith("/v2") else clean_path
            listen_path = f"{base_ver}/listen"
        else:
            listen_path = f"{clean_path}/v1/listen" if clean_path else "/v1/listen"
        kept_qs = [(k, v) for k, v in parse_qsl(parts.query, keep_blank_values=True) if k not in _DEEPGRAM_WS_ONLY_PARAMS]
        return "deepgram", urlunsplit((parts.scheme, parts.netloc, listen_path, urlencode(kept_qs), ""))

    if re.search(r"/audio/transcriptions$", clean_path, re.I):
        return "openai", urlunsplit((parts.scheme, parts.netloc, clean_path, parts.query, ""))
    if re.search(r"/v\d+$", clean_path, re.I):
        tx_path = f"{clean_path}/audio/transcriptions"
    else:
        tx_path = f"{clean_path}/v1/audio/transcriptions"
    return "openai", urlunsplit((parts.scheme, parts.netloc, tx_path, parts.query, ""))


def normalize_stt_transcriptions_url(base_url: str) -> str:
    _, url = parse_stt_target(base_url)
    return url


async def transcribe_audio(
    client: httpx.AsyncClient,
    audio: AudioData,
    *,
    base_url: str = "",
    api_key: str = "",
    model: str = "",
    timeout: float | None = None,
    deadline: float | None = None,
) -> str:
    """调用 OpenAI `/audio/transcriptions` 或 Deepgram `/v1/listen` 将听力音频转为纯文本。"""
    protocol, url = parse_stt_target(base_url or STT_BASE_URL)
    if not url:
        raise ValueError("未配置 STT_BASE_URL")
    mdl = (model or STT_MODEL).strip()
    if not mdl:
        raise ValueError("未配置 STT_MODEL")
    raw_b64 = (audio.data or "").strip()
    if raw_b64.startswith("data:") and "," in raw_b64:
        raw_b64 = raw_b64.split(",", 1)[1]
    raw_b64 = re.sub(r"\s+", "", raw_b64)
    if raw_b64 and len(raw_b64) % 4:
        raw_b64 += "=" * (4 - len(raw_b64) % 4)
    raw_bytes = base64.b64decode(raw_b64)
    if not raw_bytes:
        raise ValueError("音频内容为空")

    ext = (audio.format or "mp3").strip().lower().lstrip(".") or "mp3"
    mime = AUDIO_MIME_TYPES.get(ext, "application/octet-stream")
    headers: dict[str, str] = {}
    key = (api_key or STT_API_KEY).strip()

    budget = timeout or STT_TIMEOUT
    if deadline is not None:
        remaining = deadline - time.monotonic()
        if remaining <= 0.05:
            raise UpstreamTimeout("搜题总预算已耗尽，无法执行 STT")
        budget = min(budget, remaining)

    req_timeout = httpx.Timeout(budget, connect=10.0)
    try:
        if protocol == "deepgram":
            dg_parts = urlsplit(url)
            q_dict = dict(parse_qsl(dg_parts.query, keep_blank_values=True))
            q_dict["model"] = mdl
            q_dict.setdefault("smart_format", "true")
            if "language" not in q_dict and "detect_language" not in q_dict:
                q_dict["detect_language"] = "true"
            dg_url = urlunsplit((dg_parts.scheme, dg_parts.netloc, dg_parts.path, urlencode(q_dict), ""))
            headers["Content-Type"] = mime
            if key:
                headers["Authorization"] = f"Token {key}"
            coro = client.post(dg_url, headers=headers, content=raw_bytes, timeout=req_timeout)
        else:
            if key:
                headers["Authorization"] = f"Bearer {key}"
            coro = client.post(
                url,
                headers=headers,
                data={"model": mdl, "response_format": "json"},
                files={"file": (f"audio.{ext}", raw_bytes, mime)},
                timeout=req_timeout,
            )
        resp = await asyncio.wait_for(coro, timeout=budget)
    except (asyncio.TimeoutError, TimeoutError) as exc:
        raise UpstreamTimeout(f"STT 转写超过 {budget:.1f}s 预算") from exc

    if resp.status_code in (401, 403):
        raise PermissionError("STT 鉴权失败：密钥无效或无权限")
    if resp.status_code >= 400:
        raise RuntimeError(f"STT HTTP {resp.status_code}: {resp.text[:200]}")

    text = ""
    try:
        obj = resp.json()
        if isinstance(obj, dict):
            dg_tr = (
                ((obj.get("results") or {}).get("channels") or [{}])[0]
                .get("alternatives", [{}])[0]
                .get("transcript")
            )
            val = dg_tr or obj.get("text") or obj.get("transcript") or (obj.get("data") or {}).get("text")
            if isinstance(val, str):
                text = val.strip()
    except ValueError:
        text = resp.text.strip()
    if not text:
        raise RuntimeError("STT 返回空转写文本")
    return text


# --------------------------------------------------------------------------- 流式读取与单次请求


def _extract_message_text(content: Any) -> str:
    if isinstance(content, list):
        content = "".join(p.get("text", "") for p in content if isinstance(p, dict))
    return (content or "").strip()


async def _collect_stream_text(resp: httpx.Response, stop_at: float) -> str:
    """把 CPA 的 SSE 响应读成一段纯文本。

    SSE 帧分两类：
      * ``data: {"choices":[{"delta":{"content":"..."}}]}`` —— 内容增量
      * ``: keep-alive``                              —— CPA 在首 token 之前推的保活注释帧，忽略
    注：真正的硬墙钟截止由外层 ``asyncio.wait_for`` 保证，避免 ``aiter_lines()`` 在保活间隙阻塞超时。
    """
    chunks: list[str] = []
    raw_lines: list[str] = []
    saw_sse = False
    async for line in resp.aiter_lines():
        if time.monotonic() > stop_at:
            raise UpstreamTimeout("读取上游响应超过单次预算")
        text = line.strip()
        if not text:
            continue
        if text.startswith(":"):                      # keep-alive 注释帧
            saw_sse = True
            continue
        if not text.startswith("data:"):
            if not saw_sse:
                raw_lines.append(text)
            continue
        saw_sse = True
        data = text[len("data:"):].strip()
        if data == "[DONE]":
            break
        try:
            obj = json.loads(data)
        except json.JSONDecodeError:
            continue
        if obj.get("error"):
            raise RuntimeError(f"上游流式错误: {obj['error']}")
        for choice in obj.get("choices") or []:
            piece = (choice.get("delta") or {}).get("content")
            if not piece:
                piece = (choice.get("message") or {}).get("content")
            if isinstance(piece, list):               # 少数网关把内容包成数组
                piece = "".join(p.get("text", "") for p in piece if isinstance(p, dict))
            if piece:
                chunks.append(piece)
    if chunks:
        return "".join(chunks).strip()

    # 上游忽略了 stream=true，退回一次性 JSON 解析
    body = "\n".join(raw_lines).strip()
    if not saw_sse and body.startswith("{"):
        try:
            obj = json.loads(body)
        except json.JSONDecodeError:
            return ""
        if obj.get("error"):
            raise RuntimeError(f"上游返回错误: {obj['error']}")
        content = (obj.get("choices") or [{}])[0].get("message", {}).get("content")
        return _extract_message_text(content)
    return ""


async def _single_attempt(
    client: httpx.AsyncClient,
    payload: dict[str, Any],
    headers: dict[str, str],
    request_timeout: httpx.Timeout,
    stop_at: float,
    stream: bool,
) -> str:
    url = f"{CPA_BASE_URL}/chat/completions"
    if stream:
        async with client.stream("POST", url, json=payload, headers=headers, timeout=request_timeout) as resp:
            if resp.status_code in (401, 403):
                await resp.aread()
                raise PermissionError("密钥无效或无该模型权限")
            if resp.status_code >= 400:
                body = (await resp.aread()).decode("utf-8", "replace")
                _raise_for_param_rejection(body, payload)
                raise RuntimeError(f"上游 HTTP {resp.status_code}: {body[:200]}")
            return await _collect_stream_text(resp, stop_at)

    resp = await client.post(url, json=payload, headers=headers, timeout=request_timeout)
    if resp.status_code in (401, 403):
        raise PermissionError("密钥无效或无该模型权限")
    if resp.status_code >= 400:
        _raise_for_param_rejection(resp.text, payload)
    resp.raise_for_status()
    content = resp.json()["choices"][0]["message"]["content"]
    return _extract_message_text(content)


def _raise_for_param_rejection(body: str, payload: dict[str, Any]) -> None:
    """上游对 reasoning_effort 报“不支持该参数”时抛 UnsupportedParam，由 call_cpa 摘掉重试。"""
    if "reasoning_effort" not in payload:
        return
    lowered = body.lower()
    if any(k in lowered for k in ("reasoning_effort", "unsupported parameter", "unrecognized", "unknown parameter")) and \
            any(k in lowered for k in ("unsupported", "unrecognized", "not supported", "unknown", "invalid")):
        raise UnsupportedParam(body[:200])


async def call_cpa(
    client: httpx.AsyncClient,
    prompt: str,
    api_key: str,
    temperature: float = 0.0,
    audio: AudioData | None = None,
    timeout: float | None = None,
    deadline: float | None = None,
    reasoning_effort: str | None = None,
    model: str | None = None,
) -> str:
    """调 CPA 拿答案文本。

    ``deadline`` 是本次搜题剩余的墙钟预算（``time.monotonic()`` 绝对时刻）。
    每次尝试整段受 ``asyncio.wait_for`` 约束，确保在保活间隔内也能准时止损。
    ``model`` 为空时沿用 ``CPA_MODEL``；由 ``resolve_model`` 统一校验白名单。
    """
    if audio and audio.data:
        user_content: Any = [
            {
                "type": "text",
                "text": "【重要指令：本题包含听力音频材料！请务必仔细聆听音频中的全部对话、事实陈述、关键数字与时间，严格依据听力事实作答！】\n\n" + prompt,
            },
            {
                "type": "input_audio",
                "input_audio": {
                    "data": audio.data,
                    "format": audio.format or "mp3",
                },
            },
        ]
    else:
        user_content = prompt

    payload: dict[str, Any] = {
        "model": resolve_model(model),
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content},
        ],
        "temperature": temperature,
    }
    if CPA_STREAM:
        payload["stream"] = True

    effort = CPA_REASONING_EFFORT if reasoning_effort is None else reasoning_effort.strip()
    if effort:
        payload["reasoning_effort"] = effort

    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    call_timeout = timeout or (CPA_AUDIO_TIMEOUT if (audio and audio.data) else CPA_TIMEOUT)

    last_msg = ""
    last_exc: Exception | None = None
    effort_dropped = False
    normal_failures = 0
    while True:                                   # 摘参数的降级重试不占 CPA_RETRIES 预算
        budget = call_timeout
        if deadline is not None:
            remaining = deadline - time.monotonic()
            if remaining <= 0.05:
                raise UpstreamTimeout("搜题总预算已耗尽")
            budget = min(budget, remaining)
        # 读超时必须大于 CPA 的 keepalive 间隔(15s)，否则保活帧还没到就被判死；
        # 真正把墙钟卡死在 budget 上靠外层 asyncio.wait_for。
        request_timeout = httpx.Timeout(max(5.0, min(CPA_READ_TIMEOUT, budget)), connect=10.0)
        started = time.monotonic()
        try:
            try:
                text = await asyncio.wait_for(
                    _single_attempt(client, payload, headers, request_timeout, started + budget, CPA_STREAM),
                    timeout=budget,
                )
            except (asyncio.TimeoutError, TimeoutError) as exc:
                raise UpstreamTimeout(f"上游在 {budget:.1f}s 墙钟预算内未完成") from exc
            if not text:
                raise RuntimeError("上游返回空内容")
            return text
        except PermissionError:
            raise
        except UnsupportedParam as exc:
            # 选中的模型不吃 reasoning_effort（例如非思考模型）：摘掉该字段重试一次，
            # 属于配置不兼容而非上游故障，不能把整题拖成失败。
            if effort_dropped:
                raise
            effort_dropped = True
            payload.pop("reasoning_effort", None)
            log.warning("上游拒绝 reasoning_effort，已摘除该字段重试: %s", exc)
            continue
        except Exception as exc:                              # noqa: BLE001 - 上游错误形态太杂
            normal_failures += 1
            last_exc = exc
            last_msg = f"{type(exc).__name__}: {exc}"
            log.warning("上游调用失败 (%s/%s) %s", normal_failures, CPA_RETRIES, last_msg)
            # 只在"快速失败"时重试：慢失败(超时)重试只会把预算再烧一遍，且大概率同样慢
            fast_failure = not isinstance(exc, UpstreamTimeout) and (time.monotonic() - started) < budget * 0.5
            if normal_failures < CPA_RETRIES and fast_failure:
                await asyncio.sleep(0.6)
            else:
                break
    if isinstance(last_exc, UpstreamTimeout):
        raise last_exc
    raise RuntimeError(last_msg or "上游无响应")


# --------------------------------------------------------------------------- 双路协同调度


async def run_dual_calls(
    call1: Awaitable[str],
    call2: Awaitable[str],
    deadline: float,
    pair_grace: float | None = None,
    is_valid: Callable[[str], bool] | None = None,
) -> tuple[str | BaseException, str | BaseException]:
    """并行跑两路请求；若首路已拿到有效答案且启用宽限，只再等另一路 ``pair_grace`` 秒。"""
    tasks = [asyncio.ensure_future(call1), asyncio.ensure_future(call2)]
    overrides: dict[int, BaseException] = {}

    async def _cancel_and_mark(idx: int, reason: str) -> None:
        task = tasks[idx]
        if not task.done():
            task.cancel()
        await asyncio.gather(task, return_exceptions=True)
        overrides[idx] = UpstreamTimeout(reason)

    try:
        remaining = max(0.0, deadline - time.monotonic())
        done, pending = await asyncio.wait(tasks, timeout=remaining + 1.0, return_when=asyncio.FIRST_COMPLETED)

        if not done:
            for idx in (0, 1):
                await _cancel_and_mark(idx, "双路响应均超出总预算，已取消")
        elif len(done) == 1 and pending:
            first_task = next(iter(done))
            first_idx = 0 if first_task is tasks[0] else 1
            second_idx = 1 - first_idx
            first_exc = first_task.exception()

            if isinstance(first_exc, PermissionError):
                await _cancel_and_mark(second_idx, "鉴权失败，已取消副路")
            else:
                first_ok = first_exc is None and (is_valid is None or is_valid(first_task.result()))
                if first_ok and pair_grace is not None:
                    wait_cap = max(0.0, min(pair_grace, deadline - time.monotonic()))
                    timeout_msg = f"副路响应超过 {pair_grace:.0f}s 协同宽限，已取消"
                else:
                    wait_cap = max(0.0, deadline - time.monotonic() + 1.0)
                    timeout_msg = "副路响应超出总预算，已取消"

                if wait_cap > 0:
                    await asyncio.wait({tasks[second_idx]}, timeout=wait_cap)
                if not tasks[second_idx].done():
                    await _cancel_and_mark(second_idx, timeout_msg)

        results: list[str | BaseException] = []
        for idx, task in enumerate(tasks):
            if idx in overrides:
                results.append(overrides[idx])
            elif task.cancelled():
                results.append(UpstreamTimeout("上游调用被取消"))
            else:
                exc = task.exception()
                results.append(exc if exc is not None else task.result())
        return results[0], results[1]
    finally:
        for task in tasks:
            if not task.done():
                task.cancel()
        await asyncio.gather(*tasks, return_exceptions=True)


# --------------------------------------------------------------------------- 输出解析


def extract_values(text: str) -> list[str]:
    # 模型常在 JSON 前加一句「答案是：」，先剥掉再解析
    text = re.sub(r"^\s*(?:答案|正确答案|回答)\s*(?:是|为)?\s*[:：]?\s*", "", text.strip(), count=1)
    payload = None
    fenced = re.search(r"```(?:json)?\s*(.+?)```", text, re.S)
    if fenced:
        payload = fenced.group(1)
    else:
        braced = re.search(r"\{.*\}", text, re.S)
        if braced:
            payload = braced.group(0)
        else:
            # 无 JSON：整段按分隔符切成候选值，交给下游吸附
            parts = re.split(r"[、,，;；\n]+", text.strip())
            return [p.strip(" 　:：.") for p in parts if p.strip(" 　:：.")]
    try:
        obj = json.loads(payload)
    except json.JSONDecodeError:
        parts = re.split(r"[、,，;；\n]+", str(payload).strip())
        return [p.strip(" 　:：.") for p in parts if p.strip(" 　:：.")]
    if isinstance(obj, str):
        return [obj.strip()] if obj.strip() else []
    if isinstance(obj, list):
        return [str(v).strip() for v in obj if str(v).strip()]
    if isinstance(obj, dict):
        for key in ("values", "answer", "answers", "options", "choice"):
            val = obj.get(key)
            if isinstance(val, str) and val.strip():
                return [val.strip()]
            if isinstance(val, list):
                return [str(v).strip() for v in val if str(v).strip()]
    return []
