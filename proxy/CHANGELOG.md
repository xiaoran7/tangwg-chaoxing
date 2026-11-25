# CHANGELOG — tiku-proxy（题库代理）

## [Unreleased] 2026-11-25 — 放宽长思考模型超时预算，消除客户端 110s 提前掐断导致的 499

### 背景

2026-11-25 18:18 ~ 18:22（CST），脚本直连上游网关 `/v1` 调用 `step-5-preview` 等长思考模型处理长题（`5.7~8.9 KB`）时出现 4 条 `499 agent_canceled`：上游连接正常（`ttft_ms` 仅 `0.67s~2.90s`），但在 `110s` 内持续流式输出 `10,899~13,113` 隐藏思考 token、尚未吐出正文即被脚本 `DIRECT_TOTAL_BUDGET = 110s` 同时 `abort()`；同批长题切到 `deepseek-v4.1-flash`（`effort=high`）双路 + 第 3 路仲裁也已达 `~83s`，逼近原上限。反代与上游网关侧均无超时截断。

### 改动

- **`tangwg学习通.user.js`（0.9.0 → 0.9.1）**：
  - 直连模式预算：`DIRECT_TOTAL_BUDGET` `110s → 300s`、`DIRECT_AUDIO_TOTAL_BUDGET` `200s → 420s`、`DIRECT_PAIR_GRACE` `20s → 60s`、`DIRECT_AUDIO_PAIR_GRACE` `35s → 90s`、`DIRECT_MIN_ARBITRATE_BUDGET` `12s → 20s`、`STT_REQUEST_TIMEOUT` `60s → 120s`。
  - 代理模式客户端超时：`requestTimeout` 从 `90s / 180s` 放宽至 `240s / 360s`（携带 `audio_transcript` 的长听力复合题也适用 `360s`）。
- **`proxy/upstream.py`、`proxy/server.py`、`proxy/.env.example`、`proxy/nginx.conf`**：
  - 服务端默认预算同步放宽并严格低于客户端超时：`CPA_TIMEOUT` / `CPA_TOTAL_BUDGET` `75s → 210s`、`CPA_AUDIO_TIMEOUT` / `CPA_AUDIO_TOTAL_BUDGET` `160s → 330s`、`CPA_PAIR_GRACE` `20s → 60s`、`CPA_AUDIO_PAIR_GRACE` `35s → 90s`、`CPA_MIN_ARBITRATE_BUDGET` `12s → 20s`、`CPA_READ_TIMEOUT` `30s → 60s`、`STT_TIMEOUT` `60s → 120s`。
  - `server.py` 对已带 `audio_transcript` 的听力复合题统一复用 `CPA_AUDIO_TOTAL_BUDGET` 与 `CPA_AUDIO_PAIR_GRACE`。
  - 修正仓库 `proxy/nginx.conf` 模板过期的 `proxy_read_timeout 20s` 为 `420s`（加 `proxy_send_timeout 420s` 与 `proxy_buffering off`）。
- **`direct_mode_test.mjs`、`proxy/README.md`、`llms.txt`**：
  - 更新宽限常量替换正则并新增 5 项新超时预算基线断言；同步更新文档与索引中的超时说明。

---

## [Unreleased] 2026-11-16 — 接入 DIY STT 语音转文字链路，面板支持「大模型直听 / STT 转文字」切换与悬浮说明

### 开源发布与检索优化（2026-11-17）

- 新增根目录 `README.md`、`LICENSE`（MIT）与 AI/Agent 索引文件 `llms.txt`，补齐真实 Chrome 渲染运行截图（`assets/panel-answer-stt.png`、`assets/panel-tooltip.png`、`assets/panel-home-logs.png`）、完整使用指南与免责声明；
- 更新 `tangwg学习通.user.js` 头部 `@name`、`@description`、`@homepageURL`、`@supportURL` 元信息，便于脚本平台、搜索引擎与 AI 检索。

### 背景

纯文本或通过 Claude 协议转发的模型（如 `MiniMax-M3.1-Flash`）在 CPA 中会静默丢弃 `input_audio`，导致听力题无音频可用而盲猜。需要让用户自由决定听力音频走「大模型直听」还是「STT 转文字」，并且 STT 端点、密钥与模型全部支持面板 DIY 配置（不硬编码），同时配套小问号悬浮说明。

