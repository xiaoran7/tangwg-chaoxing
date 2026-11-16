"""题库代理服务 —— 把「网课小助手」的搜题请求转发到自建题源（默认 CPA，OpenAI 兼容）。

下游契约（脚本强校验，5 个字段少一个都判「接口响应格式不正确」）::

    POST /api/open/v1/search/exact   {"stem": "...", "options": [...], "type": "0"}
    ->  {"success": true,
         "data":   {"items": [{"stem": "...", "answer": {"kind": "...", "values": ["..."]}}]},
         "error":  {"code": null, "message": null, "details": null},
         "meta":   {"credit_remaining": null, "billing_result": null}}

上游（CPA）::

    POST {CPA_BASE_URL}/v1/chat/completions
    Authorization: Bearer {CPA_API_KEY}

要点：
  * 客户端硬编码 timeout=90s（听力 180s），服务端总预算必须小于它，否则客户端先放弃 → nginx 记 499。
  * 上游一律走**流式**：CPA 的 antigravity 非流式路径比流式慢约 34%，且尾延迟会长到几十秒；
    流式还能吃到 CPA 的 `: keep-alive` SSE 保活帧（默认 15s 一个），慢的时候不会把连接静默掐死。
  * values 必须是选项**原文**——客户端用 Levenshtein>=85 匹配，模型改写一个字就掉到阈值下。
  * items 长度必须为 1；答案对不上任何选项时直接判失败，宁可漏答也不瞎填。
"""

from __future__ import annotations

import hashlib
import json
import logging
import os
import re
import sqlite3
import threading
import time
from contextlib import asynccontextmanager
from typing import Any

import httpx
from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

import upstream
from upstream import (
    SYSTEM_PROMPT,
    TYPE_NAMES,
    AudioData,
    UpstreamTimeout,
    _collect_stream_text,
    build_arbitrate_prompt,
    build_prompt,
    call_cpa,
    extract_values,
)

# --------------------------------------------------------------------------- 配置

CACHE_PATH = os.getenv("CACHE_PATH", "answers.db")
CACHE_TTL = float(os.getenv("CACHE_TTL", str(60 * 60 * 24 * 30)))  # 30 天
DEFAULT_API_KEY = os.getenv("CPA_API_KEY", "")
DOUBLE_CHECK = os.getenv("DOUBLE_CHECK", "true").lower() in ("true", "1", "yes")
DOUBLE_CHECK_ARBITRATE = os.getenv("DOUBLE_CHECK_ARBITRATE", "true").lower() in ("true", "1", "yes")

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("proxy")
log.setLevel(logging.INFO)

# --------------------------------------------------------------------------- 契约模型


class SearchRequest(BaseModel):
    stem: str = ""
    options: list[str] = Field(default_factory=list)
    type: str = "0"
    audio: AudioData | None = None
    audio_mode: str | None = None          # "llm" | "stt"；留空走服务端 DEFAULT_AUDIO_MODE
    audio_transcript: str | None = None    # 脚本侧已完成 STT 时直接传转写文本
    audio_hash: str | None = None          # 脚本侧算的音频指纹（用于缓存隔离）
    model: str | None = None               # 脚本面板所选模型；为空时用服务端 CPA_MODEL
    reasoning_effort: str | None = None    # "auto"（flash 自动 high）| "default" | "low" | "medium" | "high"


class Answer(BaseModel):
    kind: str = "choice"
    values: list[str]


class Item(BaseModel):
    stem: str
    answer: Answer


class Data(BaseModel):
    items: list[Item] = Field(default_factory=list)


class Err(BaseModel):
    code: str | None = None
    message: str | None = None
    details: Any = None


class Meta(BaseModel):
    credit_remaining: int | None = None
    billing_result: str | None = None
    check_status: str | None = None
    check_detail: str | None = None


class SearchResponse(BaseModel):
    """注意：四个字段必须全部出现在 JSON 里（可为 null），脚本用 `"x" in payload` 校验。"""

    success: bool
    data: Data | None = None
    error: Err | None = None
    meta: Meta | None = None


