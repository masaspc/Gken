(function () {
  "use strict";

  const dataNode = document.getElementById("lessonData");
  if (!dataNode) return;

  const lesson = JSON.parse(dataNode.textContent);
  const storageKey = "gken-lesson-progress-v3";
  const canvas = document.getElementById("lessonCanvas");
  const svg = document.getElementById("lessonSvg");
  const controls = document.getElementById("lessonControls");
  const metrics = document.getElementById("lessonMetrics");
  const quizResult = document.getElementById("lessonQuizResult");
  const core = window.GKEN_VISUAL_CORE;
  const store = window.GKEN_STORE;

  const state = {
    mean: 50,
    sd: 14,
    samples: 160,
    noise: 20,
    slope: 1,
    bias: 18,
    threshold: 50,
    focus: 2,
    temperature: 1
  };

  function progress() {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || {};
    } catch (error) {
      return {};
    }
  }

  function saveProgress(next) {
    localStorage.setItem(storageKey, JSON.stringify(next));
  }

  function field(key, label, min, max, step) {
    const wrap = document.createElement("label");
    wrap.className = "control-field";
    wrap.innerHTML = `<span>${label}: <strong>${state[key]}</strong></span>`;
    const input = document.createElement("input");
    input.type = "range";
    input.min = min;
    input.max = max;
    input.step = step;
    input.value = state[key];
    input.addEventListener("input", () => {
      state[key] = Number(input.value);
      wrap.querySelector("strong").textContent = input.value;
      renderVisual();
    });
    wrap.append(input);
    controls.append(wrap);
  }

  function buildControls() {
    if (!controls || !lesson.visual || lesson.visual.type === "none") return;
    controls.innerHTML = "";
    const type = lesson.visual.type;
    if (type === "distribution") {
      field("mean", "平均", 20, 80, 1);
      field("sd", "標準偏差", 4, 28, 1);
      field("samples", "サンプル数", 40, 360, 10);
    }
    if (type === "regression") {
      field("noise", "ノイズ標準偏差", 0, 60, 1);
      field("slope", "傾き", -2, 3, 0.1);
      field("bias", "切片", -20, 60, 1);
    }
    if (type === "classification") {
      field("threshold", "しきい値", 20, 80, 1);
      field("slope", "境界の傾き", -2, 2, 0.1);
      field("bias", "境界の位置", -60, 60, 2);
    }
    if (type === "attention") {
      const maxFocus = Math.max(0, (lesson.visual.tokens || []).length - 1);
      field("focus", "Query token index", 0, maxFocus, 1);
      field("temperature", "softmax温度", 0.5, 2.5, 0.1);
    }
  }

  function renderVisual() {
    if (!lesson.visual || lesson.visual.type === "none" || !svg || !metrics) return;
    if (!core) {
      if (controls) controls.innerHTML = "<p>可視化エンジンを読み込めませんでした。</p>";
      return;
    }
    const out = { canvas, svg, metrics };
    const type = lesson.visual.type;
    if (type === "distribution") core.renderDistribution(out, state);
    if (type === "regression") core.renderRegression(out, state);
    if (type === "classification") core.renderClassification(out, state);
    if (type === "network") core.renderNetwork(out, lesson.visual);
    if (type === "attention") core.renderAttention(out, lesson.visual, state);
    if (type === "flow") core.renderFlow(out, lesson.visual);
    if (type === "comparison-table") core.renderComparisonTable(out, lesson.visual);
    if (type === "relation-table") core.renderRelationTable(out, lesson.visual);
  }

  function setupQuiz() {
    let quizGraded = false;
    document.getElementById("gradeLessonQuiz")?.addEventListener("click", () => {
      if (quizGraded) return;
      quizGraded = true;
      let score = 0;
      lesson.quiz.forEach((item) => {
        const card = document.querySelector(`[data-quiz-id="${item.id}"]`);
        const selected = document.querySelector(`input[name="${item.id}"]:checked`);
        const ok = selected && selected.value === item.answer;
        if (ok) score += 1;
        if (store && item.qid) {
          const question = { id: item.qid, cat: item.cat, q: item.q || item.prompt, c: item.c || item.options, a: item.a, e: item.e || item.explanation };
          store.recordAnswer(question, Boolean(ok));
          store.updateSrs(question, Boolean(ok));
        }

        card?.querySelectorAll(".quiz-option").forEach((option) => {
          const input = option.querySelector("input");
          option.classList.remove("is-correct", "is-wrong");
          if (!input) return;
          if (input.value === item.answer) option.classList.add("is-correct");
          if (selected && input === selected && input.value !== item.answer) option.classList.add("is-wrong");
          input.disabled = true;
        });

        const feedback = card?.querySelector(`[data-feedback-for="${item.id}"]`);
        if (feedback) {
          const status = ok ? "正解" : selected ? "不正解" : "未回答";
          feedback.className = `quiz-feedback ${ok ? "is-correct" : "is-wrong"}`;
          feedback.innerHTML = `<strong>${status}</strong><p>正解: ${escapeHtml(item.answer)}</p><p>${escapeHtml(stripTags(item.explanation || ""))}</p>`;
        }
      });
      const percent = Math.round((score / lesson.quiz.length) * 100);
      quizResult.textContent = `${score}/${lesson.quiz.length}問正解、${percent}%です。各問題の下に解説を表示しました。`;
    });
  }

  function stripTags(value) {
    return String(value).replace(/<[^>]*>/g, "");
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char]));
  }

  function setupProgress() {
    const button = document.getElementById("completeLesson");
    const stateLabel = document.getElementById("lessonProgressState");
    const current = progress();
    if (current[lesson.slug]) stateLabel.textContent = "完了済み";
    button?.addEventListener("click", () => {
      const next = progress();
      next[lesson.slug] = true;
      saveProgress(next);
      stateLabel.textContent = "完了済み";
    });
  }

  function setupTheme() {
    const saved = localStorage.getItem("gken-theme");
    if (saved) document.documentElement.dataset.theme = saved;
    document.getElementById("themeToggle")?.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      localStorage.setItem("gken-theme", next);
      renderVisual();
    });
  }

  buildControls();
  setupQuiz();
  setupProgress();
  setupTheme();
  renderVisual();
})();
