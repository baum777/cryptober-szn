// /js/shared-rail.js – Additive Shared Rail Logik
function getHeaderHeight() {
  const root = document.documentElement;
  const cssVal = getComputedStyle(root).getPropertyValue("--header-height");
  const parsed = parseInt(cssVal, 10);
  if (!Number.isNaN(parsed) && parsed > 0) {
    return parsed;
  }

  const header = document.querySelector("#site-header");
  return header ? Math.round(header.getBoundingClientRect().height) : 72;
}

export function initSharedRail({ railId = "index-rail", listId = "index-rail-list" } = {}) {
  const rail = document.getElementById(railId);
  const railList = document.getElementById(listId);
  if (!rail || !railList) return;

  const headerHeight = getHeaderHeight();
  document.documentElement.style.setProperty("--header-height", `${headerHeight}px`);

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
  sentinel.classList.add("rail-sentinel");
  rail.insertAdjacentElement("afterend", sentinel);

  rail.classList.add("is-sticky");
  rail.classList.remove("is-at-end");

  const ioEnd = new IntersectionObserver(
    ([en]) => {
      const atEnd = Boolean(en && en.isIntersecting);
      rail.classList.toggle("is-at-end", atEnd);
    },
    { threshold: 0, rootMargin: "0px 0px -50% 0px" }
  );
  ioEnd.observe(sentinel);

  const destroy = () => {
    observer.disconnect();
    ioEnd.disconnect();
    rail.classList.remove("is-at-end");
    rail.classList.remove("is-sticky");
    sentinel.remove();
  };

  window.addEventListener("beforeunload", destroy, { once: true });

  return { destroy };
}