def ok(
    stem: str,
    values: list[str],
    kind: str = "choice",
    check_status: str = "consensus",
    detail: str = "",
) -> SearchResponse:
    return SearchResponse(
        success=True,
        data=Data(items=[Item(stem=stem, answer=Answer(kind=kind, values=values))]),
        error=Err(),
        meta=Meta(
            credit_remaining=None,
            billing_result=None,
            check_status=check_status,
            check_detail=detail,
        ),
    )


def fail(message: str, code: str = "CLIENT_ERROR") -> SearchResponse:
    return SearchResponse(success=False, data=None, error=Err(code=code, message=message), meta=Meta())


# --------------------------------------------------------------------------- 缓存

_local = threading.local()


def db() -> sqlite3.Connection:
    conn = getattr(_local, "conn", None)
    if conn is None:
        conn = sqlite3.connect(CACHE_PATH)
        conn.execute(
            "CREATE TABLE IF NOT EXISTS cache ("
            "  key TEXT PRIMARY KEY, kind TEXT, answer_values TEXT, created_at REAL NOT NULL)"
        )
        conn.execute(
            "CREATE TABLE IF NOT EXISTS stt_cache ("
            "  key TEXT PRIMARY KEY, transcript TEXT, created_at REAL NOT NULL)"
        )
        conn.commit()
        _local.conn = conn
    return conn


def resolve_audio_mode(req: SearchRequest) -> str:
    if req.audio_transcript and req.audio_transcript.strip():
        return "stt"
    mode = (req.audio_mode or "").strip().lower()
    if mode in ("llm", "stt"):
        return mode
    return upstream.DEFAULT_AUDIO_MODE


def _audio_digest(req: SearchRequest) -> str:
    if req.audio and req.audio.data:
        return hashlib.sha256(req.audio.data.encode("ascii", errors="ignore")).hexdigest()
    return (req.audio_hash or "").strip()


def cache_key(req: SearchRequest, model: str) -> str:
    # 模型、音频指纹与音频处理模式必须进 key：换模型或从直听切到 STT 时要重答。
    parts = [model, req.type, req.stem, *req.options]
    audio_digest = _audio_digest(req)
    if audio_digest:
        parts.append(audio_digest)
    mode = resolve_audio_mode(req)
    transcript = (req.audio_transcript or "").strip()
    if mode == "stt" or transcript:
        parts.append("mode:stt")
        if transcript:
            parts.append("tr:" + hashlib.sha256(transcript.encode("utf-8")).hexdigest())
        elif upstream.STT_MODEL:
            parts.append("stt:" + upstream.STT_MODEL)
    if req.reasoning_effort is not None:
        parts.append("eff:" + upstream.resolve_reasoning_effort(req.reasoning_effort, model, role="main"))
    raw = "\x00".join(parts)
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def stt_cache_key(audio_digest: str, stt_model: str) -> str:
    return hashlib.sha256(f"{stt_model}\x00{audio_digest}".encode("utf-8")).hexdigest()


def stt_cache_get(audio_digest: str, stt_model: str) -> str | None:
    if not audio_digest:
        return None
    key = stt_cache_key(audio_digest, stt_model)
    row = db().execute(
        "SELECT transcript, created_at FROM stt_cache WHERE key = ?", (key,)
    ).fetchone()
    if not row:
        return None
    transcript, created_at = row
    if time.time() - created_at > CACHE_TTL:
        db().execute("DELETE FROM stt_cache WHERE key = ?", (key,))
        db().commit()
        return None
    return transcript or None


def stt_cache_put(audio_digest: str, stt_model: str, transcript: str) -> None:
    if not audio_digest or not transcript:
        return
    key = stt_cache_key(audio_digest, stt_model)
    db().execute(
        "INSERT OR REPLACE INTO stt_cache (key, transcript, created_at) VALUES (?, ?, ?)",
        (key, transcript, time.time()),
    )
    db().commit()


