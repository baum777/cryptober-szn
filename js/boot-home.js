// =========================
// /js/boot-home.js
// =========================
import {
  bindClipboard,
  bindEventWire,
  bindComingSoon,
  setFooterYear,
  initCandleBG,
  initDexScreenerLazy,
  toast,
  initStickyRail,
} from "/js/main.js";
import { initQuestmap } from "/js/questmap.js";
import { initSharedRail } from "/js/shared-rail.js";
import { initMobileRails } from "/js/mobile-rail.js";

/* Core */
bindClipboard();
bindEventWire();
bindComingSoon();
setFooterYear("year");
initCandleBG({ selector: ".ph-box", intervalMs: 8500 });
const dexController = initDexScreenerLazy();
initMobileRails({ onRightOpen: () => dexController.load?.() });

/* Autoplay Progress-Bar für Gallery (additiv) */
function initGalleryProgressBar() {
  const gallery = document.getElementById("gallery");
  if (!gallery) return;
  const progress = document.createElement("div");
  progress.className = "carousel-progress";
  const bar = document.createElement("div");
  bar.className = "carousel-progress__bar";
  progress.appendChild(bar);
  gallery.appendChild(progress);
}
initGalleryProgressBar();

/* Roadmap → Questmap (bindet Inhalte der Index-Sections) */
initQuestmap();

/* ========== NEW: Modular Roadmap/QuestMap Foundation (Optional) ==========
 *
 * The new foundation components are available but not yet enabled by default.
 * They run alongside the existing questmap.js implementation.
 *
 * To enable the new components:
 * 1. Uncomment the imports below
 * 2. Uncomment the initialization code
 * 3. Add containers to your HTML with IDs: 'timeline-foundation', 'questmap-foundation'
 * 4. Load roadmap data from /assets/roadmap.json
 *
 * Benefits of new components:
 * - Strict architectural contracts (Timeline vs QuestMap separation)
 * - Improved accessibility (ARIA regions, focus management)
 * - Reduced motion support
 * - Comprehensive test coverage
 * - Modular, reusable components
 *
 * Example integration:
 *
 * import { initTimelineSection } from '/js/components/TimelineSection.js';
 * import { initQuestMapSection } from '/js/components/QuestMapSection.js';
 *
 * async function initFoundationComponents() {
 *   try {
 *     const response = await fetch('/assets/roadmap.json', { cache: 'no-store' });
 *     if (!response.ok) return;
 *
 *     const data = await response.json();
 *     if (!Array.isArray(data) || data.length === 0) return;
 *
 *     // Initialize Timeline section (minimal cards for scanning)
 *     const timelineContainer = document.getElementById('timeline-foundation');
 *     if (timelineContainer) {
 *       initTimelineSection(timelineContainer, data);
 *     }
 *
 *     // Initialize QuestMap section (detailed cards for reading)
 *     const questmapContainer = document.getElementById('questmap-foundation');
 *     if (questmapContainer) {
 *       initQuestMapSection(questmapContainer, data);
 *     }
 *   } catch (error) {
 *     console.warn('[Foundation] Failed to initialize roadmap/questmap components', error);
 *   }
 * }
 *
 * // Call when ready to enable:
 * // initFoundationComponents();
 *
 * ========================================================================== */

/* Pyramid-Links kleines Feedback */
["pyramid-x", "pyramid-telegram", "pyramid-dexscreener"].forEach((ev) => {
  document.querySelectorAll(`[data-event="${ev}"]`).forEach((el) => {
    el.addEventListener("mousedown", () => toast("Opening…"));
  });
});

/* Contract Address: unter H1 anzeigen + kopieren bei Click/Enter */
(function showAndCopyContract() {
  const show = document.getElementById("ca-display");
  if (!show) return;
  const ca = show.dataset.copy || show.textContent.trim();
  if (ca) {
    show.textContent = ca;
  }

  function copyCA() {
    if (!ca) return;
    try {
      navigator.clipboard.writeText(ca);
    } catch {}
    show.classList.add("copied");
    setTimeout(() => show.classList.remove("copied"), 900);
    try {
      toast("Contract copied ✅");
    } catch {}
  }

  show.addEventListener("click", copyCA);
  show.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      copyCA();
    }
  });
})();

/* (Optional) Index-Rail: nur wenn #index-rail existiert */
(function initIndexRail() {
  const rail = document.getElementById("index-rail");
  if (!rail) return;

  const sections = [
    { id: "main", label: "Hero" },
    { id: "intro", label: "Intro" },
    { id: "questmap", label: "Roadmap" },
    { id: "tools", label: "Tools" },
    { id: "social-pyramid", label: "Social" },
  ].filter((s) => document.getElementById(s.id));

  rail.innerHTML = "";
  const ul = document.createElement("ul");
  ul.id = "index-rail-list";
  sections.forEach((s) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = `#${s.id}`;
    a.textContent = s.label;
    li.appendChild(a);
    ul.appendChild(li);
  });
  rail.appendChild(ul);

  const toggle = document.getElementById("rail-toggle");
  const railList = document.getElementById("index-rail-list");
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
  } else if (railList) {
    railList.classList.remove("hidden");
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          rail.querySelectorAll("a[aria-current]").forEach((a) => a.removeAttribute("aria-current"));
          const link = rail.querySelector(`a[href="#${en.target.id}"]`);
          link && link.setAttribute("aria-current", "true");
        }
      });
    },
    { rootMargin: "-30% 0% -60% 0%", threshold: [0, 1] }
  );
  sections.forEach((s) => {
    const el = document.getElementById(s.id);
    if (el) io.observe(el);
  });
})();

/* Shared Rail Initialisierung */
initSharedRail({ railId: "index-rail", listId: "index-rail-list" });

/* Initialisiere Sticky-Rail */
initStickyRail({
  railSelector: ".left-rail",
  sentinelId: "home-sentinel-end",
  sentinelContainerSelector: ".layout-grid",
});
