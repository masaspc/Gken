(function () {
  "use strict";

  const store = window.GKEN_STORE;
  const ui = window.GKEN_LEARNING;
  const keys = ["A", "B", "C", "D"];
  const state = { questions: [], pool: [], index: 0, score: 0, answered: false };

  const els = {
    summary: document.getElementById("reviewSummary"),
    startDue: document.getElementById("startDueReview"),
    startBookmarks: document.getElementById("startBookmarkReview"),
    stage: document.getElementById("reviewStage"),
    setup: document.getElementById("reviewSetup"),
    meta: document.getElementById("reviewMeta"),
    question: document.getElementById("reviewQuestion"),
    options: document.getElementById("reviewOptions"),
    feedback: document.getElementById("reviewFeedback"),
    next: document.getElementById("reviewNext"),
    result: document.getElementById("reviewResult")
  };

  function renderSummary() {
    const due = new Set(store.dueIds());
    const bookmarks = store.getBookmarks();
    els.summary.innerHTML = `<article class="dashboard-metric"><strong>復習待ち</strong><span>${due.size}問</span><small>SRSの期限到来</small></article>
      <article class="dashboard-metric"><strong>ブックマーク</strong><span>${Object.keys(bookmarks).length}問</span><small>後で見直す</small></article>`;
  }

  function start(type) {
    const ids = type === "bookmarks" ? Object.keys(store.getBookmarks()) : store.dueIds();
    const set = new Set(ids);
    const candidates = state.questions.filter((q) => set.has(store.questionId(q)));
    if (!candidates.length) {
      els.result.hidden = false;
      els.result.innerHTML = `<p class="empty-state">${type === "bookmarks" ? "ブックマーク問題" : "今日の復習問題"}はありません。</p>`;
      return;
    }
    state.pool = ui.shuffle(candidates).slice(0, 40).map(ui.prepareQuestion);
    state.index = 0;
    state.score = 0;
    els.setup.hidden = true;
    els.result.hidden = true;
    els.stage.hidden = false;
    renderQuestion();
  }

  function renderQuestion() {
    const item = state.pool[state.index];
    state.answered = false;
    els.next.disabled = true;
    els.feedback.innerHTML = "";
    els.feedback.className = "practice-feedback";
    els.meta.innerHTML = `${state.index + 1} / ${state.pool.length} ・ ${ui.escapeHtml(item.base.cat)} ${ui.bookmarkButton(item.base, "compact-bookmark")}`;
    els.question.textContent = item.base.q;
    els.options.innerHTML = "";
    item.options.forEach((option, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "practice-option";
      button.innerHTML = `<span>${keys[index]}</span><strong>${ui.escapeHtml(option.text)}</strong>`;
      button.addEventListener("click", () => choose(index));
      els.options.append(button);
    });
    ui.bindBookmarks(els.meta);
  }

  function choose(index) {
    if (state.answered) return;
    state.answered = true;
    const item = state.pool[state.index];
    const ok = index === item.answer;
    if (ok) state.score += 1;
    store.recordAnswer(item.base, ok);
    store.updateSrs(item.base, ok);
    [...els.options.children].forEach((button, i) => {
      button.disabled = true;
      if (i === item.answer) button.classList.add("is-correct");
      if (i === index && !ok) button.classList.add("is-wrong");
    });
    els.feedback.classList.add(ok ? "is-correct" : "is-wrong");
    els.feedback.innerHTML = `<strong>${ok ? "正解" : "不正解"} / 正解: ${keys[item.answer]}</strong><p>${ui.sanitizeExplanation(item.base.e)}</p><p>${ui.relatedLink(item.base)}</p>`;
    els.next.disabled = false;
    renderSummary();
  }

  function next() {
    state.index += 1;
    if (state.index >= state.pool.length) {
      els.stage.hidden = true;
      els.result.hidden = false;
      const pct = Math.round(state.score / state.pool.length * 100);
      els.result.innerHTML = `<h2>${pct}%</h2><p>${state.score}/${state.pool.length}問 正解</p><p>復習履歴を更新しました。</p>`;
      return;
    }
    renderQuestion();
  }

  async function init() {
    ui.setupTheme();
    state.questions = (await fetch("../content/gtest-questions.json").then((r) => r.json())).map((q) => ({ ...q, id: store.questionId(q) }));
    renderSummary();
    els.startDue.addEventListener("click", () => start("due"));
    els.startBookmarks.addEventListener("click", () => start("bookmarks"));
    els.next.addEventListener("click", next);
  }

  init().catch((error) => {
    els.summary.innerHTML = "<p>復習データを読み込めませんでした。</p>";
    console.error(error);
  });
})();
