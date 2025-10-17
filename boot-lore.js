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
  initStickyRail,
} from "/js/main.js";
import { initGallery } from "/js/gallery.js";

/* Core */
bindClipboard();
bindEventWire();
bindGlossary();
setFooterYear("year");
initCandleBG({ selector: ".ph-box", intervalMs: 8500 });

/* Catchphrase-Rotator (pausiert bei Hover) */
initRotator({
  targetId: "catch-line",
  hoverBoxId: "catch-box",
  lines: [
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
  ],
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