def cache_get(key: str) -> tuple[str, list[str]] | None:
    row = db().execute(
        "SELECT kind, answer_values, created_at FROM cache WHERE key = ?", (key,)
    ).fetchone()
    if not row:
        return None
    kind, answer_values, created_at = row
    if time.time() - created_at > CACHE_TTL:
        db().execute("DELETE FROM cache WHERE key = ?", (key,))
        db().commit()
        return None
    return kind, json.loads(answer_values)


def cache_put(key: str, kind: str, values: list[str]) -> None:
    db().execute(
        "INSERT OR REPLACE INTO cache (key, kind, answer_values, created_at) VALUES (?, ?, ?, ?)",
        (key, kind, json.dumps(values, ensure_ascii=False), time.time()),
    )
    db().commit()


# --------------------------------------------------------------------------- 文本归一化 / 相似度
# 与脚本 BaseQuestionHandler.normalizeOptionMatchText 保持一致：去首字母标号、去标点、去空白。


def normalize(text: str) -> str:
    text = re.sub(r"^\s*[a-zA-Z]\s*[.．、：\]]\s*", "", str(text))
    text = re.sub(r"[\s 　]+", "", text)
    return re.sub(r"[,.，。、：；？！'\"“”‘’「」【】《》（）()\[\]{}<>]", "", text).lower()


def similarity(left: str, right: str) -> int:
    if not left or not right:
        return 0
    if left == right:
        return 100
    a, b = list(left), list(right)
    dist = list(range(len(a) + 1))
    for row, ch in enumerate(b):
        prev = dist[0]
        dist[0] = row + 1
        for col, other in enumerate(a):
            above = dist[col + 1]
            dist[col + 1] = prev if ch == other else min(prev, dist[col], above) + 1
            prev = above
    return round((1 - dist[len(a)] / max(len(a), len(b))) * 100)


def snap_to_options(value: str, options: list[str], threshold: int = 85) -> str | None:
    """把模型输出吸附回给定选项原文，防止幻觉/改写导致客户端匹配失败。"""
    raw_str = str(value).strip()
    if not raw_str:
        return None

    # 模型常回「B」「B.」「B、」「选项B」这类裸字母，优先按字母序号还原对应选项原文
    letter_match = re.fullmatch(r"(?:选项\s*)?([a-zA-Z])[.．、:：\]\s]*", raw_str)
    if letter_match:
        index = ord(letter_match.group(1).upper()) - 65
        if 0 <= index < len(options):
            return options[index]

    target = normalize(raw_str)
    if not target:
        return None
    normalized_options = [normalize(option) for option in options]
    if target in normalized_options:                        # 精确优先
        return options[normalized_options.index(target)]

    scored = [similarity(normalized, target) for normalized in normalized_options]
    best = max(scored, default=0)
    if best >= threshold:
        return options[scored.index(best)]
    return None


# --------------------------------------------------------------------------- 主流程


@asynccontextmanager
async def lifespan(app: FastAPI):
    client_timeout = max(upstream.CPA_TIMEOUT, upstream.CPA_AUDIO_TIMEOUT, upstream.CPA_READ_TIMEOUT) + 15.0
    app.state.client = httpx.AsyncClient(timeout=httpx.Timeout(client_timeout, connect=10.0))
    log.info(
        "题库代理已启动 | 上游=%s 模型=%s 流式=%s 思考=%s/%s 单次=%.1fs 总预算=%.1fs/%.1fs 宽限=%.1fs/%.1fs 读超时=%.1fs",
        upstream.CPA_BASE_URL, upstream.CPA_MODEL, upstream.CPA_STREAM,
        upstream.CPA_REASONING_EFFORT or "default", upstream.CPA_ARBITRATE_REASONING_EFFORT or "default",
        upstream.CPA_TIMEOUT * upstream.CPA_RETRIES,
        upstream.CPA_TOTAL_BUDGET, upstream.CPA_AUDIO_TOTAL_BUDGET,
        upstream.CPA_PAIR_GRACE, upstream.CPA_AUDIO_PAIR_GRACE,
        upstream.CPA_READ_TIMEOUT,
    )
    yield
    await app.state.client.aclose()


