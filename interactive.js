// Shared Desmos-style slider widgets for all v2 decks.
// Markup: <div class="aiml-widget" data-calc="NAME"> with .sl-row sliders (data-k keys) and a .wout output area.
// Widget chrome is constant across decks (like sitenav), independent of each deck's theme.
(function () {
  const css = `
    .aiml-widget { background:#14161cf2; border:1px solid #2e3442; border-radius:16px; padding:1.3rem 1.6rem;
      color:#e8ecf1; font-family:"Segoe UI", system-ui, sans-serif; max-width:980px; box-shadow:0 8px 30px #0006; }
    .aiml-widget .sl-row { display:flex; align-items:center; gap:1rem; margin:.5rem 0; }
    .aiml-widget .sl-row label { width:220px; color:#9aa4b8; font-size:.95rem; text-align:right; }
    .aiml-widget input[type=range] { flex:1; accent-color:#ffb454; cursor:pointer; }
    .aiml-widget .sl-val { font-family:Consolas,monospace; color:#ffb454; min-width:110px; font-size:.95rem; }
    .aiml-widget .wout { margin-top:1.1rem; border-top:1px solid #2e3442; padding-top:1rem; font-size:1.05rem; line-height:1.7; }
    .aiml-widget .wout .res { font-family:Consolas,monospace; font-size:1.5rem; color:#fff; }
    .aiml-widget .wout .good { color:#76b900; } .aiml-widget .wout .bad { color:#ff6b6b; } .aiml-widget .wout .mid { color:#ffb454; }
    .aiml-widget .obar { height:1.1rem; background:#262c38; border-radius:6px; overflow:hidden; margin:.3rem 0 .6rem; max-width:640px; }
    .aiml-widget .obar > div { height:100%; border-radius:6px; transition:width .15s; }
    .aiml-widget canvas { background:#0d1015; border-radius:10px; margin-top:.4rem; }
    .aiml-widget .dim { color:#9aa4b8; font-size:.9rem; }`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  const f = (x, d = 1) => Number(x.toFixed(d)).toLocaleString();
  const bar = (frac, color) => `<div class="obar"><div style="width:${Math.min(100, frac * 100)}%; background:${color}"></div></div>`;

  const CALCS = {
    // GPU deck: roofline explorer
    roofline(v, el) {
      const I = Math.pow(10, v.logI), bw = v.bw, peak = v.peak;           // FLOP/B, TB/s, TFLOPs
      const attain = Math.min(peak, bw * I), ridge = peak / bw;
      const regime = I < ridge ? `<span class="bad">memory-bound</span> (left of the ridge at ${f(ridge, 0)} FLOP/B)` 
                               : `<span class="good">compute-bound</span> (right of the ridge at ${f(ridge, 0)} FLOP/B)`;
      el.querySelector('[data-k="logI"]+ .sl-val, .sl-val[data-k="logI"]') ;
      setVal(el, "logI", f(I, I < 10 ? 1 : 0) + " FLOP/B");
      setVal(el, "bw", f(bw, 2) + " TB/s"); setVal(el, "peak", f(peak, 0) + " TFLOPs");
      el.querySelector(".wout").innerHTML =
        `attainable: <span class="res">${f(attain, 0)} TFLOPs</span> of ${f(peak, 0)} peak (${f(100 * attain / peak, 0)}% utilization)<br>` +
        `this kernel is ${regime}<br><span class="dim">matmul (big GEMM) ≈ 300+ FLOP/B · attention ≈ 1–10 · elementwise ≈ 0.25 — slide the intensity to visit each</span>`;
      // canvas
      const cv = el.querySelector("canvas"); if (!cv) return;
      const c = cv.getContext("2d"), W = cv.width, H = cv.height;
      c.clearRect(0, 0, W, H);
      const x = li => (li + 1) / 4.2 * (W - 60) + 45;                    // log10 I in [-1, 3.2]
      const y = lt => H - 28 - (lt + 1) / 4.6 * (H - 50);                // log10 TFLOPs in [-1, 3.6]
      c.strokeStyle = "#39404e"; c.lineWidth = 1; c.font = "11px Consolas"; c.fillStyle = "#9aa4b8";
      for (let li = -1; li <= 3; li++) { c.beginPath(); c.moveTo(x(li), 12); c.lineTo(x(li), H - 28); c.stroke(); c.fillText("10^" + li, x(li) - 12, H - 12); }
      for (let lt = 0; lt <= 3; lt++) { c.beginPath(); c.moveTo(45, y(lt)); c.lineTo(W - 12, y(lt)); c.stroke(); c.fillText("10^" + lt, 4, y(lt) + 4); }
      c.fillText("arithmetic intensity (FLOP/byte) →", W / 2 - 90, H - 2);
      // roof: slope then flat
      const lr = Math.log10(ridge), lp = Math.log10(peak);
      c.strokeStyle = "#76b900"; c.lineWidth = 2.5; c.beginPath();
      c.moveTo(x(-1), y(Math.log10(bw * 0.1))); c.lineTo(x(lr), y(lp)); c.lineTo(x(3.2), y(lp)); c.stroke();
      // the kernel dot
      c.fillStyle = "#ffb454"; c.beginPath(); c.arc(x(Math.log10(I)), y(Math.log10(attain)), 7, 0, 7); c.fill();
      c.strokeStyle = "#ffb454"; c.setLineDash([4, 4]); c.beginPath();
      c.moveTo(x(Math.log10(I)), H - 28); c.lineTo(x(Math.log10(I)), y(Math.log10(attain))); c.stroke(); c.setLineDash([]);
    },

    // Pipeline deck: bubble calculator
    bubble(v, el) {
      const p = v.p, m = v.m, b = (p - 1) / (m + p - 1);
      setVal(el, "p", p + " stages"); setVal(el, "m", m + " micro-batches");
      const verdict = b < .08 ? '<span class="good">healthy</span>' : b < .2 ? '<span class="mid">tolerable</span>' : '<span class="bad">bleeding GPU-hours</span>';
      el.querySelector(".wout").innerHTML =
        `bubble = (p−1)/(m+p−1) = ${p - 1}/${m + p - 1} = <span class="res">${f(b * 100, 1)}%</span> idle — ${verdict}` +
        bar(b, "#e85d9e") +
        `<span class="dim">GPipe in-flight activations ∝ m = ${m} · 1F1B caps it at ≤ p = ${p} (${f(m / Math.min(p, m), 1)}× memory saving) — cranking m is only free under 1F1B</span>`;
    },

    // TP deck: ring vs tree all-reduce (α-β model)
    allreduce(v, el) {
      const p = v.p, n = Math.pow(10, v.logn), a = v.alpha, bw = v.bw;   // MB, µs, GB/s
      const nGB = n / 1024;
      const ring = 2 * (p - 1) * a / 1000 + 2 * ((p - 1) / p) * nGB / bw * 1000;   // ms
      const tree = 2 * Math.ceil(Math.log2(p)) * a / 1000 + 2 * nGB / bw * 1000;   // ms
      setVal(el, "p", p + " GPUs"); setVal(el, "logn", f(n, 0) + " MB");
      setVal(el, "alpha", f(a, 0) + " µs"); setVal(el, "bw", f(bw, 0) + " GB/s");
      const win = ring <= tree ? '<span class="good">ring wins</span> (bandwidth regime)' : '<span class="bad">tree wins</span> (latency regime — small message or huge p)';
      el.querySelector(".wout").innerHTML =
        `ring: <span class="res">${f(ring, 2)} ms</span> &nbsp;·&nbsp; pipelined tree: <span class="res">${f(tree, 2)} ms</span> → ${win}<br>` +
        `<span class="dim">ring latency term grows with p (${2 * (p - 1)}α); tree's only with log p (${2 * Math.ceil(Math.log2(p))}α). NCCL switches automatically by message size.</span>`;
    },

    // Transformer deck: KV cache sizer
    kvcache(v, el) {
      const L = v.L, kh = v.kh, dh = v.dh, seq = v.seq * 1000, by = v.by, batch = v.batch;
      const gb = 2 * L * kh * dh * seq * by * batch / 1e9;
      setVal(el, "L", L + " layers"); setVal(el, "kh", kh + " KV heads"); setVal(el, "dh", dh + " head dim");
      setVal(el, "seq", f(v.seq, 0) + "k tokens"); setVal(el, "by", by + " B (FP" + by * 8 + ")"); setVal(el, "batch", "batch " + batch);
      const fits = gb < 20 ? '<span class="good">plenty of room next to weights</span>' : gb < 60 ? '<span class="mid">squeezing the weight budget</span>' : '<span class="bad">eating the whole H100</span>';
      el.querySelector(".wout").innerHTML =
        `KV cache = 2·L·heads·d_h·seq·bytes·batch = <span class="res">${f(gb, 1)} GB</span> — ${fits}` +
        bar(gb / 80, gb < 20 ? "#76b900" : gb < 60 ? "#ffb454" : "#ff6b6b") +
        `<span class="dim">bar = share of one 80 GB H100. Now set KV heads 64 → 8: that's GQA's entire value proposition, live.</span>`;
    },

    // Transformer deck: MoE params vs FLOPs
    moe(v, el) {
      const E = v.E, k = v.k, s = v.s / 10, base = v.base;               // experts, top-k, B per expert, attention+shared B
      const total = base + E * s, active = base + k * s;
      setVal(el, "E", E + " experts"); setVal(el, "k", "top-" + k); setVal(el, "s", f(s, 1) + " B/expert"); setVal(el, "base", f(base, 0) + " B shared");
      el.querySelector(".wout").innerHTML =
        `total parameters: <span class="res">${f(total, 0)} B</span> &nbsp;·&nbsp; active per token: <span class="res">${f(active, 0)} B</span> ` +
        `→ <span class="good">${f(total / active, 1)}× more knowledge at the same FLOPs</span>` +
        bar(active / total, "#76b900") +
        `<span class="dim">green = fraction of the model each token actually touches. DeepSeek-V3 real numbers: 671B total, ~37B active (E=256 fine-grained + shared experts, k=8).</span>`;
    },

    // Quantization deck: decode speed
    decode(v, el) {
      const P = Math.pow(10, v.logP), bits = v.bits, bw = v.bw;
      const gb = P * bits / 8, tok = bw * 1000 / gb;
      setVal(el, "logP", f(P, 0) + " B params"); setVal(el, "bits", bits + "-bit"); setVal(el, "bw", f(bw, 2) + " TB/s");
      const fits = gb < 70 ? '<span class="good">fits one H100 with KV room</span>' : gb < 80 ? '<span class="mid">barely fits — no KV room</span>' : '<span class="bad">needs sharding (TP)</span>';
      el.querySelector(".wout").innerHTML =
        `weights: <span class="res">${f(gb, 0)} GB</span> (${fits}) · decode ceiling: <span class="res">~${f(tok, 0)} tok/s</span> at batch 1` +
        bar(gb / 80, gb < 70 ? "#76b900" : "#ff6b6b") +
        `<span class="dim">tokens/sec ≈ bandwidth ÷ weight-bytes. Halve the bits → double the ceiling — the whole quantization thesis in one slider.</span>`;
    },

    // Serving deck: batch size vs regime
    batchregime(v, el) {
      const b = Math.round(Math.pow(10, v.logB)), ridge = v.ridge;
      setVal(el, "logB", "batch " + b); setVal(el, "ridge", ridge + " FLOP/B chip ratio");
      const util = Math.min(1, b / ridge);
      const reg = b < ridge ? `<span class="bad">memory-bound</span> — ALUs ${f(util * 100, 0)}% busy, bandwidth 100% busy` : `<span class="good">compute-bound</span> — the batch finally feeds the ALUs`;
      el.querySelector(".wout").innerHTML =
        `decode arithmetic intensity ≈ batch = <span class="res">${b} FLOP/B</span> → ${reg}` +
        bar(util, b < ridge ? "#ffb454" : "#76b900") +
        `<span class="dim">each weight byte loaded does ~batch useful FLOPs. This is why throughput serving = batching, and why batch-1 latency is a bandwidth story.</span>`;
    },

    // RecSys deck: brute force or index?
    bruteforce(v, el) {
      const N = Math.pow(10, v.logN), d = v.d, qps = Math.pow(10, v.logQ);
      const gflop = 2 * N * d / 1e9, totalT = gflop * qps / 1000, memGB = N * d * 4 / 1e9;
      setVal(el, "logN", f(N, 0) + " items"); setVal(el, "d", d + " dims"); setVal(el, "logQ", f(qps, 0) + " QPS");
      const verdict = N <= 2e6 ? '<span class="good">brute force on GPU — skip the index</span>'
        : totalT < 50 ? '<span class="mid">borderline — benchmark both</span>' : '<span class="bad">ANN index required (HNSW / ScaNN)</span>';
      el.querySelector(".wout").innerHTML =
        `per query: <span class="res">${f(gflop, 2)} GFLOPs</span> · fleet total: <span class="res">${f(totalT, 1)} TFLOP/s</span> · embeddings: <span class="res">${f(memGB, 1)} GB</span> FP32<br>${verdict}<br>` +
        `<span class="dim">the 30-second math that justifies (or kills) the entire vector-index industry for your use case.</span>`;
    },

    // RAG deck: rerank latency budget
    rerank(v, el) {
      const N = v.N, ms = v.ms / 10, par = v.par, budget = v.budget;
      const lat = N * ms / par;
      setVal(el, "N", N + " candidates"); setVal(el, "ms", f(ms, 1) + " ms/doc"); setVal(el, "par", par + "× parallel"); setVal(el, "budget", budget + " ms budget");
      const ok = lat <= budget ? '<span class="good">fits the budget</span>' : '<span class="bad">blows the budget — fewer candidates, ColBERT, or a smaller reranker</span>';
      el.querySelector(".wout").innerHTML =
        `cross-encoder rerank latency: <span class="res">${f(lat, 0)} ms</span> of ${budget} ms — ${ok}` +
        bar(lat / budget, lat <= budget ? "#76b900" : "#ff6b6b") +
        `<span class="dim">this slider IS the funnel argument: expensive-per-item models only touch few items. Watch N=500 destroy any budget.</span>`;
    },

    // Fundamentals deck: bias-variance explorer
    biasvar(v, el) {
      const c = v.c, dat = v.dat;
      const train = 1 / (1 + 0.09 * c);
      const gap = 0.9 * (c * c) / (c * c + 900) / Math.sqrt(dat / 10);
      const val = train + gap;
      setVal(el, "c", "capacity " + c); setVal(el, "dat", dat + "k examples");
      const verdict = train > .45 ? '<span class="bad">underfitting — both errors high (bias)</span>'
        : gap > .25 ? '<span class="bad">overfitting — gap is the tell (variance)</span>'
        : '<span class="good">sweet spot — low train error, small gap</span>';
      el.querySelector(".wout").innerHTML =
        `train error: <span class="res">${f(train * 100, 0)}%</span>` + bar(train, "#4da3ff") +
        `validation error: <span class="res">${f(val * 100, 0)}%</span>` + bar(val, "#ff6b6b") +
        `${verdict}<br><span class="dim">slide capacity up with little data → watch the gap explode; then feed it data → gap shrinks. That's the whole tradeoff, and 'more data fixes variance' live.</span>`;
    },
  };

  function setVal(el, k, text) {
    const s = el.querySelector(`.sl-val[data-k="${k}"]`); if (s) s.textContent = text;
  }

  document.querySelectorAll(".aiml-widget").forEach(w => {
    const fn = CALCS[w.dataset.calc]; if (!fn) return;
    const update = () => {
      const v = {};
      w.querySelectorAll("input[type=range]").forEach(r => v[r.dataset.k] = parseFloat(r.value));
      fn(v, w);
    };
    w.querySelectorAll("input[type=range]").forEach(r => r.addEventListener("input", update));
    w.addEventListener("click", e => e.stopPropagation());   // don't advance slides while sliding
    update();
  });
})();
