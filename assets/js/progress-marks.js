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
    done = JSON.parse(localStorage.getItem("gken-lesson-progress-v3")) || {};
  } catch (error) {
    done = {};
  }

  document.querySelectorAll("[data-lesson-slug]").forEach(function (card) {
    if (done[card.getAttribute("data-lesson-slug")]) {
      card.classList.add("is-complete");
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
