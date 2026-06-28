(function () {
  "use strict";

  const catLinks = {
    "第1章": "../chapters/ai-basics/index.html",
    "第2章": "../chapters/ai-history/index.html",
    "第3章": "../chapters/ml-overview/index.html",
    "第4章": "../chapters/dl-overview/index.html",
    "第5章": "../chapters/dl-elements/index.html",
    "第6章": "../chapters/applications/index.html",
    "第7章": "../chapters/implementation/index.html",
    "第8章": "../chapters/law-contract/index.html",
    "第9章": "../chapters/math-stats/index.html"
  };

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char]));
  }

  function sanitizeExplanation(html) {
    return String(html)
      .replace(/<(?!\/?b\b)[^>]*>/g, "")
      .replace(/\son\w+="[^"]*"/g, "");
  }

  function shuffle(items) {
    const next = [...items];
    for (let i = next.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
    return next;
  }

  function prepareQuestion(question) {
    const options = question.c.map((text, index) => ({ text, correct: index === question.a }));
    const shuffled = shuffle(options);
    return {
      base: question,
      id: window.GKEN_STORE.questionId(question),
      options: shuffled,
      answer: shuffled.findIndex((option) => option.correct)
    };
  }

  function chapterHref(cat) {
    const key = Object.keys(catLinks).find((prefix) => String(cat).startsWith(prefix));
    return key ? catLinks[key] : "../index.html";
  }

  function relatedLink(question) {
    return `<a href="${chapterHref(question.cat)}">関連章で学び直す</a>`;
  }

  function setupTheme() {
    const saved = localStorage.getItem("gken-theme");
    if (saved) document.documentElement.dataset.theme = saved;
    document.getElementById("themeToggle")?.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      localStorage.setItem("gken-theme", next);
    });
  }

  function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }

  function bookmarkButton(question, extraClass = "") {
    const id = window.GKEN_STORE.questionId(question);
    const active = window.GKEN_STORE.isBookmarked(id);
    return `<button class="bookmark-button ${extraClass}${active ? " is-active" : ""}" type="button" data-bookmark="${id}" aria-label="問題をブックマーク">${active ? "★" : "☆"}</button>`;
  }

  function bindBookmarks(root = document) {
    root.querySelectorAll("[data-bookmark]").forEach((button) => {
      button.addEventListener("click", () => {
        const active = window.GKEN_STORE.toggleBookmark(button.dataset.bookmark);
        button.classList.toggle("is-active", active);
        button.textContent = active ? "★" : "☆";
      });
    });
  }

  window.GKEN_LEARNING = {
    escapeHtml,
    sanitizeExplanation,
    shuffle,
    prepareQuestion,
    chapterHref,
    relatedLink,
    setupTheme,
    formatTime,
    bookmarkButton,
    bindBookmarks
  };
})();
