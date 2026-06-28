(function () {
  "use strict";

  // テーマ（保存値の適用と切り替え）
  var savedTheme = localStorage.getItem("gken-theme");
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;
  var toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      localStorage.setItem("gken-theme", next);
    });
  }

  // 完了状況
  var done = {};
  try {
    var parsed = JSON.parse(localStorage.getItem("gken-lesson-progress-v3"));
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) done = parsed;
  } catch (error) {
    done = {};
  }

  document.querySelectorAll("[data-lesson-slug]").forEach(function (card) {
    var slug = card.getAttribute("data-lesson-slug");
    if (done[slug] !== true) return;
    card.classList.add("is-complete");
    if (!card.querySelector(".lesson-card-badge")) {
      var badge = document.createElement("span");
      badge.className = "lesson-card-badge";
      badge.textContent = "✓ 完了";
      card.appendChild(badge);
    }
  });

  document.querySelectorAll("[data-chapter-progress]").forEach(function (el) {
    var chapter = el.getAttribute("data-chapter-progress");
    var total = parseInt(el.getAttribute("data-chapter-total") || "0", 10);
    var count = Object.keys(done).filter(function (key) {
      return done[key] && key.indexOf(chapter + "/") === 0;
    }).length;
    el.textContent = count + " / " + total + " 完了";
    el.classList.toggle("is-complete", total > 0 && count >= total);
  });
})();
