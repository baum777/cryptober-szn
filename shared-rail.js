// /js/shared-rail.js – Additive Shared Rail Logik
export function initSharedRail({ railId = "index-rail", listId = "index-rail-list" } = {}) {
  const rail = document.getElementById(railId);
  const railList = document.getElementById(listId);
  if (!rail || !railList) return;

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
        rail.style.top = "88px";
        rail.style.bottom = "auto";
      }
    },
    { threshold: 0, rootMargin: "0px 0px -50% 0px" }
  );
  ioEnd.observe(sentinel);
}
