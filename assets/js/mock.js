(function () {
  "use strict";

  const MOCK_QUESTION_COUNT = 160;
  const MOCK_DURATION_SEC = 100 * 60;
  const store = window.GKEN_STORE;
  const ui = window.GKEN_LEARNING;
  const keys = ["A", "B", "C", "D"];
  const state = { questions: [], pool: [], answers: {}, flags: {}, index: 0, startedAt: 0, deadline: 0, timer: null, submitted: false };

  const els = {
    setup: document.getElementById("mockSetup"),
    stage: document.getElementById("mockStage"),
    result: document.getElementById("mockResult"),
    start: document.getElementById("mockStart"),
    timer: document.getElementById("mockTimer"),
    meta: document.getElementById("mockMeta"),
    question: document.getElementById("mockQuestion"),
    options: document.getElementById("mockOptions"),
    palette: document.getElementById("mockPalette"),
    prev: document.getElementById("mockPrev"),
    next: document.getElementById("mockNext"),
    submit: document.getElementById("mockSubmit"),
    flag: document.getElementById("mockFlag")
  };

  function byCategory() {
    const groups = {};
    state.questions.forEach((q) => {
      groups[q.cat] = groups[q.cat] || [];
      groups[q.cat].push(q);
    });
    return groups;
  }

  function buildPool() {
    const groups = byCategory();
    const total = state.questions.length;
    let pool = [];
    Object.values(groups).forEach((items) => {
      const count = Math.max(1, Math.round(items.length / total * MOCK_QUESTION_COUNT));
      pool = pool.concat(ui.shuffle(items).slice(0, count));
    });
    pool = ui.shuffle(pool).slice(0, Math.min(MOCK_QUESTION_COUNT, state.questions.length));
    state.pool = pool.map(ui.prepareQuestion);
  }

  function start() {
    buildPool();
    state.answers = {};
    state.flags = {};
    state.index = 0;
    state.startedAt = Date.now();
    state.deadline = state.startedAt + MOCK_DURATION_SEC * 1000;
    state.submitted = false;
    els.setup.hidden = true;
    els.result.hidden = true;
    els.stage.hidden = false;
    tick();
    state.timer = setInterval(tick, 1000);
    render();
  }

  function tick() {
    const remaining = Math.max(0, Math.ceil((state.deadline - Date.now()) / 1000));
    els.timer.textContent = ui.formatTime(remaining);
    els.timer.classList.toggle("is-warning", remaining <= 600);
    if (remaining <= 0 && !state.submitted) submit(false);
  }

  function render() {
    const item = state.pool[state.index];
    const qid = item.id;
    els.meta.innerHTML = `${state.index + 1} / ${state.pool.length} ・ ${ui.escapeHtml(item.base.cat)} ${ui.bookmarkButton(item.base, "compact-bookmark")}`;
    els.question.textContent = item.base.q;
    els.options.innerHTML = "";
    item.options.forEach((option, index) => {
      const label = document.createElement("label");
      label.className = "mock-option";
      label.innerHTML = `<input type="radio" name="mockAnswer" value="${index}" ${state.answers[qid] === index ? "checked" : ""}><span>${keys[index]}</span><strong>${ui.escapeHtml(option.text)}</strong>`;
      label.querySelector("input").addEventListener("change", () => {
        state.answers[qid] = index;
        renderPalette();
      });
      els.options.append(label);
    });
    els.flag.classList.toggle("is-active", Boolean(state.flags[qid]));
    els.prev.disabled = state.index === 0;
    els.next.disabled = state.index === state.pool.length - 1;
    ui.bindBookmarks(els.meta);
    renderPalette();
  }

  function renderPalette() {
    els.palette.innerHTML = state.pool.map((item, index) => {
      const id = item.id;
      const answered = Object.hasOwn(state.answers, id);
      const flagged = state.flags[id];
      return `<button type="button" class="palette-button${index === state.index ? " is-current" : ""}${answered ? " is-answered" : ""}${flagged ? " is-flagged" : ""}" data-index="${index}">${index + 1}</button>`;
    }).join("");
    els.palette.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        state.index = Number(button.dataset.index);
        render();
      });
    });
  }

  function submit(confirmNeeded = true) {
    if (state.submitted) return;
    if (confirmNeeded && !confirm("模試を提出して採点しますか。")) return;
    state.submitted = true;
    clearInterval(state.timer);
    let correct = 0;
    const byCat = {};
    const wrongs = [];
    state.pool.forEach((item) => {
      const chosen = state.answers[item.id];
      const ok = chosen === item.answer;
      if (ok) correct += 1;
      else wrongs.push(item.base);
      byCat[item.base.cat] = byCat[item.base.cat] || { total: 0, correct: 0 };
      byCat[item.base.cat].total += 1;
      byCat[item.base.cat].correct += ok ? 1 : 0;
      store.recordAnswer(item.base, ok);
      store.updateSrs(item.base, ok);
    });
    const durationSec = Math.round((Date.now() - state.startedAt) / 1000);
    store.addExam({ date: Date.now(), total: state.pool.length, correct, durationSec, byCat });
    els.stage.hidden = true;
    els.result.hidden = false;
    const rate = Math.round(correct / state.pool.length * 100);
    els.result.innerHTML = `<h2>${rate}%</h2><p>${correct}/${state.pool.length}問 正解・所要${Math.round(durationSec / 60)}分</p><p>${rate >= 70 ? "合格圏の目安です。" : "弱点カテゴリを復習しましょう。"} これは学習用の目安で、公式合格基準とは異なります。</p>
      <div class="category-result">${Object.entries(byCat).map(([cat, item]) => {
        const pct = Math.round(item.correct / item.total * 100);
        return `<article class="stat-row"><div><strong>${ui.escapeHtml(cat)}</strong><small>${item.correct}/${item.total}問</small></div><div class="stat-bar"><span style="width:${pct}%"></span></div><b>${pct}%</b></article>`;
      }).join("")}</div>
      <div class="practice-toolbar"><a class="primary-button" href="../review/index.html">間違いを復習</a><button class="ghost-button" type="button" id="mockAgain">もう一度模試</button></div>`;
    document.getElementById("mockAgain").addEventListener("click", start);
  }

  async function init() {
    ui.setupTheme();
    state.questions = (await fetch("../content/gtest-questions.json").then((r) => r.json())).map((q) => ({ ...q, id: store.questionId(q) }));
    els.start.addEventListener("click", start);
    els.prev.addEventListener("click", () => { state.index = Math.max(0, state.index - 1); render(); });
    els.next.addEventListener("click", () => { state.index = Math.min(state.pool.length - 1, state.index + 1); render(); });
    els.submit.addEventListener("click", () => submit(true));
    els.flag.addEventListener("click", () => {
      const id = state.pool[state.index].id;
      state.flags[id] = !state.flags[id];
      if (!state.flags[id]) delete state.flags[id];
      render();
    });
    document.getElementById("mockConfig").textContent = `${MOCK_QUESTION_COUNT}問 / 100分`;
  }

  init().catch((error) => {
    els.setup.innerHTML = "<p>模試を読み込めませんでした。</p>";
    console.error(error);
  });
})();
