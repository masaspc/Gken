(function () {
  "use strict";

  const storageKey = "gken-progress-v1";
  const data = window.GKEN_DATA;
  let activeModuleId = "ml-overview";
  let quizSet = [];

  function loadProgress() {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || { completed: {}, scores: {} };
    } catch (error) {
      return { completed: {}, scores: {} };
    }
  }

  function saveProgress(progress) {
    localStorage.setItem(storageKey, JSON.stringify(progress));
  }

  function moduleById(id) {
    return data.modules.find((module) => module.id === id) || data.modules[0];
  }

  function renderModules() {
    const grid = document.getElementById("moduleGrid");
    const progress = loadProgress();
    grid.innerHTML = "";
    data.modules.forEach((module, index) => {
      const complete = Boolean(progress.completed[module.id]);
      const score = progress.scores[module.id] || 0;
      const button = document.createElement("button");
      button.type = "button";
      button.className = `module-card${module.id === activeModuleId ? " is-active" : ""}`;
      button.innerHTML = `
        <span class="section-kicker">${String(index + 1).padStart(2, "0")}</span>
        <h3>${module.title}</h3>
        <p>${module.focus}</p>
        <div class="module-meta"><span>${module.minutes}分</span><span>${complete ? "完了" : "未完了"} / ${score}%</span></div>
        <div class="progress-track" aria-hidden="true"><div class="progress-fill" style="width:${complete ? 100 : score}%"></div></div>
      `;
      button.addEventListener("click", () => {
        activeModuleId = module.id;
        renderAll();
        document.getElementById("today").scrollIntoView({ behavior: "smooth", block: "start" });
      });
      grid.append(button);
    });
  }

  function renderDetail() {
    const module = moduleById(activeModuleId);
    const detail = document.getElementById("moduleDetail");
    detail.innerHTML = `
      <h3>${module.title}</h3>
      <p>${module.focus}</p>
      <div class="tag-list">${module.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
      <div class="detail-grid">
        <article>
          <h3>学習目標</h3>
          <p>${module.outcome}</p>
        </article>
        <article>
          <h3>使う図解</h3>
          <p>${module.visual}</p>
        </article>
        <article>
          <h3>確認方法</h3>
          <p>独自の多肢選択・数値入力・図操作課題で、理解をその場で確認します。</p>
        </article>
      </div>
    `;
    document.getElementById("nextMinutes").textContent = `${module.minutes}分`;
  }

  function renderSummary() {
    const progress = loadProgress();
    const completed = Object.values(progress.completed).filter(Boolean).length;
    const scores = Object.values(progress.scores);
    const average = scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
    document.getElementById("completedModules").textContent = completed;
    document.getElementById("averageScore").textContent = `${average}%`;
  }

  function pickQuiz() {
    const moduleQuestions = data.questionBank.filter((question) => question.module === activeModuleId);
    const fallback = data.questionBank.filter((question) => question.module !== activeModuleId);
    quizSet = [...moduleQuestions, ...fallback].slice(0, 4);
  }

  function renderQuiz() {
    const area = document.getElementById("quizArea");
    area.innerHTML = "";
    quizSet.forEach((question, index) => {
      const card = document.createElement("article");
      card.className = "quiz-card";
      if (question.type === "numeric") {
        card.innerHTML = `
          <h3>Q${index + 1}. ${question.prompt}</h3>
          <label class="control-field"><span>回答</span><input type="number" data-question="${question.id}" step="0.01"></label>
        `;
      } else {
        card.innerHTML = `
          <h3>Q${index + 1}. ${question.prompt}</h3>
          <fieldset>
            ${question.options.map((option) => `
              <label class="quiz-option">
                <input type="radio" name="${question.id}" value="${option}">
                <span>${option}</span>
              </label>
            `).join("")}
          </fieldset>
        `;
      }
      area.append(card);
    });
    document.getElementById("quizResult").textContent = "";
  }

  function gradeQuiz() {
    let correct = 0;
    const explanations = [];
    quizSet.forEach((question) => {
      let ok = false;
      if (question.type === "numeric") {
        const input = document.querySelector(`[data-question="${question.id}"]`);
        const value = Number(input.value);
        ok = Math.abs(value - question.answer) <= question.tolerance;
      } else {
        const selected = document.querySelector(`input[name="${question.id}"]:checked`);
        ok = selected ? selected.value === question.answer : false;
      }
      if (ok) correct += 1;
      explanations.push(`${ok ? "正解" : "確認"}: ${question.explanation}`);
    });
    const score = Math.round((correct / quizSet.length) * 100);
    const progress = loadProgress();
    progress.scores[activeModuleId] = Math.max(progress.scores[activeModuleId] || 0, score);
    saveProgress(progress);
    document.getElementById("quizResult").innerHTML = `${correct}/${quizSet.length}問正解、${score}%です。<br>${explanations.join("<br>")}`;
    renderSummary();
    renderModules();
  }

  function renderGlossary() {
    const list = document.getElementById("glossaryList");
    const query = document.getElementById("glossarySearch").value.trim().toLowerCase();
    const terms = data.glossary.filter((item) => `${item.term} ${item.body}`.toLowerCase().includes(query));
    list.innerHTML = terms.map((item) => `<article><h3>${item.term}</h3><p>${item.body}</p></article>`).join("");
  }

  function completeModule() {
    const progress = loadProgress();
    progress.completed[activeModuleId] = true;
    saveProgress(progress);
    renderAll();
  }

  function resetProgress() {
    localStorage.removeItem(storageKey);
    renderAll();
  }

  function setupTheme() {
    const saved = localStorage.getItem("gken-theme");
    if (saved) document.documentElement.dataset.theme = saved;
    document.getElementById("themeToggle").addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      localStorage.setItem("gken-theme", next);
      window.GKEN_VISUALS.render();
    });
  }

  function renderAll() {
    renderSummary();
    renderModules();
    renderDetail();
    pickQuiz();
    renderQuiz();
  }

  function setup() {
    setupTheme();
    document.getElementById("completeModule").addEventListener("click", completeModule);
    document.getElementById("resetProgress").addEventListener("click", resetProgress);
    document.getElementById("gradeQuiz").addEventListener("click", gradeQuiz);
    document.getElementById("newQuiz").addEventListener("click", () => {
      data.questionBank.push(data.questionBank.shift());
      pickQuiz();
      renderQuiz();
    });
    document.getElementById("glossarySearch").addEventListener("input", renderGlossary);
    renderAll();
    renderGlossary();
    window.GKEN_VISUALS.setup();
  }

  document.addEventListener("DOMContentLoaded", setup);
})();
