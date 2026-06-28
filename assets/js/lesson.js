(function () {
  "use strict";

  const dataNode = document.getElementById("lessonData");
  if (!dataNode) return;

  const lesson = JSON.parse(dataNode.textContent);
  const storageKey = "gken-lesson-progress-v2";
  const canvas = document.getElementById("lessonCanvas");
  const ctx = canvas ? canvas.getContext("2d") : null;
  const svg = document.getElementById("lessonSvg");
  const controls = document.getElementById("lessonControls");
  const metrics = document.getElementById("lessonMetrics");
  const quizResult = document.getElementById("lessonQuizResult");

  const state = {
    a: 50,
    b: 35,
    c: 70,
    mode: "標準"
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

  function setMetric(label, value) {
    const item = document.createElement("div");
    item.innerHTML = `<strong>${label}</strong><span>${value}</span>`;
    metrics.append(item);
  }

  function clearMetrics() {
    metrics.innerHTML = "";
  }

  function clearCanvas(title) {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--surface").trim() || "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--text").trim() || "#17211f";
    ctx.font = "24px sans-serif";
    ctx.fillText(title, 42, 44);
  }

  function slider(key, label, min, max, step, value) {
    const wrap = document.createElement("label");
    wrap.className = "control-field";
    wrap.innerHTML = `<span>${label}: <strong>${value}</strong></span>`;
    const input = document.createElement("input");
    input.type = "range";
    input.min = min;
    input.max = max;
    input.step = step;
    input.value = value;
    input.addEventListener("input", () => {
      state[key] = Number(input.value);
      wrap.querySelector("strong").textContent = input.value;
      renderVisual();
    });
    wrap.append(input);
    controls.append(wrap);
  }

  function drawAxes() {
    ctx.strokeStyle = "#91a29a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(70, 430);
    ctx.lineTo(830, 430);
    ctx.moveTo(70, 430);
    ctx.lineTo(70, 82);
    ctx.stroke();
  }

  function drawDistribution() {
    clearCanvas("分布とばらつき");
    drawAxes();
    const bars = 20;
    for (let i = 0; i < bars; i += 1) {
      const x = 90 + i * 35;
      const center = Math.abs(i - state.a / 5);
      const height = Math.max(16, 280 * Math.exp(-(center * center) / Math.max(state.b, 8)));
      ctx.fillStyle = i % 2 ? "#0f766e" : "#b7791f";
      ctx.fillRect(x, 430 - height, 24, height);
    }
    setMetric("平均の位置", state.a);
    setMetric("ばらつき", state.b);
    setMetric("読み方", state.b > 45 ? "広い分布は予測の不確実性を意識する" : "狭い分布は中心傾向を読みやすい");
  }

  function drawScatter() {
    clearCanvas("散布図と関係性");
    drawAxes();
    let error = 0;
    for (let i = 0; i < 80; i += 1) {
      const x = (i * 37) % 100;
      const wave = Math.sin(i * 1.7) * state.b * 0.35;
      const y = Math.max(3, Math.min(98, state.c * 0.25 + x * (state.a / 55) + wave));
      const px = 70 + x * 7.6;
      const py = 430 - y * 3.3;
      const pred = state.c * 0.25 + x * (state.a / 55);
      error += Math.abs(y - pred);
      ctx.fillStyle = "#26344f";
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = "#c0564a";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(70, 430 - Math.min(100, state.c * 0.25) * 3.3);
    ctx.lineTo(830, 430 - Math.min(100, state.c * 0.25 + 100 * (state.a / 55)) * 3.3);
    ctx.stroke();
    setMetric("傾き", (state.a / 55).toFixed(2));
    setMetric("ノイズ", state.b);
    setMetric("残差の目安", Math.round(error / 80));
  }

  function drawBoundary() {
    clearCanvas("分類境界と評価");
    drawAxes();
    let tp = 0;
    let fp = 0;
    let tn = 0;
    let fn = 0;
    for (let i = 0; i < 120; i += 1) {
      const x = (i * 43) % 100;
      const y = (i * 71) % 100;
      const actual = y > 0.7 * x + 12 + Math.sin(i) * 12;
      const predicted = y > (state.a - 20) + x * ((state.b - 30) / 55);
      if (actual && predicted) tp += 1;
      if (!actual && predicted) fp += 1;
      if (!actual && !predicted) tn += 1;
      if (actual && !predicted) fn += 1;
      ctx.fillStyle = actual ? "#0f766e" : "#b7791f";
      ctx.globalAlpha = actual === predicted ? 0.92 : 0.35;
      ctx.beginPath();
      ctx.arc(70 + x * 7.6, 430 - y * 3.3, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.strokeStyle = "#c0564a";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(70, 430 - Math.min(100, state.a - 20) * 3.3);
    ctx.lineTo(830, 430 - Math.min(100, state.a - 20 + 100 * ((state.b - 30) / 55)) * 3.3);
    ctx.stroke();
    const precision = tp / Math.max(tp + fp, 1);
    const recall = tp / Math.max(tp + fn, 1);
    setMetric("適合率", precision.toFixed(2));
    setMetric("再現率", recall.toFixed(2));
    setMetric("混同行列", `TP ${tp} / FP ${fp} / FN ${fn} / TN ${tn}`);
  }

  function drawNetwork() {
    if (canvas) canvas.style.display = "none";
    svg.classList.add("is-active");
    const layers = Math.max(2, Math.round(state.a / 14));
    const units = Math.max(3, Math.round(state.b / 8));
    let edges = "";
    let nodes = "";
    for (let layer = 0; layer < layers; layer += 1) {
      const x = 80 + layer * (720 / Math.max(1, layers - 1));
      for (let unit = 0; unit < units; unit += 1) {
        const y = 92 + unit * (300 / Math.max(1, units - 1));
        if (layer < layers - 1) {
          const nx = 80 + (layer + 1) * (720 / Math.max(1, layers - 1));
          for (let next = 0; next < units; next += 1) {
            const ny = 92 + next * (300 / Math.max(1, units - 1));
            edges += `<line x1="${x}" y1="${y}" x2="${nx}" y2="${ny}" stroke="#91a29a" stroke-opacity="0.22"/>`;
          }
        }
        nodes += `<circle cx="${x}" cy="${y}" r="15" fill="${layer === 0 ? "#b7791f" : layer === layers - 1 ? "#c0564a" : "#0f766e"}"/>`;
      }
    }
    svg.innerHTML = `<svg viewBox="0 0 900 470" role="img" aria-label="ネットワーク構造図"><rect x="1" y="1" width="898" height="468" rx="8" fill="transparent" stroke="#91a29a"/><text x="40" y="46" font-size="24" fill="currentColor">層とユニットの関係</text>${edges}${nodes}</svg>`;
    setMetric("層数", layers);
    setMetric("ユニット", units);
    setMetric("観察", "構造を大きくすると表現力と過学習リスクが同時に増える");
  }

  function drawAttention() {
    if (canvas) canvas.style.display = "none";
    svg.classList.add("is-active");
    const n = Math.max(3, Math.round(state.a / 12));
    const focus = Math.max(1, Math.min(n, Math.round(state.b / 10)));
    let cells = "";
    for (let row = 0; row < n; row += 1) {
      for (let col = 0; col < n; col += 1) {
        const weight = Math.max(0.12, 1 - (Math.abs(col + 1 - focus) + Math.abs(row - col) * 0.35) / n);
        cells += `<rect x="${180 + col * 52}" y="${94 + row * 48}" width="44" height="40" rx="6" fill="#0f766e" opacity="${weight.toFixed(2)}"/><text x="${202 + col * 52}" y="${120 + row * 48}" text-anchor="middle" font-size="12" fill="#fff">${weight.toFixed(1)}</text>`;
      }
    }
    const labels = Array.from({ length: n }, (_, i) => `<text x="${202 + i * 52}" y="78" text-anchor="middle" font-size="13" fill="currentColor">T${i + 1}</text><text x="145" y="${120 + i * 48}" text-anchor="middle" font-size="13" fill="currentColor">T${i + 1}</text>`).join("");
    svg.innerHTML = `<svg viewBox="0 0 900 470" role="img" aria-label="Attentionヒートマップ"><rect x="1" y="1" width="898" height="468" rx="8" fill="transparent" stroke="#91a29a"/><text x="40" y="46" font-size="24" fill="currentColor">Attention heatmap</text>${labels}${cells}</svg>`;
    setMetric("トークン数", n);
    setMetric("注目先", `T${focus}`);
    setMetric("読み方", "濃いセルほど関連が強い");
  }

  function drawFlow() {
    if (canvas) canvas.style.display = "none";
    svg.classList.add("is-active");
    const steps = lesson.visual.steps || lesson.terms.slice(0, 5);
    const active = Math.min(steps.length - 1, Math.floor((state.a / 100) * steps.length));
    const boxes = steps.map((step, index) => {
      const x = 65 + index * (770 / Math.max(1, steps.length - 1));
      const fill = index <= active ? "#0f766e" : "#eef3f1";
      const text = index <= active ? "#fff" : "#17211f";
      const line = index < steps.length - 1 ? `<line x1="${x + 72}" y1="210" x2="${65 + (index + 1) * (770 / Math.max(1, steps.length - 1)) - 72}" y2="210" stroke="#91a29a" stroke-width="3"/>` : "";
      return `${line}<rect x="${x - 72}" y="160" width="144" height="100" rx="8" fill="${fill}" stroke="#91a29a"/><text x="${x}" y="205" text-anchor="middle" font-size="14" fill="${text}">${escapeSvg(step).slice(0, 12)}</text><text x="${x}" y="228" text-anchor="middle" font-size="12" fill="${text}">${index + 1}</text>`;
    }).join("");
    svg.innerHTML = `<svg viewBox="0 0 900 430" role="img" aria-label="処理フロー図"><rect x="1" y="1" width="898" height="428" rx="8" fill="transparent" stroke="#91a29a"/><text x="40" y="50" font-size="24" fill="currentColor">流れで理解する</text>${boxes}</svg>`;
    setMetric("現在の段階", `${active + 1}/${steps.length}`);
    setMetric("注目点", steps[active]);
  }

  function drawBars() {
    clearCanvas("比較チャート");
    const labels = lesson.terms.slice(0, 5);
    labels.forEach((label, index) => {
      const value = Math.max(10, ((state.a + index * state.b) % 90));
      const y = 100 + index * 65;
      ctx.fillStyle = "#0f766e";
      ctx.fillRect(230, y, value * 5.2, 30);
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--text").trim() || "#17211f";
      ctx.font = "16px sans-serif";
      ctx.fillText(label, 70, y + 22);
    });
    setMetric("比較軸", lesson.visual.axis || "重要度");
    setMetric("操作値", state.a);
    setMetric("読み方", "棒の長さの差から優先度や特徴を比べる");
  }

  function drawMatrix() {
    if (canvas) canvas.style.display = "none";
    svg.classList.add("is-active");
    const terms = lesson.terms.slice(0, 4);
    let cells = "";
    for (let r = 0; r < terms.length; r += 1) {
      for (let c = 0; c < terms.length; c += 1) {
        const value = ((r + 1) * (c + 2) + state.a) % 100;
        cells += `<rect x="${220 + c * 95}" y="${100 + r * 70}" width="82" height="56" rx="6" fill="#0f766e" opacity="${Math.max(0.2, value / 100)}"/><text x="${261 + c * 95}" y="${135 + r * 70}" text-anchor="middle" font-size="13" fill="#fff">${value}</text>`;
      }
    }
    const labels = terms.map((term, i) => `<text x="${261 + i * 95}" y="82" text-anchor="middle" font-size="12" fill="currentColor">${escapeSvg(term).slice(0, 8)}</text><text x="170" y="${135 + i * 70}" text-anchor="end" font-size="12" fill="currentColor">${escapeSvg(term).slice(0, 8)}</text>`).join("");
    svg.innerHTML = `<svg viewBox="0 0 900 430" role="img" aria-label="関係マトリクス"><rect x="1" y="1" width="898" height="428" rx="8" fill="transparent" stroke="#91a29a"/><text x="40" y="50" font-size="24" fill="currentColor">関係を行列で見る</text>${labels}${cells}</svg>`;
    setMetric("軸", lesson.visual.axis || "関連度");
    setMetric("操作値", state.a);
  }

  function escapeSvg(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char]));
  }

  function buildControls() {
    controls.innerHTML = "";
    const type = lesson.visual.type;
    if (["distribution", "scatter", "boundary"].includes(type)) {
      slider("a", lesson.visual.a || "中心", 5, 95, 1, state.a);
      slider("b", lesson.visual.b || "ばらつき", 5, 95, 1, state.b);
      slider("c", lesson.visual.c || "基準", 5, 95, 1, state.c);
    } else if (["network", "attention", "flow", "bars", "matrix"].includes(type)) {
      slider("a", lesson.visual.a || "表示量", 10, 90, 1, state.a);
      slider("b", lesson.visual.b || "強調", 10, 90, 1, state.b);
    }
  }

  function renderVisual() {
    clearMetrics();
    if (canvas) canvas.style.display = "block";
    svg.classList.remove("is-active");
    svg.innerHTML = "";
    if (lesson.visual.type === "distribution") drawDistribution();
    if (lesson.visual.type === "scatter") drawScatter();
    if (lesson.visual.type === "boundary") drawBoundary();
    if (lesson.visual.type === "network") drawNetwork();
    if (lesson.visual.type === "attention") drawAttention();
    if (lesson.visual.type === "flow") drawFlow();
    if (lesson.visual.type === "bars") drawBars();
    if (lesson.visual.type === "matrix") drawMatrix();
  }

  function setupQuiz() {
    document.getElementById("gradeLessonQuiz")?.addEventListener("click", () => {
      let score = 0;
      lesson.quiz.forEach((item) => {
        const selected = document.querySelector(`input[name="${item.id}"]:checked`);
        if (selected && selected.value === item.answer) score += 1;
      });
      const percent = Math.round((score / lesson.quiz.length) * 100);
      quizResult.textContent = `${score}/${lesson.quiz.length}問正解、${percent}%です。${percent >= 70 ? "次へ進めます。" : "本文と図表をもう一度操作してみましょう。"}`;
    });
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
