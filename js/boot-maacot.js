// =========================
// /js/boot-mascot.js
// =========================
import {
  bindClipboard,
  bindEventWire,
  bindGlossary,
  setFooterYear,
  initRotator,
  initDexScreenerLazy,
  bindQuestOverlays,
  initStickyRail,
} from "/js/main.js";
import { initGallery } from "/js/gallery.js";
import { initSharedRail } from "/js/shared-rail.js";
import { initMobileRails } from "/js/mobile-rail.js";

/* Core bindings */
bindClipboard();
bindEventWire();
bindGlossary();
setFooterYear("year");
const dexController = initDexScreenerLazy();
initMobileRails({ onRightOpen: () => dexController.load?.() });

/* Rotator (optional, falls Catch-Line auf der Seite) */
initRotator({
  targetId: "catch-line",
  hoverBoxId: "catch-box",
  lines: [
    "Sparkfiend ignites the flame – HODL through the cycles!",
    "From crypts to moon: The mascot's eternal watch.",
  ],
  intervalMs: 5000,
});

/* Shared Rail Initialisierung für Mascot */
initSharedRail({ railId: "lore-nav", listId: "lore-nav-list" });

/* Mini-Gallery Init (angepasst für Mascot-Seite) */
initGallery({
  gridId: "gallery",
  fadeId: "gallery-fade",
  api: "/api/mascot-gallery.json",
  maxVisible: 9,
});

/* Additive Mobil-Toggle für Rail */
const toggle = document.getElementById("rail-toggle");
const railList = document.getElementById("lore-nav-list");
if (toggle && railList) {
  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    railList.setAttribute("aria-expanded", String(open));
    railList.classList.toggle("hidden", !open);
  };
  setOpen(true);
  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    setOpen(!isOpen);
  });
}
// No-JS-Fallback: Liste sichtbar machen
if (!toggle && railList) {
  railList.classList.remove("hidden");
}

/* Quest Grid Overlays binden */
bindQuestOverlays();

/* Autoplay Progress-Bar für Mini-Gallery (additiv) */
function initGalleryProgressBar() {
  const gallery = document.getElementById("mini-gallery");
  if (!gallery) return;
  const progress = document.createElement("div");
  progress.className = "carousel-progress";
  const bar = document.createElement("div");
  bar.className = "carousel-progress__bar";
  progress.appendChild(bar);
  gallery.appendChild(progress);
}
initGalleryProgressBar();

/* Erweiterte Quest-Overlays mit Progress-Bar-Ähnlichem (z.B. für Pagination) */
function initQuestProgress() {
  const questGrid = document.getElementById("quest-grid");
  if (!questGrid) return;
  const progress = document.createElement("div");
  progress.className = "quest-progress";
  const bar = document.createElement("div");
  bar.className = "quest-progress__bar";
  progress.appendChild(bar);
  questGrid.appendChild(progress);
}
initQuestProgress();

/* Initialisiere Sticky-Rail für Mascot */
initStickyRail({
  railSelector: ".left-rail",
  sentinelId: "mascot-sentinel-end",
  sentinelContainerSelector: ".layout-grid",
});
