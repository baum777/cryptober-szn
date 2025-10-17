// =========================
// /js/boot-lore.js
// =========================
import {
  bindClipboard,
  bindEventWire,
  bindGlossary,
  setFooterYear,
  initCandleBG,
  initDexScreenerLazy,
  initStickyRail,
} from "/js/main.js";
import { initGallery } from "/js/gallery.js";
import { initMobileRails } from "/js/mobile-rail.js";
import { prefersReducedMotion } from "/utils/a11y.js";

function initCatchPhraseRotation({ phrases = [], interval = 5000 } = {}) {
  const textNode = document.getElementById("catch-phrase-text");
  const toggle = document.getElementById("catchplay");
  if (!textNode || !toggle || phrases.length === 0) {
    return { destroy() {} };
  }

  let index = 0;
  let timerId = null;
  let shouldResume = false;
  const reducedMotion = prefersReducedMotion();
  let playing = !reducedMotion;
  let manualPause = reducedMotion;

  const render = () => {
    textNode.textContent = phrases[index] || "";
  };

  const clearTimer = () => {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  };

  const updateToggle = () => {
    toggle.textContent = playing ? "Pause" : "Play";
    toggle.setAttribute("aria-pressed", playing ? "false" : "true");
    toggle.setAttribute("aria-label", playing ? "Pause rotation" : "Resume rotation");
  };

  const start = (force = false) => {
    if (!force && prefersReducedMotion()) {
      clearTimer();
      playing = false;
      manualPause = true;
      updateToggle();
      return;
    }
    clearTimer();
    timerId = window.setInterval(() => {
      index = (index + 1) % phrases.length;
      render();
    }, interval);
    playing = true;
    updateToggle();
  };

  const stop = () => {
    clearTimer();
    playing = false;
    updateToggle();
  };

  const handleToggle = () => {
    if (playing) {
      manualPause = true;
      shouldResume = false;
      stop();
    } else {
      manualPause = false;
      start(true);
    }
  };

  const pauseForInteraction = () => {
    if (!playing) return;
    shouldResume = true;
    stop();
  };

  const resumeAfterInteraction = () => {
    if (!manualPause && shouldResume) {
      start();
    }
    shouldResume = false;
  };

  toggle.addEventListener("click", handleToggle);
  textNode.addEventListener("mouseenter", pauseForInteraction);
  textNode.addEventListener("focus", pauseForInteraction);
  textNode.addEventListener("mouseleave", resumeAfterInteraction);
  textNode.addEventListener("blur", resumeAfterInteraction);

  render();
  if (playing) {
    start();
  } else {
    updateToggle();
  }

  const destroy = () => {
    clearTimer();
    toggle.removeEventListener("click", handleToggle);
    textNode.removeEventListener("mouseenter", pauseForInteraction);
    textNode.removeEventListener("focus", pauseForInteraction);
    textNode.removeEventListener("mouseleave", resumeAfterInteraction);
    textNode.removeEventListener("blur", resumeAfterInteraction);
  };

  window.addEventListener("beforeunload", destroy, { once: true });

  return { destroy };
}

/* Core */
bindClipboard();
bindEventWire();
bindGlossary();
setFooterYear("year");
initCandleBG({ selector: ".ph-box", intervalMs: 8500 });
const dexController = initDexScreenerLazy();
initMobileRails({ onRightOpen: () => dexController.load?.() });

/* Catchphrase-Rotator (pausiert bei Hover) */
const catchPhrases = [
  "Cryptober's the spark - Bullrun's the fire, Altseason's the blast. Light up your bags!",
  "In Cryptober, bears nap - bulls run. Altseason's incoming: 100x vibes (DYOR)!",
  "Bullrun whispers: 'Buy low.' Altseason screams: 'Sell high.' Cryptober says: 'HODL.'",
  "From Bitcoin's throne to Altcoin's crown - Cryptober kicks off the Bullrun meta.",
  "Altseason isn't luck - it's the community roaring. Get on the wave.",
  "Cryptober: where memes start moon missions. Bullrun fuels it; Altseason harvests it.",
  "In market meta, Bullrun builds empires - Altseason crowns the kings. DYOR to rule.",
  "Bullrun starts the party; Altseason is the afterparty. Cryptober's the VIP invite.",
  "Altseason meta: whales pump, communities dump fear. Bullrun stays until the halving.",
  "Cryptober's chill? Nope - that's the Bullrun thrill. Altseason steals the spotlight.",
  "From rug to revival: Bullrun heals wounds, Altseason rewards the brave.",
  "Bullrun is the climb; Altseason is the summit. Cryptober is base camp.",
  "In Altseason, every dip's a setup. Bullrun shouts: 'To the moon - no brakes!'",
  "Cryptober wakes the bulls; Bullrun unleashes them. Altseason = pure euphoria.",
  "Meta tip: Bullrun tests patience; Altseason rewards vision. DYOR is your compass.",
  "Altseason secret: community > code. Bullrun mantra: hype, hold, harvest.",
  "Cryptober's glow = Bullrun's golden hour. Altseason flips the script - alts lead.",
  "Bullrun meta: cycles repeat, winners evolve. Altseason: winners level up.",
  "From Cryptober's haunt to Bullrun's hunt - Altseason's the feast. Eat or get eaten.",
];

