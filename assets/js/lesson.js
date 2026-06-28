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
    if (["network", "flow", "comparison-table", "relation-table"].includes(type)) {
      controls.innerHTML = `<p class="control-note">このテーマは数値を操作せず、構造・対応関係・判断順序を読む図表です。</p>`;
    }
  }

  function renderVisual() {
    if (!core) {
      controls.innerHTML = "<p>可視化エンジンを読み込めませんでした。</p>";
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
    document.getElementById("gradeLessonQuiz")?.addEventListener("click", () => {
      let score = 0;
      const feedback = [];
      lesson.quiz.forEach((item) => {
        const selected = document.querySelector(`input[name="${item.id}"]:checked`);
        const ok = selected && selected.value === item.answer;
        if (ok) score += 1;
        feedback.push(`${ok ? "正解" : "確認"}: ${stripTags(item.explanation || "")}`);
      });
      const percent = Math.round((score / lesson.quiz.length) * 100);
      quizResult.innerHTML = `${score}/${lesson.quiz.length}問正解、${percent}%です。<br>${feedback.join("<br>")}`;
    });
  }

  function stripTags(value) {
    return String(value).replace(/<[^>]*>/g, "");
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