### 改动

**`tangwg学习通.user.js`（0.8.0 → 0.9.0）**

- **配置与迁移**：`queryApis[0]` 新增 `audioMode`（`"llm" | "stt"`，默认 `"llm"`）、`sttEndpoint`、`sttToken`、`sttModel`（全部默认留空，不硬编码）；`migrateConfig` 自动收敛老配置。
- **DIY STT 与音频策略 UI**（`QuestionTable`）：
  - 新增「音频处理」切换按钮组（`大模型直听` / `STT 转文字`），右侧配带 `teleported: false` 的小问号（`QuestionFilled`）悬浮说明。
  - 选择「STT 转文字」后展开虚线配置区（带支持协议与示例的小问号说明，以及实时协议识别徽标）：
    - **自动适配两类 HTTP 文件识别协议（按地址识别，不硬编码）**：① **OpenAI 兼容**（`/v1/audio/transcriptions`，`Bearer` 鉴权，兼容硅基流动、Groq、本机 `http://127.0.0.1` / `localhost`）；② **Deepgram REST**（`https://api.deepgram.com/v1/listen`，自动切 `Token` 鉴权、直传二进制音频、解析 `results.channels` 与 `/v1/models` 并前置 `nova-3`/`nova-2`）；
    - **明确拦截 `ws://`/`wss://` 实时流式地址**，并指引 Deepgram 用户改填 `https://api.deepgram.com/v1/listen`（`nova-3`）。
  - `STT 密钥` 可留空；`STT 模型` 下拉支持点击「刷新」拉取，也支持 `allow-create` 直接手输模型名回车。
  - 「使用教程」tab 同步新增 `03` 听力配置说明卡片。
- **思考强度设置（`auto` 自动为 `flash` 模型启用 `high`）**：
  - 面板「答题」页新增「思考强度」开关（`自动` / `默认` / `low` / `medium` / `high`，默认 `自动`）与小问号悬浮说明：选 `自动` 且模型名含 `flash`（如 `MiniMax-M3.1-Flash`、`gemini-3.8-flash`）时，主路与仲裁均自动下发 `reasoning_effort="high"`，旁边显示 `flash 自动: high` 实时徽标；其余模型保持默认、`medium` 仲裁；
  - `directCacheKey` 与代理 `cache_key` 均纳入思考强度，切换档位不会误命中旧缓存；
  - `proxy/server.py` 的 `SearchRequest` 与 `proxy/upstream.py` 同步新增 `reasoning_effort` 与 `resolve_reasoning_effort`（同时支持 `.env` 配置 `CPA_REASONING_EFFORT=auto`）。
- **端到端转写与缓存隔离**：
  - 新增 `transcribeAudioWithStt`（`FormData` 上传音频到 `/audio/transcriptions`）与 `sttCache`（按 `端点 + 模型 + 音频指纹` 缓存，同段音频双路/仲裁及同录音多小题只转写 1 次）；
  - 选 `stt` 但未填端点/模型或转写失败时直接报错拦截，绝不静默降级为盲猜；
  - 直连模式 `directCacheKey` 补齐音频哈希、`audioMode` 与 `sttKey`，避免切换音频策略或同题换录音时命中错误缓存；
  - 代理模式下若面板填了 DIY STT，由脚本完成转写后将 `audio_mode="stt"` + `audio_transcript` + `audio_hash` 发往代理；若留空 STT 端点，则透传 `audio` 与 `audio_mode="stt"` 交由代理服务端配置处理。
