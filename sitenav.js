// Shared top navigation menu, injected into every page. Register new pages here.
// Collapsible groups + scroll cap so the menu never runs off-screen.
(function () {
  const SITE = [
    { group: "ML Systems Decks", items: [
      { icon: "🖥️", title: "GPU Hardware", sub: "SIMT · HBM · tensor cores · roofline", href: "gpu_hardware_slides.html" },
      { icon: "🚇", title: "Pipeline Parallelism", sub: "GPipe · bubble math · 1F1B", href: "pipeline_parallel_slides.html" },
      { icon: "🧩", title: "Tensor Parallelism & Collectives", sub: "Megatron splits · all-reduce · α-β model", href: "tensor_parallel_slides.html" },
      { icon: "🔮", title: "Transformer Internals", sub: "attention shapes · RoPE · GQA · MoE", href: "transformer_internals_slides.html" },
      { icon: "🗜️", title: "Quantization & Compression", sub: "FP8 · SmoothQuant · GPTQ/AWQ · QLoRA", href: "quantization_slides.html" },
      { icon: "⚡", title: "Inference Serving", sub: "prefill/decode · batching · speculative", href: "inference_serving_slides.html" },
    ]},
    { group: "Applied ML Decks", items: [
      { icon: "🎯", title: "Embeddings, Retrieval & RecSys", sub: "two-tower · ScaNN · logQ · the funnel", href: "recsys_retrieval_slides.html" },
      { icon: "🔎", title: "RAG & Vector Search", sub: "hybrid · HNSW/ScaNN · ColBERT · CRAG", href: "rag_vector_search_slides.html" },
      { icon: "📐", title: "Classical ML Fundamentals", sub: "bias-variance · trees · SVM · CNN/RNN", href: "ml_fundamentals_slides.html" },
      { icon: "🧰", title: "Frameworks & ML Infra", sub: "PyTorch/JAX/TF · Ray · Kubeflow · two Tritons", href: "ml_infra_slides.html" },
    ]},
    { group: "Coding Track", items: [
      { icon: "🪜", title: "DP for Beginners · Part 1", sub: "the 5-step recipe · 1-D DP · fib→robber", href: "dp_beginners_1_slides.html" },
      { icon: "🗺️", title: "DP for Beginners · Part 2", sub: "2-D DP · grids · knapsack · LCS", href: "dp_beginners_2_slides.html" },
      { icon: "🌿", title: "The DP Garden · Guided Reps", sub: "Q→A ladder · pond→boss fight · typed code", href: "dp_garden_slides.html" },
      { icon: "🕊️", title: "Still Waters · DP Conversation", sub: "guided dialogue · voice & music · naming", href: "dp_conversation_slides.html" },
      { icon: "✦", title: "Night Sky · Trees, Graphs & Lists", sub: "coached interactives · tap the BFS · flip pointers", href: "nightsky_slides.html" },
      { icon: "🧮", title: "Algorithm Crib Sheet", sub: "sorting · heaps · Dijkstra/A* · NP-complete", href: "algo_crib.html" },
    ]},
    { group: "Reference", items: [
      { icon: "📚", title: "Name-Drop Database", sub: "every term, searchable, by category", href: "namedrops_browser.html" },
      { icon: "🃏", title: "Fable Addendum Flashcards", sub: "20 practitioner cards · IYKYK layer", href: "flashcards_fable.html" },
      { icon: "📄", title: "Your 157-card Flashcard PDF", sub: "the original field guide — read in-browser", href: "aiml-interview-basics/AI_ML_Equation_Flashcards.pdf" },
    ]},
    ];

  const css = `
    #sitenav { position: fixed; top: .8rem; left: 1.2rem; z-index: 100; font-family: "Segoe UI", system-ui, sans-serif; }
    #sitenav .snbtn { background: #f4f3eced; color: #2a2d33; border: 1px solid #b9b5a4; border-radius: 4px;
      padding: .42rem .85rem; font-size: .9rem; cursor: pointer; }
    #sitenav .snbtn:hover { background: #fffef8; border-color: #8f8a74; }
    #sitenav .snmenu { display: none; position: absolute; top: 2.6rem; left: 0; min-width: 340px;
      max-height: 78vh; overflow-y: auto; background: #f7f6f0fa; border: 1px solid #b9b5a4; border-radius: 4px;
      padding: .5rem; box-shadow: 0 10px 34px #00000038; }
    #sitenav.open .snmenu { display: block; }
    #sitenav .sngroup { color: #2a2d33; font-size: .82rem; text-transform: uppercase; letter-spacing: .14em;
      padding: .55rem .6rem; cursor: pointer; user-select: none; font-weight: 700; border-radius: 3px;
      display: flex; justify-content: space-between; }
    #sitenav .sngroup:hover { background: #ebe9df; }
    #sitenav .sngroup .caret { color: #8f8a74; }
    #sitenav .snitems { display: none; }
    #sitenav .snitems.open { display: block; }
    #sitenav a { display: flex; gap: .7rem; align-items: center; padding: .45rem .6rem; border-radius: 3px;
      text-decoration: none; color: #2a2d33; }
    #sitenav a:hover { background: #ebe9df; }
    #sitenav a.current { background: #e6e3d4; outline: 1px solid #c9c4ac; }
    #sitenav .snicon { font-size: 1.1rem; width: 1.6rem; text-align: center; }
    #sitenav .sntitle { font-size: .93rem; font-weight: 600; line-height: 1.2; }
    #sitenav .snsub { font-size: .74rem; color: #6d6a5c; font-family: Consolas, monospace; }`;

  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  const here = location.pathname.split("/").pop();
  const nav = document.createElement("nav");
  nav.id = "sitenav";
  nav.innerHTML = `<button class="snbtn">☰ AI/ML Prep</button><div class="snmenu">` +
    SITE.map((g, gi) => {
      const hasCurrent = g.items.some(it => it.href === here);
      return `<div class="sngroup" data-g="${gi}">${g.group}<span class="caret">${hasCurrent ? "▾" : "▸"}</span></div>
        <div class="snitems ${hasCurrent ? "open" : ""}" data-g="${gi}">` +
        g.items.map(it => `<a href="${it.href}" class="${it.href === here ? "current" : ""}">
          <span class="snicon">${it.icon}</span>
          <span><span class="sntitle">${it.title}</span><br><span class="snsub">${it.sub}</span></span></a>`).join("") +
        `</div>`;
    }).join("") + `</div>`;
  document.body.appendChild(nav);

  nav.addEventListener("click", e => {
    e.stopPropagation();
    if (e.target.closest(".snbtn")) nav.classList.toggle("open");
    const gh = e.target.closest(".sngroup");
    if (gh) {
      const items = nav.querySelector(`.snitems[data-g="${gh.dataset.g}"]`);
      items.classList.toggle("open");
      gh.querySelector(".caret").textContent = items.classList.contains("open") ? "▾" : "▸";
    }
  });
  document.addEventListener("click", () => nav.classList.remove("open"));
})();
