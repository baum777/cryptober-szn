// =========================
// /js/boot-lore.js
// =========================
import {
  bindClipboard,
  bindEventWire,
  initRotator,
  bindGlossary,
  setFooterYear,
  initCandleBG,
  initDexScreenerLazy,
  initStickyRail,
} from "/js/main.js";
import { initGallery } from "/js/gallery.js";
import { initMobileRails } from "/js/mobile-rail.js";

function renderCatchPhrases({ containerId = "catch-phrase-card", phrases = [], collapsedCount = 3 } = {}) {
  const container = document.getElementById(containerId);
  if (!container || !phrases.length) {
    return { destroy() {} };
  }

  const heading = container.querySelector("h3");
  container.innerHTML = "";
  if (heading) {
    container.appendChild(heading);
  }

  const lead = document.createElement("p");
  lead.id = "catch-line";
  lead.className = "catch-phrase__lead text-neon-green";
  lead.setAttribute("role", "status");
  lead.textContent = `"${phrases[0]}"`;
  lead.tabIndex = 0;
  container.appendChild(lead);

  const copyCurrentPhrase = () => {
    const text = lead.textContent ? lead.textContent.replace(/^"|"$/g, "").trim() : "";
    if (!text) return;
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  };
  const onLeadKey = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      copyCurrentPhrase();
    }
  };
  lead.addEventListener("click", copyCurrentPhrase);
  lead.addEventListener("keydown", onLeadKey);

  const hint = document.createElement("p");
  hint.className = "muted catch-phrase__hint";
  hint.textContent = "Hover pausiert, Klick kopiert.";
  container.appendChild(hint);

  const list = document.createElement("ul");
  list.className = "catch-phrase__list";
  list.setAttribute("aria-label", "Weitere Catchphrases");
  phrases.forEach((phrase, index) => {
    const li = document.createElement("li");
    li.className = "catch-phrase__item";
    li.textContent = phrase;
    li.dataset.index = String(index);
    list.appendChild(li);
  });

  if (phrases.length > collapsedCount) {
    list.classList.add("is-collapsed");
  }

  container.appendChild(list);

  let expanded = false;
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "catch-phrase__toggle nav-card";
  toggle.setAttribute("aria-expanded", "false");
  toggle.textContent = "Mehr Hooks anzeigen";
  const updateView = () => {
    list.classList.toggle("is-collapsed", !expanded && phrases.length > collapsedCount);
    toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
    toggle.textContent = expanded ? "Weniger Hooks anzeigen" : "Mehr Hooks anzeigen";
  };
  const onToggle = () => {
    expanded = !expanded;
    updateView();
  };
  toggle.addEventListener("click", onToggle);
  container.appendChild(toggle);
  updateView();

  const resizeObserver = new ResizeObserver((entries) => {
    entries.forEach(({ target, contentRect }) => {
      target.style.setProperty("--catch-phrase-height", `${Math.round(contentRect.height)}px`);
      target.classList.toggle("is-scrollable", contentRect.height > 320);
    });
  });
  resizeObserver.observe(container);

  return {
    destroy() {
      resizeObserver.disconnect();
      toggle.removeEventListener("click", onToggle);
      lead.removeEventListener("click", copyCurrentPhrase);
      lead.removeEventListener("keydown", onLeadKey);
    },
  };
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

renderCatchPhrases({ phrases: catchPhrases });
initRotator({
  targetId: "catch-line",
  hoverBoxId: "catch-phrase-card",
  lines: catchPhrases,
  intervalMs: 5000,
});

/* Carousel-Gallery (Autoplay 5s, Swipe, Lightbox) */
initGallery({
  rootId: "gallery",
  basePath: "/assets/gallery/",
  autoplayMs: 5000,
  pauseOnHover: true,
  enableSwipe: true,
  enableLightbox: true,
});

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
  const items = Array.from(panel.querySelectorAll("dl > div"));
  const pairs = items
    .map((div) => {
      const dt = div.querySelector("dt");
      const dd = div.querySelector("dd");
      return dt && dd
        ? { term: (dt.textContent || "").trim(), def: (dd.textContent || "").trim() }
        : null;
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
  sentinelContainerSelector: ".page",
  topSticky: "var(--header-height)",
});