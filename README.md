# AIML Interview Basics

Interactive slide decks + narrated walkthroughs for AI/ML engineering interview prep — hardware to serving, fundamentals to RAG, plus a dynamic-programming learning track and a boutique-themed deep dive on sampled softmax / contrastive learning.

Every deck is a **single self-contained HTML file**. No build step, no npm, no dependencies you have to install — just open it in a browser (or serve the folder).

> 🎉 Built over three weeks of interview prep. The interview went amazingly. Sharing in case any of it helps someone else.

## What's inside

Each deck has:

- **Hoverable name-drops** — ~100 interview-ready terms (papers, libraries, laws, systems) with *What / Why it matters / Alternatives* cards, backed by one shared database (`namedrops.js`)
- **Desmos-style sliders** — interactive calculators for the formulas that actually matter: the roofline model, pipeline bubble, ring-vs-tree all-reduce, KV-cache sizing, MoE params-vs-FLOPs, decode-speed ceilings, bias-variance, and more
- **Speaker notes** (press `N`) carrying the depth: citations, derivations, worked estimates, follow-up answers interviewers fish for
- **Audio room** (bottom-right 🎛) — optional voice narration that reads the speaker notes, plus 5 generated music styles (harp/calypso · classical · music box · nocturne · ocean swells), no files, no percussion
- **Consistent nav menu** (`☰`) across all pages, each deck with its own visual identity (paper tints, graph-paper grids, deck-themed accents)

## The decks

### 🧠 ML Systems
| Deck | Covers |
|---|---|
| 🖥️ GPU Hardware | SIMT, memory hierarchy, HBM, tensor cores, roofline + interactive roofline explorer |
| 🚇 Pipeline Parallelism | GPipe, bubble math, 1F1B, zero-bubble schedules + bubble calculator |
| 🧩 Tensor Parallelism & Collectives | Megatron splits, all-reduce internals, α-β cost model + ring-vs-tree slider |
| 🔮 Transformer Internals | attention shapes, GQA, RoPE, MoE + KV-cache sizer + MoE explorer |
| 🗜️ Quantization & Compression | FP8, SmoothQuant, GPTQ/AWQ, QLoRA, GGUF + decode-speed slider |
| ⚡ Inference Serving | prefill/decode, continuous batching, disaggregation, speculative decoding + batching-regime finder |

### 📊 Applied ML
| Deck | Covers |
|---|---|
| 🎯 Embeddings, Retrieval & RecSys | two-tower, sampled softmax + logQ, ScaNN, the funnel + brute-force-or-index calculator |
| 🔎 RAG & Vector Search | hybrid search, HNSW/ScaNN, ColBERT→cross-encoder spectrum, agentic RAG + rerank-budget slider |
| 📐 Classical ML Fundamentals | bias-variance, regularization, trees/ensembles, SVMs, CNN/RNN, building a tiny NN + bias-variance explorer |
| 🧰 Frameworks & ML Infra | PyTorch / JAX / TF, Ray, both Tritons, Kubeflow, vector DBs, MLOps |

### 👩‍💻 Coding Track
| Deck | Covers |
|---|---|
| 🪜 DP for Beginners · Part 1 | the 5-step recipe · 1-D DP · Fibonacci → House Robber + interactive fib explorer |
| 🗺️ DP for Beginners · Part 2 | 2-D DP · grids · 0/1 knapsack · LCS + self-drawing DP tables |
| 🌿 The DP Garden · Guided Reps | Q→A rep ladder, pond → boss-fight, typewriter code, procedural lily pads |
| �️ Still Waters · DP Conversation | guided dialogue (coach / you / reveal beats), optional voice, naming conventions, stepping-stones + coin-change walkthroughs |
| ✦ Night Sky · Trees, Graphs & Lists | coached interactives — flip linked-list pointers by hand, tap stars in BFS order, DFS vs BFS race |
| 🧮 Algorithm Crib Sheet | sorting, binary search, heaps, queues, Dijkstra, A*, graph complexity, NP-complete |
| 👗 The logQ Boutique | sampled softmax, logQ correction, contrastive learning / InfoNCE, ScaNN vs PCA — with a 3D Plotly embedding animation |

### 📚 Reference
| Page | Covers |
|---|---|
| 📚 Name-drop database | every term in the decks, searchable, grouped by category |
| 🃏 Fable Addendum Flashcards | 20 companion "practitioner" flashcards with an **IYKYK** field (cross-validation gotchas, offline↔online gap, threshold economics, monotonic stack triggers, etc.) |
| 📄 157-card flashcard PDF | the full equation flashcard field guide |

## Run it

```bash
python -m http.server 8000
# open http://localhost:8000/
```

Or just open any `_slides.html` file directly in a browser — everything's static.

## Controls

- `←` / `→` — navigate slides (within a conversation-style deck, `→` first advances through dialogue beats)
- `N` — toggle speaker notes
- `F` — fullscreen
- Hover amber-dashed terms — name-drop cards with What / Why it matters / Alternatives
- Drag the sliders — the calculators are live
- Bottom-right 🎛 — audio room (voice + music, both off by default)

## Design notes

- **Semantic color conventions across all decks**: 🟢 green = compute/GPU/throughput · 🔵 blue = CPU/host/communication · 🟡 amber = name-drops. In the DP series specifically: 🟣 indigo = STATE, 🌹 rose = TRANSITION, 🌊 teal = BASE CASE.
- **Backgrounds** are subtle vmin-sized grids tinted to each deck's accent — they resize with the window; some decks use dot patterns, hex meshes, or slanted grids for variety.
- **Multiple representations** of every idea where feasible: equation + table + diagram + interactive slider + animated scene.
- **Mid-century atomic accents** (four-pointed starbursts) on title slides, with per-star twinkle offsets.

## Credits

- PDF flashcards: a 157-card equation field guide (included in repo)
- The `slideology` doctrine informed every deck's visual choices
- `namedrops` database aggregates citations from the papers / libraries / documentation referenced throughout
