/* ==========================================================================
   kamal.agent — a tiny, server-less conversational interface.
   No LLM, no deps: Kamal's story, structured, streamed.
   ========================================================================== */
(function () {
  "use strict";

  var stream = document.getElementById("stream");
  var form   = document.getElementById("form");
  var input  = document.getElementById("q");
  var chips  = document.getElementById("chips");
  var themeBtn = document.getElementById("theme");
  var root   = document.documentElement;

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- theme --------------------------------------------------------- */

  var stored = null;
  try { stored = localStorage.getItem("kg-theme"); } catch (e) {}
  if (stored) root.setAttribute("data-theme", stored);
  syncThemeGlyph();

  themeBtn.addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("kg-theme", next); } catch (e) {}
    syncThemeGlyph();
  });

  function syncThemeGlyph() {
    var dark = root.getAttribute("data-theme") === "dark";
    themeBtn.querySelector(".iconbtn__glyph").textContent = dark ? "☾" : "☀";
  }

  /* ---- content ------------------------------------------------------- */

  var PROJECTS = [
    { title: "Measuring Style Similarity in Diffusion Models",
      venue: "ECCV 2024",
      desc: "Style descriptors that quantify stylistic similarity and trace a generated image's style back to its training data.",
      authors: "G. Somepalli, A. Gupta, K. Gupta, S. Palta, M. Goldblum, J. Geiping, A. Shrivastava, T. Goldstein",
      media: "/images/csd.jpg",
      paper: "https://arxiv.org/abs/2404.01292",
      code: "https://github.com/learn2phoenix/CSD" },

    { title: "ASIC — Aligning Sparse in-the-wild Image Collections",
      venue: "ICCV 2023",
      desc: "Learning dense correspondences for long-tail, in-the-wild image collections.",
      authors: "K. Gupta, V. Jampani, C. Esteves, A. Shrivastava, A. Makadia, N. Snavely, A. Kar",
      media: "/images/asic.jpg",
      web: "https://kampta.github.io/asic",
      paper: "https://arxiv.org/abs/2303.16201",
      code: "https://github.com/kampta/asic" },

    { title: "SHACIRA — Scalable Hash-grid Compression for Implicit Neural Representations",
      venue: "ICCV 2023",
      desc: "An end-to-end compression framework for feature-grid INRs.",
      authors: "S. Girish, A. Shrivastava, K. Gupta",
      media: "/images/shacira.jpg",
      web: "https://shacira.github.io/",
      paper: "https://arxiv.org/abs/2309.15848",
      code: "https://github.com/Sharath-girish/Shacira" },

    { title: "ChopNLearn — Generating Object-State Compositions",
      venue: "ICCV 2023",
      desc: "A benchmark for recognizing and generating object-state compositions across images and videos.",
      authors: "N. Saini, H. Wang, A. Swaminathan, V. Jayasundara, B. He, K. Gupta, A. Shrivastava",
      media: "/images/chopnlearn.jpg",
      web: "https://chopnlearn.github.io/",
      paper: "https://arxiv.org/abs/2309.14339",
      code: "https://drive.google.com/drive/folders/1QylDeUJ8h-CjLRJ8Z9bsdCoQ2uMs59W_" },

    { title: "LilNetX — Lightweight Networks with Extreme Compression & Structured Sparsity",
      venue: "ICLR 2023",
      desc: "A training scheme that trades accuracy for compression during training itself.",
      authors: "S. Girish, K. Gupta, S. Singh, A. Shrivastava",
      media: "/images/lilnetx.jpg",
      paper: "https://arxiv.org/abs/2204.02965",
      code: "https://github.com/Sharath-girish/LilNetX" },

    { title: "Neural Space-filling Curves",
      venue: "ECCV 2022",
      desc: "A data-driven, context-aware scan order over images — enabling better compression and sequential generation.",
      authors: "H. Wang, K. Gupta, L. Davis, A. Shrivastava",
      media: "/images/sfc.jpg",
      video: "/images/sfc.mp4",
      web: "https://hywang66.github.io/publication/neuralsfc",
      paper: "https://arxiv.org/abs/2204.08453",
      code: "https://github.com/hywang66/NeuralSFC" },

    { title: "PatchGame — Learning to Signal in Referential Games",
      venue: "NeurIPS 2021",
      desc: "Emergent communication via mid-level patches in a large-scale referential game.",
      authors: "K. Gupta, G. Somepalli, A. Gupta, V. Jayasundara, M. Zwicker, A. Shrivastava",
      media: "/images/patch_game.jpg",
      paper: "https://arxiv.org/abs/2111.01785",
      code: "https://github.com/kampta/PatchGame" },

    { title: "LayoutTransformer — Layout Generation with Self-attention",
      venue: "ICCV 2021",
      desc: "A generative model for layouts across 3D shapes, images, documents, and app wireframes.",
      authors: "K. Gupta, A. Achille, J. Lazarow, L. Davis, V. Mahadevan, A. Shrivastava",
      media: "/images/layout/layout_teasor.jpg",
      paper: "https://arxiv.org/abs/2006.14615",
      code: "https://github.com/kampta/DeepLayout" },

    { title: "The Lottery Ticket Hypothesis for Object Recognition",
      venue: "CVPR 2021",
      desc: "Finding sparse networks (up to 80% sparsity) for detection, segmentation, and pose estimation.",
      authors: "S. Girish, S. Maiya, K. Gupta, H. Chen, L. Davis, A. Shrivastava",
      media: "/images/lth_teaser.jpg",
      web: "https://lth-recognition.github.io",
      paper: "https://arxiv.org/abs/2012.04643",
      code: "https://github.com/Sharath-girish/LTH-ObjectRecognition" },

    { title: "Improved Modeling of 3D Shapes with Multi-view Depth Maps",
      venue: "3DV 2020",
      desc: "An encoder–decoder generative model for 3D shapes; SOTA single-view reconstruction and generation.",
      authors: "K. Gupta, S. Jabbireddy, K. Shah, A. Shrivastava, M. Zwicker",
      media: "/images/multiview-shapes/teaser_web.jpg",
      video: "/images/multiview-shapes/teaser_web.mp4",
      paper: "https://arxiv.org/abs/2009.03298",
      code: "https://github.com/kampta/multiview-shapes" },

    { title: "PatchVAE — Learning Local Latent Codes for Recognition",
      venue: "CVPR 2020",
      desc: "A patch-based VAE that learns interesting parts of an image — better representations for recognition.",
      authors: "K. Gupta, S. Singh, A. Shrivastava",
      media: "/images/patchvae/teaser_web.jpg",
      video: "/images/patchvae/teaser_web.mp4",
      paper: "https://arxiv.org/abs/2004.03623",
      code: "https://github.com/kampta/PatchVAE" }
  ];

  var ANSWERS = {
    about: {
      text:
        "**Kamal Gupta** — building Optimus at [Tesla AI](https://www.tesla.com/AI).\n\n" +
        "Less chatbot, more robot: I build AI agents that **see**, **reason**, " +
        "and **act** in the physical world.\n\n" +
        "**PhD in AI**, [University of Maryland](https://www.umd.edu). Past: [Google](https://research.google), " +
        "[NVIDIA](https://github.com/NVlabs), [Amazon AI Labs](https://www.amazon.science).\n\n" +
        "Lately — Optimus work and recent research:",
      render: renderNews
    },

    research: {
      text: "Selected work — recent first:",
      render: renderProjects
    },

    experience: {
      text: "Machine Learning, Computer Vision, Robotics:",
      render: renderTimeline
    },

    contact: {
      text:
        "Reach me:\n\n" +
        "[Email](mailto:kamalgupta308@gmail.com) · " +
        "[GitHub](https://github.com/kampta) · " +
        "[Scholar](https://scholar.google.com/citations?user=tC3td8cAAAAJ) · " +
        "[X](https://twitter.com/kamalgupta09) · " +
        "[LinkedIn](https://www.linkedin.com/in/kamalgupta09)\n\n" +
        "Best way to reach me: **email** or **X**."
    },

    cv: {
      text:
        "[CV (PDF)](/pubs/kamal_gupta_cv.pdf) — opens in a new tab.\n\n" +
        "Tesla Optimus · PhD in AI, UMD · 15+ papers at CVPR / ICCV / ECCV / NeurIPS / ICLR."
    },

    meta: {
      text:
        "A tiny agent — no LLM, no server. Just Kamal's story, structured.\n\n" +
        "The interface *is* the agent. Try **research**."
    },

    hello: {
      text:
        "Hey 👋 I'm Kamal's agent. Ask about **research**, **experience**, or **contact**."
    },

    fallback: {
      text:
        "I only know Kamal's story — try **research**, **experience**, **contact**, " +
        "or **cv** below, or ask *who is Kamal*."
    }
  };
  ANSWERS.news = ANSWERS.about; // news is merged into the landing/about

  /* keyword → intent */
  function classify(q) {
    var s = q.toLowerCase().trim();
    if (/\b(hi|hey|hello|yo|sup|thanks|thank you|thx)\b/.test(s)) return "hello";
    if (/(news|latest|update|recent|optimus|video|talk|demo)/.test(s)) return "about";
    if (/(research|paper|publication|work|project|robot)/.test(s)) return "research";
    if (/(experience|background|career|industry|history|before|past|job|intern)/.test(s)) return "experience";
    if (/(contact|email|reach|connect|social|twitter|github|linkedin|scholar)/.test(s)) return "contact";
    if (/(cv|resume|curriculum)/.test(s)) return "cv";
    if (/(this site|this page|agentic|how.*(built|made|work)|what is this|who.*made|meta)/.test(s)) return "meta";
    if (/(who|about|yourself|bio|kamal|you\b|tell me)/.test(s)) return "about";
    return "fallback";
  }

  /* ---- DOM builders -------------------------------------------------- */

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function userMsg(textValue) {
    var m = el("div", "msg msg--user");
    m.appendChild(el("div", "msg__role", "you"));
    m.appendChild(el("div", "bubble", textValue));
    stream.appendChild(m);
    anchorEl = m;          // pin this new question to the top
    userScrolled = false;  // fresh exchange — resume auto-anchoring
    scrollDown();
    return m;
  }

  // Build author lines as DOM nodes (no innerHTML) — bold "K. Gupta".
  function appendAuthors(node, authorStr) {
    authorStr.split(/(K\. Gupta)/g).forEach(function (part) {
      if (!part) return;
      node.appendChild(
        part === "K. Gupta" ? el("b", null, part)
                            : document.createTextNode(part));
    });
  }

  function isExternal(href) { return /^https?:\/\//.test(href); }

  function renderProjects(container) {
    var wrap = el("div", "cards");
    PROJECTS.forEach(function (p) {
      var card = el("article", "card");

      var media = el("div", "card__media");
      if (p.video) {
        var v = document.createElement("video");
        v.muted = true; v.loop = true; v.autoplay = true;
        v.playsInline = true; v.setAttribute("playsinline", "");
        v.preload = "metadata"; v.poster = p.media;
        var src = document.createElement("source");
        src.src = p.video; src.type = "video/mp4";
        v.appendChild(src);
        media.appendChild(v);
      } else {
        var img = new Image();
        img.loading = "lazy";
        img.alt = p.title;
        img.src = p.media;
        media.appendChild(img);
      }

      var body = el("div", "card__body");
      var primary = p.web || p.paper;
      var t = el("a", "card__title", p.title);
      t.href = primary; t.target = "_blank"; t.rel = "noopener noreferrer";
      body.appendChild(t);
      body.appendChild(el("span", "card__venue", p.venue));
      body.appendChild(el("p", "card__desc", p.desc));

      var au = el("p", "card__authors");
      appendAuthors(au, p.authors);
      body.appendChild(au);

      var links = el("div", "card__links");
      [["Web", p.web], ["Paper", p.paper], ["Code", p.code]].forEach(function (pair) {
        if (!pair[1]) return;
        var a = el("a", null, pair[0]);
        a.href = pair[1]; a.target = "_blank"; a.rel = "noopener noreferrer";
        links.appendChild(a);
      });
      body.appendChild(links);

      card.appendChild(media);
      card.appendChild(body);
      wrap.appendChild(card);
    });
    container.appendChild(wrap);
  }

  function renderTimeline(container) {
    var rows = [
      ["Tesla AI · Optimus — Staff Research Scientist", "Embodied alignment & long-range video understanding (May 2023 –)", "https://www.tesla.com/AI"],
      ["PhD, University of Maryland", "“Learning and Composing Primitives for the Visual World” (2018–23)", "https://www.umd.edu"],
      ["Google · NVIDIA · Amazon — Research Intern", "ASIC, generative 3D meshes, autoregressive vision (2019–22)", "https://research.google"],
      ["NetraDyne — Staff Research Engineer", "On-device temporal video models for driver safety (2017–18)", "http://netradyne.com"],
      ["Poolka AI — Co-founder & CTO", "Fairi: an early multimodal fashion chat agent (2016–17)", null],
      ["American Express AI Labs — Research Engineer", "Large-scale recommendation & geometric deep learning (2013–16)", "https://www.americanexpress.com/in/careers/ai-labs.html"],
      ["CMU Robotics · IIT Delhi", "Earlier research — vineyard yield & MAV pose estimation", null]
    ];
    var ul = el("ul", "timeline");
    rows.forEach(function (r) {
      var li = document.createElement("li");
      if (r[2]) {
        var a = el("a", "where", r[0]);
        a.href = r[2]; a.target = "_blank"; a.rel = "noopener noreferrer";
        li.appendChild(a);
      } else {
        li.appendChild(el("span", "where", r[0]));
      }
      li.appendChild(document.createElement("br"));
      li.appendChild(el("span", "what", r[1]));
      ul.appendChild(li);
    });
    container.appendChild(ul);
  }

  function renderNews(container) {
    var optimus = [
      { date: "Sep 2023", t: "Multi-task learning & recovering from failures",
        x: "https://x.com/Tesla_Optimus/status/1705728820693668189",
        thumb: "/assets/optimus-2023.jpg" },
      { date: "2024", t: "Reliable, useful tasks for real-world use cases",
        yt: "DrNcXgoFv20", thumb: "/assets/optimus-2024.jpg" },
      { date: "Oct 2024", t: "Public demo — 20+ robots interacting, dancing, serving drinks",
        yt: "agrfdLcE8qc", thumb: "/assets/optimus-2024-demo.jpg" },
      { date: "May 2025", t: "Scaling with human data",
        x: "https://x.com/Tesla_Optimus/status/1925047336256078302",
        thumb: "/assets/optimus-2025.jpg" }
    ];

    var grid = el("div", "vidgrid");
    optimus.forEach(function (o) {
      var a = document.createElement("a");
      a.className = "vid" + (o.x ? " vid--x" : "");
      a.href = o.yt ? "https://www.youtube.com/watch?v=" + o.yt : o.x;
      a.target = "_blank";
      a.rel = "noopener noreferrer";

      if (o.thumb) {
        var th = new Image();
        th.loading = "lazy";
        th.decoding = "async";
        th.alt = o.t;
        th.src = o.thumb; // self-hosted — no third-party request
        a.appendChild(th);
      }
      a.appendChild(el("span", "vid__play", "▶"));

      var meta = el("div", "vid__meta");
      meta.appendChild(el("b", null, "Tesla Optimus · " + o.date));
      meta.appendChild(document.createTextNode(o.t));
      a.appendChild(meta);

      if (o.yt) {
        a.addEventListener("click", function (e) {
          e.preventDefault();
          a.textContent = "";
          var fr = document.createElement("iframe");
          fr.src = "https://www.youtube-nocookie.com/embed/" + o.yt +
                   "?autoplay=1&rel=0";
          fr.title = o.t;
          fr.allow =
            "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
          fr.allowFullscreen = true;
          a.appendChild(fr);
        });
      }
      grid.appendChild(a);
    });
    container.appendChild(grid);

    var milestones = [
      ["2024", "“Style Similarity in Diffusion Models” & “LiFT” accepted to ECCV 2024"],
      ["2023", "ASIC, SHACIRA & Chop&Learn at ICCV 2023; “Teaching Matters” at CVPR 2023"],
      ["May 2023", "Defended PhD at UMD; joined Tesla Optimus"],
      ["Awards", "Outstanding Reviewer CVPR 2022 · Outstanding GRA, UMD · Kulkarni Fellow"]
    ];
    var ul = el("ul", "timeline");
    milestones.forEach(function (r) {
      var li = document.createElement("li");
      li.appendChild(el("span", "where", r[0]));
      li.appendChild(document.createElement("br"));
      li.appendChild(el("span", "what", r[1]));
      ul.appendChild(li);
    });
    container.appendChild(ul);
  }

  /* ---- inline markdown → token segments ------------------------------ */

  function tokenize(par) {
    var re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)|\*([^*]+)\*/g;
    var out = [], last = 0, m;
    while ((m = re.exec(par))) {
      if (m.index > last) out.push({ t: "text", s: par.slice(last, m.index) });
      if (m[1] != null) {
        var lk = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(m[1]);
        if (lk) out.push({ t: "a", s: lk[1], href: lk[2] });
        else    out.push({ t: "b", s: m[1] });
      }
      else if (m[2] != null)  out.push({ t: "a", s: m[2], href: m[3] });
      else if (m[4] != null)  out.push({ t: "i", s: m[4] });
      last = re.lastIndex;
    }
    if (last < par.length) out.push({ t: "text", s: par.slice(last) });
    return out;
  }

  function makeNode(seg) {
    if (seg.t === "b") return el("strong");
    if (seg.t === "i") return el("em");
    if (seg.t === "a") {
      var a = el("a");
      a.href = seg.href;
      if (isExternal(seg.href)) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
      return a;
    }
    return document.createTextNode("");
  }

  /* ---- streaming engine --------------------------------------------- */

  var active = null; // { skip:false }

  function agentMessage(answer) {
    var m = el("div", "msg msg--agent");
    m.appendChild(el("div", "msg__role", "agent"));
    var body = el("div", "body");
    m.appendChild(body);
    stream.appendChild(m);
    scrollDown();

    var ctl = active = { skip: false };

    return think(body, ctl)
      .then(function () {
        return typeText(body, answer.text, ctl);
      })
      .then(function () {
        if (answer.render) {
          answer.render(body);
          scrollDown();
        }
        if (active === ctl) active = null;
      });
  }

  function think(body, ctl) {
    return new Promise(function (resolve) {
      if (reduceMotion) return resolve();
      var t = el("div", "thinking");
      t.appendChild(el("i")); t.appendChild(el("i")); t.appendChild(el("i"));
      body.appendChild(t);
      scrollDown();
      var wait = 220 + Math.random() * 240;
      var done = function () { t.remove(); resolve(); };
      var timer = setTimeout(done, wait);
      ctl.bump = function () { clearTimeout(timer); };
    });
  }

  function typeText(body, src, ctl) {
    var paragraphs = src.split(/\n\n/);

    if (reduceMotion) {
      paragraphs.forEach(function (par) {
        var p = el("p");
        tokenize(par).forEach(function (seg) {
          var node = makeNode(seg);
          if (node.nodeType === 3) node.textContent = seg.s;
          else node.appendChild(document.createTextNode(seg.s));
          p.appendChild(node);
        });
        body.appendChild(p);
      });
      scrollDown();
      return Promise.resolve();
    }

    var caret = el("span", "caret");

    return paragraphs.reduce(function (chain, par) {
      return chain.then(function () {
        return typeParagraph(body, par, caret, ctl);
      });
    }, Promise.resolve()).then(function () {
      if (caret.parentNode) caret.remove();
    });
  }

  // Reveal one sentence (or one whole inline element) per step.
  function typeParagraph(body, par, caret, ctl) {
    return new Promise(function (resolve) {
      var p = el("p");
      body.appendChild(p);
      p.appendChild(caret);

      // Group nodes into whole sentences. A sentence may span plain text
      // plus bold/italic/link nodes — the entire group reveals in one step.
      var groups = [], cur = [];
      tokenize(par).forEach(function (seg) {
        if (seg.t === "text") {
          var pieces =
            seg.s.match(/[\s\S]*?[.!?]+["')\]]*(?:\s+|$)|[\s\S]+$/g) || [seg.s];
          pieces.forEach(function (s) {
            if (!s) return;
            cur.push(document.createTextNode(s));
            if (/[.!?]["')\]]*\s*$/.test(s)) { groups.push(cur); cur = []; }
          });
        } else {
          var node = makeNode(seg);
          node.appendChild(document.createTextNode(seg.s));
          cur.push(node);
        }
      });
      if (cur.length) groups.push(cur);

      function flush(g) {
        for (var k = 0; k < g.length; k++) p.insertBefore(g[k], caret);
      }

      var i = 0;
      function step() {
        if (ctl.skip) {
          for (; i < groups.length; i++) flush(groups[i]);
          scrollDown();
          return resolve();
        }
        if (i >= groups.length) { scrollDown(); return resolve(); }
        flush(groups[i]);
        i++;
        scrollDown();
        setTimeout(step, 140 + Math.random() * 70);
      }
      step();
    });
  }

  /* ---- scroll -------------------------------------------------------- */

  // Keep the latest question pinned near the top of the viewport so the
  // user reads the answer from its start and scrolls down at their pace —
  // never auto-jump to the bottom of a long reply. Stops if the user scrolls.
  var anchorEl = null, userScrolled = false, scrollQueued = false;
  function scrollDown() {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(function () {
      scrollQueued = false;
      if (!anchorEl || userScrolled) return;
      var pad = 16;
      var delta = anchorEl.getBoundingClientRect().top -
                  stream.getBoundingClientRect().top - pad;
      if (Math.abs(delta) > 1) stream.scrollTop += delta;
    });
  }

  /* ---- conversation flow -------------------------------------------- */

  var busy = false;
  // news is merged into the landing (about) — not a separate route
  var ROUTES = { research: 1, about: 1, experience: 1, contact: 1, cv: 1, meta: 1 };

  function hashIntent() {
    var h = (location.hash || "").replace(/^#\/?/, "").toLowerCase();
    return ROUTES[h] ? h : null;
  }

  function ask(intent, echo) {
    if (busy) { if (active) active.skip = true; return; }
    busy = true;
    if (echo) userMsg(echo);
    if (ROUTES[intent]) {
      try { history.replaceState(null, "", "#" + intent); } catch (e) {}
    }
    var answer = ANSWERS[intent] || ANSWERS.fallback;
    agentMessage(answer).then(function () {
      busy = false;
      if (input) input.focus();
    });
  }

  chips.addEventListener("click", function (e) {
    var btn = e.target.closest(".chip");
    if (!btn) return;
    var intent = btn.getAttribute("data-intent");
    ask(intent, intent);
  });

  // Guarded: present only if the composer <form> is restored in index.html.
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = input.value.trim();
      if (!q) return;
      input.value = "";
      ask(classify(q), q);
    });
  }

  // tap / key during streaming = skip to the end
  stream.addEventListener("click", function () {
    if (active) { active.skip = true; if (active.bump) active.bump(); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && active) {
      active.skip = true; if (active.bump) active.bump();
    }
    if (/^Arrow|^Page|^Home$|^End$| $/.test(e.key) &&
        document.activeElement !== input) {
      userScrolled = true; // user is navigating — don't yank the scroll
    }
  });

  // once the user scrolls the conversation, stop auto-anchoring
  ["wheel", "touchmove"].forEach(function (ev) {
    stream.addEventListener(ev, function () { userScrolled = true; },
      { passive: true });
  });

  // shareable deep links: kampta.github.io/#research opens that section
  window.addEventListener("hashchange", function () {
    var r = hashIntent();
    if (r && !busy) ask(r, r);
  });

  /* ---- boot ---------------------------------------------------------- */

  setTimeout(function () {
    var route = hashIntent();
    userMsg("who is kamal gupta?");
    busy = true;
    agentMessage(ANSWERS.about).then(function () {
      busy = false;
      if (route && route !== "about" && route !== "news") ask(route, route);
      else if (input) input.focus();
    });
  }, reduceMotion ? 0 : 360);
})();
