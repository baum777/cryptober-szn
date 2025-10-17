// ================================
// /js/gallery.js — Carousel + Autoplay (5s), Wrap, Swipe, Lightbox
// ================================
/**
 * Carousel-Galerie initialisieren.
 * - Autoplay: 5s (pausiert bei Hover/Focus/Tab unsichtbar)
 * - Wrap-Around: letzter→erster / erster→letzter bei Prev/Next
 * - Swipe: Touch-Gesten für Vor/Zurück (auch in Lightbox)
 * - Lightbox: Pfeile, ESC, Nachbar-Preload
 *
 * HTML-Voraussetzung: <div id="gallery"></div>
 */
export function initGallery({
  rootId = "gallery",
  basePath = "/assets/gallery/",
  files = null,              // optional: Array<string> oder Array<{file,alt,caption}>
  autoplayMs = 5000,         // 5 Sekunden
  pauseOnHover = true,
  enableSwipe = true,
  enableLightbox = true,
} = {}) {
  const root = document.getElementById(rootId);
  if (!root) return;

  // ---------- Daten ----------
  const defaultFiles = [
    "behold_flame.png",
    "brewing_bull_spooky.png",
    "bubble_scripts.png",
    "cascade_ignite.png",
    "community-first.png",
    "conjuring_uptober.png",
    "cryptober_harvest_candle.png",
    "cryptober_harvest.png",
    "cryptober-gang.png",
    "dca_still_retail.png",
    "draw the chart.png",
    "ghost_fomo.png",
    "green_ghosts.png",
    "harvest.png",
    "icon-timeline-skeleton.png",
    "ignition_achived.png",
    "pepe -uptober-vibe.png",
    "pepe_raiding.png",
    "pepe_wild_raiding.png",
    "pmpkin-green.png",
    "powell_rate_cut.png",
    "pull_lever.png",
    "pulling_lever_history.png",
    "pumpin.png",
    "pumpkin-pump.png",
    "rug_wolf.webp",
    "seed_to_script.png",
    "the_beginning.png",
    "trickortreat.png",
    "unite_degen.png",
    "witc_drive.png",
  ];

  const items = (files && Array.isArray(files) ? files : defaultFiles).map((f) => {
    if (typeof f === "string") {
      return { file: f, alt: labelFrom(f), caption: "" };
    }
    // {file, alt?, caption?}
    return {
      file: f.file,
      alt: f.alt ?? labelFrom(f.file),
      caption: f.caption ?? "",
    };
  });

  function buildSrc(file) {
    // encodeURI lässt "/" unberührt, ersetzt aber Spaces etc. zu %20
    return encodeURI(basePath + String(file || ""));
  }
  function labelFrom(file) {
    return String(file || "")
      .replace(/\.[a-z0-9]+$/i, "")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  // ---------- Markup ----------
  root.innerHTML = "";
  root.setAttribute("role", "region");
  root.setAttribute("aria-label", "Galerie Carousel");
  root.classList.add("card");

  const viewport = document.createElement("div");
  viewport.className = "carousel-viewport";
  viewport.style.overflow = "hidden";
  viewport.style.position = "relative";

  const track = document.createElement("div");
  track.className = "carousel-track";
  track.style.display = "flex";
  track.style.willChange = "transform";
  track.style.transition = "transform 420ms ease";

  // Slides
  items.forEach((it, i) => {
    const fig = document.createElement("figure");
    fig.className = "carousel-slide";
    fig.style.margin = "0";
    fig.style.flex = "0 0 100%";
    fig.style.userSelect = "none";
    fig.setAttribute("role", "group");
    fig.setAttribute("aria-roledescription", "slide");
    fig.setAttribute("aria-label", `${i + 1} / ${items.length}`);

    const img = document.createElement("img");
    img.src = buildSrc(it.file);
    img.alt = it.alt || "";
    img.loading = i === 0 ? "eager" : "lazy";
    img.decoding = "async";
    img.style.width = "100%";
    img.style.height = "auto";
    img.style.display = "block";
    fig.appendChild(img);

    if (it.caption) {
      const cap = document.createElement("figcaption");
      cap.className = "muted";
      cap.style.textAlign = "center";
      cap.style.marginTop = ".4rem";
      cap.textContent = it.caption;
      fig.appendChild(cap);
    }

    if (enableLightbox) {
      fig.style.cursor = "zoom-in";
      fig.addEventListener("click", () => openLightbox(current));
      fig.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLightbox(current);
        }
      });
      fig.tabIndex = 0;
    }

    track.appendChild(fig);
  });

  viewport.appendChild(track);
  root.appendChild(viewport);

  // Controls
  const controls = document.createElement("div");
  controls.className = "carousel-controls";
  controls.style.display = "flex";
  controls.style.justifyContent = "space-between";
  controls.style.alignItems = "center";
  controls.style.marginTop = ".5rem";
  controls.style.gap = ".5rem";

  const prevBtn = document.createElement("button");
  prevBtn.className = "btn";
  prevBtn.type = "button";
  prevBtn.setAttribute("aria-label", "Vorheriges Bild");
  prevBtn.textContent = "‹ Prev";

  const nextBtn = document.createElement("button");
  nextBtn.className = "btn";
  nextBtn.type = "button";
  nextBtn.setAttribute("aria-label", "Nächstes Bild");
  nextBtn.textContent = "Next ›";

  // Dots container (ARIA-updates + buttons)
  const dots = document.createElement("div");
  dots.className = "carousel-dots";
  dots.style.display = "flex";
  dots.style.justifyContent = "center";
  dots.style.marginTop = "0.5rem";
  items.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Gehe zu Slide ${i + 1}`);
    dot.setAttribute("aria-current", i === 0 ? "true" : "false");
    dot.textContent = String(i + 1);
    dot.addEventListener("click", () => goTo(i, true));
    dots.appendChild(dot);
  });

  controls.appendChild(prevBtn);
  controls.appendChild(dots);
  controls.appendChild(nextBtn);
  root.appendChild(controls);

  // ---------- State & Helpers ----------
  let current = 0;
  let autoTimer = null;
  let isPaused = false;

  function update() {
    track.style.transform = `translateX(-${current * 100}%)`;
    // Additive ARIA-Updates for Dots
    dots.querySelectorAll(".dot").forEach((d, i) => {
      d.setAttribute("aria-current", i === current ? "true" : "false");
      d.classList.toggle("active", i === current);
    });
    // neighbor preload
    preloadNeighbor(current - 1);
    preloadNeighbor(current + 1);
  }

  function goTo(index, user = false) {
    const len = items.length;
    current = (index + len) % len;
    update();
    if (user) restartAuto();
  }

  function next() {
    goTo(current + 1);
  }

  function prev() {
    goTo(current - 1);
  }

  // Preload neighbors
  const preloadMap = {};
  function preloadNeighbor(idx) {
    const len = items.length;
    const i = (idx + len) % len;
    const src = buildSrc(items[i].file);
    if (preloadMap[src]) return;
    const im = new Image();
    im.src = src;
    preloadMap[src] = 1;
  }

  // ---------- Autoplay ----------
  function startAuto() {
    if (autoplayMs <= 0 || autoTimer) return;
    autoTimer = setInterval(() => {
      if (!isPaused) next();
    }, autoplayMs);
  }
  function stopAuto() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }
  function pauseAuto(flag) {
    isPaused = !!flag;
  }
  function restartAuto() {
    stopAuto();
    startAuto();
  }

  // Hover/Focus pausiert
  if (pauseOnHover) {
    root.addEventListener("mouseenter", () => pauseAuto(true), { passive: true });
    root.addEventListener("mouseleave", () => pauseAuto(false), { passive: true });
  }
  root.addEventListener("focusin", () => pauseAuto(true));
  root.addEventListener("focusout", () => {
    // kurze Verzögerung, damit Focuswechsel innerhalb des Carousels nicht sofort resumed
    setTimeout(() => {
      if (!root.contains(document.activeElement)) pauseAuto(false);
    }, 120);
  });

  // Additive Focus-Pause für Autoplay (Viewport)
  viewport.addEventListener("focusin", stopAuto);
  viewport.addEventListener("focusout", startAuto);

  // Sichtbarkeit (Tab-Wechsel)
  document.addEventListener("visibilitychange", () => {
    pauseAuto(document.hidden);
  });

  // ---------- Events ----------
  nextBtn.addEventListener("click", () => goTo(current + 1, true));
  prevBtn.addEventListener("click", () => goTo(current - 1, true));

  // Keyboard left/right
  root.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(current + 1, true);
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(current - 1, true);
    }
  });

  // Swipe (Viewport)
  if (enableSwipe) {
    let startX = null;
    let startY = null;
    let dragging = false;

    viewport.addEventListener(
      "touchstart",
      (e) => {
        const t = e.touches && e.touches[0];
        if (!t) return;
        startX = t.clientX;
        startY = t.clientY;
        dragging = true;
      },
      { passive: true }
    );
    viewport.addEventListener(
      "touchmove",
      (e) => {
        if (!dragging || startX == null || startY == null) return;
        const t = e.touches && e.touches[0];
        if (!t) return;
        const dx = t.clientX - startX;
        const dy = t.clientY - startY;
        // Horizontal überwiegt → verhindern, dass Seite scrollt
        if (Math.abs(dx) > Math.abs(dy)) e.preventDefault();
      },
      { passive: false }
    );
    viewport.addEventListener(
      "touchend",
      (e) => {
        if (!dragging || startX == null) return;
        const t = e.changedTouches && e.changedTouches[0];
        const dx = t ? t.clientX - startX : 0;
        // Verfeinerte Swipe: Threshold von 40 auf 30 anpassen für Sensitivität
        if (Math.abs(dx) > 30) {
          goTo(current + (dx < 0 ? 1 : -1), true);
        }
        startX = startY = null;
        dragging = false;
      },
      { passive: true }
    );
  }

  // ---------- Lightbox ----------
  let lbRoot = null;
  let lbIndex = 0;
  let lbLastActive = null;
  const lbPreCache = {};

  function ensureLightbox() {
    if (lbRoot) return lbRoot;
    lbRoot = document.createElement("div");
    lbRoot.className = "lightbox";
    lbRoot.innerHTML = `
      <div class="lightbox-backdrop" data-action="close"></div>
      <div class="lightbox-window" role="dialog" aria-modal="true" aria-label="Bildansicht">
        <div class="lightbox-stage">
          <img class="lightbox-img" alt=""/>
          <div class="lightbox-bar">
            <div class="muted" id="lb-caption"></div>
            <button class="lb-btn" data-action="close" aria-label="Schließen">Close ✕</button>
          </div>
          <div class="lightbox-controls">
            <button class="lb-btn" data-action="prev" aria-label="Vorheriges">‹ Prev</button>
            <button class="lb-btn" data-action="next" aria-label="Nächstes">Next ›</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(lbRoot);

    lbRoot.addEventListener("click", (e) => {
      const a = e.target.getAttribute?.("data-action");
      if (a === "close") closeLightbox();
      if (a === "prev") stepLightbox(-1);
      if (a === "next") stepLightbox(1);
    });

    document.addEventListener("keydown", (e) => {
      if (!lbRoot || !lbRoot.classList.contains("open")) return;
      if (e.key === "Escape") { e.preventDefault(); closeLightbox(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); stepLightbox(-1); }
      if (e.key === "ArrowRight") { e.preventDefault(); stepLightbox(1); }
    });

    if (enableSwipe) {
      let sx = null, sy = null, swiping = false;
      lbRoot.addEventListener("touchstart", (e) => {
        const t = e.touches?.[0]; if (!t) return;
        sx = t.clientX; sy = t.clientY; swiping = true;
      }, { passive: true });
      lbRoot.addEventListener("touchmove", (e) => {
        if (!swiping || sx == null || sy == null) return;
        const t = e.touches?.[0]; if (!t) return;
        const dx = t.clientX - sx; const dy = t.clientY - sy;
        if (Math.abs(dx) > Math.abs(dy)) e.preventDefault();
      }, { passive: false });
      lbRoot.addEventListener("touchend", (e) => {
        if (!swiping || sx == null) return;
        const t = e.changedTouches?.[0];
        const dx = t ? t.clientX - sx : 0;
        if (Math.abs(dx) > 40) stepLightbox(dx < 0 ? 1 : -1);
        sx = sy = null; swiping = false;
      }, { passive: true });
    }

    return lbRoot;
  }

  function openLightbox(i) {
    if (!enableLightbox) return;
    ensureLightbox();
    lbLastActive = document.activeElement;
    lbIndex = i;
    renderLightbox();
    lbRoot.classList.add("open");
    document.documentElement.style.overflow = "hidden";
    lbRoot.querySelector('[data-action="close"]')?.focus();
  }

  function closeLightbox() {
    if (!lbRoot) return;
    lbRoot.classList.remove("open");
    document.documentElement.style.overflow = "";
    lbLastActive && lbLastActive.focus?.();
  }

  function stepLightbox(d) {
    lbIndex = (lbIndex + d + items.length) % items.length;
    renderLightbox();
  }

  function renderLightbox() {
    const img = lbRoot.querySelector(".lightbox-img");
    const cap = lbRoot.querySelector("#lb-caption");
    const it = items[lbIndex];
    img.src = buildSrc(it.file);
    img.alt = it.alt || "";
    cap.textContent = it.caption || it.alt || "";
    // Preload neighbors (±1) and extended neighbors (±2)
    preloadLBNeighbor(lbIndex - 1);
    preloadLBNeighbor(lbIndex + 1);
    // Verfeinerte Preload: zusätzlich ±2
    preloadLBNeighbor(lbIndex - 2);
    preloadLBNeighbor(lbIndex + 2);
  }

  function preloadLBNeighbor(idx) {
    const len = items.length;
    // Preload a small neighborhood: idx, idx±1, idx±2 (unique)
    const indices = new Set([
      ((idx) + len) % len,
      ((idx - 1) + len) % len,
      ((idx + 1) + len) % len,
      ((idx - 2) + len) % len,
      ((idx + 2) + len) % len,
    ]);
    indices.forEach((i) => {
      const src = buildSrc(items[i].file);
      if (lbPreCache[src]) return;
      const im = new Image();
      im.src = src;
      lbPreCache[src] = 1;
    });
  }

  // ---------- Init ----------
  update();
  // Autoplay starten
  startAuto();
}
