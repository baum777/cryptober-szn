// =========================
// /js/main.js – CRYPTOBER COMPLETE
// NEUES LAYOUT + LIVE DEX-STATS!
// =========================

let __toastTimer = null;

/**
 * Toast-Message mit A11y.
 * @param {string} msg
 * @param {number} [ms=1800]
 */
export function toast(msg, ms = 1800) {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    t.className = "toast";
    t.setAttribute("role", "status");
    t.setAttribute("aria-live", "polite");
    document.body.appendChild(t);
  }
  t.textContent = String(msg || "");
  t.classList.add("visible");
  if (__toastTimer) clearTimeout(__toastTimer);
  __toastTimer = setTimeout(() => t.classList.remove("visible"), ms);
}

/**
 * Bindet Copy-to-Clipboard an alle Elemente mit [data-copy] oder #copy-ca.
 */
export function bindClipboard() {
  const nodes = [
    ...document.querySelectorAll("[data-copy]"),
    ...document.querySelectorAll("#copy-ca"),
  ];
  if (nodes.length === 0) return;

  nodes.forEach((el) => {
    const payload = el.getAttribute("data-copy") || el.getAttribute("data-ca") || "";
    if (!payload) return;
    el.addEventListener("click", async () => {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(payload);
          toast("Copied! ✅");
          if (navigator.vibrate) navigator.vibrate(50);
        } else {
          throw new Error("Clipboard API not supported");
        }
      } catch {
        toast("Copy failed - copy manually");
      }
    });
  });
}

/**
 * Leichte Telemetrie über data-event.
 */
export function bindEventWire() {
  function findEventEl(e) {
    const p = typeof e.composedPath === "function" ? e.composedPath() : [];
    for (const t of p) {
      if (t && t.dataset && t.dataset.event) return t;
    }
    let n = e.target;
    while (n) {
      if (n.dataset && n.dataset.event) return n;
      n = n.parentElement;
    }
    return null;
  }

  document.addEventListener(
    "click",
    (e) => {
      const el = findEventEl(e);
      if (!el || !el.dataset.event) return;
      const text =
        el instanceof HTMLButtonElement || el instanceof HTMLAnchorElement
          ? (el.innerText || "").slice(0, 140)
          : undefined;
      const payload = {
        event: el.dataset.event,
        tag: (el.tagName || "").toLowerCase(),
        id: el.id || undefined,
        text,
      };
      console.log("TRACK", payload);
    },
    { passive: true }
  );
}

/**
 * Glossar-Toggle mit ARIA.
 * @param {{toggleId?:string, panelId?:string}} opts
 */
export function bindGlossary({ toggleId = "toggle-gloss", panelId = "glossary-panel" } = {}) {
  const btn = document.getElementById(toggleId);
  const panel = document.getElementById(panelId);
  if (!btn || !panel) return;

  btn.setAttribute("aria-controls", panelId);
  btn.setAttribute("aria-expanded", "false");

  let open = false;
  btn.addEventListener("click", () => {
    open = !open;
    panel.style.display = open ? "" : "none";
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });

  panel.style.display = "none";
}

/**
 * Catchphrase-Rotator (Hover pausiert).
 * @param {{targetId?:string, hoverBoxId?:string, lines?:string[], intervalMs?:number}} opts
 */
export function initRotator({
  targetId = "catch-line",
  hoverBoxId = "catch-box",
  lines = [],
  intervalMs = 5000,
} = {}) {
  const target = document.getElementById(targetId);
  const hoverBox = document.getElementById(hoverBoxId) || target?.parentElement;
  if (!target || !Array.isArray(lines) || lines.length === 0) return;

  let i = 0;
  let timer = null;

  function show() {
    target.textContent = `"${lines[i]}"`;
    target.classList.remove("animate-fade");
    void target.offsetWidth; // Trigger reflow
    target.classList.add("animate-fade");
  }

  function start() {
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      i = (i + 1) % lines.length;
      show();
    }, intervalMs);
  }

  show();
  start();

  if (hoverBox) {
    hoverBox.addEventListener("mouseenter", () => {
      if (timer) clearInterval(timer);
    });
    hoverBox.addEventListener("mouseleave", start);
  }
}

/**
 * Coming-Soon-Bindings für Buttons mit [data-copy="Coming soon"].
 */