- **听力识别与作答链路修复（2026-11-16 实测排查）**：
  - 修复 `CxQuestionHandler.addQuestions` 对复合听力大题（`type="8"`）因删除 `.answerBg` / `zj` 仅取 `.fontLabel` 且清空 `searchOptions` 而丢光全部小题选项文本（及 `zj` 小题干）的问题：切分 `subOptionGroups` 时同步保留 `subOptionTextGroups`，将 `zj` 小题干及 `第 1..N 小题选项` 写入 `searchStem`（仅在题干计数一致时附带 `headingElements`），使直连/代理模型完整看到各小题题干与选项；
  - 修复 `findAudioForQuestion` 在多题同页时的跨题串音问题：向上回溯兄弟节点与父容器时严格隔离其他 `.questionLi`/`.TiMu`/`.examPaper_subject` 子树，并在日志明确标出音频来源层级（`本题内部` / `页面级兜底` 等）；
  - 修复 `findMatchedOption` 未剥离 `1. A` / `(2) 选项` / `第1题:` 题号前缀导致复合题回填漏选，并在 `fillQuestion` 对漏匹配与题数不足输出明确警告；
  - 日志补充 Deepgram `detected_language`、240 字转写预览及直连采纳答案列表；增强 `extractAudioUrlFromElement` 与 `fetchAudioAsBase64` 非音频校验，并在 `audioMode === "stt"` 下载音频失败时报错中止、带 `transcript` 复用 `DIRECT_AUDIO_PAIR_GRACE`（35s）；`STT_DIY_HELP_HTML` 补充 Deepgram `?language=en` 参数提示。

**`proxy/upstream.py` & `proxy/server.py` & `proxy/.env.example` & `proxy/README.md`**

- `upstream.py` 新增 `STT_BASE_URL`、`STT_API_KEY`、`STT_MODEL`、`STT_TIMEOUT`、`DEFAULT_AUDIO_MODE`（全部默认空/无硬编码），实现 `normalize_stt_transcriptions_url` 与 `transcribe_audio`；`build_prompt` 与 `build_arbitrate_prompt` 统一注入 `【听力音频转写原文】`。
- `server.py` 的 `SearchRequest` 新增 `audio_mode`、`audio_transcript`、`audio_hash`；SQLite 新增 `stt_cache` 表；`cache_key` 纳入 `audio_mode` 与转写摘要，彻底隔离「直听 vs STT」缓存；`/health` 新增 `audio_mode_default` 与 `stt_configured` 非敏字段。

**测试**

- `direct_mode_test.mjs` 新增 STT 端点归一化（含回环放行与远端 HTTP 拒绝）、无密钥 `/models` 拉取、未配拦截、完整 STT 转写链路、同音频缓存复用与直听/STT 缓存隔离断言；
- `proxy/contract_test.py`、`proxy/e2e_smoke.py`、`proxy/ui_smoke.py` 同步覆盖服务端/客户端 STT 透传、缓存隔离、小问号悬浮说明及 DIY STT 面板持久化。

---

## [Unreleased] 2026-11-16 — 面板收成一个端点、地址与密钥全部留空、修浮层飘出面板，并跟进上游 0.2.8

### 背景

上一版虽然让端点可改，但面板顶部仍摆着「模式」标签和「自建代理／直连上游」两个单选。实际用起来
这两个按钮是多余的：不管走哪条链路，端点和密钥都必须自己填。同时 `defaultConfig` 里还留着
内置示例域名作为默认地址，等于把「不用填」的假象又留在了代码里。
另外右侧「双路」按钮的 tooltip 会飘到面板外，变成一个没有样式的灰框。

### 改动

**`tangwg学习通.user.js`（0.7.0 → 0.8.0）**

- 删掉「模式」标签与两个单选（整个 `mode-row`），面板顶部只剩一个「端点」输入框。
  链路改由地址形态判定：`detectApiMode` 看是否以 `/vN` 结尾 —— 是则直连上游，否则走自建代理。
  配置里仍保留 `mode` 字段，但它是派生值，填地址时同步刷新，不再由用户选择。
- 端点与密钥都不再内置：`defaultConfig.queryApis[0].endpoint = ""`、`token: ""`，只从
  `localStorage` / GM 存储读。`OPEN_API_BASE_URL` 与 `NOTICE_API_URL` 两个硬编码域名一并删除；
  没填端点时 `fetchModels` / `getAnswer` 直接返回「请先填写端点…」，不再静默打内置地址。
- `migrateConfig` 把老配置的 `url` / `upstreamUrl` 收敛到单一 `endpoint`（老 `mode` 决定取哪个），
  然后删掉这两个废弃字段；此后端点的唯一事实来源是 `endpoint`。
