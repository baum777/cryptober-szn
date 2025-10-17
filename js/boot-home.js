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
  upgradeRoadmapToQuest,
  toast,
  initStickyRail,
} from "/js/main.js";
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
  progress.style.height = "4px";
  progress.style.background = "var(--glass-bg)";
  progress.style.position = "relative";
  progress.innerHTML = `<div class="progress-bar" style="width:0%;height:100%;background:var(--neon-green);transition:width 5000ms linear;"></div>`;
  gallery.appendChild(progress);
}
initGalleryProgressBar();

/* Roadmap → Questmap (nur Layout, Inhalte bleiben unverändert) */
upgradeRoadmapToQuest();

/* Pyramid-Links kleines Feedback */
["pyramid-x", "pyramid-telegram", "pyramid-dexscreener"].forEach((ev) => {
  document.querySelectorAll(`[data-event="${ev}"]`).forEach((el) => {
    el.addEventListener("mousedown", () => toast("Opening…"));
  });
});

/* Contract Address: unter H1 anzeigen + kopieren bei Click/Enter */
(function showAndCopyContract() {
  const srcBtn = document.getElementById("copy-ca");
  const show = document.getElementById("ca-display");
  if (!srcBtn || !show) return;
  const ca = srcBtn.getAttribute("data-copy") || "";
  if (ca) show.textContent = ca;

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
    { id: "roadmap", label: "Roadmap" },
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
