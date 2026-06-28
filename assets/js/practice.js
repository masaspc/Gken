(function () {
  "use strict";

  const store = window.GKEN_STORE;
  const ui = window.GKEN_LEARNING;
  const state = {
    questions: [],
    pool: [],
    index: 0,
    score: 0,
    selectedCats: new Set(),
    answered: false,
    wrongs: []
  };

  const els = {
    cats: document.getElementById("practiceCats"),
    count: document.getElementById("practiceCount"),
    start: document.getElementById("practiceStart"),
    stage: document.getElementById("practiceStage"),
    setup: document.getElementById("practiceSetup"),
    qMeta: document.getElementById("practiceMeta"),
    qText: document.getElementById("practiceQuestion"),
    opts: document.getElementById("practiceOptions"),
    feedback: document.getElementById("practiceFeedback"),
    next: document.getElementById("practiceNext"),
    result: document.getElementById("practiceResult"),
    retryWrong: document.getElementById("retryWrong"),
    restart: document.getElementById("practiceRestart")
  };

  const keys = ["A", "B", "C", "D"];

  function categories() {
    return [...new Set(state.questions.map((q) => q.cat))];
  }

  function renderCategories() {
    els.cats.innerHTML = "";
    state.selectedCats.clear();
    categories().forEach((cat) => {
      const count = state.questions.filter((q) => q.cat === cat).length;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "chip-button is-active";
      button.dataset.cat = cat;
      button.innerHTML = `${ui.escapeHtml(cat)} <span>${count}</span>`;
      button.addEventListener("click", () => {
        if (state.selectedCats.has(cat)) state.selectedCats.delete(cat);
        else state.selectedCats.add(cat);
        button.classList.toggle("is-active", state.selectedCats.has(cat));
        updateCount();
      });
      state.selectedCats.add(cat);
      els.cats.append(button);
    });
    updateCount();
  }

  function applyUrlFilters() {
    const params = new URLSearchParams(location.search);
    const cat = params.get("cat");
    if (!cat || !state.questions.some((q) => q.cat === cat)) return;
    state.selectedCats = new Set([cat]);
    els.cats.querySelectorAll(".chip-button").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.cat === cat);
    });
    updateCount();
  }

  function updateCount() {
    const total = state.questions.filter((q) => state.selectedCats.has(q.cat)).length;
    els.count.textContent = `${total}問から出題`;
  }

  function startQuiz(source) {
    const params = new URLSearchParams(location.search);
    let candidates = source || state.questions.filter((q) => state.selectedCats.has(q.cat));
    if (!source && params.get("bookmarks") === "1") {
      const bookmarks = store.getBookmarks();
      candidates = state.questions.filter((q) => bookmarks[store.questionId(q)]);
    }
    if (!candidates.length) {
      els.count.textContent = "出題できる問題がありません。";
      return;
    }
    state.pool = ui.shuffle(candidates).slice(0, Math.min(40, candidates.length)).map(ui.prepareQuestion);
    state.index = 0;
    state.score = 0;
    state.wrongs = [];
    els.setup.hidden = true;
    els.stage.hidden = false;
    els.result.hidden = true;
    renderQuestion();
  }

  function renderQuestion() {
    const item = state.pool[state.index];
    state.answered = false;
    els.feedback.innerHTML = "";
    els.feedback.className = "practice-feedback";
    els.next.disabled = true;
    els.qMeta.innerHTML = `${state.index + 1} / ${state.pool.length} ・ ${ui.escapeHtml(item.base.cat)} ${ui.bookmarkButton(item.base, "compact-bookmark")}`;
    els.qText.textContent = item.base.q;
    els.opts.innerHTML = "";
    item.options.forEach((option, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "practice-option";
      button.innerHTML = `<span>${keys[index]}</span><strong>${ui.escapeHtml(option.text)}</strong>`;
      button.addEventListener("click", () => choose(index));
      els.opts.append(button);
    });
    ui.bindBookmarks(els.qMeta);
  }

  function choose(index) {
    if (state.answered) return;
    state.answered = true;
    const item = state.pool[state.index];
    const ok = index === item.answer;
    if (ok) state.score += 1;
    else state.wrongs.push(item.base);
    store.recordAnswer(item.base, ok);
    store.updateSrs(item.base, ok);
    [...els.opts.children].forEach((button, i) => {
      button.disabled = true;
      if (i === item.answer) button.classList.add("is-correct");
      if (i === index && !ok) button.classList.add("is-wrong");
    });
    els.feedback.classList.add(ok ? "is-correct" : "is-wrong");
    els.feedback.innerHTML = `<strong>${ok ? "正解" : "不正解"} / 正解: ${keys[item.answer]}</strong><p>${ui.sanitizeExplanation(item.base.e)}</p><p>${ui.relatedLink(item.base)}</p>`;
    els.next.disabled = false;
  }

  function next() {
    if (!state.answered) return;
    state.index += 1;
    if (state.index >= state.pool.length) {
      finish();
      return;
    }
    renderQuestion();
  }

  function finish() {
    const percent = Math.round((state.score / state.pool.length) * 100);
    els.stage.hidden = true;
    els.result.hidden = false;
    els.result.innerHTML = `<h2>${percent}%</h2><p>${state.score} / ${state.pool.length}問 正解</p><p>${percent >= 70 ? "よい調子です。間違えた問題だけ復習して仕上げましょう。" : "解説を読んで、弱点カテゴリをもう一度解き直しましょう。"}</p><p><a href="../review/index.html">今日の復習を開く</a></p>`;
    els.retryWrong.disabled = state.wrongs.length === 0;
  }

  async function init() {
    ui.setupTheme();
    const response = await fetch("../content/gtest-questions.json");
    state.questions = (await response.json()).map((q) => ({ ...q, id: store.questionId(q) }));
    renderCategories();
    applyUrlFilters();
    if (new URLSearchParams(location.search).get("bookmarks") === "1") {
      els.count.textContent = "ブックマーク問題から出題します";
    }
    els.start.addEventListener("click", () => startQuiz());
    els.next.addEventListener("click", next);
    els.retryWrong.addEventListener("click", () => startQuiz(state.wrongs));
    els.restart.addEventListener("click", () => {
      els.setup.hidden = false;
      els.stage.hidden = true;
      els.result.hidden = true;
    });
  }

  init().catch((error) => {
    els.count.textContent = "問題データを読み込めませんでした。";
    console.error(error);
  });
})();
