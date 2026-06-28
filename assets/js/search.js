(function () {
  "use strict";

  const ui = window.GKEN_LEARNING;
  const input = document.getElementById("siteSearch");
  const results = document.getElementById("searchResults");
  let index = [];

  function render() {
    const query = input.value.trim().toLowerCase();
    const items = query
      ? index.filter((item) => `${item.title} ${item.body} ${item.kind}`.toLowerCase().includes(query)).slice(0, 80)
      : index.slice(0, 20);
    if (!items.length) {
      results.innerHTML = `<p class="empty-state">該当する結果がありません。</p>`;
      return;
    }
    results.innerHTML = items.map((item) => `<article class="search-result-card">
      <span>${ui.escapeHtml(item.kind)}</span>
      <h3><a href="${ui.escapeHtml(item.url)}">${ui.escapeHtml(item.title)}</a></h3>
      <p>${ui.escapeHtml(item.body)}</p>
    </article>`).join("");
  }

  async function init() {
    ui.setupTheme();
    index = await fetch("../content/search-index.json").then((r) => r.json());
    input.addEventListener("input", render);
    render();
  }

  init().catch((error) => {
    results.innerHTML = `<p class="empty-state">検索インデックスを読み込めませんでした。</p>`;
    console.error(error);
  });
})();