- 公告通道改为 `{端点}/def/notice`，且只在走代理时请求；去掉了 `createNoticeHeaders`
  —— 不再向任何第三方发送 referer 与站内 UID。`@connect` 里的私有预设域名也随之移除。
- 修 tooltip 显示 bug：Element Plus 的 popper 默认 teleport 到 `document.body`，而面板挂在
  closed shadow root 里、Element Plus 样式也注入在 shadow root 内，于是浮层落到没有样式的外层，
  渲染成面板右侧一个灰框。三处浮层（模式提示、双路／单路、刷新按钮）统一加 `teleported: false`，
  模型下拉同样处理，浮层从此留在面板内。注意 `teleported: ""` 会被 Vue 布尔化成 `true`，
  原来那处「看起来关了」其实一直是开的。
- 面板内「使用教程」的凭证步骤同步改写：先填端点，再填密钥。

**跟进上游 0.2.8（原脚本 `isMobile` 的 greasyfork 版本）**

- 移植播放器修复：自动播放被浏览器拦截（`NotAllowedError`）不再整题失败，改为提示用户手动点播放；
  播放被页面暂停打断（`AbortError`）时按答题间隔重试，累计超过 3 次才转为手动提示。
  播放成功只记一条日志（`playing` 事件驱动），不再在初始化阶段抢先打「播放成功」。
- 未跟进的两处：上游把默认端点换成了 `search.tikuhai.com`（本仓库按需求改为留空），
  以及 `@downloadURL` / `@updateURL` 指向其 greasyfork 发布页（本仓库是自己的构建，不接管自动更新）。

**测试**

- `direct_mode_test.mjs` 扩到 **72 项**：新增 `detectApiMode` 的四类地址形态断言，以及
  「地址为空时必须先填端点且不发请求」。
- `ui_smoke.py` 扩到 **13 项**：不再替测试替换内置地址（脚本里已经没有了），改为种配置时把
  `endpoint` 指到本地假上游；新增「模式单选已删除」「端点填 `/v1` 后自动判定直连」
  「body 上不再挂 popper」「双路提示在面板内显示」。穿透 closed→open 的 shadow root 递归查浮层。

### 状态

- 本地：`node direct_mode_test.mjs` 72/72、`python contract_test.py` 29/29、`python e2e_smoke.py` 3/3、
  `python ui_smoke.py` 13/13 通过（均离线，未连生产 CPA）。
- 尚未部署；播放器改动尚未在真实超星课程页点验。
- 原有旧版默认后端没有 `/models` 等新接口，仍是 `search/exact`、
  `def/notice`、`health` 三个；新东西全部来自脚本作者在 greasyfork 上的 0.2.8。

---

## [Unreleased] 2026-11-16 — 端点可自定义、新增免部署的直连上游模式

### 背景

上一版把模型选择做通了，但代理地址仍写死在脚本里（`migrateConfig` 每次刷新都强制覆盖回内置地址），
用户换端点必须改源码重装；而且想用脚本就必须先部署服务器。这次把两条都解开：
地址进面板、可自由修改并持久化；再补一条不走代理的直连链路，装上脚本填个上游地址就能用。
（其中的「模式」单选与内置默认地址已在下一版移除，见上方条目。）

### 改动

**脚本 `tangwg学习通.user.js`（0.6.0 → 0.7.0）**

- 配置新增 `queryApis[0].mode`（`proxy` / `direct`）、`upstreamUrl`、`directDoubleCheck`；
  `migrateConfig` 删掉强制覆盖 `url` 的那行，改为只对缺字段补默认值并在老配置上做类型收敛
  （`mode` 非法值回落 `proxy`，空 `upstreamUrl` 回落内置值，`directDoubleCheck` 只有显式 `false` 才算关）。
  面板里改过的端点从此能活过刷新。
- 答题面板顶部新增「模式」单选（自建代理 / 直连上游）与「端点 / 上游」输入框，两者共用一格：
  proxy 模式写 `url`，direct 模式写 `upstreamUrl`；直连时右侧多一个「双路／单路」开关。
  切模式会清空并重拉模型列表（`loadModels` 增加 `modelReloadPending`，拉取途中再次请求刷新会在本轮结束后补一次）。
