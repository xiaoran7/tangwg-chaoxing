# 题库代理 —— 使用说明

把「网课小助手」的搜题请求从 `search.tikuhai.com` 换到你的服务器，上游接 CPA（OpenAI 兼容）。

## 架构

```
油猴脚本 ──POST /api/open/v1/search/exact──▶ 你的服务器(境内,已备案) ──▶ CPA /v1/chat/completions
         {stem, options, type}                缓存 + 重试 + 选项吸附      解析 → 吸附 → 缓存
```

也可以不部署：脚本面板只填一个上游地址（以 `/v1` 结尾）时，浏览器直接打 CPA 的 `/v1/chat/completions`，双路复核与仲裁在脚本里做。

客户端不感知后端换成 LLM：契约保持一致，脚本侧只改了三处地址。

## 一、部署

```bash
cd /opt/tiku-proxy && bash deploy.sh
```

或手动按 `deploy.sh` 的注释逐步执行。要点：

- uvicorn 只听 `127.0.0.1:8000`，TLS 由 nginx 终止 —— 证书不进应用层
- systemd 里 `ProtectSystem=strict` + `ReadWritePaths=/var/lib/tiku-proxy`，只有缓存目录可写
- `.env` 权限 600，只在 `EnvironmentFile` 里读，不进代码仓库

## 二、域名

`.env`、`nginx.conf`、脚本三处都要换成同一个域名：

| 位置 | 字段 |
|---|---|
| `proxy/.env` | `CPA_BASE_URL`（这是 CPA 的地址，不是你的） |
| `proxy/nginx.conf` | `server_name` × 2、证书路径 × 2 |
| 脚本 `@connect` | `tiku.example.com` |

签发证书：

```bash
sudo certbot certonly --webroot -w /var/www/html -d tiku.example.com
```

## 三、脚本侧已改的两处

1. **`@connect` 加你的域名**（或直接用现有的 `@connect *`）—— 不加会被 Tampermonkey 静默拦掉，只显示「请求出错」
2. **答题面板顶部填端点** —— 脚本里**没有内置地址**，端点和密钥默认都是空串，只读浏览器缓存（`localStorage` + GM 存储）。

端点只有这一个输入框，链路由地址形态决定：

| 你填的地址 | 走的链路 |
|---|---|
| `https://tiku.example.com`（站点根地址，可带路径） | 自建代理的 `/api/open/v1/search/exact` |
| `https://cpa.example.com/v1`（以 `/v1` 结尾） | 直连上游的 `/v1/chat/completions` |

填入后立刻写进配置，刷新页面不会被覆盖回任何内置值。公告通道也复用这个端点（`/def/notice`），不再单独硬编码域名，也不再向第三方外传 referer / 站内 UID。

### 密钥

在脚本「答题」页的密钥输入框填你 `.env` 里的 `PROXY_TOKEN`（留空则不校验）。老用户本地还存着旧的卡密，记得清一次。

## 三点五、不想部署？直连上游

端点填成上游 base（如 `https://cpa.example.com/v1`）后，脚本自己请求 OpenAI 兼容上游（CPA 等），不走代理：

| 字段 | 填什么 |
|---|---|
| 端点 | 上游 base，如 `https://cpa.example.com/v1`（只填到域名也行，自动补 `/v1`） |
| 密钥 | 上游的 API Key，直接进 `Authorization: Bearer` |
| 模型 | 点「刷新」从上游 `/v1/models` 拉列表后选一个（直连必须选，没有服务端默认兜底） |

行为对齐代理：同样的系统提示词、同样的选项吸附（阈值 85 / 裸字母还原）、同样双路复核（0.0 与 0.3 两路）与分歧时第 3 路仲裁、同样的 20s（听力 35s）副路宽限与预算不足跳过仲裁。右侧「双路／单路」按钮可以关掉复核省一半开销，但关掉后不再有共识与仲裁保护。

直连的取舍（这也是代理存在的理由）：

- **没有共享缓存** —— 只有本页内存缓存，刷新页面即失效
- **没有 keep-alive 帧与硬墙钟兜底** —— 靠 `GM_xmlhttpRequest` 超时（普通 110s / 听力 200s）
- **密钥在浏览器里** —— 面板存在 `localStorage`，不适合多人共用
- **上游必须能被浏览器直连** —— 自签证书、只允许服务端 IP 的上游都用不了

## 四、代理层做了什么

