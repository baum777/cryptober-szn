// /js/shared-rail.js – Additive Shared Rail Logik
export function initSharedRail({ railId = "index-rail", listId = "index-rail-list" } = {}) {
  const rail = document.getElementById(railId);
  const railList = document.getElementById(listId);
  if (!rail || !railList) return;

  const docStyle = getComputedStyle(document.documentElement);
  const headerVar = parseInt(docStyle.getPropertyValue("--header-height"), 10);
  const headerEl = document.getElementById("site-header");
  const fallbackHeight = headerEl ? Math.round(headerEl.getBoundingClientRect().height) : 0;
  const headerHeight = Number.isFinite(headerVar) && headerVar > 0 ? headerVar : fallbackHeight;
  const offset = headerHeight + 8;
  document.documentElement.style.setProperty("--rail-top", `${offset}px`);

  // IntersectionObserver für Active-State
  const sections = Array.from(railList.querySelectorAll("a")).map(a => ({
    id: a.getAttribute("href")?.slice(1) || "",
    label: a.textContent || ""
  })).filter(s => s.id);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          railList.querySelectorAll("a[aria-current]").forEach(a => a.removeAttribute("aria-current"));
          const link = railList.querySelector(`a[href="#${en.target.id}"]`);
          link?.setAttribute("aria-current", "true");
        }
      });
    },
    { rootMargin: "-30% 0% -60% 0%", threshold: [0, 1] }
  );
  sections.forEach(s => {
    const el = document.getElementById(s.id);
    if (el) observer.observe(el);
  });

  // Sticky-Ende (Sentinel)
  const sentinel = document.createElement("div");
  sentinel.id = `${railId}-sentinel`;
  sentinel.style.width = "1px";
  sentinel.style.height = "1px";
  rail.insertAdjacentElement("afterend", sentinel);

  const ioEnd = new IntersectionObserver(
    ([en]) => {
      if (en && en.isIntersecting) {
        rail.style.position = "absolute";
        rail.style.top = "auto";
        rail.style.bottom = "0";
      } else {
        rail.style.position = "sticky";
        rail.style.top = "var(--rail-top)";
        rail.style.bottom = "auto";
      }
    },
    { threshold: 0, rootMargin: "0px 0px -50% 0px" }
  );
  ioEnd.observe(sentinel);

  return {
    destroy() {
      observer.disconnect();
      ioEnd.disconnect();
      sentinel.remove();
    },
  };
}
