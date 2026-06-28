(function () {
  "use strict";

  const store = window.GKEN_STORE;
  const ui = window.GKEN_LEARNING;
  const els = {
    metrics: document.getElementById("dashboardMetrics"),
    cats: document.getElementById("categoryStats"),
    exams: document.getElementById("examHistory"),
    plan: document.getElementById("planSummary"),
    examDate: document.getElementById("examDate"),
    savePlan: document.getElementById("savePlan"),
    exportBtn: document.getElementById("exportProgress"),
    importFile: document.getElementById("importProgress"),
    importStatus: document.getElementById("importStatus")
  };

  let syllabus = [];
  let questions = [];

  function percent(correct, answered) {
    return answered ? Math.round((correct / answered) * 100) : 0;
  }

  function renderMetrics() {
    const lessons = store.getLessons();
    const stats = store.getStats();
    const lessonTotal = syllabus.reduce((sum, chapter) => sum + chapter.lessons.length, 0);
    const done = Object.values(lessons).filter(Boolean).length;
    const answered = Object.keys(stats.answeredQuestions || {}).length;
    const due = store.dueIds().length;
    els.metrics.innerHTML = [
      ["レッスン完了", `${done}/${lessonTotal}`, lessonTotal ? `${Math.round(done / lessonTotal * 100)}%` : "0%"],
      ["問題カバレッジ", `${answered}/${questions.length}`, questions.length ? `${Math.round(answered / questions.length * 100)}%` : "0%"],
      ["復習待ち", `${due}問`, "今日の復習"],
      ["連続学習", `${store.streak()}日`, "localStorage集計"]
    ].map(([label, value, note]) => `<article class="dashboard-metric"><strong>${label}</strong><span>${value}</span><small>${note}</small></article>`).join("");
  }

  function renderCats() {
    const byCat = store.getStats().byCat || {};
    const cats = [...new Set(questions.map((q) => q.cat))];
    els.cats.innerHTML = cats.map((cat) => {
      const item = byCat[cat] || { answered: 0, correct: 0 };
      const rate = percent(item.correct, item.answered);
      const weak = item.answered >= 3 && rate < 70;
      return `<article class="stat-row${weak ? " is-weak" : ""}">
        <div><strong>${ui.escapeHtml(cat)}</strong><small>${item.correct}/${item.answered}問 正解</small></div>
        <div class="stat-bar"><span style="width:${rate}%"></span></div>
        <b>${item.answered ? `${rate}%` : "未着手"}</b>
      </article>`;
    }).join("");
  }

  function renderExams() {
    const exams = store.getExams();
    els.exams.innerHTML = exams.length
      ? exams.slice(0, 6).map((exam) => `<article class="exam-row"><strong>${new Date(exam.date).toLocaleDateString("ja-JP")}</strong><span>${exam.correct}/${exam.total}問・${Math.round(exam.correct / exam.total * 100)}%</span><small>${Math.round(exam.durationSec / 60)}分</small></article>`).join("")
      : `<p class="empty-state">模試履歴はまだありません。</p>`;
  }

  function renderPlan() {
    const plan = store.getPlan();
    if (plan.examDate) els.examDate.value = plan.examDate;
    if (!plan.examDate) {
      els.plan.textContent = "受験日を入力すると、今日の目安を表示します。";
      return;
    }
    const target = new Date(`${plan.examDate}T00:00:00`);
    const days = Math.ceil((target.getTime() - Date.now()) / 86400000);
    if (days < 0) {
      els.plan.textContent = "設定した試験日は過ぎています。次の受験日に更新してください。";
      return;
    }
    const done = Object.values(store.getLessons()).filter(Boolean).length;
    const total = syllabus.reduce((sum, chapter) => sum + chapter.lessons.length, 0);
    const remainingLessons = Math.max(0, total - done);
    const answered = Object.keys(store.getStats().answeredQuestions || {}).length;
    const remainingQuestions = Math.max(0, questions.length - answered);
    const due = store.dueIds().length;
    const denom = Math.max(days, 1);
    els.plan.textContent = `残り${days}日。今日の目安: レッスン${Math.ceil(remainingLessons / denom)}件 / 復習${Math.min(due, 30)}問 / 新規${Math.ceil(remainingQuestions / denom)}問。`;
  }

  function setupExportImport() {
    els.exportBtn.addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(store.exportData(), null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gken-progress-${store.today()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
    els.importFile.addEventListener("change", async () => {
      const file = els.importFile.files[0];
      if (!file) return;
      try {
        store.importData(JSON.parse(await file.text()));
        els.importStatus.textContent = "インポートしました。表示を更新します。";
        renderAll();
      } catch (error) {
        els.importStatus.textContent = `インポートできません: ${error.message}`;
      }
    });
  }

  function renderAll() {
    renderMetrics();
    renderCats();
    renderExams();
    renderPlan();
  }

  async function init() {
    ui.setupTheme();
    [syllabus, questions] = await Promise.all([
      fetch("../content/syllabus-map.json").then((r) => r.json()),
      fetch("../content/gtest-questions.json").then((r) => r.json())
    ]);
    els.savePlan.addEventListener("click", () => {
      store.setPlan({ examDate: els.examDate.value });
      renderPlan();
    });
    setupExportImport();
    renderAll();
  }

  init().catch((error) => {
    els.metrics.innerHTML = `<p class="empty-state">ダッシュボードを読み込めませんでした。</p>`;
    console.error(error);
  });
})();
