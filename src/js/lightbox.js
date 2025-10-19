import { prefersReducedMotion, getFocusableElements, trapFocus } from "/utils/a11y.js";

const SWIPE_THRESHOLD_PX = 48;
const SWIPE_MAX_DURATION_MS = 600;

const SELECTORS = {
  window: ".lightbox__window",
  close: ".btn--close",
  prev: ".btn--prev",
  next: ".btn--next",
  media: ".lightbox__media",
  image: ".lightbox__img",
  caption: ".lightbox__caption",
  indicator: ".lightbox__indicator",
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
    onEdge,
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
    this.swipeStartX = null;
    this.swipeStartTime = 0;

    this.handleKeyDown = this.onKeyDown.bind(this);
    this.handleTrap = this.onTrap.bind(this);
    this.handleOverlayClick = this.onOverlayClick.bind(this);
    this.handlePrev = this.prev.bind(this);
    this.handleNext = this.next.bind(this);
    this.handleClose = this.close.bind(this);
    this.handlePointerDown = this.onPointerDown.bind(this);
    this.handlePointerUp = this.onPointerUp.bind(this);
    this.handlePointerCancel = this.resetPointer.bind(this);
    this.handleVisibilityChange = this.onVisibilityChange.bind(this);
    this.handleImageError = this.onImageError.bind(this);

    this.ready = this.setup();
  }

  setup() {
    if (!this.element) {
      return false;
    }

    const { window: windowSel, close, prev, next, media, image, caption, indicator, announcer } = this.selectors;
    this.windowEl = this.element.querySelector(windowSel);
    this.closeButton = this.element.querySelector(close);
    this.prevButton = this.element.querySelector(prev);
    this.nextButton = this.element.querySelector(next);
    this.mediaEl = this.element.querySelector(media);
    this.imageEl = this.element.querySelector(image);
    this.captionEl = this.element.querySelector(caption);
    this.indicatorEl = this.element.querySelector(indicator);
    this.announcerEl = this.element.querySelector(announcer);

    if (!this.windowEl || !this.closeButton || !this.imageEl || !this.indicatorEl) {
      return false;
    }

    this.mediaTarget = this.mediaEl || this.imageEl;

    this.element.addEventListener("click", this.handleOverlayClick);
    this.closeButton.addEventListener("click", this.handleClose);
    this.prevButton?.addEventListener("click", this.handlePrev);
    this.nextButton?.addEventListener("click", this.handleNext);
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

    this.bindPointer();
    this.focusInitial();
    this.preloadNeighbors();

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

    this.unbindPointer();
    this.resetPointer();

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
    this.prevButton?.removeEventListener("click", this.handlePrev);
    this.nextButton?.removeEventListener("click", this.handleNext);
    this.imageEl?.removeEventListener("error", this.handleImageError);
    this.unbindPointer();
    this.items = [];
    this.focusables = [];
    this.lastTrigger = null;
  }

  bindPointer() {
    if (!this.mediaTarget) return;
    this.mediaTarget.addEventListener("pointerdown", this.handlePointerDown);
    this.mediaTarget.addEventListener("pointerup", this.handlePointerUp);
    this.mediaTarget.addEventListener("pointercancel", this.handlePointerCancel);
    this.mediaTarget.addEventListener("pointerleave", this.handlePointerCancel);
  }

  unbindPointer() {
    if (!this.mediaTarget) return;
    this.mediaTarget.removeEventListener("pointerdown", this.handlePointerDown);
    this.mediaTarget.removeEventListener("pointerup", this.handlePointerUp);
    this.mediaTarget.removeEventListener("pointercancel", this.handlePointerCancel);
    this.mediaTarget.removeEventListener("pointerleave", this.handlePointerCancel);
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

    switch (event.key) {
      case "Escape":
        event.preventDefault();
        this.close();
        break;
      case "ArrowRight":
        event.preventDefault();
        this.next();
        break;
      case "ArrowLeft":
        event.preventDefault();
        this.prev();
        break;
      default:
        break;
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

  onPointerDown(event) {
    if (event.pointerType !== "touch") return;
    this.swipeStartX = event.clientX;
    this.swipeStartTime = Date.now();
  }

  onPointerUp(event) {
    if (event.pointerType !== "touch" || this.swipeStartX === null) {
      return;
    }
    const deltaX = event.clientX - this.swipeStartX;
    const duration = Date.now() - this.swipeStartTime;

    if (Math.abs(deltaX) > SWIPE_THRESHOLD_PX && duration < SWIPE_MAX_DURATION_MS) {
      if (deltaX > 0) {
        this.prev();
      } else {
        this.next();
      }
    }
    this.resetPointer();
  }

  resetPointer() {
    this.swipeStartX = null;
    this.swipeStartTime = 0;
  }

  onVisibilityChange() {
    if (document.hidden && this.isOpen) {
      this.close({ restoreFocus: false });
    }
  }

  next() {
    if (!this.isOpen) {
      return false;
    }
    if (this.activeIndex >= this.items.length - 1) {
      if (this.onEdge && this.onEdge("next", this.activeIndex)) {
        return true;
      }
      return false;
    }
    this.activeIndex += 1;
    this.render();
    this.preloadNeighbors();
    return true;
  }

  prev() {
    if (!this.isOpen) {
      return false;
    }
    if (this.activeIndex <= 0) {
      if (this.onEdge && this.onEdge("prev", this.activeIndex)) {
        return true;
      }
      return false;
    }
    this.activeIndex -= 1;
    this.render();
    this.preloadNeighbors();
    return true;
  }

  goTo(index) {
    if (index === this.activeIndex) return;
    const clamped = clamp(index, 0, this.items.length - 1);
    if (clamped === this.activeIndex) return;
    this.activeIndex = clamped;
    this.render();
    this.preloadNeighbors();
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
      }
      this.imageEl.src = item.src;
    } else {
      this.imageEl.classList.remove("is-transitioning");
    }
    this.imageEl.alt = item.alt || "";
    if (typeof item.width === "number") {
      this.imageEl.width = item.width;
    }
    if (typeof item.height === "number") {
      this.imageEl.height = item.height;
    }

    if (this.captionEl) {
      this.captionEl.textContent = item.caption || "";
      this.captionEl.classList.toggle("hidden", !item.caption);
    }

    const positionText = `Image ${this.activeIndex + 1} of ${this.items.length}`;
    const description = item.alt || item.caption || "Gallery image";
    if (this.indicatorEl) {
      this.indicatorEl.textContent = `${positionText} — ${description}`;
    }
    this.announce(`${positionText}: ${description}`);

    this.updateControls();
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

  updateControls() {
    const atStart = this.activeIndex <= 0;
    const atEnd = this.activeIndex >= this.items.length - 1;

    if (this.prevButton) {
      this.prevButton.disabled = atStart;
      this.prevButton.setAttribute("aria-disabled", atStart ? "true" : "false");
    }
    if (this.nextButton) {
      this.nextButton.disabled = atEnd;
      this.nextButton.setAttribute("aria-disabled", atEnd ? "true" : "false");
    }
  }

  preloadNeighbors() {
    const neighbors = [this.activeIndex - 1, this.activeIndex + 1];
    neighbors
      .filter((idx) => idx >= 0 && idx < this.items.length)
      .map((idx) => this.items[idx])
      .forEach((candidate) => {
        if (!candidate || !candidate.src) return;
        const preload = new Image();
        preload.src = candidate.src;
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

export function createLightbox(options) {
  return new Lightbox(options);
}
