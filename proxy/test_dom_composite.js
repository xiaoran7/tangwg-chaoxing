// 测试前端复合听力题选项提取与点击逻辑
class MockNode {
  constructor(tag, className = "", text = "") {
    this.tagName = tag.toUpperCase();
    this.className = className;
    this.textContent = text;
    this.children = [];
    this.parentElement = null;
    this.attributes = {};
    this.clicked = false;
    this.checked = false;
    this.classList = {
      contains: (c) => this.className.split(/\s+/).includes(c),
      add: (c) => {
        if (!this.classList.contains(c)) this.className += " " + c;
      }
    };
  }
  setAttribute(k, v) { this.attributes[k] = v; }
  getAttribute(k) { return this.attributes[k] ?? null; }
  appendChild(child) {
    child.parentElement = this;
    this.children.push(child);
    return child;
  }
  cloneNode(deep = true) {
    const copy = new MockNode(this.tagName, this.className, this.textContent);
    copy.attributes = { ...this.attributes };
    if (deep) {
      for (const c of this.children) {
        copy.appendChild(c.cloneNode(true));
      }
    }
    return copy;
  }
  remove() {
    if (this.parentElement) {
      const idx = this.parentElement.children.indexOf(this);
      if (idx !== -1) this.parentElement.children.splice(idx, 1);
    }
  }
  matches(selector) {
    const parts = selector.split(",").map((s) => s.trim());
    return parts.some((p) => {
      if (p.includes(".")) {
        const [tag, ...classes] = p.split(".");
        if (tag && this.tagName.toLowerCase() !== tag.toLowerCase()) return false;
        return classes.every((c) => this.classList.contains(c));
      }
      if (p === "input[type='radio']") return this.tagName === "INPUT" && this.getAttribute("type") === "radio";
      return this.tagName.toLowerCase() === p.toLowerCase();
    });
  }
  closest(selector) {
    let curr = this;
    while (curr) {
      if (curr.matches(selector)) return curr;
      curr = curr.parentElement;
    }
    return null;
  }
  querySelectorAll(selector) {
    const res = [];
    const walk = (node) => {
      for (const child of node.children) {
        if (child.matches(selector)) res.push(child);
        walk(child);
      }
    };
    walk(this);
    return res;
  }
  querySelector(selector) {
    const list = this.querySelectorAll(selector);
    return list[0] || null;
  }
  click() {
    this.clicked = true;
    // 模拟 Vue 点击响应：行容器或者指示器获得选中态
    this.classList.add("check_answer");
    if (this.parentElement && this.parentElement.classList.contains("clearfix")) {
      this.parentElement.classList.add("check_answer");
    }
  }
  contains(other) {
    let curr = other;
    while (curr) {
      if (curr === this) return true;
      curr = curr.parentElement;
    }
    return false;
  }
  compareDocumentPosition(other) {
    let all = [];
    const flatten = (n) => {
      all.push(n);
      for (const c of n.children) flatten(c);
    };
    let root = this;
    while (root.parentElement) root = root.parentElement;
    flatten(root);
    const iA = all.indexOf(this);
    const iB = all.indexOf(other);
    return iA < iB ? 4 : 2;
  }
}

// 模拟超星现代作业页面的复合听力题目结构 (1道大题，3道选择小题，每题A/B/C/D)
// 注意：超星作业中经常出现父级 div.sub_title 嵌套子级 p.sub_question_title，导致双重匹配！
const questionEl = new MockNode("div", "questionLi");
const h3 = questionEl.appendChild(new MockNode("h3", "", "1. (听力题) Listen to a news report and choose the best answer."));

const sub1Box = questionEl.appendChild(new MockNode("div", "sub_title"));
const sub1Tit = sub1Box.appendChild(new MockNode("p", "sub_question_title", "(1) (单选题) What is the news mainly about?"));
sub1Box.textContent = "(1) (单选题) What is the news mainly about?";
const s1Opts = [
  ["A", "A vaccine proved to be effective against Ebola."],
  ["B", "A dangerous virus was found in Liberia."],
  ["C", "A disease killed more than 10,000 people in Sierra Leone."],
  ["D", "A new weapon called \"the silver bullet\" was made in Norway."]
];
const s1RowEls = s1Opts.map(([letter, text]) => {
  const row = questionEl.appendChild(new MockNode("div", "clearfix ans-choice-item"));
  row.appendChild(new MockNode("span", "num_option", letter));
  row.appendChild(new MockNode("p", "answer_p", text));
  return row;
});