export function bindComingSoon() {
  const buttons = document.querySelectorAll('[data-copy="Coming soon"]');
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      toast("Coming soon ⏳", 2000);
    });
  });
}

/**
 * Lazy-load DexScreener iframe when placeholder is visible.
 * @param {{ placeholderId?: string, title?: string }} opts
 * @returns {{ destroy(): void }} cleanup API
 */
export function initDexScreenerLazy({ placeholderId = "dex-screener-placeholder", title = "DexScreener Live Chart" } = {}) {
  const placeholder = document.getElementById(placeholderId);
  if (!placeholder) {
    return { load() {}, destroy() {} };
  }

  const src = placeholder.dataset.src;
  if (!src) {
    return { load() {}, destroy() {} };
  }

  let hasLoaded = false;
  let observer = null;

  const load = () => {
    if (hasLoaded) return;
    const iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.loading = "lazy";
    iframe.title = title;
    iframe.setAttribute("aria-label", title);
    iframe.setAttribute("sandbox", "allow-scripts allow-same-origin allow-popups");
    placeholder.innerHTML = "";
    placeholder.appendChild(iframe);
    placeholder.dataset.loaded = "true";
    hasLoaded = true;
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  };

  if ("IntersectionObserver" in window) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            load();
          }
        });
      },
      { rootMargin: "0px 0px 200px 0px" }
    );
    observer.observe(placeholder);
  } else {
    load();
  }

  return {
    load() {
      load();
    },
    destroy() {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      if (hasLoaded) {
        const iframe = placeholder.querySelector("iframe");
        if (iframe) {
          iframe.remove();
        }
        placeholder.innerHTML = `<p class="muted">Live stats deaktiviert.</p>`;
        delete placeholder.dataset.loaded;
        hasLoaded = false;
      }
    },
  };
}

/**
 * Hintergrund mit wechselnden Kerzenbildern.
 * @param {{selector:string, intervalMs?:number}} opts
 */
export function initCandleBG({ selector = ".ph-box", intervalMs = 9000 } = {}) {
  const els = document.querySelectorAll(selector);
  if (els.length === 0) return;

  const images = [
    "/assets/candles/candle1.png",
    "/assets/candles/candle2.png",
    "/assets/candles/candle3.png",
  ];

  els.forEach((el) => {
    let i = 0;
    const initial = images[Math.floor(Math.random() * images.length)];
    el.style.backgroundImage = `url(${initial})`;
    setInterval(() => {
      i = (i + 1) % images.length;
      el.style.backgroundImage = `url(${images[i]})`;
    }, intervalMs);
  });
}

/**
 * Footer-Jahr dynamisch setzen.
 * @param {string} id
 */
export function setFooterYear(id) {
  const el = document.getElementById(id);
  if (el) el.textContent = new Date().getFullYear();
}

/**
 * ScrollSpy für aktive Links.
 */
export function initScrollSpy() {
  const links = document.querySelectorAll('[data-target]');
  if (links.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((link) => {
            const href = link.getAttribute("href");
            const id = href ? href.substring(1) : "";
            if (id === entry.target.id) {
              link.setAttribute("aria-current", "true");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        }
      });
    },
    { rootMargin: "-30% 0% -60% 0%", threshold: [0, 1] }
  );

  links.forEach((link) => {
    const href = link.getAttribute("href");
    const id = href ? href.substring(1) : "";
    const target = document.getElementById(id);
    if (target) observer.observe(target);
  });
}

/**
 * Sticky Rail für Navigation.
 * @param {{railSelector?:string, sentinelId?:string, sentinelContainerSelector?:string, topSticky?:string}} opts
 */
export function initStickyRail({
  railSelector = ".left-rail",
  sentinelId = "sentinel-end",
  sentinelContainerSelector = ".page",
  topSticky = "var(--header-height)",
} = {}) {
  const rail = document.querySelector(railSelector);
  const container = document.querySelector(sentinelContainerSelector);
  if (!rail || !container) return;

  // Sentinel erstellen, falls nicht vorhanden
  let sentinel = document.getElementById(sentinelId);
  if (!sentinel) {
    sentinel = document.createElement("div");
    sentinel.id = sentinelId;
    sentinel.style.width = "1px";
    sentinel.style.height = "1px";
    container.appendChild(sentinel);
  }

  // Container relativ machen
  if (getComputedStyle(container).position === "static") {
    container.style.position = "relative";
  }

  // IntersectionObserver für Sticky-End (optional, da CSS sticky ist)
  const io = new IntersectionObserver(
    ([en]) => {
      if (en && en.isIntersecting) {
        rail.style.position = "absolute";
        rail.style.top = "auto";
        rail.style.bottom = "0";
      } else {
        rail.style.position = "sticky";
        rail.style.top = topSticky;
        rail.style.bottom = "auto";
      }
    },
    { root: null, threshold: 0, rootMargin: "0px 0px -50% 0px" }
  );
  io.observe(sentinel);
}

