import { toast } from "/js/main.js";

const DEFAULT_LIGHTBOX_ID = "lightbox";

const clampIndex = (value, max) => {
  if (max <= 0) return 0;
  if (value < 0) return 0;
  if (value > max) return max;
  return value;
};

function collectQuestItems(grid) {
  if (!grid) return [];
  const tiles = Array.from(grid.querySelectorAll(".quest-tile"));
  return tiles
    .map((tile) => {
      const img = tile.querySelector("img");
      if (!img) return null;
      const captionNode = tile.querySelector(".gallery-item__caption");
      const src = img.getAttribute("src") || img.currentSrc || "";
      if (!src) return null;
      const widthAttr = img.getAttribute("width");
      const heightAttr = img.getAttribute("height");
      return {
        src,
        alt: img.getAttribute("alt") || "Quest image",
        width: widthAttr ? Number(widthAttr) : undefined,
        height: heightAttr ? Number(heightAttr) : undefined,
        caption: captionNode ? captionNode.textContent.trim() : undefined,
      };
    })
    .filter(Boolean);
}

/**
 * Initialize quest grid interactions (toast + optional media preview callbacks).
 * @param {Object} [options]
 * @param {string|HTMLElement} [options.gridSelector="#quest-grid .quest-grid"]
 * @param {string} [options.revealMessage="Reveal soon ⏳"]
 * @param {number} [options.revealDuration=2000]
 * @param {(context: {
 *   event: MouseEvent,
 *   trigger: HTMLElement,
 *   tile: HTMLElement | null,
 *   img: HTMLImageElement | null,
 *   caption: HTMLElement | null,
 *   index: number,
 *   items: Array<{src:string,alt:string,caption?:string,width?:number,height?:number}>
 * }) => boolean | void} [options.onMediaRequest]
 */
export function initQuestGrid({
  gridSelector = "#quest-grid .quest-grid",
  revealMessage = "Reveal soon ⏳",
  revealDuration = 2000,
  onMediaRequest,
  lightbox,
  lightboxId = DEFAULT_LIGHTBOX_ID,
} = {}) {
  const grid =
    typeof gridSelector === "string" ? document.querySelector(gridSelector) : gridSelector;

  if (!grid) return null;

  const cleanups = [];
  const mediaTriggers = Array.from(grid.querySelectorAll("[data-quest-media]"));

  const bindReveal = (button) => {
    const handleClick = (event) => {
      event.preventDefault();
      toast(revealMessage, revealDuration);
    };
    button.addEventListener("click", handleClick);
    cleanups.push(() => button.removeEventListener("click", handleClick));
  };

  grid.querySelectorAll('[data-quest-action="reveal"]').forEach((button) => {
    if (button instanceof HTMLElement) {
      bindReveal(button);
    }
  });

  mediaTriggers.forEach((trigger, index) => {
    if (!(trigger instanceof HTMLElement)) return;
    if (lightbox && lightboxId) {
      trigger.setAttribute("aria-controls", lightboxId);
      trigger.setAttribute("aria-haspopup", "dialog");
    }
    trigger.dataset.questIndex = String(index);

    const handleMedia = (event) => {
      event.preventDefault();
      const tile = trigger.closest(".quest-tile");
      const img = tile?.querySelector("img");
      const caption = tile?.querySelector(".gallery-item__caption");
      const items = collectQuestItems(grid);
      const context = { event, trigger, tile, img, caption, index, items };

      if (typeof onMediaRequest === "function") {
        const handled = onMediaRequest(context);
        if (handled === true) {
          return;
        }
        if (handled === false) {
          return;
        }
      }

      if (lightbox && items.length) {
        const nextIndex = clampIndex(index, items.length - 1);
        lightbox.setItems(items);
        lightbox.open(nextIndex, { trigger });
      }
    };

    trigger.addEventListener("click", handleMedia);
    cleanups.push(() => trigger.removeEventListener("click", handleMedia));
  });

  const destroy = () => {
    while (cleanups.length) {
      const cleanup = cleanups.pop();
      cleanup?.();
    }
  };

  window.addEventListener("beforeunload", destroy, { once: true });

  return { destroy };
}
