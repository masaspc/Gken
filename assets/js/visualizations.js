(function () {
  "use strict";

  const core = {};

  function css(name, fallback) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  }

  function seeded(seed) {
    let value = Math.max(1, seed % 2147483647);
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

  function clearCanvas(canvas, title) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = css("--surface", "#fff");
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = css("--text", "#17211f");
    ctx.font = "24px sans-serif";
    ctx.fillText(title, 56, 42);
    return ctx;
  }

  function drawAxes(ctx, cfg) {
    const { left = 76, top = 72, right = 836, bottom = 430, xLabel, yLabel, xTicks = [], yTicks = [] } = cfg;
    ctx.strokeStyle = css("--line", "#d8e1dd");
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(left, bottom);
    ctx.lineTo(right, bottom);
    ctx.moveTo(left, bottom);
    ctx.lineTo(left, top);
    ctx.stroke();

    ctx.fillStyle = css("--muted", "#5b6965");
    ctx.font = "13px sans-serif";
    xTicks.forEach((tick) => {
      const x = left + tick.ratio * (right - left);
      ctx.beginPath();
      ctx.moveTo(x, bottom);
      ctx.lineTo(x, bottom + 5);
      ctx.stroke();
      ctx.fillText(tick.label, x - 12, bottom + 24);
    });
    yTicks.forEach((tick) => {
      const y = bottom - tick.ratio * (bottom - top);
      ctx.beginPath();
      ctx.moveTo(left - 5, y);
      ctx.lineTo(left, y);
      ctx.stroke();
      ctx.fillText(tick.label, left - 52, y + 4);
    });
    ctx.fillText(xLabel, right - 80, bottom + 48);
    ctx.save();
    ctx.translate(left - 58, top + 100);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(yLabel, 0, 0);
    ctx.restore();
  }

  function metric(container, label, value) {
    if (!container) return;
    const item = document.createElement("div");
    item.innerHTML = `<strong>${label}</strong><br><span>${value}</span>`;
    container.append(item);
  }

  function resetOutput(out) {
    if (out.metrics) out.metrics.innerHTML = "";
    if (out.svg) {
      out.svg.innerHTML = "";
      out.svg.classList.remove("is-active");
    }
    if (out.canvas) out.canvas.style.display = "block";
  }

  core.renderDistribution = function (out, state) {
    resetOutput(out);
    const cfg = {
      mean: Number(state.mean ?? 50),
      sd: Number(state.sd ?? state.spread ?? 14),
      samples: Number(state.samples ?? 160),
      seed: Number(state.seed ?? 42)
    };
    const canvas = out.canvas;
    const ctx = clearCanvas(canvas, "正規分布サンプリング");
    const left = 76;
    const right = 836;
    const top = 72;
    const bottom = 430;
    drawAxes(ctx, {
      left, right, top, bottom,
      xLabel: "値",
      yLabel: "度数",
      xTicks: [0, 0.25, 0.5, 0.75, 1].map((r) => ({ ratio: r, label: String(Math.round(r * 100)) })),
      yTicks: [0, 0.5, 1].map((r) => ({ ratio: r, label: r === 0 ? "0" : r === 0.5 ? "中" : "最大" }))
    });

    const rand = seeded(cfg.seed + cfg.samples);
    const values = Array.from({ length: cfg.samples }, () => cfg.mean + normal(rand) * cfg.sd);
    const bins = Array.from({ length: 20 }, () => 0);
    values.forEach((value) => {
      const index = Math.max(0, Math.min(bins.length - 1, Math.floor((value / 100) * bins.length)));
      bins[index] += 1;
    });
    const max = Math.max(...bins, 1);
    bins.forEach((count, index) => {
      const x = left + 12 + index * ((right - left - 24) / bins.length);
      const w = ((right - left - 24) / bins.length) - 4;
      const h = (count / max) * (bottom - top - 38);
      ctx.fillStyle = css("--accent", "#0f766e");
      ctx.fillRect(x, bottom - h, w, h);
    });
    const meanX = left + (cfg.mean / 100) * (right - left);
    ctx.strokeStyle = css("--coral", "#c0564a");
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(meanX, top);
    ctx.lineTo(meanX, bottom);
    ctx.stroke();
    ctx.fillStyle = css("--coral", "#c0564a");
    ctx.fillText("平均", meanX + 6, top + 18);
    metric(out.metrics, "平均", cfg.mean.toFixed(1));
    metric(out.metrics, "標準偏差", cfg.sd.toFixed(1));
    metric(out.metrics, "分散", (cfg.sd ** 2).toFixed(1));
    metric(out.metrics, "サンプル数", cfg.samples);
  };

  core.renderRegression = function (out, state) {
    resetOutput(out);
    const cfg = {
      noise: Number(state.noise ?? 20),
      slope: Number(state.slope ?? 1.1),
      bias: Number(state.bias ?? 18),
      samples: Number(state.samples ?? 80),
      seed: Number(state.seed ?? 7)
    };
    const canvas = out.canvas;
    const ctx = clearCanvas(canvas, "回帰: 予測値・残差・MSE/R2");
    const left = 76, right = 836, top = 72, bottom = 430;
    drawAxes(ctx, {
      left, right, top, bottom,
      xLabel: "説明変数 x",
      yLabel: "目的変数 y",
      xTicks: [0, 0.5, 1].map((r) => ({ ratio: r, label: String(Math.round(r * 100)) })),
      yTicks: [0, 0.5, 1].map((r) => ({ ratio: r, label: String(Math.round(r * 100)) }))
    });

    const rand = seeded(cfg.seed + cfg.samples);
    const points = Array.from({ length: cfg.samples }, () => {
      const x = rand() * 100;
      const y = cfg.bias + cfg.slope * x + normal(rand) * cfg.noise;
      return { x, y };
    });
    const meanY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
    let sse = 0;
    let sst = 0;
    points.forEach((p) => {
      const pred = cfg.bias + cfg.slope * p.x;
      sse += (p.y - pred) ** 2;
      sst += (p.y - meanY) ** 2;
      const px = left + p.x / 100 * (right - left);
      const py = bottom - Math.max(0, Math.min(100, p.y)) / 100 * (bottom - top);
      const predY = bottom - Math.max(0, Math.min(100, pred)) / 100 * (bottom - top);
      ctx.strokeStyle = "rgba(192, 86, 74, 0.35)";
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px, predY);
      ctx.stroke();
      ctx.fillStyle = css("--ink", "#26344f");
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.strokeStyle = css("--accent", "#0f766e");
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(left, bottom - Math.max(0, Math.min(100, cfg.bias)) / 100 * (bottom - top));
    ctx.lineTo(right, bottom - Math.max(0, Math.min(100, cfg.bias + cfg.slope * 100)) / 100 * (bottom - top));
    ctx.stroke();
    const mse = sse / points.length;
    const r2 = 1 - sse / Math.max(sst, 1);
    metric(out.metrics, "MSE", mse.toFixed(2));
    metric(out.metrics, "R2", r2.toFixed(3));
    metric(out.metrics, "傾き", cfg.slope.toFixed(2));
    metric(out.metrics, "ノイズ標準偏差", cfg.noise.toFixed(1));
  };

  core.renderClassification = function (out, state) {
    resetOutput(out);
    const cfg = {
      threshold: Number(state.threshold ?? 50),
      slope: Number(state.slope ?? 1.0),
      bias: Number(state.bias ?? 0),
      samples: Number(state.samples ?? 120),
      seed: Number(state.seed ?? 99)
    };
    const canvas = out.canvas;
    const ctx = clearCanvas(canvas, "分類: 決定境界と混同行列");
    const left = 76, right = 836, top = 72, bottom = 430;
    drawAxes(ctx, {
      left, right, top, bottom,
      xLabel: "特徴量 x1",
      yLabel: "特徴量 x2",
      xTicks: [0, 0.5, 1].map((r) => ({ ratio: r, label: String(Math.round(r * 100)) })),
      yTicks: [0, 0.5, 1].map((r) => ({ ratio: r, label: String(Math.round(r * 100)) }))
    });

    const rand = seeded(cfg.seed);
    let tp = 0, fp = 0, tn = 0, fn = 0;
    const trueBoundary = (x) => 0.75 * x + 18;
    const modelBoundary = (x) => cfg.slope * (x - 50) + cfg.threshold + cfg.bias / 5;
    Array.from({ length: cfg.samples }, () => {
      const x = rand() * 100;
      const y = rand() * 100;
      const actual = y > trueBoundary(x) + normal(rand) * 8;
      const predicted = y > modelBoundary(x);
      if (actual && predicted) tp += 1;
      if (!actual && predicted) fp += 1;
      if (!actual && !predicted) tn += 1;
      if (actual && !predicted) fn += 1;
      ctx.fillStyle = actual ? css("--accent", "#0f766e") : css("--gold", "#b7791f");
      ctx.globalAlpha = predicted === actual ? 0.9 : 0.35;
      ctx.beginPath();
      ctx.arc(left + x / 100 * (right - left), bottom - y / 100 * (bottom - top), 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });
    ctx.strokeStyle = css("--coral", "#c0564a");
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(left, bottom - Math.max(0, Math.min(100, modelBoundary(0))) / 100 * (bottom - top));
    ctx.lineTo(right, bottom - Math.max(0, Math.min(100, modelBoundary(100))) / 100 * (bottom - top));
    ctx.stroke();
    const precision = tp / Math.max(tp + fp, 1);
    const recall = tp / Math.max(tp + fn, 1);
    const f1 = 2 * precision * recall / Math.max(precision + recall, 0.0001);
    metric(out.metrics, "TP / FP / FN / TN", `${tp} / ${fp} / ${fn} / ${tn}`);
    metric(out.metrics, "適合率", precision.toFixed(3));
    metric(out.metrics, "再現率", recall.toFixed(3));
    metric(out.metrics, "F1", f1.toFixed(3));
  };

  core.renderNetwork = function (out, spec) {
    resetOutput(out);
    out.canvas.style.display = "none";
    out.svg.classList.add("is-active");
    const layers = spec.layers || [
      { name: "入力", units: 4 },
      { name: "隠れ層", units: 6 },
      { name: "出力", units: 3 }
    ];
    const maxUnits = Math.max(...layers.map((l) => l.units));
    const width = 900;
    const height = 470;
    const xs = layers.map((_, i) => 95 + i * ((width - 190) / Math.max(layers.length - 1, 1)));
    let edges = "";
    let nodes = "";
    layers.forEach((layer, i) => {
      const x = xs[i];
      const gap = 300 / Math.max(layer.units - 1, 1);
      const startY = 105 + (maxUnits - layer.units) * (300 / Math.max(maxUnits - 1, 1)) / 2;
      for (let u = 0; u < layer.units; u += 1) {
        const y = layer.units === 1 ? 250 : startY + u * gap;
        if (i < layers.length - 1) {
          const next = layers[i + 1];
          const nx = xs[i + 1];
          const ngap = 300 / Math.max(next.units - 1, 1);
          const nStartY = 105 + (maxUnits - next.units) * (300 / Math.max(maxUnits - 1, 1)) / 2;
          for (let v = 0; v < next.units; v += 1) {
            const ny = next.units === 1 ? 250 : nStartY + v * ngap;
            edges += `<line x1="${x}" y1="${y}" x2="${nx}" y2="${ny}" stroke="var(--line)" stroke-opacity="0.55"/>`;
          }
        }
        nodes += `<circle cx="${x}" cy="${y}" r="15" fill="var(--accent)"/><text x="${x}" y="${y + 36}" text-anchor="middle" font-size="12" fill="currentColor">${escapeSvg(layer.name)}</text>`;
      }
    });
    out.svg.innerHTML = `<svg viewBox="0 0 900 470" role="img" aria-label="ニューラルネットワーク構造図"><rect x="1" y="1" width="898" height="468" rx="8" fill="transparent" stroke="var(--line)"/><text x="40" y="46" font-size="22" fill="currentColor">${escapeSvg(spec.title || "層構造")}</text>${edges}${nodes}</svg>`;
    metric(out.metrics, "層", layers.map((l) => `${l.name}:${l.units}`).join(" / "));
    metric(out.metrics, "凡例", "線は重み接続、丸はユニット");
  };

  core.renderAttention = function (out, spec, state) {
    resetOutput(out);
    out.canvas.style.display = "none";
    out.svg.classList.add("is-active");
    const tokens = spec.tokens || ["私", "は", "AI", "を", "学ぶ"];
    const scale = Math.sqrt(3);
    const focus = Math.max(0, Math.min(tokens.length - 1, Number(state.focus ?? spec.focus ?? 2)));
    const temperature = Number(state.temperature ?? 1);
    const vectors = Array.isArray(spec.features) && spec.features.length === tokens.length
      ? spec.features
      : tokens.map((_, i) => [
        Math.sin((i + 1) * 1.7),
        Math.cos((i + 1) * 0.9),
        (i === focus ? 1 : 0) + (i / tokens.length)
      ]);
    const query = vectors[focus];
    const scores = vectors.map((key) => dot(query, key) / scale / temperature);
    const weights = softmax(scores);
    let cells = "";
    weights.forEach((w, i) => {
      const opacity = Math.max(0.15, w).toFixed(3);
      cells += `<rect x="${170 + i * 88}" y="150" width="70" height="150" rx="8" fill="var(--accent)" opacity="${opacity}"/><text x="${205 + i * 88}" y="135" text-anchor="middle" font-size="14" fill="currentColor">${escapeSvg(tokens[i])}</text><text x="${205 + i * 88}" y="230" text-anchor="middle" font-size="13" fill="#fff">${w.toFixed(3)}</text>`;
    });
    out.svg.innerHTML = `<svg viewBox="0 0 900 430" role="img" aria-label="Scaled dot-product Attention"><rect x="1" y="1" width="898" height="428" rx="8" fill="transparent" stroke="var(--line)"/><text x="40" y="50" font-size="22" fill="currentColor">Scaled dot-product Attention</text><text x="40" y="82" font-size="13" fill="currentColor">Query token: ${escapeSvg(tokens[focus])} / softmax((QK^T)/sqrt(d))</text>${cells}<text x="170" y="342" font-size="13" fill="currentColor">横軸: Key token</text><text x="40" y="224" font-size="13" fill="currentColor">重み</text></svg>`;
    metric(out.metrics, "計算式", "softmax((QK^T)/sqrt(d))");
    metric(out.metrics, "合計", weights.reduce((sum, w) => sum + w, 0).toFixed(3));
    metric(out.metrics, "最大重み", `${tokens[weights.indexOf(Math.max(...weights))]} ${Math.max(...weights).toFixed(3)}`);
  };

  core.renderFlow = function (out, spec) {
    resetOutput(out);
    out.canvas.style.display = "none";
    out.svg.classList.add("is-active");
    const steps = spec.steps || [];
    const boxes = steps.map((step, index) => {
      const x = 95 + index * (710 / Math.max(steps.length - 1, 1));
      const line = index < steps.length - 1 ? `<line x1="${x + 58}" y1="215" x2="${95 + (index + 1) * (710 / Math.max(steps.length - 1, 1)) - 58}" y2="215" stroke="var(--line)" stroke-width="3"/>` : "";
      const label = flowTspans(step.label || step, x, 198, 7, 2);
      const note = flowTspans(step.note || `Step ${index + 1}`, x, 232, 9, 2);
      return `${line}<rect x="${x - 58}" y="168" width="116" height="94" rx="8" fill="var(--surface-strong)" stroke="var(--line)"/><text text-anchor="middle" font-size="13" fill="currentColor">${label}</text><text text-anchor="middle" font-size="11" fill="currentColor">${note}</text>`;
    }).join("");
    out.svg.innerHTML = `<svg viewBox="0 0 900 430" role="img" aria-label="判断フロー"><rect x="1" y="1" width="898" height="428" rx="8" fill="transparent" stroke="var(--line)"/><text x="40" y="50" font-size="22" fill="currentColor">${escapeSvg(spec.title || "判断フロー")}</text><text x="40" y="80" font-size="13" fill="currentColor">左から右へ、確認順に読む</text>${boxes}</svg>`;
    metric(out.metrics, "ステップ数", steps.length);
    metric(out.metrics, "表現", "順序・判断手順");
  };

  core.renderComparisonTable = function (out, spec) {
    resetOutput(out);
    out.canvas.style.display = "none";
    out.svg.classList.add("is-active");
    const columns = spec.columns || ["項目", "特徴", "注意点"];
    const rows = spec.rows || [];
    out.svg.innerHTML = tableSvg(spec.title || "比較表", columns, rows, "比較軸: " + columns.join(" / "));
    metric(out.metrics, "行数", rows.length);
    metric(out.metrics, "表現", "数値化せず特徴を比較");
  };

  core.renderRelationTable = function (out, spec) {
    resetOutput(out);
    out.canvas.style.display = "none";
    out.svg.classList.add("is-active");
    const columns = spec.columns || ["概念", "関係", "区別"];
    const rows = spec.rows || [];
    out.svg.innerHTML = tableSvg(spec.title || "対応関係", columns, rows, "関係を文章で読む");
    metric(out.metrics, "関係数", rows.length);
    metric(out.metrics, "表現", "対応表・区別表");
  };

  function tableSvg(title, columns, rows, subtitle) {
    const wrappedRows = rows.map((row) => columns.map((_, c) => wrapText(Array.isArray(row) ? row[c] : row[columns[c]] || "", 18, 3)));
    const rowH = 82;
    const startY = 118;
    const colW = 780 / columns.length;
    const header = columns.map((col, i) => `<rect x="${60 + i * colW}" y="78" width="${colW}" height="40" fill="var(--accent)" opacity="${i === 0 ? 1 : 0.82}"/><text x="${72 + i * colW}" y="103" font-size="13" fill="#fff">${escapeSvg(col)}</text>`).join("");
    const body = wrappedRows.map((row, r) => columns.map((_, c) => {
      const lines = row[c].map((line, i) => `<tspan x="${72 + c * colW}" dy="${i === 0 ? 0 : 17}">${escapeSvg(line)}</tspan>`).join("");
      return `<rect x="${60 + c * colW}" y="${startY + r * rowH}" width="${colW}" height="${rowH}" fill="${r % 2 ? "var(--surface)" : "var(--surface-strong)"}" stroke="var(--line)"/><text x="${72 + c * colW}" y="${startY + r * rowH + 24}" font-size="12" fill="currentColor">${lines}</text>`;
    }).join("")).join("");
    return `<svg viewBox="0 0 900 ${Math.max(430, startY + rows.length * rowH + 40)}" role="img" aria-label="${escapeSvg(title)}"><rect x="1" y="1" width="898" height="${Math.max(428, startY + rows.length * rowH + 38)}" rx="8" fill="transparent" stroke="var(--line)"/><text x="40" y="44" font-size="22" fill="currentColor">${escapeSvg(title)}</text><text x="40" y="66" font-size="13" fill="currentColor">${escapeSvg(subtitle)}</text>${header}${body}</svg>`;
  }

  function wrapText(value, limit, maxLines) {
    const text = String(value || "");
    const lines = [];
    let current = "";
    Array.from(text).forEach((char) => {
      if ((current + char).length > limit) {
        lines.push(current);
        current = char;
      } else {
        current += char;
      }
    });
    if (current) lines.push(current);
    if (lines.length > maxLines) {
      const kept = lines.slice(0, maxLines);
      kept[maxLines - 1] = `${kept[maxLines - 1].slice(0, Math.max(0, limit - 1))}…`;
      return kept;
    }
    return lines.length ? lines : [""];
  }

  function flowTspans(value, x, y, limit, maxLines) {
    return wrapText(value, limit, maxLines)
      .map((line, i) => `<tspan x="${x}" y="${y + i * 15}">${escapeSvg(line)}</tspan>`)
      .join("");
  }

  function dot(a, b) {
    return a.reduce((sum, v, i) => sum + v * b[i], 0);
  }

  function softmax(scores) {
    const max = Math.max(...scores);
    const exp = scores.map((s) => Math.exp(s - max));
    const sum = exp.reduce((a, b) => a + b, 0);
    return exp.map((v) => v / sum);
  }

  function escapeSvg(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char]));
  }

  window.GKEN_VISUAL_CORE = core;

  const state = {
    active: "distribution",
    distribution: { mean: 50, sd: 14, samples: 160 },
    regression: { noise: 24, slope: 1.1, bias: 18, samples: 80 },
    classification: { threshold: 50, slope: 1.0, bias: 0, samples: 120 },
    network: { layers: 4, units: 5 },
    attention: { focus: 2, temperature: 1 }
  };

  let canvas;
  let controls;
  let metrics;
  let svgVisual;

  function setup() {
    canvas = document.getElementById("mainCanvas");
    controls = document.getElementById("visualControls");
    metrics = document.getElementById("visualMetrics");
    svgVisual = document.getElementById("svgVisual");
    if (!canvas || !controls || !metrics || !svgVisual) return;
    document.querySelectorAll("[data-visual-tab]").forEach((button) => {
      button.addEventListener("click", () => {
        state.active = button.dataset.visualTab;
        document.querySelectorAll("[data-visual-tab]").forEach((tab) => tab.classList.toggle("is-active", tab === button));
        render();
      });
    });
    render();
  }

  function field(label, min, max, step, value, onInput) {
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
      const next = Number(input.value);
      wrap.querySelector("strong").textContent = next;
      onInput(next);
      draw();
    });
    wrap.append(input);
    controls.append(wrap);
  }

  function render() {
    controls.innerHTML = "";
    const a = state.active;
    if (a === "distribution") {
      field("平均", 20, 80, 1, state.distribution.mean, (v) => state.distribution.mean = v);
      field("標準偏差", 4, 28, 1, state.distribution.sd, (v) => state.distribution.sd = v);
      field("サンプル数", 40, 360, 10, state.distribution.samples, (v) => state.distribution.samples = v);
    }
    if (a === "regression") {
      field("ノイズ標準偏差", 0, 60, 1, state.regression.noise, (v) => state.regression.noise = v);
      field("傾き", -2, 3, 0.1, state.regression.slope, (v) => state.regression.slope = v);
      field("切片", -20, 60, 1, state.regression.bias, (v) => state.regression.bias = v);
    }
    if (a === "classification") {
      field("しきい値", 20, 80, 1, state.classification.threshold, (v) => state.classification.threshold = v);
      field("境界の傾き", -2, 2, 0.1, state.classification.slope, (v) => state.classification.slope = v);
      field("境界の位置", -60, 60, 2, state.classification.bias, (v) => state.classification.bias = v);
    }
    if (a === "network") {
      field("隠れ層ユニット", 3, 10, 1, state.network.units, (v) => state.network.units = v);
    }
    if (a === "attention") {
      field("Query token", 0, 4, 1, state.attention.focus, (v) => state.attention.focus = v);
      field("温度", 0.5, 2.5, 0.1, state.attention.temperature, (v) => state.attention.temperature = v);
    }
    draw();
  }

  function draw() {
    const out = { canvas, svg: svgVisual, metrics };
    if (state.active === "distribution") core.renderDistribution(out, state.distribution);
    if (state.active === "regression") core.renderRegression(out, state.regression);
    if (state.active === "classification") core.renderClassification(out, state.classification);
    if (state.active === "network") core.renderNetwork(out, { title: "ニューラルネットワーク", layers: [{ name: "入力", units: 4 }, { name: "隠れ層", units: state.network.units }, { name: "出力", units: 3 }] });
    if (state.active === "attention") core.renderAttention(out, { tokens: ["私", "は", "AI", "を", "学ぶ"] }, state.attention);
  }

  window.GKEN_VISUALS = { setup, render };
})();