/**
 * Transformiert Roadmap-Karten in eine Questmap.
 */
export function upgradeRoadmapToQuest() {
  const sec = document.getElementById("roadmap");
  if (!sec) return;
  const grid = sec.querySelector(".grid");
  if (!grid) return;
  const cards = [...grid.querySelectorAll(".card")];
  if (cards.length === 0) return;

  const qm = document.createElement("div");
  qm.className = "questmap";
  const path = document.createElement("div");
  path.className = "path";
  qm.appendChild(path);

  const nowAttr = Number(sec.getAttribute("data-now") || 1);
  const nowIndex = isNaN(nowAttr) ? 1 : Math.max(1, Math.min(cards.length, nowAttr));

  cards.forEach((card, idx) => {
    const title = card.querySelector("h3")?.textContent?.trim() || `Step ${idx + 1}`;
    const text = card.querySelector("p")?.textContent?.trim() || "";
    const cp = document.createElement("div");
    cp.className = "checkpoint";
    cp.setAttribute("role", "listitem");
    cp.dataset.status = idx + 1 === nowIndex ? "now" : idx + 1 < nowIndex ? "done" : "later";
    const dot = document.createElement("div");
    dot.className = "dot";
    const content = document.createElement("div");
    content.className = "content";
    const h3 = document.createElement("h3");
    h3.textContent = title;
    const p = document.createElement("p");
    p.textContent = text;
    p.className = "muted";
    content.appendChild(h3);
    content.appendChild(p);
    cp.appendChild(dot);
    cp.appendChild(content);
    qm.appendChild(cp);
  });

  const title = sec.querySelector("#roadmap-title");
  if (title) {
    title.insertAdjacentElement("afterend", qm);
  } else {
    sec.appendChild(qm);
  }
  grid.style.display = "none";
}

/**
 * Bindet Klick-Events für "Reveal soon"-Overlays in Quest-Tiles.
 */
export function bindQuestOverlays() {
  const tiles = document.querySelectorAll(".quest-tile");
  if (tiles.length === 0) return;

  tiles.forEach((tile) => {
    const overlay = tile.querySelector(".overlay");
    if (!overlay) return;

    overlay.addEventListener("click", () => {
      toast("Reveal soon ⏳", 2000);
    });

    tile.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        overlay.click();
      }
    });

    tile.addEventListener("mouseenter", () => {
      overlay.style.opacity = "0.9";
    });
    tile.addEventListener("mouseleave", () => {
      overlay.style.opacity = "";
    });
  });
}

/**
 * LIVE DEX-STATS FETCH (ERWEITERT!)
 */
export async function fetchTokenStats() {
  const apiUrl = 'https://api.dexscreener.com/latest/dex/pairs/solana/8o4W7YWcQ26gQH7QjfMcLLGbSfjkbVD1nCoED8c7pump';
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    const pair = data.pair || {};
    return {
      mcap: (pair.marketCap / 1000).toFixed(1) + 'K',
      liquidity: (pair.liquidity.usd / 1000).toFixed(1) + 'K',
      price: pair.priceUsd
    };
  } catch (e) {
    console.error('DEX Fetch Error:', e);
    return { mcap: 'N/A', liquidity: 'N/A', price: 'N/A' };
  }
}

/* 🎯 AUTO-INIT BEIM DOM-LOAD */
document.addEventListener("DOMContentLoaded", () => {
  bindQuestOverlays();
  initScrollSpy();
  fetchTokenStats().then(stats => {
    const el = document.getElementById('live-stats');
    if (el) el.innerHTML = `MCAP: $${stats.mcap}<br>Liquidity: $${stats.liquidity}<br>Price: $${stats.price}`;
  });
});