- 新增直连链路 `directGetAnswer`：`POST {upstream}/chat/completions`（自动补 `/v1`）、SSE 解析（忽略
  `: keep-alive`、兼容一次性 JSON）、`extractDirectValues` → `snapToOptions`（裸字母还原 + 相似度 85）→
  `processDirectAnswers`，与代理侧同一套规则；双路 0.0/0.3 并行，首路有效后只等副路 20s（听力 35s），
  分歧走第 3 路仲裁（`reasoning_effort=medium`），预算不足（<12s）跳过仲裁直接回退单路。
  结果统一封装成 `{success,data,error,meta}` 信封，`getAnswerValues` 与后续填答流程零改动。
- `fetchModels` 按模式分流：直连直接打上游 `GET /v1/models`（`fetchModelsDirect`，去重 + 去 `models/` 前缀 +
  保留显示名），代理仍走 `/api/open/v1/models`。
- 听力音频准备抽成 `prepareQuestionAudio`，两条链路共用；直连也遵守答题间隔与取消信号，
  并带上 30 天内存缓存（刷新页面失效）。

**测试**

- 新增 `direct_mode_test.mjs`（纯 Node，`node direct_mode_test.mjs`）：从脚本里切出直连源码，注入假
  `GM_xmlhttpRequest` 后跑真实的提示词/SSE/吸附/仲裁，66 项断言全通过（含取消传播、宽限掐慢路、仲裁失败回退、
  中文题型归一化）。
- `ui_smoke.py` 扩到 11 项：新增端点编辑与持久化、刷新后不被覆盖、端点复位后模型列表重认、模式切换、直连模型列表来自上游
  `/v1/models`；同时把「种配置」改成 `if (!localStorage...)` 以便验证刷新行为，HTTPS 校验位从 2 处更新到 3 处。

**代码审查后修复**

- 智慧树（zhs）题目的 `type` 是中文（`"判断题"`/`"多选题"`…），而代理与直连都按 `"3"`/`"1"` 这类代码判断，
  导致智慧树判断题被当成单选题处理。脚本新增 `normalizeQuestionType`，两条链路发请求前统一归一化。
- `CPA_MODEL_ALLOWLIST` 此前只拦请求、不按白名单过滤列表：面板会列出选了就被拒的模型。现在 `/models` 按白名单过滤；
  且白名单未包含 `CPA_MODEL` 时，「服务端默认」自动落到白名单第一项（`resolve_model(None)` 与
  `effective_default_model()` 用同一套逻辑），不会再自我拒绝或凭空补一个上游没有的模型。
- 清理：删掉未使用的 `DIRECT_RETRY_PAUSE`、`_hoisted_mode_group`；直连每次尝试改用「剩余预算」当超时，
  仲裁那一路不再可能跑过整题墙钟。

### 状态

- 本地：`node direct_mode_test.mjs` 66/66、`python contract_test.py` 29/29、`python e2e_smoke.py` 3/3、
  `python ui_smoke.py` 11/11 通过（均离线，未连生产 CPA）。
- 尚未部署；直连模式尚未在真实超星页面上点验（UI 冒烟用的是本地 fixture 页与假上游）。

---

## [Unreleased] 2026-11-16 — 模型可从上游拉取并在脚本面板选择

### 背景

模型此前写死在服务端 `CPA_MODEL`，换模型要改 `.env` 重启；脚本面板只能填密钥，无法按题选模型。
上游 CPA 本身有 `/v1/models`，但面板拿不到列表，用户也无从确认自己有权用哪些模型。

### 改动

**`upstream.py`**

- 新增 `resolve_model`：请求里带 `model` 就用它，留空回退 `CPA_MODEL`；`CPA_MODEL_ALLOWLIST` 非空时只认白名单内的值（大小写不敏感），白名单外的模型直接 `PermissionError`，不打上游。
- 新增 `fetch_models` / `_parse_model_list` / `reset_model_cache`：拉取上游 `GET {CPA_BASE_URL}/models`，归一化 `models/` 前缀、重复项、裸字符串等返回形态，按 `MODEL_LIST_TTL`（默认 300s）缓存；服务端默认模型不在列表时补在最前面。
- `call_cpa` 新增 `model` 参数并透传给 payload；新增 `UnsupportedParam`：当上游以 400 明确拒绝 `reasoning_effort`（非思考模型）时摘掉该字段自动重试一次，且这次降级重试不占 `CPA_RETRIES` 预算。