initCatchPhraseRotation({ phrases: catchPhrases, interval: 5000 });

/* Gallery Pager (4x2 grid) */
initGallery({ rootId: "gallery" });

/* Kapitel-Navigation (links) — erzeugt aus vorhandenen Epochen + Sub-H3 */
(function initLoreNav() {
  const list = document.getElementById("lore-nav-list");
  if (!list) return;
  list.innerHTML = "";

  const chapters = [
    { id: "cryptober", label: "Cryptober" },
    { id: "uptober", label: "Uptober" },
    { id: "moonvember", label: "Moonvember" },
    { id: "upcember", label: "Upcember" },
  ].filter((c) => document.getElementById(c.id));

  const makeSub = (rootId) => {
    const root = document.getElementById(rootId);
    if (!root) return [];
    return Array.from(root.querySelectorAll("h3[id]")).map((h) => ({
      id: h.id,
      label: (h.textContent || "").trim().replace(/\s+/g, " "),
    }));
  };

  chapters.forEach((c) => {
    const details = document.createElement("details");
    details.dataset.epoch = c.id;

    const summary = document.createElement("summary");
    const a = document.createElement("a");
    a.href = `#${c.id}`;
    a.textContent = c.label;
    summary.appendChild(a);
    details.appendChild(summary);

    const sub = document.createElement("ul");
    makeSub(c.id).forEach((s) => {
      const li = document.createElement("li");
      const sa = document.createElement("a");
      sa.href = `#${s.id}`;
      sa.textContent = s.label;
      li.appendChild(sa);
      sub.appendChild(li);
    });

    details.appendChild(sub);
    list.appendChild(details);
  });

  // Zusätzliche Sprungziele
  [{ href: "#gallery-section", label: "Gallery" }, { href: "#glossary-panel", label: "Glossary" }].forEach(
    (x) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = x.href;
      a.textContent = x.label;
      li.appendChild(a);
      list.appendChild(li);
    }
  );

  // Active-State per IntersectionObserver
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        const id = en.target.id;
        const link = list.querySelector(`summary a[href="#${id}"]`);
        if (!link) return;
        if (en.isIntersecting) {
          list.querySelectorAll("a[aria-current]").forEach((a) => a.removeAttribute("aria-current"));
          link.setAttribute("aria-current", "true");
        }
      });
    },
    { rootMargin: "-30% 0% -60% 0%", threshold: [0, 1] }
  );
  chapters.forEach((c) => {
    const el = document.getElementById(c.id);
    if (el) observer.observe(el);
  });
})();

/* Glossary of the Day (liest bestehendes DL, ändert Inhalte nicht) */
(function glossaryOfDay() {
  const host = document.getElementById("glossary-of-day");
  const panel = document.getElementById("glossary-panel");
  if (!host || !panel) return;
  const terms = Array.from(panel.querySelectorAll("dl > dt"));
  const pairs = terms
    .map((dt) => {
      const dd = dt.nextElementSibling;
      if (!dd || dd.tagName !== "DD") return null;
      return { term: (dt.textContent || "").trim(), def: (dd.textContent || "").trim() };
    })
    .filter(Boolean);
  if (pairs.length === 0) return;
  const idx = new Date().getDate() % pairs.length;
  const pick = pairs[idx];
  host.innerHTML = `
    <h3 class="muted" style="margin:0 0 .25rem 0">Begriff des Tages</h3>
    <div class="card">
      <strong class="text-neon-green">${pick.term}</strong>
      <p class="muted" style="margin:.25rem 0 0 0">${pick.def}</p>
    </div>`;
})();

// Initialisiere Sticky-Rail
initStickyRail({
  railSelector: ".left-rail",
  sentinelId: "lore-sentinel-end",
  sentinelContainerSelector: ".layout-grid",
});