| 关注点 | 处理 |
|---|---|
| 双AI独立复核 | 并行双采样（贪婪温控0.0 + 采样温控0.3，默认 `reasoning_effort=low`），首路拿到有效答案后最多再等副路 20s（听力 35s），防止单路卡死拖垮整题 |
| 分歧仲裁裁决 | 两次结果出现分歧（或副路宽限超时）时，在剩余预算充足的前提下自动启动命题裁判（`reasoning_effort=medium`）裁决；预算不足则直接回退可用单路答案 |
| 硬墙钟超时控制 | 服务端硬墙钟预算 75s（听力 160s），严格低于客户端 90s（听力 180s），外层 `asyncio.wait_for` 截断，不受 SSE `: keep-alive` 间隙影响 |
| 答案对不上选项 | `snap_to_options` 把模型输出吸附回选项原文，相似度 <85 或无匹配 → 判失败 |
| 花钱 | SQLite 缓存，key = sha256(model + type + stem + options)，TTL 30 天 —— 换模型重做不会被别的模型的缓存顶掉 |
| 模型可选 | 脚本答题面板的下拉框从 `GET /api/open/v1/models` 拉取 CPA 的可用模型；每次搜题把所选 `model` 透传上游，留空则用服务端 `CPA_MODEL`。`CPA_MODEL_ALLOWLIST` 可把可选范围锁死 |
| 端点可改 | 面板只有一个端点输入框：站点地址走自建代理，`/v1` 结尾直连上游；地址、密钥、模型都在面板里改并存进配置，不用改源码重新安装 |
| 听力音频可选链路 | 面板提供「大模型直听」与「STT 转文字」切换（配问号说明）：前者直接传 `input_audio`，后者自动适配 **OpenAI `/v1/audio/transcriptions`**（硅基流动 / Groq / 自建 Whisper）与 **Deepgram REST `/v1/listen`**（`nova-3` 等，不支持 `ws/wss` 流式端点），转成文字稿按音频哈希缓存后喂给任意纯文本模型；两者的回答缓存也互相隔离 |
| 模型不听话 | 提示词强制「原样复制选项」+ 容忍 ```` ```json ```` 包裹和裸 JSON |
| 幻觉 | 判断题统一收敛并语义匹配选项，绝不改写 |
| 不可用 | 上游挂了或复核未决就返回 `success:false`，脚本安全降级为手动，绝不乱选 |

## 五、调试

```bash
# 健康检查
curl https://tiku.example.com/health

# 可用模型列表（面板下拉框的数据源，refresh=1 强制回源）
curl 'https://tiku.example.com/api/open/v1/models?refresh=1' -H 'X-Consumer-Token: 你的PROXY_TOKEN'

# 指定模型搜题（不带 model 则用服务端 CPA_MODEL）
curl -X POST https://tiku.example.com/api/open/v1/search/exact \
  -H 'Content-Type: application/json' \
  -H 'X-Consumer-Token: 你的PROXY_TOKEN' \
  -d '{"stem":"【单选题】资本主义社会的基本矛盾是（  ）","options":["生产力与生产关系的矛盾","经济基础与上层建筑的矛盾"],"type":"0","model":"gpt-4o-mini"}'

# 抓脚本发出的真实请求（替换成你的域名）
sudo tail -f /var/log/tiku-proxy.log   # 若要日志，改 deploy.sh 的 ExecStart 加 --log-level info
```

**排查顺序**：界面提示「请先填写端点」→ 面板端点还是空串，填一个；显示「请求出错」→ 先查 `@connect`；显示「题库鉴权失败」→ 查 `PROXY_TOKEN`（直连则是上游 API Key）；显示「题库未返回可用答案」→ 答案没吸附上选项，看服务端日志的「答案对不上选项」；模型下拉框为空或提示拉取失败 → 查端点是否可达、密钥是否有权访问该模型。直连的所有请求都从浏览器发出，上游必须能被 `GM_xmlhttpRequest` 直连，且 `@connect *` 已覆盖。

## 六、已知限制

- **CORS 不用配** —— 脚本走 `GM_xmlhttpRequest`，不受同源策略约束
- **别配 301/302** —— 重定向后最终 URL 也要在 `@connect` 白名单里，容易踩间歇性失败
- **字体反加密仍依赖 `forestpolice.org/ttf/2.0/table.json`** —— 跟题库无关，AI 替代不了；那张表挂了超星作业题干解不开
- **公告是纯文本** —— 会被 `innerHTML` 渲染，别放不可信 HTML
- **一次一题** —— 作业页是串行 N 题 = N 次请求，没做批处理
