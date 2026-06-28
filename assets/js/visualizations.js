(function () {
  "use strict";

  const state = {
    active: "distribution",
    distribution: { mean: 50, spread: 14, samples: 160 },
    regression: { noise: 24, slope: 1.1, bias: 18, samples: 80 },
    classification: { threshold: 50, slope: 1.0, bias: 0, samples: 120 },
    network: { layers: 4, units: 5, activation: "ReLU" },
    attention: { tokens: 5, focus: 2 }
  };

  const labels = {
    distribution: "分布",
    regression: "回帰",
    classification: "分類",
    network: "ニューラルネットワーク",
    attention: "Attention"
  };

  let canvas;
  let ctx;
  let controls;
  let metrics;
  let svgVisual;

  function setup() {
    canvas = document.getElementById("mainCanvas");
    ctx = canvas.getContext("2d");
    controls = document.getElementById("visualControls");
    metrics = document.getElementById("visualMetrics");
    svgVisual = document.getElementById("svgVisual");

    document.querySelectorAll("[data-visual-tab]").forEach((button) => {
      button.addEventListener("click", () => {
        state.active = button.dataset.visualTab;
        document.querySelectorAll("[data-visual-tab]").forEach((tab) => tab.classList.toggle("is-active", tab === button));
        render();
      });
    });

    render();
  }

  function render() {
    controls.innerHTML = "";
    metrics.innerHTML = "";
    svgVisual.innerHTML = "";
    svgVisual.classList.remove("is-active");
    canvas.style.display = "block";

    if (state.active === "distribution") renderDistribution();
    if (state.active === "regression") renderRegression();
    if (state.active === "classification") renderClassification();
    if (state.active === "network") renderNetwork();
    if (state.active === "attention") renderAttention();
  }

  function field(key, label, min, max, step, value, onInput) {
    const wrap = document.createElement("label");
    wrap.className = "control-field";
    wrap.innerHTML = `<span>${label}: <strong>${value}</strong></span>`;
    const input = document.createElement("input");
    input.type = "range";
    input.min = min;
    input.max = max;
    input.step = step;
    input.value = value;
    input.dataset.key = key;
    input.addEventListener("input", () => {
      const next = Number(input.value);
      wrap.querySelector("strong").textContent = next;
      onInput(next);
      drawActiveOnly();
    });
    wrap.append(input);
    controls.append(wrap);
  }

  function selectField(label, value, options, onChange) {
    const wrap = document.createElement("label");
    wrap.className = "control-field";
    wrap.innerHTML = `<span>${label}</span>`;
    const select = document.createElement("select");
    options.forEach((option) => {
      const node = document.createElement("option");
      node.value = option;
      node.textContent = option;
      node.selected = option === value;
      select.append(node);
    });
    select.addEventListener("change", () => {
      onChange(select.value);
      drawActiveOnly();
    });
    wrap.append(select);
    controls.append(wrap);
  }

  function drawActiveOnly() {
    metrics.innerHTML = "";
    svgVisual.innerHTML = "";
    if (state.active === "distribution") drawDistribution();
    if (state.active === "regression") drawRegression();
    if (state.active === "classification") drawClassification();
    if (state.active === "network") drawNetwork();
    if (state.active === "attention") drawAttention();
  }

  function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--surface").trim() || "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function seeded(seed) {
    let value = seed % 2147483647;
    return function () {
      value = (value * 16807) % 2147483647;
      return (value - 1) / 2147483646;
    };
  }

  function normal(rand) {
    const u = Math.max(rand(), 0.0001);
    const v = Math.max(rand(), 0.0001);
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  function axes(title) {
    ctx.strokeStyle = "#91a29a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(70, 440);
    ctx.lineTo(830, 440);
    ctx.moveTo(70, 440);
    ctx.lineTo(70, 70);
    ctx.stroke();
    ctx.fillStyle = "#51615c";
    ctx.font = "24px sans-serif";
    ctx.fillText(title, 70, 42);
  }

  function metric(label, value) {
    const item = document.createElement("div");
    item.innerHTML = `<strong>${label}</strong><br><span>${value}</span>`;
    metrics.append(item);
  }

  function renderDistribution() {
    field("mean", "平均", 20, 80, 1, state.distribution.mean, (v) => state.distribution.mean = v);
    field("spread", "ばらつき", 4, 28, 1, state.distribution.spread, (v) => state.distribution.spread = v);
    field("samples", "サンプル数", 40, 360, 10, state.distribution.samples, (v) => state.distribution.samples = v);
    drawDistribution();
  }

  function drawDistribution() {
    clear();
    axes(`${labels.distribution}: 平均と分散の変化`);
    const rand = seeded(42 + state.distribution.samples);
    const values = Array.from({ length: state.distribution.samples }, () => state.distribution.mean + normal(rand) * state.distribution.spread);
    const bins = Array.from({ length: 18 }, () => 0);
    values.forEach((value) => {
      const index = Math.max(0, Math.min(17, Math.floor((value / 100) * bins.length)));
      bins[index] += 1;
    });
    const max = Math.max(...bins);
    bins.forEach((count, index) => {
      const x = 84 + index * 40;
      const h = (count / max) * 300;
      ctx.fillStyle = index % 2 ? "#0f766e" : "#b7791f";
      ctx.fillRect(x, 440 - h, 28, h);
    });
    const meanX = 70 + (state.distribution.mean / 100) * 760;
    ctx.strokeStyle = "#c0564a";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(meanX, 90);
    ctx.lineTo(meanX, 440);
    ctx.stroke();
    metric("平均", state.distribution.mean.toFixed(1));
    metric("分散の目安", Math.round(state.distribution.spread ** 2));
    metric("観察", state.distribution.spread > 18 ? "山が広がり、値の散らばりが大きい" : "山がまとまり、中心を読みやすい");
  }

  function renderRegression() {
    field("noise", "ノイズ", 0, 60, 1, state.regression.noise, (v) => state.regression.noise = v);
    field("slope", "傾き", -2, 3, 0.1, state.regression.slope, (v) => state.regression.slope = v);
    field("bias", "切片", -20, 60, 1, state.regression.bias, (v) => state.regression.bias = v);
    field("samples", "データ数", 30, 160, 10, state.regression.samples, (v) => state.regression.samples = v);
    drawRegression();
  }

  function drawRegression() {
    clear();
    axes(`${labels.regression}: 回帰直線と残差`);
    const rand = seeded(7 + state.regression.samples);
    const points = Array.from({ length: state.regression.samples }, () => {
      const x = rand() * 100;
      const y = state.regression.bias + state.regression.slope * x + normal(rand) * state.regression.noise;
      return { x, y };
    });
    let sse = 0;
    let sst = 0;
    const meanY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
    points.forEach((p) => {
      const pred = state.regression.bias + state.regression.slope * p.x;
      sse += (p.y - pred) ** 2;
      sst += (p.y - meanY) ** 2;
      const px = 70 + p.x * 7.6;
      const py = 440 - Math.max(0, Math.min(100, p.y)) * 3.6;
      const lineY = 440 - Math.max(0, Math.min(100, pred)) * 3.6;
      ctx.strokeStyle = "rgba(192, 86, 74, 0.25)";
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px, lineY);
      ctx.stroke();
      ctx.fillStyle = "#26344f";
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.strokeStyle = "#0f766e";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(70, 440 - Math.max(0, Math.min(100, state.regression.bias)) * 3.6);
    ctx.lineTo(830, 440 - Math.max(0, Math.min(100, state.regression.bias + state.regression.slope * 100)) * 3.6);
    ctx.stroke();
    const mse = sse / points.length;
    const r2 = 1 - sse / Math.max(sst, 1);
    metric("MSE", mse.toFixed(1));
    metric("R2", r2.toFixed(2));
    metric("観察", state.regression.noise > 35 ? "残差が大きく、予測が不安定" : "点群と直線の対応を読みやすい");
  }

  function renderClassification() {
    field("threshold", "しきい値", 20, 80, 1, state.classification.threshold, (v) => state.classification.threshold = v);
    field("slope", "境界の傾き", -2, 2, 0.1, state.classification.slope, (v) => state.classification.slope = v);
    field("bias", "境界の位置", -60, 60, 2, state.classification.bias, (v) => state.classification.bias = v);
    drawClassification();
  }

  function drawClassification() {
    clear();
    axes(`${labels.classification}: しきい値と混同行列`);
    const rand = seeded(99);
    let tp = 0;
    let fp = 0;
    let tn = 0;
    let fn = 0;
    const boundary = (x) => state.classification.slope * (x - 50) + state.classification.threshold + state.classification.bias / 5;
    Array.from({ length: state.classification.samples }, () => {
      const x = rand() * 100;
      const y = rand() * 100;
      const actual = y > 0.75 * x + 18 + normal(rand) * 8;
      const predicted = y > boundary(x);
      if (actual && predicted) tp += 1;
      if (!actual && predicted) fp += 1;
      if (!actual && !predicted) tn += 1;
      if (actual && !predicted) fn += 1;
      ctx.fillStyle = actual ? "#0f766e" : "#b7791f";
      ctx.globalAlpha = predicted === actual ? 0.9 : 0.32;
      ctx.beginPath();
      ctx.arc(70 + x * 7.6, 440 - y * 3.6, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });
    ctx.strokeStyle = "#c0564a";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(70, 440 - Math.max(0, Math.min(100, boundary(0))) * 3.6);
    ctx.lineTo(830, 440 - Math.max(0, Math.min(100, boundary(100))) * 3.6);
    ctx.stroke();
    const precision = tp / Math.max(tp + fp, 1);
    const recall = tp / Math.max(tp + fn, 1);
    const f1 = 2 * precision * recall / Math.max(precision + recall, 0.0001);
    metric("適合率", precision.toFixed(2));
    metric("再現率", recall.toFixed(2));
    metric("F1", f1.toFixed(2));
    metric("混同行列", `TP ${tp} / FP ${fp} / FN ${fn} / TN ${tn}`);
  }

  function renderNetwork() {
    field("layers", "層数", 2, 6, 1, state.network.layers, (v) => state.network.layers = v);
    field("units", "ユニット数", 3, 8, 1, state.network.units, (v) => state.network.units = v);
    selectField("活性化関数", state.network.activation, ["ReLU", "Sigmoid", "Tanh"], (v) => state.network.activation = v);
    drawNetwork();
  }

  function drawNetwork() {
    canvas.style.display = "none";
    svgVisual.classList.add("is-active");
    const layers = state.network.layers;
    const units = state.network.units;
    let lines = "";
    let nodes = "";
    for (let l = 0; l < layers; l += 1) {
      const x = 80 + l * (720 / Math.max(layers - 1, 1));
      for (let u = 0; u < units; u += 1) {
        const y = 80 + u * (310 / Math.max(units - 1, 1));
        if (l < layers - 1) {
          const nx = 80 + (l + 1) * (720 / Math.max(layers - 1, 1));
          for (let nu = 0; nu < units; nu += 1) {
            const ny = 80 + nu * (310 / Math.max(units - 1, 1));
            lines += `<line x1="${x}" y1="${y}" x2="${nx}" y2="${ny}" stroke="#91a29a" stroke-opacity="0.24"/>`;
          }
        }
        nodes += `<circle cx="${x}" cy="${y}" r="15" fill="${l === 0 ? "#b7791f" : l === layers - 1 ? "#c0564a" : "#0f766e"}"/><text x="${x}" y="${y + 5}" text-anchor="middle" font-size="11" fill="#fff">${u + 1}</text>`;
      }
    }
    svgVisual.innerHTML = `<svg viewBox="0 0 900 470" role="img" aria-label="ニューラルネットワーク構造図"><rect x="1" y="1" width="898" height="468" rx="8" fill="transparent" stroke="#91a29a"/><text x="40" y="42" font-size="24" fill="currentColor">${layers}層 / ${units}ユニット / ${state.network.activation}</text>${lines}${nodes}</svg>`;
    metric("構造", `${layers}層 x ${units}ユニット`);
    metric("活性化", state.network.activation);
    metric("観察", "層が増えるほど表現力は増えるが、過学習や計算負荷も意識する");
  }

  function renderAttention() {
    field("tokens", "トークン数", 3, 8, 1, state.attention.tokens, (v) => state.attention.tokens = v);
    field("focus", "注目トークン", 1, state.attention.tokens, 1, Math.min(state.attention.focus, state.attention.tokens), (v) => state.attention.focus = v);
    drawAttention();
  }

  function drawAttention() {
    canvas.style.display = "none";
    svgVisual.classList.add("is-active");
    const n = state.attention.tokens;
    const focus = Math.min(state.attention.focus, n);
    const size = 48;
    let cells = "";
    for (let row = 0; row < n; row += 1) {
      for (let col = 0; col < n; col += 1) {
        const distance = Math.abs(col + 1 - focus) + Math.abs(row - col) * 0.35;
        const weight = Math.max(0.15, 1 - distance / n);
        const opacity = weight.toFixed(2);
        cells += `<rect x="${180 + col * size}" y="${95 + row * size}" width="${size - 4}" height="${size - 4}" rx="6" fill="#0f766e" opacity="${opacity}"/><text x="${180 + col * size + 22}" y="${95 + row * size + 30}" text-anchor="middle" font-size="12" fill="#fff">${weight.toFixed(1)}</text>`;
      }
    }
    const labels = Array.from({ length: n }, (_, i) => `<text x="${180 + i * size + 22}" y="78" text-anchor="middle" font-size="13" fill="currentColor">T${i + 1}</text><text x="145" y="${95 + i * size + 30}" text-anchor="middle" font-size="13" fill="currentColor">T${i + 1}</text>`).join("");
    svgVisual.innerHTML = `<svg viewBox="0 0 900 470" role="img" aria-label="Attentionヒートマップ"><rect x="1" y="1" width="898" height="468" rx="8" fill="transparent" stroke="#91a29a"/><text x="40" y="42" font-size="24" fill="currentColor">Attention heatmap</text>${labels}${cells}</svg>`;
    metric("トークン数", n);
    metric("注目先", `T${focus}`);
    metric("観察", "濃いセルほど、そのトークンへの関連が強い");
  }

  window.GKEN_VISUALS = { setup, render };
})();
