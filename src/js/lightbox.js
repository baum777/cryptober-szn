import { prefersReducedMotion, getFocusableElements, trapFocus } from "/utils/a11y.js";

const SELECTORS = {
  window: ".lightbox__window",
  close: ".btn--close",
  media: ".lightbox__media",
  image: ".lightbox__img",
  announcer: ".lightbox__announcer",
};

function clamp(value, min, max) {
  if (Number.isNaN(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export class Lightbox {
  constructor({
    element,
    id = "lightbox",
    selectors = {},
    onOpen,
    onClose,
    onChange,
    onEdge, // retained for compatibility even if unused
    fallbackSrc,
  } = {}) {
    this.id = id;
    this.element = element || (id ? document.getElementById(id) : null);
    this.selectors = { ...SELECTORS, ...selectors };
    this.onOpen = typeof onOpen === "function" ? onOpen : null;
    this.onClose = typeof onClose === "function" ? onClose : null;
    this.onChange = typeof onChange === "function" ? onChange : null;
    this.onEdge = typeof onEdge === "function" ? onEdge : null;
    this.fallbackSrc = fallbackSrc || null;

    this.body = document.body || null;
    this.reduceMotion = prefersReducedMotion();
    this.items = [];
    this.activeIndex = 0;
    this.isOpen = false;
    this.lastTrigger = null;
    this.focusables = [];

    this.handleKeyDown = this.onKeyDown.bind(this);
    this.handleTrap = this.onTrap.bind(this);
    this.handleOverlayClick = this.onOverlayClick.bind(this);
    this.handleClose = this.close.bind(this);
    this.handleVisibilityChange = this.onVisibilityChange.bind(this);
    this.handleImageError = this.onImageError.bind(this);

    this.ready = this.setup();
  }

  setup() {
    if (!this.element) {
      return false;
    }

    const { window: windowSel, close, media, image, announcer } = this.selectors;
    this.windowEl = this.element.querySelector(windowSel);
    this.closeButton = this.element.querySelector(close);
    this.mediaEl = this.element.querySelector(media);
    this.imageEl = this.element.querySelector(image);
    this.announcerEl = this.element.querySelector(announcer);

    if (!this.windowEl || !this.closeButton || !this.imageEl) {
      return false;
    }

    this.mediaTarget = this.mediaEl || this.imageEl;

    this.element.addEventListener("click", this.handleOverlayClick);
    this.closeButton.addEventListener("click", this.handleClose);
    this.imageEl.addEventListener("error", this.handleImageError);

    return true;
  }

  setItems(items = []) {
    if (!Array.isArray(items)) {
      this.items = [];
      return;
    }
    this.items = items.filter((item) => item && item.src);
    if (this.activeIndex >= this.items.length) {
      this.activeIndex = this.items.length > 0 ? this.items.length - 1 : 0;
    }
  }

  open(index = 0, { trigger } = {}) {
    if (!this.ready || this.items.length === 0) return false;

    this.activeIndex = clamp(index, 0, this.items.length - 1);
    this.lastTrigger = trigger || null;
    this.isOpen = true;

    this.render();

    this.element.removeAttribute("hidden");
    this.element.setAttribute("aria-hidden", "false");

    if (!this.reduceMotion) {
      requestAnimationFrame(() => {
        this.element.classList.add("is-visible");
      });
    } else {
      this.element.classList.add("is-visible");
    }

    this.body?.classList.add("is-lightbox-open");

    document.addEventListener("keydown", this.handleKeyDown);
    this.element.addEventListener("keydown", this.handleTrap);
    document.addEventListener("visibilitychange", this.handleVisibilityChange);

    this.focusInitial();

    if (this.onOpen) {
      this.onOpen(this.activeIndex, this.items[this.activeIndex]);
    }

    return true;
  }

  close({ restoreFocus = true } = {}) {
    if (!this.isOpen) return;

    this.isOpen = false;
    this.element.classList.remove("is-visible");
    this.element.setAttribute("aria-hidden", "true");

    const finalize = () => {
      if (!this.isOpen) {
        this.element.setAttribute("hidden", "");
      }
    };

    if (!this.reduceMotion) {
      window.setTimeout(finalize, 220);
    } else {
      finalize();
    }

    this.body?.classList.remove("is-lightbox-open");

    document.removeEventListener("keydown", this.handleKeyDown);
    this.element.removeEventListener("keydown", this.handleTrap);
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);

    if (restoreFocus && this.lastTrigger && typeof this.lastTrigger.focus === "function") {
      this.lastTrigger.focus({ preventScroll: true });
    }

    if (this.onClose) {
      this.onClose();
    }
  }

  destroy() {
    this.close({ restoreFocus: false });
    this.element?.removeEventListener("click", this.handleOverlayClick);
    this.closeButton?.removeEventListener("click", this.handleClose);
    this.imageEl?.removeEventListener("error", this.handleImageError);
    this.items = [];
    this.focusables = [];
    this.lastTrigger = null;
  }

  focusInitial() {
    if (this.windowEl?.focus) {
      this.windowEl.focus({ preventScroll: true });
    }
    this.focusables = getFocusableElements(this.element);
    const preferred = this.focusables.find((node) => node === this.closeButton) || this.focusables[0];
    preferred?.focus?.({ preventScroll: true });
  }

  onKeyDown(event) {
    if (!this.isOpen) return;

    if (event.key === "Escape") {
      event.preventDefault();
      this.close();
    }
  }

  onTrap(event) {
    if (!this.isOpen) return;
    trapFocus(event, this.focusables);
  }

  onOverlayClick(event) {
    if (event.target === this.element) {
      this.close();
    }
  }

  onVisibilityChange() {
    if (document.hidden && this.isOpen) {
      this.close({ restoreFocus: false });
    }
  }

  render() {
    const item = this.items[this.activeIndex];
    if (!item || !this.imageEl) return;

    delete this.imageEl.dataset.fallbackApplied;

    if (this.imageEl.src !== item.src) {
      if (!this.reduceMotion) {
        this.imageEl.classList.add("is-transitioning");
        const handleLoad = () => {
          this.imageEl.classList.remove("is-transitioning");
        };
        this.imageEl.addEventListener("load", handleLoad, { once: true });
      } else {
        this.imageEl.classList.remove("is-transitioning");
      }
      this.imageEl.src = item.src;
    } else {
      this.imageEl.classList.remove("is-transitioning");
    }

    this.imageEl.alt = item.alt || "";

    if (typeof item.width === "number") {
      this.imageEl.width = item.width;
    } else {
      this.imageEl.removeAttribute("width");
    }

    if (typeof item.height === "number") {
      this.imageEl.height = item.height;
    } else {
      this.imageEl.removeAttribute("height");
    }

    const positionText = `Image ${this.activeIndex + 1} of ${this.items.length}`;
    const description = item.alt || item.caption || "Gallery image";
    this.announce(`${positionText}: ${description}`);

    if (this.onChange) {
      this.onChange(this.activeIndex, item);
    }
  }

  announce(message) {
    if (!this.announcerEl) return;
    this.announcerEl.textContent = "";
    requestAnimationFrame(() => {
      this.announcerEl.textContent = message;
    });
  }

  onImageError() {
    if (!this.imageEl || !this.fallbackSrc || this.imageEl.dataset.fallbackApplied === "true") {
      return;
    }
    this.imageEl.dataset.fallbackApplied = "true";
    this.imageEl.src = this.fallbackSrc;
    const current = this.items[this.activeIndex];
    const label = current?.alt || current?.caption || "Gallery image";
    this.imageEl.alt = `${label} preview unavailable`;
    this.announce("Image preview unavailable");
  }
}
