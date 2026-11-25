/**
 * 直连模式单元测试（纯 Node，离线）。
 *
 * 做法：从 `tangwg学习通.user.js` 里切出「直连上游」那段源码，注入假的 GM_xmlhttpRequest
 * 与小程序级的配置/日志 store，然后跑真实的提示词组装、SSE 解析、选项吸附、
 * 双路共识、第 3 路仲裁与模型列表归一化。
 *
 * 跑法：node direct_mode_test.mjs
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(HERE, "tangwg学习通.user.js");
const src = readFileSync(SCRIPT, "utf8");

const sliceBetween = (start, end) => {
  const from = src.indexOf(start);
  if (from < 0) throw new Error(`找不到起点：${start}`);
  const to = src.indexOf(end, from);
  if (to < 0) throw new Error(`找不到终点：${end}`);
  return src.slice(from, to);
};

// 归一化/相似度等纯函数（直连模式依赖它们做选项吸附）
const textHelpers = sliceBetween("function extractRawTextFromElement", "const matchVideoQuizAnswers");
// 题型归一化：智慧树给中文题型名，直连只认代码
const typeHelper = sliceBetween("const QUESTION_TYPE_CODES", "const apiError = ");
// 链路判定：地址以 /vN 结尾即直连上游，否则走自建代理（面板不再有模式开关）
const modeHelper = sliceBetween("const detectApiMode =", "const isObject = ");
// 直连模式本体。测试里把两档宽限缩短到 1s / 1.5s，
// 否则「首路有效后等副路」这一条要真跑 60s；其余常量保持脚本原值。
const rawDirectBlock = sliceBetween("const DIRECT_SYSTEM_PROMPT", "const getAnswer = async");
const directBlock = rawDirectBlock
  .replace(/const DIRECT_PAIR_GRACE = \d+;/, "const DIRECT_PAIR_GRACE = 1;")
  .replace(/const DIRECT_AUDIO_PAIR_GRACE = \d+;/, "const DIRECT_AUDIO_PAIR_GRACE = 1.5;");
if (!directBlock.includes("const DIRECT_PAIR_GRACE = 1;") || !directBlock.includes("const DIRECT_AUDIO_PAIR_GRACE = 1.5;")) {
  throw new Error("宽限常量改写失败，脚本里的常量名变了");
}

const buildHarness = (GM_xmlhttpRequest) =>
  new Function(
    "isObject",
    "apiError",
    "useConfigStore",
    "useLogStore",
    "_GM_xmlhttpRequest",
    "sleep",
    `${textHelpers}\n${typeHelper}\n${modeHelper}\n${directBlock}\n
     return {
       directGetAnswer, fetchModelsDirect, fetchSttModels, snapToOptions, extractDirectValues,
       processDirectAnswers, buildDirectPrompt, normalizeOpenAiBase, normalizeSttEndpoints,
       collectSseText, directAnswersMatch, normalizeQuestionType, detectApiMode, hashAudioData
     };`,
  )(isObject, apiError, useConfigStore, useLogStore, GM_xmlhttpRequest, () => Promise.resolve());

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const apiError = (message) => ({ success: false, data: null, error: { code: "CLIENT_ERROR", message }, meta: null });

const CONFIG = {
  queryApis: [{
    mode: "direct",
    endpoint: "https://cpa.example.com/v1",
    token: "sk-test",
    directDoubleCheck: true,
    model: "gpt-4o-mini",
    audioMode: "llm",
    reasoningEffort: "auto",
    sttEndpoint: "",
    sttToken: "",
    sttModel: "",
  }],
  otherParams: { params: [{ name: "切换、答题间隔，单位秒", value: 0 }] },
};
const logs = [];
const useConfigStore = () => CONFIG;
const useLogStore = () => ({ addLog: (message, type) => logs.push({ message, type }) });

// ---- 假上游：按调用次序返回剧本，并记录每次请求 -------------------------------------
const sse = (content) =>
  ": keep-alive\r\ndata: " +
  JSON.stringify({ choices: [{ delta: { content } }] }) +
  "\r\n\r\ndata: [DONE]\r\n";

const makeUpstream = (handler) => {
  const calls = [];
  let aborted = 0;
  const fn = (details) => {
    let parsedBody = null;
    if (typeof details.data === "string" && details.data) {
      parsedBody = JSON.parse(details.data);
    } else if (details.data !== undefined && details.data !== null) {
      parsedBody = details.data;
    }
    const call = {
      method: details.method,
      url: details.url,
      headers: details.headers,
      body: parsedBody,
    };
    calls.push(call);
    const reply = handler(details, calls.length - 1);
    const handle = { abort: () => { call.aborted = true; aborted += 1; } };
    if (reply.hang) return handle;
    setTimeout(() => {
      if (reply.error) return details.onerror({ error: "boom" });
      details.onload({ status: reply.status ?? 200, responseText: reply.text ?? "", statusText: "OK" });
    }, reply.delay ?? 0);
    return handle;
  };
  return { fn, calls, abortedCount: () => aborted };
};

// ---- 断言 ---------------------------------------------------------------------------
let failures = 0;
const check = (name, condition, detail) => {
  if (condition) {
    console.log(`[PASS] ${name}`);
  } else {
    failures += 1;
    console.log(`[FAIL] ${name}${detail === undefined ? "" : ` -> ${JSON.stringify(detail)}`}`);
  }
};
const eq = (name, actual, expected) =>
  check(name, JSON.stringify(actual) === JSON.stringify(expected), { actual, expected });

const run = async () => {
  // 1. OpenAI 兼容 base 归一化 & 超时预算基线
  {
    const h = buildHarness(() => ({ abort() {} }));
    eq("base 归一化补 /v1", h.normalizeOpenAiBase("https://cpa.example.com"), "https://cpa.example.com/v1");
    eq("base 归一化去尾斜杠", h.normalizeOpenAiBase("https://cpa.example.com/v1/"), "https://cpa.example.com/v1");
    eq("base 归一化保留已有版本段", h.normalizeOpenAiBase("https://cpa.example.com/api/v2"), "https://cpa.example.com/api/v2");
    check("直连普通总预算放宽至 300s", rawDirectBlock.includes("const DIRECT_TOTAL_BUDGET = 300;"));
    check("直连听力总预算放宽至 420s", rawDirectBlock.includes("const DIRECT_AUDIO_TOTAL_BUDGET = 420;"));
    check("直连普通/听力副路宽限放宽至 60s/90s", rawDirectBlock.includes("const DIRECT_PAIR_GRACE = 60;") && rawDirectBlock.includes("const DIRECT_AUDIO_PAIR_GRACE = 90;"));
    check("直连最低仲裁剩余预算为 20s", rawDirectBlock.includes("const DIRECT_MIN_ARBITRATE_BUDGET = 20;"));
    check("STT 超时放宽至 120s", rawDirectBlock.includes("const STT_REQUEST_TIMEOUT = 120e3;"));
  }

  // 2. SSE 解析
  {
    const h = buildHarness(() => ({ abort() {} }));
    eq("SSE 拼接 delta 并忽略保活", h.collectSseText(sse('{"values":') + sse('["甲"]}')), '{"values":["甲"]}');
    eq("SSE 兼容一次性 JSON", h.collectSseText('{"choices":[{"message":{"content":"甲"}}]}'), "甲");
    eq("SSE 空输入", h.collectSseText(""), "");
  }

  // 3. values 提取
  {
    const h = buildHarness(() => ({ abort() {} }));
    eq("提取纯 JSON", h.extractDirectValues('{"values": ["甲", "乙"]}'), ["甲", "乙"]);
    eq("提取 ```json 包裹", h.extractDirectValues('```json\n{"values": ["甲"]}\n```'), ["甲"]);
    eq("剥离“答案是：”前缀", h.extractDirectValues('答案是：{"values": ["甲"]}'), ["甲"]);
    eq("无 JSON 时按分隔符切", h.extractDirectValues("甲、乙，丙"), ["甲", "乙", "丙"]);
    eq("空数组不放弃判定交给上层", h.extractDirectValues('{"values": []}'), []);
  }

  // 4. 选项吸附
  {
    const h = buildHarness(() => ({ abort() {} }));
    const options = ["生产力与生产关系的矛盾", "经济基础与上层建筑的矛盾"];
    eq("裸字母吸附到选项原文", h.snapToOptions("B", options), options[1]);
    eq("带点字母吸附", h.snapToOptions("b.", options), options[1]);
    eq("原文精确吸附", h.snapToOptions(options[0], options), options[0]);
    eq("近似文本按相似度吸附", h.snapToOptions("经济基础与上层建筑矛盾", options), options[1]);
    eq("对不上的返回 null", h.snapToOptions("完全不相干的内容", options), null);
  }

  // 5. 答案处理
  {
    const h = buildHarness(() => ({ abort() {} }));
    const judge = { stem: "判断", options: ["正确", "错误"], type: "3" };
    eq("判断题收敛", h.processDirectAnswers(["对"], judge, judge.options), ["judge", ["正确"]]);
    const multi = { stem: "多选", options: ["甲", "乙", "丙"], type: "1" };
    eq("多选吸附", h.processDirectAnswers(["A", "C"], multi, multi.options), ["choice", ["甲", "丙"]]);
    eq("有选项但吸附失败 -> null", h.processDirectAnswers(["丁"], multi, multi.options), null);
    const fill = { stem: "填空", options: [], type: "2" };
    eq("填空直接清洗", h.processDirectAnswers([" 甲 ", "乙"], fill, []), ["fill", ["甲", "乙"]]);
  }

  // 6. 双路一致 -> 共识，且请求体正确
  {
    const { fn, calls } = makeUpstream(() => ({ text: sse('{"values": ["经济基础与上层建筑的矛盾"]}') }));
    const h = buildHarness(fn);
    logs.length = 0;
    const res = await h.directGetAnswer(
      { title: "资本", type: "0", searchText: { stem: "资本主义社会的基本矛盾是（ ）", options: ["生产力与生产关系的矛盾", "经济基础与上层建筑的矛盾"] } },
      {},
    );
    check("双路一致 -> success", res.success === true, res);
    eq("双路一致 -> 吸附后的选项原文", res.data?.items?.[0]?.answer?.values, ["经济基础与上层建筑的矛盾"]);
    eq("双路一致 -> check_status", res.meta?.check_status, "consensus");
    eq("双路一致 -> 只发 2 次请求", calls.length, 2);
    check("请求走 /v1/chat/completions", calls[0].url === "https://cpa.example.com/v1/chat/completions", calls[0].url);
    eq("请求带 Bearer 密钥", calls[0].headers.Authorization, "Bearer sk-test");
    eq("请求带所选模型", calls[0].body.model, "gpt-4o-mini");
    eq("请求开启流式", calls[0].body.stream, true);
    check("系统提示词要求纯 JSON", String(calls[0].body.messages[0].content).includes("values"), calls[0].body.messages[0].content);
    check("题干进入 user 消息", String(calls[0].body.messages[1].content).includes("资本主义社会的基本矛盾"), calls[0].body.messages[1].content);
    check("双路温度不同（0.0 / 0.3）", calls[0].body.temperature === 0 && calls[1].body.temperature === 0.3);
  }

  // 7. 双路分歧 -> 第 3 路仲裁
  {
    const answers = [
      '{"values": ["生产力与生产关系的矛盾"]}',
      '{"values": ["经济基础与上层建筑的矛盾"]}',
      '{"analysis": "…", "values": ["经济基础与上层建筑的矛盾"]}',
    ];
    const { fn, calls } = makeUpstream((_d, index) => ({ text: sse(answers[Math.min(index, answers.length - 1)]) }));
    const h = buildHarness(fn);
    logs.length = 0;
    const res = await h.directGetAnswer(
      { title: "资本", type: "0", searchText: { stem: "资本主义社会的基本矛盾是（ ）", options: ["生产力与生产关系的矛盾", "经济基础与上层建筑的矛盾"] } },
      {},
    );
    eq("分歧 -> 发起 3 次请求", calls.length, 3);
    eq("仲裁请求带 medium 思考强度", calls[2].body.reasoning_effort, "medium");
    check("仲裁请求含分歧报告", String(calls[2].body.messages[1].content).includes("分歧"), calls[2].body.messages[1].content.slice(0, 200));
    eq("采纳仲裁结果", res.data?.items?.[0]?.answer?.values, ["经济基础与上层建筑的矛盾"]);
    eq("check_status = arbitrated", res.meta?.check_status, "arbitrated");
    check("日志说明采纳第 2 路", String(res.meta?.check_detail).includes("第 2 路"), res.meta?.check_detail);
  }

  // 8. 关闭双路 -> 只发 1 次
  {
    const { fn, calls } = makeUpstream(() => ({ text: sse('{"values": ["甲"]}') }));
    const h = buildHarness(fn);
    CONFIG.queryApis[0].directDoubleCheck = false;
    const res = await h.directGetAnswer(
      { title: "题", type: "0", searchText: { stem: "题", options: ["甲", "乙"] } },
      {},
    );
    eq("单路模式只发 1 次", calls.length, 1);
    check("单路模式仍然成功", res.success === true, res);
    CONFIG.queryApis[0].directDoubleCheck = true;
  }

  // 9. 前置校验
  {
    const { fn, calls } = makeUpstream(() => ({ text: sse('{"values": ["甲"]}') }));
    const h = buildHarness(fn);
    const question = { title: "题", type: "0", searchText: { stem: "题", options: ["甲"] } };
    const snapshot = { ...CONFIG.queryApis[0] };
    CONFIG.queryApis[0].model = "";
    let res = await h.directGetAnswer(question, {});
    check("直连缺模型 -> 明确报错", res.success === false && /模型/.test(res.error.message), res.error);
    CONFIG.queryApis[0].model = snapshot.model;
    CONFIG.queryApis[0].token = "";
    res = await h.directGetAnswer(question, {});
    check("直连缺密钥 -> 明确报错", res.success === false && /密钥|API Key/.test(res.error.message), res.error);
    CONFIG.queryApis[0].token = snapshot.token;
    CONFIG.queryApis[0].endpoint = "http://cpa.example.com/v1";
    res = await h.directGetAnswer(question, {});
    check("直连非 HTTPS -> 拒绝", res.success === false && /HTTPS/.test(res.error.message), res.error);
    CONFIG.queryApis[0].endpoint = snapshot.endpoint;
    eq("前置校验不产生请求", calls.length, 0);
  }

  // 9b. 地址形态决定链路，且没有地址时明确要求先填
  {
    const h = buildHarness(() => ({ abort() {} }));
    eq("以 /v1 结尾 -> 直连上游", h.detectApiMode("https://cpa.example.com/v1"), "direct");
    eq("带尾斜杠的 /v1/ -> 直连上游", h.detectApiMode("https://cpa.example.com/v1/"), "direct");
    eq("站点根地址 -> 自建代理", h.detectApiMode("https://tiku.example.com"), "proxy");
    eq("空地址 -> 自建代理（由上层拦截）", h.detectApiMode(""), "proxy");

    const { fn, calls } = makeUpstream(() => ({ text: sse('{"values": ["甲"]}') }));
    const h2 = buildHarness(fn);
    const restore = CONFIG.queryApis[0].endpoint;
    CONFIG.queryApis[0].endpoint = "";
    const res = await h2.directGetAnswer({ title: "题", type: "0", searchText: { stem: "题", options: ["甲"] } }, {});
    check("空地址 -> 要求先填端点", res.success === false && /端点|上游地址/.test(res.error.message), res.error);
    CONFIG.queryApis[0].endpoint = restore;
    eq("空地址不产生请求", calls.length, 0);
  }

  // 10. 上游报错 -> 错误信封而不是异常
  {
    const { fn } = makeUpstream(() => ({ status: 401, text: '{"error":{"message":"bad key"}}' }));
    const h = buildHarness(fn);
    const res = await h.directGetAnswer(
      { title: "题", type: "0", searchText: { stem: "题", options: ["甲"] } },
      {},
    );
    check("401 映射成鉴权错误", res.success === false && /鉴权/.test(res.error.message), res.error);
  }

  // 11. 缓存：同题第二次不再打上游
  {
    const { fn, calls } = makeUpstream(() => ({ text: sse('{"values": ["甲"]}') }));
    const h = buildHarness(fn);
    const question = { title: "题", type: "0", searchText: { stem: "缓存题", options: ["甲", "乙"] } };
    await h.directGetAnswer(question, {});
    const afterFirst = calls.length;
    const res = await h.directGetAnswer(question, {});
    eq("第二次命中缓存不再请求", calls.length, afterFirst);
    check("缓存命中仍返回完整信封", res.success === true && res.data.items[0].answer.values[0] === "甲", res);
  }

  // 12. 模型列表：直连上游 /v1/models
  {
    const { fn, calls } = makeUpstream(() => ({
      text: JSON.stringify({
        data: [
          { id: "models/gemini-3.8-flash-high", name: "Gemini 3.8 Flash High" },
          { id: "gemini-3.8-flash-high", name: "Gemini 3.8 Flash High" },
          { id: "gpt-4o-mini" },
        ],
      }),
    }));
    const h = buildHarness(fn);
    const res = await h.fetchModelsDirect({ upstreamUrl: "https://cpa.example.com" }, "sk-test");
    check("模型列表成功", res.ok === true, res);
    eq("模型列表去重并去 models/ 前缀", res.models, [
      { id: "gemini-3.8-flash-high", name: "Gemini 3.8 Flash High" },
      { id: "gpt-4o-mini", name: "gpt-4o-mini" },
    ]);
    check("模型列表请求走 /v1/models", calls[0].url === "https://cpa.example.com/v1/models", calls[0].url);
    eq("模型列表带密钥", calls[0].headers.Authorization, "Bearer sk-test");
  }

  // 13. 模型列表鉴权失败
  {
    const { fn } = makeUpstream(() => ({ status: 403, text: "{}" }));
    const h = buildHarness(fn);
    const res = await h.fetchModelsDirect({ upstreamUrl: "https://cpa.example.com/v1" }, "sk-test");
    check("403 -> 拉取失败并说明鉴权", res.ok === false && /鉴权/.test(res.error), res);
  }

  // 14. 取消信号：外部 abort 要真的掐掉在途请求
  {
    const { fn, calls, abortedCount } = makeUpstream(() => ({ hang: true }));
    const h = buildHarness(fn);
    const controller = new AbortController();
    const pending = h.directGetAnswer(
      { title: "题", type: "0", searchText: { stem: "取消题", options: ["甲"] } },
      { signal: controller.signal },
    );
    await new Promise((resolve) => setTimeout(resolve, 50));
    controller.abort();
    const res = await pending;
    check("取消后返回错误信封而不是挂住", res.success === false, res);
    check("取消会 abort 上游请求", abortedCount() >= 1, { calls: calls.length, aborted: abortedCount() });
  }

  // 15. 副路卡死不响应 -> 首路有效后用宽限掐掉慢路，再走第 3 路仲裁
  {
    const { fn, calls, abortedCount } = makeUpstream((_d, index) => {
      if (index === 1) return { hang: true };          // 副路永远不回
      return { text: sse('{"values": ["甲"]}') };      // 首路与仲裁都快速回同一答案
    });
    const h = buildHarness(fn);
    const started = Date.now();
    const res = await h.directGetAnswer(
      { title: "题", type: "0", searchText: { stem: "宽限题", options: ["甲", "乙"] } },
      {},
    );
    const elapsed = Date.now() - started;
    check("副路卡死时仍拿到答案", res.success === true && res.data.items[0].answer.values[0] === "甲", res);
    check("宽限到期会 abort 慢路", abortedCount() >= 1, { aborted: abortedCount() });
    check("宽限时长生效（未跑满总预算）", elapsed < 20_000, elapsed);
    eq("共发起 3 路请求（双路 + 仲裁）", calls.length, 3);
    eq("check_status 为 arbitrated", res.meta?.check_status, "arbitrated");
  }

  // 16. 副路卡死且仲裁也失败 -> 回退到首路答案而不是整题失败
  {
    const { fn, calls } = makeUpstream((_d, index) => {
      if (index === 0) return { text: sse('{"values": ["甲"]}') };
      return { error: true };                          // 副路与仲裁都报错
    });
    const h = buildHarness(fn);
    const res = await h.directGetAnswer(
      { title: "题", type: "0", searchText: { stem: "回退题", options: ["甲", "乙"] } },
      {},
    );
    check("仲裁失败时回退首路答案", res.success === true && res.data.items[0].answer.values[0] === "甲", res);
    eq("回退标记为 fallback", res.meta?.check_status, "fallback");
    eq("回退时请求数 = 3", calls.length, 3);
  }

  // 17. 智慧树题型是中文名，直连必须归一化成代码再发请求
  {
    const { fn, calls } = makeUpstream(() => ({ text: sse('{"values": ["错误"]}') }));
    const h = buildHarness(fn);
    eq("中文题型判断题 -> 3", h.normalizeQuestionType("判断题"), "3");
    eq("未知题型回落 8", h.normalizeQuestionType("论述题"), "8");
    const res = await h.directGetAnswer(
      { title: "判断", type: "判断题", searchText: { stem: "天空是绿色的", options: ["正确", "错误"] } },
      {},
    );
    check("中文题型不再被当成选择题", res.success === true && res.data.items[0].answer.kind === "judge", res.data);
    eq("判断题答案收敛到选项原文", res.data?.items?.[0]?.answer?.values, ["错误"]);
    eq("提示词的题型名正确", /题型：判断题/.test(String(calls[0].body.messages[1].content)), true);
  }

  // 18. STT 端点归一化与拉取 STT 模型列表（OpenAI + Deepgram 自适应，拦截 wss://）
  {
    const h = buildHarness(() => ({ abort() {} }));
    eq("STT 端点补全 /v1/audio/transcriptions",
      h.normalizeSttEndpoints("https://stt.example.com"),
      { protocol: "openai", authScheme: "Bearer", transcriptionsUrl: "https://stt.example.com/v1/audio/transcriptions", modelsUrl: "https://stt.example.com/v1/models" });
    eq("STT 端点保留 /openai/v1 形态",
      h.normalizeSttEndpoints("https://api.groq.com/openai/v1/"),
      { protocol: "openai", authScheme: "Bearer", transcriptionsUrl: "https://api.groq.com/openai/v1/audio/transcriptions", modelsUrl: "https://api.groq.com/openai/v1/models" });
    eq("STT 端点支持直填完整 transcriptions 路径",
      h.normalizeSttEndpoints("https://stt.example.com/v1/audio/transcriptions"),
      { protocol: "openai", authScheme: "Bearer", transcriptionsUrl: "https://stt.example.com/v1/audio/transcriptions", modelsUrl: "https://stt.example.com/v1/models" });
    eq("STT 端点放行本机回环 HTTP",
      h.normalizeSttEndpoints("http://127.0.0.1:8000/v1"),
      { protocol: "openai", authScheme: "Bearer", transcriptionsUrl: "http://127.0.0.1:8000/v1/audio/transcriptions", modelsUrl: "http://127.0.0.1:8000/v1/models" });
    eq("Deepgram REST 端点自动识别 Token 协议",
      h.normalizeSttEndpoints("https://api.deepgram.com/v1/listen"),
      { protocol: "deepgram", authScheme: "Token", transcriptionsUrl: "https://api.deepgram.com/v1/listen", modelsUrl: "https://api.deepgram.com/v1/models" });
    eq("Deepgram 错填 https://.../v2/listen 自动纠正为 /v1/listen 并清理 WS 参数",
      h.normalizeSttEndpoints("https://api.deepgram.com/v2/listen?eot_threshold=0.7&encoding=linear16&language=en"),
      { protocol: "deepgram", authScheme: "Token", transcriptionsUrl: "https://api.deepgram.com/v1/listen?language=en", modelsUrl: "https://api.deepgram.com/v1/models" });
    let rejectedRemoteHttp = false;
    try { h.normalizeSttEndpoints("http://stt.example.com/v1"); } catch { rejectedRemoteHttp = true; }
    check("STT 拒绝非回环明文 HTTP", rejectedRemoteHttp);
    let rejectedWssMsg = "";
    try { h.normalizeSttEndpoints("wss://api.deepgram.com/v2/listen?model=flux-general-en"); } catch (e) { rejectedWssMsg = e.message; }
    check("STT 明确拒绝 ws/wss 并给出 Deepgram REST 指引", /不支持 ws\/wss/.test(rejectedWssMsg) && /v1\/listen/.test(rejectedWssMsg), rejectedWssMsg);

    const { fn, calls } = makeUpstream(() => ({
      text: JSON.stringify({ data: [{ id: "whisper-1" }, { id: "SenseVoiceSmall" }] }),
    }));
    const h2 = buildHarness(fn);
    CONFIG.queryApis[0].sttEndpoint = "http://127.0.0.1:8000/v1";
    CONFIG.queryApis[0].sttToken = "";
    const modelsRes = await h2.fetchSttModels();
    check("无密钥本地 STT 也能拉取模型列表", modelsRes.ok === true && modelsRes.models.length === 2, modelsRes);
    check("STT 模型列表未强加空 Authorization 头", !("Authorization" in calls[0].headers), calls[0].headers);

    // Deepgram /v1/models 响应归一（带 Token 头、过滤 streaming-only 并提炼 nova-3）
    const { fn: dgModelFn, calls: dgModelCalls } = makeUpstream(() => ({
      text: JSON.stringify({
        stt: [
          { canonical_name: "nova-3-general", batch: true },
          { canonical_name: "nova-3-general", batch: true },
          { canonical_name: "nova-2-general", batch: true },
          { canonical_name: "flux-only", batch: false },
          { canonical_name: "whisper-large", batch: true },
        ],
      }),
    }));
    const hDgModel = buildHarness(dgModelFn);
    CONFIG.queryApis[0].sttEndpoint = "https://api.deepgram.com/v1/listen";
    CONFIG.queryApis[0].sttToken = "dg-secret";
    const dgModels = await hDgModel.fetchSttModels();
    eq("Deepgram /models 用 Token 鉴权", dgModelCalls[0].headers.Authorization, "Token dg-secret");
    eq("Deepgram 模型列表过滤 batch 并前置 nova-3/nova-2",
      dgModels.models.map((m) => m.id),
      ["nova-3", "nova-2", "nova-3-general", "nova-2-general", "whisper-large"]);
    CONFIG.queryApis[0].sttEndpoint = "";
    CONFIG.queryApis[0].sttToken = "";
  }

  // 19. 音频策略切换：大模型直听 vs STT 转文字 + 转写缓存 + 缓存按模式隔离
  {
    const fakeB64 = Buffer.from("ID3fakeAudioBytes").toString("base64");
    const sttMissingCalls = [];
    const { fn: fnMissing } = makeUpstream(() => {
      sttMissingCalls.push(1);
      return { text: sse('{"values": ["甲"]}') };
    });
    const hMissing = buildHarness(fnMissing);
    CONFIG.queryApis[0].audioMode = "stt";
    CONFIG.queryApis[0].sttEndpoint = "";
    CONFIG.queryApis[0].sttModel = "";
    const errRes = await hMissing.directGetAnswer(
      { title: "听力题", type: "0", searchText: { stem: "Where is he?", options: ["Library", "Park"] }, audio: { data: fakeB64, format: "mp3" } },
      {},
    );
    check("选 STT 但未配置端点/模型 -> 明确报错拦截，不盲猜", errRes.success === false && /STT/.test(errRes.error.message), errRes);
    eq("拦截后未发 LLM 请求", sttMissingCalls.length, 0);

    // 正常 STT 转写流程 + 先走 llm 再切 stt 不误命中旧缓存
    const { fn, calls } = makeUpstream((details) => {
      if (details.url.endsWith("/audio/transcriptions")) {
        return { text: JSON.stringify({ text: "The man is studying in the library." }) };
      }
      const body = JSON.parse(details.data);
      const userContent = body.messages[1].content;
      // 如果收到 input_audio（llm 直听错选 Park），如果收到转写原文（stt 正确选 Library）
      const ans = Array.isArray(userContent) ? "Park" : (String(userContent).includes("studying in the library") ? "Library" : "Park");
      return { text: sse(JSON.stringify({ values: [ans] })) };
    });
    const h = buildHarness(fn);
    const audioQuestion = {
      title: "听力切换测试",
      type: "0",
      searchText: { stem: "Where is the man?", options: ["Library", "Park"] },
      audio: { data: fakeB64, format: "mp3" },
    };

    // 先按大模型直听跑一次
    CONFIG.queryApis[0].audioMode = "llm";
    const llmRes = await h.directGetAnswer(audioQuestion, {});
    eq("大模型直听传 input_audio", Array.isArray(calls[0].body.messages[1].content), true);
    eq("大模型直听结果", llmRes.data?.items?.[0]?.answer?.values, ["Park"]);

    // 切到 STT 转文字再跑同一题：不能命中 llm 缓存，应先转写再纯文本推理
    CONFIG.queryApis[0].audioMode = "stt";
    CONFIG.queryApis[0].sttEndpoint = "https://stt.example.com/v1";
    CONFIG.queryApis[0].sttToken = "sk-stt";
    CONFIG.queryApis[0].sttModel = "whisper-large-v3-turbo";
    const sttRes = await h.directGetAnswer(audioQuestion, {});
    const sttCalls = calls.filter((c) => c.url === "https://stt.example.com/v1/audio/transcriptions");
    const postSttLlmCalls = calls.slice(2).filter((c) => c.url.endsWith("/chat/completions"));
    eq("切换模式后只调 1 次 STT（不传给每路 LLM）", sttCalls.length, 1);
    eq("STT 请求带 Bearer 密钥", sttCalls[0].headers.Authorization, "Bearer sk-stt");
    check("STT 请求体为 FormData 且含 model/file", sttCalls[0].body instanceof FormData && sttCalls[0].body.get("model") === "whisper-large-v3-turbo", true);
    check("STT 后发给 LLM 的是纯文本而非 input_audio", typeof postSttLlmCalls[0].body.messages[1].content === "string", true);
    check("转写原文注入 LLM 提示词", postSttLlmCalls[0].body.messages[1].content.includes("studying in the library"), true);
    eq("STT 后正确作答", sttRes.data?.items?.[0]?.answer?.values, ["Library"]);

    // 另一题共用同一段音频：应命中 sttCache，不再重复调 STT
    const siblingQuestion = {
      title: "听力第二小题",
      type: "0",
      searchText: { stem: "What is he doing?", options: ["Studying", "Sleeping"] },
      audio: { data: fakeB64, format: "mp3" },
    };
    await h.directGetAnswer(siblingQuestion, {});
    const totalSttCallsAfterSibling = calls.filter((c) => c.url === "https://stt.example.com/v1/audio/transcriptions").length;
    eq("同段音频第 2 题命中 STT 转写缓存，不重复转写", totalSttCallsAfterSibling, 1);

    // 20. Deepgram REST /v1/listen 端到端测试（Token 鉴权 + Blob 二进制体 + results.channels 解析）
    const { fn: dgFn, calls: dgCalls } = makeUpstream((details) => {
      if (details.url.includes("api.deepgram.com/v1/listen")) {
        return {
          text: JSON.stringify({
            results: { channels: [{ alternatives: [{ transcript: "The secret password is pineapple." }] }] },
          }),
        };
      }
      const body = JSON.parse(details.data);
      const ans = String(body.messages[1].content).includes("pineapple") ? "pineapple" : "apple";
      return { text: sse(JSON.stringify({ values: [ans] })) };
    });
    const hDg = buildHarness(dgFn);
    CONFIG.queryApis[0].audioMode = "stt";
    CONFIG.queryApis[0].sttEndpoint = "https://api.deepgram.com/v1/listen";
    CONFIG.queryApis[0].sttToken = "dg-key-123";
    CONFIG.queryApis[0].sttModel = "nova-3";
    const dgRes = await hDg.directGetAnswer(
      {
        title: "Deepgram 听力测试",
        type: "0",
        searchText: { stem: "What is the secret password?", options: ["apple", "pineapple"] },
        audio: { data: fakeB64, format: "mp3" },
      },
      {},
    );
    const dgStt = dgCalls.find((c) => c.url.includes("api.deepgram.com/v1/listen"));
    check("Deepgram /v1/listen 带 model=nova-3 与 smart_format=true", dgStt && /model=nova-3/.test(dgStt.url) && /smart_format=true/.test(dgStt.url), dgStt?.url);
    eq("Deepgram 请求带 Token 鉴权与 audio/mpeg 类型", [dgStt?.headers?.Authorization, dgStt?.headers?.["Content-Type"]], ["Token dg-key-123", "audio/mpeg"]);
    check("Deepgram 请求体为二进制 Blob（非 FormData）", dgStt?.body instanceof Blob && !(dgStt?.body instanceof FormData), true);
    eq("Deepgram 转写后正确作答", dgRes.data?.items?.[0]?.answer?.values, ["pineapple"]);

    // 21. STT 模式下若检测到音频但下载失败，不得降级盲猜，必须中止报错
    const { fn: audioErrFn, calls: audioErrCalls } = makeUpstream(() => ({ text: sse('{"values": ["猜测"]}') }));
    const hAudioErr = buildHarness(audioErrFn);
    CONFIG.queryApis[0].audioMode = "stt";
    CONFIG.queryApis[0].sttEndpoint = "https://api.deepgram.com/v1/listen";
    CONFIG.queryApis[0].sttToken = "dg-key-123";
    CONFIG.queryApis[0].sttModel = "nova-3";
    const audioErrRes = await hAudioErr.directGetAnswer(
      {
        title: "听力下载失败测试",
        type: "0",
        searchText: { stem: "Listen to the passage", options: ["A", "B"] },
        audioError: "音频下载失败 HTTP 403",
      },
      {},
    );
    check("STT 模式音频下载失败时中止不盲猜", audioErrRes.success === false && /获取失败/.test(audioErrRes.error.message), audioErrRes.error);
    eq("音频下载失败时不调用 LLM", audioErrCalls.length, 0);

    // 22. 复合听力大题 (type=8) 在 STT 模式下的多小题作答（含转写缓存隔离 & 各小题选项文本）
    const { fn: compFn, calls: compCalls } = makeUpstream((details) => {
      if (details.url.includes("api.deepgram.com/v1/listen")) {
        return {
          text: JSON.stringify({
            results: { channels: [{ alternatives: [{ transcript: "Tom is studying in the library right now." }] }] },
          }),
        };
      }
      const body = JSON.parse(details.data);
      const userPrompt = String(body.messages[1].content);
      const hasAllOpts = userPrompt.includes("第 1 小题选项") && userPrompt.includes("第 2 小题选项") && userPrompt.includes("studying in the library");
      return { text: sse(JSON.stringify({ values: hasAllOpts ? ["Studying", "Library"] : ["Sleeping", "Park"] })) };
    });
    const hComp = buildHarness(compFn);
    const compRes = await hComp.directGetAnswer(
      {
        title: "听力复合测试",
        type: "8",
        searchText: {
          stem: "(1) What is Tom doing?\n(2) Where is Tom?\n\n【各小题选项明细】\n第 1 小题选项：\nA. Studying\nB. Sleeping\n\n第 2 小题选项：\nA. Library\nB. Park",
          options: [],
        },
        audio: { data: Buffer.from("ID3compAudio").toString("base64"), format: "mp3" },
      },
      {},
    );
    eq("复合听力题转写后按序返回所有小题答案", compRes.data?.items?.[0]?.answer?.values, ["Studying", "Library"]);
    check("复合听力题同时带转写与小题选项", compCalls.some((c) => c.url.endsWith("/chat/completions") && String(c.body.messages[1].content).includes("第 1 小题选项")), true);

    CONFIG.queryApis[0].audioMode = "llm";
    CONFIG.queryApis[0].sttEndpoint = "";
    CONFIG.queryApis[0].sttToken = "";
    CONFIG.queryApis[0].sttModel = "";

    // 23. 思考强度设置：auto 下模型名含 flash 自动设为 high，切换强度不命中旧缓存
    {
      const { fn: effFn, calls: effCalls } = makeUpstream((details) => {
        const body = JSON.parse(details.data);
        return { text: sse(JSON.stringify({ values: [body.reasoning_effort === "high" ? "精确答案" : "粗略答案"] })) };
      });
      const hEff = buildHarness(effFn);
      const prevModel = CONFIG.queryApis[0].model;
      CONFIG.queryApis[0].model = "MiniMax-M3.1-Flash";
      CONFIG.queryApis[0].reasoningEffort = "auto";
      const flashRes = await hEff.directGetAnswer(
        { title: "思考强度flash测试", type: "0", searchText: { stem: "Flash 思考题", options: ["粗略答案", "精确答案"] } },
        {},
      );
      eq("flash 模型 auto 下主路思考强度为 high", effCalls.slice(0, 2).map((c) => c.body.reasoning_effort), ["high", "high"]);
      eq("flash auto 下选出答案", flashRes.data?.items?.[0]?.answer?.values, ["精确答案"]);

      CONFIG.queryApis[0].reasoningEffort = "low";
      const lowRes = await hEff.directGetAnswer(
        { title: "思考强度flash测试", type: "0", searchText: { stem: "Flash 思考题", options: ["粗略答案", "精确答案"] } },
        {},
      );
      eq("切换为 low 不误命中 high 缓存且发送 low", effCalls.slice(2, 4).map((c) => c.body.reasoning_effort), ["low", "low"]);
      eq("low 下答案独立生效", lowRes.data?.items?.[0]?.answer?.values, ["粗略答案"]);

      CONFIG.queryApis[0].model = prevModel;
      CONFIG.queryApis[0].reasoningEffort = "auto";
    }
  }

  console.log();
  if (failures) {
    console.log(`直连模式测试失败 ${failures} 项`);
    process.exit(1);
  }
  console.log("直连模式测试全部通过 [OK]");
};

run().catch((err) => {
  console.error("测试异常：", err);
  process.exit(1);
});
