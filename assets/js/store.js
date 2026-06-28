(function () {
  "use strict";

  const keys = {
    lessons: "gken-lesson-progress-v3",
    srs: "gken-srs-v1",
    bookmarks: "gken-bookmarks-v1",
    stats: "gken-stats-v1",
    exams: "gken-exams-v1",
    plan: "gken-plan-v1",
    theme: "gken-theme"
  };

  const intervals = [0, 1, 3, 7, 14, 30];

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      localStorage.removeItem(key);
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    return value;
  }

  function hash(value) {
    let h = 2166136261;
    const text = String(value);
    for (let i = 0; i < text.length; i += 1) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return `q-${(h >>> 0).toString(16).padStart(8, "0")}`;
  }

  function questionId(question) {
    return question.id || hash(JSON.stringify([question.q, question.c]));
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function dayStart(date = new Date()) {
    const next = new Date(date);
    next.setHours(0, 0, 0, 0);
    return next.getTime();
  }

  function getLessons() {
    return read(keys.lessons, {});
  }

  function getSrs() {
    return read(keys.srs, {});
  }

  function setSrs(value) {
    return write(keys.srs, value);
  }

  function updateSrs(question, correct) {
    if (!question) return null;
    const id = questionId(question);
    const srs = getSrs();
    const current = srs[id] || { box: 0, due: Date.now(), seen: 0, correct: 0, wrong: 0, last: 0 };
    const box = correct ? Math.min(5, current.box + 1) : Math.max(0, current.box - 1);
    const due = dayStart(new Date(Date.now() + intervals[box] * 86400000));
    srs[id] = {
      box,
      due,
      seen: current.seen + 1,
      correct: current.correct + (correct ? 1 : 0),
      wrong: current.wrong + (correct ? 0 : 1),
      last: Date.now()
    };
    setSrs(srs);
    return srs[id];
  }

  function dueIds() {
    const now = Date.now();
    return Object.entries(getSrs()).filter(([, item]) => item.due <= now).map(([id]) => id);
  }

  function getBookmarks() {
    return read(keys.bookmarks, {});
  }

  function isBookmarked(id) {
    return Boolean(getBookmarks()[id]);
  }

  function toggleBookmark(id) {
    const bookmarks = getBookmarks();
    bookmarks[id] = !bookmarks[id];
    if (!bookmarks[id]) delete bookmarks[id];
    write(keys.bookmarks, bookmarks);
    return Boolean(bookmarks[id]);
  }

  function getStats() {
    return read(keys.stats, { days: {}, byCat: {}, answeredQuestions: {} });
  }

  function recordAnswer(question, correct) {
    if (!question) return;
    const stats = getStats();
    const date = today();
    stats.days[date] = stats.days[date] || { answered: 0, correct: 0 };
    stats.byCat[question.cat] = stats.byCat[question.cat] || { answered: 0, correct: 0 };
    stats.answeredQuestions = stats.answeredQuestions || {};
    stats.days[date].answered += 1;
    stats.days[date].correct += correct ? 1 : 0;
    stats.byCat[question.cat].answered += 1;
    stats.byCat[question.cat].correct += correct ? 1 : 0;
    stats.answeredQuestions[questionId(question)] = true;
    write(keys.stats, stats);
  }

  function getExams() {
    return read(keys.exams, []);
  }

  function addExam(record) {
    const exams = getExams();
    exams.unshift(record);
    write(keys.exams, exams.slice(0, 30));
  }

  function getPlan() {
    return read(keys.plan, {});
  }

  function setPlan(plan) {
    return write(keys.plan, plan);
  }

  function streak() {
    const days = Object.keys(getStats().days || {}).sort().reverse();
    let count = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    for (;;) {
      const key = cursor.toISOString().slice(0, 10);
      if (!days.includes(key)) break;
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }

  function exportData() {
    const payload = { version: 1, exportedAt: new Date().toISOString(), data: {} };
    Object.values(keys).filter((key) => key.startsWith("gken-")).forEach((key) => {
      payload.data[key] = localStorage.getItem(key);
    });
    return payload;
  }

  function importData(payload) {
    if (!payload || payload.version !== 1 || typeof payload.data !== "object") {
      throw new Error("対応していない進捗データです。");
    }
    Object.entries(payload.data).forEach(([key, value]) => {
      if (!key.startsWith("gken-")) return;
      if (value === null || value === undefined) localStorage.removeItem(key);
      else localStorage.setItem(key, String(value));
    });
  }

  window.GKEN_STORE = {
    keys,
    hash,
    questionId,
    read,
    write,
    getLessons,
    getSrs,
    setSrs,
    updateSrs,
    dueIds,
    getBookmarks,
    isBookmarked,
    toggleBookmark,
    getStats,
    recordAnswer,
    getExams,
    addExam,
    getPlan,
    setPlan,
    streak,
    exportData,
    importData,
    today
  };
})();