app = FastAPI(title="题库代理", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.options("/api/open/v1/search/exact")
async def options_search() -> dict:
    return {}


def resolve_api_key(x_consumer_token: str | None = Header(default=None)) -> str:
    token = (x_consumer_token or "").strip()
    if token:
        return token
    if DEFAULT_API_KEY:
        return DEFAULT_API_KEY
    raise HTTPException(status_code=401, detail="请在脚本面板填写密钥（CPA API Key）")


@app.get("/health")
async def health() -> dict:
    return {
        "ok": True,
        "model": upstream.CPA_MODEL,
        "upstream": upstream.CPA_BASE_URL,
        "audio_mode_default": upstream.DEFAULT_AUDIO_MODE,
        "stt_configured": bool(upstream.STT_BASE_URL and upstream.STT_MODEL),
    }


class ModelEntry(BaseModel):
    id: str
    name: str


class ModelsResponse(BaseModel):
    success: bool
    default: str
    models: list[ModelEntry] = Field(default_factory=list)
    error: Err | None = None


@app.get("/api/open/v1/models", response_model=ModelsResponse)
async def list_models(
    refresh: bool = False,
    api_key: str = Depends(resolve_api_key),
) -> ModelsResponse:
    """把上游 CPA 的可用模型列表透给脚本面板。

    面板打开/点刷新时带 ``refresh=1`` 强制回源，其余请求走 ``MODEL_LIST_TTL`` 缓存。
    """
    try:
        models = await upstream.fetch_models(app.state.client, api_key, refresh=refresh)
    except PermissionError as exc:
        log.error("模型列表鉴权失败: %s", exc)
        return ModelsResponse(
            success=False,
            default=upstream.resolve_model(None),
            error=Err(code="CLIENT_ERROR", message="题库鉴权失败，请在面板填写正确的密钥后重试"),
        )
    except Exception as exc:                                  # noqa: BLE001
        log.error("拉取模型列表失败: %s", exc)
        return ModelsResponse(
            success=False,
            default=upstream.resolve_model(None),
            error=Err(code="UPSTREAM_ERROR", message="暂时拉取不到上游模型列表，请稍后重试"),
        )
    return ModelsResponse(
        success=True,
        default=upstream.effective_default_model(),
        models=[ModelEntry(**m) for m in models],
    )


@app.get("/def/notice")
async def notice() -> dict:
    """公告通道。脚本要求 `code === 1` 且 `data` 为纯文本（会被 innerHTML 渲染）。

    原实现会带上 referer 和站内 UID 发往第三方；现在改成本域返回，脚本不会外传登录身份。
    """
    text = os.getenv("NOTICE_TEXT", "").strip()
    return {"code": 1 if text else 0, "data": text}


def process_answers(values: list[str], req: SearchRequest, options: list[str]) -> tuple[str, list[str]] | None:
    if not values:
        return None
    kind = "judge" if req.type == "3" else ("fill" if req.type in ("2", "4", "6", "8") else "choice")
    if req.type == "3":
        first_val = values[0] if values else ""
        is_true = any(k in first_val.lower() for k in ("正确", "对", "true", "t", "√", "yes", "right"))
        if options:
            for opt in options:
                if is_true and any(k in opt.lower() for k in ("对", "正确", "√", "true")):
                    return kind, [opt]
                elif not is_true and any(k in opt.lower() for k in ("错", "错误", "×", "false")):
                    return kind, [opt]
            return kind, ["正确" if is_true else "错误"]
        else:
            return kind, ["正确" if is_true else "错误"]
    elif options:
        snapped: list[str] = []
        for value in values:
            hit = snap_to_options(value, options)
            if hit is None:
                return None
            if hit not in snapped:
                snapped.append(hit)
        return (kind, snapped) if snapped else None
    else:
        cleaned = [v.strip() for v in values if v.strip()]
        return (kind, cleaned) if cleaned else None


def answers_match(ans1: tuple[str, list[str]] | None, ans2: tuple[str, list[str]] | None) -> bool:
    if not ans1 or not ans2:
        return False
    if ans1 == ans2:
        return True
    v1, v2 = ans1[1], ans2[1]
    if len(v1) != len(v2):
        return False
    for a, b in zip(v1, v2):
        if normalize(a) == normalize(b):
            continue
        try:
            if abs(float(a) - float(b)) < 1e-6:
                continue
        except ValueError:
            pass
        return False
    return True


def build_discrepancy_report(
    ans1: tuple[str, list[str]] | None,
    ans2: tuple[str, list[str]] | None,
) -> str:
    if not ans1 or not ans2:
        cand1 = str(ans1[1]) if ans1 else "作答未产生有效匹配选项/放弃"
        cand2 = str(ans2[1]) if ans2 else "作答未产生有效匹配选项/放弃"
        return f"- 助手 1 备选答案：{cand1}\n- 助手 2 备选答案：{cand2}"

    v1, v2 = ans1[1], ans2[1]
    if len(v1) == len(v2) and len(v1) > 1:
        agreed = []
        disputed = []
        for i, (a, b) in enumerate(zip(v1, v2)):
            if normalize(a) == normalize(b):
                agreed.append(f"第 {i+1} 小题：双方一致认同为「{a}」")
            else:
                disputed.append(f"第 {i+1} 小题分歧：助手 1 选择「{a}」，助手 2 选择「{b}」")
        report_lines = []
        if agreed:
            report_lines.append("【共识小题】（两路助手已完全一致）：\n" + "\n".join(f"- {line}" for line in agreed))
        if disputed:
            report_lines.append("【分歧小题】（重点核查裁决对象）：\n" + "\n".join(f"- {line}" for line in disputed))
        return "\n\n".join(report_lines)
    else:
        return f"- 助手 1 备选答案：{v1}\n- 助手 2 备选答案：{v2}"


@app.post("/api/open/v1/search/exact", response_model=SearchResponse)
async def search(req: SearchRequest, api_key: str = Depends(resolve_api_key)) -> SearchResponse:
    if not req.stem.strip() and not req.options:
        return fail("题目为空")

    try:
        model = upstream.resolve_model(req.model)
    except PermissionError as exc:
        log.warning("模型不在白名单: %s", exc)
        return fail(f"所选模型不可用：{exc}", code="CLIENT_ERROR")

    key = cache_key(req, model)
    cached = cache_get(key)
    if cached:
        kind, values = cached
        log.info("命中缓存 %s… -> %s", key[:8], values)
        return ok(req.stem, values, kind)

    options = [o for o in req.options if o and o.strip()]
    has_raw_audio = bool(req.audio and req.audio.data)
    audio_mode = resolve_audio_mode(req)
    transcript = (req.audio_transcript or "").strip()
    needs_server_stt = (audio_mode == "stt" and has_raw_audio and not transcript)
    # 整条链路的墙钟总预算：双路并行 + 第三路仲裁共享，必须小于客户端超时(90s/180s)
    total_budget = (
        upstream.CPA_AUDIO_TOTAL_BUDGET
        if (has_raw_audio and (audio_mode == "llm" or needs_server_stt))
        else upstream.CPA_TOTAL_BUDGET
    )
    deadline = time.monotonic() + total_budget

    if needs_server_stt:
        if not upstream.STT_BASE_URL or not upstream.STT_MODEL:
            return fail(
                "已选择 STT 转文字，但未配置 STT 服务：请在面板填写 STT 端点与模型，或在代理端配置 STT_BASE_URL 与 STT_MODEL",
                code="CLIENT_ERROR",
            )
        audio_digest = _audio_digest(req)
        cached_tr = stt_cache_get(audio_digest, upstream.STT_MODEL)
        if cached_tr:
            transcript = cached_tr
            log.info("命中 STT 转写缓存 %s… (%d 字)", audio_digest[:8], len(transcript))
        else:
            try:
                transcript = await upstream.transcribe_audio(
                    app.state.client, req.audio, deadline=deadline
                )
            except PermissionError as exc:
                log.error("STT 鉴权失败: %s", exc)
                return fail("STT 服务鉴权失败，请检查密钥配置", code="CLIENT_ERROR")
            except Exception as exc:                              # noqa: BLE001
                log.error("STT 转写失败 %s: %s", req.stem[:30], exc)
                return fail(f"听力 STT 转写失败：{exc}")
            stt_cache_put(audio_digest, upstream.STT_MODEL, transcript)
            log.info("STT 转写完成 [%s] (%d 字)", upstream.STT_MODEL, len(transcript))

    llm_audio = None if (transcript or audio_mode == "stt") else req.audio
    llm_req = req.model_copy(update={"audio_transcript": transcript or None, "audio": llm_audio})
    prompt_text = build_prompt(llm_req)
    has_audio = bool(llm_audio and llm_audio.data)
    main_effort = upstream.resolve_reasoning_effort(req.reasoning_effort, model, role="main")
    arb_effort = upstream.resolve_reasoning_effort(req.reasoning_effort, model, role="arbitrate")

    # 1. 未开启双AI复核：单次调用
    if not DOUBLE_CHECK:
        try:
            raw = await upstream.call_cpa(
                app.state.client, prompt_text, api_key, temperature=0.0,
                audio=llm_audio, deadline=deadline, reasoning_effort=main_effort, model=model,
            )
        except PermissionError as exc:
            log.error("密钥验证失败: %s", exc)
            return fail("题库鉴权失败，请在面板填写正确的密钥后重试", code="CLIENT_ERROR")
        except Exception as exc:                                  # noqa: BLE001
            log.error("上游失败 %s: %s", req.stem[:30], exc)
            return fail("题库服务暂时不可用，请稍后重试")

        processed = process_answers(extract_values(raw), req, options)
        if not processed:
            log.warning("模型放弃作答或选项对不上 %s", req.stem[:40])
            return fail("题库未返回可用答案")
        kind, values = processed
        cache_put(key, kind, values)
        log.info("已作答 [%s] %s -> %s", model, req.stem[:30], values)
        return ok(req.stem, values, kind)

    # 2. 开启双AI独立复核机制（并行两路求解：一路贪婪确定性0.0，一路细致批判性0.3）
    prompt_path2 = (
        prompt_text
        + "\n\n【独立复核审题要求】：请仔细核对题目中的否定词、转折词、限定条件与时态细节，排除表面干扰项，给出最确凿的正确答案。"
    )
    pair_grace = (
        (upstream.CPA_AUDIO_PAIR_GRACE if has_audio else upstream.CPA_PAIR_GRACE)
        if DOUBLE_CHECK_ARBITRATE
        else None
    )
    try:
        res1, res2 = await upstream.run_dual_calls(
            upstream.call_cpa(
                app.state.client, prompt_text, api_key, temperature=0.0,
                audio=llm_audio, deadline=deadline, reasoning_effort=main_effort, model=model,
            ),
            upstream.call_cpa(
                app.state.client, prompt_path2, api_key, temperature=0.3,
                audio=llm_audio, deadline=deadline, reasoning_effort=main_effort, model=model,
            ),
            deadline=deadline,
            pair_grace=pair_grace,
            is_valid=lambda raw: process_answers(extract_values(raw), req, options) is not None,
        )
    except Exception as exc:
        log.error("复核调用异常: %s", exc)
        return fail("题库服务暂时不可用，请稍后重试")

    for r in (res1, res2):
        if isinstance(r, PermissionError):
            return fail("题库鉴权失败，请在面板填写正确的密钥后重试", code="CLIENT_ERROR")

    if isinstance(res1, Exception) and isinstance(res2, Exception):
        log.error("双路调用均失败: %s, %s", res1, res2)
        return fail("题库服务暂时不可用，请稍后重试")

    ans1 = process_answers(extract_values(res1), req, options) if isinstance(res1, str) else None
    ans2 = process_answers(extract_values(res2), req, options) if isinstance(res2, str) else None

    # 场景 A: 两次AI作答结果一致 -> 复核通过！直接提交！
    if answers_match(ans1, ans2):
        kind, values = ans1  # type: ignore[union-attr]
        detail = "[双AI复核通过] 两路AI独立作答完全一致 (2/2 通过)"
        log.info("%s %s -> %s", detail, req.stem[:30], values)
        cache_put(key, kind, values)
        return ok(req.stem, values, kind, check_status="consensus", detail=detail)

    # 场景 B: 双方均未产生有效答案
    if not ans1 and not ans2:
        log.warning("双路模型均未产生有效匹配选项 %s", req.stem[:40])
        return fail("题库未返回可用答案")

    # 场景 C: 两次作答不一致或一方失败 -> 派出第 3 路专家 AI 仲裁决断！
    log.warning(
        "[复核分歧] 两次作答不一致: 结果A=%s, 结果B=%s (题干: %s)",
        ans1[1] if ans1 else None,
        ans2[1] if ans2 else None,
        req.stem[:40],
    )

    if not DOUBLE_CHECK_ARBITRATE:
        return fail("两次AI复核结果不一致，已放弃作答以防扣分")

    # 启动第 3 路独立仲裁决断 (Third Path Expert Arbitration)
    # 预算不够就别开第三路：宁可回退到单路答案，也不能让请求拖过客户端超时。
    remaining = deadline - time.monotonic()
    if remaining < upstream.CPA_MIN_ARBITRATE_BUDGET:
        log.warning("总预算不足，跳过第三路仲裁 (剩余 %.1fs < %.1fs)", remaining, upstream.CPA_MIN_ARBITRATE_BUDGET)
        ans_arb = None
    else:
        try:
            discrepancy_report = build_discrepancy_report(ans1, ans2)
            arbitrate_prompt = build_arbitrate_prompt(llm_req, options, discrepancy_report)
            raw_arb = await upstream.call_cpa(
                app.state.client,
                arbitrate_prompt,
                api_key,
                temperature=0.1,
                audio=llm_audio,
                deadline=deadline,
                reasoning_effort=arb_effort,
                model=model,
            )
            ans_arb = process_answers(extract_values(raw_arb), req, options)
        except PermissionError as exc:
            log.error("仲裁密钥验证失败: %s", exc)
            return fail("题库鉴权失败，请在面板填写正确的密钥后重试", code="CLIENT_ERROR")
        except Exception as exc:
            log.error("仲裁复核失败: %s", exc)
            ans_arb = None

    if ans_arb:
        kind, values = ans_arb
        if ans1 and ans_arb == ans1:
            adopted = "第 1 路"
        elif ans2 and ans_arb == ans2:
            adopted = "第 2 路"
        else:
            adopted = "第 3 路专家裁定"
        detail = f"[双AI分歧 -> 第3路终审完成] 裁决采纳：{adopted}"
        log.info("%s -> 最终答案: %s (题干: %s)", detail, values, req.stem[:30])
        cache_put(key, kind, values)
        return ok(req.stem, values, kind, check_status="arbitrated", detail=detail)

    # 仲裁若未产生有效结果，且其中一路单方面成功
    if ans1 and not ans2:
        kind, values = ans1
        detail = "[单路有效作答] 第 1 路有效，第 2 路异常"
        cache_put(key, kind, values)
        return ok(req.stem, values, kind, check_status="fallback", detail=detail)
    elif ans2 and not ans1:
        kind, values = ans2
        detail = "[单路有效作答] 第 2 路有效，第 1 路异常"
        cache_put(key, kind, values)
        return ok(req.stem, values, kind, check_status="fallback", detail=detail)

    return fail("两次AI复核结果不一致且第三路仲裁未达成共识，已放弃作答以防扣分")