const sub2Box = questionEl.appendChild(new MockNode("div", "sub_title"));
const sub2Tit = sub2Box.appendChild(new MockNode("p", "sub_question_title", "(2) (单选题) The ________ says the vaccine has been 100 percent effective at test performed in Guinea."));
sub2Box.textContent = "(2) (单选题) The ________ says the vaccine has been 100 percent effective at test performed in Guinea.";
const s2Opts = [
  ["A", "World Trade Organization"],
  ["B", "World Health Organization"],
  ["C", "World Food Program"],
  ["D", "World Tourism Organization"]
];
const s2RowEls = s2Opts.map(([letter, text]) => {
  const row = questionEl.appendChild(new MockNode("div", "clearfix ans-choice-item"));
  row.appendChild(new MockNode("span", "num_option", letter));
  row.appendChild(new MockNode("p", "answer_p", text));
  return row;
});

const sub3Box = questionEl.appendChild(new MockNode("div", "sub_title"));
const sub3Tit = sub3Box.appendChild(new MockNode("p", "sub_question_title", "(3) (单选题) Ebola spread through ________ last year.The disease killed more than ________ people."));
sub3Box.textContent = "(3) (单选题) Ebola spread through ________ last year.The disease killed more than ________ people.";
const s3Opts = [
  ["A", "East Africa; 11,000"],
  ["B", "West Africa; 13,000"],
  ["C", "West Africa; 11,000"],
  ["D", "East Africa; 13,000"]
];
const s3RowEls = s3Opts.map(([letter, text]) => {
  const row = questionEl.appendChild(new MockNode("div", "clearfix ans-choice-item"));
  row.appendChild(new MockNode("span", "num_option", letter));
  row.appendChild(new MockNode("p", "answer_p", text));
  return row;
});

console.log("Mock DOM 构建完成，包含 1 道大题、3 个小题标题节点、12 个选项节点。");

// 引入脚本中更新后的逻辑函数
const getOptionLabel = (optionElement) => {
  if (!optionElement) return "";
  const numEl = optionElement.matches(".num_option, .num_option_dx, .Cy_circle")
    ? optionElement
    : optionElement.querySelector(".num_option, .num_option_dx, .Cy_circle");
  if (numEl && numEl.textContent) {
    const txt = numEl.textContent.trim().toUpperCase();
    if (/^[A-Za-z]$/.test(txt)) return txt;
  }
  return "";
};

const queryOptionElements = (container) => {
  if (!container) return [];
  const optionIndicators = Array.from(container.querySelectorAll(".num_option, .num_option_dx, .Cy_circle")).filter((el) => {
    const text = (el.textContent || "").trim();
    return /^[A-Za-z]$/.test(text) || el.classList.contains("num_option") || el.classList.contains("Cy_circle");
  });
  if (optionIndicators.length > 0) {
    const seen = new Set();
    const rows = [];
    for (const ind of optionIndicators) {
      const row = ind.closest("div.clearfix, li, label") || ind.parentElement || ind;
      if (row && !seen.has(row) && row !== container) {
        seen.add(row);
        rows.push(row);
      }
    }
    if (rows.length > 0) return rows;
  }
  return [];
};

const extractOptions = (optionElements) => {
  const optionsObject = {};
  const optionTexts = [];
  (optionElements || []).forEach((optionElement) => {
    let textEl = optionElement.querySelector(".answer_p, p");
    let optionTextContent = textEl ? textEl.textContent.trim() : "";
    if (optionTextContent) {
      optionsObject[optionTextContent] = optionElement;
      optionTexts.push(optionTextContent);
    }
    const optLabel = getOptionLabel(optionElement);
    if (optLabel && !optionsObject[optLabel]) {
      optionsObject[optLabel] = optionElement;
    }
  });
  return [optionsObject, optionTexts];
};

const safeClickOption = (optionElement) => {
  if (!optionElement) return;
  const radio = (optionElement.matches && optionElement.matches("input[type='radio'], input[type='checkbox']"))
    ? optionElement
    : (optionElement.querySelector ? optionElement.querySelector("input[type='radio'], input[type='checkbox']") : null);

  if (radio && radio.checked) return;
  if (optionElement.getAttribute && optionElement.getAttribute("aria-checked") === "true") return;
  if (optionElement.classList && optionElement.classList.contains("check_answer")) return;

  const circle = optionElement.querySelector
    ? optionElement.querySelector(".num_option, .num_option_dx, .Cy_circle, a.Cy_circle, span.Cy_circle")
    : null;
  const clickable = circle || radio || optionElement;

  try {
    clickable.click();
  } catch (e) {}

  const isSelectedNow = () => {
    if (radio && radio.checked) return true;
    if (optionElement.getAttribute && optionElement.getAttribute("aria-checked") === "true") return true;
    if (optionElement.classList && optionElement.classList.contains("check_answer")) return true;
    if (optionElement.querySelector && optionElement.querySelector(".check_answer")) return true;
    return false;
  };

  if (!isSelectedNow() && optionElement && optionElement !== clickable) {
    try {
      optionElement.click();
    } catch (e) {}
  }
};

const findMatchedOption = (options, answer) => {
  const rawAns = String(answer || "").trim();
  if (options[rawAns]) return options[rawAns];
  for (const [k, v] of Object.entries(options)) {
    if (k.includes(rawAns) || rawAns.includes(k)) return v;
  }
  return null;
};

