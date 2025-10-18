// ================================
// /js/gallery.js — Gallery Grid + Lightbox Viewer
// ================================

import { prefersReducedMotion } from "/utils/a11y.js";

const DEFAULT_BASE_PATH = "/assets/gallery/";
const SWIPE_THRESHOLD_PX = 48;
const SWIPE_MAX_DURATION_MS = 600;

function mapLabelFromFile(file) {
  return String(file || "")
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toGalleryImage(file, basePath = DEFAULT_BASE_PATH) {
  if (typeof file === "string") {
    return {
      src: encodeURI(`${basePath}${file}`),
      alt: mapLabelFromFile(file),
    };
  }

  const src = file?.src || (file?.file ? encodeURI(`${basePath}${file.file}`) : "");
  return {
    src,
    alt: file?.alt ?? mapLabelFromFile(file?.file || src),
    width: file?.width,
    height: file?.height,
  };
}

export const DEFAULT_GALLERY_FILES = [
  "behold_flame.png",
  "brewing_bull_spooky.png",
  "bubble_scripts.png",
  "cascade_ignite.png",
  "community-first.png",
  "conjuring_uptober.png",
  "cryptober_harvest_candle.png",
  "cryptober_harvest.png",
  "cryptober-gang.png",
  "dca_still_retail.png",
  "draw the chart.png",
  "ghost_fomo.png",
  "green_ghosts.png",
  "harvest.png",
  "icon-timeline-skeleton.png",
  "ignition_achived.png",
  "pepe -uptober-vibe.png",
  "pepe_raiding.png",
  "pepe_wild_raiding.png",
  "pmpkin-green.png",
  "powell_rate_cut.png",
  "pull_lever.png",
  "pulling_lever_history.png",
  "pumpin.png",
  "pumpkin-pump.png",
  "rug_wolf.webp",
  "seed_to_script.png",
  "the_beginning.png",
  "trickortreat.png",
  "unite_degen.png",
  "witc_drive.png",
];

export const DEFAULT_GALLERY_IMAGES = resolveImages();

function resolveImages({ images, files, basePath } = {}) {
  const activeBasePath = basePath || DEFAULT_BASE_PATH;
  if (Array.isArray(images) && images.length) {
    return images.map((img) => toGalleryImage(img, activeBasePath));
  }
  if (Array.isArray(files) && files.length) {
    return files.map((file) => toGalleryImage(file, activeBasePath));
  }
  return DEFAULT_GALLERY_FILES.map((file) => toGalleryImage(file, activeBasePath));
}

function queryWithin(root, selector, fallbackId) {
  if (root && selector) {
    const found = root.querySelector(selector);
    if (found) return found;
  }
  if (selector) {
    try {
      const direct = document.querySelector(selector);
      if (direct) return direct;
    } catch (error) {
      // ignore invalid selectors and continue
    }
  }
  if (fallbackId) {
    return document.getElementById(fallbackId);
  }
  return null;
}

function clampIndex(index, max) {
  if (index < 0) return 0;
  if (index > max) return max;
  return index;
}

class GalleryLightbox {
  constructor({
    rootId,
    gridId = "gallery-grid",
    lightboxId = "lightbox",
    gridSelector,
    lightboxSelector,
    images,
    files,
    basePath = DEFAULT_BASE_PATH,
  } = {}) {
    this.root = rootId ? document.getElementById(rootId) : null;
    this.grid = queryWithin(this.root, gridSelector, gridId);
    this.lightbox = queryWithin(null, lightboxSelector, lightboxId);
    this.images = resolveImages({ images, files, basePath });
    this.reduceMotion = prefersReducedMotion();
    this.body = document.body;
    this.activeIndex = 0;
    this.isOpen = false;
    this.lastTrigger = null;
    this.swipeStartX = null;
    this.swipeStartTime = 0;

    if (!this.grid || !this.lightbox || this.images.length === 0) {
      this.ready = false;
      return;
    }

    this.window = this.lightbox.querySelector(".lightbox__window");
    this.closeButton = this.lightbox.querySelector(".btn--close");
    this.prevButton = this.lightbox.querySelector(".btn--prev");
    this.nextButton = this.lightbox.querySelector(".btn--next");
    this.media = this.lightbox.querySelector(".lightbox__media");
    this.imageEl = this.lightbox.querySelector(".lightbox__img");
    this.indicator = this.lightbox.querySelector(".lightbox__indicator");
    this.announcer = this.lightbox.querySelector(".lightbox__announcer");

    if (!this.window || !this.closeButton || !this.imageEl || !this.indicator) {
      this.ready = false;
      return;
    }

    this.ready = true;
    this.grid.setAttribute("role", "list");

    this.handleKeyDown = this.onKeyDown.bind(this);
    this.handleOverlayClick = this.onOverlayClick.bind(this);
    this.handlePrev = this.prev.bind(this);
    this.handleNext = this.next.bind(this);
    this.handleClose = this.close.bind(this);
    this.handleTrap = this.trapTab.bind(this);
    this.handlePointerDown = this.onPointerDown.bind(this);
    this.handlePointerUp = this.onPointerUp.bind(this);
    this.handlePointerCancel = this.resetPointer.bind(this);

    this.renderGrid();
    this.bindLightbox();
  }

  renderGrid() {
    if (!this.ready || !this.grid) return;

    this.grid.innerHTML = "";
    const lightboxId = this.lightbox?.id || "lightbox";
    this.buttons = this.images.map((img, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "gallery-item";
      button.dataset.index = String(index);
      button.setAttribute("role", "listitem");
      button.setAttribute("aria-label", this.buildAriaLabel(img, index));
      button.setAttribute("aria-haspopup", "dialog");
      button.setAttribute("aria-controls", lightboxId);

      const picture = document.createElement("img");
      picture.className = "gallery-item__img";
      picture.src = img.src;
      picture.alt = img.alt || "";
      picture.decoding = "async";
      picture.loading = index < 3 ? "eager" : "lazy";
      if (typeof img.width === "number") picture.width = img.width;
      if (typeof img.height === "number") picture.height = img.height;

      button.appendChild(picture);
      button.addEventListener("click", () => this.open(index, button));
      button.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          this.open(index, button);
        }
      });

      this.grid.appendChild(button);
      return button;
    });
  }

  bindLightbox() {
    if (!this.ready) return;

    this.closeButton.addEventListener("click", this.handleClose);
    this.prevButton?.addEventListener("click", this.handlePrev);
    this.nextButton?.addEventListener("click", this.handleNext);
    this.lightbox.addEventListener("click", this.handleOverlayClick);
    this.lightbox.addEventListener("keydown", this.handleTrap);

    const swipeTarget = this.media || this.imageEl;
    if (swipeTarget) {
      swipeTarget.addEventListener("pointerdown", this.handlePointerDown);
      swipeTarget.addEventListener("pointerup", this.handlePointerUp);
      swipeTarget.addEventListener("pointercancel", this.handlePointerCancel);
      swipeTarget.addEventListener("pointerleave", this.handlePointerCancel);
    }
  }

  buildAriaLabel(img, index) {
    const label = img?.alt?.trim() || `Gallery item ${index + 1}`;
    return `Open ${label} in viewer`;
  }

  open(index = 0, trigger) {
    if (!this.ready) return;
    const safeIndex = clampIndex(index, this.images.length - 1);
    this.activeIndex = safeIndex;
    this.lastTrigger = trigger || this.buttons?.[safeIndex] || null;

    this.updateLightbox();

    this.isOpen = true;
    this.lightbox.removeAttribute("hidden");
    if (!this.reduceMotion) {
      requestAnimationFrame(() => {
        this.lightbox.classList.add("is-visible");
      });
    } else {
      this.lightbox.classList.add("is-visible");
    }
    if (this.body) {
      this.body.classList.add("is-lightbox-open");
    }

    document.addEventListener("keydown", this.handleKeyDown);
    this.focusFirstControl();
    this.preloadNeighbors();
  }

  close() {
    if (!this.isOpen) return;

    this.isOpen = false;
    this.lightbox.classList.remove("is-visible");
    const finishClose = () => {
      this.lightbox.setAttribute("hidden", "");
    };

    if (!this.reduceMotion) {
      setTimeout(finishClose, 260);
    } else {
      finishClose();
    }

    if (this.body) {
      this.body.classList.remove("is-lightbox-open");
    }

    document.removeEventListener("keydown", this.handleKeyDown);
    this.resetPointer();

    if (this.lastTrigger && typeof this.lastTrigger.focus === "function") {
      this.lastTrigger.focus();
    }
  }

  next() {
    if (!this.isOpen) {
      this.open(0);
      return;
    }
    if (this.activeIndex >= this.images.length - 1) return;
    this.activeIndex += 1;
    this.updateLightbox();
    this.preloadNeighbors();
  }

  prev() {
    if (!this.isOpen) {
      this.open(this.images.length - 1);
      return;
    }
    if (this.activeIndex <= 0) return;
    this.activeIndex -= 1;
    this.updateLightbox();
    this.preloadNeighbors();
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

  onOverlayClick(event) {
    if (event.target === this.lightbox) {
      this.close();
    }
  }

  trapTab(event) {
    if (event.key !== "Tab") return;
    const focusable = this.getFocusableElements();
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    } else if (document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  getFocusableElements() {
    return Array.from(
      this.lightbox.querySelectorAll(
        "button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
      )
    ).filter((el) => !el.hasAttribute("hidden") && el.offsetParent !== null);
  }

  focusFirstControl() {
    const focusable = this.getFocusableElements();
    if (this.window && typeof this.window.focus === "function") {
      this.window.focus({ preventScroll: true });
    }
    const target = focusable.find((el) => el === this.closeButton) || focusable[0];
    if (target && typeof target.focus === "function") {
      target.focus();
    }
  }

  updateLightbox() {
    const item = this.images[this.activeIndex];
    if (!item || !this.imageEl) return;

    if (this.imageEl.src !== item.src) {
      this.imageEl.src = item.src;
    }
    this.imageEl.alt = item.alt || "";
    if (typeof item.width === "number") this.imageEl.width = item.width;
    if (typeof item.height === "number") this.imageEl.height = item.height;

    const positionText = `${this.activeIndex + 1} / ${this.images.length}`;
    const description = item.alt || "Gallery image";
    this.indicator.textContent = `${positionText} — ${description}`;
    this.announce(`${positionText}: ${description}`);

    this.updateControls();
  }

  updateControls() {
    const atStart = this.activeIndex <= 0;
    const atEnd = this.activeIndex >= this.images.length - 1;

    if (this.prevButton) {
      this.prevButton.disabled = atStart;
      this.prevButton.setAttribute("aria-disabled", atStart ? "true" : "false");
    }
    if (this.nextButton) {
      this.nextButton.disabled = atEnd;
      this.nextButton.setAttribute("aria-disabled", atEnd ? "true" : "false");
    }
  }

  announce(message) {
    if (!this.announcer) return;
    this.announcer.textContent = "";
    window.requestAnimationFrame(() => {
      this.announcer.textContent = message;
    });
  }

  preloadNeighbors() {
    [this.activeIndex - 1, this.activeIndex + 1]
      .filter((idx) => idx >= 0 && idx < this.images.length)
      .forEach((idx) => {
        const candidate = this.images[idx];
        if (!candidate || !candidate.src) return;
        const preload = new Image();
        preload.src = candidate.src;
      });
  }

  onPointerDown(event) {
    if (event.pointerType !== "touch") return;
    this.swipeStartX = event.clientX;
    this.swipeStartTime = Date.now();
  }

  onPointerUp(event) {
    if (event.pointerType !== "touch" || this.swipeStartX === null) return;
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

  destroy() {
    if (!this.ready) return;
    this.buttons?.forEach((button) => {
      button.replaceWith(button.cloneNode(true));
    });
    this.closeButton.removeEventListener("click", this.handleClose);
    this.prevButton?.removeEventListener("click", this.handlePrev);
    this.nextButton?.removeEventListener("click", this.handleNext);
    this.lightbox.removeEventListener("click", this.handleOverlayClick);
    this.lightbox.removeEventListener("keydown", this.handleTrap);
    const swipeTarget = this.media || this.imageEl;
    if (swipeTarget) {
      swipeTarget.removeEventListener("pointerdown", this.handlePointerDown);
      swipeTarget.removeEventListener("pointerup", this.handlePointerUp);
      swipeTarget.removeEventListener("pointercancel", this.handlePointerCancel);
      swipeTarget.removeEventListener("pointerleave", this.handlePointerCancel);
    }
    document.removeEventListener("keydown", this.handleKeyDown);
  }
}

export function initGallery(options = {}) {
  return new GalleryLightbox(options);
}

export function initGalleryPager(options = {}) {
  return new GalleryLightbox(options);
}

export { resolveImages, toGalleryImage };