**`server.py`**

- `SearchRequest` 新增 `model` 字段；缓存 key 改为 `sha256(model + type + stem + options + audio)` —— 换模型重做不会命中别的模型的缓存。
- 新增 `GET /api/open/v1/models`（`ModelsResponse`：`success/default/models/error`），`refresh=1` 强制回源；鉴权/上游失败返回 `success:false` 信封而非 500。
- 单路、双路复核与第 3 路仲裁三处调用统一透传所选模型；模型不在白名单时返回「所选模型不可用」。

**脚本 `tangwg学习通.user.js`**

- 新增 `fetchModels()` 走 `GM_xmlhttpRequest` 拉取 `GET /api/open/v1/models?refresh=1`，失败只提示不阻塞。
- 答题面板密钥框下新增模型下拉（可筛选、可清空）与「刷新」按钮，首项为「服务端默认（模型名）」；配置存于 `queryApis[0].model`，`defaultConfig` 增加空默认值（老配置由 `mergeByLatestFields` 自动补键）。
- 搜题请求体仅在选择非空时带 `model`，避免无谓改变旧行为；选中的模型若已不在列表仍会展示并标「不在当前列表」。

**测试**

- `contract_test.py` 新增 5 项：上游模型列表拉取归一、按请求指定模型、跨模型缓存隔离、白名单拦截、思考强度自动降级；全量 **27/27 本地通过**。
- 新增 `e2e_smoke.py`：真起 uvicorn + 本地假上游，验证 `/models` 与指定模型/默认模型两条搜题链路，3/3 通过。
- 新增 `ui_smoke.py`：真 Chrome（Playwright）里装载脚本，验证面板渲染、下拉选项来自上游、选择后写回 `queryApis[0].model`，4/4 通过。依赖本地前端包（`UI_DEPS_DIR`），仅测试用替换 shadow root 的 `closed` 模式与 HTTPS 校验，不改仓库文件。

### 状态

- 本地：`python contract_test.py` 27/27、`python e2e_smoke.py` 3/3、`python ui_smoke.py` 4/4 通过（均离线，未连生产 CPA）。
- 尚未部署；脚本改动尚未在真实超星页面上点验（UI 冒烟用的是本地 fixture 页）。

---

## [Unreleased] 2026-11-13 — 修复保活间隙超时漂移、双路慢路拖死与思考强度失控，并拆分上游模块

### 背景

2026-11-13 凌晨 02:27 ~ 02:54，上游节点控制台再度出现 11 条 `499 客户端取消 已结束`
（`model=gemini-3.8-flash-high`、`stream=1`），全部耗时精确卡在 `90.00s` 左右，
tiku-proxy 同刻报 `UpstreamTimeout: 读取上游响应超过单次预算`（总预算 80s 竟提示"剩余 -10.0s"）。

### 根因

1. **保活间隙超时漂移（80s 漂移成 90s）**：`_collect_stream_text` 只在 `async for line in resp.aiter_lines():`
   收到下一行数据时才检查 `time.monotonic() > stop_at`。CPA 每 15s 发一帧 `: keep-alive`（15/30/45/60/75/90s），
   80s 截止点在 75s 时未超时，协程挂起等到 90.00s 第 6 帧保活到达才被唤醒报错，正好撞穿油猴脚本 90s 硬超时。
2. **双路并行慢路拖死快路**：11 次超时里有 8 次另一路其实已在 `2.9s~3.8s` 成功返回有效答案，但 `asyncio.gather`
   死等卡在 Google 拥堵分桶（`gemini-3.8-flash-n/k/p/q`）上的另一路拖满 90s，导致已到手的答案陪葬。
3. **默认 high 思考叠加夜间分桶拥堵**：请求体未显式传 `reasoning_effort`，`gemini-3.8-flash-high` 走默认 `high` 思考，
   拥堵账号单题静默思考动辄 30~90+s。