// 1. 测试选项提取
const matchedOptions = queryOptionElements(questionEl);
console.log(`[PASS 1] 选项识别: 共抓取到 ${matchedOptions.length} 个选项行容器（期望 12 个）`);
if (matchedOptions.length !== 12) process.exit(1);

// 2. 测试小题标题与分组（含父子嵌套与重复编号去重）
let headingElements = Array.from(questionEl.querySelectorAll(
  ".reader_answer_tit, .sub_question_title, .subQuestionTit, [class*='sub_title'], [class*='subQuestion'], [class*='tit'], p, div, span, b, strong, h4, h5"
)).filter((el) => {
  if (el.children.length > 3) return false;
  if (el.closest(".answerBg, .num_option, .Cy_circle, [data-option]")) return false;
  const text = (el.textContent || "").trim();
  return /^[（\(]\s*\d+\s*[）\)]/.test(text) || /^\d+[\.、]\s*[（\(]?(单选题|多选题|判断题)/.test(text);
});

// A. 剔除包含其它候选节点的父节点，只保留最深层标题节点
headingElements = headingElements.filter((el) => !headingElements.some((other) => other !== el && el.contains(other)));

// B. 按提取出的数字序号严格去重，每道小题只保留一个唯一标题节点
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

// C. 按文档位置正序排列
headingElements.sort((a, b) => (a.compareDocumentPosition(b) & 4 ? -1 : 1));

console.log(`[PASS 2] 小题识别: 识别出 ${headingElements.length} 道小题标题节点（严格去重后期望 3 个）`);
if (headingElements.length !== 3) {
  console.error(`去重失败！实际数量: ${headingElements.length}`);
  process.exit(1);
}

// 3. 测试 DOM Range Partitioning 分组
const buckets = Array.from({ length: headingElements.length }, () => []);
matchedOptions.forEach((opt) => {
  let targetIdx = -1;
  for (let h = headingElements.length - 1; h >= 0; h--) {
    const head = headingElements[h];
    if (head === opt || (head.compareDocumentPosition(opt) & 4)) {
      targetIdx = h;
      break;
    }
  }
  if (targetIdx >= 0) buckets[targetIdx].push(opt);
});

const validBuckets = buckets.filter((b) => b.length > 0);
let subOptionGroups = [];
if (validBuckets.length === headingElements.length) {
  subOptionGroups = validBuckets.map((group) => {
    const [optsObj] = extractOptions(group);
    return optsObj;
  });
}

console.log(`[PASS 3] 范围切分: 成功切分为 ${subOptionGroups.length} 组独立选项字典`);
subOptionGroups.forEach((group, idx) => {
  const keys = Object.keys(group);
  console.log(`  小题 (${idx + 1}): 包含选项键 [${keys.join(", ")}]`);
});

// 4. 模拟 API 返回超长干扰答案（例如模型吐出 8 项，含后续多余的填空或字母）
// 必须验证：后续越界的答案绝不污染、绝不覆盖前面的小题！
const modelAnswers = [
  "A vaccine proved to be effective against Ebola.", // 第1题选 A
  "World Health Organization",                       // 第2题选 B
  "West Africa; 11,000",                             // 第3题选 C
  "A", "B", "C", "D", "inflammation"                // 多余的干扰项
];

const [questionOptions] = extractOptions(matchedOptions);

// 模拟 fillQuestion 逻辑
modelAnswers.forEach((subAns, index) => {
  if (index >= subOptionGroups.length) return; // 严禁越界干扰！
  const subOpts = subOptionGroups[index];
  let targetOpt = subOpts ? findMatchedOption(subOpts, subAns) : null;
  if (targetOpt) {
    safeClickOption(targetOpt);
  }
});

// 验证点击状态
const s1A = s1RowEls[0]; // 第1题 A
const s2B = s2RowEls[1]; // 第2题 B
const s3C = s3RowEls[2]; // 第3题 C

console.log(`[PASS 4] 点击验证:`);
console.log(`  第1题 A 选项点击: ${s1A.querySelector(".num_option").clicked}, 行选中: ${s1A.classList.contains("check_answer")}`);
console.log(`  第2题 B 选项点击: ${s2B.querySelector(".num_option").clicked}, 行选中: ${s2B.classList.contains("check_answer")}`);
console.log(`  第3题 C 选项点击: ${s3C.querySelector(".num_option").clicked}, 行选中: ${s3C.classList.contains("check_answer")}`);

if (s1A.classList.contains("check_answer") && s2B.classList.contains("check_answer") && s3C.classList.contains("check_answer")) {
  console.log("\n>>> 全部前端 DOM 解析、分组与模拟点击测试 100% 通过！ <<<");
} else {
  console.error("点击验证未全部通过！");
  process.exit(1);
}
