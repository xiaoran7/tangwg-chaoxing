// ==UserScript==
// @name         tangwg学习通（超星学习通｜知到智慧树 AI 答题与听力 STT 助手）
// @namespace    noshuang
// @version      0.9.0
// @author       tangwg
// @description  超星学习通、知到智慧树网课辅助脚本：支持免部署直连 OpenAI 兼容大模型与自建题库代理、Deepgram/Whisper STT 英语听力转文字、Flash 模型自动 High 思考强度、双路 AI 复核与第 3 路仲裁
// @homepageURL  https://github.com/xiaoran7/tangwg-chaoxing
// @supportURL   https://github.com/xiaoran7/tangwg-chaoxing/issues
// @license      MIT
// @icon         data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext x='50' y='54' text-anchor='middle' dominant-baseline='central' font-size='82' font-family='Apple Color Emoji,Segoe UI Emoji,Noto Color Emoji,sans-serif'%3E%F0%9F%92%AF%3C/text%3E%3C/svg%3E
// @match        *://*.chaoxing.com/*
// @match        *://*.edu.cn/*
// @match        *://*.nbdlib.cn/*
// @match         *://*.hnsyu.net/*
// @match        *://*.gdhkmooc.com/*
// @match        *://*.zhihuishu.com/*
// @require      https://lib.baomitu.com/vue/3.4.31/vue.global.prod.js
// @require      https://lib.baomitu.com/vue-demi/0.14.7/index.iife.js
// @require      data:application/javascript,window.Vue%3DVue%3B
// @require      https://lib.baomitu.com/element-plus/2.7.2/index.full.min.js
// @require      https://lib.baomitu.com/pinia/2.3.1/pinia.iife.min.js
// @require      https://lib.baomitu.com/rxjs/7.8.2/rxjs.umd.min.js
// @require      https://lib.baomitu.com/blueimp-md5/2.19.0/js/md5.min.js
// @resource     ElementPlus       https://lib.baomitu.com/element-plus/2.7.2/index.css
// @resource     ElementPlusStyle  https://lib.baomitu.com/element-plus/2.8.2/index.min.css
// @resource     ttf               https://www.forestpolice.org/ttf/2.0/table.json
// @connect      cs-ans.chaoxing.com
// @connect      *.chaoxing.com
// @connect      chaoxing.com
// @connect      *.ananas.chaoxing.com
// @connect      *.xuexitong.com
// @connect      xuexitong.com
// @connect      *.zhihuishu.com
// @connect      zhihuishu.com
// @connect      cx.icodef.com
// @connect      www.forestpolice.org
// @connect      lib.baomitu.com
// @connect      *
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM_getValue
// @grant        GM_info
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

(e=>{if(typeof GM_addStyle=="function"){GM_addStyle(e);return}const i=document.createElement("style");i.textContent=e,document.head.append(i)})(' .main-page .guide-page{box-sizing:border-box;max-height:min(400px,calc(100vh - 160px));max-height:min(400px,calc(100dvh - 160px));overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;padding:2px 4px 2px 0;color:#4e5969;font-size:12px;line-height:1.7;scrollbar-width:thin;scrollbar-color:#c7d7eb transparent}.main-page .guide-page:focus-visible{outline:2px solid #176ae5;outline-offset:2px;border-radius:8px}.main-page .guide-header{margin:0 0 10px;padding:11px 12px;border:1px solid #d9e8fc;border-radius:9px;background:linear-gradient(120deg,#edf5ff 0%,#f8fbff 100%)}.main-page .guide-heading-row{display:flex;align-items:center;justify-content:space-between;gap:8px}.main-page .guide-title{margin:0;color:#174b94;font-size:13px;font-weight:600;line-height:1.6}.main-page .guide-tag{flex-shrink:0;padding:1px 7px;border:1px solid #d4e5fc;border-radius:20px;background-color:#fff;color:#2262b5;font-size:10px;line-height:18px}.main-page .guide-subtitle{margin:3px 0 0;color:#61758e;font-size:11px}.main-page .guide-list{display:grid;gap:8px;margin:0;padding:0;list-style:none}.main-page .guide-card{min-width:0;padding:10px;border:1px solid #e4eaf2;border-radius:8px;background-color:#fff}.main-page .guide-card-heading{display:flex;align-items:center;gap:8px;margin-bottom:6px}.main-page .guide-number{display:inline-flex;align-items:center;justify-content:center;flex:0 0 24px;height:24px;border-radius:7px;background-color:#eaf3ff;color:#176ae5;font-size:11px;font-weight:600;line-height:1;font-variant-numeric:tabular-nums}.main-page .guide-card-title{margin:0;color:#263a55;font-size:12px;font-weight:600;line-height:1.6}.main-page .guide-copy{margin:0;overflow-wrap:anywhere}.main-page .guide-flow{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;margin:10px 0 0;padding:9px 4px 7px;border-radius:7px;background-color:#f3f7fd;list-style:none}.main-page .guide-flow-step{position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;color:#3a5a83;font-size:10px;line-height:18px;text-align:center}.main-page .guide-flow-step+.guide-flow-step:before{position:absolute;top:8px;left:-5px;width:5px;height:5px;border-top:1px solid #9cb8da;border-right:1px solid #9cb8da;content:"";transform:rotate(45deg)}.main-page .guide-flow-number{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border:1px solid #d5e4f8;border-radius:50%;background-color:#fff;color:#176ae5;font-size:11px;font-weight:600;line-height:1}.main-page{--app-font-family: "Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";--el-font-family: var(--app-font-family);z-index:100003;position:fixed;color:#1f2329;font-family:var(--app-font-family)!important;font-size:14px;line-height:1.5715;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}.main-page *,.main-page input,.main-page button,.main-page textarea{font-family:var(--app-font-family)!important;letter-spacing:0}.main-page .el-card,.main-page .el-tabs,.main-page .el-text,.main-page .el-button,.main-page .el-input,.main-page .el-input__inner,.main-page .el-input-number,.main-page .el-table{font-family:var(--app-font-family)!important}.main-page .overlay{position:fixed;top:0;left:0;right:0;bottom:0;z-index:1001}.main-page .el-card{border:0}.main-page .card-header{display:flex;justify-content:space-between;flex-direction:row;align-items:center;margin:0;padding:0;cursor:move}.main-page .card-header .title{font-size:14px;display:flex;align-items:center;justify-content:center;font-weight:500}.main-page .warning-icon{margin-left:5px}.main-page .zoom-icon{cursor:pointer}.main-page .zoom-icon.is-spaced{margin-left:8px}.main-page .minus{margin:5px 10px -10px 0}.main-page .compact-divider{margin:0}.main-page .demo-tabs{display:initial}.main-page .el-card__header{background-color:#1f71e0;color:#fff;padding:7px 10px 7px 16px;margin:0}.main-page .el-card__body{padding:0 16px 20px}.main-page .el-tabs__nav-wrap:after{height:1px}.main-page .el-tabs__active-bar{background-color:#176ae5}.main-page .el-tabs__item{font-size:13px;height:34px}.main-page .el-tabs__item.is-top{font-weight:400;color:#4e5969;padding:0 8px 0 12px}.main-page .el-tabs__item.is-active{font-weight:500;color:#176ae5;padding:0 8px 0 12px}.main-page .script-home{padding-top:2px}.main-page .announcement-board{box-sizing:border-box;margin:2px 0 10px;padding:8px 10px;border:1px solid #bae0ff;border-radius:6px;background-color:#e6f4ff}.main-page .announcement-heading{display:flex;align-items:center;gap:6px;margin-bottom:4px;color:#0958d9;font-size:12px;font-weight:600;line-height:20px}.main-page .announcement-heading:before{content:"";width:6px;height:6px;flex:0 0 auto;border-radius:50%;background-color:#1677ff}.main-page .announcement-list{display:grid;gap:3px;margin:0;padding:0;list-style:none}.main-page .announcement-item{color:#1f2329;font-size:12px;line-height:20px;word-break:break-word}.main-page .log .el-text{font-weight:400;white-space:normal}.main-page .log-time{font-weight:400}.main-page .log-action-link{color:#176ae5;cursor:pointer;text-decoration:none}.main-page .log-action-link:hover{color:#409eff;text-decoration:underline}.main-page .log-divider{margin:0}.main-page .token-input,.main-page .question-list{font-size:12px}.main-page .token-label{border-radius:0}.main-page .model-row{display:flex;align-items:center;gap:6px;margin:6px 0 8px}.main-page .model-select{min-width:0;font-size:12px}.main-page .model-refresh{flex:0 0 auto}.main-page .endpoint-row{display:flex;align-items:center;gap:6px;margin:2px 0 8px}.main-page .endpoint-input{flex:1 1 auto;min-width:0;font-size:12px}.main-page .direct-check-toggle{flex:0 0 auto}.main-page .question_table{width:625px}.main-page .answer-legend{display:flex;flex-wrap:wrap;align-items:center;gap:6px 16px;padding:10px 2px 8px;font-size:11px;line-height:18px}.main-page .answer-legend>span{display:inline-flex;align-items:center;gap:5px}.main-page .answer-legend>span:before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor}.main-page .answer-result{line-height:1.7;overflow-wrap:anywhere}.main-page .answer-result--success{color:#15803d}.main-page .answer-result--searching{color:#a15c08}.main-page .answer-result--pending{color:#697586}.main-page .answer-result--error{color:#c73e38}.main-page .setting{margin-top:-8px;font-size:14px}.main-page .setting-section-title{font-size:13px}.main-page .setting-checkbox{margin-bottom:6px}.main-page .setting-number{margin-top:6px}.main-page .setting .el-form-item{margin-bottom:0}.main-page .audio-mode-row{display:flex;align-items:center;gap:8px;margin:0 0 8px;flex-wrap:wrap}.main-page .audio-mode-label{font-size:12px;color:#4e5969;white-space:nowrap}.main-page .help-icon{display:inline-flex;align-items:center;justify-content:center;color:#86909c;cursor:help;vertical-align:middle;transition:color .15s}.main-page .help-icon:hover{color:#176ae5}.main-page .stt-panel{margin:0 0 8px;padding:8px 10px;border:1px dashed #cfd9e6;border-radius:6px;background-color:#f7f9fc}.main-page .stt-panel-header{display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:6px}.main-page .stt-panel-title{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;color:#263a55}.main-page .stt-panel .endpoint-row{margin:0 0 6px}.main-page .stt-panel .token-input{margin:0 0 6px}.main-page .stt-panel .model-row{margin:0}.main-page .stt-protocol-badge{font-size:11px;line-height:16px;padding:1px 6px;border-radius:4px;white-space:nowrap}.main-page .stt-protocol-badge--muted{color:#61758e;background:#eef3fa}.main-page .stt-protocol-badge--ok{color:#15803d;background:#eaf7ee}.main-page .stt-protocol-badge--warn{color:#c73e38;background:#fef1f0}.main-page .reasoning-effort-badge{font-size:11px;line-height:16px;padding:1px 6px;border-radius:4px;white-space:nowrap;color:#15803d;background:#eaf7ee} ');

(function (vue, pinia, rxjs, md5, ElementPlus) {
  'use strict';

  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };
  /*! Element Plus Icons Vue v2.3.2 */
  var _sfc_main118 = /* @__PURE__ */ vue.defineComponent({
    name: "FullScreen",
    __name: "full-screen",
    setup(__props) {
      return (_ctx, _cache) => (vue.openBlock(), vue.createElementBlock("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 1024 1024"
      }, [
        vue.createElementVNode("path", {
          fill: "currentColor",
          d: "m160 96.064 192 .192a32 32 0 0 1 0 64l-192-.192V352a32 32 0 0 1-64 0V96h64zm0 831.872V928H96V672a32 32 0 1 1 64 0v191.936l192-.192a32 32 0 1 1 0 64zM864 96.064V96h64v256a32 32 0 1 1-64 0V160.064l-192 .192a32 32 0 1 1 0-64zm0 831.872-192-.192a32 32 0 0 1 0-64l192 .192V672a32 32 0 1 1 64 0v256h-64z"
        })
      ]));
    }
  }), full_screen_default = _sfc_main118;
  var _sfc_main169 = /* @__PURE__ */ vue.defineComponent({
    name: "Minus",
    __name: "minus",
    setup(__props) {
      return (_ctx, _cache) => (vue.openBlock(), vue.createElementBlock("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 1024 1024"
      }, [
        vue.createElementVNode("path", {
          fill: "currentColor",
          d: "M128 544h768a32 32 0 1 0 0-64H128a32 32 0 0 0 0 64"
        })
      ]));
    }
  }), minus_default = _sfc_main169;
  var _sfc_main288 = /* @__PURE__ */ vue.defineComponent({
    name: "Warning",
    __name: "warning",
    setup(__props) {
      return (_ctx, _cache) => (vue.openBlock(), vue.createElementBlock("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 1024 1024"
      }, [
        vue.createElementVNode("path", {
          fill: "currentColor",
          d: "M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896m0 832a384 384 0 0 0 0-768 384 384 0 0 0 0 768m48-176a48 48 0 1 1-96 0 48 48 0 0 1 96 0m-48-464a32 32 0 0 1 32 32v288a32 32 0 0 1-64 0V288a32 32 0 0 1 32-32"
        })
      ]));
    }
  }), warning_default = _sfc_main288;
  var _sfc_main_help = /* @__PURE__ */ vue.defineComponent({
    name: "QuestionFilled",
    __name: "question-filled",
    setup(__props) {
      return (_ctx, _cache) => (vue.openBlock(), vue.createElementBlock("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 1024 1024"
      }, [
        vue.createElementVNode("path", {
          fill: "currentColor",
          d: "M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896m23.744 191.488c-52.096 0-92.928 14.784-123.2 44.352-30.976 29.568-45.76 70.4-45.76 122.496h80.256c0-29.568 5.632-52.8 17.6-68.992 13.376-19.712 35.2-28.864 66.176-28.864 23.936 0 42.944 6.336 56.32 19.712 12.672 13.376 19.712 31.68 19.712 54.912 0 17.6-6.336 34.496-19.008 49.984l-8.448 9.856c-45.76 40.832-73.216 70.4-82.368 89.408-9.856 19.008-14.08 42.24-14.08 68.992v9.856h80.96v-9.856c0-16.896 3.52-31.68 10.56-45.76 6.336-12.672 15.488-24.64 28.16-35.2 33.792-29.568 54.208-50.688 62.656-62.656 15.488-21.824 23.232-47.168 23.232-76.032 0-43.648-13.376-78.144-40.832-102.784-26.752-24.64-64.768-36.608-111.936-36.608M512 691.2a52.8 52.8 0 1 0 0 105.6 52.8 52.8 0 0 0 0-105.6"
        })
      ]));
    }
  }), question_filled_default = _sfc_main_help;
  var _GM_getResourceText = /* @__PURE__ */ (() => typeof GM_getResourceText != "undefined" ? GM_getResourceText : void 0)();
  var _GM_getValue = /* @__PURE__ */ (() => typeof GM_getValue != "undefined" ? GM_getValue : void 0)();
  var _GM_info = /* @__PURE__ */ (() => typeof GM_info != "undefined" ? GM_info : void 0)();
  var _GM_setValue = /* @__PURE__ */ (() => typeof GM_setValue != "undefined" ? GM_setValue : void 0)();
  var _GM_xmlhttpRequest = /* @__PURE__ */ (() => typeof GM_xmlhttpRequest != "undefined" ? GM_xmlhttpRequest : void 0)();
  var _unsafeWindow = /* @__PURE__ */ (() => typeof unsafeWindow != "undefined" ? unsafeWindow : void 0)();
  const getScriptInfo = () => {
    return {
      name: _GM_info.script.name,
      author: _GM_info.script.author,
      namespace: _GM_info.script.namespace,
      version: _GM_info.script.version,
      description: _GM_info.script.description
    };
  };
  const EXACT_SEARCH_PATH = "/api/open/v1/search/exact";
  // 端点和密钥都不再内置，面板留空即视为未配置。
  // 只有一个地址输入框：以 /vN 结尾视为 OpenAI 兼容上游（脚本自己直连），
  // 否则按自建代理处理——地址本身说明了走哪条链路，面板不需要「模式」开关。
  const detectApiMode = (rawUrl) =>
    /\/v\d+\/?$/i.test(String(rawUrl == null ? "" : rawUrl).trim()) ? "direct" : "proxy";
  const MODELS_PATH = "/api/open/v1/models";
  const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
  // 题型在脚本里有两种形态：超星/视频弹题给 "0"~"8" 代码，智慧树给中文名。
  // 后端与直连都只认代码，所以发请求前统一归一化，否则智慧树判断题会被当成选择题。
  const QUESTION_TYPE_CODES = {
    "单选题": "0",
    "多选题": "1",
    "填空题": "2",
    "判断题": "3",
    "简答题": "4",
    "其他": "8"
  };
  const normalizeQuestionType = (type) => {
    const raw = String(type == null ? "" : type).trim();
    if (!raw)
      return "0";
    if (QUESTION_TYPE_CODES[raw])
      return QUESTION_TYPE_CODES[raw];
    return /^[0-9]$/.test(raw) ? raw : "8";
  };
  const apiError = (message, status) => ({
    success: false,
    data: null,
    error: {
      code: status && status >= 400 ? `HTTP_${status}` : "CLIENT_ERROR",
      message,
      details: null
    },
    meta: null
  });
  const parseExactResponse = (payload, _status, _question) => {
    if (!isObject(payload) || typeof payload.success !== "boolean" || !("data" in payload) || !("error" in payload) || !("meta" in payload)) {
      return apiError("接口响应格式不正确");
    }
    return payload;
  };
  const getAnswerValues = (response, question) => {
    var _a;
    if (!response.success || !response.data || !Array.isArray(response.data.items))
      return null;
    const items = response.data.items;
    const stem = ((_a = question.searchText) == null ? void 0 : _a.stem) ?? question.title;
    const matches = items.length === 1 ? items : items.filter((item) => item.stem === stem);
    const answer = matches.length === 1 ? matches[0].answer : null;
    if (!answer || !Array.isArray(answer.values) || answer.values.length === 0)
      return null;
    if (answer.kind === "none" || answer.kind === "missing")
      return null;
    return answer.values;
  };
  function extractRawTextFromElement(element) {
    if (!element)
      return "";
    const visit = (node) => {
      if (node.nodeType === 3 || node.nodeType === 4)
        return node.nodeValue || "";
      if (node.nodeType === 11) {
        return Array.from(node.childNodes).map(visit).join("");
      }
      if (node.nodeType !== 1)
        return "";
      const current = node;
      const tag = current.tagName.toLowerCase();
      if (tag === "img") {
        const src = current.getAttribute("src");
        return src == null ? "<img>" : `<img src="${src}">`;
      }
      if (tag === "br")
        return "\n";
      if (tag === "tr")
        return Array.from(current.childNodes).map(visit).join("") + "\n";
      if (tag === "td" || tag === "th")
        return " " + Array.from(current.childNodes).map(visit).join("").trim() + " ";
      if (tag === "p" || tag === "div")
        return Array.from(current.childNodes).map(visit).join("") + "\n";
      return Array.from(current.childNodes).map(visit).join("");
    };
    return visit(element);
  }
  function extractRawTextFromHtml(html, ownerDocument) {
    if (html == null || html === "")
      return "";
    const documentRef = ownerDocument || (typeof document !== "undefined" ? document : null);
    if (!documentRef)
      return html;
    const container = documentRef.createElement("div");
    container.innerHTML = html;
    return extractRawTextFromElement(container);
  }
  function stripOptionLabel(text) {
    if (text == null)
      return "";
    return text.replace(/^\s*[A-Za-z]\s*[.．、:：\]\)]/, "");
  }
  function stripQuestionTypeLabel(text) {
    if (text == null)
      return "";
    return text.replace(/^\s*[【\[]\s*(?:(?:单选|多选|单项选择|多项选择|选择|判断|填空|简答|问答|论述|计算|分析|阅读理解|完形填空|排序|连线|其它|其他)题|名词解释)\s*[】\]]/u, "");
  }
  function extractJudgementToken(element, text = "") {
    const values = [text];
    if (element) {
      const collect = (candidate) => values.push(
        candidate.getAttribute("aria-label") || "",
        candidate.getAttribute("data") || "",
        candidate.getAttribute("data-value") || "",
        candidate.getAttribute("value") || "",
        candidate.getAttribute("title") || "",
        candidate.textContent || ""
      );
      collect(element);
      if (typeof element.querySelectorAll === "function") {
        element.querySelectorAll("[aria-label],[data],[data-value],[value],[title]").forEach(collect);
      }
    }
    const normalize2 = (value) => value.trim().toLowerCase().replace(/^[a-z0-9]+[.．、:：\]\)]\s*/i, "").replace(/[\s.．、:：()[\]{}]/g, "");
    for (const value of values) {
      const normalized = normalize2(value);
      if (/^(?:正确|是|对|√|t|true|right)$/.test(normalized) || /^(?:正确|是|对)选择$/.test(normalized))
        return "对";
      if (/^(?:错误|否|错|×|x|f|false|wrong)$/.test(normalized) || /^(?:错误|否|错)选择$/.test(normalized))
        return "错";
    }
    return "";
  }
  const VIDEO_QUIZ_INPUTS = '.ans-videoquiz-opt input[type="radio"], .ans-videoquiz-opt input[type="checkbox"], input[name="ans-videoquiz-opt"][type="radio"], input[name="ans-videoquiz-opt"][type="checkbox"]';
  const parseVideoQuiz = (root, inputs) => {
    const titles = root.querySelectorAll(".tkItem_title, .ans-videoquiz-title");
    if (titles.length !== 1 || !inputs.length || new Set(inputs.map((input) => `${input.type}:${input.name}`)).size !== 1)
      return null;
    const stem = stripQuestionTypeLabel(extractRawTextFromElement(titles[0]));
    const rows = inputs.map((input) => input.closest("label, .ans-videoquiz-opt") || input);
    const texts = rows.map((row, index) => {
      const raw = extractRawTextFromElement(row);
      const withoutLabel = stripOptionLabel(raw);
      return raw === withoutLabel ? raw.replace(new RegExp(`^\\s*${String.fromCharCode(65 + index)}\\s+(?=\\S)`), "") : withoutLabel;
    });
    if (!stem.trim() || texts.some((text) => !text.trim()))
      return null;
    const judgements = texts.map((text) => extractJudgementToken(null, text));
    const isJudgement = inputs[0].type === "radio" && texts.length === 2 && judgements.includes("对") && judgements.includes("错");
    const type = inputs[0].type === "checkbox" ? "1" : isJudgement ? "3" : "0";
    return {
      inputs,
      texts,
      judgements,
      question: {
        element: root,
        type,
        title: stem,
        options: Object.fromEntries(texts.map((text, index) => [text, rows[index]])),
        optionsText: texts,
        searchText: { stem, options: isJudgement ? judgements : texts },
        answer: [],
        answerStatus: "searching",
        workType: "video",
        refer: root.ownerDocument.URL
      }
    };
  };
  const normalize = (text, document2) => stripOptionLabel(extractRawTextFromHtml(text, document2)).replace(/<img\s+src="([^"]*)">/g, "$1").replace(/[\s\u00a0]+/g, "").toLowerCase();
  const similarity = (left, right) => {
    if (!left || !right)
      return 0;
    if (left === right)
      return 100;
    const a = Array.from(left);
    const b = Array.from(right);
    const distances = Array.from({ length: a.length + 1 }, (_, i) => i);
    b.forEach((character, row) => {
      let diagonal = distances[0];
      distances[0] = row + 1;
      a.forEach((other, column) => {
        const above = distances[column + 1];
        distances[column + 1] = character === other ? diagonal : Math.min(diagonal, above, distances[column]) + 1;
        diagonal = above;
      });
    });
    return Math.round((1 - distances[a.length] / Math.max(a.length, b.length)) * 100);
  };
  const matchVideoQuizAnswers = (parsed, answers, threshold = 85) => {
    if (!answers.length || parsed.question.type !== "1" && answers.length !== 1)
      return null;
    const document2 = parsed.question.element.ownerDocument;
    const texts = parsed.texts.map((text) => normalize(text, document2));
    const minimum = Number.isFinite(threshold) ? Math.max(0, Math.min(100, threshold)) : 85;
    const selected = /* @__PURE__ */ new Set();
    for (const answer of answers) {
      if (!["string", "number", "boolean"].includes(typeof answer))
        return null;
      const raw = String(answer).trim();
      const normalized = normalize(raw, document2);
      if (!normalized)
        return null;
      let matches;
      if (parsed.question.type === "3") {
        const token = extractJudgementToken(null, raw);
        matches = token ? parsed.judgements.flatMap((value, index) => value === token ? [index] : []) : [];
      } else {
        matches = texts.flatMap((text, index) => text === normalized ? [index] : []);
      }
      const letter = raw.match(/^([A-Z])[.．、:：\]\)]?$/i);
      if (letter) {
        const index = letter[1].toUpperCase().charCodeAt(0) - 65;
        if (index < parsed.inputs.length)
          matches = [.../* @__PURE__ */ new Set([...matches, index])];
      }
      if (!matches.length && !letter && parsed.question.type !== "3") {
        const scores = texts.map((text) => similarity(text, normalized));
        const best = Math.max(...scores);
        if (best >= minimum && best > 0)
          matches = scores.flatMap((score, index) => score === best ? [index] : []);
      }
      if (matches.length !== 1)
        return null;
      selected.add(parsed.inputs[matches[0]]);
    }
    return selected.size ? selected : null;
  };
  const applyVideoQuizAnswers = (parsed, selected, isCurrent) => {
    if (parsed.inputs.some((input) => input.disabled && input.checked !== selected.has(input)))
      return false;
    for (const input of parsed.inputs) {
      if (!isCurrent() || !input.isConnected)
        return false;
      const wanted = selected.has(input);
      if (input.checked === wanted)
        continue;
      if (input.type === "checkbox" || wanted)
        input.click();
    }
    return isCurrent() && parsed.inputs.every((input) => input.checked === selected.has(input));
  };
  const VIDEO_QUIZ_SETTING = "视频弹题自动处理";
  const OPTION_INPUTS = VIDEO_QUIZ_INPUTS;
  const visible = (element) => {
    if (!element.isConnected || !element.getClientRects().length)
      return false;
    const view = element.ownerDocument.defaultView;
    for (let current = element; current; current = current.parentElement) {
      const style2 = view == null ? void 0 : view.getComputedStyle(current);
      if (current.hidden || current.getAttribute("aria-hidden") === "true" || (style2 == null ? void 0 : style2.display) === "none" || (style2 == null ? void 0 : style2.visibility) === "hidden" || (style2 == null ? void 0 : style2.visibility) === "collapse")
        return false;
    }
    return true;
  };
  const usable = (element) => !!element && visible(element) && !element.matches(':disabled, [disabled], [aria-disabled="true"], .disabled');
  const findQuiz = (document2) => Array.from(document2.querySelectorAll(".ans-videoquiz")).find(visible);
  const questionKey = (root) => JSON.stringify([
    root.getAttribute("data-question-id"),
    Array.from(root.querySelectorAll(".tkItem_title, .ans-videoquiz-title, .ans-videoquiz-opt")).map((element) => [
      element.textContent,
      Array.from(element.querySelectorAll("img")).map((image) => image.getAttribute("src"))
    ]),
    Array.from(root.querySelectorAll(OPTION_INPUTS)).map((input) => [input.name, input.type, input.value])
  ]);
  const watchVideoQuiz = (options) => {
    const { document: document2, signal } = options;
    let state;
    let disposed = false;
    let timer2;
    let poll;
    let observer;
    const cancelPending = () => {
      if (timer2 !== void 0)
        clearTimeout(timer2);
      timer2 = void 0;
    };
    const cancelSearch = () => {
      var _a;
      const request = state == null ? void 0 : state.request;
      if (request && ((_a = state == null ? void 0 : state.question) == null ? void 0 : _a.answerStatus) === "searching" && !signal.aborted && options.isCurrent()) {
        state.question.answerStatus = "error";
        state.question.answer = ["题目已关闭或查询已取消"];
      }
      if (state)
        state.request = void 0;
      request == null ? void 0 : request.abort();
    };
    const dispose = () => {
      if (disposed)
        return;
      disposed = true;
      cancelPending();
      cancelSearch();
      if (poll !== void 0)
        clearInterval(poll);
      observer == null ? void 0 : observer.disconnect();
      document2.removeEventListener("click", trackManualClick, true);
      signal.removeEventListener("abort", dispose);
      state = void 0;
    };
    const current = () => !disposed && !signal.aborted && options.isCurrent();
    const hasActiveQuiz = () => current() && !!findQuiz(document2);
    const actionFor = (quiz) => {
      if (quiz.blocked || quiz.request)
        return;
      if (quiz.submittedAt === null && usable(quiz.root.querySelector("#videoquiz-submit")))
        return "submit";
      if (!quiz.continued && usable(quiz.root.querySelector("#videoquiz-continue")))
        return "continue";
    };
    const scan = () => {
      if (!current())
        return dispose();
      const root = findQuiz(document2);
      if (!root) {
        const released = !!state;
        cancelSearch();
        state = void 0;
        cancelPending();
        if (released)
          options.onRelease();
        return;
      }
      const key = questionKey(root);
      if (!state || state.root !== root || state.key !== key) {
        cancelPending();
        cancelSearch();
        state = { root, key, submittedAt: null, continued: false, blocked: false, warned: false };
        options.log("检测到视频弹题，将使用已配置题库搜索答案。", "primary");
      }
      if (!options.isEnabled()) {
        cancelPending();
        if (state.request && state.question) {
          state.question.answerStatus = "error";
          state.question.answer = ["已关闭视频弹题自动处理"];
        }
        return cancelSearch();
      }
      const quiz = state;
      const action = actionFor(quiz);
      if (!action) {
        if (quiz.submittedAt !== null && Date.now() - quiz.submittedAt >= 15e3 && !quiz.warned) {
          quiz.warned = true;
          options.log("视频弹题仍未关闭，请检查提交结果并手动处理；不会重复提交。", "warning");
        }
        return cancelPending();
      }
      if (timer2 !== void 0)
        return;
      const delay = options.delayMs();
      timer2 = setTimeout(async () => {
        var _a, _b, _c, _d, _e;
        timer2 = void 0;
        if (!current())
          return dispose();
        if (!options.isEnabled() || state !== quiz || findQuiz(document2) !== root || questionKey(root) !== key || actionFor(quiz) !== action)
          return scan();
        let activeRequest;
        let awaitingAnswer = false;
        try {
          if (action === "submit") {
            const inputs = Array.from(root.querySelectorAll(OPTION_INPUTS)).filter((input) => visible(input.closest(".ans-videoquiz-opt, label") || input));
            const editable = root.querySelectorAll('textarea, select, input[type="text"], input:not([type]), [contenteditable="true"]');
            const parsed = Array.from(editable).some(visible) ? null : parseVideoQuiz(root, inputs);
            if (!parsed || inputs.every((input) => input.disabled)) {
              quiz.blocked = true;
              options.log("视频弹题题干或选项无法识别，请手动作答后继续播放。", "warning");
              return;
            }
            const request = new AbortController();
            activeRequest = request;
            quiz.request = request;
            const stillCurrent = () => current() && options.isEnabled() && state === quiz && quiz.request === request && !request.signal.aborted && quiz.submittedAt === null && findQuiz(document2) === root && questionKey(root) === key;
            const question = quiz.question = ((_a = options.publishQuestion) == null ? void 0 : _a.call(options, parsed.question)) ?? parsed.question;
            options.log("正在搜索视频弹题答案…", "primary");
            awaitingAnswer = true;
            const response = await options.search(question, { signal: request.signal, isCurrent: stillCurrent });
            awaitingAnswer = false;
            if (!stillCurrent())
              return scan();
            const answers = getAnswerValues(response, question);
            const selected = (answers == null ? void 0 : answers.length) ? matchVideoQuizAnswers(parsed, answers, (_b = options.similarityThreshold) == null ? void 0 : _b.call(options)) : null;
            if (!selected) {
              quiz.request = void 0;
              quiz.blocked = true;
              question.answerStatus = "error";
              question.answer = [(answers == null ? void 0 : answers.length) ? "题库答案无法完整且唯一地匹配视频选项，请手动作答" : ((_c = response.error) == null ? void 0 : _c.message) || (((_d = response.meta) == null ? void 0 : _d.billing_result) === "exhausted" ? "题库额度已耗尽，请检查密钥和余额" : "题库未返回可用答案，请手动作答")];
              options.log(`视频弹题搜题未完成，<a class="log-action-link" href="#" data-log-action="show-answer-tab">点击查看原因</a>`, "warning");
              return;
            }
            quiz.applying = true;
            const applied = applyVideoQuizAnswers(parsed, selected, stillCurrent);
            quiz.applying = false;
            if (!stillCurrent())
              return scan();
            if (!applied) {
              quiz.request = void 0;
              quiz.blocked = true;
              question.answerStatus = "error";
              question.answer = ["题库答案已找到，但页面选项无法完整选择，请手动作答"];
              options.log("视频弹题选项未完整填写，已停止自动提交。", "warning");
              return;
            }
            question.answer = answers;
            question.answerStatus = "success";
            quiz.request = void 0;
            const submit = root.querySelector("#videoquiz-submit");
            if (!current() || !options.isEnabled() || findQuiz(document2) !== root || questionKey(root) !== key || !usable(submit)) {
              quiz.blocked = true;
              options.log("已填写视频弹题答案，但提交按钮不可用，请手动确认。", "warning");
              return scan();
            }
            quiz.submittedAt = Date.now();
            submit.click();
            options.log("已按题库答案提交视频弹题，等待页面反馈。", "primary");
          } else {
            quiz.continued = true;
            (_e = root.querySelector("#videoquiz-continue")) == null ? void 0 : _e.click();
          }
        } catch {
          if (!current() || state !== quiz || !options.isEnabled() || findQuiz(document2) !== root || questionKey(root) !== key || awaitingAnswer && quiz.request !== activeRequest)
            return scan();
          quiz.request = void 0;
          quiz.applying = false;
          quiz.blocked = true;
          if (quiz.question) {
            quiz.question.answerStatus = "error";
            quiz.question.answer = ["视频弹题搜题或填写失败，请手动处理"];
          }
          options.log("视频弹题自动处理失败，请在播放器内手动完成。", "danger");
        }
        scan();
      }, Number.isFinite(delay) ? Math.max(1e3, delay) : 3e3);
    };
    const trackManualClick = (event) => {
      var _a, _b;
      if (!current() || !state)
        return;
      const element = event.target;
      if (state.request && !state.applying && ((_a = element == null ? void 0 : element.closest) == null ? void 0 : _a.call(element, '.ans-videoquiz-opt, input[name="ans-videoquiz-opt"]')) && state.root.contains(element)) {
        if (state.question) {
          state.question.answerStatus = "error";
          state.question.answer = ["已切换为手动作答"];
        }
        state.blocked = true;
        cancelSearch();
      }
      const button = (_b = element == null ? void 0 : element.closest) == null ? void 0 : _b.call(element, "#videoquiz-submit, #videoquiz-continue");
      if (!button || !state.root.contains(button))
        return;
      if (button.id === "videoquiz-submit")
        state.submittedAt = Date.now();
      else
        state.continued = true;
      if (state.request && state.question) {
        state.question.answerStatus = "error";
        state.question.answer = ["已切换为手动作答"];
      }
      state.blocked = false;
      cancelSearch();
      cancelPending();
    };
    if (current()) {
      observer = new MutationObserver(scan);
      observer.observe(document2.documentElement, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ["class", "style", "hidden", "disabled", "aria-hidden", "aria-disabled"]
      });
      poll = setInterval(scan, 500);
      document2.addEventListener("click", trackManualClick, true);
      signal.addEventListener("abort", dispose, { once: true });
      scan();
    }
    return { hasActiveQuiz, dispose };
  };
  const CONFIG_STORAGE_KEY = "config";
  const LEGACY_CONFIG_STORAGE_KEY = "globalConfig";
  const isPlainObject = (value) => {
    return Object.prototype.toString.call(value) === "[object Object]";
  };
  const cloneLatestValue = (value) => {
    if (Array.isArray(value)) {
      return value.map((item) => cloneLatestValue(item));
    }
    if (isPlainObject(value)) {
      return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, cloneLatestValue(item)])
      );
    }
    return value;
  };
  const getItemName = (item) => {
    if (!isPlainObject(item) || typeof item.name !== "string")
      return null;
    return item.name;
  };
  const mergeArrayByLatestFields = (latestArray, storedArray) => {
    const canMergeByName = latestArray.every((item) => getItemName(item) !== null);
    if (!canMergeByName)
      return cloneLatestValue(storedArray.length ? storedArray : latestArray);
    return latestArray.map((latestItem) => {
      const latestName = getItemName(latestItem);
      const storedItem = storedArray.find((item) => getItemName(item) === latestName);
      return mergeByLatestFields(latestItem, storedItem);
    });
  };
  const mergeByLatestFields = (latestValue, storedValue) => {
    if (Array.isArray(latestValue)) {
      return mergeArrayByLatestFields(latestValue, Array.isArray(storedValue) ? storedValue : []);
    }
    if (isPlainObject(latestValue)) {
      const storedObject = isPlainObject(storedValue) ? storedValue : {};
      return Object.fromEntries(
        Object.entries(latestValue).map(([key, latestItem]) => [
          key,
          mergeByLatestFields(latestItem, storedObject[key])
        ])
      );
    }
    return storedValue === void 0 ? cloneLatestValue(latestValue) : storedValue;
  };
  const migrateConfig = (storedConfig, defaultConfig) => {
    storedConfig = cloneLatestValue(storedConfig);
    if (isPlainObject(storedConfig) && isPlainObject(storedConfig.platformParams)) {
      const cx = storedConfig.platformParams.cx;
      if (isPlainObject(cx) && Array.isArray(cx.parts)) {
        const chapter = cx.parts.find((part) => isPlainObject(part) && part.name === "章节设置");
        if (isPlainObject(chapter) && Array.isArray(chapter.params)) {
          const old = chapter.params.find((param) => isPlainObject(param) && param.name === "视频弹题自动处理（题库搜索）") ?? chapter.params.find((param) => isPlainObject(param) && param.name === "视频弹题自动处理（随机作答）");
          const latest = chapter.params.some((param) => isPlainObject(param) && param.name === VIDEO_QUIZ_SETTING);
          if (isPlainObject(old) && !latest)
            old.name = VIDEO_QUIZ_SETTING;
        }
      }
    }
    const mergedConfig = mergeByLatestFields(defaultConfig, storedConfig);
    mergedConfig.version = defaultConfig.version;
    // 地址与密钥只认用户自己填的值：默认留空，老配置里的旧地址迁移到单一 endpoint 字段。
    if (mergedConfig.queryApis?.[0]) {
      const api = mergedConfig.queryApis[0];
      if (typeof api.endpoint !== "string") {
        const legacy = api.mode === "direct" ? api.upstreamUrl : api.url;
        api.endpoint = typeof legacy === "string" ? legacy : "";
      }
      api.endpoint = typeof api.endpoint === "string" ? api.endpoint.trim() : "";
      api.mode = detectApiMode(api.endpoint);
      api.token = typeof api.token === "string" ? api.token : "";
      api.directDoubleCheck = api.directDoubleCheck !== false;
      api.audioMode = api.audioMode === "stt" ? "stt" : "llm";
      api.reasoningEffort = ["auto", "default", "low", "medium", "high"].includes(String(api.reasoningEffort || "").trim().toLowerCase())
        ? String(api.reasoningEffort).trim().toLowerCase()
        : "auto";
      api.sttEndpoint = typeof api.sttEndpoint === "string" ? api.sttEndpoint.trim() : "";
      api.sttToken = typeof api.sttToken === "string" ? api.sttToken : "";
      api.sttModel = typeof api.sttModel === "string" ? api.sttModel.trim() : "";
      delete api.url;
      delete api.upstreamUrl;
    }
    mergedConfig.otherParams.params[0].min = defaultConfig.otherParams.params[0].min;
    if (mergedConfig.platformParams && mergedConfig.platformParams.cx) {
      mergedConfig.platformParams.cx.name = defaultConfig.platformParams.cx.name;
    }
    return mergedConfig;
  };
  const getLocalStorageConfig = () => {
    try {
      return localStorage.getItem(CONFIG_STORAGE_KEY) || "";
    } catch (error) {
      console.error(error);
      return "";
    }
  };
  const setLocalStorageConfig = (serializedConfig) => {
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, serializedConfig);
    } catch (error) {
      console.error(error);
    }
  };
  const getStoredConfigText = () => {
    const gmConfig = _GM_getValue(CONFIG_STORAGE_KEY);
    if (typeof gmConfig === "string" && gmConfig)
      return gmConfig;
    const localConfig = getLocalStorageConfig();
    if (localConfig)
      return localConfig;
    const legacyConfig = _GM_getValue(LEGACY_CONFIG_STORAGE_KEY);
    if (typeof legacyConfig === "string" && legacyConfig)
      return legacyConfig;
    return "";
  };
  const persistConfig = (config2) => {
    const serializedConfig = JSON.stringify(config2);
    _GM_setValue(CONFIG_STORAGE_KEY, serializedConfig);
    _GM_setValue(LEGACY_CONFIG_STORAGE_KEY, serializedConfig);
    setLocalStorageConfig(serializedConfig);
  };
  const useConfigStore = pinia.defineStore("configStore", {
    state: () => {
      const scriptInfo = getScriptInfo();
      const defaultConfig = {
        version: scriptInfo.version,
        isMinus: false,
        position: {
          x: "800px",
          y: "200px"
        },
        menuIndex: "0",
        platformName: "cx",
        platformParams: {
          cx: {
            name: "tangwg学习通",
            parts: [
              {
                name: "章节设置",
                params: [
                  //     {
                  //     name: '视频速率',
                  //     value: 1,
                  //     type: 'number',
                  // },
                  {
                    name: "章节作业自动提交",
                    value: true,
                    type: "boolean"
                  },
                  {
                    name: "是否自动下一章节",
                    value: true,
                    type: "boolean"
                  },
                  {
                    name: "只答题，不做其他",
                    value: false,
                    type: "boolean"
                  },
                  {
                    name: VIDEO_QUIZ_SETTING,
                    value: true,
                    type: "boolean"
                  }
                ]
              },
              {
                name: "考试设置",
                params: [{
                  name: "是否自动切换",
                  value: true,
                  type: "boolean"
                }]
              }
            ]
          },
          zhs: {
            name: "智慧树网课助手",
            parts: [{
              name: "答题设置",
              params: [{
                name: "是否自动切换",
                value: true,
                type: "boolean"
              }]
            }]
          },
          unknown: {
            name: "未知平台",
            parts: [{
              name: "答题设置",
              params: [{
                name: "是否自动切换",
                value: true,
                type: "boolean"
              }]
            }]
          }
        },
        // 没答案自动选择
        otherParams: {
          name: "其他参数",
          params: [
            //     {
            //     name: '没答案随机选择',
            //     value: true,
            //     type: 'boolean',
            // },
            {
              name: "切换、答题间隔，单位秒",
              value: 3,
              type: "number",
              min: 1
            },
            {
              name: "正确率达到多少自动提交",
              value: 85,
              type: "number"
            },
            {
              name: "答案相似度超过多少选择",
              value: 85,
              type: "number",
              min: 0,
              max: 100,
              step: 1
            }
          ]
        },
        queryApis: [
          {
            name: "题库",
            // 空 = 未配置。填到 /v1 这类上游地址就直连，填站点根地址则走自建代理。
            endpoint: "",
            mode: "proxy",
            token: "",
            directDoubleCheck: true,
            model: "",
            // 音频处理方式："llm" = 大模型直听；"stt" = 先走自定义 STT 转文字再喂给模型。
            audioMode: "llm",
            // 思考强度："auto"（flash 自动 high，其余默认+仲裁 medium）| "default" | "low" | "medium" | "high"
            reasoningEffort: "auto",
            sttEndpoint: "",
            sttToken: "",
            sttModel: ""
          }
        ]
      };
      let globalConfig = defaultConfig;
      const storedConfig = getStoredConfigText();
      if (storedConfig) {
        try {
          const parsedStoredConfig = JSON.parse(storedConfig);
          globalConfig = migrateConfig(parsedStoredConfig, defaultConfig);
        } catch (error) {
          console.error(error);
        }
      }
      persistConfig(globalConfig);
      return globalConfig;
    },
    actions: {}
  });
  const formatDateTime = (dt) => {
    dt.getFullYear();
    dt.getMonth() + 1;
    dt.getDate();
    let hours = dt.getHours();
    let minutes = dt.getMinutes();
    let seconds = dt.getSeconds();
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };
  const pad = (n) => {
    return n < 10 ? "0" + n : n.toString();
  };
  const getDateTime = () => {
    let now = /* @__PURE__ */ new Date();
    return formatDateTime(now);
  };
  const useLogStore = pinia.defineStore("logStore", {
    state: () => ({
      logList: []
    }),
    actions: {
      addLog(message, type) {
        const log = {
          message,
          time: getDateTime(),
          type
        };
        this.logList.push(log);
      }
    }
  });
  const useQuestionStore = pinia.defineStore("questionStore", {
    state: () => ({
      questionList: []
    }),
    actions: {
      addQuestion(question) {
        this.questionList.push(question);
      },
      clearQuestion() {
        this.questionList = [];
      }
    }
  });
  const _hoisted_1$6 = {
    key: 0,
    class: "announcement-board",
    "aria-label": "公告"
  };
  const _hoisted_2$5 = { class: "announcement-heading" };
  const _hoisted_3$3 = { class: "announcement-list" };
  const _hoisted_4$3 = ["innerHTML"];
  const _sfc_main$9 = /* @__PURE__ */ vue.defineComponent({
    __name: "index",
    props: {
      title: { default: "公告" },
      items: {}
    },
    setup(__props) {
      return (_ctx, _cache) => {
        return _ctx.items.length ? (vue.openBlock(), vue.createElementBlock("section", _hoisted_1$6, [
          vue.createElementVNode("div", _hoisted_2$5, vue.toDisplayString(_ctx.title), 1),
          vue.createElementVNode("div", _hoisted_3$3, [
            (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(_ctx.items, (item) => {
              return vue.openBlock(), vue.createElementBlock("div", {
                key: item.id,
                class: "announcement-item",
                innerHTML: item.content
              }, null, 8, _hoisted_4$3);
            }), 128))
          ])
        ])) : vue.createCommentVNode("", true);
      };
    }
  });
  const sleep = (second) => {
    return new Promise((resolve) => setTimeout(resolve, second * 1e3));
  };
  // 公告走「用户自己填的端点」的 /def/notice：没有内置地址，也没配端点时直接跳过。
  // 不再带 referer / 站内 UID —— 公告不需要登录身份，少传一份就少一份外泄面。
  const NOTICE_PATH = "/def/notice";
  let noticeCache = null;
  let noticeRequest = null;
  const withScriptInfoParams = (url2) => {
    const scriptInfo = getScriptInfo();
    const requestUrl = new URL(url2);
    requestUrl.searchParams.set("s", scriptInfo.author || "OnlineCourseHelper");
    requestUrl.searchParams.set("v", scriptInfo.version);
    return requestUrl.toString();
  };
  const arrayBufferToBase64 = (buffer) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    const chunkSize = 32768;
    for (let i = 0; i < len; i += chunkSize) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, Math.min(i + chunkSize, len)));
    }
    return btoa(binary);
  };
  const audioCache = /* @__PURE__ */ new Map();
  const resolveAudioUrl = (raw) => {
    if (!raw || typeof raw !== "string")
      return null;
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith("blob:") || trimmed.startsWith("data:"))
      return null;
    try {
      return new URL(trimmed, window.location.href).href;
    } catch {
      return trimmed;
    }
  };
  const resolveObjectIdToAudioUrl = async (objectId) => {
    if (!objectId || !/^[a-zA-Z0-9]{16,40}$/.test(objectId))
      return null;
    const origin = (typeof window !== "undefined" && window.location && window.location.origin) ? window.location.origin : "https://mooc1.chaoxing.com";
    const candidateUrls = [
      `${origin}/ananas/status/${objectId}`,
      `https://mooc1.chaoxing.com/ananas/status/${objectId}`,
      `https://mooc1-1.chaoxing.com/ananas/status/${objectId}`,
      `https://mooc2.chaoxing.com/ananas/status/${objectId}`
    ];
    for (const statusUrl of candidateUrls) {
      try {
        const audioUrl = await new Promise((resolve) => {
          _GM_xmlhttpRequest({
            url: statusUrl,
            method: "GET",
            headers: {
              "Referer": (typeof window !== "undefined" && window.location) ? window.location.href : "https://mooc1.chaoxing.com/",
              "Origin": origin,
              "Accept": "application/json, text/javascript, */*",
              "User-Agent": (typeof navigator !== "undefined") ? navigator.userAgent : "Mozilla/5.0"
            },
            anonymous: false,
            timeout: 8000,
            onload: (res) => {
              if (res.status >= 200 && res.status < 300 && res.responseText) {
                try {
                  let data = null;
                  try {
                    data = JSON.parse(res.responseText);
                  } catch {
                    const m = res.responseText.match(/\{[\s\S]*\}/);
                    if (m) data = JSON.parse(m[0]);
                  }
                  if (data && (data.http || data.download || data.mp3)) {
                    return resolve(data.http || data.download || data.mp3);
                  }
                } catch (e) {}
              }
              resolve(null);
            },
            onerror: () => resolve(null),
            ontimeout: () => resolve(null)
          });
        });
        if (audioUrl) {
          const res = resolveAudioUrl(audioUrl);
          if (res) return res;
        }
      } catch (e) {}
    }
    return `https://d0.ananas.chaoxing.com/download/${objectId}`;
  };
  const extractAudioUrlFromElement = async (container, options = {}) => {
    if (!container)
      return null;
    const { skipQuestionSubtrees = false } = options;
    const isForeignQuestionNode = (el) => {
      if (!skipQuestionSubtrees || !el || el === container || typeof el.matches !== "function")
        return false;
      return el.matches(".questionLi, .TiMu, .examPaper_subject");
    };
    const isInsideForeignQuestion = (el) => {
      if (!skipQuestionSubtrees || !el || typeof el.closest !== "function")
        return false;
      const q = el.closest(".questionLi, .TiMu, .examPaper_subject");
      return Boolean(q && q !== container);
    };

    const inspectElement = async (el) => {
      if (!el || typeof el.getAttribute !== "function") return null;
      if (isForeignQuestionNode(el) || isInsideForeignQuestion(el)) return null;

      // 1. 直接 <audio> / <video> 标签或内嵌 <source>
      if (el.tagName === "AUDIO" || el.tagName === "VIDEO") {
        const src = el.src || el.currentSrc || el.getAttribute("src") || el.getAttribute("data-src") || el.getAttribute("data-url");
        if (src && (el.tagName === "AUDIO" || /\.(mp3|wav|ogg|m4a|aac|flac|weba)(?:[\?#]|$)/i.test(src) || src.includes("/ananas/"))) {
          const resolved = resolveAudioUrl(src);
          if (resolved) return resolved;
        }
        const srcEl = el.querySelector ? el.querySelector("source[src], source[data-src]") : null;
        if (srcEl) {
          const s = srcEl.src || srcEl.getAttribute("src") || srcEl.getAttribute("data-src");
          if (s && (el.tagName === "AUDIO" || /\.(mp3|wav|ogg|m4a|aac|flac|weba)(?:[\?#]|$)/i.test(s) || s.includes("/ananas/"))) {
            const resSource = resolveAudioUrl(s);
            if (resSource) return resSource;
          }
        }
      }

      const moduleAttr = (el.getAttribute("module") || "").toLowerCase();
      if (moduleAttr && /(?:insertimage|insertdoc|insertbook|insertppt|insertvideo|insertflash)/.test(moduleAttr)) {
        return null;
      }

      // 2. objectid / mid 属性直接识别
      const oid = el.getAttribute("objectid") || el.getAttribute("data-objectid") || el.getAttribute("mid");
      if (oid && /^[a-zA-Z0-9]{16,40}$/.test(oid)) {
        const resolved = await resolveObjectIdToAudioUrl(oid);
        if (resolved) return resolved;
      }

      // 3. data / data-mid JSON 属性匹配（跳过明确标为图片/文档的附件，避免把 PDF/JPG 当音频下）
      const dataAttr = el.getAttribute("data") || el.getAttribute("data-mid") || "";
      if (dataAttr) {
        if (/["']?(?:type|ext|suffix)["']?\s*:\s*["']?\.?(?:pdf|doc|docx|ppt|pptx|xls|xlsx|jpg|jpeg|png|gif|webp|bmp|svg|txt|zip|rar)["']?/i.test(dataAttr)) {
          return null;
        }
        const m = dataAttr.match(/["']?objectid["']?\s*:\s*["']?([a-zA-Z0-9]{16,40})["']?/i);
        if (m) {
          const resolved = await resolveObjectIdToAudioUrl(m[1]);
          if (resolved) return resolved;
        }
      }

      // 4. data-src / data-url / href
      const dataSrc = el.getAttribute("data-src") || el.getAttribute("data-url") || (el.tagName === "A" ? el.getAttribute("href") : "") || "";
      if (dataSrc) {
        if (/\.(mp3|wav|ogg|m4a|aac|flac|weba)(?:[\?#]|$)/i.test(dataSrc)) {
          const res = resolveAudioUrl(dataSrc);
          if (res) return res;
        }
        if (dataSrc.includes("/ananas/status/") || dataSrc.includes("/download/")) {
          const res = resolveAudioUrl(dataSrc);
          if (res) return res;
        }
      }

      return null;
    };

    const selfRes = await inspectElement(container);
    if (selfRes) return selfRes;

    if (typeof container.querySelectorAll !== "function")
      return null;

    const audios = container.querySelectorAll("audio, video");
    for (const a of audios) {
      const res = await inspectElement(a);
      if (res) return res;
    }

    const iframes = container.querySelectorAll("iframe[src], iframe[data-src], iframe");
    for (const f of iframes) {
      if (isForeignQuestionNode(f) || isInsideForeignQuestion(f))
        continue;
      try {
        if (f.contentDocument) {
          const innerAudio = f.contentDocument.querySelector("audio");
          if (innerAudio) {
            const res = await inspectElement(innerAudio);
            if (res) return res;
          }
        }
        const win = f.contentWindow;
        if (win) {
          if (win.paras && win.paras.http) {
            const res = resolveAudioUrl(win.paras.http);
            if (res) return res;
          }
          if (win.oData && win.oData.http) {
            const res = resolveAudioUrl(win.oData.http);
            if (res) return res;
          }
        }
      } catch (e) {}

      const src = f.getAttribute("src") || f.getAttribute("data-src") || "";
      const m = src.match(/[?&]objectid=([a-zA-Z0-9]{16,40})/i);
      if (m) {
        const resolved = await resolveObjectIdToAudioUrl(m[1]);
        if (resolved)
          return resolved;
      }
      if (src.includes("audio") || src.includes("mp3")) {
        try {
          if (f.contentDocument) {
            const innerUrl = await extractAudioUrlFromElement(f.contentDocument);
            if (innerUrl)
              return innerUrl;
          }
        } catch (e) {}
      }
    }

    const objectIdEls = container.querySelectorAll("[objectid], [data-objectid], [data*='objectid'], [mid], [data-mid], .ans-attach-ct, .ans-audio-player, [class*='audio'], [class*='voice'], [class*='player']");
    for (const el of objectIdEls) {
      const res = await inspectElement(el);
      if (res) return res;
    }

    const links = container.querySelectorAll("a[href]");
    for (const a of links) {
      const res = await inspectElement(a);
      if (res) return res;
    }
    return null;
  };
  const findAudioForQuestion = async (questionElement) => {
    if (!questionElement)
      return null;
    const isOtherQuestion = (el) => Boolean(el && el !== questionElement && typeof el.matches === "function" && el.matches(".questionLi, .TiMu, .examPaper_subject"));
    let url = await extractAudioUrlFromElement(questionElement);
    if (url)
      return { url, scope: "question" };

    let prev = questionElement.previousElementSibling;
    let steps = 0;
    while (prev && steps < 25) {
      if (isOtherQuestion(prev))
        break;
      url = await extractAudioUrlFromElement(prev, { skipQuestionSubtrees: true });
      if (url)
        return { url, scope: "sibling" };
      if (prev.classList && (prev.classList.contains("Zy_T_Tit") || prev.classList.contains("part_head"))) {
        break;
      }
      prev = prev.previousElementSibling;
      steps++;
    }

    let currentParent = questionElement.parentElement;
    let depth = 0;
    while (currentParent && currentParent !== questionElement.ownerDocument.body && depth < 3) {
      url = await extractAudioUrlFromElement(currentParent, { skipQuestionSubtrees: true });
      if (url)
        return { url, scope: "parent" };
      let pPrev = currentParent.previousElementSibling;
      let pSteps = 0;
      while (pPrev && pSteps < 15) {
        if (isOtherQuestion(pPrev))
          break;
        url = await extractAudioUrlFromElement(pPrev, { skipQuestionSubtrees: true });
        if (url)
          return { url, scope: "parent-sibling" };
        if (pPrev.classList && (pPrev.classList.contains("Zy_T_Tit") || pPrev.classList.contains("part_head"))) {
          break;
        }
        pPrev = pPrev.previousElementSibling;
        pSteps++;
      }
      currentParent = currentParent.parentElement;
      depth++;
    }

    try {
      const doc = questionElement.ownerDocument || (typeof document !== "undefined" ? document : null);
      if (doc) {
        const globalCandidates = Array.from(doc.querySelectorAll(".ans-attach-ct, .ans-audio-player, audio, iframe[src*='audio'], iframe[src*='objectid']"));
        for (const gEl of globalCandidates) {
          const ownerQ = typeof gEl.closest === "function" ? gEl.closest(".questionLi, .TiMu, .examPaper_subject") : null;
          if (ownerQ && ownerQ !== questionElement)
            continue;
          const gUrl = await extractAudioUrlFromElement(gEl);
          if (gUrl)
            return { url: gUrl, scope: "document" };
        }
      }
    } catch (e) {}

    return null;
  };
  const fetchAudioAsBase64 = async (audioUrl, signal) => {
    if (audioCache.has(audioUrl)) {
      return audioCache.get(audioUrl);
    }
    let format = "mp3";
    const extMatch = audioUrl.match(/\.(mp3|wav|ogg|m4a|aac|flac|weba)(?:[\?#]|$)/i);
    if (extMatch) {
      format = extMatch[1].toLowerCase();
      if (format === "weba")
        format = "ogg";
    }
    return new Promise((resolve, reject) => {
      let aborted = false;
      let req = null;
      const onAbort = () => {
        aborted = true;
        req == null ? void 0 : req.abort();
        reject(new Error("音频下载已取消"));
      };
      if (signal) {
        if (signal.aborted)
          return reject(new Error("音频下载已取消"));
        signal.addEventListener("abort", onAbort, { once: true });
      }
      req = _GM_xmlhttpRequest({
        url: audioUrl,
        method: "GET",
        headers: {
          "Referer": (typeof window !== "undefined" && window.location) ? window.location.href : "https://mooc1.chaoxing.com/",
          "Origin": (typeof window !== "undefined" && window.location) ? window.location.origin : "https://mooc1.chaoxing.com",
          "User-Agent": (typeof navigator !== "undefined") ? navigator.userAgent : "Mozilla/5.0",
          "Accept": "*/*"
        },
        anonymous: false,
        responseType: "arraybuffer",
        timeout: 6e4,
        onload: (res) => {
          if (signal)
            signal.removeEventListener("abort", onAbort);
          if (aborted)
            return;
          if (res.status >= 200 && res.status < 300 && res.response) {
            try {
              const rawCtMatch = (res.responseHeaders || "").match(/content-type:\s*([^;\r\n]+)/i);
              const rawCt = rawCtMatch ? rawCtMatch[1].trim().toLowerCase() : "";
              if (rawCt && /^(?:text\/html|application\/pdf|application\/json|image\/)/.test(rawCt)) {
                return reject(new Error(`目标链接返回的不是音频 (${rawCt})`));
              }
              const contentType = (res.responseHeaders || "").match(/content-type:\s*audio\/([a-zA-Z0-9_-]+)/i);
              if (contentType) {
                const ct = contentType[1].toLowerCase();
                if (ct.includes("wav"))
                  format = "wav";
                else if (ct.includes("ogg"))
                  format = "ogg";
                else if (ct.includes("mp4") || ct.includes("m4a"))
                  format = "m4a";
                else if (ct.includes("mpeg"))
                  format = "mp3";
              }
              const base64 = arrayBufferToBase64(res.response);
              const audioObj = { data: base64, format };
              audioCache.set(audioUrl, audioObj);
              resolve(audioObj);
            } catch (e) {
              reject(new Error("音频转码失败: " + e.message));
            }
          } else {
            reject(new Error(`音频下载失败 HTTP ${res.status}`));
          }
        },
        onerror: () => {
          if (signal)
            signal.removeEventListener("abort", onAbort);
          reject(new Error("音频下载网络错误"));
        },
        ontimeout: () => {
          if (signal)
            signal.removeEventListener("abort", onAbort);
          reject(new Error("音频下载超时"));
        }
      });
    });
  };
  // 拉取上游可用模型列表（代理透传 CPA 的 /v1/models；直连模式直接问上游）。返回 {ok, models, error}。
  // 失败时不抛异常：面板要能正常打开，只把错误提示给用户。
  const fetchModels = async () => {
    const configStore = useConfigStore();
    const queryApi = configStore.queryApis[0];
    const token = (queryApi?.token?.trim()) || "";
    const endpoint = (queryApi?.endpoint || "").trim();
    if (!endpoint)
      return { ok: false, models: [], error: "请先填写端点或上游地址" };
    if (detectApiMode(endpoint) === "direct")
      return fetchModelsDirect({ upstreamUrl: endpoint }, token);
    let url2;
    try {
      const baseUrl = new URL(endpoint);
      if (baseUrl.protocol !== "https:")
        return { ok: false, models: [], error: "开放 API 地址必须使用 HTTPS" };
      const modelsUrl = new URL(MODELS_PATH, baseUrl);
      modelsUrl.searchParams.set("refresh", "1");
      url2 = withScriptInfoParams(modelsUrl.toString());
    } catch {
      return { ok: false, models: [], error: "开放 API 地址不正确，请检查配置" };
    }
    const headers = { "Content-Type": "application/json" };
    if (token)
      headers["X-Consumer-Token"] = token;
    return new Promise((resolve) => {
      _GM_xmlhttpRequest({
        url: url2,
        method: "GET",
        headers,
        timeout: 15e3,
        onload: (response) => {
          let payload = null;
          try {
            payload = JSON.parse(response.responseText);
          } catch {
            return resolve({ ok: false, models: [], error: "模型列表响应解析出错" });
          }
          if (!payload || payload.success !== true || !Array.isArray(payload.models)) {
            const message = (payload?.error?.message) || `拉取模型列表失败 (HTTP ${response.status})`;
            return resolve({ ok: false, models: [], error: message });
          }
          const models = payload.models
            .filter((item) => isObject(item) && typeof item.id === "string" && item.id)
            .map((item) => ({ id: item.id, name: typeof item.name === "string" && item.name ? item.name : item.id }));
          resolve({ ok: true, models, error: null, defaultModel: payload.default || "" });
        },
        onerror: () => resolve({ ok: false, models: [], error: "模型列表网络错误" }),
        ontimeout: () => resolve({ ok: false, models: [], error: "拉取模型列表超时" }),
        onabort: () => resolve({ ok: false, models: [], error: "请求已取消" })
      });
    });
  };
  // ======================================================================= 直连上游
  // 不部署代理时，脚本自己对 OpenAI 兼容上游（CPA 等）发起请求。
  // 提示词、吸附、双路复核与仲裁都和 proxy 侧保持同一套规则，客户端只多拿一份原始答案。
  const DIRECT_SYSTEM_PROMPT = [
    "你是一个专业的考试答题助手。请根据题干和上下文直接给出正确答案。",
    "",
    "输出规则（极其重要）：",
    '1. 必须输出纯 JSON 对象，绝对不要输出任何解析、前言、markdown代码块或额外文字。',
    '2. 输出格式固定为：{"values": ["答案1", "答案2", ...]}',
    "3. 选择题：values 里的项必须严格原样复制题目给出的选项文字，不要带前缀序号、不要改字。",
    '4. 判断题：输出 {"values": ["正确"]} 或 {"values": ["错误"]}。',
    "5. 填空题/阅读匹配/听力综合大题：",
    "   - 包含多道小题、多个空位或表格数据时，请将每道小题的正确选项文本或最终答案依次放入 values 数组！",
    "   - 若题目附带了听力音频，必须完全基于听力录音中陈述的具体事实、数据、人名与细节进行理解作答！",
    "   - 必须按顺序拆成数组元素，绝不要把多道小题挤在一个字符串里。",
    "   - 若题目提示了小题/空位数量（如共有 N 道小题），values 数组中的元素个数必须严格与小题数量一致，严禁少填、漏填或合并！",
    '6. 绝不要放弃作答！严禁输出空数组 {"values": []}！即使上下文或段落不完整，也必须根据已知信息、语境逻辑和专业知识推断出每个空位/小题最可能的答案，并依次填入 values 数组！'
  ].join("\n");
  const DIRECT_TYPE_NAMES = {
    "0": "单选题",
    "1": "多选题",
    "2": "填空题",
    "3": "判断题",
    "4": "简答题",
    "6": "简答题",
    "8": "听力/阅读综合大题"
  };
  // 直连模式的墙钟预算（脚本自己计时，没有代理层兜底，所以比代理侧宽一些）
  const DIRECT_TOTAL_BUDGET = 110;
  const DIRECT_AUDIO_TOTAL_BUDGET = 200;
  const DIRECT_PAIR_GRACE = 20;
  const DIRECT_AUDIO_PAIR_GRACE = 35;
  const DIRECT_MIN_ARBITRATE_BUDGET = 12;

  // OpenAI 兼容端点的 base 统一成 `…/v1`：用户填 https://host 或 https://host/v1 都能用。
  const normalizeOpenAiBase = (raw) => {
    const base = String(raw || "").trim().replace(/\/+$/, "");
    if (!base)
      return "";
    return /\/v\d+$/i.test(base) ? base : `${base}/v1`;
  };
  const directEndpoint = (upstreamUrl, path) => {
    const base = normalizeOpenAiBase(upstreamUrl);
    if (!base)
      throw new Error("请先填写上游地址");
    return `${base}${path}`;
  };
  const directChatEndpoint = (upstreamUrl) => directEndpoint(upstreamUrl, "/chat/completions");
  const directModelsEndpoint = (upstreamUrl) => directEndpoint(upstreamUrl, "/models");

  const directOptionList = (question) => {
    var _a;
    const raw = ((_a = question.searchText) == null ? void 0 : _a.options) ?? question.optionsText ?? [];
    return (Array.isArray(raw) ? raw : []).map((item) => String(item == null ? "" : item).trim()).filter(Boolean);
  };
  const buildDirectTranscriptBlock = (req) => {
    const transcript = String(req.transcript || "").trim();
    if (!transcript)
      return "";
    return "【听力音频转写原文（由 STT 语音识别生成，请务必以此为听力事实依据；"
      + "注意识别文本可能存在个别同音词或标点误差，请结合语境判断）】：\n"
      + `${transcript}\n\n`;
  };
  const buildDirectPrompt = (req) => {
    const options = req.options.filter(Boolean);
    const transcriptBlock = buildDirectTranscriptBlock(req);
    const hasRawAudio = Boolean(req.audio && req.audio.data);
    if (!options.length) {
      if (req.type === "8" || hasRawAudio) {
        const audioHint = hasRawAudio
          ? "【特别注意：本题附带听力音频，请务必以听力音频中陈述的事实细节为准作答！】\n"
          : "";
        return "题型：听力/阅读综合复合大题（内含多道选择小题，小题题干与各选项已列于题干文本中）。\n"
          + audioHint
          + "作答要求：\n"
          + "1. 请仔细阅读题干中每一道小题及其选项内容，按小题顺序（第1题至最后一题）在 values 数组中输出各题正确选项的完整文字（或选项字母）。\n"
          + "2. values 数组中的元素个数必须严格与小题总数一致，按顺序一一对应，严禁输出额外解析或合并项！\n\n"
          + transcriptBlock
          + `题干：\n${req.stem}`;
      }
      const tname = DIRECT_TYPE_NAMES[req.type] || "填空题/综合大题";
      return `题型：${tname}（未给预设选项，请根据题干直接推断作答。若包含多个空位或段落匹配小题，`
        + `请依次在 values 数组中按顺序给出每个空的答案字母如 A-J 或内容）\n${transcriptBlock}题干：\n${req.stem}`;
    }
    const lines = options.map((opt, index) => `${String.fromCharCode(65 + index)}. ${opt}`).join("\n");
    const head = req.type === "3" ? "题型：判断题" : (req.type === "1" ? "题型：多选题（可能有多个正确答案）" : "题型：单选题");
    return `${head}\n\n${transcriptBlock}题干：${req.stem}\n\n选项：\n${lines}`;
  };
  const buildDirectArbitratePrompt = (req, options, discrepancyReport) => {
    const optLines = options.length
      ? options.map((opt, index) => `${String.fromCharCode(65 + index)}. ${opt}`).join("\n")
      : "（无预设选项）";
    const transcriptBlock = buildDirectTranscriptBlock(req);
    return `题型：${DIRECT_TYPE_NAMES[req.type] || "综合题"}\n\n`
      + `题干：\n${req.stem}\n\n`
      + `选项：\n${optLines}\n\n`
      + transcriptBlock
      + "【前两路答题助手复核核查情况】：\n"
      + `${discrepancyReport}\n\n`
      + "请作为资深命题与阅卷裁判（第 3 路独立终审裁判），深入仔细核实题目事实：\n"
      + "1. 针对【分歧小题/分歧选项】，深入核查材料/音频对话原话细节与转折逻辑（特别注意肯定/否定事实、转折词、时间及干扰项），辨析哪个是正确答案，哪个是干扰项；\n"
      + "2. 请在 analysis 字段中简要说明你的裁判依据与推导理由；\n"
      + "3. 在 values 数组中按题目顺序输出最终裁定的正解列表（共识小题保持共识，分歧小题裁定唯一正解）。\n\n"
      + "输出格式必须为纯 JSON：\n"
      + "{\n"
      + '  "analysis": "针对分歧点的裁判依据与事实核验说明",\n'
      + '  "values": ["最终答案1", "最终答案2", ...]\n'
      + "}";
  };
  const extractDirectValues = (text) => {
    const trimmed = String(text == null ? "" : text).trim().replace(/^(?:答案|正确答案|回答)\s*(?:是|为)?\s*[:：]?\s*/u, "");
    if (!trimmed)
      return [];
    const splitPlain = (raw) => raw.split(/[、,，;；\n]+/).map((part) => part.trim().replace(/^[\s　:：.]+|[\s　:：.]+$/g, "")).filter(Boolean);
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]+?)```/);
    const braced = trimmed.match(/\{[\s\S]*\}/);
    const payload = fenced ? fenced[1] : (braced ? braced[0] : "");
    if (!payload)
      return splitPlain(trimmed);
    let obj;
    try {
      obj = JSON.parse(payload);
    } catch {
      return splitPlain(payload);
    }
    if (typeof obj === "string")
      return obj.trim() ? [obj.trim()] : [];
    if (Array.isArray(obj))
      return obj.map((value) => String(value).trim()).filter(Boolean);
    if (isObject(obj)) {
      for (const key of ["values", "answer", "answers", "options", "choice"]) {
        const val = obj[key];
        if (typeof val === "string" && val.trim())
          return [val.trim()];
        if (Array.isArray(val))
          return val.map((value) => String(value).trim()).filter(Boolean);
      }
    }
    return [];
  };
  // 把模型输出吸附回选项原文：裸字母按序号取原文，其余走相似度（阈值与代理侧一致，85）。
  const snapToOptions = (value, options, threshold = 85) => {
    const raw = String(value == null ? "" : value).trim();
    if (!raw || !options.length)
      return null;
    const letter = raw.match(/^(?:选项\s*)?([a-zA-Z])[.．、:：\]]*$/);
    if (letter) {
      const index = letter[1].toUpperCase().charCodeAt(0) - 65;
      if (index >= 0 && index < options.length)
        return options[index];
    }
    const target = normalize(raw);
    if (!target)
      return null;
    const normalizedOptions = options.map((option) => normalize(option));
    const exact = normalizedOptions.indexOf(target);
    if (exact >= 0)
      return options[exact];
    let best = 0;
    let bestIndex = -1;
    normalizedOptions.forEach((option, index) => {
      const score = similarity(option, target);
      if (score > best) {
        best = score;
        bestIndex = index;
      }
    });
    return best >= threshold && bestIndex >= 0 ? options[bestIndex] : null;
  };
  const processDirectAnswers = (values, req, options) => {
    if (!values.length)
      return null;
    const kind = req.type === "3" ? "judge" : (["2", "4", "6", "8"].includes(req.type) ? "fill" : "choice");
    if (req.type === "3") {
      const first = String(values[0] || "").toLowerCase();
      const isTrue = ["正确", "对", "true", "t", "√", "yes", "right"].some((token) => first.includes(token));
      const matched = options.find((opt) => {
        const lowered = opt.toLowerCase();
        return isTrue
          ? ["对", "正确", "√", "true"].some((token) => lowered.includes(token))
          : ["错", "错误", "×", "false"].some((token) => lowered.includes(token));
      });
      return [kind, [matched || (isTrue ? "正确" : "错误")]];
    }
    if (options.length) {
      const snapped = [];
      for (const value of values) {
        const hit = snapToOptions(value, options);
        if (hit === null)
          return null;
        if (!snapped.includes(hit))
          snapped.push(hit);
      }
      return snapped.length ? [kind, snapped] : null;
    }
    const cleaned = values.map((value) => value.trim()).filter(Boolean);
    return cleaned.length ? [kind, cleaned] : null;
  };
  const directAnswersMatch = (ans1, ans2) => {
    if (!ans1 || !ans2)
      return false;
    if (ans1[0] !== ans2[0])
      return false;
    const v1 = ans1[1];
    const v2 = ans2[1];
    if (v1.length !== v2.length)
      return false;
    return v1.every((value, index) => normalize(value) === normalize(v2[index]));
  };
  const buildDirectDiscrepancy = (ans1, ans2) => {
    const label = (ans) => (ans ? JSON.stringify(ans[1]) : "作答未产生有效匹配选项/放弃");
    if (!ans1 || !ans2)
      return `- 助手 1 备选答案：${label(ans1)}\n- 助手 2 备选答案：${label(ans2)}`;
    const v1 = ans1[1];
    const v2 = ans2[1];
    if (v1.length === v2.length && v1.length > 1) {
      const agreed = [];
      const disputed = [];
      v1.forEach((value, index) => {
        if (normalize(value) === normalize(v2[index]))
          agreed.push(`第 ${index + 1} 小题：双方一致认同为「${value}」`);
        else
          disputed.push(`第 ${index + 1} 小题分歧：助手 1 选择「${value}」，助手 2 选择「${v2[index]}」`);
      });
      const lines = [];
      if (agreed.length)
        lines.push("【共识小题】（两路助手已完全一致）：\n" + agreed.map((line) => `- ${line}`).join("\n"));
      if (disputed.length)
        lines.push("【分歧小题】（重点核查裁决对象）：\n" + disputed.map((line) => `- ${line}`).join("\n"));
      return lines.join("\n\n");
    }
    return `- 助手 1 备选答案：${JSON.stringify(v1)}\n- 助手 2 备选答案：${JSON.stringify(v2)}`;
  };
  // 从 SSE 文本里拼出正文（忽略 `: keep-alive` 注释帧与 `data: [DONE]`）
  const collectSseText = (responseText) => {
    if (!responseText)
      return "";
    const trimmed = responseText.trim();
    if (trimmed.startsWith("{")) {
      try {
        const whole = JSON.parse(trimmed);
        const content = whole?.choices?.[0]?.message?.content;
        if (typeof content === "string")
          return content.trim();
      } catch {}
    }
    let text = "";
    for (const rawLine of trimmed.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith(":"))
        continue;
      if (!line.startsWith("data:"))
        continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]")
        continue;
      try {
        const chunk = JSON.parse(payload);
        const choice = chunk?.choices?.[0];
        const content = choice?.delta?.content ?? choice?.message?.content;
        if (typeof content === "string")
          text += content;
      } catch {}
    }
    return text.trim();
  };
  const directRequest = (options) => new Promise((resolve, reject) => {
    const { url: url2, apiKey, payload, timeout, signal } = options;
    let request = null;
    let settled = false;
    const done = (fn, value) => {
      if (settled)
        return;
      settled = true;
      signal == null ? void 0 : signal.removeEventListener("abort", onAbort);
      fn(value);
    };
    const onAbort = () => {
      request == null ? void 0 : request.abort();
      done(reject, new Error("请求已取消"));
    };
    if (signal) {
      if (signal.aborted) {
        reject(new Error("请求已取消"));
        return;
      }
      signal.addEventListener("abort", onAbort, { once: true });
    }
    try {
      request = _GM_xmlhttpRequest({
        url: url2,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        data: JSON.stringify(payload),
        timeout,
        onload: (response) => {
          if (response.status === 401 || response.status === 403) {
            return done(reject, new Error("上游鉴权失败：API Key 无效或无权限"));
          }
          if (response.status >= 400) {
            let detail = response.responseText || "";
            try {
              const parsed = JSON.parse(response.responseText);
              detail = parsed?.error?.message || parsed?.message || detail;
            } catch {}
            return done(reject, new Error(`上游返回 HTTP ${response.status}${detail ? `：${String(detail).slice(0, 160)}` : ""}`));
          }
          const text = collectSseText(response.responseText);
          if (!text)
            return done(reject, new Error("上游返回空内容"));
          done(resolve, text);
        },
        onerror: () => done(reject, new Error("上游网络错误（检查上游地址与 @connect 白名单）")),
        ontimeout: () => done(reject, new Error("上游请求超时")),
        onabort: () => done(reject, new Error("请求已取消"))
      });
      if (signal == null ? void 0 : signal.aborted)
        request.abort();
    } catch (err) {
      done(reject, err instanceof Error ? err : new Error(String(err)));
    }
  });
  const normalizeReasoningEffortSetting = (raw) => {
    const val = String(raw == null ? "auto" : raw).trim().toLowerCase();
    return ["auto", "default", "low", "medium", "high"].includes(val) ? val : "auto";
  };
  const isFlashModelName = (model) => /flash/i.test(String(model || "").trim());
  const resolveReasoningEffort = (setting, model, { isArbitrate = false } = {}) => {
    const mode = normalizeReasoningEffortSetting(setting);
    if (mode === "default")
      return isArbitrate ? "medium" : "";
    if (mode === "auto") {
      if (isFlashModelName(model))
        return "high";
      return isArbitrate ? "medium" : "";
    }
    if (isArbitrate)
      return mode === "high" ? "high" : "medium";
    return mode;
  };
  const directChatOnce = (params) => {
    const { upstreamUrl, apiKey, model, prompt, temperature, audio, timeout, reasoningEffort, signal } = params;
    const payload = {
      model,
      messages: [
        { role: "system", content: DIRECT_SYSTEM_PROMPT },
        {
          role: "user",
          content: audio && audio.data
            ? [
              { type: "text", text: "【重要指令：本题包含听力音频材料！请务必仔细聆听音频中的全部对话、事实陈述、关键数字与时间，严格依据听力事实作答！】\n\n" + prompt },
              { type: "input_audio", input_audio: { data: audio.data, format: audio.format || "mp3" } }
            ]
            : prompt
        }
      ],
      temperature,
      stream: true
    };
    if (reasoningEffort)
      payload.reasoning_effort = reasoningEffort;
    return directRequest({ url: directChatEndpoint(upstreamUrl), apiKey, payload, timeout, signal })
      .catch(async (err) => {
        // 非思考模型会明确拒绝 reasoning_effort：摘掉再试一次，不能把整题拖成失败
        if (payload.reasoning_effort && /reasoning_effort/i.test(err.message || "")) {
          delete payload.reasoning_effort;
          return directRequest({ url: directChatEndpoint(upstreamUrl), apiKey, payload, timeout, signal });
        }
        throw err;
      });
  };
  // 与 proxy 的 run_dual_calls 同语义：首路拿到有效答案后只再等副路 grace 秒。
  // 放弃的那一路会真的 abort 掉，避免宽限超时后还在后台白烧 token。
  const runDirectDual = (factories, deadline, grace, isValid, parentSignal) => {
    return new Promise((resolve, reject) => {
      const results = [void 0, void 0];
      const settled = [false, false];
      const controllers = factories.map(() => new AbortController());
      const outerAbort = () => controllers.forEach((controller) => controller.abort());
      let finished = false;
      let graceTimer = null;
      let deadlineTimer = null;
      const cleanup = () => {
        if (graceTimer)
          clearTimeout(graceTimer);
        if (deadlineTimer)
          clearTimeout(deadlineTimer);
        parentSignal == null ? void 0 : parentSignal.removeEventListener("abort", outerAbort);
      };
      const finish = () => {
        if (finished)
          return;
        finished = true;
        cleanup();
        controllers.forEach((controller) => controller.abort());
        resolve([
          settled[0] ? results[0] : new Error("副路超时已放弃"),
          settled[1] ? results[1] : new Error("副路超时已放弃")
        ]);
      };
      const check = () => {
        if (finished)
          return;
        if (settled[0] && settled[1])
          return finish();
        if (graceTimer)
          return;
        const ready = [0, 1].find((index) => settled[index] && typeof results[index] === "string" && (!isValid || isValid(results[index])));
        if (ready === void 0)
          return;
        graceTimer = setTimeout(finish, grace * 1e3);
      };
      if (parentSignal) {
        if (parentSignal.aborted) {
          controllers.forEach((controller) => controller.abort());
        } else {
          parentSignal.addEventListener("abort", outerAbort, { once: true });
        }
      }
      deadlineTimer = setTimeout(finish, Math.max(0, deadline - Date.now()));
      factories.forEach((factory, index) => {
        Promise.resolve()
          .then(() => factory(controllers[index].signal))
          .then((value) => {
            results[index] = value;
            settled[index] = true;
          })
          .catch((err) => {
            results[index] = err instanceof Error ? err : new Error(String(err));
            settled[index] = true;
          })
          .finally(check);
      });
    });
  };

  const parseOpenAiModelList = (payload) => {
    if (Array.isArray(payload?.stt)) {
      const seen = /* @__PURE__ */ new Set();
      const canonicals = [];
      for (const item of payload.stt) {
        if (!item || item.batch === false)
          continue;
        const id = String(item.canonical_name || item.name || "").trim();
        if (!id || seen.has(id))
          continue;
        seen.add(id);
        canonicals.push(id);
      }
      const models = [];
      if (seen.has("nova-3-general"))
        models.push({ id: "nova-3", name: "Nova 3 (推荐通用)" });
      if (seen.has("nova-2-general"))
        models.push({ id: "nova-2", name: "Nova 2" });
      for (const id of canonicals)
        models.push({ id, name: id });
      return models;
    }
    const list = Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload?.models) ? payload.models : null);
    if (!list)
      return null;
    const seen = /* @__PURE__ */ new Set();
    const models = [];
    for (const raw of list) {
      const id = typeof raw === "string" ? raw : (raw && typeof raw.id === "string" ? raw.id : "");
      const clean = id.replace(/^models\//, "").trim();
      if (!clean || seen.has(clean))
        continue;
      seen.add(clean);
      const display = raw && typeof raw === "object"
        ? (raw.name || raw.display_name || raw.displayName || "")
        : "";
      models.push({ id: clean, name: typeof display === "string" && display && display !== clean ? display : clean });
    }
    return models;
  };
  const fetchOpenAiModels = ({ modelsUrl, token, authScheme = "Bearer", defaultModel = "" }) => {
    const headers = { "Content-Type": "application/json" };
    if (token)
      headers["Authorization"] = `${authScheme} ${token}`;
    return new Promise((resolve) => {
      _GM_xmlhttpRequest({
        url: modelsUrl,
        method: "GET",
        headers,
        timeout: 15e3,
        onload: (response) => {
          if (response.status === 401 || response.status === 403) {
            return resolve({ ok: false, models: [], error: "上游鉴权失败：API Key 无效或无权限" });
          }
          let payload = null;
          try {
            payload = JSON.parse(response.responseText);
          } catch {
            return resolve({ ok: false, models: [], error: "模型列表响应解析出错" });
          }
          const models = parseOpenAiModelList(payload);
          if (!models) {
            return resolve({
              ok: false,
              models: [],
              error: payload?.error?.message || `拉取模型列表失败 (HTTP ${response.status})`
            });
          }
          resolve({ ok: true, models, error: null, defaultModel });
        },
        onerror: () => resolve({ ok: false, models: [], error: "模型列表网络错误（检查上游地址）" }),
        ontimeout: () => resolve({ ok: false, models: [], error: "拉取模型列表超时" }),
        onabort: () => resolve({ ok: false, models: [], error: "请求已取消" })
      });
    });
  };
  const fetchModelsDirect = (queryApi, token) => {
    let url2;
    try {
      url2 = directModelsEndpoint(queryApi.upstreamUrl);
    } catch (err) {
      return Promise.resolve({ ok: false, models: [], error: err.message });
    }
    return fetchOpenAiModels({
      modelsUrl: url2,
      token,
      defaultModel: (queryApi.model || "").trim()
    });
  };

  // ----------------------------------------------------------------------- DIY STT 语音转文字
  const STT_AUDIO_MIME = {
    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",
    m4a: "audio/mp4",
    aac: "audio/aac",
    flac: "audio/flac",
    webm: "audio/webm",
    weba: "audio/webm"
  };
  const isLoopbackHost = (hostname) => /^(?:localhost|127\.0\.0\.1|\[::1\]|::1)$/i.test(String(hostname || "").trim());
  const isAllowedSttUrl = (parsed) => parsed.protocol === "https:" || (parsed.protocol === "http:" && isLoopbackHost(parsed.hostname));
  const DEEPGRAM_WS_ONLY_PARAMS = ["encoding", "sample_rate", "eot_threshold", "eot_timeout_ms"];
  // 兼容两类 HTTP 文件识别端点（不支持 ws/wss 实时流式）：
  // 1) OpenAI 兼容：https://host、https://host/v1、https://host/openai/v1 或 .../audio/transcriptions
  // 2) Deepgram REST：https://api.deepgram.com/v1/listen（或自定义反代的 .../listen）
  const normalizeSttEndpoints = (rawUrl) => {
    const trimmed = String(rawUrl || "").trim();
    if (!trimmed)
      throw new Error("请先填写 STT 端点地址");
    if (/^wss?:\/\//i.test(trimmed)) {
      throw new Error("暂不支持 ws/wss 实时流式端点（网课听力需整段文件识别）。若使用 Deepgram，请改填 https://api.deepgram.com/v1/listen 并选 nova-3");
    }
    const parsed = new URL(trimmed);
    if (!isAllowedSttUrl(parsed))
      throw new Error("STT 地址须使用 HTTPS（仅本机回环地址允许 HTTP）");

    const cleanPath = parsed.pathname.replace(/\/+$/, "");
    const host = parsed.hostname.toLowerCase();
    const isDeepgram = /\/listen$/i.test(cleanPath) || host === "deepgram.com" || host.endsWith(".deepgram.com");
    if (isDeepgram) {
      let listenPath;
      if (/\/listen$/i.test(cleanPath)) {
        listenPath = host.includes("deepgram.com") ? cleanPath.replace(/\/v2\/listen$/i, "/v1/listen") : cleanPath;
      } else if (/\/v\d+$/i.test(cleanPath)) {
        const baseVer = host.includes("deepgram.com") && cleanPath.toLowerCase().endsWith("/v2") ? "/v1" : cleanPath;
        listenPath = `${baseVer}/listen`;
      } else {
        listenPath = `${cleanPath}/v1/listen`;
      }
      const listenUrl = new URL(`${parsed.origin}${listenPath}${parsed.search}`);
      for (const wsKey of DEEPGRAM_WS_ONLY_PARAMS)
        listenUrl.searchParams.delete(wsKey);
      const modelsPath = listenPath.replace(/\/listen$/i, "/models");
      return {
        protocol: "deepgram",
        authScheme: "Token",
        transcriptionsUrl: listenUrl.toString(),
        modelsUrl: `${parsed.origin}${modelsPath}`
      };
    }

    let transcriptionsUrl;
    let modelsUrl;
    if (/\/audio\/transcriptions$/i.test(cleanPath)) {
      transcriptionsUrl = `${parsed.origin}${cleanPath}${parsed.search}`;
      modelsUrl = `${parsed.origin}${cleanPath.replace(/\/audio\/transcriptions$/i, "/models")}`;
    } else {
      const base = normalizeOpenAiBase(`${parsed.origin}${cleanPath}`);
      transcriptionsUrl = `${base}/audio/transcriptions${parsed.search}`;
      modelsUrl = `${base}/models`;
    }
    return {
      protocol: "openai",
      authScheme: "Bearer",
      transcriptionsUrl,
      modelsUrl
    };
  };
  const hashAudioData = (base64Str) => {
    const str = String(base64Str || "");
    if (!str)
      return "";
    let h1 = 2166136261;
    let h2 = 33554467;
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ code, 16777619) >>> 0;
      h2 = Math.imul(h2 ^ (code + i), 16777619) >>> 0;
    }
    return h1.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0") + "_" + str.length;
  };
  const base64ToUint8Array = (base64Str) => {
    const clean = String(base64Str || "").replace(/^data:[^,]+,/, "").trim();
    const binary = atob(clean);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++)
      bytes[i] = binary.charCodeAt(i);
    return bytes;
  };
  const sttCache = /* @__PURE__ */ new Map();
  const STT_REQUEST_TIMEOUT = 60e3;
  const fetchSttModels = () => {
    const api = useConfigStore().queryApis[0] || {};
    const rawEndpoint = (api.sttEndpoint || "").trim();
    if (!rawEndpoint)
      return Promise.resolve({ ok: false, models: [], error: "请先填写 STT 端点地址" });
    let modelsUrl;
    let authScheme;
    try {
      ({ modelsUrl, authScheme } = normalizeSttEndpoints(rawEndpoint));
    } catch (err) {
      return Promise.resolve({ ok: false, models: [], error: err.message || "STT 端点地址不正确" });
    }
    return fetchOpenAiModels({
      modelsUrl,
      token: (api.sttToken || "").trim(),
      authScheme,
      defaultModel: (api.sttModel || "").trim()
    });
  };
  const transcribeAudioWithStt = async ({ sttEndpoint, sttToken, sttModel, audio, audioHash, signal, timeout = STT_REQUEST_TIMEOUT }) => {
    const { protocol, authScheme, transcriptionsUrl } = normalizeSttEndpoints(sttEndpoint);
    const modelId = String(sttModel || "").trim();
    if (!modelId)
      throw new Error("请在答题面板选择或输入 STT 模型");
    const hash = audioHash || hashAudioData(audio?.data);
    const cacheKey = JSON.stringify([protocol, transcriptionsUrl, modelId, hash]);
    const cached = sttCache.get(cacheKey);
    if (cached && Date.now() - cached.at < DIRECT_CACHE_TTL) {
      useLogStore().addLog(`[听力STT] 命中转写缓存（${cached.text.length} 字），跳过重复识别`, "primary");
      return cached.text;
    }
    const ext = String(audio?.format || "mp3").trim().toLowerCase().replace(/^\./, "") || "mp3";
    const mime = STT_AUDIO_MIME[ext] || "application/octet-stream";
    const bytes = base64ToUint8Array(audio.data);
    const headers = {};
    const token = String(sttToken || "").trim();
    if (token)
      headers["Authorization"] = `${authScheme} ${token}`;

    let requestUrl = transcriptionsUrl;
    let requestBody;
    if (protocol === "deepgram") {
      const dgUrl = new URL(transcriptionsUrl);
      dgUrl.searchParams.set("model", modelId);
      if (!dgUrl.searchParams.has("smart_format"))
        dgUrl.searchParams.set("smart_format", "true");
      if (!dgUrl.searchParams.has("language") && !dgUrl.searchParams.has("detect_language"))
        dgUrl.searchParams.set("detect_language", "true");
      requestUrl = dgUrl.toString();
      headers["Content-Type"] = mime;
      requestBody = new Blob([bytes], { type: mime });
    } else {
      const formData = new FormData();
      formData.append("file", new Blob([bytes], { type: mime }), `audio.${ext}`);
      formData.append("model", modelId);
      formData.append("response_format", "json");
      requestBody = formData;
    }

    const text = await new Promise((resolve, reject) => {
      let request = null;
      let settled = false;
      const done = (fn, val) => {
        if (settled)
          return;
        settled = true;
        signal == null ? void 0 : signal.removeEventListener("abort", onAbort);
        fn(val);
      };
      const onAbort = () => {
        request == null ? void 0 : request.abort();
        done(reject, new Error("STT 请求已取消"));
      };
      if (signal) {
        if (signal.aborted)
          return reject(new Error("STT 请求已取消"));
        signal.addEventListener("abort", onAbort, { once: true });
      }
      try {
        request = _GM_xmlhttpRequest({
          url: requestUrl,
          method: "POST",
          headers,
          data: requestBody,
          timeout,
          onload: (response) => {
            if (response.status === 401 || response.status === 403)
              return done(reject, new Error("STT 鉴权失败：API Key 无效或无权限"));
            if (response.status >= 400) {
              let detail = response.responseText || "";
              try {
                const parsed = JSON.parse(response.responseText);
                detail = parsed?.error?.message || parsed?.err_msg || parsed?.message || detail;
              } catch {}
              return done(reject, new Error(`STT 返回 HTTP ${response.status}${detail ? `：${String(detail).slice(0, 160)}` : ""}`));
            }
            let out = "";
            let detectedLang = "";
            try {
              const parsed = JSON.parse(response.responseText);
              const dgChan = parsed?.results?.channels?.[0];
              detectedLang = typeof dgChan?.detected_language === "string" ? dgChan.detected_language : "";
              const dgTranscript = dgChan?.alternatives?.[0]?.transcript;
              const candidate = dgTranscript ?? parsed?.text ?? parsed?.transcript ?? parsed?.data?.text;
              if (typeof candidate === "string")
                out = candidate.trim();
            } catch {
              out = String(response.responseText || "").trim();
            }
            if (!out)
              return done(reject, new Error("STT 返回空转写文本"));
            if (detectedLang) {
              useLogStore().addLog(`[听力STT] Deepgram 自动识别语种：${detectedLang}${detectedLang !== "en" ? "（若本题为英语听力，建议 STT 端点末尾加 ?language=en）" : ""}`, detectedLang === "en" ? "primary" : "warning");
            }
            done(resolve, out);
          },
          onerror: () => done(reject, new Error("STT 网络错误（检查 STT 地址与网络连通性）")),
          ontimeout: () => done(reject, new Error("STT 请求超时")),
          onabort: () => done(reject, new Error("STT 请求已取消"))
        });
        if (signal == null ? void 0 : signal.aborted)
          request.abort();
      } catch (err) {
        done(reject, err instanceof Error ? err : new Error(String(err)));
      }
    });
    sttCache.set(cacheKey, { text, at: Date.now() });
    return text;
  };
  const resolveClientSttTranscript = async ({ queryApi, audioPayload, audioHash, signal }) => {
    const sttEndpoint = (queryApi.sttEndpoint || "").trim();
    const sttModel = (queryApi.sttModel || "").trim();
    const sttToken = (queryApi.sttToken || "").trim();
    if (!sttEndpoint || !sttModel) {
      return { ok: false, message: "已选择「STT 转文字」，请在答题面板填写 STT 端点与模型" };
    }
    const logStore = useLogStore();
    logStore.addLog(`[听力STT] 正在调用 ${sttModel} 转写音频 (${audioPayload.format}, ${Math.round(audioPayload.data.length / 1024)} KB)...`, "primary");
    try {
      const transcript = await transcribeAudioWithStt({
        sttEndpoint,
        sttToken,
        sttModel,
        audio: audioPayload,
        audioHash,
        signal
      });
      const preview = transcript.length > 240 ? transcript.slice(0, 240) + "..." : transcript;
      logStore.addLog(`[听力STT] 转写完成（${transcript.length} 字）：${preview}`, "success");
      return { ok: true, transcript };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logStore.addLog(`[听力STT] 转写失败：${message}`, "error");
      return { ok: false, message: `听力 STT 转写失败：${message}` };
    }
  };

  // 直连模式的答案缓存：同题重复出现不必再花钱（仅内存，刷新页面即失效）
  const directCache = /* @__PURE__ */ new Map();
  const DIRECT_CACHE_TTL = 30 * 24 * 60 * 60 * 1e3;
  const directCacheKey = (model, req) => JSON.stringify([
    model,
    req.type,
    req.stem,
    req.options,
    req.audioHash || "",
    req.audioMode || "llm",
    req.sttKey || "",
    req.reasoningEffort || ""
  ]);
  const directEnvelope = (stem, kind, values, checkStatus, detail) => ({
    success: true,
    data: { items: [{ stem, answer: { kind, values } }] },
    error: { code: null, message: null, details: null },
    meta: { credit_remaining: null, billing_result: null, check_status: checkStatus, check_detail: detail }
  });

  // 听力题：找音频 → 下载转 base64。代理和直连两条链路共用。
  const prepareQuestionAudio = async (question, signal) => {
    var _a;
    if (question.audio)
      return question.audio;
    if (!question.element)
      return null;
    if (question && question.audioError)
      delete question.audioError;
    try {
      const foundAudio = await findAudioForQuestion(question.element);
      const audioUrl = foundAudio && typeof foundAudio === "object" ? foundAudio.url : foundAudio;
      const audioScope = foundAudio && typeof foundAudio === "object" ? foundAudio.scope : "question";
      if (!audioUrl) {
        const titleStr = String(question.title || "") + " " + String(((_a = question.searchText) == null ? void 0 : _a.stem) || "");
        if (titleStr.includes("听力") || /\b(?:listen|listening|dialogue|conversation|passage)\b/i.test(titleStr)) {
          useLogStore().addLog(`[听力题] 未在页面检测到音频元素，本次将仅按文本作答（未调用 STT；若页面有播放器可能是跨域或未加载）`, "warning");
        }
        return null;
      }
      const scopeLabel = {
        question: "本题内部",
        sibling: "题前相邻块",
        parent: "父容器同级区",
        "parent-sibling": "上级相邻块",
        document: "页面级兜底"
      }[audioScope] || audioScope;
      const logStore = useLogStore();
      logStore.addLog(`[听力题] 发现音频材料（来源：${scopeLabel}），正在拉取并转码: ${audioUrl.split("?")[0]}`, audioScope === "document" ? "warning" : "primary");
      const audioPayload = await fetchAudioAsBase64(audioUrl, signal);
      question.audio = audioPayload;
      logStore.addLog(`[听力题] 音频就绪 (${audioPayload.format}, 大小: ${Math.round(audioPayload.data.length / 1024)} KB)，已配置 180s 听力超时`, "success");
      return audioPayload;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      question.audioError = msg;
      useLogStore().addLog(`[听力题] 音频获取失败: ${msg}`, "warning");
      return null;
    }
  };

  const directGetAnswer = async (question, context) => {
    var _a, _b;
    const configStore = useConfigStore();
    const queryApi = configStore.queryApis[0] || {};
    const apiKey = ((_a = queryApi.token) == null ? void 0 : _a.trim()) || "";
    const upstreamUrl = (queryApi.upstreamUrl || queryApi.endpoint || "").trim();
    if (!upstreamUrl)
      return apiError("请在答题面板填写上游地址（以 /v1 结尾）");
    if (!apiKey)
      return apiError("直连模式需要在面板填写上游 API Key");
    let model;
    let baseUrl;
    try {
      baseUrl = new URL(normalizeOpenAiBase(upstreamUrl));
    } catch {
      return apiError("上游地址不正确，请检查配置");
    }
    if (baseUrl.protocol !== "https:")
      return apiError("上游地址必须使用 HTTPS");
    model = ((_b = queryApi.model) == null ? void 0 : _b.trim()) || "";
    if (!model)
      return apiError("直连模式要先用「刷新」拉取模型并选一个，或手动填写模型名");

    const audioMode = queryApi.audioMode === "stt" ? "stt" : "llm";
    const audioPayload = await prepareQuestionAudio(question, context.signal);
    if (context.signal == null ? void 0 : context.signal.aborted)
      return apiError("请求已取消");
    if (!audioPayload && question.audioError && audioMode === "stt") {
      return apiError(`检测到听力音频但获取失败，已中止以免未转写盲猜：${question.audioError}`);
    }

    const audioHash = audioPayload && audioPayload.data ? hashAudioData(audioPayload.data) : "";
    const sttKey = audioPayload && audioPayload.data && audioMode === "stt"
      ? `${(queryApi.sttEndpoint || "").trim()}|${(queryApi.sttModel || "").trim()}`
      : "";
    const reasoningSetting = normalizeReasoningEffortSetting(queryApi.reasoningEffort);
    const mainReasoningEffort = resolveReasoningEffort(reasoningSetting, model, { isArbitrate: false });
    const arbReasoningEffort = resolveReasoningEffort(reasoningSetting, model, { isArbitrate: true });
    const req = {
      stem: ((question.searchText == null ? void 0 : question.searchText.stem) ?? question.title) || "",
      options: directOptionList(question),
      type: normalizeQuestionType(question.type),
      audio: null,
      transcript: "",
      audioHash,
      audioMode: audioPayload && audioPayload.data ? audioMode : "llm",
      sttKey,
      reasoningEffort: mainReasoningEffort
    };
    const cacheKey = directCacheKey(model, req);
    const cached = directCache.get(cacheKey);
    if (cached && Date.now() - cached.at < DIRECT_CACHE_TTL) {
      useLogStore().addLog("[直连] 命中本地缓存，跳过请求", "primary");
      return directEnvelope(req.stem, cached.kind, cached.values, "consensus", "[本地缓存] 该题此前已作答");
    }

    const hadAudio = Boolean(audioPayload && audioPayload.data);
    if (hadAudio) {
      if (audioMode === "stt") {
        const sttRes = await resolveClientSttTranscript({
          queryApi,
          audioPayload,
          audioHash,
          signal: context.signal
        });
        if (!sttRes.ok)
          return apiError(sttRes.message);
        req.transcript = sttRes.transcript;
      } else {
        req.audio = audioPayload;
      }
    }

    const logStore = useLogStore();
    const hasAudio = Boolean(req.audio && req.audio.data);
    const hasTranscript = Boolean(req.transcript && req.transcript.trim());
    if (!hadAudio && !context.skipDelay) {
      // 与代理链路保持同样的答题间隔，避免连发被上游限流
      await sleep(configStore.otherParams.params[0].value);
      if (context.signal == null ? void 0 : context.signal.aborted)
        return apiError("请求已取消");
    }
    const budget = (hasAudio || hasTranscript) ? DIRECT_AUDIO_TOTAL_BUDGET : DIRECT_TOTAL_BUDGET;
    const deadline = Date.now() + budget * 1e3;
    const promptText = buildDirectPrompt(req);
    const isValid = (raw) => processDirectAnswers(extractDirectValues(raw), req, req.options) !== null;
    // 每次尝试只用「剩余预算」当超时，仲裁那一路才不会跑过整题的总墙钟
    const call = (prompt, temperature, extra = {}) => directChatOnce({
      upstreamUrl,
      apiKey,
      model,
      prompt,
      temperature,
      audio: req.audio,
      reasoningEffort: mainReasoningEffort,
      timeout: Math.max(3e3, deadline - Date.now()),
      ...extra
    });

    const finish = (kind, values, checkStatus, detail) => {
      directCache.set(cacheKey, { kind, values, at: Date.now() });
      const valSummary = Array.isArray(values) ? values.join(" | ") : String(values || "");
      const cutVal = valSummary.length > 140 ? valSummary.slice(0, 140) + "..." : valSummary;
      if (cutVal)
        logStore.addLog(`[直连] 采纳答案：${cutVal}`, "primary");
      return directEnvelope(req.stem, kind, values, checkStatus, detail);
    };

    if (queryApi.directDoubleCheck === false) {
      logStore.addLog("[直连] 单路求解中（已关闭双路复核）...", "primary");
      try {
        const raw = await call(promptText, 0, { signal: context.signal });
        const processed = processDirectAnswers(extractDirectValues(raw), req, req.options);
        if (!processed)
          return apiError("上游未返回可用答案（对不上选项）");
        return finish(processed[0], processed[1], "consensus", "[直连单路] 已完成作答");
      } catch (err) {
        logStore.addLog(`[直连] 失败：${err.message}`, "error");
        return apiError(err.message || "直连请求失败");
      }
    }

    logStore.addLog("[直连] 双路并行复核中（免代理，直连上游）...", "primary");
    const promptPath2 = promptText + "\n\n【独立复核审题要求】：请仔细核对题目中的否定词、转折词、限定条件与时态细节，排除表面干扰项，给出最确凿的正确答案。";
    const [res1, res2] = await runDirectDual(
      [
        (signal) => call(promptText, 0, { signal }),
        (signal) => call(promptPath2, 0.3, { signal })
      ],
      deadline,
      (hasAudio || hasTranscript) ? DIRECT_AUDIO_PAIR_GRACE : DIRECT_PAIR_GRACE,
      isValid,
      context.signal
    );
    const fail1 = res1 instanceof Error ? res1 : null;
    const fail2 = res2 instanceof Error ? res2 : null;
    if (fail1 && fail2) {
      const message = /鉴权/.test(fail1.message) ? fail1.message : "上游服务暂时不可用，请稍后重试";
      logStore.addLog(`[直连] 双路均失败：${fail1.message} / ${fail2.message}`, "error");
      return apiError(message);
    }
    const ans1 = typeof res1 === "string" ? processDirectAnswers(extractDirectValues(res1), req, req.options) : null;
    const ans2 = typeof res2 === "string" ? processDirectAnswers(extractDirectValues(res2), req, req.options) : null;

    if (directAnswersMatch(ans1, ans2)) {
      const detail = "[直连双AI复核通过] 两路独立作答完全一致 (2/2 通过)";
      logStore.addLog(detail, "success");
      return finish(ans1[0], ans1[1], "consensus", detail);
    }
    if (!ans1 && !ans2) {
      logStore.addLog("[直连] 两路都没吸附到选项", "error");
      return apiError("上游未返回可用答案（对不上选项）");
    }

    const remaining = deadline - Date.now();
    let ansArb = null;
    if (remaining < DIRECT_MIN_ARBITRATE_BUDGET * 1e3) {
      logStore.addLog(`[直连] 预算不足，跳过第 3 路仲裁（剩余 ${(remaining / 1e3).toFixed(1)}s）`, "warning");
    } else {
      logStore.addLog("[直连] 双路结论不一致，派第 3 路专家仲裁...", "warning");
      try {
        const rawArb = await call(
          buildDirectArbitratePrompt(req, req.options, buildDirectDiscrepancy(ans1, ans2)),
          0.1,
          { reasoningEffort: arbReasoningEffort, signal: context.signal }
        );
        ansArb = processDirectAnswers(extractDirectValues(rawArb), req, req.options);
      } catch (err) {
        logStore.addLog(`[直连] 仲裁失败：${err.message}`, "warning");
      }
    }
    if (ansArb) {
      let adopted = "第 3 路专家裁定";
      if (ans1 && directAnswersMatch(ans1, ansArb))
        adopted = "第 1 路";
      else if (ans2 && directAnswersMatch(ans2, ansArb))
        adopted = "第 2 路";
      const detail = `[直连双AI分歧 -> 第3路终审完成] 裁决采纳：${adopted}`;
      logStore.addLog(detail, "success");
      return finish(ansArb[0], ansArb[1], "arbitrated", detail);
    }
    if (ans1 || ans2) {
      const [kind, values] = ans1 || ans2;
      const detail = ans1 ? "[直连单路有效作答] 第 1 路有效，第 2 路异常" : "[直连单路有效作答] 第 2 路有效，第 1 路异常";
      logStore.addLog(detail, "warning");
      return finish(kind, values, "fallback", detail);
    }
    return apiError("直连双路结果不一致且仲裁未达成共识，已放弃作答以防扣分");
  };

  const getAnswer = async (question, context = {}) => {
    var _a, _b, _c;
    const isCurrent = () => {
      var _a2, _b2;
      return !((_a2 = context.signal) == null ? void 0 : _a2.aborted) && (((_b2 = context.isCurrent) == null ? void 0 : _b2.call(context)) ?? true);
    };
    if (!isCurrent())
      return apiError("请求已取消");
    const configStore = useConfigStore();
    const queryApi = configStore.queryApis[0] || {};
    const endpoint = (queryApi.endpoint || "").trim();
    if (!endpoint)
      return apiError("请先在答题面板填写端点（自建代理地址）或上游地址（以 /v1 结尾）");
    if (detectApiMode(endpoint) === "direct")
      return directGetAnswer(question, context);
    const consumerToken = ((_a = queryApi.token) == null ? void 0 : _a.trim()) || "";
    const apiBaseUrl = endpoint;
    let url2;
    try {
      const baseUrl = new URL(apiBaseUrl);
      if (baseUrl.protocol !== "https:")
        return apiError("开放 API 地址必须使用 HTTPS");
      url2 = withScriptInfoParams(new URL(EXACT_SEARCH_PATH, baseUrl).toString());
    } catch {
      return apiError("开放 API 地址不正确，请检查配置");
    }
    const headers = {
      "Content-Type": "application/json"
    };
    if (consumerToken)
      headers["X-Consumer-Token"] = consumerToken;

    const audioMode = queryApi.audioMode === "stt" ? "stt" : "llm";
    let audioPayload = await prepareQuestionAudio(question, context.signal);
    if (!isCurrent())
      return apiError("请求已取消");
    if (!audioPayload && question.audioError && audioMode === "stt") {
      return apiError(`检测到听力音频但获取失败，已中止以免未转写盲猜：${question.audioError}`);
    }
    const postPayload = {
      "stem": ((_b = question.searchText) == null ? void 0 : _b.stem) ?? question.title,
      "options": ((_c = question.searchText) == null ? void 0 : _c.options) ?? question.optionsText,
      "type": normalizeQuestionType(question.type),
      "audio_mode": audioMode,
      "reasoning_effort": normalizeReasoningEffortSetting(queryApi.reasoningEffort)
    };
    const selectedModel = (queryApi?.model || "").trim();
    if (selectedModel) {
      postPayload.model = selectedModel;
    }
    const hadAudio = Boolean(audioPayload && audioPayload.data);
    if (hadAudio) {
      const audioHash = hashAudioData(audioPayload.data);
      postPayload.audio_hash = audioHash;
      if (audioMode === "stt" && (queryApi.sttEndpoint || "").trim()) {
        const sttRes = await resolveClientSttTranscript({
          queryApi,
          audioPayload,
          audioHash,
          signal: context.signal
        });
        if (!sttRes.ok)
          return apiError(sttRes.message);
        postPayload.audio_transcript = sttRes.transcript;
      } else {
        postPayload.audio = audioPayload;
      }
    }
    const data = JSON.stringify(postPayload);
    const needsAudioTimeout = Boolean(postPayload.audio && postPayload.audio.data);
    const requestTimeout = needsAudioTimeout ? 18e4 : 9e4;

    const logStore = useLogStore();
    if (postPayload.audio_transcript) {
      logStore.addLog("[双AI并行] 听力转写已就绪，正在双路模型并行求解...", "primary");
    } else if (needsAudioTimeout) {
      logStore.addLog("[双AI并行] 听力音频已就绪，正在双路独立模型并行求解（已跳过额外等待）...", "primary");
    } else {
      if (!context.skipDelay)
        await sleep(configStore.otherParams.params[0].value);
      logStore.addLog("[双AI并行] 正在双路独立模型并行求解，请稍候...", "primary");
    }
    if (!isCurrent())
      return apiError("请求已取消");
    return new Promise((resolve) => {
      var _a2, _b2;
      let settled = false;
      let request;
      const finish = (result) => {
        var _a3;
        if (settled)
          return;
        settled = true;
        (_a3 = context.signal) == null ? void 0 : _a3.removeEventListener("abort", abort);
        resolve(result);
      };
      const abort = () => {
        finish(apiError("请求已取消"));
        request == null ? void 0 : request.abort();
      };
      (_a2 = context.signal) == null ? void 0 : _a2.addEventListener("abort", abort, { once: true });
      if (!isCurrent())
        return abort();
      try {
        request = _GM_xmlhttpRequest({
          url: url2,
          method: "POST",
          headers,
          data,
          timeout: requestTimeout,
          onload: (response) => {
            var _a3;
            if (!isCurrent())
              return finish(apiError("请求已取消"));
            let result;
            try {
              result = parseExactResponse(JSON.parse(response.responseText), response.status);
            } catch (e) {
              result = apiError("接口响应解析出错");
            }
            if (response.status === 401 && ((_a3 = result.error) == null ? void 0 : _a3.code) === "CLIENT_ERROR") {
              result = apiError("密钥无效，请在答题面板填写正确的 CPA API Key", response.status);
            }
            finish(result);
          },
          onerror: (err) => { console.error("GM_xhr error:", err); finish(apiError("请求出错: " + (err.statusText || err.error || err.status || "网络错误"))); },
          ontimeout: () => finish(apiError("请求超时")),
          onabort: () => finish(apiError("请求已取消"))
        });
        if ((_b2 = context.signal) == null ? void 0 : _b2.aborted)
          request == null ? void 0 : request.abort();
      } catch {
        finish(apiError("请求出错"));
      }
    });
  };
  const toAnnouncementItems = (notice) => {
    const content = notice.trim();
    return content ? [{ id: "remote-notice", content }] : [];
  };
  const getNotice = async () => {
    if (noticeCache) {
      return noticeCache.items;
    }
    if (noticeRequest) {
      return noticeRequest;
    }
    // 公告挂在自建代理上（直连上游没有这个路由），所以只有填了站点根地址时才去问。
    const endpoint = (useConfigStore().queryApis[0] || {}).endpoint || "";
    if (!endpoint || detectApiMode(endpoint) === "direct")
      return [];
    let noticeUrl;
    try {
      noticeUrl = withScriptInfoParams(new URL(NOTICE_PATH, endpoint).toString());
    } catch {
      return [];
    }
    noticeRequest = new Promise((resolve) => {
      _GM_xmlhttpRequest({
        url: noticeUrl,
        method: "GET",
        headers: { "Content-Type": "application/json" },
        timeout: 1e4,
        onload: (response) => {
          try {
            const apiResponse = JSON.parse(response.responseText);
            resolve(apiResponse.code === 1 ? toAnnouncementItems(apiResponse.data || "") : []);
          } catch (e) {
            resolve([]);
          }
        },
        onerror: () => resolve([]),
        ontimeout: () => resolve([])
      });
    }).then((items) => {
      noticeCache = {
        items
      };
      return items;
    }).finally(() => {
      noticeRequest = null;
    });
    return noticeRequest;
  };
  const _hoisted_1$5 = { class: "script-home" };
  const ANSWER_TAB_NAME$1 = "1";
  const _sfc_main$8 = /* @__PURE__ */ vue.defineComponent({
    __name: "index",
    props: {
      logList: {}
    },
    setup(__props) {
      const configStore = useConfigStore();
      const announcements = vue.ref([]);
      vue.onMounted(async () => {
        announcements.value = await getNotice();
      });
      const handleLogClick = (event) => {
        const target = event.target;
        const actionElement = target == null ? void 0 : target.closest('[data-log-action="show-answer-tab"]');
        if (!actionElement)
          return;
        event.preventDefault();
        configStore.menuIndex = ANSWER_TAB_NAME$1;
      };
      return (_ctx, _cache) => {
        const _component_el_text = vue.resolveComponent("el-text");
        const _component_el_divider = vue.resolveComponent("el-divider");
        const _component_el_scrollbar = vue.resolveComponent("el-scrollbar");
        return vue.openBlock(), vue.createElementBlock("div", _hoisted_1$5, [
          vue.createVNode(_sfc_main$9, { items: announcements.value }, null, 8, ["items"]),
          vue.createVNode(_component_el_scrollbar, {
            always: "",
            class: "log",
            "max-height": "230px",
            onClick: handleLogClick
          }, {
            default: vue.withCtx(() => [
              (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(_ctx.logList, (item, index) => {
                return vue.openBlock(), vue.createElementBlock("div", { key: index }, [
                  vue.createVNode(_component_el_text, {
                    class: "log-time",
                    size: "small",
                    type: "info"
                  }, {
                    default: vue.withCtx(() => [
                      vue.createTextVNode(vue.toDisplayString(item.time), 1)
                    ]),
                    _: 2
                  }, 1024),
                  vue.createVNode(_component_el_text, null, {
                    default: vue.withCtx(() => [
                      vue.createTextVNode(" ")
                    ]),
                    _: 1
                  }),
                  vue.createVNode(_component_el_text, {
                    type: item.type ? item.type : "primary",
                    size: "small",
                    innerHTML: item.message
                  }, null, 8, ["type", "innerHTML"]),
                  vue.createVNode(_component_el_divider, {
                    class: "log-divider",
                    "border-style": "dashed"
                  })
                ]);
              }), 128))
            ]),
            _: 1
          })
        ]);
      };
    }
  });
  const _hoisted_1$4 = { class: "setting" };
  const _hoisted_2$4 = { class: "setting-section-title" };
  const _hoisted_3$2 = { class: "setting-section-title" };
  const _sfc_main$7 = /* @__PURE__ */ vue.defineComponent({
    __name: "index",
    props: {
      globalConfig: {}
    },
    setup(__props) {
      return (_ctx, _cache) => {
        const _component_el_divider = vue.resolveComponent("el-divider");
        const _component_el_checkbox = vue.resolveComponent("el-checkbox");
        const _component_el_input_number = vue.resolveComponent("el-input-number");
        const _component_el_form_item = vue.resolveComponent("el-form-item");
        return vue.openBlock(), vue.createElementBlock("div", _hoisted_1$4, [
          (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(_ctx.globalConfig.platformParams[_ctx.globalConfig.platformName].parts, (part) => {
            return vue.openBlock(), vue.createElementBlock("div", {
              key: part.name
            }, [
              vue.createVNode(_component_el_divider, { "border-style": "dashed" }, {
                default: vue.withCtx(() => [
                  vue.createElementVNode("span", _hoisted_2$4, vue.toDisplayString(part.name), 1)
                ]),
                _: 2
              }, 1024),
              (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(part.params, (param) => {
                return vue.openBlock(), vue.createElementBlock(vue.Fragment, {
                  key: param.name
                }, [
                  param.type === "boolean" ? (vue.openBlock(), vue.createBlock(_component_el_checkbox, {
                    key: 0,
                    class: "setting-checkbox",
                    modelValue: param.value,
                    "onUpdate:modelValue": ($event) => param.value = $event,
                    label: param.name,
                    size: "small"
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "label"])) : (vue.openBlock(), vue.createBlock(_component_el_form_item, {
                    key: 1,
                    label: param.name,
                    required: ""
                  }, {
                    default: vue.withCtx(() => [
                      vue.createVNode(_component_el_input_number, {
                        modelValue: param.value,
                        "onUpdate:modelValue": ($event) => param.value = $event,
                        min: param.min ?? 3e3,
                        max: param.max,
                        step: param.step ?? 1e3,
                        "controls-position": "right",
                        size: "small"
                      }, null, 8, ["modelValue", "onUpdate:modelValue", "min", "max", "step"])
                    ]),
                    _: 2
                  }, 1032, ["label"]))
                ], 64);
              }), 128))
            ]);
          }), 128)),
          vue.createElementVNode("div", null, [
            vue.createVNode(_component_el_divider, { "border-style": "dashed" }, {
              default: vue.withCtx(() => [
                vue.createElementVNode("span", _hoisted_3$2, vue.toDisplayString(_ctx.globalConfig.otherParams.name), 1)
              ]),
              _: 1
            }),
            (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(_ctx.globalConfig.otherParams.params, (item) => {
              return vue.openBlock(), vue.createElementBlock(vue.Fragment, {
                key: item.name
              }, [
                item.type === "boolean" ? (vue.openBlock(), vue.createBlock(_component_el_checkbox, {
                  key: 0,
                  modelValue: item.value,
                  "onUpdate:modelValue": ($event) => item.value = $event,
                  size: "small"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])) : (vue.openBlock(), vue.createBlock(_component_el_form_item, {
                  key: 1,
                  class: "setting-number",
                  label: item.name,
                  required: "",
                  size: "small"
                }, {
                  default: vue.withCtx(() => [
                    vue.createVNode(_component_el_input_number, {
                      modelValue: item.value,
                      "onUpdate:modelValue": ($event) => item.value = $event,
                      min: item.min ?? 3,
                      max: item.max ?? 100,
                      step: item.step ?? 1,
                      size: "small"
                    }, null, 8, ["modelValue", "onUpdate:modelValue", "min", "max", "step"])
                  ]),
                  _: 2
                }, 1032, ["label"]))
              ], 64);
            }), 128))
          ])
        ]);
      };
    }
  });
  const _hoisted_1$3 = { class: "question_table" };
  const _hoisted_model_row = { class: "model-row" };
  const _hoisted_endpoint_row = { class: "endpoint-row" };
  const _hoisted_audio_mode_row = { class: "audio-mode-row" };
  const _hoisted_audio_mode_label = { class: "audio-mode-label" };
  const _hoisted_reasoning_row = { class: "audio-mode-row reasoning-effort-row" };
  const _hoisted_reasoning_label = { class: "audio-mode-label" };
  const _hoisted_stt_panel = { key: 0, class: "stt-panel" };
  const _hoisted_stt_header = { class: "stt-panel-header" };
  const _hoisted_stt_title = { class: "stt-panel-title" };
  const _hoisted_stt_endpoint_row = { class: "endpoint-row stt-endpoint-row" };
  const _hoisted_stt_model_row = { class: "model-row stt-model-row" };
  const REASONING_EFFORT_HELP_HTML = '<div style="max-width:320px;line-height:1.6"><b>思考强度（<code>reasoning_effort</code>）</b>：<br/>• <b>自动（推荐）</b>：模型名含 <code>flash</code>（如 <code>MiniMax-M3.1-Flash</code>、<code>gemini-3.8-flash</code>）自动设为 <b><code>high</code></b>，其余模型主路走默认、仲裁用 <code>medium</code>。<br/>• <b>默认</b>：主路不传该字段，仅仲裁用 <code>medium</code>。<br/>• <b>low / medium / high</b>：强制指定上游思考深度（非思考模型若拒收会自动摘除重试）。</div>';
  const AUDIO_MODE_HELP_HTML = '<div style="max-width:300px;line-height:1.6"><b>大模型直听</b>：直接将音频发给当前答题模型（仅原生音频模型可用，纯文本模型可能会忽略音频而盲猜）。<br/><b>STT 转文字</b>：先调用你自定义的 STT 接口把音频转为文字稿，再交给任意纯文本模型作答；同段音频会缓存，只转写 1 次。</div>';
  const STT_DIY_HELP_HTML = '<div style="max-width:360px;line-height:1.65"><b>支持两类 HTTP 语音转写协议（按填写地址自动识别，不硬编码）：</b><br/>1) <b>OpenAI 兼容</b>（<code>/v1/audio/transcriptions</code>，Bearer 鉴权）<br/>　• 硅基流动：<code>https://api.siliconflow.cn/v1</code>（如 <code>FunAudioLLM/SenseVoiceSmall</code>）<br/>　• Groq：<code>https://api.groq.com/openai/v1</code>（如 <code>whisper-large-v3-turbo</code>）<br/>　• 自建 / 本地：<code>http://127.0.0.1:8000/v1</code>（仅回环地址允许 HTTP）<br/>2) <b>Deepgram REST</b>（<code>/v1/listen</code>，自动切 Token 鉴权）<br/>　• 地址填：<code>https://api.deepgram.com/v1/listen</code>（模型填 <code>nova-3</code> 或 <code>nova-2</code>）<br/>　• 若英语听力片头含中文播报，建议地址加 <code>?language=en</code> 防误判语种，或改用 <code>whisper-large</code>。<br/>　• ⚠️ <b>不支持</b> <code>ws://</code> / <code>wss://</code> 实时流式端点，Deepgram 请用上方 REST 地址。<br/>• <b>密钥/模型</b>：无鉴权服务密钥可留空；点「刷新」拉取模型，或直接手输模型名回车。</div>';
  const _hoisted_2$3 = /* @__PURE__ */ vue.createStaticVNode('<div class="answer-legend" aria-label="答案状态说明"><span class="answer-result--success">有答案</span><span class="answer-result--searching">查询中</span><span class="answer-result--pending">等待中</span><span class="answer-result--error">未找到 / 失败</span></div>', 1);
  const _hoisted_3$1 = ["innerHTML"];
  const _hoisted_4$2 = { key: 0 };
  const _hoisted_5 = { key: 1 };
  const _hoisted_6 = ["innerHTML"];
  const _sfc_main$6 = /* @__PURE__ */ vue.defineComponent({
    __name: "QuestionTable",
    props: {
      questionList: {}
    },
    setup(__props) {
      const isTokenEditing = vue.ref(false);
      const isSttTokenEditing = vue.ref(false);
      const configStore = useConfigStore();
      // 模型列表从上游拉取；拉取失败只提示，不影响答题（请求里不带 model，走服务端默认）。
      const modelOptions = vue.ref([]);
      const modelLoading = vue.ref(false);
      const modelError = vue.ref("");
      const defaultModel = vue.ref("");
      // 拉取途中若又请求刷新（例如刚切了模式），标记一下，等本轮结束再补一次
      const modelReloadPending = vue.ref(false);
      const loadModels = async () => {
        if (modelLoading.value) {
          modelReloadPending.value = true;
          return;
        }
        modelLoading.value = true;
        modelError.value = "";
        try {
          const res = await fetchModels();
          if (res.ok) {
            modelOptions.value = res.models;
            defaultModel.value = res.defaultModel || "";
          } else {
            modelError.value = res.error || "拉取模型列表失败";
          }
        } finally {
          modelLoading.value = false;
          if (modelReloadPending.value) {
            modelReloadPending.value = false;
            loadModels();
          }
        }
      };
      const sttModelOptions = vue.ref([]);
      const sttModelLoading = vue.ref(false);
      const sttModelError = vue.ref("");
      const sttModelReloadPending = vue.ref(false);
      const loadSttModels = async () => {
        if (sttModelLoading.value) {
          sttModelReloadPending.value = true;
          return;
        }
        sttModelLoading.value = true;
        sttModelError.value = "";
        try {
          const res = await fetchSttModels();
          if (res.ok) {
            sttModelOptions.value = res.models;
          } else {
            sttModelError.value = res.error || "拉取 STT 模型列表失败";
          }
        } finally {
          sttModelLoading.value = false;
          if (sttModelReloadPending.value) {
            sttModelReloadPending.value = false;
            loadSttModels();
          }
        }
      };
      const loadSttModelsIfReady = () => {
        if ((configStore.queryApis[0].sttEndpoint || "").trim())
          loadSttModels();
      };
      vue.onMounted(() => {
        loadModels();
        if (configStore.queryApis[0].audioMode === "stt" && (configStore.queryApis[0].sttEndpoint || "").trim())
          loadSttModels();
      });
      // 地址形态决定链路（/vN 结尾 = 直连上游，否则 = 自建代理），面板不再单独提供模式开关。
      const currentMode = vue.computed(() => detectApiMode(configStore.queryApis[0].endpoint));
      // 填/改地址等于换了数据源，模型列表必须重拉，否则下拉里还是另一条链路的结果
      vue.watch(currentMode, () => {
        modelOptions.value = [];
        defaultModel.value = "";
        modelError.value = "";
        loadModels();
      });
      const currentAudioMode = vue.computed(() => configStore.queryApis[0].audioMode === "stt" ? "stt" : "llm");
      const currentSttEndpoint = vue.computed(() => (configStore.queryApis[0].sttEndpoint || "").trim());
      vue.watch(currentSttEndpoint, (next, prev) => {
        if (next !== prev) {
          sttModelOptions.value = [];
          sttModelError.value = "";
        }
      });
      vue.watch(currentAudioMode, (mode) => {
        if (mode === "stt" && currentSttEndpoint.value && !sttModelOptions.value.length)
          loadSttModels();
      });
      const currentModel = vue.computed(() => (configStore.queryApis[0].model || "").trim());
      const currentReasoningEffort = vue.computed(() => normalizeReasoningEffortSetting(configStore.queryApis[0].reasoningEffort));
      const reasoningEffortBadge = vue.computed(() => {
        const setting = currentReasoningEffort.value;
        if (setting === "auto") {
          return isFlashModelName(currentModel.value) ? "flash 自动: high" : "";
        }
        return setting === "default" ? "" : `强制: ${setting}`;
      });
      const modelLabel = vue.computed(() => {
        const hit = modelOptions.value.find((item) => item.id === currentModel.value);
        return hit ? hit.name : currentModel.value;
      });
      const currentSttModel = vue.computed(() => (configStore.queryApis[0].sttModel || "").trim());
      const sttModelLabel = vue.computed(() => {
        const hit = sttModelOptions.value.find((item) => item.id === currentSttModel.value);
        return hit ? hit.name : currentSttModel.value;
      });
      const sttEndpointStatus = vue.computed(() => {
        const raw = currentSttEndpoint.value;
        if (!raw) {
          return { tone: "muted", text: "支持 OpenAI /v1 · Deepgram /v1/listen" };
        }
        try {
          const parsed = normalizeSttEndpoints(raw);
          return parsed.protocol === "deepgram"
            ? { tone: "ok", text: "已识别：Deepgram REST (Token)" }
            : { tone: "ok", text: "已识别：OpenAI 兼容 (Bearer)" };
        } catch (err) {
          const msg = err instanceof Error ? err.message : "端点格式有误";
          const short = /^暂不支持 ws/.test(msg)
            ? "不支持 ws/wss，请改用 https://.../v1/listen"
            : (/HTTPS/.test(msg) ? "仅本机回环允许 HTTP，其余须 HTTPS" : "端点地址格式有误");
          return { tone: "warn", text: short };
        }
      });
      const getDisplayTitle = (question) => {
        var _a;
        return ((_a = question.searchText) == null ? void 0 : _a.stem) || question.title;
      };
      const getAnswerStatus = (question) => question.answerStatus ?? (question.answer.length ? "success" : "pending");
      return (_ctx, _cache) => {
        const _component_el_button = vue.resolveComponent("el-button");
        const _component_el_icon = vue.resolveComponent("el-icon");
        const _component_el_input = vue.resolveComponent("el-input");
        const _component_el_option = vue.resolveComponent("el-option");
        const _component_el_radio_button = vue.resolveComponent("el-radio-button");
        const _component_el_radio_group = vue.resolveComponent("el-radio-group");
        const _component_el_select = vue.resolveComponent("el-select");
        const _component_el_tooltip = vue.resolveComponent("el-tooltip");
        const _component_el_table_column = vue.resolveComponent("el-table-column");
        const _component_el_table = vue.resolveComponent("el-table");
        const _component_el_empty = vue.resolveComponent("el-empty");
        return vue.openBlock(), vue.createElementBlock(vue.Fragment, null, [
          vue.createElementVNode("div", _hoisted_endpoint_row, [
            vue.createVNode(_component_el_input, {
              class: "endpoint-input",
              modelValue: vue.unref(configStore).queryApis[0].endpoint || "",
              "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => {
                const api = vue.unref(configStore).queryApis[0];
                api.endpoint = $event;
                api.mode = detectApiMode($event);
              }),
              size: "small",
              placeholder: "https://your-host（以 /v1 结尾则直连上游）"
            }, {
              prepend: vue.withCtx(() => [
                vue.createVNode(_component_el_button, { class: "token-label" }, {
                  default: vue.withCtx(() => [vue.createTextVNode("端点")]),
                  _: 1
                })
              ]),
              _: 2
            }, 1032, ["modelValue"]),
            currentMode.value === "direct" ? (vue.openBlock(), vue.createBlock(_component_el_tooltip, {
              key: 0,
              content: "关闭后只请求一次上游，省一半开销但少一层复核",
              placement: "top",
              effect: "dark",
              teleported: false
            }, {
              default: vue.withCtx(() => [
                vue.createVNode(_component_el_button, {
                  size: "small",
                  class: "direct-check-toggle",
                  type: vue.unref(configStore).queryApis[0].directDoubleCheck === false ? "info" : "primary",
                  plain: "",
                  onClick: _cache[5] || (_cache[5] = () => {
                    vue.unref(configStore).queryApis[0].directDoubleCheck = vue.unref(configStore).queryApis[0].directDoubleCheck === false;
                  })
                }, {
                  default: vue.withCtx(() => [
                    vue.createTextVNode(vue.toDisplayString(vue.unref(configStore).queryApis[0].directDoubleCheck === false ? "单路" : "双路"))
                  ]),
                  _: 1
                }, 8, ["type"])
              ]),
              _: 2
            }, 1032, ["content"])) : vue.createCommentVNode("", true)
          ]),
          vue.createVNode(_component_el_input, {
            class: "token-input",
            modelValue: vue.unref(configStore).queryApis[0].token,
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => vue.unref(configStore).queryApis[0].token = $event),
            type: isTokenEditing.value ? "text" : "password",
            onFocus: _cache[1] || (_cache[1] = ($event) => isTokenEditing.value = true),
            onBlur: _cache[2] || (_cache[2] = ($event) => isTokenEditing.value = false),
            placeholder: currentMode.value === "direct" ? "填写上游 API Key (如 sk-cpa-...)" : "填写 CPA API Key (如 sk-cpa-...)"
          }, {
            prepend: vue.withCtx(() => [
              vue.createVNode(_component_el_button, { class: "token-label" }, {
                default: vue.withCtx(() => [
                  vue.createTextVNode("密钥")
                ]),
                _: 1
              })
            ]),
            _: 1
          }, 8, ["modelValue", "type", "placeholder"]),
          vue.createElementVNode("div", _hoisted_model_row, [
            vue.createVNode(_component_el_select, {
              class: "model-select",
              modelValue: vue.unref(configStore).queryApis[0].model || "",
              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => vue.unref(configStore).queryApis[0].model = $event || ""),
              placeholder: modelLabel.value || "服务端默认模型",
              filterable: "",
              "allow-create": "",
              "default-first-option": "",
              clearable: "",
              loading: modelLoading.value,
              size: "small",
              teleported: false,
              style: "flex: 1 1 auto"
            }, {
              default: vue.withCtx(() => [
                vue.createVNode(_component_el_option, {
                  key: "__server_default__",
                  label: currentMode.value === "direct"
                    ? "未选择模型（直连必须选）"
                    : (defaultModel.value ? `服务端默认（${defaultModel.value}）` : "服务端默认模型"),
                  value: ""
                }),
                (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(modelOptions.value, (item) => {
                  return vue.openBlock(), vue.createBlock(_component_el_option, {
                    key: item.id,
                    label: item.name && item.name !== item.id ? `${item.name} · ${item.id}` : item.id,
                    value: item.id
                  }, null, 8, ["label", "value"]);
                }), 128)),
                currentModel.value && !modelOptions.value.some((item) => item.id === currentModel.value) ? (vue.openBlock(), vue.createBlock(_component_el_option, {
                  key: `stale-${currentModel.value}`,
                  label: `${currentModel.value}（不在当前列表）`,
                  value: currentModel.value
                })) : vue.createCommentVNode("", true)
              ]),
              _: 2
            }, 1032, ["modelValue", "placeholder", "loading"]),
            vue.createVNode(_component_el_tooltip, {
              content: modelError.value || "从上游刷新可用模型列表",
              placement: "top",
              effect: "dark",
              teleported: false
            }, {
              default: vue.withCtx(() => [
                vue.createVNode(_component_el_button, {
                  size: "small",
                  loading: modelLoading.value,
                  onClick: loadModels,
                  class: "model-refresh"
                }, {
                  default: vue.withCtx(() => [
                    vue.createTextVNode("刷新")
                  ]),
                  _: 1
                }, 1032, ["loading"])
              ]),
              _: 2
            }, 1032, ["content"])
          ]),
          vue.createElementVNode("div", _hoisted_reasoning_row, [
            vue.createElementVNode("span", _hoisted_reasoning_label, "思考强度"),
            vue.createVNode(_component_el_radio_group, {
              class: "reasoning-effort-group",
              size: "small",
              modelValue: currentReasoningEffort.value,
              "onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => {
                vue.unref(configStore).queryApis[0].reasoningEffort = normalizeReasoningEffortSetting($event);
              })
            }, {
              default: vue.withCtx(() => [
                vue.createVNode(_component_el_radio_button, { value: "auto" }, {
                  default: vue.withCtx(() => [vue.createTextVNode("自动")]),
                  _: 1
                }),
                vue.createVNode(_component_el_radio_button, { value: "default" }, {
                  default: vue.withCtx(() => [vue.createTextVNode("默认")]),
                  _: 1
                }),
                vue.createVNode(_component_el_radio_button, { value: "low" }, {
                  default: vue.withCtx(() => [vue.createTextVNode("low")]),
                  _: 1
                }),
                vue.createVNode(_component_el_radio_button, { value: "medium" }, {
                  default: vue.withCtx(() => [vue.createTextVNode("medium")]),
                  _: 1
                }),
                vue.createVNode(_component_el_radio_button, { value: "high" }, {
                  default: vue.withCtx(() => [vue.createTextVNode("high")]),
                  _: 1
                })
              ]),
              _: 1
            }, 8, ["modelValue"]),
            vue.createVNode(_component_el_tooltip, {
              content: REASONING_EFFORT_HELP_HTML,
              "raw-content": "",
              placement: "top",
              effect: "dark",
              teleported: false
            }, {
              default: vue.withCtx(() => [
                vue.createVNode(_component_el_icon, {
                  class: "help-icon reasoning-help-icon",
                  size: 15
                }, {
                  default: vue.withCtx(() => [vue.createVNode(vue.unref(question_filled_default))]),
                  _: 1
                })
              ]),
              _: 1
            }),
            reasoningEffortBadge.value ? (vue.openBlock(), vue.createElementBlock("span", {
              key: 0,
              class: "reasoning-effort-badge"
            }, vue.toDisplayString(reasoningEffortBadge.value), 1)) : vue.createCommentVNode("", true)
          ]),
          vue.createElementVNode("div", _hoisted_audio_mode_row, [
            vue.createElementVNode("span", _hoisted_audio_mode_label, "音频处理"),
            vue.createVNode(_component_el_radio_group, {
              class: "audio-mode-group",
              size: "small",
              modelValue: currentAudioMode.value,
              "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => {
                vue.unref(configStore).queryApis[0].audioMode = $event === "stt" ? "stt" : "llm";
              })
            }, {
              default: vue.withCtx(() => [
                vue.createVNode(_component_el_radio_button, { value: "llm" }, {
                  default: vue.withCtx(() => [vue.createTextVNode("大模型直听")]),
                  _: 1
                }),
                vue.createVNode(_component_el_radio_button, { value: "stt" }, {
                  default: vue.withCtx(() => [vue.createTextVNode("STT 转文字")]),
                  _: 1
                })
              ]),
              _: 1
            }, 8, ["modelValue"]),
            vue.createVNode(_component_el_tooltip, {
              content: AUDIO_MODE_HELP_HTML,
              "raw-content": "",
              placement: "top",
              effect: "dark",
              teleported: false
            }, {
              default: vue.withCtx(() => [
                vue.createVNode(_component_el_icon, {
                  class: "help-icon audio-help-icon",
                  size: 15
                }, {
                  default: vue.withCtx(() => [vue.createVNode(vue.unref(question_filled_default))]),
                  _: 1
                })
              ]),
              _: 1
            })
          ]),
          currentAudioMode.value === "stt" ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_stt_panel, [
            vue.createElementVNode("div", _hoisted_stt_header, [
              vue.createElementVNode("span", _hoisted_stt_title, [
                vue.createTextVNode("STT 语音转写配置（DIY）"),
                vue.createVNode(_component_el_tooltip, {
                  content: STT_DIY_HELP_HTML,
                  "raw-content": "",
                  placement: "top",
                  effect: "dark",
                  teleported: false
                }, {
                  default: vue.withCtx(() => [
                    vue.createVNode(_component_el_icon, {
                      class: "help-icon stt-help-icon",
                      size: 14
                    }, {
                      default: vue.withCtx(() => [vue.createVNode(vue.unref(question_filled_default))]),
                      _: 1
                    })
                  ]),
                  _: 1
                })
              ]),
              vue.createElementVNode("span", {
                class: vue.normalizeClass(["stt-protocol-badge", `stt-protocol-badge--${sttEndpointStatus.value.tone}`])
              }, vue.toDisplayString(sttEndpointStatus.value.text), 3)
            ]),
            vue.createElementVNode("div", _hoisted_stt_endpoint_row, [
              vue.createVNode(_component_el_input, {
                class: "endpoint-input stt-endpoint-input",
                modelValue: vue.unref(configStore).queryApis[0].sttEndpoint || "",
                "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => {
                  vue.unref(configStore).queryApis[0].sttEndpoint = $event;
                }),
                onBlur: loadSttModelsIfReady,
                size: "small",
                placeholder: currentMode.value === "direct"
                  ? "OpenAI 填 .../v1；Deepgram 填 https://api.deepgram.com/v1/listen"
                  : "填 .../v1 或 .../v1/listen（留空则走代理服务端 STT）"
              }, {
                prepend: vue.withCtx(() => [
                  vue.createVNode(_component_el_button, { class: "token-label" }, {
                    default: vue.withCtx(() => [vue.createTextVNode("STT 端点")]),
                    _: 1
                  })
                ]),
                _: 2
              }, 1032, ["modelValue", "placeholder"])
            ]),
            vue.createVNode(_component_el_input, {
              class: "token-input stt-token-input",
              modelValue: vue.unref(configStore).queryApis[0].sttToken || "",
              "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => vue.unref(configStore).queryApis[0].sttToken = $event),
              type: isSttTokenEditing.value ? "text" : "password",
              onFocus: _cache[9] || (_cache[9] = ($event) => isSttTokenEditing.value = true),
              onBlur: _cache[10] || (_cache[10] = ($event) => isSttTokenEditing.value = false),
              size: "small",
              placeholder: "填写 STT API Key（无鉴权可留空）"
            }, {
              prepend: vue.withCtx(() => [
                vue.createVNode(_component_el_button, { class: "token-label" }, {
                  default: vue.withCtx(() => [vue.createTextVNode("STT 密钥")]),
                  _: 1
                })
              ]),
              _: 1
            }, 8, ["modelValue", "type"]),
            vue.createElementVNode("div", _hoisted_stt_model_row, [
              vue.createVNode(_component_el_select, {
                class: "model-select stt-model-select",
                modelValue: vue.unref(configStore).queryApis[0].sttModel || "",
                "onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => vue.unref(configStore).queryApis[0].sttModel = $event || ""),
                placeholder: sttModelLabel.value || "选择或输入 STT 模型名回车（如 nova-3 / whisper-1）",
                filterable: "",
                "allow-create": "",
                "default-first-option": "",
                clearable: "",
                loading: sttModelLoading.value,
                size: "small",
                teleported: false,
                style: "flex: 1 1 auto"
              }, {
                default: vue.withCtx(() => [
                  (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(sttModelOptions.value, (item) => {
                    return vue.openBlock(), vue.createBlock(_component_el_option, {
                      key: item.id,
                      label: item.name && item.name !== item.id ? `${item.name} · ${item.id}` : item.id,
                      value: item.id
                    }, null, 8, ["label", "value"]);
                  }), 128)),
                  currentSttModel.value && !sttModelOptions.value.some((item) => item.id === currentSttModel.value) ? (vue.openBlock(), vue.createBlock(_component_el_option, {
                    key: `stt-custom-${currentSttModel.value}`,
                    label: sttModelOptions.value.length ? `${currentSttModel.value}（不在当前列表）` : `${currentSttModel.value}（自定义）`,
                    value: currentSttModel.value
                  })) : vue.createCommentVNode("", true)
                ]),
                _: 2
              }, 1032, ["modelValue", "placeholder", "loading"]),
              vue.createVNode(_component_el_tooltip, {
                content: sttModelError.value || "从 STT 上游刷新模型列表（不支持 /models 时可直接手输模型名）",
                placement: "top",
                effect: "dark",
                teleported: false
              }, {
                default: vue.withCtx(() => [
                  vue.createVNode(_component_el_button, {
                    size: "small",
                    loading: sttModelLoading.value,
                    onClick: loadSttModels,
                    class: "model-refresh stt-model-refresh"
                  }, {
                    default: vue.withCtx(() => [
                      vue.createTextVNode("刷新")
                    ]),
                    _: 1
                  }, 1032, ["loading"])
                ]),
                _: 2
              }, 1032, ["content"])
            ])
          ])) : vue.createCommentVNode("", true),
          vue.withDirectives(vue.createElementVNode("div", _hoisted_1$3, [
            _hoisted_2$3,
            vue.createVNode(_component_el_table, {
              stripe: "",
              data: _ctx.questionList,
              "max-height": "400",
              class: "question-list"
            }, {
              default: vue.withCtx(() => [
                vue.createVNode(_component_el_table_column, {
                  type: "index",
                  width: "40"
                }),
                vue.createVNode(_component_el_table_column, {
                  prop: "title",
                  label: "题目",
                  width: "370"
                }, {
                  default: vue.withCtx((scope) => [
                    vue.createElementVNode("span", {
                      innerHTML: getDisplayTitle(scope.row)
                    }, null, 8, _hoisted_3$1)
                  ]),
                  _: 1
                }),
                vue.createVNode(_component_el_table_column, {
                  prop: "answer",
                  label: "答案",
                  width: "215"
                }, {
                  default: vue.withCtx((scope) => [
                    vue.createElementVNode("div", {
                      class: vue.normalizeClass(["answer-result", `answer-result--${getAnswerStatus(scope.row)}`])
                    }, [
                      getAnswerStatus(scope.row) === "pending" ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_4$2, "等待查询…")) : getAnswerStatus(scope.row) === "searching" ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_5, "正在查询答案…")) : (vue.openBlock(), vue.createElementBlock("div", {
                        key: 2,
                        innerHTML: scope.row.answer.join()
                      }, null, 8, _hoisted_6))
                    ], 2)
                  ]),
                  _: 1
                })
              ]),
              _: 1
            }, 8, ["data"])
          ], 512), [
            [vue.vShow, _ctx.questionList.length]
          ]),
          vue.withDirectives(vue.createElementVNode("div", null, [
            vue.createVNode(_component_el_empty, { description: "该页面无需答题" })
          ], 512), [
            [vue.vShow, !_ctx.questionList.length]
          ])
        ], 64);
      };
    }
  });
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$5 = {};
  const _hoisted_1$2 = {
    class: "guide-page",
    "aria-label": "使用教程",
    tabindex: "0"
  };
  const _hoisted_2$2 = /* @__PURE__ */ vue.createStaticVNode('<header class="guide-header"><div class="guide-heading-row"><h2 class="guide-title">使用教程</h2><span class="guide-tag">脚本免费</span></div><p class="guide-subtitle">了解费用说明，按需配置你的题库。</p></header><ol class="guide-list"><li class="guide-card"><div class="guide-card-heading"><span class="guide-number" aria-hidden="true">01</span><h3 class="guide-card-title">脚本免费，题库单独收费</h3></div><p class="guide-copy">脚本开源，功能除接入的第三方题库外，完全免费，进入相应页面即可使用。<strong>题库资费由第三方题库开发者决定，与脚本作者无关。</strong>如不满意，可以自行接入自己的题库。</p></li><li class="guide-card"><div class="guide-card-heading"><span class="guide-number" aria-hidden="true">02</span><h3 class="guide-card-title">填写题库凭证</h3></div><p class="guide-copy">先填端点（自建代理填站点地址；以 /v1 结尾则直连上游），再填密钥。填写后会自动保存，请依次操作：</p><ol class="guide-flow" aria-label="题库密钥配置步骤"><li class="guide-flow-step"><span class="guide-flow-number" aria-hidden="true">1</span><span>打开「答题」</span></li><li class="guide-flow-step"><span class="guide-flow-number" aria-hidden="true">2</span><span>填端点与密钥</span></li><li class="guide-flow-step"><span class="guide-flow-number" aria-hidden="true">3</span><span>刷新页面</span></li></ol></li><li class="guide-card"><div class="guide-card-heading"><span class="guide-number" aria-hidden="true">03</span><h3 class="guide-card-title">听力题：大模型直听 / STT 转文字</h3></div><p class="guide-copy">纯文本模型不识别原生音频，可在「答题」页把<b>音频处理</b>切为<b>STT 转文字</b>。支持两类 HTTP 端点（不支持 <code>ws/wss</code>）：① <b>OpenAI 兼容</b>填到 <code>/v1</code>（如硅基流动、Groq、本机 Whisper）；② <b>Deepgram REST</b> 填 <code>https://api.deepgram.com/v1/listen</code>（模型填 <code>nova-3</code>）。详见输入框旁的小问号说明。</p></li></ol>', 2);
  const _hoisted_4$1 = [
    _hoisted_2$2
  ];
  function _sfc_render$1(_ctx, _cache) {
    return vue.openBlock(), vue.createElementBlock("section", _hoisted_1$2, _hoisted_4$1);
  }
  const Tutorial = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$1]]);
  const _sfc_main$4 = {};
  const _hoisted_1$1 = {
    class: "guide-page",
    "aria-label": "使用协议",
    tabindex: "0"
  };
  const _hoisted_2$1 = /* @__PURE__ */ vue.createStaticVNode('<header class="guide-header"><div class="guide-heading-row"><h2 class="guide-title">使用协议</h2><span class="guide-tag">共 6 项</span></div><p class="guide-subtitle">使用前，请仔细阅读以下声明。</p></header><ol class="guide-list"><li class="guide-card"><div class="guide-card-heading"><span class="guide-number" aria-hidden="true">01</span><h3 class="guide-card-title">学习与研究用途</h3></div><p class="guide-copy">本脚本仅供学习和研究目的使用，并应在24小时内删除。脚本的使用不应违反任何法律法规及学术道德标准。</p></li><li class="guide-card"><div class="guide-card-heading"><span class="guide-number" aria-hidden="true">02</span><h3 class="guide-card-title">遵守法律法规</h3></div><p class="guide-copy">用户在使用脚本时，必须遵守所有适用的法律法规。任何由于使用脚本而引起的违法行为或不当行为，其产生的一切后果由用户自行承担。</p></li><li class="guide-card"><div class="guide-card-heading"><span class="guide-number" aria-hidden="true">03</span><h3 class="guide-card-title">自行评估使用风险</h3></div><p class="guide-copy">开发者不对用户使用脚本所产生的任何直接或间接后果负责。用户应自行评估使用脚本的风险，并对任何可能的负面影响承担全责。</p></li><li class="guide-card"><div class="guide-card-heading"><span class="guide-number" aria-hidden="true">04</span><h3 class="guide-card-title">声明目的</h3></div><p class="guide-copy">本声明的目的在于提醒用户注意相关法律法规与风险，确保用户在明智、合法的前提下使用脚本。</p></li><li class="guide-card"><div class="guide-card-heading"><span class="guide-number" aria-hidden="true">05</span><h3 class="guide-card-title">有疑问时停止使用</h3></div><p class="guide-copy">如用户在使用脚本的过程中有任何疑问，建议立即停止使用，并删除所有相关文件。</p></li><li class="guide-card"><div class="guide-card-heading"><span class="guide-number" aria-hidden="true">06</span><h3 class="guide-card-title">最终解释权</h3></div><p class="guide-copy">本免责声明的最终解释权归脚本开发者所有。</p></li></ol>', 2);
  const _hoisted_4 = [
    _hoisted_2$1
  ];
  function _sfc_render(_ctx, _cache) {
    return vue.openBlock(), vue.createElementBlock("section", _hoisted_1$1, _hoisted_4);
  }
  const ScriptTip = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render]]);
  function isFunction(value) {
    return typeof value === "function";
  }
  function hasLift(source) {
    return isFunction(source === null || source === void 0 ? void 0 : source.lift);
  }
  function operate(init) {
    return function(source) {
      if (hasLift(source)) {
        return source.lift(function(liftedSource) {
          try {
            return init(liftedSource, this);
          } catch (err) {
            this.error(err);
          }
        });
      }
      throw new TypeError("Unable to lift unknown Observable type");
    };
  }
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2)
        if (Object.prototype.hasOwnProperty.call(b2, p))
          d2[p] = b2[p];
    };
    return extendStatics(d, b);
  };
  function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
      throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }
  function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  }
  function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() {
      if (t[0] & 1)
        throw t[1];
      return t[1];
    }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() {
      return this;
    }), g;
    function verb(n) {
      return function(v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f)
        throw new TypeError("Generator is already executing.");
      while (g && (g = 0, op[0] && (_ = 0)), _)
        try {
          if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
            return t;
          if (y = 0, t)
            op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2])
                _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5)
        throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  }
  function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m)
      return m.call(o);
    if (o && typeof o.length === "number")
      return {
        next: function() {
          if (o && i >= o.length)
            o = void 0;
          return { value: o && o[i++], done: !o };
        }
      };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
  }
  function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m)
      return o;
    var i = m.call(o), r, ar = [], e;
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
        ar.push(r.value);
    } catch (error) {
      e = { error };
    } finally {
      try {
        if (r && !r.done && (m = i["return"]))
          m.call(i);
      } finally {
        if (e)
          throw e.error;
      }
    }
    return ar;
  }
  function __spreadArray(to, from2, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from2.length, ar; i < l; i++) {
        if (ar || !(i in from2)) {
          if (!ar)
            ar = Array.prototype.slice.call(from2, 0, i);
          ar[i] = from2[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from2));
  }
  function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
  }
  function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator)
      throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function() {
      return this;
    }, i;
    function awaitReturn(f) {
      return function(v) {
        return Promise.resolve(v).then(f, reject);
      };
    }
    function verb(n, f) {
      if (g[n]) {
        i[n] = function(v) {
          return new Promise(function(a, b) {
            q.push([n, v, a, b]) > 1 || resume(n, v);
          });
        };
        if (f)
          i[n] = f(i[n]);
      }
    }
    function resume(n, v) {
      try {
        step(g[n](v));
      } catch (e) {
        settle(q[0][3], e);
      }
    }
    function step(r) {
      r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
    }
    function fulfill(value) {
      resume("next", value);
    }
    function reject(value) {
      resume("throw", value);
    }
    function settle(f, v) {
      if (f(v), q.shift(), q.length)
        resume(q[0][0], q[0][1]);
    }
  }
  function __asyncValues(o) {
    if (!Symbol.asyncIterator)
      throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
      return this;
    }, i);
    function verb(n) {
      i[n] = o[n] && function(v) {
        return new Promise(function(resolve, reject) {
          v = o[n](v), settle(resolve, reject, v.done, v.value);
        });
      };
    }
    function settle(resolve, reject, d, v) {
      Promise.resolve(v).then(function(v2) {
        resolve({ value: v2, done: d });
      }, reject);
    }
  }
  typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
  };
  var isArrayLike = function(x) {
    return x && typeof x.length === "number" && typeof x !== "function";
  };
  function isPromise(value) {
    return isFunction(value === null || value === void 0 ? void 0 : value.then);
  }
  function createErrorClass(createImpl) {
    var _super = function(instance) {
      Error.call(instance);
      instance.stack = new Error().stack;
    };
    var ctorFunc = createImpl(_super);
    ctorFunc.prototype = Object.create(Error.prototype);
    ctorFunc.prototype.constructor = ctorFunc;
    return ctorFunc;
  }
  var UnsubscriptionError = createErrorClass(function(_super) {
    return function UnsubscriptionErrorImpl(errors) {
      _super(this);
      this.message = errors ? errors.length + " errors occurred during unsubscription:\n" + errors.map(function(err, i) {
        return i + 1 + ") " + err.toString();
      }).join("\n  ") : "";
      this.name = "UnsubscriptionError";
      this.errors = errors;
    };
  });
  function arrRemove(arr, item) {
    if (arr) {
      var index = arr.indexOf(item);
      0 <= index && arr.splice(index, 1);
    }
  }
  var Subscription = function() {
    function Subscription2(initialTeardown) {
      this.initialTeardown = initialTeardown;
      this.closed = false;
      this._parentage = null;
      this._finalizers = null;
    }
    Subscription2.prototype.unsubscribe = function() {
      var e_1, _a, e_2, _b;
      var errors;
      if (!this.closed) {
        this.closed = true;
        var _parentage = this._parentage;
        if (_parentage) {
          this._parentage = null;
          if (Array.isArray(_parentage)) {
            try {
              for (var _parentage_1 = __values(_parentage), _parentage_1_1 = _parentage_1.next(); !_parentage_1_1.done; _parentage_1_1 = _parentage_1.next()) {
                var parent_1 = _parentage_1_1.value;
                parent_1.remove(this);
              }
            } catch (e_1_1) {
              e_1 = { error: e_1_1 };
            } finally {
              try {
                if (_parentage_1_1 && !_parentage_1_1.done && (_a = _parentage_1.return))
                  _a.call(_parentage_1);
              } finally {
                if (e_1)
                  throw e_1.error;
              }
            }
          } else {
            _parentage.remove(this);
          }
        }
        var initialFinalizer = this.initialTeardown;
        if (isFunction(initialFinalizer)) {
          try {
            initialFinalizer();
          } catch (e) {
            errors = e instanceof UnsubscriptionError ? e.errors : [e];
          }
        }
        var _finalizers = this._finalizers;
        if (_finalizers) {
          this._finalizers = null;
          try {
            for (var _finalizers_1 = __values(_finalizers), _finalizers_1_1 = _finalizers_1.next(); !_finalizers_1_1.done; _finalizers_1_1 = _finalizers_1.next()) {
              var finalizer = _finalizers_1_1.value;
              try {
                execFinalizer(finalizer);
              } catch (err) {
                errors = errors !== null && errors !== void 0 ? errors : [];
                if (err instanceof UnsubscriptionError) {
                  errors = __spreadArray(__spreadArray([], __read(errors)), __read(err.errors));
                } else {
                  errors.push(err);
                }
              }
            }
          } catch (e_2_1) {
            e_2 = { error: e_2_1 };
          } finally {
            try {
              if (_finalizers_1_1 && !_finalizers_1_1.done && (_b = _finalizers_1.return))
                _b.call(_finalizers_1);
            } finally {
              if (e_2)
                throw e_2.error;
            }
          }
        }
        if (errors) {
          throw new UnsubscriptionError(errors);
        }
      }
    };
    Subscription2.prototype.add = function(teardown) {
      var _a;
      if (teardown && teardown !== this) {
        if (this.closed) {
          execFinalizer(teardown);
        } else {
          if (teardown instanceof Subscription2) {
            if (teardown.closed || teardown._hasParent(this)) {
              return;
            }
            teardown._addParent(this);
          }
          (this._finalizers = (_a = this._finalizers) !== null && _a !== void 0 ? _a : []).push(teardown);
        }
      }
    };
    Subscription2.prototype._hasParent = function(parent) {
      var _parentage = this._parentage;
      return _parentage === parent || Array.isArray(_parentage) && _parentage.includes(parent);
    };
    Subscription2.prototype._addParent = function(parent) {
      var _parentage = this._parentage;
      this._parentage = Array.isArray(_parentage) ? (_parentage.push(parent), _parentage) : _parentage ? [_parentage, parent] : parent;
    };
    Subscription2.prototype._removeParent = function(parent) {
      var _parentage = this._parentage;
      if (_parentage === parent) {
        this._parentage = null;
      } else if (Array.isArray(_parentage)) {
        arrRemove(_parentage, parent);
      }
    };
    Subscription2.prototype.remove = function(teardown) {
      var _finalizers = this._finalizers;
      _finalizers && arrRemove(_finalizers, teardown);
      if (teardown instanceof Subscription2) {
        teardown._removeParent(this);
      }
    };
    Subscription2.EMPTY = function() {
      var empty = new Subscription2();
      empty.closed = true;
      return empty;
    }();
    return Subscription2;
  }();
  Subscription.EMPTY;
  function isSubscription(value) {
    return value instanceof Subscription || value && "closed" in value && isFunction(value.remove) && isFunction(value.add) && isFunction(value.unsubscribe);
  }
  function execFinalizer(finalizer) {
    if (isFunction(finalizer)) {
      finalizer();
    } else {
      finalizer.unsubscribe();
    }
  }
  var config = {
    onUnhandledError: null,
    onStoppedNotification: null,
    Promise: void 0,
    useDeprecatedSynchronousErrorHandling: false,
    useDeprecatedNextContext: false
  };
  var timeoutProvider = {
    setTimeout: function(handler, timeout) {
      var args = [];
      for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
      }
      return setTimeout.apply(void 0, __spreadArray([handler, timeout], __read(args)));
    },
    clearTimeout: function(handle) {
      return (clearTimeout)(handle);
    },
    delegate: void 0
  };
  function reportUnhandledError(err) {
    timeoutProvider.setTimeout(function() {
      {
        throw err;
      }
    });
  }
  function noop() {
  }
  function errorContext(cb) {
    {
      cb();
    }
  }
  var Subscriber = function(_super) {
    __extends(Subscriber2, _super);
    function Subscriber2(destination) {
      var _this = _super.call(this) || this;
      _this.isStopped = false;
      if (destination) {
        _this.destination = destination;
        if (isSubscription(destination)) {
          destination.add(_this);
        }
      } else {
        _this.destination = EMPTY_OBSERVER;
      }
      return _this;
    }
    Subscriber2.create = function(next, error, complete) {
      return new SafeSubscriber(next, error, complete);
    };
    Subscriber2.prototype.next = function(value) {
      if (this.isStopped)
        ;
      else {
        this._next(value);
      }
    };
    Subscriber2.prototype.error = function(err) {
      if (this.isStopped)
        ;
      else {
        this.isStopped = true;
        this._error(err);
      }
    };
    Subscriber2.prototype.complete = function() {
      if (this.isStopped)
        ;
      else {
        this.isStopped = true;
        this._complete();
      }
    };
    Subscriber2.prototype.unsubscribe = function() {
      if (!this.closed) {
        this.isStopped = true;
        _super.prototype.unsubscribe.call(this);
        this.destination = null;
      }
    };
    Subscriber2.prototype._next = function(value) {
      this.destination.next(value);
    };
    Subscriber2.prototype._error = function(err) {
      try {
        this.destination.error(err);
      } finally {
        this.unsubscribe();
      }
    };
    Subscriber2.prototype._complete = function() {
      try {
        this.destination.complete();
      } finally {
        this.unsubscribe();
      }
    };
    return Subscriber2;
  }(Subscription);
  var _bind = Function.prototype.bind;
  function bind(fn, thisArg) {
    return _bind.call(fn, thisArg);
  }
  var ConsumerObserver = function() {
    function ConsumerObserver2(partialObserver) {
      this.partialObserver = partialObserver;
    }
    ConsumerObserver2.prototype.next = function(value) {
      var partialObserver = this.partialObserver;
      if (partialObserver.next) {
        try {
          partialObserver.next(value);
        } catch (error) {
          handleUnhandledError(error);
        }
      }
    };
    ConsumerObserver2.prototype.error = function(err) {
      var partialObserver = this.partialObserver;
      if (partialObserver.error) {
        try {
          partialObserver.error(err);
        } catch (error) {
          handleUnhandledError(error);
        }
      } else {
        handleUnhandledError(err);
      }
    };
    ConsumerObserver2.prototype.complete = function() {
      var partialObserver = this.partialObserver;
      if (partialObserver.complete) {
        try {
          partialObserver.complete();
        } catch (error) {
          handleUnhandledError(error);
        }
      }
    };
    return ConsumerObserver2;
  }();
  var SafeSubscriber = function(_super) {
    __extends(SafeSubscriber2, _super);
    function SafeSubscriber2(observerOrNext, error, complete) {
      var _this = _super.call(this) || this;
      var partialObserver;
      if (isFunction(observerOrNext) || !observerOrNext) {
        partialObserver = {
          next: observerOrNext !== null && observerOrNext !== void 0 ? observerOrNext : void 0,
          error: error !== null && error !== void 0 ? error : void 0,
          complete: complete !== null && complete !== void 0 ? complete : void 0
        };
      } else {
        var context_1;
        if (_this && config.useDeprecatedNextContext) {
          context_1 = Object.create(observerOrNext);
          context_1.unsubscribe = function() {
            return _this.unsubscribe();
          };
          partialObserver = {
            next: observerOrNext.next && bind(observerOrNext.next, context_1),
            error: observerOrNext.error && bind(observerOrNext.error, context_1),
            complete: observerOrNext.complete && bind(observerOrNext.complete, context_1)
          };
        } else {
          partialObserver = observerOrNext;
        }
      }
      _this.destination = new ConsumerObserver(partialObserver);
      return _this;
    }
    return SafeSubscriber2;
  }(Subscriber);
  function handleUnhandledError(error) {
    {
      reportUnhandledError(error);
    }
  }
  function defaultErrorHandler(err) {
    throw err;
  }
  var EMPTY_OBSERVER = {
    closed: true,
    next: noop,
    error: defaultErrorHandler,
    complete: noop
  };
  var observable = function() {
    return typeof Symbol === "function" && Symbol.observable || "@@observable";
  }();
  function identity(x) {
    return x;
  }
  function pipeFromArray(fns) {
    if (fns.length === 0) {
      return identity;
    }
    if (fns.length === 1) {
      return fns[0];
    }
    return function piped(input) {
      return fns.reduce(function(prev, fn) {
        return fn(prev);
      }, input);
    };
  }
  var Observable = function() {
    function Observable2(subscribe) {
      if (subscribe) {
        this._subscribe = subscribe;
      }
    }
    Observable2.prototype.lift = function(operator) {
      var observable2 = new Observable2();
      observable2.source = this;
      observable2.operator = operator;
      return observable2;
    };
    Observable2.prototype.subscribe = function(observerOrNext, error, complete) {
      var _this = this;
      var subscriber = isSubscriber(observerOrNext) ? observerOrNext : new SafeSubscriber(observerOrNext, error, complete);
      errorContext(function() {
        var _a = _this, operator = _a.operator, source = _a.source;
        subscriber.add(operator ? operator.call(subscriber, source) : source ? _this._subscribe(subscriber) : _this._trySubscribe(subscriber));
      });
      return subscriber;
    };
    Observable2.prototype._trySubscribe = function(sink) {
      try {
        return this._subscribe(sink);
      } catch (err) {
        sink.error(err);
      }
    };
    Observable2.prototype.forEach = function(next, promiseCtor) {
      var _this = this;
      promiseCtor = getPromiseCtor(promiseCtor);
      return new promiseCtor(function(resolve, reject) {
        var subscriber = new SafeSubscriber({
          next: function(value) {
            try {
              next(value);
            } catch (err) {
              reject(err);
              subscriber.unsubscribe();
            }
          },
          error: reject,
          complete: resolve
        });
        _this.subscribe(subscriber);
      });
    };
    Observable2.prototype._subscribe = function(subscriber) {
      var _a;
      return (_a = this.source) === null || _a === void 0 ? void 0 : _a.subscribe(subscriber);
    };
    Observable2.prototype[observable] = function() {
      return this;
    };
    Observable2.prototype.pipe = function() {
      var operations = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        operations[_i] = arguments[_i];
      }
      return pipeFromArray(operations)(this);
    };
    Observable2.prototype.toPromise = function(promiseCtor) {
      var _this = this;
      promiseCtor = getPromiseCtor(promiseCtor);
      return new promiseCtor(function(resolve, reject) {
        var value;
        _this.subscribe(function(x) {
          return value = x;
        }, function(err) {
          return reject(err);
        }, function() {
          return resolve(value);
        });
      });
    };
    Observable2.create = function(subscribe) {
      return new Observable2(subscribe);
    };
    return Observable2;
  }();
  function getPromiseCtor(promiseCtor) {
    var _a;
    return (_a = promiseCtor !== null && promiseCtor !== void 0 ? promiseCtor : config.Promise) !== null && _a !== void 0 ? _a : Promise;
  }
  function isObserver(value) {
    return value && isFunction(value.next) && isFunction(value.error) && isFunction(value.complete);
  }
  function isSubscriber(value) {
    return value && value instanceof Subscriber || isObserver(value) && isSubscription(value);
  }
  function isInteropObservable(input) {
    return isFunction(input[observable]);
  }
  function isAsyncIterable(obj) {
    return Symbol.asyncIterator && isFunction(obj === null || obj === void 0 ? void 0 : obj[Symbol.asyncIterator]);
  }
  function createInvalidObservableTypeError(input) {
    return new TypeError("You provided " + (input !== null && typeof input === "object" ? "an invalid object" : "'" + input + "'") + " where a stream was expected. You can provide an Observable, Promise, ReadableStream, Array, AsyncIterable, or Iterable.");
  }
  function getSymbolIterator() {
    if (typeof Symbol !== "function" || !Symbol.iterator) {
      return "@@iterator";
    }
    return Symbol.iterator;
  }
  var iterator = getSymbolIterator();
  function isIterable(input) {
    return isFunction(input === null || input === void 0 ? void 0 : input[iterator]);
  }
  function readableStreamLikeToAsyncGenerator(readableStream) {
    return __asyncGenerator(this, arguments, function readableStreamLikeToAsyncGenerator_1() {
      var reader, _a, value, done;
      return __generator(this, function(_b) {
        switch (_b.label) {
          case 0:
            reader = readableStream.getReader();
            _b.label = 1;
          case 1:
            _b.trys.push([1, , 9, 10]);
            _b.label = 2;
          case 2:
            return [4, __await(reader.read())];
          case 3:
            _a = _b.sent(), value = _a.value, done = _a.done;
            if (!done)
              return [3, 5];
            return [4, __await(void 0)];
          case 4:
            return [2, _b.sent()];
          case 5:
            return [4, __await(value)];
          case 6:
            return [4, _b.sent()];
          case 7:
            _b.sent();
            return [3, 2];
          case 8:
            return [3, 10];
          case 9:
            reader.releaseLock();
            return [7];
          case 10:
            return [2];
        }
      });
    });
  }
  function isReadableStreamLike(obj) {
    return isFunction(obj === null || obj === void 0 ? void 0 : obj.getReader);
  }
  function innerFrom(input) {
    if (input instanceof Observable) {
      return input;
    }
    if (input != null) {
      if (isInteropObservable(input)) {
        return fromInteropObservable(input);
      }
      if (isArrayLike(input)) {
        return fromArrayLike(input);
      }
      if (isPromise(input)) {
        return fromPromise(input);
      }
      if (isAsyncIterable(input)) {
        return fromAsyncIterable(input);
      }
      if (isIterable(input)) {
        return fromIterable(input);
      }
      if (isReadableStreamLike(input)) {
        return fromReadableStreamLike(input);
      }
    }
    throw createInvalidObservableTypeError(input);
  }
  function fromInteropObservable(obj) {
    return new Observable(function(subscriber) {
      var obs = obj[observable]();
      if (isFunction(obs.subscribe)) {
        return obs.subscribe(subscriber);
      }
      throw new TypeError("Provided object does not correctly implement Symbol.observable");
    });
  }
  function fromArrayLike(array) {
    return new Observable(function(subscriber) {
      for (var i = 0; i < array.length && !subscriber.closed; i++) {
        subscriber.next(array[i]);
      }
      subscriber.complete();
    });
  }
  function fromPromise(promise) {
    return new Observable(function(subscriber) {
      promise.then(function(value) {
        if (!subscriber.closed) {
          subscriber.next(value);
          subscriber.complete();
        }
      }, function(err) {
        return subscriber.error(err);
      }).then(null, reportUnhandledError);
    });
  }
  function fromIterable(iterable) {
    return new Observable(function(subscriber) {
      var e_1, _a;
      try {
        for (var iterable_1 = __values(iterable), iterable_1_1 = iterable_1.next(); !iterable_1_1.done; iterable_1_1 = iterable_1.next()) {
          var value = iterable_1_1.value;
          subscriber.next(value);
          if (subscriber.closed) {
            return;
          }
        }
      } catch (e_1_1) {
        e_1 = { error: e_1_1 };
      } finally {
        try {
          if (iterable_1_1 && !iterable_1_1.done && (_a = iterable_1.return))
            _a.call(iterable_1);
        } finally {
          if (e_1)
            throw e_1.error;
        }
      }
      subscriber.complete();
    });
  }
  function fromAsyncIterable(asyncIterable) {
    return new Observable(function(subscriber) {
      process(asyncIterable, subscriber).catch(function(err) {
        return subscriber.error(err);
      });
    });
  }
  function fromReadableStreamLike(readableStream) {
    return fromAsyncIterable(readableStreamLikeToAsyncGenerator(readableStream));
  }
  function process(asyncIterable, subscriber) {
    var asyncIterable_1, asyncIterable_1_1;
    var e_2, _a;
    return __awaiter(this, void 0, void 0, function() {
      var value, e_2_1;
      return __generator(this, function(_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 5, 6, 11]);
            asyncIterable_1 = __asyncValues(asyncIterable);
            _b.label = 1;
          case 1:
            return [4, asyncIterable_1.next()];
          case 2:
            if (!(asyncIterable_1_1 = _b.sent(), !asyncIterable_1_1.done))
              return [3, 4];
            value = asyncIterable_1_1.value;
            subscriber.next(value);
            if (subscriber.closed) {
              return [2];
            }
            _b.label = 3;
          case 3:
            return [3, 1];
          case 4:
            return [3, 11];
          case 5:
            e_2_1 = _b.sent();
            e_2 = { error: e_2_1 };
            return [3, 11];
          case 6:
            _b.trys.push([6, , 9, 10]);
            if (!(asyncIterable_1_1 && !asyncIterable_1_1.done && (_a = asyncIterable_1.return)))
              return [3, 8];
            return [4, _a.call(asyncIterable_1)];
          case 7:
            _b.sent();
            _b.label = 8;
          case 8:
            return [3, 10];
          case 9:
            if (e_2)
              throw e_2.error;
            return [7];
          case 10:
            return [7];
          case 11:
            subscriber.complete();
            return [2];
        }
      });
    });
  }
  function createOperatorSubscriber(destination, onNext, onComplete, onError, onFinalize) {
    return new OperatorSubscriber(destination, onNext, onComplete, onError, onFinalize);
  }
  var OperatorSubscriber = function(_super) {
    __extends(OperatorSubscriber2, _super);
    function OperatorSubscriber2(destination, onNext, onComplete, onError, onFinalize, shouldUnsubscribe) {
      var _this = _super.call(this, destination) || this;
      _this.onFinalize = onFinalize;
      _this.shouldUnsubscribe = shouldUnsubscribe;
      _this._next = onNext ? function(value) {
        try {
          onNext(value);
        } catch (err) {
          destination.error(err);
        }
      } : _super.prototype._next;
      _this._error = onError ? function(err) {
        try {
          onError(err);
        } catch (err2) {
          destination.error(err2);
        } finally {
          this.unsubscribe();
        }
      } : _super.prototype._error;
      _this._complete = onComplete ? function() {
        try {
          onComplete();
        } catch (err) {
          destination.error(err);
        } finally {
          this.unsubscribe();
        }
      } : _super.prototype._complete;
      return _this;
    }
    OperatorSubscriber2.prototype.unsubscribe = function() {
      var _a;
      if (!this.shouldUnsubscribe || this.shouldUnsubscribe()) {
        var closed_1 = this.closed;
        _super.prototype.unsubscribe.call(this);
        !closed_1 && ((_a = this.onFinalize) === null || _a === void 0 ? void 0 : _a.call(this));
      }
    };
    return OperatorSubscriber2;
  }(Subscriber);
  function executeSchedule(parentSubscription, scheduler, work, delay, repeat) {
    if (delay === void 0) {
      delay = 0;
    }
    if (repeat === void 0) {
      repeat = false;
    }
    var scheduleSubscription = scheduler.schedule(function() {
      work();
      if (repeat) {
        parentSubscription.add(this.schedule(null, delay));
      } else {
        this.unsubscribe();
      }
    }, delay);
    parentSubscription.add(scheduleSubscription);
    if (!repeat) {
      return scheduleSubscription;
    }
  }
  function map(project, thisArg) {
    return operate(function(source, subscriber) {
      var index = 0;
      source.subscribe(createOperatorSubscriber(subscriber, function(value) {
        subscriber.next(project.call(thisArg, value, index++));
      }));
    });
  }
  function mergeInternals(source, subscriber, project, concurrent, onBeforeNext, expand, innerSubScheduler, additionalFinalizer) {
    var buffer = [];
    var active = 0;
    var index = 0;
    var isComplete = false;
    var checkComplete = function() {
      if (isComplete && !buffer.length && !active) {
        subscriber.complete();
      }
    };
    var outerNext = function(value) {
      return active < concurrent ? doInnerSub(value) : buffer.push(value);
    };
    var doInnerSub = function(value) {
      expand && subscriber.next(value);
      active++;
      var innerComplete = false;
      innerFrom(project(value, index++)).subscribe(createOperatorSubscriber(subscriber, function(innerValue) {
        onBeforeNext === null || onBeforeNext === void 0 ? void 0 : onBeforeNext(innerValue);
        if (expand) {
          outerNext(innerValue);
        } else {
          subscriber.next(innerValue);
        }
      }, function() {
        innerComplete = true;
      }, void 0, function() {
        if (innerComplete) {
          try {
            active--;
            var _loop_1 = function() {
              var bufferedValue = buffer.shift();
              if (innerSubScheduler) {
                executeSchedule(subscriber, innerSubScheduler, function() {
                  return doInnerSub(bufferedValue);
                });
              } else {
                doInnerSub(bufferedValue);
              }
            };
            while (buffer.length && active < concurrent) {
              _loop_1();
            }
            checkComplete();
          } catch (err) {
            subscriber.error(err);
          }
        }
      }));
    };
    source.subscribe(createOperatorSubscriber(subscriber, outerNext, function() {
      isComplete = true;
      checkComplete();
    }));
    return function() {
      additionalFinalizer === null || additionalFinalizer === void 0 ? void 0 : additionalFinalizer();
    };
  }
  function mergeMap(project, resultSelector, concurrent) {
    if (concurrent === void 0) {
      concurrent = Infinity;
    }
    if (isFunction(resultSelector)) {
      return mergeMap(function(a, i) {
        return map(function(b, ii) {
          return resultSelector(a, b, i, ii);
        })(innerFrom(project(a, i)));
      }, concurrent);
    } else if (typeof resultSelector === "number") {
      concurrent = resultSelector;
    }
    return operate(function(source, subscriber) {
      return mergeInternals(source, subscriber, project, concurrent);
    });
  }
  function mergeAll(concurrent) {
    if (concurrent === void 0) {
      concurrent = Infinity;
    }
    return mergeMap(identity, concurrent);
  }
  function concatAll() {
    return mergeAll(1);
  }
  function concatMap(project, resultSelector) {
    return isFunction(resultSelector) ? mergeMap(project, resultSelector, 1) : mergeMap(project, 1);
  }
  class IframeUtils {
    static getIframes(element) {
      return Array.from(element.querySelectorAll("iframe"));
    }
    static getAllNestedIframes(element) {
      const iframes = IframeUtils.getIframes(element);
      if (iframes.length === 0) {
        return rxjs.of([]);
      } else {
        return rxjs.from(iframes).pipe(
          mergeMap(
            (iframe) => new rxjs.Observable((subscriber) => {
              try {
                if (iframe.contentDocument && iframe.contentDocument.documentElement) {
                  const iframeDocument = iframe.contentDocument;
                  const nestedIframes = IframeUtils.getAllNestedIframes(iframeDocument.documentElement);
                  nestedIframes.subscribe({
                    next: (nestedIframes2) => {
                      subscriber.next([iframe, ...nestedIframes2]);
                    },
                    complete: () => subscriber.complete(),
                    error: () => {
                      subscriber.next([iframe]);
                      subscriber.complete();
                    }
                  });
                  return;
                }
              } catch (e) {}
              subscriber.next([iframe]);
              subscriber.complete();
            })
          ),
          concatAll(),
          rxjs.toArray()
        );
      }
    }
  }
  var Typr$1 = {};
  var Typr = {};
  Typr.parse = function(buff) {
    var bin = Typr._bin;
    var data = new Uint8Array(buff);
    var tag = bin.readASCII(data, 0, 4);
    if (tag == "ttcf") {
      var offset = 4;
      bin.readUshort(data, offset);
      offset += 2;
      bin.readUshort(data, offset);
      offset += 2;
      var numF = bin.readUint(data, offset);
      offset += 4;
      var fnts = [];
      for (var i = 0; i < numF; i++) {
        var foff = bin.readUint(data, offset);
        offset += 4;
        fnts.push(Typr._readFont(data, foff));
      }
      return fnts;
    } else
      return [Typr._readFont(data, 0)];
  };
  Typr._readFont = function(data, offset) {
    var bin = Typr._bin;
    var ooff = offset;
    bin.readFixed(data, offset);
    offset += 4;
    var numTables = bin.readUshort(data, offset);
    offset += 2;
    bin.readUshort(data, offset);
    offset += 2;
    bin.readUshort(data, offset);
    offset += 2;
    bin.readUshort(data, offset);
    offset += 2;
    var tags = [
      "cmap",
      "head",
      "hhea",
      "maxp",
      "hmtx",
      "name",
      "OS/2",
      "post",
      //"cvt",
      //"fpgm",
      "loca",
      "glyf",
      "kern",
      //"prep"
      //"gasp"
      "CFF ",
      "GPOS",
      "GSUB",
      "SVG "
      //"VORG",
    ];
    var obj = { _data: data, _offset: ooff };
    var tabs = {};
    for (var i = 0; i < numTables; i++) {
      var tag = bin.readASCII(data, offset, 4);
      offset += 4;
      bin.readUint(data, offset);
      offset += 4;
      var toffset = bin.readUint(data, offset);
      offset += 4;
      var length = bin.readUint(data, offset);
      offset += 4;
      tabs[tag] = { offset: toffset, length };
    }
    for (var i = 0; i < tags.length; i++) {
      var t = tags[i];
      if (tabs[t])
        obj[t.trim()] = Typr[t.trim()].parse(data, tabs[t].offset, tabs[t].length, obj);
    }
    return obj;
  };
  Typr._tabOffset = function(data, tab, foff) {
    var bin = Typr._bin;
    var numTables = bin.readUshort(data, foff + 4);
    var offset = foff + 12;
    for (var i = 0; i < numTables; i++) {
      var tag = bin.readASCII(data, offset, 4);
      offset += 4;
      bin.readUint(data, offset);
      offset += 4;
      var toffset = bin.readUint(data, offset);
      offset += 4;
      bin.readUint(data, offset);
      offset += 4;
      if (tag == tab)
        return toffset;
    }
    return 0;
  };
  Typr._bin = {
    readFixed: function(data, o) {
      return (data[o] << 8 | data[o + 1]) + (data[o + 2] << 8 | data[o + 3]) / (256 * 256 + 4);
    },
    readF2dot14: function(data, o) {
      var num = Typr._bin.readShort(data, o);
      return num / 16384;
    },
    readInt: function(buff, p) {
      return Typr._bin._view(buff).getInt32(p);
    },
    readInt8: function(buff, p) {
      return Typr._bin._view(buff).getInt8(p);
    },
    readShort: function(buff, p) {
      return Typr._bin._view(buff).getInt16(p);
    },
    readUshort: function(buff, p) {
      return Typr._bin._view(buff).getUint16(p);
    },
    readUshorts: function(buff, p, len) {
      var arr = [];
      for (var i = 0; i < len; i++)
        arr.push(Typr._bin.readUshort(buff, p + i * 2));
      return arr;
    },
    readUint: function(buff, p) {
      return Typr._bin._view(buff).getUint32(p);
    },
    readUint64: function(buff, p) {
      return Typr._bin.readUint(buff, p) * (4294967295 + 1) + Typr._bin.readUint(buff, p + 4);
    },
    readASCII: function(buff, p, l) {
      var s = "";
      for (var i = 0; i < l; i++)
        s += String.fromCharCode(buff[p + i]);
      return s;
    },
    readUnicode: function(buff, p, l) {
      var s = "";
      for (var i = 0; i < l; i++) {
        var c = buff[p++] << 8 | buff[p++];
        s += String.fromCharCode(c);
      }
      return s;
    },
    _tdec: typeof window !== "undefined" && window["TextDecoder"] ? new window["TextDecoder"]() : null,
    readUTF8: function(buff, p, l) {
      var tdec = Typr._bin._tdec;
      if (tdec && p == 0 && l == buff.length)
        return tdec["decode"](buff);
      return Typr._bin.readASCII(buff, p, l);
    },
    readBytes: function(buff, p, l) {
      var arr = [];
      for (var i = 0; i < l; i++)
        arr.push(buff[p + i]);
      return arr;
    },
    readASCIIArray: function(buff, p, l) {
      var s = [];
      for (var i = 0; i < l; i++)
        s.push(String.fromCharCode(buff[p + i]));
      return s;
    },
    _view: function(buff) {
      return buff._dataView || (buff._dataView = buff.buffer ? new DataView(buff.buffer, buff.byteOffset, buff.byteLength) : new DataView(new Uint8Array(buff).buffer));
    }
  };
  Typr._lctf = {};
  Typr._lctf.parse = function(data, offset, length, font, subt) {
    var bin = Typr._bin;
    var obj = {};
    var offset0 = offset;
    bin.readFixed(data, offset);
    offset += 4;
    var offScriptList = bin.readUshort(data, offset);
    offset += 2;
    var offFeatureList = bin.readUshort(data, offset);
    offset += 2;
    var offLookupList = bin.readUshort(data, offset);
    offset += 2;
    obj.scriptList = Typr._lctf.readScriptList(data, offset0 + offScriptList);
    obj.featureList = Typr._lctf.readFeatureList(data, offset0 + offFeatureList);
    obj.lookupList = Typr._lctf.readLookupList(data, offset0 + offLookupList, subt);
    return obj;
  };
  Typr._lctf.readLookupList = function(data, offset, subt) {
    var bin = Typr._bin;
    var offset0 = offset;
    var obj = [];
    var count = bin.readUshort(data, offset);
    offset += 2;
    for (var i = 0; i < count; i++) {
      var noff = bin.readUshort(data, offset);
      offset += 2;
      var lut = Typr._lctf.readLookupTable(data, offset0 + noff, subt);
      obj.push(lut);
    }
    return obj;
  };
  Typr._lctf.readLookupTable = function(data, offset, subt) {
    var bin = Typr._bin;
    var offset0 = offset;
    var obj = { tabs: [] };
    obj.ltype = bin.readUshort(data, offset);
    offset += 2;
    obj.flag = bin.readUshort(data, offset);
    offset += 2;
    var cnt = bin.readUshort(data, offset);
    offset += 2;
    var ltype = obj.ltype;
    for (var i = 0; i < cnt; i++) {
      var noff = bin.readUshort(data, offset);
      offset += 2;
      var tab = subt(data, ltype, offset0 + noff, obj);
      obj.tabs.push(tab);
    }
    return obj;
  };
  Typr._lctf.numOfOnes = function(n) {
    var num = 0;
    for (var i = 0; i < 32; i++)
      if ((n >>> i & 1) != 0)
        num++;
    return num;
  };
  Typr._lctf.readClassDef = function(data, offset) {
    var bin = Typr._bin;
    var obj = [];
    var format = bin.readUshort(data, offset);
    offset += 2;
    if (format == 1) {
      var startGlyph = bin.readUshort(data, offset);
      offset += 2;
      var glyphCount = bin.readUshort(data, offset);
      offset += 2;
      for (var i = 0; i < glyphCount; i++) {
        obj.push(startGlyph + i);
        obj.push(startGlyph + i);
        obj.push(bin.readUshort(data, offset));
        offset += 2;
      }
    }
    if (format == 2) {
      var count = bin.readUshort(data, offset);
      offset += 2;
      for (var i = 0; i < count; i++) {
        obj.push(bin.readUshort(data, offset));
        offset += 2;
        obj.push(bin.readUshort(data, offset));
        offset += 2;
        obj.push(bin.readUshort(data, offset));
        offset += 2;
      }
    }
    return obj;
  };
  Typr._lctf.getInterval = function(tab, val) {
    for (var i = 0; i < tab.length; i += 3) {
      var start = tab[i], end = tab[i + 1];
      tab[i + 2];
      if (start <= val && val <= end)
        return i;
    }
    return -1;
  };
  Typr._lctf.readCoverage = function(data, offset) {
    var bin = Typr._bin;
    var cvg = {};
    cvg.fmt = bin.readUshort(data, offset);
    offset += 2;
    var count = bin.readUshort(data, offset);
    offset += 2;
    if (cvg.fmt == 1)
      cvg.tab = bin.readUshorts(data, offset, count);
    if (cvg.fmt == 2)
      cvg.tab = bin.readUshorts(data, offset, count * 3);
    return cvg;
  };
  Typr._lctf.coverageIndex = function(cvg, val) {
    var tab = cvg.tab;
    if (cvg.fmt == 1)
      return tab.indexOf(val);
    if (cvg.fmt == 2) {
      var ind = Typr._lctf.getInterval(tab, val);
      if (ind != -1)
        return tab[ind + 2] + (val - tab[ind]);
    }
    return -1;
  };
  Typr._lctf.readFeatureList = function(data, offset) {
    var bin = Typr._bin;
    var offset0 = offset;
    var obj = [];
    var count = bin.readUshort(data, offset);
    offset += 2;
    for (var i = 0; i < count; i++) {
      var tag = bin.readASCII(data, offset, 4);
      offset += 4;
      var noff = bin.readUshort(data, offset);
      offset += 2;
      var feat = Typr._lctf.readFeatureTable(data, offset0 + noff);
      feat.tag = tag.trim();
      obj.push(feat);
    }
    return obj;
  };
  Typr._lctf.readFeatureTable = function(data, offset) {
    var bin = Typr._bin;
    var offset0 = offset;
    var feat = {};
    var featureParams = bin.readUshort(data, offset);
    offset += 2;
    if (featureParams > 0) {
      feat.featureParams = offset0 + featureParams;
    }
    var lookupCount = bin.readUshort(data, offset);
    offset += 2;
    feat.tab = [];
    for (var i = 0; i < lookupCount; i++)
      feat.tab.push(bin.readUshort(data, offset + 2 * i));
    return feat;
  };
  Typr._lctf.readScriptList = function(data, offset) {
    var bin = Typr._bin;
    var offset0 = offset;
    var obj = {};
    var count = bin.readUshort(data, offset);
    offset += 2;
    for (var i = 0; i < count; i++) {
      var tag = bin.readASCII(data, offset, 4);
      offset += 4;
      var noff = bin.readUshort(data, offset);
      offset += 2;
      obj[tag.trim()] = Typr._lctf.readScriptTable(data, offset0 + noff);
    }
    return obj;
  };
  Typr._lctf.readScriptTable = function(data, offset) {
    var bin = Typr._bin;
    var offset0 = offset;
    var obj = {};
    var defLangSysOff = bin.readUshort(data, offset);
    offset += 2;
    if (defLangSysOff > 0) {
      obj["default"] = Typr._lctf.readLangSysTable(data, offset0 + defLangSysOff);
    }
    var langSysCount = bin.readUshort(data, offset);
    offset += 2;
    for (var i = 0; i < langSysCount; i++) {
      var tag = bin.readASCII(data, offset, 4);
      offset += 4;
      var langSysOff = bin.readUshort(data, offset);
      offset += 2;
      obj[tag.trim()] = Typr._lctf.readLangSysTable(data, offset0 + langSysOff);
    }
    return obj;
  };
  Typr._lctf.readLangSysTable = function(data, offset) {
    var bin = Typr._bin;
    var obj = {};
    bin.readUshort(data, offset);
    offset += 2;
    obj.reqFeature = bin.readUshort(data, offset);
    offset += 2;
    var featureCount = bin.readUshort(data, offset);
    offset += 2;
    obj.features = bin.readUshorts(data, offset, featureCount);
    return obj;
  };
  Typr.CFF = {};
  Typr.CFF.parse = function(data, offset, length) {
    var bin = Typr._bin;
    data = new Uint8Array(data.buffer, offset, length);
    offset = 0;
    data[offset];
    offset++;
    data[offset];
    offset++;
    data[offset];
    offset++;
    data[offset];
    offset++;
    var ninds = [];
    offset = Typr.CFF.readIndex(data, offset, ninds);
    var names = [];
    for (var i = 0; i < ninds.length - 1; i++)
      names.push(bin.readASCII(data, offset + ninds[i], ninds[i + 1] - ninds[i]));
    offset += ninds[ninds.length - 1];
    var tdinds = [];
    offset = Typr.CFF.readIndex(data, offset, tdinds);
    var topDicts = [];
    for (var i = 0; i < tdinds.length - 1; i++)
      topDicts.push(Typr.CFF.readDict(data, offset + tdinds[i], offset + tdinds[i + 1]));
    offset += tdinds[tdinds.length - 1];
    var topdict = topDicts[0];
    var sinds = [];
    offset = Typr.CFF.readIndex(data, offset, sinds);
    var strings = [];
    for (var i = 0; i < sinds.length - 1; i++)
      strings.push(bin.readASCII(data, offset + sinds[i], sinds[i + 1] - sinds[i]));
    offset += sinds[sinds.length - 1];
    Typr.CFF.readSubrs(data, offset, topdict);
    if (topdict.CharStrings) {
      offset = topdict.CharStrings;
      var sinds = [];
      offset = Typr.CFF.readIndex(data, offset, sinds);
      var cstr = [];
      for (var i = 0; i < sinds.length - 1; i++)
        cstr.push(bin.readBytes(data, offset + sinds[i], sinds[i + 1] - sinds[i]));
      topdict.CharStrings = cstr;
    }
    if (topdict.ROS) {
      offset = topdict.FDArray;
      var fdind = [];
      offset = Typr.CFF.readIndex(data, offset, fdind);
      topdict.FDArray = [];
      for (var i = 0; i < fdind.length - 1; i++) {
        var dict = Typr.CFF.readDict(data, offset + fdind[i], offset + fdind[i + 1]);
        Typr.CFF._readFDict(data, dict, strings);
        topdict.FDArray.push(dict);
      }
      offset += fdind[fdind.length - 1];
      offset = topdict.FDSelect;
      topdict.FDSelect = [];
      var fmt = data[offset];
      offset++;
      if (fmt == 3) {
        var rns = bin.readUshort(data, offset);
        offset += 2;
        for (var i = 0; i < rns + 1; i++) {
          topdict.FDSelect.push(bin.readUshort(data, offset), data[offset + 2]);
          offset += 3;
        }
      } else
        throw fmt;
    }
    if (topdict.Encoding)
      topdict.Encoding = Typr.CFF.readEncoding(data, topdict.Encoding, topdict.CharStrings.length);
    if (topdict.charset)
      topdict.charset = Typr.CFF.readCharset(data, topdict.charset, topdict.CharStrings.length);
    Typr.CFF._readFDict(data, topdict, strings);
    return topdict;
  };
  Typr.CFF._readFDict = function(data, dict, ss) {
    var offset;
    if (dict.Private) {
      offset = dict.Private[1];
      dict.Private = Typr.CFF.readDict(data, offset, offset + dict.Private[0]);
      if (dict.Private.Subrs)
        Typr.CFF.readSubrs(data, offset + dict.Private.Subrs, dict.Private);
    }
    for (var p in dict)
      if (["FamilyName", "FontName", "FullName", "Notice", "version", "Copyright"].indexOf(p) != -1)
        dict[p] = ss[dict[p] - 426 + 35];
  };
  Typr.CFF.readSubrs = function(data, offset, obj) {
    var bin = Typr._bin;
    var gsubinds = [];
    offset = Typr.CFF.readIndex(data, offset, gsubinds);
    var bias, nSubrs = gsubinds.length;
    if (nSubrs < 1240)
      bias = 107;
    else if (nSubrs < 33900)
      bias = 1131;
    else
      bias = 32768;
    obj.Bias = bias;
    obj.Subrs = [];
    for (var i = 0; i < gsubinds.length - 1; i++)
      obj.Subrs.push(bin.readBytes(data, offset + gsubinds[i], gsubinds[i + 1] - gsubinds[i]));
  };
  Typr.CFF.tableSE = [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25,
    26,
    27,
    28,
    29,
    30,
    31,
    32,
    33,
    34,
    35,
    36,
    37,
    38,
    39,
    40,
    41,
    42,
    43,
    44,
    45,
    46,
    47,
    48,
    49,
    50,
    51,
    52,
    53,
    54,
    55,
    56,
    57,
    58,
    59,
    60,
    61,
    62,
    63,
    64,
    65,
    66,
    67,
    68,
    69,
    70,
    71,
    72,
    73,
    74,
    75,
    76,
    77,
    78,
    79,
    80,
    81,
    82,
    83,
    84,
    85,
    86,
    87,
    88,
    89,
    90,
    91,
    92,
    93,
    94,
    95,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    96,
    97,
    98,
    99,
    100,
    101,
    102,
    103,
    104,
    105,
    106,
    107,
    108,
    109,
    110,
    0,
    111,
    112,
    113,
    114,
    0,
    115,
    116,
    117,
    118,
    119,
    120,
    121,
    122,
    0,
    123,
    0,
    124,
    125,
    126,
    127,
    128,
    129,
    130,
    131,
    0,
    132,
    133,
    0,
    134,
    135,
    136,
    137,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    138,
    0,
    139,
    0,
    0,
    0,
    0,
    140,
    141,
    142,
    143,
    0,
    0,
    0,
    0,
    0,
    144,
    0,
    0,
    0,
    145,
    0,
    0,
    146,
    147,
    148,
    149,
    0,
    0,
    0,
    0
  ];
  Typr.CFF.glyphByUnicode = function(cff, code) {
    for (var i = 0; i < cff.charset.length; i++)
      if (cff.charset[i] == code)
        return i;
    return -1;
  };
  Typr.CFF.glyphBySE = function(cff, charcode) {
    if (charcode < 0 || charcode > 255)
      return -1;
    return Typr.CFF.glyphByUnicode(cff, Typr.CFF.tableSE[charcode]);
  };
  Typr.CFF.readEncoding = function(data, offset, num) {
    Typr._bin;
    var array = [".notdef"];
    var format = data[offset];
    offset++;
    if (format == 0) {
      var nCodes = data[offset];
      offset++;
      for (var i = 0; i < nCodes; i++)
        array.push(data[offset + i]);
    } else
      throw "error: unknown encoding format: " + format;
    return array;
  };
  Typr.CFF.readCharset = function(data, offset, num) {
    var bin = Typr._bin;
    var charset = [".notdef"];
    var format = data[offset];
    offset++;
    if (format == 0) {
      for (var i = 0; i < num; i++) {
        var first = bin.readUshort(data, offset);
        offset += 2;
        charset.push(first);
      }
    } else if (format == 1 || format == 2) {
      while (charset.length < num) {
        var first = bin.readUshort(data, offset);
        offset += 2;
        var nLeft = 0;
        if (format == 1) {
          nLeft = data[offset];
          offset++;
        } else {
          nLeft = bin.readUshort(data, offset);
          offset += 2;
        }
        for (var i = 0; i <= nLeft; i++) {
          charset.push(first);
          first++;
        }
      }
    } else
      throw "error: format: " + format;
    return charset;
  };
  Typr.CFF.readIndex = function(data, offset, inds) {
    var bin = Typr._bin;
    var count = bin.readUshort(data, offset) + 1;
    offset += 2;
    var offsize = data[offset];
    offset++;
    if (offsize == 1)
      for (var i = 0; i < count; i++)
        inds.push(data[offset + i]);
    else if (offsize == 2)
      for (var i = 0; i < count; i++)
        inds.push(bin.readUshort(data, offset + i * 2));
    else if (offsize == 3)
      for (var i = 0; i < count; i++)
        inds.push(bin.readUint(data, offset + i * 3 - 1) & 16777215);
    else if (count != 1)
      throw "unsupported offset size: " + offsize + ", count: " + count;
    offset += count * offsize;
    return offset - 1;
  };
  Typr.CFF.getCharString = function(data, offset, o) {
    var bin = Typr._bin;
    var b0 = data[offset], b1 = data[offset + 1];
    data[offset + 2];
    data[offset + 3];
    data[offset + 4];
    var vs = 1;
    var op = null, val = null;
    if (b0 <= 20) {
      op = b0;
      vs = 1;
    }
    if (b0 == 12) {
      op = b0 * 100 + b1;
      vs = 2;
    }
    if (21 <= b0 && b0 <= 27) {
      op = b0;
      vs = 1;
    }
    if (b0 == 28) {
      val = bin.readShort(data, offset + 1);
      vs = 3;
    }
    if (29 <= b0 && b0 <= 31) {
      op = b0;
      vs = 1;
    }
    if (32 <= b0 && b0 <= 246) {
      val = b0 - 139;
      vs = 1;
    }
    if (247 <= b0 && b0 <= 250) {
      val = (b0 - 247) * 256 + b1 + 108;
      vs = 2;
    }
    if (251 <= b0 && b0 <= 254) {
      val = -(b0 - 251) * 256 - b1 - 108;
      vs = 2;
    }
    if (b0 == 255) {
      val = bin.readInt(data, offset + 1) / 65535;
      vs = 5;
    }
    o.val = val != null ? val : "o" + op;
    o.size = vs;
  };
  Typr.CFF.readCharString = function(data, offset, length) {
    var end = offset + length;
    var bin = Typr._bin;
    var arr = [];
    while (offset < end) {
      var b0 = data[offset], b1 = data[offset + 1];
      data[offset + 2];
      data[offset + 3];
      data[offset + 4];
      var vs = 1;
      var op = null, val = null;
      if (b0 <= 20) {
        op = b0;
        vs = 1;
      }
      if (b0 == 12) {
        op = b0 * 100 + b1;
        vs = 2;
      }
      if (b0 == 19 || b0 == 20) {
        op = b0;
        vs = 2;
      }
      if (21 <= b0 && b0 <= 27) {
        op = b0;
        vs = 1;
      }
      if (b0 == 28) {
        val = bin.readShort(data, offset + 1);
        vs = 3;
      }
      if (29 <= b0 && b0 <= 31) {
        op = b0;
        vs = 1;
      }
      if (32 <= b0 && b0 <= 246) {
        val = b0 - 139;
        vs = 1;
      }
      if (247 <= b0 && b0 <= 250) {
        val = (b0 - 247) * 256 + b1 + 108;
        vs = 2;
      }
      if (251 <= b0 && b0 <= 254) {
        val = -(b0 - 251) * 256 - b1 - 108;
        vs = 2;
      }
      if (b0 == 255) {
        val = bin.readInt(data, offset + 1) / 65535;
        vs = 5;
      }
      arr.push(val != null ? val : "o" + op);
      offset += vs;
    }
    return arr;
  };
  Typr.CFF.readDict = function(data, offset, end) {
    var bin = Typr._bin;
    var dict = {};
    var carr = [];
    while (offset < end) {
      var b0 = data[offset], b1 = data[offset + 1];
      data[offset + 2];
      data[offset + 3];
      data[offset + 4];
      var vs = 1;
      var key = null, val = null;
      if (b0 == 28) {
        val = bin.readShort(data, offset + 1);
        vs = 3;
      }
      if (b0 == 29) {
        val = bin.readInt(data, offset + 1);
        vs = 5;
      }
      if (32 <= b0 && b0 <= 246) {
        val = b0 - 139;
        vs = 1;
      }
      if (247 <= b0 && b0 <= 250) {
        val = (b0 - 247) * 256 + b1 + 108;
        vs = 2;
      }
      if (251 <= b0 && b0 <= 254) {
        val = -(b0 - 251) * 256 - b1 - 108;
        vs = 2;
      }
      if (b0 == 255) {
        val = bin.readInt(data, offset + 1) / 65535;
        vs = 5;
        throw "unknown number";
      }
      if (b0 == 30) {
        var nibs = [];
        vs = 1;
        while (true) {
          var b = data[offset + vs];
          vs++;
          var nib0 = b >> 4, nib1 = b & 15;
          if (nib0 != 15)
            nibs.push(nib0);
          if (nib1 != 15)
            nibs.push(nib1);
          if (nib1 == 15)
            break;
        }
        var s = "";
        var chars = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, ".", "e", "e-", "reserved", "-", "endOfNumber"];
        for (var i = 0; i < nibs.length; i++)
          s += chars[nibs[i]];
        val = parseFloat(s);
      }
      if (b0 <= 21) {
        var keys = [
          "version",
          "Notice",
          "FullName",
          "FamilyName",
          "Weight",
          "FontBBox",
          "BlueValues",
          "OtherBlues",
          "FamilyBlues",
          "FamilyOtherBlues",
          "StdHW",
          "StdVW",
          "escape",
          "UniqueID",
          "XUID",
          "charset",
          "Encoding",
          "CharStrings",
          "Private",
          "Subrs",
          "defaultWidthX",
          "nominalWidthX"
        ];
        key = keys[b0];
        vs = 1;
        if (b0 == 12) {
          var keys = [
            "Copyright",
            "isFixedPitch",
            "ItalicAngle",
            "UnderlinePosition",
            "UnderlineThickness",
            "PaintType",
            "CharstringType",
            "FontMatrix",
            "StrokeWidth",
            "BlueScale",
            "BlueShift",
            "BlueFuzz",
            "StemSnapH",
            "StemSnapV",
            "ForceBold",
            0,
            0,
            "LanguageGroup",
            "ExpansionFactor",
            "initialRandomSeed",
            "SyntheticBase",
            "PostScript",
            "BaseFontName",
            "BaseFontBlend",
            0,
            0,
            0,
            0,
            0,
            0,
            "ROS",
            "CIDFontVersion",
            "CIDFontRevision",
            "CIDFontType",
            "CIDCount",
            "UIDBase",
            "FDArray",
            "FDSelect",
            "FontName"
          ];
          key = keys[b1];
          vs = 2;
        }
      }
      if (key != null) {
        dict[key] = carr.length == 1 ? carr[0] : carr;
        carr = [];
      } else
        carr.push(val);
      offset += vs;
    }
    return dict;
  };
  Typr.cmap = {};
  Typr.cmap.parse = function(data, offset, length) {
    data = new Uint8Array(data.buffer, offset, length);
    offset = 0;
    var bin = Typr._bin;
    var obj = {};
    bin.readUshort(data, offset);
    offset += 2;
    var numTables = bin.readUshort(data, offset);
    offset += 2;
    var offs = [];
    obj.tables = [];
    for (var i = 0; i < numTables; i++) {
      var platformID = bin.readUshort(data, offset);
      offset += 2;
      var encodingID = bin.readUshort(data, offset);
      offset += 2;
      var noffset = bin.readUint(data, offset);
      offset += 4;
      var id = "p" + platformID + "e" + encodingID;
      var tind = offs.indexOf(noffset);
      if (tind == -1) {
        tind = obj.tables.length;
        var subt;
        offs.push(noffset);
        var format = bin.readUshort(data, noffset);
        if (format == 0)
          subt = Typr.cmap.parse0(data, noffset);
        else if (format == 4)
          subt = Typr.cmap.parse4(data, noffset);
        else if (format == 6)
          subt = Typr.cmap.parse6(data, noffset);
        else if (format == 12)
          subt = Typr.cmap.parse12(data, noffset);
        else
          console.warn("unknown format: " + format, platformID, encodingID, noffset);
        obj.tables.push(subt);
      }
      if (obj[id] != null)
        throw "multiple tables for one platform+encoding";
      obj[id] = tind;
    }
    return obj;
  };
  Typr.cmap.parse0 = function(data, offset) {
    var bin = Typr._bin;
    var obj = {};
    obj.format = bin.readUshort(data, offset);
    offset += 2;
    var len = bin.readUshort(data, offset);
    offset += 2;
    bin.readUshort(data, offset);
    offset += 2;
    obj.map = [];
    for (var i = 0; i < len - 6; i++)
      obj.map.push(data[offset + i]);
    return obj;
  };
  Typr.cmap.parse4 = function(data, offset) {
    var bin = Typr._bin;
    var offset0 = offset;
    var obj = {};
    obj.format = bin.readUshort(data, offset);
    offset += 2;
    var length = bin.readUshort(data, offset);
    offset += 2;
    bin.readUshort(data, offset);
    offset += 2;
    var segCountX2 = bin.readUshort(data, offset);
    offset += 2;
    var segCount = segCountX2 / 2;
    obj.searchRange = bin.readUshort(data, offset);
    offset += 2;
    obj.entrySelector = bin.readUshort(data, offset);
    offset += 2;
    obj.rangeShift = bin.readUshort(data, offset);
    offset += 2;
    obj.endCount = bin.readUshorts(data, offset, segCount);
    offset += segCount * 2;
    offset += 2;
    obj.startCount = bin.readUshorts(data, offset, segCount);
    offset += segCount * 2;
    obj.idDelta = [];
    for (var i = 0; i < segCount; i++) {
      obj.idDelta.push(bin.readShort(data, offset));
      offset += 2;
    }
    obj.idRangeOffset = bin.readUshorts(data, offset, segCount);
    offset += segCount * 2;
    obj.glyphIdArray = [];
    while (offset < offset0 + length) {
      obj.glyphIdArray.push(bin.readUshort(data, offset));
      offset += 2;
    }
    return obj;
  };
  Typr.cmap.parse6 = function(data, offset) {
    var bin = Typr._bin;
    var obj = {};
    obj.format = bin.readUshort(data, offset);
    offset += 2;
    bin.readUshort(data, offset);
    offset += 2;
    bin.readUshort(data, offset);
    offset += 2;
    obj.firstCode = bin.readUshort(data, offset);
    offset += 2;
    var entryCount = bin.readUshort(data, offset);
    offset += 2;
    obj.glyphIdArray = [];
    for (var i = 0; i < entryCount; i++) {
      obj.glyphIdArray.push(bin.readUshort(data, offset));
      offset += 2;
    }
    return obj;
  };
  Typr.cmap.parse12 = function(data, offset) {
    var bin = Typr._bin;
    var obj = {};
    obj.format = bin.readUshort(data, offset);
    offset += 2;
    offset += 2;
    bin.readUint(data, offset);
    offset += 4;
    bin.readUint(data, offset);
    offset += 4;
    var nGroups = bin.readUint(data, offset);
    offset += 4;
    obj.groups = [];
    for (var i = 0; i < nGroups; i++) {
      var off = offset + i * 12;
      var startCharCode = bin.readUint(data, off + 0);
      var endCharCode = bin.readUint(data, off + 4);
      var startGlyphID = bin.readUint(data, off + 8);
      obj.groups.push([startCharCode, endCharCode, startGlyphID]);
    }
    return obj;
  };
  Typr.glyf = {};
  Typr.glyf.parse = function(data, offset, length, font) {
    var obj = [];
    for (var g = 0; g < font.maxp.numGlyphs; g++)
      obj.push(null);
    return obj;
  };
  Typr.glyf._parseGlyf = function(font, g) {
    var bin = Typr._bin;
    var data = font._data;
    var offset = Typr._tabOffset(data, "glyf", font._offset) + font.loca[g];
    if (font.loca[g] == font.loca[g + 1])
      return null;
    var gl = {};
    gl.noc = bin.readShort(data, offset);
    offset += 2;
    gl.xMin = bin.readShort(data, offset);
    offset += 2;
    gl.yMin = bin.readShort(data, offset);
    offset += 2;
    gl.xMax = bin.readShort(data, offset);
    offset += 2;
    gl.yMax = bin.readShort(data, offset);
    offset += 2;
    if (gl.xMin >= gl.xMax || gl.yMin >= gl.yMax)
      return null;
    if (gl.noc > 0) {
      gl.endPts = [];
      for (var i = 0; i < gl.noc; i++) {
        gl.endPts.push(bin.readUshort(data, offset));
        offset += 2;
      }
      var instructionLength = bin.readUshort(data, offset);
      offset += 2;
      if (data.length - offset < instructionLength)
        return null;
      gl.instructions = bin.readBytes(data, offset, instructionLength);
      offset += instructionLength;
      var crdnum = gl.endPts[gl.noc - 1] + 1;
      gl.flags = [];
      for (var i = 0; i < crdnum; i++) {
        var flag = data[offset];
        offset++;
        gl.flags.push(flag);
        if ((flag & 8) != 0) {
          var rep = data[offset];
          offset++;
          for (var j = 0; j < rep; j++) {
            gl.flags.push(flag);
            i++;
          }
        }
      }
      gl.xs = [];
      for (var i = 0; i < crdnum; i++) {
        var i8 = (gl.flags[i] & 2) != 0, same = (gl.flags[i] & 16) != 0;
        if (i8) {
          gl.xs.push(same ? data[offset] : -data[offset]);
          offset++;
        } else {
          if (same)
            gl.xs.push(0);
          else {
            gl.xs.push(bin.readShort(data, offset));
            offset += 2;
          }
        }
      }
      gl.ys = [];
      for (var i = 0; i < crdnum; i++) {
        var i8 = (gl.flags[i] & 4) != 0, same = (gl.flags[i] & 32) != 0;
        if (i8) {
          gl.ys.push(same ? data[offset] : -data[offset]);
          offset++;
        } else {
          if (same)
            gl.ys.push(0);
          else {
            gl.ys.push(bin.readShort(data, offset));
            offset += 2;
          }
        }
      }
      var x = 0, y = 0;
      for (var i = 0; i < crdnum; i++) {
        x += gl.xs[i];
        y += gl.ys[i];
        gl.xs[i] = x;
        gl.ys[i] = y;
      }
    } else {
      var ARG_1_AND_2_ARE_WORDS = 1 << 0;
      var ARGS_ARE_XY_VALUES = 1 << 1;
      var WE_HAVE_A_SCALE = 1 << 3;
      var MORE_COMPONENTS = 1 << 5;
      var WE_HAVE_AN_X_AND_Y_SCALE = 1 << 6;
      var WE_HAVE_A_TWO_BY_TWO = 1 << 7;
      var WE_HAVE_INSTRUCTIONS = 1 << 8;
      gl.parts = [];
      var flags;
      do {
        flags = bin.readUshort(data, offset);
        offset += 2;
        var part = { m: { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 }, p1: -1, p2: -1 };
        gl.parts.push(part);
        part.glyphIndex = bin.readUshort(data, offset);
        offset += 2;
        if (flags & ARG_1_AND_2_ARE_WORDS) {
          var arg1 = bin.readShort(data, offset);
          offset += 2;
          var arg2 = bin.readShort(data, offset);
          offset += 2;
        } else {
          var arg1 = bin.readInt8(data, offset);
          offset++;
          var arg2 = bin.readInt8(data, offset);
          offset++;
        }
        if (flags & ARGS_ARE_XY_VALUES) {
          part.m.tx = arg1;
          part.m.ty = arg2;
        } else {
          part.p1 = arg1;
          part.p2 = arg2;
        }
        if (flags & WE_HAVE_A_SCALE) {
          part.m.a = part.m.d = bin.readF2dot14(data, offset);
          offset += 2;
        } else if (flags & WE_HAVE_AN_X_AND_Y_SCALE) {
          part.m.a = bin.readF2dot14(data, offset);
          offset += 2;
          part.m.d = bin.readF2dot14(data, offset);
          offset += 2;
        } else if (flags & WE_HAVE_A_TWO_BY_TWO) {
          part.m.a = bin.readF2dot14(data, offset);
          offset += 2;
          part.m.b = bin.readF2dot14(data, offset);
          offset += 2;
          part.m.c = bin.readF2dot14(data, offset);
          offset += 2;
          part.m.d = bin.readF2dot14(data, offset);
          offset += 2;
        }
      } while (flags & MORE_COMPONENTS);
      if (flags & WE_HAVE_INSTRUCTIONS) {
        var numInstr = bin.readUshort(data, offset);
        offset += 2;
        gl.instr = [];
        for (var i = 0; i < numInstr; i++) {
          gl.instr.push(data[offset]);
          offset++;
        }
      }
    }
    return gl;
  };
  Typr.GPOS = {};
  Typr.GPOS.parse = function(data, offset, length, font) {
    return Typr._lctf.parse(data, offset, length, font, Typr.GPOS.subt);
  };
  Typr.GPOS.subt = function(data, ltype, offset, ltable) {
    var bin = Typr._bin, offset0 = offset, tab = {};
    tab.fmt = bin.readUshort(data, offset);
    offset += 2;
    if (ltype == 1 || ltype == 2 || ltype == 3 || ltype == 7 || ltype == 8 && tab.fmt <= 2) {
      var covOff = bin.readUshort(data, offset);
      offset += 2;
      tab.coverage = Typr._lctf.readCoverage(data, covOff + offset0);
    }
    if (ltype == 1 && tab.fmt == 1) {
      var valFmt1 = bin.readUshort(data, offset);
      offset += 2;
      var ones1 = Typr._lctf.numOfOnes(valFmt1);
      if (valFmt1 != 0)
        tab.pos = Typr.GPOS.readValueRecord(data, offset, valFmt1);
    } else if (ltype == 2 && tab.fmt >= 1 && tab.fmt <= 2) {
      var valFmt1 = bin.readUshort(data, offset);
      offset += 2;
      var valFmt2 = bin.readUshort(data, offset);
      offset += 2;
      var ones1 = Typr._lctf.numOfOnes(valFmt1);
      var ones2 = Typr._lctf.numOfOnes(valFmt2);
      if (tab.fmt == 1) {
        tab.pairsets = [];
        var psc = bin.readUshort(data, offset);
        offset += 2;
        for (var i = 0; i < psc; i++) {
          var psoff = offset0 + bin.readUshort(data, offset);
          offset += 2;
          var pvc = bin.readUshort(data, psoff);
          psoff += 2;
          var arr = [];
          for (var j = 0; j < pvc; j++) {
            var gid2 = bin.readUshort(data, psoff);
            psoff += 2;
            var value1, value2;
            if (valFmt1 != 0) {
              value1 = Typr.GPOS.readValueRecord(data, psoff, valFmt1);
              psoff += ones1 * 2;
            }
            if (valFmt2 != 0) {
              value2 = Typr.GPOS.readValueRecord(data, psoff, valFmt2);
              psoff += ones2 * 2;
            }
            arr.push({ gid2, val1: value1, val2: value2 });
          }
          tab.pairsets.push(arr);
        }
      }
      if (tab.fmt == 2) {
        var classDef1 = bin.readUshort(data, offset);
        offset += 2;
        var classDef2 = bin.readUshort(data, offset);
        offset += 2;
        var class1Count = bin.readUshort(data, offset);
        offset += 2;
        var class2Count = bin.readUshort(data, offset);
        offset += 2;
        tab.classDef1 = Typr._lctf.readClassDef(data, offset0 + classDef1);
        tab.classDef2 = Typr._lctf.readClassDef(data, offset0 + classDef2);
        tab.matrix = [];
        for (var i = 0; i < class1Count; i++) {
          var row = [];
          for (var j = 0; j < class2Count; j++) {
            var value1 = null, value2 = null;
            if (valFmt1 != 0) {
              value1 = Typr.GPOS.readValueRecord(data, offset, valFmt1);
              offset += ones1 * 2;
            }
            if (valFmt2 != 0) {
              value2 = Typr.GPOS.readValueRecord(data, offset, valFmt2);
              offset += ones2 * 2;
            }
            row.push({ val1: value1, val2: value2 });
          }
          tab.matrix.push(row);
        }
      }
    } else if (ltype == 9 && tab.fmt == 1) {
      var extType = bin.readUshort(data, offset);
      offset += 2;
      var extOffset = bin.readUint(data, offset);
      offset += 4;
      if (ltable.ltype == 9) {
        ltable.ltype = extType;
      } else if (ltable.ltype != extType) {
        throw "invalid extension substitution";
      }
      return Typr.GPOS.subt(data, ltable.ltype, offset0 + extOffset);
    } else
      console.warn("unsupported GPOS table LookupType", ltype, "format", tab.fmt);
    return tab;
  };
  Typr.GPOS.readValueRecord = function(data, offset, valFmt) {
    var bin = Typr._bin;
    var arr = [];
    arr.push(valFmt & 1 ? bin.readShort(data, offset) : 0);
    offset += valFmt & 1 ? 2 : 0;
    arr.push(valFmt & 2 ? bin.readShort(data, offset) : 0);
    offset += valFmt & 2 ? 2 : 0;
    arr.push(valFmt & 4 ? bin.readShort(data, offset) : 0);
    offset += valFmt & 4 ? 2 : 0;
    arr.push(valFmt & 8 ? bin.readShort(data, offset) : 0);
    offset += valFmt & 8 ? 2 : 0;
    return arr;
  };
  Typr.GSUB = {};
  Typr.GSUB.parse = function(data, offset, length, font) {
    return Typr._lctf.parse(data, offset, length, font, Typr.GSUB.subt);
  };
  Typr.GSUB.subt = function(data, ltype, offset, ltable) {
    var bin = Typr._bin, offset0 = offset, tab = {};
    tab.fmt = bin.readUshort(data, offset);
    offset += 2;
    if (ltype != 1 && ltype != 4 && ltype != 5 && ltype != 6)
      return null;
    if (ltype == 1 || ltype == 4 || ltype == 5 && tab.fmt <= 2 || ltype == 6 && tab.fmt <= 2) {
      var covOff = bin.readUshort(data, offset);
      offset += 2;
      tab.coverage = Typr._lctf.readCoverage(data, offset0 + covOff);
    }
    if (ltype == 1 && tab.fmt >= 1 && tab.fmt <= 2) {
      if (tab.fmt == 1) {
        tab.delta = bin.readShort(data, offset);
        offset += 2;
      } else if (tab.fmt == 2) {
        var cnt = bin.readUshort(data, offset);
        offset += 2;
        tab.newg = bin.readUshorts(data, offset, cnt);
        offset += tab.newg.length * 2;
      }
    } else if (ltype == 4) {
      tab.vals = [];
      var cnt = bin.readUshort(data, offset);
      offset += 2;
      for (var i = 0; i < cnt; i++) {
        var loff = bin.readUshort(data, offset);
        offset += 2;
        tab.vals.push(Typr.GSUB.readLigatureSet(data, offset0 + loff));
      }
    } else if (ltype == 5 && tab.fmt == 2) {
      if (tab.fmt == 2) {
        var cDefOffset = bin.readUshort(data, offset);
        offset += 2;
        tab.cDef = Typr._lctf.readClassDef(data, offset0 + cDefOffset);
        tab.scset = [];
        var subClassSetCount = bin.readUshort(data, offset);
        offset += 2;
        for (var i = 0; i < subClassSetCount; i++) {
          var scsOff = bin.readUshort(data, offset);
          offset += 2;
          tab.scset.push(scsOff == 0 ? null : Typr.GSUB.readSubClassSet(data, offset0 + scsOff));
        }
      }
    } else if (ltype == 6 && tab.fmt == 3) {
      if (tab.fmt == 3) {
        for (var i = 0; i < 3; i++) {
          var cnt = bin.readUshort(data, offset);
          offset += 2;
          var cvgs = [];
          for (var j = 0; j < cnt; j++)
            cvgs.push(Typr._lctf.readCoverage(data, offset0 + bin.readUshort(data, offset + j * 2)));
          offset += cnt * 2;
          if (i == 0)
            tab.backCvg = cvgs;
          if (i == 1)
            tab.inptCvg = cvgs;
          if (i == 2)
            tab.ahedCvg = cvgs;
        }
        var cnt = bin.readUshort(data, offset);
        offset += 2;
        tab.lookupRec = Typr.GSUB.readSubstLookupRecords(data, offset, cnt);
      }
    } else if (ltype == 7 && tab.fmt == 1) {
      var extType = bin.readUshort(data, offset);
      offset += 2;
      var extOffset = bin.readUint(data, offset);
      offset += 4;
      if (ltable.ltype == 9) {
        ltable.ltype = extType;
      } else if (ltable.ltype != extType) {
        throw "invalid extension substitution";
      }
      return Typr.GSUB.subt(data, ltable.ltype, offset0 + extOffset);
    } else
      console.warn("unsupported GSUB table LookupType", ltype, "format", tab.fmt);
    return tab;
  };
  Typr.GSUB.readSubClassSet = function(data, offset) {
    var rUs = Typr._bin.readUshort, offset0 = offset, lset = [];
    var cnt = rUs(data, offset);
    offset += 2;
    for (var i = 0; i < cnt; i++) {
      var loff = rUs(data, offset);
      offset += 2;
      lset.push(Typr.GSUB.readSubClassRule(data, offset0 + loff));
    }
    return lset;
  };
  Typr.GSUB.readSubClassRule = function(data, offset) {
    var rUs = Typr._bin.readUshort, rule = {};
    var gcount = rUs(data, offset);
    offset += 2;
    var scount = rUs(data, offset);
    offset += 2;
    rule.input = [];
    for (var i = 0; i < gcount - 1; i++) {
      rule.input.push(rUs(data, offset));
      offset += 2;
    }
    rule.substLookupRecords = Typr.GSUB.readSubstLookupRecords(data, offset, scount);
    return rule;
  };
  Typr.GSUB.readSubstLookupRecords = function(data, offset, cnt) {
    var rUs = Typr._bin.readUshort;
    var out = [];
    for (var i = 0; i < cnt; i++) {
      out.push(rUs(data, offset), rUs(data, offset + 2));
      offset += 4;
    }
    return out;
  };
  Typr.GSUB.readChainSubClassSet = function(data, offset) {
    var bin = Typr._bin, offset0 = offset, lset = [];
    var cnt = bin.readUshort(data, offset);
    offset += 2;
    for (var i = 0; i < cnt; i++) {
      var loff = bin.readUshort(data, offset);
      offset += 2;
      lset.push(Typr.GSUB.readChainSubClassRule(data, offset0 + loff));
    }
    return lset;
  };
  Typr.GSUB.readChainSubClassRule = function(data, offset) {
    var bin = Typr._bin, rule = {};
    var pps = ["backtrack", "input", "lookahead"];
    for (var pi = 0; pi < pps.length; pi++) {
      var cnt = bin.readUshort(data, offset);
      offset += 2;
      if (pi == 1)
        cnt--;
      rule[pps[pi]] = bin.readUshorts(data, offset, cnt);
      offset += rule[pps[pi]].length * 2;
    }
    var cnt = bin.readUshort(data, offset);
    offset += 2;
    rule.subst = bin.readUshorts(data, offset, cnt * 2);
    offset += rule.subst.length * 2;
    return rule;
  };
  Typr.GSUB.readLigatureSet = function(data, offset) {
    var bin = Typr._bin, offset0 = offset, lset = [];
    var lcnt = bin.readUshort(data, offset);
    offset += 2;
    for (var j = 0; j < lcnt; j++) {
      var loff = bin.readUshort(data, offset);
      offset += 2;
      lset.push(Typr.GSUB.readLigature(data, offset0 + loff));
    }
    return lset;
  };
  Typr.GSUB.readLigature = function(data, offset) {
    var bin = Typr._bin, lig = { chain: [] };
    lig.nglyph = bin.readUshort(data, offset);
    offset += 2;
    var ccnt = bin.readUshort(data, offset);
    offset += 2;
    for (var k = 0; k < ccnt - 1; k++) {
      lig.chain.push(bin.readUshort(data, offset));
      offset += 2;
    }
    return lig;
  };
  Typr.head = {};
  Typr.head.parse = function(data, offset, length) {
    var bin = Typr._bin;
    var obj = {};
    bin.readFixed(data, offset);
    offset += 4;
    obj.fontRevision = bin.readFixed(data, offset);
    offset += 4;
    bin.readUint(data, offset);
    offset += 4;
    bin.readUint(data, offset);
    offset += 4;
    obj.flags = bin.readUshort(data, offset);
    offset += 2;
    obj.unitsPerEm = bin.readUshort(data, offset);
    offset += 2;
    obj.created = bin.readUint64(data, offset);
    offset += 8;
    obj.modified = bin.readUint64(data, offset);
    offset += 8;
    obj.xMin = bin.readShort(data, offset);
    offset += 2;
    obj.yMin = bin.readShort(data, offset);
    offset += 2;
    obj.xMax = bin.readShort(data, offset);
    offset += 2;
    obj.yMax = bin.readShort(data, offset);
    offset += 2;
    obj.macStyle = bin.readUshort(data, offset);
    offset += 2;
    obj.lowestRecPPEM = bin.readUshort(data, offset);
    offset += 2;
    obj.fontDirectionHint = bin.readShort(data, offset);
    offset += 2;
    obj.indexToLocFormat = bin.readShort(data, offset);
    offset += 2;
    obj.glyphDataFormat = bin.readShort(data, offset);
    offset += 2;
    return obj;
  };
  Typr.hhea = {};
  Typr.hhea.parse = function(data, offset, length) {
    var bin = Typr._bin;
    var obj = {};
    bin.readFixed(data, offset);
    offset += 4;
    obj.ascender = bin.readShort(data, offset);
    offset += 2;
    obj.descender = bin.readShort(data, offset);
    offset += 2;
    obj.lineGap = bin.readShort(data, offset);
    offset += 2;
    obj.advanceWidthMax = bin.readUshort(data, offset);
    offset += 2;
    obj.minLeftSideBearing = bin.readShort(data, offset);
    offset += 2;
    obj.minRightSideBearing = bin.readShort(data, offset);
    offset += 2;
    obj.xMaxExtent = bin.readShort(data, offset);
    offset += 2;
    obj.caretSlopeRise = bin.readShort(data, offset);
    offset += 2;
    obj.caretSlopeRun = bin.readShort(data, offset);
    offset += 2;
    obj.caretOffset = bin.readShort(data, offset);
    offset += 2;
    offset += 4 * 2;
    obj.metricDataFormat = bin.readShort(data, offset);
    offset += 2;
    obj.numberOfHMetrics = bin.readUshort(data, offset);
    offset += 2;
    return obj;
  };
  Typr.hmtx = {};
  Typr.hmtx.parse = function(data, offset, length, font) {
    var bin = Typr._bin;
    var obj = {};
    obj.aWidth = [];
    obj.lsBearing = [];
    var aw = 0, lsb = 0;
    for (var i = 0; i < font.maxp.numGlyphs; i++) {
      if (i < font.hhea.numberOfHMetrics) {
        aw = bin.readUshort(data, offset);
        offset += 2;
        lsb = bin.readShort(data, offset);
        offset += 2;
      }
      obj.aWidth.push(aw);
      obj.lsBearing.push(lsb);
    }
    return obj;
  };
  Typr.kern = {};
  Typr.kern.parse = function(data, offset, length, font) {
    var bin = Typr._bin;
    var version = bin.readUshort(data, offset);
    offset += 2;
    if (version == 1)
      return Typr.kern.parseV1(data, offset - 2, length, font);
    var nTables = bin.readUshort(data, offset);
    offset += 2;
    var map2 = { glyph1: [], rval: [] };
    for (var i = 0; i < nTables; i++) {
      offset += 2;
      var length = bin.readUshort(data, offset);
      offset += 2;
      var coverage = bin.readUshort(data, offset);
      offset += 2;
      var format = coverage >>> 8;
      format &= 15;
      if (format == 0)
        offset = Typr.kern.readFormat0(data, offset, map2);
      else
        throw "unknown kern table format: " + format;
    }
    return map2;
  };
  Typr.kern.parseV1 = function(data, offset, length, font) {
    var bin = Typr._bin;
    bin.readFixed(data, offset);
    offset += 4;
    var nTables = bin.readUint(data, offset);
    offset += 4;
    var map2 = { glyph1: [], rval: [] };
    for (var i = 0; i < nTables; i++) {
      bin.readUint(data, offset);
      offset += 4;
      var coverage = bin.readUshort(data, offset);
      offset += 2;
      bin.readUshort(data, offset);
      offset += 2;
      var format = coverage >>> 8;
      format &= 15;
      if (format == 0)
        offset = Typr.kern.readFormat0(data, offset, map2);
      else
        throw "unknown kern table format: " + format;
    }
    return map2;
  };
  Typr.kern.readFormat0 = function(data, offset, map2) {
    var bin = Typr._bin;
    var pleft = -1;
    var nPairs = bin.readUshort(data, offset);
    offset += 2;
    bin.readUshort(data, offset);
    offset += 2;
    bin.readUshort(data, offset);
    offset += 2;
    bin.readUshort(data, offset);
    offset += 2;
    for (var j = 0; j < nPairs; j++) {
      var left = bin.readUshort(data, offset);
      offset += 2;
      var right = bin.readUshort(data, offset);
      offset += 2;
      var value = bin.readShort(data, offset);
      offset += 2;
      if (left != pleft) {
        map2.glyph1.push(left);
        map2.rval.push({ glyph2: [], vals: [] });
      }
      var rval = map2.rval[map2.rval.length - 1];
      rval.glyph2.push(right);
      rval.vals.push(value);
      pleft = left;
    }
    return offset;
  };
  Typr.loca = {};
  Typr.loca.parse = function(data, offset, length, font) {
    var bin = Typr._bin;
    var obj = [];
    var ver = font.head.indexToLocFormat;
    var len = font.maxp.numGlyphs + 1;
    if (ver == 0)
      for (var i = 0; i < len; i++)
        obj.push(bin.readUshort(data, offset + (i << 1)) << 1);
    if (ver == 1)
      for (var i = 0; i < len; i++)
        obj.push(bin.readUint(data, offset + (i << 2)));
    return obj;
  };
  Typr.maxp = {};
  Typr.maxp.parse = function(data, offset, length) {
    var bin = Typr._bin;
    var obj = {};
    var ver = bin.readUint(data, offset);
    offset += 4;
    obj.numGlyphs = bin.readUshort(data, offset);
    offset += 2;
    if (ver == 65536) {
      obj.maxPoints = bin.readUshort(data, offset);
      offset += 2;
      obj.maxContours = bin.readUshort(data, offset);
      offset += 2;
      obj.maxCompositePoints = bin.readUshort(data, offset);
      offset += 2;
      obj.maxCompositeContours = bin.readUshort(data, offset);
      offset += 2;
      obj.maxZones = bin.readUshort(data, offset);
      offset += 2;
      obj.maxTwilightPoints = bin.readUshort(data, offset);
      offset += 2;
      obj.maxStorage = bin.readUshort(data, offset);
      offset += 2;
      obj.maxFunctionDefs = bin.readUshort(data, offset);
      offset += 2;
      obj.maxInstructionDefs = bin.readUshort(data, offset);
      offset += 2;
      obj.maxStackElements = bin.readUshort(data, offset);
      offset += 2;
      obj.maxSizeOfInstructions = bin.readUshort(data, offset);
      offset += 2;
      obj.maxComponentElements = bin.readUshort(data, offset);
      offset += 2;
      obj.maxComponentDepth = bin.readUshort(data, offset);
      offset += 2;
    }
    return obj;
  };
  Typr.name = {};
  Typr.name.parse = function(data, offset, length) {
    var bin = Typr._bin;
    var obj = {};
    bin.readUshort(data, offset);
    offset += 2;
    var count = bin.readUshort(data, offset);
    offset += 2;
    bin.readUshort(data, offset);
    offset += 2;
    var names = [
      "copyright",
      "fontFamily",
      "fontSubfamily",
      "ID",
      "fullName",
      "version",
      "postScriptName",
      "trademark",
      "manufacturer",
      "designer",
      "description",
      "urlVendor",
      "urlDesigner",
      "licence",
      "licenceURL",
      "---",
      "typoFamilyName",
      "typoSubfamilyName",
      "compatibleFull",
      "sampleText",
      "postScriptCID",
      "wwsFamilyName",
      "wwsSubfamilyName",
      "lightPalette",
      "darkPalette"
    ];
    var offset0 = offset;
    for (var i = 0; i < count; i++) {
      var platformID = bin.readUshort(data, offset);
      offset += 2;
      var encodingID = bin.readUshort(data, offset);
      offset += 2;
      var languageID = bin.readUshort(data, offset);
      offset += 2;
      var nameID = bin.readUshort(data, offset);
      offset += 2;
      var slen = bin.readUshort(data, offset);
      offset += 2;
      var noffset = bin.readUshort(data, offset);
      offset += 2;
      var cname = names[nameID];
      var soff = offset0 + count * 12 + noffset;
      var str;
      if (platformID == 0)
        str = bin.readUnicode(data, soff, slen / 2);
      else if (platformID == 3 && encodingID == 0)
        str = bin.readUnicode(data, soff, slen / 2);
      else if (encodingID == 0)
        str = bin.readASCII(data, soff, slen);
      else if (encodingID == 1)
        str = bin.readUnicode(data, soff, slen / 2);
      else if (encodingID == 3)
        str = bin.readUnicode(data, soff, slen / 2);
      else if (platformID == 1) {
        str = bin.readASCII(data, soff, slen);
        console.warn("reading unknown MAC encoding " + encodingID + " as ASCII");
      } else
        throw "unknown encoding " + encodingID + ", platformID: " + platformID;
      var tid = "p" + platformID + "," + languageID.toString(16);
      if (obj[tid] == null)
        obj[tid] = {};
      obj[tid][cname !== void 0 ? cname : nameID] = str;
      obj[tid]._lang = languageID;
    }
    for (var p in obj)
      if (obj[p].postScriptName != null && obj[p]._lang == 1033)
        return obj[p];
    for (var p in obj)
      if (obj[p].postScriptName != null && obj[p]._lang == 0)
        return obj[p];
    for (var p in obj)
      if (obj[p].postScriptName != null && obj[p]._lang == 3084)
        return obj[p];
    for (var p in obj)
      if (obj[p].postScriptName != null)
        return obj[p];
    var tname;
    for (var p in obj) {
      tname = p;
      break;
    }
    console.warn("returning name table with languageID " + obj[tname]._lang);
    return obj[tname];
  };
  Typr["OS/2"] = {};
  Typr["OS/2"].parse = function(data, offset, length) {
    var bin = Typr._bin;
    var ver = bin.readUshort(data, offset);
    offset += 2;
    var obj = {};
    if (ver == 0)
      Typr["OS/2"].version0(data, offset, obj);
    else if (ver == 1)
      Typr["OS/2"].version1(data, offset, obj);
    else if (ver == 2 || ver == 3 || ver == 4)
      Typr["OS/2"].version2(data, offset, obj);
    else if (ver == 5)
      Typr["OS/2"].version5(data, offset, obj);
    else
      throw "unknown OS/2 table version: " + ver;
    return obj;
  };
  Typr["OS/2"].version0 = function(data, offset, obj) {
    var bin = Typr._bin;
    obj.xAvgCharWidth = bin.readShort(data, offset);
    offset += 2;
    obj.usWeightClass = bin.readUshort(data, offset);
    offset += 2;
    obj.usWidthClass = bin.readUshort(data, offset);
    offset += 2;
    obj.fsType = bin.readUshort(data, offset);
    offset += 2;
    obj.ySubscriptXSize = bin.readShort(data, offset);
    offset += 2;
    obj.ySubscriptYSize = bin.readShort(data, offset);
    offset += 2;
    obj.ySubscriptXOffset = bin.readShort(data, offset);
    offset += 2;
    obj.ySubscriptYOffset = bin.readShort(data, offset);
    offset += 2;
    obj.ySuperscriptXSize = bin.readShort(data, offset);
    offset += 2;
    obj.ySuperscriptYSize = bin.readShort(data, offset);
    offset += 2;
    obj.ySuperscriptXOffset = bin.readShort(data, offset);
    offset += 2;
    obj.ySuperscriptYOffset = bin.readShort(data, offset);
    offset += 2;
    obj.yStrikeoutSize = bin.readShort(data, offset);
    offset += 2;
    obj.yStrikeoutPosition = bin.readShort(data, offset);
    offset += 2;
    obj.sFamilyClass = bin.readShort(data, offset);
    offset += 2;
    obj.panose = bin.readBytes(data, offset, 10);
    offset += 10;
    obj.ulUnicodeRange1 = bin.readUint(data, offset);
    offset += 4;
    obj.ulUnicodeRange2 = bin.readUint(data, offset);
    offset += 4;
    obj.ulUnicodeRange3 = bin.readUint(data, offset);
    offset += 4;
    obj.ulUnicodeRange4 = bin.readUint(data, offset);
    offset += 4;
    obj.achVendID = [bin.readInt8(data, offset), bin.readInt8(data, offset + 1), bin.readInt8(data, offset + 2), bin.readInt8(data, offset + 3)];
    offset += 4;
    obj.fsSelection = bin.readUshort(data, offset);
    offset += 2;
    obj.usFirstCharIndex = bin.readUshort(data, offset);
    offset += 2;
    obj.usLastCharIndex = bin.readUshort(data, offset);
    offset += 2;
    obj.sTypoAscender = bin.readShort(data, offset);
    offset += 2;
    obj.sTypoDescender = bin.readShort(data, offset);
    offset += 2;
    obj.sTypoLineGap = bin.readShort(data, offset);
    offset += 2;
    obj.usWinAscent = bin.readUshort(data, offset);
    offset += 2;
    obj.usWinDescent = bin.readUshort(data, offset);
    offset += 2;
    return offset;
  };
  Typr["OS/2"].version1 = function(data, offset, obj) {
    var bin = Typr._bin;
    offset = Typr["OS/2"].version0(data, offset, obj);
    obj.ulCodePageRange1 = bin.readUint(data, offset);
    offset += 4;
    obj.ulCodePageRange2 = bin.readUint(data, offset);
    offset += 4;
    return offset;
  };
  Typr["OS/2"].version2 = function(data, offset, obj) {
    var bin = Typr._bin;
    offset = Typr["OS/2"].version1(data, offset, obj);
    obj.sxHeight = bin.readShort(data, offset);
    offset += 2;
    obj.sCapHeight = bin.readShort(data, offset);
    offset += 2;
    obj.usDefault = bin.readUshort(data, offset);
    offset += 2;
    obj.usBreak = bin.readUshort(data, offset);
    offset += 2;
    obj.usMaxContext = bin.readUshort(data, offset);
    offset += 2;
    return offset;
  };
  Typr["OS/2"].version5 = function(data, offset, obj) {
    var bin = Typr._bin;
    offset = Typr["OS/2"].version2(data, offset, obj);
    obj.usLowerOpticalPointSize = bin.readUshort(data, offset);
    offset += 2;
    obj.usUpperOpticalPointSize = bin.readUshort(data, offset);
    offset += 2;
    return offset;
  };
  Typr.post = {};
  Typr.post.parse = function(data, offset, length) {
    var bin = Typr._bin;
    var obj = {};
    obj.version = bin.readFixed(data, offset);
    offset += 4;
    obj.italicAngle = bin.readFixed(data, offset);
    offset += 4;
    obj.underlinePosition = bin.readShort(data, offset);
    offset += 2;
    obj.underlineThickness = bin.readShort(data, offset);
    offset += 2;
    return obj;
  };
  Typr.SVG = {};
  Typr.SVG.parse = function(data, offset, length) {
    var bin = Typr._bin;
    var obj = { entries: [] };
    var offset0 = offset;
    bin.readUshort(data, offset);
    offset += 2;
    var svgDocIndexOffset = bin.readUint(data, offset);
    offset += 4;
    bin.readUint(data, offset);
    offset += 4;
    offset = svgDocIndexOffset + offset0;
    var numEntries = bin.readUshort(data, offset);
    offset += 2;
    for (var i = 0; i < numEntries; i++) {
      var startGlyphID = bin.readUshort(data, offset);
      offset += 2;
      var endGlyphID = bin.readUshort(data, offset);
      offset += 2;
      var svgDocOffset = bin.readUint(data, offset);
      offset += 4;
      var svgDocLength = bin.readUint(data, offset);
      offset += 4;
      var sbuf = new Uint8Array(data.buffer, offset0 + svgDocOffset + svgDocIndexOffset, svgDocLength);
      var svg = bin.readUTF8(sbuf, 0, sbuf.length);
      for (var f = startGlyphID; f <= endGlyphID; f++) {
        obj.entries[f] = svg;
      }
    }
    return obj;
  };
  Typr.SVG.toPath = function(str) {
    var pth = { cmds: [], crds: [] };
    if (str == null)
      return pth;
    var prsr = new DOMParser();
    var doc = prsr["parseFromString"](str, "image/svg+xml");
    var svg = doc.firstChild;
    while (svg.tagName != "svg")
      svg = svg.nextSibling;
    var vb = svg.getAttribute("viewBox");
    if (vb)
      vb = vb.trim().split(" ").map(parseFloat);
    else
      vb = [0, 0, 1e3, 1e3];
    Typr.SVG._toPath(svg.children, pth);
    for (var i = 0; i < pth.crds.length; i += 2) {
      var x = pth.crds[i], y = pth.crds[i + 1];
      x -= vb[0];
      y -= vb[1];
      y = -y;
      pth.crds[i] = x;
      pth.crds[i + 1] = y;
    }
    return pth;
  };
  Typr.SVG._toPath = function(nds, pth, fill) {
    for (var ni = 0; ni < nds.length; ni++) {
      var nd = nds[ni], tn = nd.tagName;
      var cfl = nd.getAttribute("fill");
      if (cfl == null)
        cfl = fill;
      if (tn == "g")
        Typr.SVG._toPath(nd.children, pth, cfl);
      else if (tn == "path") {
        pth.cmds.push(cfl ? cfl : "#000000");
        var d = nd.getAttribute("d");
        var toks = Typr.SVG._tokens(d);
        Typr.SVG._toksToPath(toks, pth);
        pth.cmds.push("X");
      } else if (tn == "defs")
        ;
      else
        console.warn(tn, nd);
    }
  };
  Typr.SVG._tokens = function(d) {
    var ts = [], off = 0, rn = false, cn = "";
    while (off < d.length) {
      var cc = d.charCodeAt(off), ch = d.charAt(off);
      off++;
      var isNum = 48 <= cc && cc <= 57 || ch == "." || ch == "-";
      if (rn) {
        if (ch == "-") {
          ts.push(parseFloat(cn));
          cn = ch;
        } else if (isNum)
          cn += ch;
        else {
          ts.push(parseFloat(cn));
          if (ch != "," && ch != " ")
            ts.push(ch);
          rn = false;
        }
      } else {
        if (isNum) {
          cn = ch;
          rn = true;
        } else if (ch != "," && ch != " ")
          ts.push(ch);
      }
    }
    if (rn)
      ts.push(parseFloat(cn));
    return ts;
  };
  Typr.SVG._toksToPath = function(ts, pth) {
    var i = 0, x = 0, y = 0, ox = 0, oy = 0;
    var pc = { "M": 2, "L": 2, "H": 1, "V": 1, "S": 4, "C": 6 };
    var cmds = pth.cmds, crds = pth.crds;
    while (i < ts.length) {
      var cmd = ts[i];
      i++;
      if (cmd == "z") {
        cmds.push("Z");
        x = ox;
        y = oy;
      } else {
        var cmu = cmd.toUpperCase();
        var ps = pc[cmu], reps = Typr.SVG._reps(ts, i, ps);
        for (var j = 0; j < reps; j++) {
          var xi = 0, yi = 0;
          if (cmd != cmu) {
            xi = x;
            yi = y;
          }
          if (cmu == "M") {
            x = xi + ts[i++];
            y = yi + ts[i++];
            cmds.push("M");
            crds.push(x, y);
            ox = x;
            oy = y;
          } else if (cmu == "L") {
            x = xi + ts[i++];
            y = yi + ts[i++];
            cmds.push("L");
            crds.push(x, y);
          } else if (cmu == "H") {
            x = xi + ts[i++];
            cmds.push("L");
            crds.push(x, y);
          } else if (cmu == "V") {
            y = yi + ts[i++];
            cmds.push("L");
            crds.push(x, y);
          } else if (cmu == "C") {
            var x1 = xi + ts[i++], y1 = yi + ts[i++], x2 = xi + ts[i++], y2 = yi + ts[i++], x3 = xi + ts[i++], y3 = yi + ts[i++];
            cmds.push("C");
            crds.push(x1, y1, x2, y2, x3, y3);
            x = x3;
            y = y3;
          } else if (cmu == "S") {
            var co = Math.max(crds.length - 4, 0);
            var x1 = x + x - crds[co], y1 = y + y - crds[co + 1];
            var x2 = xi + ts[i++], y2 = yi + ts[i++], x3 = xi + ts[i++], y3 = yi + ts[i++];
            cmds.push("C");
            crds.push(x1, y1, x2, y2, x3, y3);
            x = x3;
            y = y3;
          } else
            console.warn("Unknown SVG command " + cmd);
        }
      }
    }
  };
  Typr.SVG._reps = function(ts, off, ps) {
    var i = off;
    while (i < ts.length) {
      if (typeof ts[i] == "string")
        break;
      i += ps;
    }
    return (i - off) / ps;
  };
  if (Typr == null)
    Typr = {};
  if (Typr.U == null)
    Typr.U = {};
  Typr.U.codeToGlyph = function(font, code) {
    var cmap = font.cmap;
    for (var _i = 0, _a = [cmap.p0e4, cmap.p3e1, cmap.p3e10, cmap.p0e3, cmap.p1e0]; _i < _a.length; _i++) {
      var tind = _a[_i];
      if (tind == null)
        continue;
      var tab = cmap.tables[tind];
      if (tab.format == 0) {
        if (code >= tab.map.length)
          continue;
        return tab.map[code];
      } else if (tab.format == 4) {
        var sind = -1;
        for (var i = 0; i < tab.endCount.length; i++) {
          if (code <= tab.endCount[i]) {
            sind = i;
            break;
          }
        }
        if (sind == -1)
          continue;
        if (tab.startCount[sind] > code)
          continue;
        var gli = 0;
        if (tab.idRangeOffset[sind] != 0) {
          gli = tab.glyphIdArray[code - tab.startCount[sind] + (tab.idRangeOffset[sind] >> 1) - (tab.idRangeOffset.length - sind)];
        } else {
          gli = code + tab.idDelta[sind];
        }
        return gli & 65535;
      } else if (tab.format == 12) {
        if (code > tab.groups[tab.groups.length - 1][1])
          continue;
        for (var i = 0; i < tab.groups.length; i++) {
          var grp = tab.groups[i];
          if (grp[0] <= code && code <= grp[1])
            return grp[2] + (code - grp[0]);
        }
        continue;
      } else {
        throw "unknown cmap table format " + tab.format;
      }
    }
    return 0;
  };
  Typr.U.glyphToPath = function(font, gid) {
    var path = { cmds: [], crds: [] };
    if (font.SVG && font.SVG.entries[gid]) {
      var p = font.SVG.entries[gid];
      if (p == null)
        return path;
      if (typeof p == "string") {
        p = Typr.SVG.toPath(p);
        font.SVG.entries[gid] = p;
      }
      return p;
    } else if (font.CFF) {
      var state = { x: 0, y: 0, stack: [], nStems: 0, haveWidth: false, width: font.CFF.Private ? font.CFF.Private.defaultWidthX : 0, open: false };
      var cff = font.CFF, pdct = font.CFF.Private;
      if (cff.ROS) {
        var gi = 0;
        while (cff.FDSelect[gi + 2] <= gid)
          gi += 2;
        pdct = cff.FDArray[cff.FDSelect[gi + 1]].Private;
      }
      Typr.U._drawCFF(font.CFF.CharStrings[gid], state, cff, pdct, path);
    } else if (font.glyf) {
      Typr.U._drawGlyf(gid, font, path);
    }
    return path;
  };
  Typr.U._drawGlyf = function(gid, font, path) {
    var gl = font.glyf[gid];
    if (gl == null)
      gl = font.glyf[gid] = Typr.glyf._parseGlyf(font, gid);
    if (gl != null) {
      if (gl.noc > -1) {
        Typr.U._simpleGlyph(gl, path);
      } else {
        Typr.U._compoGlyph(gl, font, path);
      }
    }
  };
  Typr.U._simpleGlyph = function(gl, p) {
    for (var c = 0; c < gl.noc; c++) {
      var i0 = c == 0 ? 0 : gl.endPts[c - 1] + 1;
      var il = gl.endPts[c];
      for (var i = i0; i <= il; i++) {
        var pr = i == i0 ? il : i - 1;
        var nx = i == il ? i0 : i + 1;
        var onCurve = gl.flags[i] & 1;
        var prOnCurve = gl.flags[pr] & 1;
        var nxOnCurve = gl.flags[nx] & 1;
        var x = gl.xs[i], y = gl.ys[i];
        if (i == i0) {
          if (onCurve) {
            if (prOnCurve) {
              Typr.U.P.moveTo(p, gl.xs[pr], gl.ys[pr]);
            } else {
              Typr.U.P.moveTo(p, x, y);
              continue;
            }
          } else {
            if (prOnCurve) {
              Typr.U.P.moveTo(p, gl.xs[pr], gl.ys[pr]);
            } else {
              Typr.U.P.moveTo(p, (gl.xs[pr] + x) / 2, (gl.ys[pr] + y) / 2);
            }
          }
        }
        if (onCurve) {
          if (prOnCurve)
            Typr.U.P.lineTo(p, x, y);
        } else {
          if (nxOnCurve) {
            Typr.U.P.qcurveTo(p, x, y, gl.xs[nx], gl.ys[nx]);
          } else {
            Typr.U.P.qcurveTo(p, x, y, (x + gl.xs[nx]) / 2, (y + gl.ys[nx]) / 2);
          }
        }
      }
      Typr.U.P.closePath(p);
    }
  };
  Typr.U._compoGlyph = function(gl, font, p) {
    for (var j = 0; j < gl.parts.length; j++) {
      var path = { cmds: [], crds: [] };
      var prt = gl.parts[j];
      Typr.U._drawGlyf(prt.glyphIndex, font, path);
      var m = prt.m;
      for (var i = 0; i < path.crds.length; i += 2) {
        var x = path.crds[i], y = path.crds[i + 1];
        p.crds.push(x * m.a + y * m.b + m.tx);
        p.crds.push(x * m.c + y * m.d + m.ty);
      }
      for (var i = 0; i < path.cmds.length; i++) {
        p.cmds.push(path.cmds[i]);
      }
    }
  };
  Typr.U._getGlyphClass = function(g, cd) {
    var intr = Typr._lctf.getInterval(cd, g);
    return intr == -1 ? 0 : cd[intr + 2];
  };
  Typr.U.getPairAdjustment = function(font, g1, g2) {
    var hasGPOSkern = false;
    if (font.GPOS) {
      var gpos = font["GPOS"];
      var llist = gpos.lookupList, flist = gpos.featureList;
      var tused = [];
      for (var i = 0; i < flist.length; i++) {
        var fl = flist[i];
        if (fl.tag != "kern")
          continue;
        hasGPOSkern = true;
        for (var ti = 0; ti < fl.tab.length; ti++) {
          if (tused[fl.tab[ti]])
            continue;
          tused[fl.tab[ti]] = true;
          var tab = llist[fl.tab[ti]];
          for (var j = 0; j < tab.tabs.length; j++) {
            if (tab.tabs[j] == null)
              continue;
            var ltab = tab.tabs[j], ind;
            if (ltab.coverage) {
              ind = Typr._lctf.coverageIndex(ltab.coverage, g1);
              if (ind == -1)
                continue;
            }
            if (tab.ltype == 1)
              ;
            else if (tab.ltype == 2) {
              var adj = null;
              if (ltab.fmt == 1) {
                var right = ltab.pairsets[ind];
                for (var i = 0; i < right.length; i++) {
                  if (right[i].gid2 == g2)
                    adj = right[i];
                }
              } else if (ltab.fmt == 2) {
                var c1 = Typr.U._getGlyphClass(g1, ltab.classDef1);
                var c2 = Typr.U._getGlyphClass(g2, ltab.classDef2);
                adj = ltab.matrix[c1][c2];
              }
              if (adj) {
                var offset = 0;
                if (adj.val1 && adj.val1[2])
                  offset += adj.val1[2];
                if (adj.val2 && adj.val2[0])
                  offset += adj.val2[0];
                return offset;
              }
            }
          }
        }
      }
    }
    if (font.kern && !hasGPOSkern) {
      var ind1 = font.kern.glyph1.indexOf(g1);
      if (ind1 != -1) {
        var ind2 = font.kern.rval[ind1].glyph2.indexOf(g2);
        if (ind2 != -1)
          return font.kern.rval[ind1].vals[ind2];
      }
    }
    return 0;
  };
  Typr.U.stringToGlyphs = function(font, str) {
    var gls = [];
    for (var i = 0; i < str.length; i++) {
      var cc = str.codePointAt(i);
      if (cc > 65535)
        i++;
      gls.push(Typr.U.codeToGlyph(font, cc));
    }
    for (var i = 0; i < str.length; i++) {
      var cc = str.codePointAt(i);
      if (cc == 2367) {
        var t = gls[i - 1];
        gls[i - 1] = gls[i];
        gls[i] = t;
      }
      if (cc > 65535)
        i++;
    }
    var gsub = font["GSUB"];
    if (gsub == null)
      return gls;
    var llist = gsub.lookupList, flist = gsub.featureList;
    var cligs = [
      "rlig",
      "liga",
      "mset",
      "isol",
      "init",
      "fina",
      "medi",
      "half",
      "pres",
      "blws"
      /* Tibetan fonts like Himalaya.ttf */
    ];
    var tused = [];
    for (var fi = 0; fi < flist.length; fi++) {
      var fl = flist[fi];
      if (cligs.indexOf(fl.tag) == -1)
        continue;
      for (var ti = 0; ti < fl.tab.length; ti++) {
        if (tused[fl.tab[ti]])
          continue;
        tused[fl.tab[ti]] = true;
        var tab = llist[fl.tab[ti]];
        for (var ci = 0; ci < gls.length; ci++) {
          var feat = Typr.U._getWPfeature(str, ci);
          if ("isol,init,fina,medi".indexOf(fl.tag) != -1 && fl.tag != feat)
            continue;
          Typr.U._applySubs(gls, ci, tab, llist);
        }
      }
    }
    return gls;
  };
  Typr.U._getWPfeature = function(str, ci) {
    var wsep = '\n	" ,.:;!?()  ،';
    var R = "آأؤإاةدذرزوٱٲٳٵٶٷڈډڊڋڌڍڎڏڐڑڒړڔڕږڗژڙۀۃۄۅۆۇۈۉۊۋۍۏےۓەۮۯܐܕܖܗܘܙܞܨܪܬܯݍݙݚݛݫݬݱݳݴݸݹࡀࡆࡇࡉࡔࡧࡩࡪࢪࢫࢬࢮࢱࢲࢹૅેૉ૊૎૏ૐ૑૒૝ૡ૤૯஁ஃ஄அஉ஌எஏ஑னப஫஬";
    var L = "ꡲ્૗";
    var slft = ci == 0 || wsep.indexOf(str[ci - 1]) != -1;
    var srgt = ci == str.length - 1 || wsep.indexOf(str[ci + 1]) != -1;
    if (!slft && R.indexOf(str[ci - 1]) != -1)
      slft = true;
    if (!srgt && R.indexOf(str[ci]) != -1)
      srgt = true;
    if (!srgt && L.indexOf(str[ci + 1]) != -1)
      srgt = true;
    if (!slft && L.indexOf(str[ci]) != -1)
      slft = true;
    var feat = null;
    if (slft) {
      feat = srgt ? "isol" : "init";
    } else {
      feat = srgt ? "fina" : "medi";
    }
    return feat;
  };
  Typr.U._applySubs = function(gls, ci, tab, llist) {
    var rlim = gls.length - ci - 1;
    for (var j = 0; j < tab.tabs.length; j++) {
      if (tab.tabs[j] == null)
        continue;
      var ltab = tab.tabs[j], ind;
      if (ltab.coverage) {
        ind = Typr._lctf.coverageIndex(ltab.coverage, gls[ci]);
        if (ind == -1)
          continue;
      }
      if (tab.ltype == 1) {
        gls[ci];
        if (ltab.fmt == 1)
          gls[ci] = gls[ci] + ltab.delta;
        else
          gls[ci] = ltab.newg[ind];
      } else if (tab.ltype == 4) {
        var vals = ltab.vals[ind];
        for (var k = 0; k < vals.length; k++) {
          var lig = vals[k], rl = lig.chain.length;
          if (rl > rlim)
            continue;
          var good = true, em1 = 0;
          for (var l = 0; l < rl; l++) {
            while (gls[ci + em1 + (1 + l)] == -1)
              em1++;
            if (lig.chain[l] != gls[ci + em1 + (1 + l)])
              good = false;
          }
          if (!good)
            continue;
          gls[ci] = lig.nglyph;
          for (var l = 0; l < rl + em1; l++)
            gls[ci + l + 1] = -1;
          break;
        }
      } else if (tab.ltype == 5 && ltab.fmt == 2) {
        var cind = Typr._lctf.getInterval(ltab.cDef, gls[ci]);
        var cls = ltab.cDef[cind + 2], scs = ltab.scset[cls];
        for (var i = 0; i < scs.length; i++) {
          var sc = scs[i], inp = sc.input;
          if (inp.length > rlim)
            continue;
          var good = true;
          for (var l = 0; l < inp.length; l++) {
            var cind2 = Typr._lctf.getInterval(ltab.cDef, gls[ci + 1 + l]);
            if (cind == -1 && ltab.cDef[cind2 + 2] != inp[l]) {
              good = false;
              break;
            }
          }
          if (!good)
            continue;
          var lrs = sc.substLookupRecords;
          for (var k = 0; k < lrs.length; k += 2) {
            lrs[k];
            lrs[k + 1];
          }
        }
      } else if (tab.ltype == 6 && ltab.fmt == 3) {
        if (!Typr.U._glsCovered(gls, ltab.backCvg, ci - ltab.backCvg.length))
          continue;
        if (!Typr.U._glsCovered(gls, ltab.inptCvg, ci))
          continue;
        if (!Typr.U._glsCovered(gls, ltab.ahedCvg, ci + ltab.inptCvg.length))
          continue;
        var lr = ltab.lookupRec;
        for (var i = 0; i < lr.length; i += 2) {
          var cind = lr[i], tab2 = llist[lr[i + 1]];
          Typr.U._applySubs(gls, ci + cind, tab2, llist);
        }
      }
    }
  };
  Typr.U._glsCovered = function(gls, cvgs, ci) {
    for (var i = 0; i < cvgs.length; i++) {
      var ind = Typr._lctf.coverageIndex(cvgs[i], gls[ci + i]);
      if (ind == -1)
        return false;
    }
    return true;
  };
  Typr.U.glyphsToPath = function(font, gls, clr) {
    var tpath = { cmds: [], crds: [] };
    var x = 0;
    for (var i = 0; i < gls.length; i++) {
      var gid = gls[i];
      if (gid == -1)
        continue;
      var gid2 = i < gls.length - 1 && gls[i + 1] != -1 ? gls[i + 1] : 0;
      var path = Typr.U.glyphToPath(font, gid);
      for (var j = 0; j < path.crds.length; j += 2) {
        tpath.crds.push(path.crds[j] + x);
        tpath.crds.push(path.crds[j + 1]);
      }
      if (clr)
        tpath.cmds.push(clr);
      for (var j = 0; j < path.cmds.length; j++)
        tpath.cmds.push(path.cmds[j]);
      if (clr)
        tpath.cmds.push("X");
      x += font.hmtx.aWidth[gid];
      if (i < gls.length - 1)
        x += Typr.U.getPairAdjustment(font, gid, gid2);
    }
    return tpath;
  };
  Typr.U.pathToSVG = function(path, prec) {
    if (prec == null)
      prec = 5;
    var out = [], co = 0, lmap = { "M": 2, "L": 2, "Q": 4, "C": 6 };
    for (var i = 0; i < path.cmds.length; i++) {
      var cmd = path.cmds[i], cn = co + (lmap[cmd] ? lmap[cmd] : 0);
      out.push(cmd);
      while (co < cn) {
        var c = path.crds[co++];
        out.push(parseFloat(c.toFixed(prec)) + (co == cn ? "" : " "));
      }
    }
    return out.join("");
  };
  Typr.U.pathToContext = function(path, ctx) {
    var c = 0, crds = path.crds;
    for (var j = 0; j < path.cmds.length; j++) {
      var cmd = path.cmds[j];
      if (cmd == "M") {
        ctx.moveTo(crds[c], crds[c + 1]);
        c += 2;
      } else if (cmd == "L") {
        ctx.lineTo(crds[c], crds[c + 1]);
        c += 2;
      } else if (cmd == "C") {
        ctx.bezierCurveTo(crds[c], crds[c + 1], crds[c + 2], crds[c + 3], crds[c + 4], crds[c + 5]);
        c += 6;
      } else if (cmd == "Q") {
        ctx.quadraticCurveTo(crds[c], crds[c + 1], crds[c + 2], crds[c + 3]);
        c += 4;
      } else if (cmd.charAt(0) == "#") {
        ctx.beginPath();
        ctx.fillStyle = cmd;
      } else if (cmd == "Z") {
        ctx.closePath();
      } else if (cmd == "X") {
        ctx.fill();
      }
    }
  };
  Typr.U.P = {};
  Typr.U.P.moveTo = function(p, x, y) {
    p.cmds.push("M");
    p.crds.push(x, y);
  };
  Typr.U.P.lineTo = function(p, x, y) {
    p.cmds.push("L");
    p.crds.push(x, y);
  };
  Typr.U.P.curveTo = function(p, a, b, c, d, e, f) {
    p.cmds.push("C");
    p.crds.push(a, b, c, d, e, f);
  };
  Typr.U.P.qcurveTo = function(p, a, b, c, d) {
    p.cmds.push("Q");
    p.crds.push(a, b, c, d);
  };
  Typr.U.P.closePath = function(p) {
    p.cmds.push("Z");
  };
  Typr.U._drawCFF = function(cmds, state, font, pdct, p) {
    var stack = state.stack;
    var nStems = state.nStems, haveWidth = state.haveWidth, width = state.width, open = state.open;
    var i = 0;
    var x = state.x, y = state.y, c1x = 0, c1y = 0, c2x = 0, c2y = 0, c3x = 0, c3y = 0, c4x = 0, c4y = 0, jpx = 0, jpy = 0;
    var o = { val: 0, size: 0 };
    while (i < cmds.length) {
      Typr.CFF.getCharString(cmds, i, o);
      var v = o.val;
      i += o.size;
      if (v == "o1" || v == "o18") {
        var hasWidthArg;
        hasWidthArg = stack.length % 2 !== 0;
        if (hasWidthArg && !haveWidth) {
          width = stack.shift() + pdct.nominalWidthX;
        }
        nStems += stack.length >> 1;
        stack.length = 0;
        haveWidth = true;
      } else if (v == "o3" || v == "o23") {
        var hasWidthArg;
        hasWidthArg = stack.length % 2 !== 0;
        if (hasWidthArg && !haveWidth) {
          width = stack.shift() + pdct.nominalWidthX;
        }
        nStems += stack.length >> 1;
        stack.length = 0;
        haveWidth = true;
      } else if (v == "o4") {
        if (stack.length > 1 && !haveWidth) {
          width = stack.shift() + pdct.nominalWidthX;
          haveWidth = true;
        }
        if (open)
          Typr.U.P.closePath(p);
        y += stack.pop();
        Typr.U.P.moveTo(p, x, y);
        open = true;
      } else if (v == "o5") {
        while (stack.length > 0) {
          x += stack.shift();
          y += stack.shift();
          Typr.U.P.lineTo(p, x, y);
        }
      } else if (v == "o6" || v == "o7") {
        var count = stack.length;
        var isX = v == "o6";
        for (var j = 0; j < count; j++) {
          var sval = stack.shift();
          if (isX) {
            x += sval;
          } else {
            y += sval;
          }
          isX = !isX;
          Typr.U.P.lineTo(p, x, y);
        }
      } else if (v == "o8" || v == "o24") {
        var count = stack.length;
        var index = 0;
        while (index + 6 <= count) {
          c1x = x + stack.shift();
          c1y = y + stack.shift();
          c2x = c1x + stack.shift();
          c2y = c1y + stack.shift();
          x = c2x + stack.shift();
          y = c2y + stack.shift();
          Typr.U.P.curveTo(p, c1x, c1y, c2x, c2y, x, y);
          index += 6;
        }
        if (v == "o24") {
          x += stack.shift();
          y += stack.shift();
          Typr.U.P.lineTo(p, x, y);
        }
      } else if (v == "o11") {
        break;
      } else if (v == "o1234" || v == "o1235" || v == "o1236" || v == "o1237") {
        if (v == "o1234") {
          c1x = x + stack.shift();
          c1y = y;
          c2x = c1x + stack.shift();
          c2y = c1y + stack.shift();
          jpx = c2x + stack.shift();
          jpy = c2y;
          c3x = jpx + stack.shift();
          c3y = c2y;
          c4x = c3x + stack.shift();
          c4y = y;
          x = c4x + stack.shift();
          Typr.U.P.curveTo(p, c1x, c1y, c2x, c2y, jpx, jpy);
          Typr.U.P.curveTo(p, c3x, c3y, c4x, c4y, x, y);
        }
        if (v == "o1235") {
          c1x = x + stack.shift();
          c1y = y + stack.shift();
          c2x = c1x + stack.shift();
          c2y = c1y + stack.shift();
          jpx = c2x + stack.shift();
          jpy = c2y + stack.shift();
          c3x = jpx + stack.shift();
          c3y = jpy + stack.shift();
          c4x = c3x + stack.shift();
          c4y = c3y + stack.shift();
          x = c4x + stack.shift();
          y = c4y + stack.shift();
          stack.shift();
          Typr.U.P.curveTo(p, c1x, c1y, c2x, c2y, jpx, jpy);
          Typr.U.P.curveTo(p, c3x, c3y, c4x, c4y, x, y);
        }
        if (v == "o1236") {
          c1x = x + stack.shift();
          c1y = y + stack.shift();
          c2x = c1x + stack.shift();
          c2y = c1y + stack.shift();
          jpx = c2x + stack.shift();
          jpy = c2y;
          c3x = jpx + stack.shift();
          c3y = c2y;
          c4x = c3x + stack.shift();
          c4y = c3y + stack.shift();
          x = c4x + stack.shift();
          Typr.U.P.curveTo(p, c1x, c1y, c2x, c2y, jpx, jpy);
          Typr.U.P.curveTo(p, c3x, c3y, c4x, c4y, x, y);
        }
        if (v == "o1237") {
          c1x = x + stack.shift();
          c1y = y + stack.shift();
          c2x = c1x + stack.shift();
          c2y = c1y + stack.shift();
          jpx = c2x + stack.shift();
          jpy = c2y + stack.shift();
          c3x = jpx + stack.shift();
          c3y = jpy + stack.shift();
          c4x = c3x + stack.shift();
          c4y = c3y + stack.shift();
          if (Math.abs(c4x - x) > Math.abs(c4y - y)) {
            x = c4x + stack.shift();
          } else {
            y = c4y + stack.shift();
          }
          Typr.U.P.curveTo(p, c1x, c1y, c2x, c2y, jpx, jpy);
          Typr.U.P.curveTo(p, c3x, c3y, c4x, c4y, x, y);
        }
      } else if (v == "o14") {
        if (stack.length > 0 && !haveWidth) {
          width = stack.shift() + font.nominalWidthX;
          haveWidth = true;
        }
        if (stack.length == 4) {
          var adx = stack.shift();
          var ady = stack.shift();
          var bchar = stack.shift();
          var achar = stack.shift();
          var bind2 = Typr.CFF.glyphBySE(font, bchar);
          var aind = Typr.CFF.glyphBySE(font, achar);
          Typr.U._drawCFF(font.CharStrings[bind2], state, font, pdct, p);
          state.x = adx;
          state.y = ady;
          Typr.U._drawCFF(font.CharStrings[aind], state, font, pdct, p);
        }
        if (open) {
          Typr.U.P.closePath(p);
          open = false;
        }
      } else if (v == "o19" || v == "o20") {
        var hasWidthArg;
        hasWidthArg = stack.length % 2 !== 0;
        if (hasWidthArg && !haveWidth) {
          width = stack.shift() + pdct.nominalWidthX;
        }
        nStems += stack.length >> 1;
        stack.length = 0;
        haveWidth = true;
        i += nStems + 7 >> 3;
      } else if (v == "o21") {
        if (stack.length > 2 && !haveWidth) {
          width = stack.shift() + pdct.nominalWidthX;
          haveWidth = true;
        }
        y += stack.pop();
        x += stack.pop();
        if (open)
          Typr.U.P.closePath(p);
        Typr.U.P.moveTo(p, x, y);
        open = true;
      } else if (v == "o22") {
        if (stack.length > 1 && !haveWidth) {
          width = stack.shift() + pdct.nominalWidthX;
          haveWidth = true;
        }
        x += stack.pop();
        if (open)
          Typr.U.P.closePath(p);
        Typr.U.P.moveTo(p, x, y);
        open = true;
      } else if (v == "o25") {
        while (stack.length > 6) {
          x += stack.shift();
          y += stack.shift();
          Typr.U.P.lineTo(p, x, y);
        }
        c1x = x + stack.shift();
        c1y = y + stack.shift();
        c2x = c1x + stack.shift();
        c2y = c1y + stack.shift();
        x = c2x + stack.shift();
        y = c2y + stack.shift();
        Typr.U.P.curveTo(p, c1x, c1y, c2x, c2y, x, y);
      } else if (v == "o26") {
        if (stack.length % 2) {
          x += stack.shift();
        }
        while (stack.length > 0) {
          c1x = x;
          c1y = y + stack.shift();
          c2x = c1x + stack.shift();
          c2y = c1y + stack.shift();
          x = c2x;
          y = c2y + stack.shift();
          Typr.U.P.curveTo(p, c1x, c1y, c2x, c2y, x, y);
        }
      } else if (v == "o27") {
        if (stack.length % 2) {
          y += stack.shift();
        }
        while (stack.length > 0) {
          c1x = x + stack.shift();
          c1y = y;
          c2x = c1x + stack.shift();
          c2y = c1y + stack.shift();
          x = c2x + stack.shift();
          y = c2y;
          Typr.U.P.curveTo(p, c1x, c1y, c2x, c2y, x, y);
        }
      } else if (v == "o10" || v == "o29") {
        var obj = v == "o10" ? pdct : font;
        if (stack.length == 0) {
          console.warn("error: empty stack");
        } else {
          var ind = stack.pop();
          var subr = obj.Subrs[ind + obj.Bias];
          state.x = x;
          state.y = y;
          state.nStems = nStems;
          state.haveWidth = haveWidth;
          state.width = width;
          state.open = open;
          Typr.U._drawCFF(subr, state, font, pdct, p);
          x = state.x;
          y = state.y;
          nStems = state.nStems;
          haveWidth = state.haveWidth;
          width = state.width;
          open = state.open;
        }
      } else if (v == "o30" || v == "o31") {
        var count, count1 = stack.length;
        var index = 0;
        var alternate = v == "o31";
        count = count1 & ~2;
        index += count1 - count;
        while (index < count) {
          if (alternate) {
            c1x = x + stack.shift();
            c1y = y;
            c2x = c1x + stack.shift();
            c2y = c1y + stack.shift();
            y = c2y + stack.shift();
            if (count - index == 5) {
              x = c2x + stack.shift();
              index++;
            } else {
              x = c2x;
            }
            alternate = false;
          } else {
            c1x = x;
            c1y = y + stack.shift();
            c2x = c1x + stack.shift();
            c2y = c1y + stack.shift();
            x = c2x + stack.shift();
            if (count - index == 5) {
              y = c2y + stack.shift();
              index++;
            } else {
              y = c2y;
            }
            alternate = true;
          }
          Typr.U.P.curveTo(p, c1x, c1y, c2x, c2y, x, y);
          index += 4;
        }
      } else if ((v + "").charAt(0) == "o") {
        console.warn("Unknown operation: " + v, cmds);
        throw v;
      } else
        stack.push(v);
    }
    state.x = x;
    state.y = y;
    state.nStems = nStems;
    state.haveWidth = haveWidth;
    state.width = width;
    state.open = open;
  };
  Typr$1.Typr = Typr;
  var Typr_js_1 = Typr$1;
  var friendlyTags = { "aalt": "Access All Alternates", "abvf": "Above-base Forms", "abvm": "Above - base Mark Positioning", "abvs": "Above - base Substitutions", "afrc": "Alternative Fractions", "akhn": "Akhands", "blwf": "Below - base Forms", "blwm": "Below - base Mark Positioning", "blws": "Below - base Substitutions", "calt": "Contextual Alternates", "case": "Case - Sensitive Forms", "ccmp": "Glyph Composition / Decomposition", "cfar": "Conjunct Form After Ro", "cjct": "Conjunct Forms", "clig": "Contextual Ligatures", "cpct": "Centered CJK Punctuation", "cpsp": "Capital Spacing", "cswh": "Contextual Swash", "curs": "Cursive Positioning", "c2pc": "Petite Capitals From Capitals", "c2sc": "Small Capitals From Capitals", "dist": "Distances", "dlig": "Discretionary Ligatures", "dnom": "Denominators", "dtls": "Dotless Forms", "expt": "Expert Forms", "falt": "Final Glyph on Line Alternates", "fin2": "Terminal Forms #2", "fin3": "Terminal Forms #3", "fina": "Terminal Forms", "flac": "Flattened accent forms", "frac": "Fractions", "fwid": "Full Widths", "half": "Half Forms", "haln": "Halant Forms", "halt": "Alternate Half Widths", "hist": "Historical Forms", "hkna": "Horizontal Kana Alternates", "hlig": "Historical Ligatures", "hngl": "Hangul", "hojo": "Hojo Kanji Forms(JIS X 0212 - 1990 Kanji Forms)", "hwid": "Half Widths", "init": "Initial Forms", "isol": "Isolated Forms", "ital": "Italics", "jalt": "Justification Alternates", "jp78": "JIS78 Forms", "jp83": "JIS83 Forms", "jp90": "JIS90 Forms", "jp04": "JIS2004 Forms", "kern": "Kerning", "lfbd": "Left Bounds", "liga": "Standard Ligatures", "ljmo": "Leading Jamo Forms", "lnum": "Lining Figures", "locl": "Localized Forms", "ltra": "Left - to - right alternates", "ltrm": "Left - to - right mirrored forms", "mark": "Mark Positioning", "med2": "Medial Forms #2", "medi": "Medial Forms", "mgrk": "Mathematical Greek", "mkmk": "Mark to Mark Positioning", "mset": "Mark Positioning via Substitution", "nalt": "Alternate Annotation Forms", "nlck": "NLC Kanji Forms", "nukt": "Nukta Forms", "numr": "Numerators", "onum": "Oldstyle Figures", "opbd": "Optical Bounds", "ordn": "Ordinals", "ornm": "Ornaments", "palt": "Proportional Alternate Widths", "pcap": "Petite Capitals", "pkna": "Proportional Kana", "pnum": "Proportional Figures", "pref": "Pre - Base Forms", "pres": "Pre - base Substitutions", "pstf": "Post - base Forms", "psts": "Post - base Substitutions", "pwid": "Proportional Widths", "qwid": "Quarter Widths", "rand": "Randomize", "rclt": "Required Contextual Alternates", "rkrf": "Rakar Forms", "rlig": "Required Ligatures", "rphf": "Reph Forms", "rtbd": "Right Bounds", "rtla": "Right - to - left alternates", "rtlm": "Right - to - left mirrored forms", "ruby": "Ruby Notation Forms", "rvrn": "Required Variation Alternates", "salt": "Stylistic Alternates", "sinf": "Scientific Inferiors", "size": "Optical size", "smcp": "Small Capitals", "smpl": "Simplified Forms", "ssty": "Math script style alternates", "stch": "Stretching Glyph Decomposition", "subs": "Subscript", "sups": "Superscript", "swsh": "Swash", "titl": "Titling", "tjmo": "Trailing Jamo Forms", "tnam": "Traditional Name Forms", "tnum": "Tabular Figures", "trad": "Traditional Forms", "twid": "Third Widths", "unic": "Unicase", "valt": "Alternate Vertical Metrics", "vatu": "Vattu Variants", "vert": "Vertical Writing", "vhal": "Alternate Vertical Half Metrics", "vjmo": "Vowel Jamo Forms", "vkna": "Vertical Kana Alternates", "vkrn": "Vertical Kerning", "vpal": "Proportional Alternate Vertical Metrics", "vrt2": "Vertical Alternates and Rotation", "vrtr": "Vertical Alternates for Rotation", "zero": "Slashed Zero" };
  var Font = (
    /** @class */
    function() {
      function Font2(data) {
        var obj = Typr_js_1.Typr.parse(data);
        if (!obj.length || typeof obj[0] !== "object" || typeof obj[0].hasOwnProperty !== "function") {
          throw "unable to parse font";
        }
        for (var n in obj[0]) {
          this[n] = obj[0][n];
        }
        this.enabledGSUB = {};
      }
      Font2.prototype.getFamilyName = function() {
        return this.name && (this.name.typoFamilyName || this.name.fontFamily) || "";
      };
      Font2.prototype.getSubFamilyName = function() {
        return this.name && (this.name.typoSubfamilyName || this.name.fontSubfamily) || "";
      };
      Font2.prototype.glyphToPath = function(gid) {
        return Typr_js_1.Typr.U.glyphToPath(this, gid);
      };
      Font2.prototype.getPairAdjustment = function(gid1, gid2) {
        return Typr_js_1.Typr.U.getPairAdjustment(this, gid1, gid2);
      };
      Font2.prototype.stringToGlyphs = function(str) {
        return Typr_js_1.Typr.U.stringToGlyphs(this, str);
      };
      Font2.prototype.glyphsToPath = function(gls) {
        return Typr_js_1.Typr.U.glyphsToPath(this, gls);
      };
      Font2.prototype.pathToSVG = function(path, prec) {
        return Typr_js_1.Typr.U.pathToSVG(path, prec);
      };
      Font2.prototype.pathToContext = function(path, ctx) {
        return Typr_js_1.Typr.U.pathToContext(path, ctx);
      };
      Font2.prototype.lookupFriendlyName = function(table, feature) {
        if (this[table] !== void 0) {
          var tbl = this[table];
          var feat = tbl.featureList[feature];
          return this.featureFriendlyName(feat);
        }
        return "";
      };
      Font2.prototype.featureFriendlyName = function(feature) {
        if (friendlyTags[feature.tag]) {
          return friendlyTags[feature.tag];
        }
        if (feature.tag.match(/ss[0-2][0-9]/)) {
          var name_1 = "Stylistic Set " + Number(feature.tag.substr(2, 2)).toString();
          if (feature.featureParams) {
            var version = Typr_js_1.Typr._bin.readUshort(this._data, feature.featureParams);
            if (version === 0) {
              var nameID = Typr_js_1.Typr._bin.readUshort(this._data, feature.featureParams + 2);
              if (this.name && this.name[nameID] !== void 0) {
                return name_1 + " - " + this.name[nameID];
              }
            }
          }
          return name_1;
        }
        if (feature.tag.match(/cv[0-9][0-9]/)) {
          return "Character Variant " + Number(feature.tag.substr(2, 2)).toString();
        }
        return "";
      };
      Font2.prototype.enableGSUB = function(featureNumber) {
        if (this.GSUB) {
          var feature = this.GSUB.featureList[featureNumber];
          if (feature) {
            for (var i = 0; i < feature.tab.length; ++i) {
              this.enabledGSUB[feature.tab[i]] = (this.enabledGSUB[feature.tab[i]] || 0) + 1;
            }
          }
        }
      };
      Font2.prototype.disableGSUB = function(featureNumber) {
        if (this.GSUB) {
          var feature = this.GSUB.featureList[featureNumber];
          if (feature) {
            for (var i = 0; i < feature.tab.length; ++i) {
              if (this.enabledGSUB[feature.tab[i]] > 1) {
                --this.enabledGSUB[feature.tab[i]];
              } else {
                delete this.enabledGSUB[feature.tab[i]];
              }
            }
          }
        }
      };
      Font2.prototype.codeToGlyph = function(code) {
        var g = Typr_js_1.Typr.U.codeToGlyph(this, code);
        if (this.GSUB) {
          var gls = [g];
          for (var n in this.enabledGSUB) {
            var l = this.GSUB.lookupList[n];
            Typr_js_1.Typr.U._applySubs(gls, 0, l, this.GSUB.lookupList);
          }
          if (gls.length === 1)
            return gls[0];
        }
        return g;
      };
      return Font2;
    }()
  );
  var Font_1 = Font;
  function decrypt(iframeDocument) {
    var _a, _b, _c;
    const styles = iframeDocument.querySelectorAll("style");
    let tip;
    for (let i = 0; i < styles.length; i++) {
      if ((_a = styles[i].textContent) == null ? void 0 : _a.includes("font-cxsecret")) {
        tip = styles[i];
        break;
      }
    }
    if (!tip)
      return;
    const fontData = (_c = (_b = tip.textContent) == null ? void 0 : _b.match(/base64,([\w\W]+?)'/)) == null ? void 0 : _c[1];
    if (!fontData)
      return;
    const fontBuffer = base64ToArrayBuffer(fontData);
    const font = new Font_1(fontBuffer);
    const table = JSON.parse(_GM_getResourceText("ttf"));
    const match = {};
    for (let i = 19968; i < 40870; i++) {
      const glyph = font.codeToGlyph(i);
      if (!glyph)
        continue;
      const path = font.glyphToPath(glyph);
      const hash = md5(JSON.stringify(path)).slice(24);
      match[i] = table[hash];
    }
    const elements = iframeDocument.querySelectorAll(".font-cxsecret");
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      let html = el.innerHTML;
      for (const key in match) {
        const value = String.fromCharCode(match[key]);
        const regExp = new RegExp(String.fromCharCode(Number(key)), "g");
        html = html.replace(regExp, value);
      }
      el.innerHTML = html;
      el.classList.remove("font-cxsecret");
    }
    function base64ToArrayBuffer(base64) {
      const data = window.atob(base64);
      const buffer = new ArrayBuffer(data.length);
      const bytes = new Uint8Array(buffer);
      for (let i = 0; i < data.length; ++i) {
        bytes[i] = data.charCodeAt(i);
      }
      return buffer;
    }
  }
  class BaseQuestionHandler {
    constructor() {
      __publicField(this, "_document", document);
      __publicField(this, "_window", _unsafeWindow);
      __publicField(this, "addLog");
      __publicField(this, "addQuestion");
      __publicField(this, "questions", []);
      __publicField(this, "correctNum", 0);
      __publicField(this, "parseHtml", () => {
        throw new Error("请使用继承类的重写方法");
      });
      __publicField(this, "fillQuestion", (question) => {
        throw new Error("请使用继承类的重写方法");
      });
      __publicField(this, "removeHtml", (html) => {
        if (html == null) {
          return "";
        }
        return html.replace(/<((?!img|sub|sup|br)[^>]+)>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").replace(/<br\s*\/?>/g, "\n").replace(/<img.*?src="(.*?)".*?>/g, '<img src="$1"/>').trim();
      });
      __publicField(this, "clean", (str) => {
        return str.replace(/^【*?】\s*/, "").replace(/\s*（\d+\.\d+分）$/, "");
      });
      __publicField(this, "getOptionLabel", (rawOptionElement) => {
        const toRawVal = (v) => (typeof vue != "undefined" && vue.toRaw ? vue.toRaw(v) : v);
        const optionElement = toRawVal(rawOptionElement);
        if (!optionElement) return "";
        const input = (optionElement.matches && optionElement.matches("input"))
          ? optionElement
          : (optionElement.querySelector ? optionElement.querySelector("input[type='radio'], input[type='checkbox']") : null);
        if (input && input.value && /^[A-Za-z]$/.test(input.value.trim())) {
          return input.value.trim().toUpperCase();
        }
        const numEl = (optionElement.matches && optionElement.matches(".num_option, .num_option_dx, .num_option_span, .Cy_circle, [class*='num_option'], [data-option]"))
          ? optionElement
          : (optionElement.querySelector ? optionElement.querySelector(".num_option, .num_option_dx, .num_option_span, .Cy_circle, [class*='num_option'], [data-option]") : null);
        if (numEl && numEl.textContent) {
          const txt = numEl.textContent.replace(/[.、:：\s]/g, "").trim().toUpperCase();
          if (/^[A-Za-z]$/.test(txt)) return txt;
        }
        const ariaLabel = (optionElement.getAttribute && optionElement.getAttribute("aria-label")) || "";
        const m = ariaLabel.match(/([A-Za-z])[选择.\s]?/);
        if (m) return m[1].toUpperCase();

        const dataVal = (optionElement.getAttribute && optionElement.getAttribute("data")) || (numEl && numEl.getAttribute && numEl.getAttribute("data")) || "";
        if (/^[A-Za-z]$/.test(dataVal.trim())) return dataVal.trim().toUpperCase();

        const dataOpt = (optionElement.getAttribute && optionElement.getAttribute("data-option")) || (numEl && numEl.getAttribute && numEl.getAttribute("data-option")) || "";
        if (/^[A-Za-z]$/.test(dataOpt.trim())) return dataOpt.trim().toUpperCase();

        const textMatch = (optionElement.textContent || "").trim().match(/^([A-Za-z])[.、:：\s]/);
        if (textMatch) return textMatch[1].toUpperCase();

        return "";
      });
      __publicField(this, "findMatchedOption", (options, answer) => {
        const rawAns = String(answer || "").trim()
          .replace(/^(?:第\s*\d+\s*[题空小题]\s*[:：]?\s*|[（\(]\s*\d+\s*[）\)]\s*[:：]?\s*|\d+\s*[.、:：\]]\s*)/, "")
          .trim();
        if (!rawAns) return null;
        const toRawVal = (v) => (typeof vue != "undefined" && vue.toRaw ? vue.toRaw(v) : v);
        const normalizedAnswer = this.normalizeOptionMatchText(rawAns);
        const pureLetterMatch = rawAns.match(/^(?:选项\s*)?([A-Za-z])[.、:：\s]*$/);
        const pureLetter = pureLetterMatch ? pureLetterMatch[1].toUpperCase() : null;
        const leadingLetterMatch = rawAns.match(/^(?:选项\s*)?([A-Za-z])[.、:：\s]/);
        const leadingLetter = leadingLetterMatch ? leadingLetterMatch[1].toUpperCase() : null;

        let bestElement = null;
        let bestScore = -1;

        for (const [optionText, rawOptionElement] of Object.entries(options || {})) {
          const optionElement = toRawVal(rawOptionElement);
          if (!optionElement) continue;

          let optLabel = this.getOptionLabel(optionElement);

          if (pureLetter && optLabel && pureLetter === optLabel) {
            return optionElement;
          }

          const normOpt = this.normalizeOptionMatchText(optionText);
          if (normOpt && normalizedAnswer && normOpt === normalizedAnswer) {
            return optionElement;
          }

          if (normOpt && normalizedAnswer && (normOpt.includes(normalizedAnswer) || normalizedAnswer.includes(normOpt))) {
            const score = 900 + Math.min(normOpt.length, normalizedAnswer.length);
            if (score > bestScore) {
              bestElement = optionElement;
              bestScore = score;
            }
            continue;
          }

          if (leadingLetter && optLabel && leadingLetter === optLabel) {
            const score = 850;
            if (score > bestScore) {
              bestElement = optionElement;
              bestScore = score;
            }
          }

          const score = this.calculateTextSimilarity(normOpt, normalizedAnswer);
          if (score > bestScore) {
            bestElement = optionElement;
            bestScore = score;
          }
        }

        if (!bestElement) return null;
        return (bestScore >= this.getAnswerSimilarityThreshold() || bestScore >= 800) ? bestElement : null;
      });
      __publicField(this, "inferQuestionTypeByStructure", (questionElement, optionElements, optionTexts) => {
        if (this.hasCheckboxControl(questionElement, optionElements))
          return "1";
        if (this.isJudgementQuestion(questionElement, optionElements, optionTexts))
          return "3";
        if (this.hasRadioControl(questionElement, optionElements))
          return "0";
        if (optionElements.length > 0)
          return "0";
        if (this.hasFillBlankControl(questionElement))
          return "2";
        if (this.hasLongTextControl(questionElement))
          return "4";
        return "8";
      });
      __publicField(this, "hasFillBlankControl", (questionElement) => {
        const textInputs = Array.from(questionElement.querySelectorAll("input")).filter((input) => {
          const type = (input.getAttribute("type") || "text").toLowerCase();
          return ["", "text", "search", "number", "tel", "url", "email"].includes(type) && !input.disabled && !input.hidden;
        });
        const textareas = questionElement.querySelectorAll("textarea");
        const editableElements = questionElement.querySelectorAll('[contenteditable="true"]');
        const inputLikeElements = questionElement.querySelectorAll('input, textarea, [contenteditable="true"]');
        const hasBlankCue = Array.from(inputLikeElements).some((element) => {
          const attrs = [
            element.getAttribute("class") || "",
            element.getAttribute("name") || "",
            element.getAttribute("placeholder") || ""
          ].join(" ").toLowerCase();
          return attrs.includes("blank") || attrs.includes("填空");
        });
        const hasTextCue = /(?:___+|[{（\\[][^）}\\]]*[）}\\]])/.test(questionElement.textContent || "") && /填|空|blank/i.test(questionElement.textContent || "");
        return textInputs.length > 0 || editableElements.length > 0 || textareas.length > 1 || hasBlankCue || textareas.length === 1 && hasTextCue;
      });
      __publicField(this, "hasLongTextControl", (questionElement) => {
        return questionElement.querySelectorAll("textarea").length > 0;
      });
      __publicField(this, "hasCheckboxControl", (questionElement, optionElements) => {
        if (questionElement.querySelector('input[type="checkbox"]'))
          return true;
        return optionElements.some((optionElement) => this.hasControlCue(optionElement, ["checkbox", "multi", "multiple"]));
      });
      __publicField(this, "isJudgementQuestion", (questionElement, optionElements, optionTexts) => {
        if (optionTexts.length !== 2)
          return false;
        const judgementValues = optionTexts.map((optionText) => this.normalizeJudgementText(optionText));
        return judgementValues.includes("true") && judgementValues.includes("false") && this.hasJudgementStructureCue(questionElement, optionElements);
      });
      __publicField(this, "hasJudgementStructureCue", (questionElement, optionElements) => {
        const cueText = [
          this.collectElementCueText(questionElement),
          ...optionElements.map((optionElement) => this.collectElementCueText(optionElement))
        ].join(" ").toLowerCase();
        const judgementCues = [
          "judge",
          "judgement",
          "judgment",
          "truefalse",
          "true-false",
          "true_false",
          "判断",
          "对错"
        ];
        if (judgementCues.some((cue) => cueText.includes(cue)))
          return true;
        const optionAriaLabels = optionElements.map((optionElement) => {
          var _a;
          return [
            optionElement.getAttribute("aria-label"),
            (_a = optionElement.querySelector("[aria-label]")) == null ? void 0 : _a.getAttribute("aria-label")
          ].filter(Boolean).join(" ");
        }).join(" ");
        return optionAriaLabels.includes("对选择") && optionAriaLabels.includes("错选择");
      });
      __publicField(this, "hasRadioControl", (questionElement, optionElements) => {
        if (questionElement.querySelector('input[type="radio"]'))
          return true;
        return optionElements.some((optionElement) => this.hasControlCue(optionElement, ["radio"]));
      });
      __publicField(this, "hasControlCue", (optionElement, cues) => {
        const cueText = this.collectElementCueText(optionElement).toLowerCase();
        return cues.some((cue) => cueText.includes(cue));
      });
      __publicField(this, "collectElementCueText", (element) => {
        const cueAttributes = [
          "aria-label",
          "class",
          "data",
          "data-qtype",
          "data-question-type",
          "data-type",
          "name",
          "role",
          "type",
          "value"
        ];
        const cueElements = [
          element,
          ...Array.from(element.querySelectorAll(
            cueAttributes.map((attribute) => `[${attribute}]`).join(",")
          ))
        ];
        return cueElements.flatMap((cueElement) => cueAttributes.map((attribute) => cueElement.getAttribute(attribute) || "")).filter(Boolean).join(" ");
      });
      __publicField(this, "getAnswerSimilarityThreshold", () => {
        const configStore = useConfigStore();
        const thresholdParam = configStore.otherParams.params.find((param) => param.name.includes("相似"));
        const threshold = Number((thresholdParam == null ? void 0 : thresholdParam.value) ?? 85);
        if (!Number.isFinite(threshold))
          return 85;
        return Math.min(100, Math.max(0, threshold));
      });
      __publicField(this, "normalizeOptionMatchText", (text) => {
        return this.clean(this.removeHtml(text)).replace(/<img\s+src=["']?([^"'>\s]+).*?>/gi, "$1").replace(/&[a-z]+;/gi, "").replace(/^[a-z]\s*[.．、：\]]\s*/i, "").replace(/[\s\u00a0]+/g, "").replace(/[,.，。、：；？！'""''「」【】《》（）()\[\]{}【】<>]/g, "").toLowerCase();
      });
      __publicField(this, "calculateTextSimilarity", (left, right) => {
        if (!left || !right)
          return 0;
        if (left === right)
          return 100;
        const leftChars = Array.from(left);
        const rightChars = Array.from(right);
        const distance = this.getLevenshteinDistance(leftChars, rightChars);
        const maxLength = Math.max(leftChars.length, rightChars.length);
        return Math.round((1 - distance / maxLength) * 100);
      });
      __publicField(this, "getLevenshteinDistance", (left, right) => {
        const distances = Array.from({ length: left.length + 1 }, (_, index) => index);
        right.forEach((rightChar, rightIndex) => {
          let previous = distances[0];
          distances[0] = rightIndex + 1;
          left.forEach((leftChar, leftIndex) => {
            const current = distances[leftIndex + 1];
            distances[leftIndex + 1] = leftChar === rightChar ? previous : Math.min(previous, distances[leftIndex], current) + 1;
            previous = current;
          });
        });
        return distances[left.length];
      });
      __publicField(this, "normalizeJudgementText", (optionText) => {
        const text = this.clean(optionText).replace(/[.．、：\s]/g, "").toLowerCase();
        if (/^(a)?(正确|是|对|√|t|true|right)$/.test(text))
          return "true";
        if (/^(b)?(错误|否|错|×|x|f|false|wrong)$/.test(text))
          return "false";
        return "";
      });
      const logStore = useLogStore();
      const questionStore = useQuestionStore();
      this.addLog = logStore.addLog;
      this.addQuestion = questionStore.addQuestion;
    }
  }
  class CxQuestionHandler extends BaseQuestionHandler {
    constructor(type, iframe) {
      super();
      __publicField(this, "type");
      __publicField(this, "init", async (isCurrent = () => true) => {
        var _a, _b;
        if (!isCurrent())
          return 0;
        this.questions = [];
        this.correctNum = 0;
        this.parseHtml();
        if (this.questions.length) {
          this.addLog(`成功解析到${this.questions.length}个题目`, "primary");
          for (const [index, parsedQuestion] of this.questions.entries()) {
            if (!isCurrent())
              return 0;
            const question = vue.reactive({ ...parsedQuestion, answerStatus: "searching" });
            this.addQuestion(question);
            const answerData = await getAnswer(question);
            if (!isCurrent())
              return 0;
            const values = getAnswerValues(answerData, question);
            if (values == null ? void 0 : values.length) {
              question.answer = values;
              question.answerStatus = "success";
              this.fillQuestion(question);
              this.addLog(`第${index + 1}道题搜索成功`, "success");
              if ((_a = answerData.meta) == null ? void 0 : _a.check_detail) {
                const logType = answerData.meta.check_status === "arbitrated" ? "warning" : "primary";
                this.addLog(answerData.meta.check_detail, logType);
              }
              this.addLog(`剩余次数:${String(((_a = answerData.meta) == null ? void 0 : _a.credit_remaining) ?? "未知")}`, "primary");
              this.correctNum += 1;
            } else {
              this.addLog(`第${index + 1}道题搜索失败，<a class="log-action-link" href="#" data-log-action="show-answer-tab">点击查看原因</a>`, "danger");
              question.answerStatus = "error";
              question.answer = [((_b = answerData.error) == null ? void 0 : _b.message) || "未查询到答案"];
            }
          }
        } else
          this.addLog("未解析到题目，请进入正确页面", "danger");
        return this.questions.length ? this.correctNum / this.questions.length * 100 : 0;
      });
      __publicField(this, "parseHtml", () => {
        if (!this._document)
          return [];
        if (["zj"].includes(this.type)) {
          const questionElements = this._document.querySelectorAll(".TiMu");
          this.addQuestions(questionElements);
        } else if (["zy", "ks"].includes(this.type)) {
          const questionElements = this._document.querySelectorAll(".questionLi");
          this.addQuestions(questionElements);
        }
      });
      __publicField(this, "safeClickOption", (rawOptionElement) => {
        const toRawVal = (v) => (typeof vue != "undefined" && vue.toRaw ? vue.toRaw(v) : v);
        const optionElement = toRawVal(rawOptionElement);
        if (!optionElement) return;

        const radio = (optionElement.matches && optionElement.matches("input[type='radio'], input[type='checkbox']"))
          ? optionElement
          : (optionElement.querySelector ? optionElement.querySelector("input[type='radio'], input[type='checkbox']") : null);

        // If already checked, return to avoid unchecking or duplicate toggles
        if (radio && radio.checked) return;
        if (optionElement.getAttribute && optionElement.getAttribute("aria-checked") === "true") return;
        if ((optionElement.querySelector && (optionElement.querySelector(".check_answer") || optionElement.querySelector(".check_answer_dx"))) || (optionElement.classList && optionElement.classList.contains("check_answer"))) return;

        const clickable = (optionElement.querySelector && optionElement.querySelector(".answerBg, a.Cy_circle, span.Cy_circle, label, .num_option, [class*='num_option'], [class*='circle']"))
          || radio
          || optionElement;

        try {
          clickable.click();
        } catch (e) {}

        const isSelectedNow = () => {
          if (radio && radio.checked) return true;
          if (optionElement.getAttribute && optionElement.getAttribute("aria-checked") === "true") return true;
          if (optionElement.classList && (optionElement.classList.contains("check_answer") || optionElement.classList.contains("check_answer_dx") || optionElement.classList.contains("active") || optionElement.classList.contains("cur"))) return true;
          if (optionElement.querySelector && optionElement.querySelector(".check_answer, .check_answer_dx, .active, .cur")) return true;
          return false;
        };

        if (!isSelectedNow() && optionElement && optionElement !== clickable) {
          try {
            optionElement.click();
          } catch (e) {}
        }

        if (radio) {
          if (!radio.checked) {
            try {
              radio.click();
            } catch (e) {}
          }
          try {
            radio.dispatchEvent(new Event("change", { bubbles: true }));
          } catch (e) {}
        }
      });
      __publicField(this, "queryOptionElements", (container) => {
        if (!container) return [];
        // 1. 经典 .answerBg 选项容器
        let elements = Array.from(container.querySelectorAll(".answerBg"));
        if (elements.length > 0) return elements;

        // 2. 现代与新版作业/考试：定位选项字母指示符（.num_option, .Cy_circle, [data-option] 等）
        // 向上寻找所属行容器（div.clearfix, div[class*='item'], div[class*='option'], li, label 等）
        const optionIndicators = Array.from(container.querySelectorAll(
          ".num_option, .num_option_dx, .num_option_span, .Cy_circle, a.Cy_circle, span.Cy_circle, i.Cy_circle, [class*='num_option'], [data-option], .num_box"
        )).filter((el) => {
          const text = (el.textContent || "").trim();
          const dataOpt = el.getAttribute("data-option") || el.getAttribute("data") || "";
          return /^[A-Za-z]$/.test(text) || /^[A-Za-z]$/.test(dataOpt.trim()) || el.classList.contains("num_option") || el.classList.contains("Cy_circle");
        });
        if (optionIndicators.length > 0) {
          const seen = new Set();
          const rows = [];
          for (const ind of optionIndicators) {
            const row = ind.closest("li, label, div.clearfix, div[class*='item'], div[class*='option'], div[class*='choice'], div[class*='answer'], p") || ind.parentElement || ind;
            if (row && !seen.has(row) && row !== container) {
              seen.add(row);
              rows.push(row);
            }
          }
          if (rows.length > 0) return rows;
        }

        // 3. 常见列表选择项（ul/ol 下的 li）
        elements = Array.from(container.querySelectorAll(
          "ul.Cy_ulTop li, ul.Zy_ulTop li, ul.Zy_ulTk li, ul.stem_answer li, ul.answerList li, ul.reading_answer_box li, .reading_item, [role='radio'], [role='checkbox']"
        ));
        if (elements.length > 0) return elements;

        const lis = Array.from(container.querySelectorAll("ul li, ol li")).filter((li) => {
          return li.querySelector("input[type='radio'], input[type='checkbox'], .answer_p, .after, .num_option, .Cy_circle, [data-option]");
        });
        if (lis.length > 0) return lis;

        // 4. label 容器
        const labels = Array.from(container.querySelectorAll("label")).filter((label) => {
          return label.querySelector("input[type='radio'], input[type='checkbox']") || label.getAttribute("for");
        });
        if (labels.length > 0) return labels;

        // 5. 原生单选/多选 input
        const inputs = Array.from(container.querySelectorAll("input[type='radio'], input[type='checkbox']"));
        if (inputs.length > 0) return inputs;

        // 6. 首字符带 A/B/C/D 选项前缀的 div/p
        const textOptionBlocks = Array.from(container.querySelectorAll("div, p")).filter((el) => {
          if (el.children.length > 3) return false;
          const txt = (el.textContent || "").trim();
          return /^[A-Za-z][.、:：\s]/.test(txt);
        });
        if (textOptionBlocks.length > 0) return textOptionBlocks;

        return [];
      });
      __publicField(this, "fillQuestion", (question) => {
        var _a, _b;
        if (!this._window || !question)
          return;
        if (!question.answer || !question.answer.length)
          return;

        const toRawVal = (v) => (typeof vue != "undefined" && vue.toRaw ? vue.toRaw(v) : v);
        const rawQuestion = toRawVal(question);
        const questionElement = toRawVal(rawQuestion.element);
        const questionOptions = toRawVal(rawQuestion.options) || {};
        const subOptionGroups = toRawVal(rawQuestion.subOptionGroups) || [];

        // 1. 复合小题选择（听力复合题、阅读理解多小题）
        if (subOptionGroups.length > 1 && rawQuestion.answer.length >= 1) {
          if (rawQuestion.answer.length < subOptionGroups.length) {
            this.addLog(`[复合题警告] 页面共 ${subOptionGroups.length} 道小题，但模型只返回了 ${rawQuestion.answer.length} 个答案，可能有小题未作答`, "warning");
          }
          rawQuestion.answer.forEach((subAns, index) => {
            if (index >= subOptionGroups.length) return; // 严禁越界匹配，防止多余输出干扰前面的小题！
            const subOpts = subOptionGroups[index];
            let optionElement = subOpts ? this.findMatchedOption(subOpts, String(subAns)) : null;
            if (optionElement) {
              this.safeClickOption(optionElement);
            } else {
              this.addLog(`[复合题警告] 第 ${index + 1} 小题答案「${String(subAns)}」未能匹配到页面选项，已跳过勾选`, "warning");
            }
          });
        } else if (["0", "1", "8"].includes(rawQuestion.type) || (questionOptions && Object.keys(questionOptions).length > 0)) {
          // 2. 常规单选、多选
          rawQuestion.answer.forEach((answer) => {
            let optionElement = this.findMatchedOption(questionOptions, String(answer));
            if (!optionElement && questionElement) {
              const allOpts = this.queryOptionElements(questionElement);
              if (allOpts.length > 0) {
                const [tempOpts] = this.extractOptions(allOpts, ".answer_p");
                optionElement = this.findMatchedOption(tempOpts, String(answer));
              }
            }
            if (optionElement) {
              this.safeClickOption(optionElement);
            }
          });
        } else if (rawQuestion.type === "2") {
          const textareaElements = questionElement ? questionElement.querySelectorAll("textarea") : [];
          if (textareaElements.length > 0) {
            textareaElements.forEach((textareaElement, index) => {
              try {
                const ueditor = this._window.UE.getEditor(textareaElement.name);
                ueditor.setContent(String(rawQuestion.answer[index] ?? ""));
              } catch (e) {
                textareaElement.value = String(rawQuestion.answer[index] ?? "");
                textareaElement.dispatchEvent(new Event("input", { bubbles: true }));
                textareaElement.dispatchEvent(new Event("change", { bubbles: true }));
              }
            });
          }
          if (questionElement) {
            const textInputs = Array.from(questionElement.querySelectorAll("input")).filter((input) => {
              const type = (input.getAttribute("type") || "text").toLowerCase();
              return ["", "text", "search"].includes(type) && !input.disabled && !input.hidden;
            });
            textInputs.forEach((inputElement, index) => {
              if (rawQuestion.answer[index] !== undefined) {
                inputElement.value = String(rawQuestion.answer[index] ?? "");
                inputElement.dispatchEvent(new Event("input", { bubbles: true }));
                inputElement.dispatchEvent(new Event("change", { bubbles: true }));
              }
            });
          }
        } else if (rawQuestion.type === "3") {
          let answer = "true";
          if (String(rawQuestion.answer[0]).match(/(^|,)(正确|是|对|√|T|ri|right|true)(,|$)/i)) {
            answer = "true";
          } else if (String(rawQuestion.answer[0]).match(/(^|,)(错误|否|错|×|F|wr|wrong|false)(,|$)/i)) {
            answer = "false";
          }
          const trueOrFalse = {
            "true": "对",
            "false": "错"
          };
          for (const key in questionOptions) {
            const optEl = toRawVal(questionOptions[key]);
            if (!optEl) continue;
            if (["zj", "zy"].includes(this.type)) {
              if ((_a = optEl.getAttribute("aria-label")) == null ? void 0 : _a.includes(`${trueOrFalse[answer]}选择`)) {
                if (optEl.getAttribute("aria-checked") === "true")
                  return;
                optEl.click();
              }
            } else if (["ks"].includes(this.type)) {
              const span = optEl.querySelector(`span[data='${answer}']`);
              if (span == null ? void 0 : span.querySelector(".check_answer"))
                return;
              span == null ? void 0 : span.click();
            }
          }
        } else if (rawQuestion.type === "4" || rawQuestion.type === "6") {
          const textareaElement = questionElement ? questionElement.querySelector("textarea") : null;
          if (!textareaElement)
            return;
          try {
            const ueditor = this._window.UE.getEditor(textareaElement.name);
            ueditor.setContent(String(rawQuestion.answer[0] ?? ""));
          } catch (e) {
            textareaElement.value = String(rawQuestion.answer[0] ?? "");
          }
        }

        if (questionElement && rawQuestion.type === "8") {
          const textInputs = Array.from(questionElement.querySelectorAll("input")).filter((input) => {
            const type = (input.getAttribute("type") || "text").toLowerCase();
            return ["", "text", "search"].includes(type) && !input.disabled && !input.hidden;
          });
          if (textInputs.length > 0) {
            textInputs.forEach((inputElement, index) => {
              if (rawQuestion.answer[index] !== undefined) {
                inputElement.value = String(rawQuestion.answer[index] ?? "");
                inputElement.dispatchEvent(new Event("input", { bubbles: true }));
                inputElement.dispatchEvent(new Event("change", { bubbles: true }));
              }
            });
          }
        }
      });
      this.type = type;
      if (iframe) {
        this._document = iframe.contentDocument;
        this._window = iframe.contentWindow;
      }
    }
    extractOptions(optionElements, optionSelector) {
      const toRawVal = (v) => (typeof vue != "undefined" && vue.toRaw ? vue.toRaw(v) : v);
      const optionsObject = {};
      const optionTexts = [];
      (optionElements || []).forEach((rawOptionElement) => {
        const optionElement = toRawVal(rawOptionElement);
        if (!optionElement) return;

        let textEl = optionElement.querySelector ? optionElement.querySelector(optionSelector) : null;
        if (!textEl && optionElement.querySelector) {
          textEl = optionElement.querySelector(".answer_p, .fl.after, .after, .reading_opt, .option_text, .Cy_ulTop_p, .Zy_ulTop_p, .stem_answer_p, label, p, [class*='opt']");
        }
        let optionTextContent = "";
        if (textEl) {
          optionTextContent = this.removeHtml(textEl.innerHTML || textEl.textContent || "").trim();
        } else if (optionElement.tagName === "INPUT") {
          const container = optionElement.closest("li, label, div, p") || optionElement.parentElement;
          if (container) {
            const containerTextEl = container.querySelector(".answer_p, .fl.after, .after, .reading_opt, .option_text, .Cy_ulTop_p, .Zy_ulTop_p, .stem_answer_p, label, p, [class*='opt']");
            if (containerTextEl) {
              optionTextContent = this.removeHtml(containerTextEl.innerHTML || containerTextEl.textContent || "").trim();
            } else {
              const clone = container.cloneNode(true);
              clone.querySelectorAll(".num_option, .num_option_dx, .Cy_circle, input, script, style").forEach((el) => el.remove());
              optionTextContent = this.removeHtml(clone.innerHTML || clone.textContent || "").trim();
            }
          }
        } else if (optionElement.cloneNode) {
          const clone = optionElement.cloneNode(true);
          clone.querySelectorAll(".num_option, .num_option_dx, .Cy_circle, input, script, style").forEach((el) => el.remove());
          optionTextContent = this.removeHtml(clone.innerHTML || clone.textContent || "").trim();
        }

        if (optionTextContent) {
          optionsObject[optionTextContent] = optionElement;
          optionTexts.push(optionTextContent);
        }

        const optLabel = this.getOptionLabel ? this.getOptionLabel(optionElement) : "";
        if (optLabel && !optionsObject[optLabel]) {
          optionsObject[optLabel] = optionElement;
        }
      });
      return [optionsObject, optionTexts];
    }
    addQuestions(questionElements) {
      questionElements.forEach((questionElement) => {
        var _a, _b, _c;
        let questionTitle = "";
        let optionElements = [];
        let optionsObject = {};
        let optionTexts = [];
        let searchStem = "";
        let searchOptions = [];
        let questionKind;
        if (["zy", "ks"].includes(this.type)) {
          const h3Elements = Array.from(questionElement.querySelectorAll("h3"));
          let rawStemParts = [];
          if (h3Elements.length > 0) {
            h3Elements.forEach((h3) => {
              const clone = h3.cloneNode(true);
              clone.querySelectorAll(".colorShallow").forEach((cs) => cs.remove());
              const txt = extractRawTextFromElement(clone).trim();
              if (txt)
                rawStemParts.push(txt);
            });
          }
          try {
            const cloneQ = questionElement.cloneNode(true);
            cloneQ.querySelectorAll("h3, .answerBg, textarea, script, style, .save_answer, input").forEach((el) => el.remove());
            const extraText = extractRawTextFromElement(cloneQ).trim();
            if (extraText) {
              rawStemParts.push(extraText);
            }
          } catch (e) {
            console.error("提取题目附加信息异常", e);
          }
          const combinedStem = rawStemParts.length > 0 ? rawStemParts.join("\n\n").trim() : extractRawTextFromElement(questionElement).trim();
          searchStem = stripQuestionTypeLabel(combinedStem);
          questionTitle = this.clean(searchStem);

          const textareas = questionElement.querySelectorAll("textarea");
          const numBoxes = Array.from(questionElement.querySelectorAll(".num_box")).map((el) => extractRawTextFromElement(el).trim()).filter(Boolean);
          const blankCount = Math.max(textareas.length, numBoxes.length);
          if (blankCount > 1) {
            const blankDesc = numBoxes.length > 0 ? numBoxes.join("、") : `第1空至第${blankCount}空`;
            searchStem += `\n\n【填空位约束：本题页面共有 ${blankCount} 个待填空输入框（${blankDesc}）。请务必在 values 数组中按空位顺序依次输出全部 ${blankCount} 个空的最终答案，严禁少填、漏填或合并！】`;
          }

          let matchedOptionElements = this.queryOptionElements(questionElement);
          optionElements = Array.from(matchedOptionElements);
          [optionsObject, optionTexts] = this.extractOptions(matchedOptionElements, ".answer_p");
          searchOptions = Array.from(matchedOptionElements).map((optionElement) => {
            const p = optionElement.querySelector ? (optionElement.querySelector(".answer_p") || optionElement) : optionElement;
            return stripOptionLabel(extractRawTextFromElement(p));
          });
        } else if (["zj"].includes(this.type)) {
          const titleSource = ((_c = questionElement.querySelector(".fontLabel")) == null ? void 0 : _c.innerHTML) || "";
          questionTitle = this.removeHtml(titleSource);
          searchStem = stripQuestionTypeLabel(
            extractRawTextFromHtml(titleSource, this._document)
          );
          const textareas = questionElement.querySelectorAll("textarea");
          if (textareas.length > 1) {
            searchStem += `\n\n【填空位约束：本题页面共有 ${textareas.length} 个待填空输入框。请务必在 values 数组中按空位顺序依次输出全部 ${textareas.length} 个空的最终答案，严禁少填、漏填或合并！】`;
          }
          let matchedOptionElements = questionElement.querySelectorAll('[class*="before-after"]');
          if (matchedOptionElements.length === 0) {
            matchedOptionElements = this.queryOptionElements(questionElement);
          }
          optionElements = Array.from(matchedOptionElements);
          [optionsObject, optionTexts] = this.extractOptions(matchedOptionElements, ".fl.after");
          searchOptions = Array.from(matchedOptionElements).map((optionElement) => {
            const p = optionElement.querySelector ? (optionElement.querySelector(".fl.after") || optionElement) : optionElement;
            return stripOptionLabel(extractRawTextFromElement(p));
          });
        }
        questionKind = this.inferQuestionTypeByStructure(questionElement, optionElements, optionTexts);
        if (questionKind === "3") {
          searchOptions = optionElements.map((optionElement, index) => extractJudgementToken(optionElement, searchOptions[index] || optionTexts[index]) || searchOptions[index]);
        }

        // 复合题型识别（听力题/阅读理解大题，内含多道选择小题）：
        // 1. 先统计选项中 "A" 出现的次数作为基准小题数参考（非常客观可靠）
        const optionLetters = optionElements.map((opt) => (this.getOptionLabel ? this.getOptionLabel(opt) : "") || "");
        const aIndices = [];
        optionLetters.forEach((lbl, idx) => {
          if (lbl === "A") aIndices.push(idx);
        });

        // 2. 提取小题编号标题元素（如 (1)、(2)、(3) 或 1.、2.、3. 等）
        let headingElements = Array.from(questionElement.querySelectorAll(
          ".reader_answer_tit, .sub_question_title, .subQuestionTit, [class*='sub_title'], [class*='subQuestion'], [class*='tit'], p, div, span, b, strong, h4, h5"
        )).filter((el) => {
          if (el.children.length > 3) return false;
          if (el.closest(".answerBg, .num_option, .Cy_circle, [data-option]")) return false;
          const text = (el.textContent || "").trim();
          return /^[（\(]\s*\d+\s*[）\)]/.test(text) || /^\d+[\.、]\s*[（\(]?(单选题|多选题|判断题)/.test(text);
        });

        // 关键防护 A：剔除包含其它候选节点的父节点，只保留最深层标题节点，防止父div与子p双重计数
        headingElements = headingElements.filter((el) => !headingElements.some((other) => other !== el && el.contains(other)));

        // 关键防护 B：按提取出的题号数字（如 (1), (2), (3) 或 1. 等）严格去重，每道小题只保留一个唯一标题节点
        const seenSubNums = new Set();
        headingElements = headingElements.filter((el) => {
          const text = (el.textContent || "").trim();
          const m = text.match(/^[（\(]\s*(\d+)\s*[）\)]/) || text.match(/^(\d+)[\.、]/);
          if (!m) return false;
          const num = m[1];
          if (seenSubNums.has(num)) return false;
          seenSubNums.add(num);
          return true;
        });

        // 关键防护 C：按文档流顺序正序排序
        headingElements.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));

        // 3. 计算实际小题总数 subCount
        let subCount = 0;
        if (headingElements.length > 1) {
          subCount = headingElements.length;
        } else if (aIndices.length > 1) {
          subCount = aIndices.length;
        } else {
          const subBoxes = Array.from(questionElement.querySelectorAll(".subQuestion, .reading_item_box"));
          if (subBoxes.length > 1) {
            subCount = subBoxes.length;
          }
          const uls = Array.from(questionElement.querySelectorAll("ul.Cy_ulTop, ul.Zy_ulTop, ul.Zy_ulTk, ul.stem_answer, ul.answerList, ul.reading_answer_box"));
          if (uls.length > 1) {
            subCount = Math.max(subCount, uls.length);
          }
          const radios = Array.from(questionElement.querySelectorAll("input[type='radio']"));
          const radioNameSet = new Set(radios.map((r) => r.name || r.getAttribute("name")).filter(Boolean));
          if (radioNameSet.size > 1) {
            subCount = Math.max(subCount, radioNameSet.size);
          }
        }

        // 严防虚增：若已识别到 A 选项次数，subCount 绝对不能超过 A 选项数量
        if (aIndices.length > 1 && subCount > aIndices.length) {
          subCount = aIndices.length;
        }

        let subOptionGroups = [];
        let subOptionTextGroups = [];
        if (subCount > 1) {
          // 优先级 1. DOM 范围分区法：根据去重后的小题标题顺序划分后续选项
          if (headingElements.length > 1 && optionElements.length >= headingElements.length) {
            const buckets = Array.from({ length: headingElements.length }, () => []);
            optionElements.forEach((opt) => {
              let targetIdx = -1;
              for (let h = headingElements.length - 1; h >= 0; h--) {
                const head = headingElements[h];
                if (head === opt || (head.compareDocumentPosition(opt) & Node.DOCUMENT_POSITION_FOLLOWING)) {
                  targetIdx = h;
                  break;
                }
              }
              if (targetIdx >= 0) {
                buckets[targetIdx].push(opt);
              }
            });
            const validBuckets = buckets.filter((b) => b.length > 0);
            if (validBuckets.length === headingElements.length) {
              validBuckets.forEach((group) => {
                const [optsObj, optsTexts] = this.extractOptions(group, ".answer_p");
                subOptionGroups.push(optsObj);
                subOptionTextGroups.push(optsTexts);
              });
            }
          }

          // 优先级 2. 选项 "A" 边界切分法：遇到新的 "A" 选项即作为下一道小题的起始边界
          if (subOptionGroups.length === 0 && aIndices.length > 1) {
            for (let i = 0; i < aIndices.length; i++) {
              const start = aIndices[i];
              const end = i < aIndices.length - 1 ? aIndices[i + 1] : optionElements.length;
              const chunk = optionElements.slice(start, end);
              if (chunk.length > 0) {
                const [optsObj, optsTexts] = this.extractOptions(chunk, ".answer_p");
                subOptionGroups.push(optsObj);
                subOptionTextGroups.push(optsTexts);
              }
            }
          }

          // 优先级 3. 按单选框 name 分组
          if (subOptionGroups.length === 0) {
            const radios = Array.from(questionElement.querySelectorAll("input[type='radio']"));
            const radioGroupMap = new Map();
            radios.forEach((r) => {
              const name = r.name || r.getAttribute("name") || "";
              if (!radioGroupMap.has(name)) radioGroupMap.set(name, []);
              radioGroupMap.get(name).push(r);
            });
            if (radioGroupMap.size > 1) {
              for (const [name, groupRadios] of radioGroupMap.entries()) {
                const groupOpts = groupRadios.map((r) => r.closest("li, label, .answerBg") || r.parentElement || r);
                const [optsObj, optsTexts] = this.extractOptions(groupOpts, ".answer_p");
                subOptionGroups.push(optsObj);
                subOptionTextGroups.push(optsTexts);
              }
            }
          }

          // 优先级 4. 按小题容器分组
          if (subOptionGroups.length === 0) {
            const subBoxes = Array.from(questionElement.querySelectorAll(".subQuestion, .reading_item_box"));
            if (subBoxes.length > 1) {
              for (const box of subBoxes) {
                const boxOpts = this.queryOptionElements(box);
                if (boxOpts.length > 0) {
                  const [optsObj, optsTexts] = this.extractOptions(boxOpts, ".answer_p");
                  subOptionGroups.push(optsObj);
                  subOptionTextGroups.push(optsTexts);
                }
              }
            }
          }

          // 优先级 5. 按 ul 选项列表分组
          if (subOptionGroups.length === 0) {
            const uls = Array.from(questionElement.querySelectorAll("ul.Cy_ulTop, ul.Zy_ulTop, ul.Zy_ulTk, ul.stem_answer, ul.answerList, ul.reading_answer_box"));
            if (uls.length > 1) {
              for (const ul of uls) {
                const ulOpts = this.queryOptionElements(ul);
                if (ulOpts.length > 0) {
                  const [optsObj, optsTexts] = this.extractOptions(ulOpts, ".answer_p");
                  subOptionGroups.push(optsObj);
                  subOptionTextGroups.push(optsTexts);
                }
              }
            }
          }

          // 优先级 6. 回退方案：按小题数量等额切分
          if (subOptionGroups.length === 0 && optionElements.length >= subCount) {
            const chunkSize = Math.max(1, Math.floor(optionElements.length / subCount));
            for (let i = 0; i < subCount; i++) {
              const start = i * chunkSize;
              const end = i === subCount - 1 ? optionElements.length : (i + 1) * chunkSize;
              const chunk = optionElements.slice(start, end);
              const [optsObj, optsTexts] = this.extractOptions(chunk, ".answer_p");
              subOptionGroups.push(optsObj);
              subOptionTextGroups.push(optsTexts);
            }
          }
        }

        // 关键对齐：以物理切分成功的选项组数量为最终准绳，保证约束提示词与选项分组绝对一致！
        if (subOptionGroups.length > 1) {
          subCount = subOptionGroups.length;
        }

        if (subCount > 1) {
          questionKind = "8";
          if (["zj"].includes(this.type)) {
            try {
              const cloneZj = questionElement.cloneNode(true);
              cloneZj.querySelectorAll(".fontLabel, [class*='before-after'], .answerBg, .fl.after, textarea, script, style, .save_answer, input, ul.Cy_ulTop, ul.Zy_ulTop, ul.Zy_ulTk, ul.stem_answer, ul.answerList, ul.reading_answer_box").forEach((el) => el.remove());
              const zjExtra = extractRawTextFromElement(cloneZj).trim();
              if (zjExtra && !searchStem.includes(zjExtra)) {
                searchStem = searchStem ? `${searchStem}\n\n${zjExtra}` : zjExtra;
              }
            } catch (e) {}
          }
          const alignedHeadings = headingElements.length === subOptionTextGroups.length ? headingElements : [];
          const subOptionBlocks = subOptionTextGroups.map((texts, idx) => {
            if (!texts || !texts.length) return "";
            const headingTxt = alignedHeadings[idx] ? extractRawTextFromElement(alignedHeadings[idx]).trim() : "";
            const headPrefix = headingTxt && !searchStem.includes(headingTxt) ? `${headingTxt}\n` : "";
            const optLines = texts.map((optTxt, optIdx) => `${String.fromCharCode(65 + optIdx)}. ${optTxt}`).join("\n");
            return `${headPrefix}第 ${idx + 1} 小题选项：\n${optLines}`;
          }).filter(Boolean);
          if (subOptionBlocks.length > 0) {
            searchStem += `\n\n【各小题选项明细（请严格依据以上题干、材料及每题选项作答）】\n${subOptionBlocks.join("\n\n")}`;
          }
          searchStem += `\n\n【复合小题约束：本大题页面共有 ${subCount} 道选择/匹配小题。请务必在 values 数组中按小题顺序（第1题至第${subCount}题）依次输出全部 ${subCount} 道小题的最终答案，严禁少填、漏填或合并！】`;
          // 复合题不向服务端传递扁平化选项，避免混淆为一道多选项单选题
          searchOptions = [];
          optionTexts = [];
        }

        const markRawVal = (v) => (typeof vue != "undefined" && vue.markRaw ? vue.markRaw(v) : v);
        this.questions.push({
          element: markRawVal(questionElement),
          type: questionKind,
          title: this.clean(questionTitle),
          optionsText: optionTexts,
          options: markRawVal(optionsObject),
          subOptionGroups: markRawVal(subOptionGroups),
          searchText: { stem: searchStem, options: searchOptions },
          answer: [],
          workType: this.type,
          refer: this._window.location.href
        });
      });
    }
  }
  const useCxChapterLogic = () => {
    const logStore = useLogStore();
    const questionStore = useQuestionStore();
    const init = () => {
      const currentUrl = window.location.href;
      if (!currentUrl.includes("&mooc2=1")) {
        window.location.href = currentUrl + "&mooc2=1";
      }
      questionStore.clearQuestion();
      logStore.addLog(`检测到用户进入到章节学习页面`, "primary");
      logStore.addLog(`正在解析任务点，请稍等5-10秒（如果长时间没有反应，请刷新页面）`, "warning");
    };
    const configStore = useConfigStore();
    const HOME_TAB_NAME = "0";
    const ANSWER_TAB_NAME2 = "1";
    const PDF_COMPLETION_WAIT_SECONDS = 5;
    let runningIframeDocumentTasks = /* @__PURE__ */ new WeakMap();
    let processedIframeDocuments = /* @__PURE__ */ new WeakSet();
    let currentPage;
    let currentTabIdx = 0;
    let chapterController = new AbortController();
    let currentWatchIframeTaskId = 0;
    let disposed = false;
    const isFinishedTask = (iframe) => {
      var _a, _b;
      let element = iframe;
      while (element) {
        const className = typeof element.className === "string" ? element.className : "";
        if (className.split(/\s+/).includes("ans-job-finished") || ((_a = element.classList) == null ? void 0 : _a.contains("ans-job-finished")))
          return true;
        const jobIcon = typeof element.querySelector === "function" ? element.querySelector(".ans-job-icon") : null;
        if (jobIcon) {
          const iconClass = typeof jobIcon.className === "string" ? jobIcon.className : "";
          if (iconClass.split(/\s+/).includes("ans-job-finished") || ((_b = jobIcon.classList) == null ? void 0 : _b.contains("ans-job-finished")))
            return true;
        }
        element = element.parentElement;
      }
      return false;
    };
    const switchNextTab = (chapterDoc) => {
      const docs = [chapterDoc, document];
      for (const d of docs) {
        if (!d) continue;
        const prevUlLis = Array.from(d.querySelectorAll(".prev_ul > li, .prev_ul li"));
        if (prevUlLis.length > 1) {
          let activeIdx = prevUlLis.findIndex((li) =>
            li.classList.contains("active") || li.classList.contains("currents") || li.classList.contains("cur") || (li.querySelector && li.querySelector(".active, .currents, .cur"))
          );
          if (activeIdx < currentTabIdx) {
            activeIdx = currentTabIdx;
          }
          const nextIdx = activeIdx + 1;
          if (nextIdx < prevUlLis.length) {
            currentTabIdx = nextIdx;
            prevUlLis[nextIdx].click();
            return true;
          }
        }
        const tabContainer = d.querySelector(".tabtags");
        if (tabContainer) {
          const items = Array.from(tabContainer.querySelectorAll("span, a"));
          if (items.length > 1) {
            let activeIdx = items.findIndex((it) =>
              it.classList.contains("currents") || it.classList.contains("active") || it.classList.contains("cur")
            );
            if (activeIdx < currentTabIdx) {
              activeIdx = currentTabIdx;
            }
            const nextIdx = activeIdx + 1;
            if (nextIdx < items.length) {
              currentTabIdx = nextIdx;
              items[nextIdx].click();
              return true;
            }
          }
        }
        const tabLis = Array.from(d.querySelectorAll(".tabs > li, ul.tab-title > li"));
        if (tabLis.length > 1) {
          let activeIdx = tabLis.findIndex((li) =>
            li.classList.contains("active") || li.classList.contains("currents") || (li.querySelector && li.querySelector(".active, .currents"))
          );
          if (activeIdx < currentTabIdx) {
            activeIdx = currentTabIdx;
          }
          const nextIdx = activeIdx + 1;
          if (nextIdx < tabLis.length) {
            currentTabIdx = nextIdx;
            tabLis[nextIdx].click();
            return true;
          }
        }
      }
      return false;
    };
    const getChapterPage = () => {
      const iframe = document.documentElement.querySelector("iframe");
      return {
        url: window.location.href,
        iframe,
        src: (iframe == null ? void 0 : iframe.src) || "",
        document: (iframe == null ? void 0 : iframe.contentDocument) || null
      };
    };
    const isSamePage = (left, right) => left.url === right.url && left.iframe === right.iframe && left.src === right.src && left.document === right.document;
    const onRootIframeLoad = () => processIframeTask(true);
    const processIframeTask = (force = false) => {
      var _a, _b;
      if (disposed)
        return;
      const page = getChapterPage();
      const changed = !currentPage || !isSamePage(currentPage, page);
      if (!changed && !force)
        return;
      if (changed || force) {
        if (changed) currentTabIdx = 0;
        (_a = currentPage == null ? void 0 : currentPage.iframe) == null ? void 0 : _a.removeEventListener("load", onRootIframeLoad);
        chapterController.abort();
        chapterController = new AbortController();
        ++currentWatchIframeTaskId;
        runningIframeDocumentTasks = /* @__PURE__ */ new WeakMap();
        processedIframeDocuments = /* @__PURE__ */ new WeakSet();
        questionStore.clearQuestion();
        configStore.menuIndex = HOME_TAB_NAME;
        currentPage = page;
        (_b = page.iframe) == null ? void 0 : _b.addEventListener("load", onRootIframeLoad);
      }
      if (!page.iframe || !page.document || page.document.readyState !== "complete" || page.document.URL === "about:blank")
        return;
      const signal = chapterController.signal;
      watchIframe(document.documentElement, {
        signal,
        // 直接检查页面，避免在轮询发现切换之前，旧请求已返回。
        isCurrent: () => !signal.aborted && isSamePage(page, getChapterPage())
      });
    };
    const watchIframe = (documentElement, context) => {
      const thisTaskId = ++currentWatchIframeTaskId;
      IframeUtils.getAllNestedIframes(documentElement).subscribe(async (allIframes) => {
        if (allIframes.length === 0) {
          await sleep(1.5);
          if (thisTaskId !== currentWatchIframeTaskId || !context.isCurrent())
            return;
        }
        rxjs.from(allIframes).pipe(concatMap((iframe) => {
          if (thisTaskId !== currentWatchIframeTaskId || !context.isCurrent())
            return Promise.resolve();
          return processIframe(iframe, context);
        })).subscribe({
          complete: async () => {
            var _a, _b;
            if (thisTaskId === currentWatchIframeTaskId && context.isCurrent()) {
              const switched = switchNextTab((_a = currentPage == null ? void 0 : currentPage.document) != null ? _a : documentElement);
              if (switched) {
                logStore.addLog("当前卡片任务完成，切换至本小节下一个任务点", "primary");
                await sleep(2);
                if (thisTaskId === currentWatchIframeTaskId && context.isCurrent()) {
                  processIframeTask(true);
                }
                return;
              }
              logStore.addLog(`本页任务点已全部完成，正前往下一章节`, "success");
              if (configStore.platformParams.cx.parts[0].params[1].value) {
                const nextBtn = documentElement.querySelector("#prevNextFocusNext") || document.querySelector("#prevNextFocusNext") || document.querySelector(".nextChapter");
                if (!nextBtn || (nextBtn.style && nextBtn.style.display === "none")) {
                  logStore.addLog(`已经到达最后一章节，无法跳转`, "danger");
                } else {
                  await sleep(configStore.otherParams.params[0].value);
                  if (thisTaskId !== currentWatchIframeTaskId || !context.isCurrent())
                    return;
                  const clickTarget = document.querySelector(".jb_btn.jb_btn_92.fr.fs14.nextChapter") || document.querySelector(".nextChapter") || nextBtn;
                  clickTarget == null ? void 0 : clickTarget.click();
                }
              } else {
                logStore.addLog(`已经关闭自动下一章节，在设置里可更改`, "danger");
              }
            }
          },
          error: (error) => {
            if (context.isCurrent()) {
              logStore.addLog(`任务处理失败：${String(error)}`, "danger");
            }
          }
        });
      });
    };
    const processMedia = async (mediaType, iframe, iframeDocument, context) => {
      return new Promise((resolve, reject) => {
        logStore.addLog(`发现一个${mediaType}，正在解析`, "warning");
        logStore.addLog(`正在尝试播放${mediaType}，请稍等5s`, "primary");
        let isExecuted = false;
        let settled = false;
        let mediaElement = null;
        let quiz;
        // 播放器被页面脚本暂停或浏览器拦截自动播放时不能直接判失败：
        // 前者重试几次，后者提示用户手动点播放，播放恢复后继续。
        const MAX_PLAY_RETRIES = 3;
        let playPending = false;
        let playInterruptions = 0;
        let waitingForManualPlay = false;
        let playbackLogged = false;
        let resumeTimer;
        const clearResumeTimer = () => {
          if (resumeTimer !== void 0)
            clearTimeout(resumeTimer);
          resumeTimer = void 0;
        };
        const cleanup = () => {
          clearInterval(intervalId2);
          clearResumeTimer();
          quiz == null ? void 0 : quiz.dispose();
          mediaElement == null ? void 0 : mediaElement.removeEventListener("pause", resume);
          mediaElement == null ? void 0 : mediaElement.removeEventListener("ended", ended);
          mediaElement == null ? void 0 : mediaElement.removeEventListener("playing", playing);
          context.signal.removeEventListener("abort", finish);
        };
        const finish = () => {
          if (settled)
            return;
          settled = true;
          cleanup();
          mediaElement == null ? void 0 : mediaElement.pause();
          resolve();
        };
        const fail = (error) => {
          if (settled)
            return;
          settled = true;
          cleanup();
          reject(error);
        };
        const ended = () => {
          if (settled || (quiz == null ? void 0 : quiz.hasActiveQuiz()))
            return;
          if (context.isCurrent())
            logStore.addLog(`${mediaType}已播放完成`, "success");
          finish();
        };
        const canPlay = () => {
          if (settled || !mediaElement)
            return false;
          if (!context.isCurrent() || isFinishedTask(iframe)) {
            finish();
            return false;
          }
          if (quiz == null ? void 0 : quiz.hasActiveQuiz())
            return false;
          if (mediaElement.ended) {
            ended();
            return false;
          }
          return true;
        };
        const playing = () => {
          if (!canPlay() || (mediaElement == null ? void 0 : mediaElement.paused))
            return;
          clearResumeTimer();
          playInterruptions = 0;
          waitingForManualPlay = false;
          if (!playbackLogged) {
            playbackLogged = true;
            logStore.addLog("播放成功", "success");
          }
        };
        const resume = () => {
          if (!canPlay() || playPending || waitingForManualPlay || resumeTimer !== void 0 || !(mediaElement == null ? void 0 : mediaElement.paused))
            return;
          const delay = Number(configStore.otherParams.params[0].value) * 1e3;
          resumeTimer = setTimeout(() => {
            resumeTimer = void 0;
            void tryPlay();
          }, Number.isFinite(delay) ? Math.max(1e3, delay) : 3e3);
        };
        const waitForManualPlay = (message) => {
          waitingForManualPlay = true;
          clearResumeTimer();
          logStore.addLog(message, "warning");
        };
        const tryPlay = async () => {
          if (!canPlay() || playPending || waitingForManualPlay || !(mediaElement == null ? void 0 : mediaElement.paused))
            return;
          playPending = true;
          try {
            await mediaElement.play();
            playing();
          } catch (error) {
            if (settled)
              return;
            if (!context.isCurrent() || isFinishedTask(iframe))
              return finish();
            const name = typeof error === "object" && error !== null && "name" in error ? error.name : "";
            if (name === "AbortError") {
              if (!(quiz == null ? void 0 : quiz.hasActiveQuiz()) && mediaElement.paused && !mediaElement.ended) {
                if (++playInterruptions > MAX_PLAY_RETRIES) {
                  waitForManualPlay("播放多次被暂停，请保持课程页可见并手动点击播放；播放后将继续处理任务。");
                } else {
                  logStore.addLog(`播放被暂停打断，将稍后重试（${playInterruptions}/${MAX_PLAY_RETRIES}）`, "warning");
                }
              }
            } else if (name === "NotAllowedError") {
              waitForManualPlay("浏览器暂不允许自动播放，请手动点击播放器的播放按钮；播放后将继续处理任务。");
            } else {
              fail(error);
            }
          } finally {
            playPending = false;
            resume();
          }
        };
        const intervalId2 = setInterval(async () => {
          if (settled)
            return;
          if (!context.isCurrent())
            return finish();
          if (!isExecuted)
            mediaElement = iframeDocument.documentElement.querySelector(mediaType);
          if (isFinishedTask(iframe)) {
            logStore.addLog(`${mediaType}任务点已完成，跳过`, "success");
            return finish();
          }
          if (mediaElement && !isExecuted) {
            isExecuted = true;
            try {
              mediaElement.muted = true;
              mediaElement.addEventListener("pause", resume);
              mediaElement.addEventListener("ended", ended);
              mediaElement.addEventListener("playing", playing);
              if (mediaType === "video") {
                quiz = watchVideoQuiz({
                  document: iframeDocument,
                  signal: context.signal,
                  isCurrent: () => !settled && context.isCurrent() && !isFinishedTask(iframe),
                  isEnabled: () => {
                    var _a;
                    return ((_a = configStore.platformParams.cx.parts[0].params.find((param) => param.name === VIDEO_QUIZ_SETTING)) == null ? void 0 : _a.value) !== false;
                  },
                  delayMs: () => Number(configStore.otherParams.params[0].value) * 1e3,
                  search: (question, searchContext) => getAnswer(question, { ...searchContext, skipDelay: true }),
                  similarityThreshold: () => {
                    var _a;
                    return Number(((_a = configStore.otherParams.params.find((param) => param.name.includes("相似"))) == null ? void 0 : _a.value) ?? 85);
                  },
                  publishQuestion: (question) => {
                    configStore.menuIndex = ANSWER_TAB_NAME2;
                    const row = vue.reactive(question);
                    questionStore.addQuestion(row);
                    return row;
                  },
                  onRelease: () => {
                    if (mediaElement == null ? void 0 : mediaElement.ended)
                      ended();
                    else
                      resume();
                  },
                  log: (message, type) => logStore.addLog(message, type)
                });
              }
              await tryPlay();
            } catch (error) {
              fail(error);
            }
          }
        }, 2500);
        context.signal.addEventListener("abort", finish, { once: true });
        if (!context.isCurrent())
          finish();
      });
    };
    const processWork = async (iframe, iframeDocument, iframeWindow, context) => {
      if (!context.isCurrent())
        return;
      configStore.menuIndex = ANSWER_TAB_NAME2;
      logStore.addLog("发现一个作业，正在解析", "warning");
      if (iframeDocument.documentElement.innerText.includes("已完成") || iframeDocument.documentElement.innerText.includes("待批阅")) {
        logStore.addLog("作业已经完成，跳过", "success");
        return;
      }
      decrypt(iframeDocument);
      logStore.addLog(`题目列表获取成功`, "primary");
      const correctRate = await new CxQuestionHandler("zj", iframe).init(context.isCurrent);
      if (!context.isCurrent())
        return;
      iframeWindow.alert = () => {
      };
      if (configStore.platformParams.cx.parts[0].params[0].value) {
        logStore.addLog("自动提交已开启，尝试提交", "primary");
        if (correctRate < Number(configStore.otherParams.params[1].value)) {
          logStore.addLog(`正确率小于${configStore.otherParams.params[1].value}%，暂存`, "danger");
          await iframeWindow.noSubmit();
        } else {
          logStore.addLog(`正确率大于${configStore.otherParams.params[1].value}%，提交`, "success");
          await iframeWindow.btnBlueSubmit();
          if (!context.isCurrent())
            return;
          await sleep(configStore.otherParams.params[0].value / 2);
          if (!context.isCurrent())
            return;
          await iframeWindow.submitCheckTimes();
          if (!context.isCurrent())
            return;
          logStore.addLog("提交成功", "success");
        }
      } else {
        logStore.addLog("未开启自动提交，暂存", "primary");
        await iframeWindow.noSubmit();
      }
      if (context.isCurrent())
        logStore.addLog("作业已完成", "success");
    };
    const processPpt = async (iframe, iframeWindow, context) => {
      logStore.addLog("发现一个文档/PPT，正在解析", "warning");
      const document2 = iframeWindow.document;
      const getSafeViewer = () => {
        try {
          const viewerFrame = document2.querySelector("#panView");
          const viewerDocument = (viewerFrame == null ? void 0 : viewerFrame.contentDocument) || document2;
          const viewerWindow = (viewerFrame == null ? void 0 : viewerFrame.contentWindow) || iframeWindow;
          return { viewerFrame, viewerDocument, viewerWindow };
        } catch (e) {
          return { viewerFrame: null, viewerDocument: document2, viewerWindow: iframeWindow };
        }
      };

      const tryFinishJob = () => {
        try {
          if (typeof iframeWindow.finishJob === "function") iframeWindow.finishJob();
          if (typeof iframeWindow.greenlight === "function") iframeWindow.greenlight();
          else if (typeof iframeWindow.greenligth === "function") iframeWindow.greenligth();
          const { viewerWindow } = getSafeViewer();
          if (viewerWindow && typeof viewerWindow.finishJob === "function") viewerWindow.finishJob();
          if (viewerWindow && typeof viewerWindow.greenlight === "function") viewerWindow.greenlight();
          else if (viewerWindow && typeof viewerWindow.greenligth === "function") viewerWindow.greenligth();
          if (iframe && typeof iframe.setAttribute === "function") iframe.setAttribute("download", "1");
        } catch (e) {}
      };

      // 稍作等待以确保文档 DOM 初始化完毕
      await sleep(1);
      if (!context.isCurrent()) return;

      const parseNumber = (el) => {
        if (!el) return null;
        const val = typeof el.value === "string" ? el.value : el.innerText;
        const m = (val || "").match(/\d+/);
        return m ? parseInt(m[0], 10) : null;
      };

      const getTotalPages = () => {
        var _a;
        if (typeof iframeWindow.totalPage === "number" && iframeWindow.totalPage > 0) return iframeWindow.totalPage;
        if (typeof ((_a = iframeWindow.data) == null ? void 0 : _a.pagenum) === "number" && iframeWindow.data.pagenum > 0) return iframeWindow.data.pagenum;
        if (typeof iframeWindow.endpage === "number" && iframeWindow.endpage > 0) return iframeWindow.endpage;
        if (iframeWindow.PDFViewerApplication && typeof iframeWindow.PDFViewerApplication.pagesCount === "number" && iframeWindow.PDFViewerApplication.pagesCount > 0) {
          return iframeWindow.PDFViewerApplication.pagesCount;
        }
        const { viewerDocument } = getSafeViewer();
        for (const doc of [document2, viewerDocument]) {
          if (!doc) continue;
          try {
            const allEl = doc.querySelector(".turnpage_Btn .all, .all, #numPages, .page-count, .totalPage, .page_total");
            const n = parseNumber(allEl);
            if (n && n > 0) return n;
            const imgs = doc.querySelectorAll(".documentImg, .imglook img, .slide, li[id*='anchor']");
            if (imgs.length > 1) return imgs.length;
          } catch (e) {}
        }
        return 1;
      };

      const getCurrentPage = () => {
        if (typeof iframeWindow.pagenum === "number" && iframeWindow.pagenum > 0) return iframeWindow.pagenum;
        if (iframeWindow.PDFViewerApplication && typeof iframeWindow.PDFViewerApplication.page === "number" && iframeWindow.PDFViewerApplication.page > 0) {
          return iframeWindow.PDFViewerApplication.page;
        }
        const { viewerDocument } = getSafeViewer();
        for (const doc of [document2, viewerDocument]) {
          if (!doc) continue;
          try {
            const numEl = doc.querySelector(".turnpage_Btn .num, .num, #pageNumber, .page-current, .currentPage, .page_num");
            const n = parseNumber(numEl);
            if (n && n > 0) return n;
          } catch (e) {}
        }
        return 1;
      };

      const NEXT_SELECTORS = [
        ".nextBtn",
        ".turnpage_Btn .nextBtn",
        ".turnright",
        ".m-arrow-right",
        ".arrow-right",
        "[title='下一页']",
        "[aria-label='Next']",
        "button.next",
        ".btnNext",
        ".pageNext",
        "#next",
        "#nextPage",
        ".swiper-button-next",
        ".ppt-next",
        ".doc-next"
      ].join(", ");

      const findNextButton = () => {
        const { viewerDocument } = getSafeViewer();
        for (const doc of [document2, viewerDocument]) {
          if (!doc) continue;
          try {
            const btn = doc.querySelector(NEXT_SELECTORS);
            if (btn && (btn.offsetWidth > 0 || btn.offsetHeight > 0 || btn.style.display !== "none")) {
              return btn;
            }
          } catch (e) {}
        }
        return null;
      };

      const triggerNext = (nextTargetPage) => {
        const btn = findNextButton();
        if (btn) {
          try {
            btn.click();
            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: iframeWindow }));
          } catch (e) {}
        }
        if (typeof iframeWindow.$ === "function" && btn) {
          try { iframeWindow.$(btn).trigger("click"); } catch (e) {}
        }
        if (typeof iframeWindow.changePage === "function" && nextTargetPage) {
          try { iframeWindow.changePage(nextTargetPage); } catch (e) {}
        }
        if (typeof iframeWindow.nextPage === "function") {
          try { iframeWindow.nextPage(); } catch (e) {}
        }
        if (iframeWindow.PDFViewerApplication && typeof iframeWindow.PDFViewerApplication.nextPage === "function") {
          try { iframeWindow.PDFViewerApplication.nextPage(); } catch (e) {}
        }
        const { viewerDocument, viewerWindow } = getSafeViewer();
        if (viewerWindow && typeof viewerWindow.changePage === "function" && nextTargetPage) {
          try { viewerWindow.changePage(nextTargetPage); } catch (e) {}
        }
        if (viewerWindow && typeof viewerWindow.nextPage === "function") {
          try { viewerWindow.nextPage(); } catch (e) {}
        }
        if (viewerWindow && typeof viewerWindow.$ === "function" && btn) {
          try { viewerWindow.$(btn).trigger("click"); } catch (e) {}
        }
        for (const doc of [document2, viewerDocument]) {
          if (!doc) continue;
          try {
            doc.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "ArrowRight", code: "ArrowRight", keyCode: 39, which: 39 }));
            doc.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true, cancelable: true, key: "ArrowRight", code: "ArrowRight", keyCode: 39, which: 39 }));
          } catch (e) {}
        }
      };

      const configuredInterval = Number(configStore.otherParams.params[0].value);
      const flipDelaySeconds = Math.max(
        1.5,
        Number.isFinite(configuredInterval) && configuredInterval > 0 ? configuredInterval : 2
      );

      const initialTotal = getTotalPages();
      let currentPage = getCurrentPage();
      const hasNext = !!findNextButton();

      if (hasNext || initialTotal > 1) {
        logStore.addLog(`检测到PPT/文档共 ${initialTotal} 页，开始自动翻阅...`, "primary");
        let stuckCount = 0;
        let maxIterations = 300;

        while (context.isCurrent() && !isFinishedTask(iframe) && maxIterations-- > 0) {
          const currentTotal = Math.max(initialTotal, getTotalPages());
          currentPage = getCurrentPage();

          if (currentPage >= currentTotal) {
            logStore.addLog(`已翻阅至最后一页 (${currentPage}/${currentTotal})`, "success");
            tryFinishJob();
            break;
          }

          logStore.addLog(`PPT翻页中: 第 ${currentPage}/${currentTotal} 页`, "primary");
          triggerNext(currentPage + 1);

          await sleep(flipDelaySeconds);
          if (!context.isCurrent()) return;

          const newPage = getCurrentPage();
          if (newPage === currentPage) {
            stuckCount++;
            if (stuckCount >= 3) {
              if (typeof iframeWindow.changePage === "function") {
                try { iframeWindow.changePage(currentTotal); } catch (e) {}
              }
              tryFinishJob();
              break;
            }
          } else {
            stuckCount = 0;
          }
        }
      } else {
        logStore.addLog("未检测到独立翻页按钮，尝试平滑滚动阅读文档", "primary");
        const { viewerDocument, viewerWindow } = getSafeViewer();
        const getScrollHeight = () => {
          var _a, _b, _c;
          return Math.max(
            ((_a = viewerDocument.body) == null ? void 0 : _a.scrollHeight) || 0,
            ((_b = viewerDocument.documentElement) == null ? void 0 : _b.scrollHeight) || 0,
            ((_c = viewerDocument.scrollingElement) == null ? void 0 : _c.scrollHeight) || 0
          );
        };
        const maxScroll = getScrollHeight();
        const steps = 6;
        for (let i = 1; i <= steps; i++) {
          if (!context.isCurrent() || isFinishedTask(iframe)) break;
          const targetTop = (maxScroll / steps) * i;
          viewerWindow == null ? void 0 : viewerWindow.scrollTo({ top: targetTop, behavior: "smooth" });
          if (viewerDocument.documentElement) viewerDocument.documentElement.scrollTop = targetTop;
          if (viewerDocument.body) viewerDocument.body.scrollTop = targetTop;
          viewerDocument.dispatchEvent(new Event("scroll", { bubbles: true }));
          await sleep(Math.max(1, flipDelaySeconds / 2));
        }
        tryFinishJob();
      }

      tryFinishJob();
      for (let i = 0; i < 5; i++) {
        if (!context.isCurrent() || isFinishedTask(iframe)) break;
        await sleep(1);
        tryFinishJob();
      }

      logStore.addLog("PPT/文档阅读完成", "success");
    };
    const processBook = async (iframeWindow) => {
      logStore.addLog("发现一个电子书，正在解析", "warning");
      _unsafeWindow.top.onchangepage(iframeWindow.getFrameAttr("end"));
      logStore.addLog("阅读完成", "success");
      return Promise.resolve();
    };
    const runIframeDocumentTask = (iframeDocument, task) => {
      const processed = processedIframeDocuments;
      const running = runningIframeDocumentTasks;
      if (processed.has(iframeDocument))
        return Promise.resolve();
      const runningTask = running.get(iframeDocument);
      if (runningTask)
        return runningTask;
      const taskPromise = Promise.resolve().then(task).then(() => {
        processed.add(iframeDocument);
      }).finally(() => {
        running.delete(iframeDocument);
      });
      running.set(iframeDocument, taskPromise);
      return taskPromise;
    };
    const waitIframeLoad = async (iframe, context) => {
      return new Promise((resolve) => {
        const finish = () => {
          clearInterval(intervalId2);
          context.signal.removeEventListener("abort", finish);
          resolve();
        };
        const check = () => {
          var _a;
          if (!context.isCurrent() || !iframe.isConnected || ((_a = iframe.contentDocument) == null ? void 0 : _a.readyState) === "complete")
            finish();
        };
        const intervalId2 = setInterval(check, 500);
        context.signal.addEventListener("abort", finish, { once: true });
        check();
      });
    };
    const processIframeBody = async (iframe, iframeSrc, iframeDocument, iframeWindow, context) => {
      var _a, _b;
      if (!context.isCurrent())
        return;
      if (iframeSrc.includes("javascript:"))
        return Promise.resolve();
      if (isFinishedTask(iframe)) {
        configStore.menuIndex = iframeSrc.includes("api/work") ? ANSWER_TAB_NAME2 : HOME_TAB_NAME;
        if (iframeSrc.includes("video") || iframeSrc.includes("audio")) {
          (_a = iframeDocument.documentElement.querySelector("video, audio")) == null ? void 0 : _a.pause();
        }
        logStore.addLog("发现一个已完成任务点", "success");
      } else {
        if (iframeSrc.includes("api/work")) {
          return processWork(iframe, iframeDocument, iframeWindow, context);
        }
        if (configStore.platformParams.cx.parts[0].params[2].value) {
          logStore.addLog("只答题，不做其他已开启，可在设置里调整", "primary");
        } else {
          let ansJobIcon = null;
          let p = iframe;
          while (p && p !== p.ownerDocument?.documentElement) {
            ansJobIcon = typeof p.querySelector === "function" ? p.querySelector(".ans-job-icon") : null;
            if (ansJobIcon) break;
            p = p.parentElement;
          }
          const isDocType = ["ppt", "doc", "pptx", "docx", "pdf"].some((type) => iframeSrc.includes("modules/" + type));
          if (ansJobIcon || isDocType) {
            configStore.menuIndex = HOME_TAB_NAME;
            if (iframeSrc.includes("video")) {
              return processMedia("video", iframe, iframeDocument, context);
            } else if (iframeSrc.includes("audio")) {
              return processMedia("audio", iframe, iframeDocument, context);
            } else if (isDocType) {
              return processPpt(iframe, iframeWindow, context);
            } else if (["innerbook"].some((type) => iframeSrc.includes("modules/" + type))) {
              return processBook(iframeWindow);
            }
          }
        }
      }
      return Promise.resolve();
    };
    const processIframe = async (iframe, context) => {
      if (iframe.src.includes("javascript:"))
        return Promise.resolve();
      if (!iframe.contentDocument || !iframe.contentWindow)
        return Promise.resolve();
      await waitIframeLoad(iframe, context);
      if (!context.isCurrent() || !iframe.isConnected)
        return;
      const iframeSrc = iframe.src;
      const iframeDocument = iframe.contentDocument;
      const iframeWindow = iframe.contentWindow;
      if (!iframeDocument || !iframeWindow)
        return Promise.resolve();
      const iframeContext = {
        signal: context.signal,
        isCurrent: () => context.isCurrent() && iframe.isConnected && iframe.contentDocument === iframeDocument && iframe.src === iframeSrc
      };
      return runIframeDocumentTask(iframeDocument, () => processIframeBody(
        iframe,
        iframeSrc,
        iframeDocument,
        iframeWindow,
        iframeContext
      ));
    };
    init();
    processIframeTask();
    const intervalId = setInterval(processIframeTask, 500);
    const observer = new MutationObserver(() => processIframeTask());
    observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["src"] });
    vue.onBeforeUnmount(() => {
      var _a;
      disposed = true;
      clearInterval(intervalId);
      observer.disconnect();
      (_a = currentPage == null ? void 0 : currentPage.iframe) == null ? void 0 : _a.removeEventListener("load", onRootIframeLoad);
      chapterController.abort();
    });
  };
  const useCxWorkLogic = async () => {
    const logStore = useLogStore();
    const questionStore = useQuestionStore();
    questionStore.clearQuestion();
    logStore.addLog(`进入新版作业页面，开始准备答题`, "primary");
    logStore.addLog(`正在解析题目, 请等待5s`, "warning");
    await new CxQuestionHandler("zy").init();
  };
  const NEXT_STEP_TEXT = "下一步";
  const isVisibleElement = (element) => {
    const style2 = window.getComputedStyle(element);
    return style2.display !== "none" && style2.visibility !== "hidden" && style2.opacity !== "0" && element.getClientRects().length > 0;
  };
  const clickNextStepButton = () => {
    const examDocument = _unsafeWindow.document || document;
    const buttons = Array.from(examDocument.querySelectorAll(".nextDiv a"));
    const nextStepButton = buttons.find((button) => {
      var _a, _b;
      return isVisibleElement(button) && (((_a = button.getAttribute("onclick")) == null ? void 0 : _a.includes("topreview")) || ((_b = button.textContent) == null ? void 0 : _b.trim()) === NEXT_STEP_TEXT);
    });
    if (!nextStepButton)
      return false;
    nextStepButton.click();
    return true;
  };
  const useCxExamLogic = async () => {
    const logStore = useLogStore();
    const configStore = useConfigStore();
    const questionStore = useQuestionStore();
    questionStore.clearQuestion();
    logStore.addLog("进入新版考试页面，开始准备答题", "primary");
    logStore.addLog("正在解析题目，请稍等", "warning");
    await new CxQuestionHandler("ks").init();
    if (configStore.platformParams.cx.parts[1].params[0].value) {
      logStore.addLog("自动切换已开启，正在前往下一题", "success");
      await sleep(configStore.otherParams.params[0].value);
      if (clickNextStepButton()) {
        logStore.addLog("已经到最后一题，正在点击下一步", "success");
        return;
      }
      _unsafeWindow.getTheNextQuestion(1);
    } else {
      logStore.addLog("已经关闭自动切换，在设置里可更改", "danger");
    }
  };
  class ZhsQuestionHandler extends BaseQuestionHandler {
    constructor() {
      super();
      __publicField(this, "init", async () => {
        var _a, _b, _c, _d;
        this.questions = [];
        this.parseHtml();
        if (this.questions.length) {
          this.addLog(`成功解析到${this.questions.length}个题目`, "primary");
          for (const [index, parsedQuestion] of this.questions.entries()) {
            const question = vue.reactive({ ...parsedQuestion, answerStatus: "searching" });
            this.addQuestion(question);
            const answerData = await getAnswer(question);
            const values = getAnswerValues(answerData, question);
            if (values == null ? void 0 : values.length) {
              question.answer = values;
              question.answerStatus = "success";
              this.fillQuestion(question);
              this.addLog(`第${index + 1}道题搜索成功`, "success");
              if ((_a = answerData.meta) == null ? void 0 : _a.check_detail) {
                const logType = answerData.meta.check_status === "arbitrated" ? "warning" : "primary";
                this.addLog(answerData.meta.check_detail, logType);
              }
              this.addLog(`剩余次数:${String(((_a = answerData.meta) == null ? void 0 : _a.credit_remaining) ?? "未知")}`, "primary");
            } else {
              this.addLog(`第${index + 1}道题搜索失败，<a class="log-action-link" href="#" data-log-action="show-answer-tab">点击查看原因</a>`, "danger");
              question.answerStatus = "error";
              question.answer = [((_b = answerData.error) == null ? void 0 : _b.message) || "未查询到答案"];
            }
            await ((_d = (_c = this._document) == null ? void 0 : _c.querySelectorAll(".switch-btn-box > button")[1]) == null ? void 0 : _d.click());
          }
        } else
          this.addLog("未解析到题目，请刷新重试或进入答题页面", "danger");
      });
      __publicField(this, "parseHtml", () => {
        if (!this._document)
          return [];
        const questionElements = this._document.querySelectorAll(".examPaper_subject");
        this.addQuestions(questionElements);
      });
      __publicField(this, "fillQuestion", (question) => {
        if (!this._window)
          return;
        if (question.type === "单选题" || question.type === "多选题") {
          question.answer.forEach((answer) => {
            const optionElement = this.findMatchedOption(question.options, String(answer));
            if (optionElement)
              this.clickOptionIfNeeded(optionElement);
          });
        } else if (question.type === "判断题") {
          let answer = "true";
          if (String(question.answer[0]).match(/(^|,)(正确|是|对|√|T|ri|right|true)(,|$)/)) {
            answer = "true";
          } else if (String(question.answer[0]).match(/(^|,)(错误|否|错|×|F|wr|wrong|false)(,|$)/)) {
            answer = "false";
          }
          for (const key in question.options) {
            if (this.normalizeJudgementText(key) === answer) {
              this.clickOptionIfNeeded(question.options[key]);
            }
          }
        } else if (question.type === "填空题" || question.type === "简答题") {
          this.fillTextQuestion(question);
        } else
          ;
      });
    }
    extractOptions(optionElements, optionSelector) {
      const optionsObject = {};
      const optionTexts = [];
      optionElements.forEach((optionElement) => {
        var _a;
        const optionTextContent = this.removeHtml(((_a = optionElement.querySelector(optionSelector)) == null ? void 0 : _a.innerHTML) || "");
        optionsObject[optionTextContent] = optionElement;
        optionTexts.push(optionTextContent);
      });
      return [optionsObject, optionTexts];
    }
    addQuestions(questionElements) {
      questionElements.forEach((questionElement) => {
        var _a, _b;
        const titleElement = questionElement == null ? void 0 : questionElement.querySelector(".subject_describe div,.smallStem_describe p");
        const shadowDom = (_b = (_a = titleElement == null ? void 0 : titleElement.__Ivue__) == null ? void 0 : _a._data) == null ? void 0 : _b.shadowDom;
        const questionTitle = (shadowDom == null ? void 0 : shadowDom.textContent) || (titleElement == null ? void 0 : titleElement.textContent) || "";
        let searchStem = "";
        if (shadowDom && typeof shadowDom === "object" && "nodeType" in shadowDom) {
          searchStem = extractRawTextFromElement(shadowDom);
        } else if (typeof shadowDom === "string") {
          searchStem = extractRawTextFromHtml(shadowDom, this._document);
        } else if (typeof (shadowDom == null ? void 0 : shadowDom.innerHTML) === "string") {
          searchStem = extractRawTextFromHtml(shadowDom.innerHTML, this._document);
        }
        const optionElements = questionElement == null ? void 0 : questionElement.querySelectorAll(".label");
        const [optionsObject, optionTexts] = this.extractOptions(optionElements, ".node_detail");
        const questionKind = this.inferQuestionTypeByStructure(questionElement, Array.from(optionElements), optionTexts);
        let searchOptions = Array.from(optionElements).map((optionElement) => stripOptionLabel(extractRawTextFromElement(optionElement.querySelector(".node_detail"))));
        if (questionKind === "3") {
          searchOptions = Array.from(optionElements).map((optionElement, index) => extractJudgementToken(optionElement, searchOptions[index] || optionTexts[index]) || searchOptions[index]);
        }
        const questionType = this.mapQuestionType(questionKind);
        this.questions.push({
          element: questionElement,
          type: questionType,
          title: questionTitle,
          optionsText: optionTexts,
          options: optionsObject,
          searchText: { stem: searchStem, options: searchOptions },
          answer: [],
          workType: "zhs",
          refer: this._window.location.href
        });
      });
    }
    mapQuestionType(type) {
      const typeMap = {
        "0": "单选题",
        "1": "多选题",
        "2": "填空题",
        "3": "判断题",
        "4": "简答题",
        "8": "其他"
      };
      return typeMap[type] || "其他";
    }
    clickOptionIfNeeded(optionElement) {
      const input = optionElement.querySelector("input");
      const className = optionElement.getAttribute("class") || "";
      if (input == null ? void 0 : input.checked)
        return;
      if (optionElement.getAttribute("aria-checked") === "true")
        return;
      if (/\b(active|checked|selected|is-checked)\b/.test(className))
        return;
      if (optionElement.querySelector(".active, .checked, .selected, .is-checked"))
        return;
      optionElement.click();
    }
    fillTextQuestion(question) {
      const fields = [
        ...Array.from(question.element.querySelectorAll("input")),
        ...Array.from(question.element.querySelectorAll("textarea")),
        ...Array.from(question.element.querySelectorAll('[contenteditable="true"]'))
      ].filter((field) => {
        if (field instanceof HTMLInputElement) {
          const type = (field.getAttribute("type") || "text").toLowerCase();
          return ["", "text", "search", "number", "tel", "url", "email"].includes(type) && !field.disabled && !field.hidden;
        }
        return true;
      });
      fields.forEach((field, index) => {
        const answer = String(question.answer[index] ?? question.answer[0] ?? "");
        if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
          field.value = String(answer);
          field.dispatchEvent(new Event("input", { bubbles: true }));
          field.dispatchEvent(new Event("change", { bubbles: true }));
          return;
        }
        field.textContent = answer;
        field.dispatchEvent(new Event("input", { bubbles: true }));
      });
    }
  }
  const hookError = () => {
    console.log("hookError");
    const oldset = _unsafeWindow.setInterval;
    const oldout = _unsafeWindow.setTimeout;
    _unsafeWindow.setInterval = function(...args) {
      const err = new Error();
      if (err.stack && err.stack.indexOf("checkoutNotTrustScript") !== -1) {
        return -1;
      }
      return oldset.call(this, ...args);
    };
    _unsafeWindow.setTimeout = function(...args) {
      const err = new Error();
      if (err.stack && err.stack.indexOf("checkoutNotTrustScript") !== -1) {
        return -1;
      }
      return oldout.call(this, ...args);
    };
  };
  class XMLHttpRequestInterceptor {
    constructor(urlList, callback) {
      __publicField(this, "xhr");
      __publicField(this, "originalOpen");
      __publicField(this, "originalSend");
      __publicField(this, "callback");
      this.xhr = new XMLHttpRequest();
      this.originalOpen = this.xhr.open;
      this.originalSend = this.xhr.send;
      this.callback = callback;
      this.intercept(urlList);
    }
    intercept(urlList) {
      const self = this;
      XMLHttpRequest.prototype.open = function(method, url2) {
        self.originalOpen.apply(this, [method, url2]);
        const shouldIntercept = urlList.some((urlItem) => url2.includes(urlItem));
        if (shouldIntercept) {
          self.callback(this.responseText);
        }
      };
    }
  }
  const useZhsAnswerLogic = async () => {
    hookError();
    const logStore = useLogStore();
    const questionStore = useQuestionStore();
    questionStore.clearQuestion();
    logStore.addLog(`进入答题页面，开始准备答题`, "primary");
    logStore.addLog(`正在解析题目, 请等待5s`, "warning");
    new XMLHttpRequestInterceptor(["gateway/t/v1/answer/hasAnswer"], async () => {
      await sleep(1);
      _unsafeWindow.document.getSelection = function() {
        return {
          removeAllRanges: function() {
          }
        };
      };
      _unsafeWindow.document.onselectstart = true;
      _unsafeWindow.document.oncontextmenu = true;
      _unsafeWindow.document.oncut = true;
      _unsafeWindow.document.oncopy = true;
      _unsafeWindow.document.onpaste = true;
      await new ZhsQuestionHandler().init();
      return true;
    });
  };
  const DEFAULT_CARD_WIDTH = "310px";
  const ANSWER_CARD_WIDTH = "630px";
  const ANSWER_TAB_NAME = "1";
  const _sfc_main$3 = /* @__PURE__ */ vue.defineComponent({
    __name: "Index",
    emits: ["customEvent"],
    setup(__props, { emit: __emit }) {
      var _a;
      const isShow = vue.ref(false);
      const configStore = useConfigStore();
      const logStore = useLogStore();
      const questionStore = useQuestionStore();
      const emit = __emit;
      const url2 = window.location.href;
      const cardWidth = vue.computed(() => configStore.menuIndex === ANSWER_TAB_NAME ? ANSWER_CARD_WIDTH : DEFAULT_CARD_WIDTH);
      (_a = document.querySelector("li>a.experience:not([onclick])")) == null ? void 0 : _a.click();
      logStore.addLog("tangwg学习通初始化成功，已连接专属 AI 题库", "success");
      logStore.addLog("脚本加载成功，正在解析网页", "primary");
      logStore.addLog("请不要多个脚本同时使用，会有脚本冲突问题", "warning");
      logStore.addLog("如果脚本出现异常，请用谷歌、火狐等浏览器", "warning");
      const urlLogicPairs = [
        { keyword: "/mycourse/studentstudy", logic: useCxChapterLogic },
        { keyword: "/mooc2/work/dowork", logic: useCxWorkLogic },
        { keyword: "/exam-ans/exam", logic: useCxExamLogic },
        {
          keyword: "mycourse/stu?courseid",
          logic: () => {
            logStore.addLog("该页面无任务，请进入章节或答题页面使用", "error");
          }
        },
        { keyword: "/stuExamWeb.html", logic: useZhsAnswerLogic }
      ];
      const updateVisible = (visible2) => {
        isShow.value = visible2;
        emit("customEvent", visible2);
      };
      const executeLogicByUrl = (currentUrl) => {
        const matchedPair = urlLogicPairs.find(({ keyword }) => currentUrl.includes(keyword));
        if (matchedPair) {
          matchedPair.logic();
          updateVisible(true);
          return;
        }
        updateVisible(false);
      };
      executeLogicByUrl(url2);
      const tabs = vue.computed(() => [
        {
          name: "0",
          label: "首页",
          component: _sfc_main$8,
          props: { logList: logStore.logList }
        },
        {
          name: ANSWER_TAB_NAME,
          label: "答题",
          component: _sfc_main$6,
          props: { questionList: questionStore.questionList }
        },
        {
          name: "2",
          label: "设置",
          component: _sfc_main$7,
          props: { globalConfig: configStore }
        }
      ]);
      return (_ctx, _cache) => {
        const _component_el_tab_pane = vue.resolveComponent("el-tab-pane");
        const _component_el_tabs = vue.resolveComponent("el-tabs");
        return vue.openBlock(), vue.createElementBlock("div", {
          style: vue.normalizeStyle({ width: cardWidth.value }),
          class: "card_content"
        }, [
          vue.createVNode(_component_el_tabs, {
            modelValue: vue.unref(configStore).menuIndex,
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => vue.unref(configStore).menuIndex = $event),
            class: "demo-tabs"
          }, {
            default: vue.withCtx(() => [
              (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(tabs.value, (tab) => {
                return vue.openBlock(), vue.createBlock(_component_el_tab_pane, {
                  key: tab.name,
                  name: tab.name,
                  label: tab.label
                }, {
                  default: vue.withCtx(() => [
                    (vue.openBlock(), vue.createBlock(vue.resolveDynamicComponent(tab.component), vue.mergeProps({ ref_for: true }, tab.props), null, 16))
                  ]),
                  _: 2
                }, 1032, ["name", "label"]);
              }), 128))
            ]),
            _: 1
          }, 8, ["modelValue"])
        ], 4);
      };
    }
  });
  const _sfc_main$2 = /* @__PURE__ */ vue.defineComponent({
    __name: "ZoomButtons",
    emits: ["toggleZoom"],
    setup(__props, { emit: __emit }) {
      const emit = __emit;
      const toggleZoom = (value) => {
        emit("toggleZoom", value);
      };
      return (_ctx, _cache) => {
        const _component_el_icon = vue.resolveComponent("el-icon");
        return vue.openBlock(), vue.createElementBlock("div", {
          onMousedown: _cache[2] || (_cache[2] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createVNode(_component_el_icon, {
            onClick: _cache[0] || (_cache[0] = ($event) => toggleZoom(true)),
            class: "zoom-icon",
            size: "small"
          }, {
            default: vue.withCtx(() => [
              vue.createVNode(vue.unref(minus_default))
            ]),
            _: 1
          }),
          vue.createVNode(_component_el_icon, {
            onClick: _cache[1] || (_cache[1] = ($event) => toggleZoom(false)),
            class: "zoom-icon is-spaced",
            size: "small"
          }, {
            default: vue.withCtx(() => [
              vue.createVNode(vue.unref(full_screen_default))
            ]),
            _: 1
          })
        ], 32);
      };
    }
  });
  const _hoisted_1 = { class: "overlay" };
  const _hoisted_2 = { class: "title" };
  const _hoisted_3 = { class: "minus" };
  const WINDOW_EDGE_OFFSET = 11;
  const PANEL_WIDTH = 334;
  const MINIMIZED_PANEL_HEIGHT = 35;
  const _sfc_main$1 = /* @__PURE__ */ vue.defineComponent({
    __name: "layout",
    setup(__props) {
      const isShow = vue.ref(false);
      const configStore = useConfigStore();
      const currentPlatformName = vue.computed(() => configStore.platformParams[configStore.platformName].name);
      vue.watch(configStore, (newVal) => {
        persistConfig(newVal);
      }, { deep: true });
      const isDragging = vue.ref(false);
      const offsetX = vue.ref(0);
      const offsetY = vue.ref(0);
      const moveStyle = vue.ref({
        left: configStore.position.x,
        top: configStore.position.y
      });
      const handleVisibleChange = (visible2) => {
        isShow.value = visible2;
      };
      const startDrag = (event) => {
        isDragging.value = true;
        const header = event.currentTarget;
        offsetX.value = event.clientX - header.getBoundingClientRect().left;
        offsetY.value = event.clientY - header.getBoundingClientRect().top;
        document.addEventListener("mousemove", drag);
        document.addEventListener("mouseup", endDrag);
      };
      const drag = (event) => {
        if (!isDragging.value)
          return;
        const x = event.clientX - offsetX.value;
        const y = event.clientY - offsetY.value;
        const nextLeft = `${x - WINDOW_EDGE_OFFSET}px`;
        const nextTop = `${y - WINDOW_EDGE_OFFSET}px`;
        moveStyle.value = {
          left: nextLeft,
          top: nextTop
        };
        configStore.position.x = nextLeft;
        configStore.position.y = nextTop;
        if (x < 0) {
          moveStyle.value.left = "0px";
          configStore.position.x = "0px";
        }
        if (y < 0) {
          moveStyle.value.top = "0px";
          configStore.position.y = "0px";
        }
        if (x > window.innerWidth - PANEL_WIDTH) {
          const maxLeft = `${window.innerWidth - PANEL_WIDTH}px`;
          moveStyle.value.left = maxLeft;
          configStore.position.x = maxLeft;
        }
        if (y > window.innerHeight - MINIMIZED_PANEL_HEIGHT) {
          const maxTop = `${window.innerHeight - MINIMIZED_PANEL_HEIGHT}px`;
          moveStyle.value.top = maxTop;
          configStore.position.y = maxTop;
        }
      };
      const endDrag = () => {
        isDragging.value = false;
        document.removeEventListener("mousemove", drag);
        document.removeEventListener("mouseup", endDrag);
      };
      return (_ctx, _cache) => {
        const _component_el_icon = vue.resolveComponent("el-icon");
        const _component_el_tooltip = vue.resolveComponent("el-tooltip");
        const _component_el_text = vue.resolveComponent("el-text");
        const _component_el_divider = vue.resolveComponent("el-divider");
        const _component_el_card = vue.resolveComponent("el-card");
        return vue.withDirectives((vue.openBlock(), vue.createElementBlock("div", {
          style: vue.normalizeStyle(moveStyle.value),
          class: "main-page"
        }, [
          vue.withDirectives(vue.createElementVNode("div", _hoisted_1, null, 512), [
            [vue.vShow, isDragging.value]
          ]),
          vue.createVNode(_component_el_card, {
            "close-on-click-modal": false,
            "lock-scroll": false,
            modal: false,
            "show-close": false,
            "modal-class": "modal"
          }, {
            header: vue.withCtx(() => [
              vue.createElementVNode("div", {
                class: "card-header",
                onMousedown: startDrag
              }, [
                vue.createElementVNode("div", _hoisted_2, [
                  vue.createElementVNode("span", null, vue.toDisplayString(currentPlatformName.value), 1),
                  vue.createVNode(_component_el_tooltip, {
                    teleported: false,
                    effect: "dark",
                    placement: "top-start",
                    content: "<span>tangwg学习通专属版<br/>由自建 CPA AI 驱动</span>",
                    "raw-content": ""
                  }, {
                    default: vue.withCtx(() => [
                      vue.createVNode(_component_el_icon, {
                        class: "warning-icon",
                        size: "small"
                      }, {
                        default: vue.withCtx(() => [
                          vue.createVNode(vue.unref(warning_default))
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  })
                ]),
                vue.createVNode(_sfc_main$2, {
                  onToggleZoom: _cache[0] || (_cache[0] = ($event) => vue.unref(configStore).isMinus = $event)
                })
              ], 32)
            ]),
            default: vue.withCtx(() => [
              vue.withDirectives(vue.createVNode(_sfc_main$3, { onCustomEvent: handleVisibleChange }, null, 512), [
                [vue.vShow, !vue.unref(configStore).isMinus]
              ]),
              vue.withDirectives(vue.createElementVNode("div", _hoisted_3, [
                vue.createVNode(_component_el_text, {
                  type: "info",
                  size: "small"
                }, {
                  default: vue.withCtx(() => [
                    vue.createTextVNode("已最小化，点击上方按钮恢复")
                  ]),
                  _: 1
                }),
                vue.createVNode(_component_el_divider, {
                  class: "compact-divider",
                  "border-style": "dashed"
                })
              ], 512), [
                [vue.vShow, vue.unref(configStore).isMinus]
              ])
            ]),
            _: 1
          })
        ], 4)), [
          [vue.vShow, isShow.value]
        ]);
      };
    }
  });
  const _sfc_main = /* @__PURE__ */ vue.defineComponent({
    __name: "App",
    setup(__props) {
      const platformMatchers = [
        { keyword: "chaoxing", platformName: "cx" },
        { keyword: "zhihuishu", platformName: "zhs" }
      ];
      const configStore = useConfigStore();
      const url2 = window.location.href;
      const matchedPlatform = platformMatchers.find(({ keyword }) => url2.includes(keyword));
      if (matchedPlatform) {
        configStore.platformName = matchedPlatform.platformName;
      }
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createBlock(_sfc_main$1);
      };
    }
  });
  const cssLoader = (e) => {
    const t = GM_getResourceText(e);
    return GM_addStyle(t), t;
  };
  cssLoader("ElementPlus");
  const layoutCss = '.main-page .guide-page{box-sizing:border-box;max-height:min(400px,calc(100vh - 160px));max-height:min(400px,calc(100dvh - 160px));overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;padding:2px 4px 2px 0;color:#4e5969;font-size:12px;line-height:1.7;scrollbar-width:thin;scrollbar-color:#c7d7eb transparent}.main-page .guide-page:focus-visible{outline:2px solid #176ae5;outline-offset:2px;border-radius:8px}.main-page .guide-header{margin:0 0 10px;padding:11px 12px;border:1px solid #d9e8fc;border-radius:9px;background:linear-gradient(120deg,#edf5ff 0%,#f8fbff 100%)}.main-page .guide-heading-row{display:flex;align-items:center;justify-content:space-between;gap:8px}.main-page .guide-title{margin:0;color:#174b94;font-size:13px;font-weight:600;line-height:1.6}.main-page .guide-tag{flex-shrink:0;padding:1px 7px;border:1px solid #d4e5fc;border-radius:20px;background-color:#fff;color:#2262b5;font-size:10px;line-height:18px}.main-page .guide-subtitle{margin:3px 0 0;color:#61758e;font-size:11px}.main-page .guide-list{display:grid;gap:8px;margin:0;padding:0;list-style:none}.main-page .guide-card{min-width:0;padding:10px;border:1px solid #e4eaf2;border-radius:8px;background-color:#fff}.main-page .guide-card-heading{display:flex;align-items:center;gap:8px;margin-bottom:6px}.main-page .guide-number{display:inline-flex;align-items:center;justify-content:center;flex:0 0 24px;height:24px;border-radius:7px;background-color:#eaf3ff;color:#176ae5;font-size:11px;font-weight:600;line-height:1;font-variant-numeric:tabular-nums}.main-page .guide-card-title{margin:0;color:#263a55;font-size:12px;font-weight:600;line-height:1.6}.main-page .guide-copy{margin:0;overflow-wrap:anywhere}.main-page .guide-flow{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;margin:10px 0 0;padding:9px 4px 7px;border-radius:7px;background-color:#f3f7fd;list-style:none}.main-page .guide-flow-step{position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;color:#3a5a83;font-size:10px;line-height:18px;text-align:center}.main-page .guide-flow-step+.guide-flow-step:before{position:absolute;top:8px;left:-5px;width:5px;height:5px;border-top:1px solid #9cb8da;border-right:1px solid #9cb8da;content:"";transform:rotate(45deg)}.main-page .guide-flow-number{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border:1px solid #d5e4f8;border-radius:50%;background-color:#fff;color:#176ae5;font-size:11px;font-weight:600;line-height:1}.main-page{--app-font-family: "Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";--el-font-family: var(--app-font-family);z-index:100003;position:fixed;color:#1f2329;font-family:var(--app-font-family)!important;font-size:14px;line-height:1.5715;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}.main-page *,.main-page input,.main-page button,.main-page textarea{font-family:var(--app-font-family)!important;letter-spacing:0}.main-page .el-card,.main-page .el-tabs,.main-page .el-text,.main-page .el-button,.main-page .el-input,.main-page .el-input__inner,.main-page .el-input-number,.main-page .el-table{font-family:var(--app-font-family)!important}.main-page .overlay{position:fixed;top:0;left:0;right:0;bottom:0;z-index:1001}.main-page .el-card{border:0}.main-page .card-header{display:flex;justify-content:space-between;flex-direction:row;align-items:center;margin:0;padding:0;cursor:move}.main-page .card-header .title{font-size:14px;display:flex;align-items:center;justify-content:center;font-weight:500}.main-page .warning-icon{margin-left:5px}.main-page .zoom-icon{cursor:pointer}.main-page .zoom-icon.is-spaced{margin-left:8px}.main-page .minus{margin:5px 10px -10px 0}.main-page .compact-divider{margin:0}.main-page .demo-tabs{display:initial}.main-page .el-card__header{background-color:#1f71e0;color:#fff;padding:7px 10px 7px 16px;margin:0}.main-page .el-card__body{padding:0 16px 20px}.main-page .el-tabs__nav-wrap:after{height:1px}.main-page .el-tabs__active-bar{background-color:#176ae5}.main-page .el-tabs__item{font-size:13px;height:34px}.main-page .el-tabs__item.is-top{font-weight:400;color:#4e5969;padding:0 8px 0 12px}.main-page .el-tabs__item.is-active{font-weight:500;color:#176ae5;padding:0 8px 0 12px}.main-page .script-home{padding-top:2px}.main-page .announcement-board{box-sizing:border-box;margin:2px 0 10px;padding:8px 10px;border:1px solid #bae0ff;border-radius:6px;background-color:#e6f4ff}.main-page .announcement-heading{display:flex;align-items:center;gap:6px;margin-bottom:4px;color:#0958d9;font-size:12px;font-weight:600;line-height:20px}.main-page .announcement-heading:before{content:"";width:6px;height:6px;flex:0 0 auto;border-radius:50%;background-color:#1677ff}.main-page .announcement-list{display:grid;gap:3px;margin:0;padding:0;list-style:none}.main-page .announcement-item{color:#1f2329;font-size:12px;line-height:20px;word-break:break-word}.main-page .log .el-text{font-weight:400;white-space:normal}.main-page .log-time{font-weight:400}.main-page .log-action-link{color:#176ae5;cursor:pointer;text-decoration:none}.main-page .log-action-link:hover{color:#409eff;text-decoration:underline}.main-page .log-divider{margin:0}.main-page .token-input,.main-page .question-list{font-size:12px}.main-page .token-label{border-radius:0}.main-page .model-row{display:flex;align-items:center;gap:6px;margin:6px 0 8px}.main-page .model-select{min-width:0;font-size:12px}.main-page .model-refresh{flex:0 0 auto}.main-page .endpoint-row{display:flex;align-items:center;gap:6px;margin:2px 0 8px}.main-page .endpoint-input{flex:1 1 auto;min-width:0;font-size:12px}.main-page .direct-check-toggle{flex:0 0 auto}.main-page .question_table{width:625px}.main-page .answer-legend{display:flex;flex-wrap:wrap;align-items:center;gap:6px 16px;padding:10px 2px 8px;font-size:11px;line-height:18px}.main-page .answer-legend>span{display:inline-flex;align-items:center;gap:5px}.main-page .answer-legend>span:before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor}.main-page .answer-result{line-height:1.7;overflow-wrap:anywhere}.main-page .answer-result--success{color:#15803d}.main-page .answer-result--searching{color:#a15c08}.main-page .answer-result--pending{color:#697586}.main-page .answer-result--error{color:#c73e38}.main-page .setting{margin-top:-8px;font-size:14px}.main-page .setting-section-title{font-size:13px}.main-page .setting-checkbox{margin-bottom:6px}.main-page .setting-number{margin-top:6px}.main-page .setting .el-form-item{margin-bottom:0}.main-page .audio-mode-row{display:flex;align-items:center;gap:8px;margin:0 0 8px;flex-wrap:wrap}.main-page .audio-mode-label{font-size:12px;color:#4e5969;white-space:nowrap}.main-page .help-icon{display:inline-flex;align-items:center;justify-content:center;color:#86909c;cursor:help;vertical-align:middle;transition:color .15s}.main-page .help-icon:hover{color:#176ae5}.main-page .stt-panel{margin:0 0 8px;padding:8px 10px;border:1px dashed #cfd9e6;border-radius:6px;background-color:#f7f9fc}.main-page .stt-panel-header{display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:6px}.main-page .stt-panel-title{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;color:#263a55}.main-page .stt-panel .endpoint-row{margin:0 0 6px}.main-page .stt-panel .token-input{margin:0 0 6px}.main-page .stt-panel .model-row{margin:0}.main-page .stt-protocol-badge{font-size:11px;line-height:16px;padding:1px 6px;border-radius:4px;white-space:nowrap}.main-page .stt-protocol-badge--muted{color:#61758e;background:#eef3fa}.main-page .stt-protocol-badge--ok{color:#15803d;background:#eaf7ee}.main-page .stt-protocol-badge--warn{color:#c73e38;background:#fef1f0}\n';
  const hookWebpack = () => {
    let originCall = _unsafeWindow.Function.prototype.call;
    _unsafeWindow.Function.prototype.call = function(...args) {
      var _a, _b;
      const result = originCall.apply(this, args);
      if (((_b = (_a = args[0]) == null ? void 0 : _a.a) == null ? void 0 : _b.version) === "2.5.0") {
        const install = args[1].exports.a.install;
        args[1].exports.a.install = function(...installArgs) {
          installArgs[0].mixin({
            mounted: function() {
              this.$el["__Ivue__"] = this;
            }
          });
          return install.apply(this, installArgs);
        };
        return result;
      }
      return result;
    };
  };
  const BOOTSTRAP_INTERVAL = 100;
  const COMPLETE_READY_STATE = "complete";
  const ELEMENT_PLUS_STYLE_RESOURCE = "ElementPlusStyle";
  const url = _unsafeWindow.location.href;
  if (url.includes("zhihuishu.com")) {
    hookWebpack();
    hookError();
  }
  const createStyleSheet = (cssText) => {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(cssText);
    return sheet;
  };
  const createShadowMountNode = () => {
    const shadowHost = document.createElement("div");
    const mountNode = document.createElement("div");
    const shadowRoot = shadowHost.attachShadow({ mode: "closed" });
    document.body.append(shadowHost);
    shadowRoot.appendChild(mountNode);
    shadowRoot.adoptedStyleSheets = [
      createStyleSheet(_GM_getResourceText(ELEMENT_PLUS_STYLE_RESOURCE) ?? ""),
      createStyleSheet(layoutCss)
    ];
    return mountNode;
  };
  const mountApp = () => {
    const app = vue.createApp(_sfc_main);
    app.use(pinia.createPinia());
    app.use(ElementPlus);
    app.mount(createShadowMountNode());
  };
  const timer = setInterval(() => {
    if (document.readyState !== COMPLETE_READY_STATE)
      return;
    clearInterval(timer);
    mountApp();
  }, BOOTSTRAP_INTERVAL);

})(Vue, Pinia, rxjs, md5, ElementPlus);