4. **`server.py` 逼近 800 行预警线**：原 782 行需按规范拆出上游调用层。

### 改动

**`upstream.py`（新拆上游调用层，427 行）**

- 从 `server.py` 抽离上游配置、提示词组装（`SYSTEM_PROMPT`/`TYPE_NAMES`/`build_prompt`/`build_arbitrate_prompt`）、
  `AudioData`/`UpstreamTimeout`、流式读取、`call_cpa`、双路调度 `run_dual_calls` 与 `extract_values`。
- **硬墙钟超时**：`call_cpa` 用 `asyncio.wait_for(..., timeout=budget)` 包裹整次尝试（含建连与 SSE 读取），
  预算一到立即取消流并抛出 `UpstreamTimeout`，不再受 15s keep-alive 帧间隔拖延；修复 `remaining <= 1.0` 对短预算的误截断（改为 `0.05s`）。
- **双路协同宽限 `run_dual_calls`**：改用 `FIRST_COMPLETED` 监听两路；若首路拿到有效匹配答案（`is_valid` 校验通过）
  且启用仲裁恢复，只再等副路 `CPA_PAIR_GRACE`（默认 20s，听力 `CPA_AUDIO_PAIR_GRACE` 默认 35s），超时即取消慢路，
  在剩余预算充足时转入第 3 路或保底回退；若首路未拿到有效答案或关闭了仲裁，仍完整等到总预算以免误杀慢路。
- **思考强度分层与预算留余**：新增 `CPA_REASONING_EFFORT`（默认 `low`，双路靠共识保准确率）与
  `CPA_ARBITRATE_REASONING_EFFORT`（默认 `medium`，仅分歧终审加深思考），设为空串即可不传；
  单次与总预算默认收紧为普通 `75s`（客户端 90s）/ 听力 `160s`（客户端 180s），新增 `CPA_MIN_ARBITRATE_BUDGET=12`
  避免剩余时间不足时仍发起注定超时的第 3 路调用。

**`server.py`（瘦身至 532 行）**

- 改为调用 `upstream.call_cpa`、`upstream.run_dual_calls`、`upstream.build_arbitrate_prompt`，并保留原公开符号重导出以兼容现有调用与测试。
- 第 3 路仲裁补充透传 `CPA_ARBITRATE_REASONING_EFFORT`，并单独透传 `PermissionError` 鉴权错误。

**`contract_test.py` / `.env.example` / `deploy.sh` / `README.md`**

- `contract_test.py` 新增 6 项离线契约与时序测试（SSE 流式解析与 `reasoning_content` 隔离、`reasoning_effort` 透传与空串省略、
  `0.4s` 保活间隙下 `0.55s` 硬墙钟截断、慢路宽限转仲裁、慢路与仲裁双卡死保底回退、首路无效不误杀副路），全量 **22/22 本地通过**。
- `.env.example`、`deploy.sh`、`README.md` 同步新环境变量与 `upstream.py` 部署提示。

### 状态

- 本地契约与时序测试：`python contract_test.py` 22/22 通过（使用 `httpx.MockTransport` 离线模拟，未联网、未实连生产 CPA）。
- 生产部署：尚未 commit/push，尚未同步至上游生产节点。

---

## [Unreleased] 2026-11-11 — 修掉 CPA 侧 499 client_closed 尖刺

### 背景

生产上游节点在 2026-11-10 23:54 ~ 11-11 00:13 出现 14 条 499，
全部 `latency_ms = 85.00~85.01s`、`error_type=client_closed`、`error_body=context canceled`、
`model=gemini-3.8-flash-high`、`client_ip=127.0.0.1`（本机回环）、`POST /v1/chat/completions`、
`stream=0`。逐条与 tiku-proxy 的 journald `ReadTimeout` 时间戳完全对齐。

结论：**不是 CPA 故障，也不是 nginx 掐断**，是本服务自己的 httpx 读超时掐的连接。

### 根因

1. 本服务用**非流式** `/v1/chat/completions` 调 CPA，CPA 内部对应 antigravity 执行器的
   `operation="generate"` 路径。该路径比 `operation="generate_stream"` 实测慢约 34%
   （东京机 A/B 实测：非流式总耗时 p50 25.71s vs 流式 p50 19.13s），尾延迟也更容易撞顶。
2. CPA 侧其实早已配好 SSE 保活（`streaming.keepalive-seconds: 15` +
   `send-keepalive-before-ft: true`，2026-11-05 加的），但**保活帧只在流式响应里发**，
   非流式请求一个字节都收不到，慢的时候只能干等到超时。
3. `CPA_TIMEOUT=85` 是 httpx 硬超时，超时即断连 → CPA 记 499。
4. `CPA_RETRIES=1`，慢失败不重试，5 道题彻底答不出来（用户侧报「题库服务暂时不可用」）。

数据佐证：72h 内 `stream=0` + gemini 的成功请求最大耗时 84.4s（0 条越过 85s，分布被硬顶截断）；
同期 `stream=1` 的 13501 次成功请求 TTFT 最大 156.8s、零卡死。

### 改动

**`server.py`**

- `call_cpa` 改走**流式**：payload 加 `stream: true`，用 `client.stream()` + 新增
  `_collect_stream_text()` 解析 SSE（`data:` 帧累积 `choices[0].delta.content`；
  `: keep-alive` 注释帧忽略；`data: [DONE]` 结束）。
  上游若忽略 `stream=true` 返回一次性 JSON，自动回退到原 JSON 解析路径。
- 新增 `UpstreamTimeout` 异常类型与分层超时模型：
  - `CPA_READ_TIMEOUT`（默认 30s）单次 socket 读超时，必须 > CPA 的 keepalive 间隔 15s；
  - `CPA_TIMEOUT` / `CPA_AUDIO_TIMEOUT` 单次尝试墙钟预算；
  - `CPA_TOTAL_BUDGET`（默认 80s）/ `CPA_AUDIO_TOTAL_BUDGET`（默认 170s）
    是**整次搜题**的总墙钟预算，双路并行与第三路仲裁共享；
    预算值必须小于油猴脚本的客户端超时（普通 90s / 听力 180s，见
    `tangwg学习通.user.js` 的 `requestTimeout`），否则服务端还在跑、客户端先放弃 → nginx 记 499。
- 第三路仲裁前检查剩余预算，不够就跳过（宁可回退到单路答案，也不拖过客户端超时）。
- 重试策略收紧：**只在快速失败（耗时 < 单次预算一半）时重试**，慢失败不再重试，
  避免把预算再烧一遍还压垮上游。
- `CPA_STREAM` 开关保留，可随时退回非流式（无需改代码）。

**`.env.example`** — 同步新契约，并修正原先"CPA_TIMEOUT=6 / 客户端 15s"的过期说明。

### 验证

- `contract_test.py` 本地 16/16 全通过（含缓存命中、双AI分歧→第3路仲裁、听力 input_audio 格式）。
- 上游节点用真实 CPA 流式响应跑 live test：流式解析 4.63s 正确抽出选项；
  端到端 `search()` 12.87s 双AI一致；预算耗尽 0.00s 优雅失败不挂死。
- 生产部署后端到端（nginx 443 → tiku-proxy → CPA → antigravity）：HTTP 200，
  双AI复核通过，答案正确；CPA 日志确认上游路径已从 `operation="generate"` 变为
  `operation="generate_stream"`，零 499。
- **CPA 容器全程未重启**（`StartedAt` 保持 `2026-11-09T08:29:58Z`），只重启了 tiku-proxy。

### 回滚

```bash
cp /opt/tiku-proxy/server.py.bak-<时间戳> /opt/tiku-proxy/server.py
cp /opt/tiku-proxy/.env.bak-<时间戳>      /opt/tiku-proxy/.env
systemctl restart tiku-proxy
```

或只回滚行为不改代码：把生产 `.env` 的 `CPA_STREAM` 改成 `false` 后重启。

### 遗留

- `server.py` 现 782 行，已超 AGENTS.md §2.8 建议的 300~500 行健康区间（改前 656 行），
  逼近 800 行重构预警线。下一步应把「上游调用层」拆成独立模块。
