import { Lightbox } from "/src/js/lightbox.js";
import { prefersReducedMotion } from "/utils/a11y.js";

const DEFAULT_BASE_PATH = "/assets/gallery/";
const DEFAULT_PAGE_SIZE = 8;
const FALLBACK_IMAGE =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#101522"/><stop offset="1" stop-color="#05070d"/></linearGradient></defs><rect width="640" height="640" fill="url(#g)"/><text x="50%" y="52%" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="32" text-anchor="middle">Preview unavailable</text></svg>`
  );

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
    caption: file?.caption,
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

function readBooleanFlag(value) {
  if (value === undefined || value === null) return false;
  const normalized = String(value).trim().toLowerCase();
  return normalized === "" || normalized === "true" || normalized === "1" || normalized === "yes";
}

class GalleryController {
  constructor({
    rootId,
    gridId = "gallery-grid",
    gridSelector,
    lightboxId = "lightbox",
    lightboxSelector,
    images,
    files,
    basePath = DEFAULT_BASE_PATH,
    pageSize,
    maxVisible,
    fallbackSrc,
  } = {}) {
    this.root = rootId ? document.getElementById(rootId) : null;
    this.grid = queryWithin(this.root, gridSelector, gridId);
    if (!this.grid) {
      this.grid =
        document.getElementById("lore-gallery") ||
        document.getElementById("mascot-gallery") ||
        null;
    }
    this.lightboxElement = queryWithin(null, lightboxSelector, lightboxId);
    this.lightboxId = this.lightboxElement?.id || lightboxId || null;
    this.reduceMotion = prefersReducedMotion();
    this.basePath = basePath;
    this.fallbackSrc = fallbackSrc || FALLBACK_IMAGE;
    const domImages = this.collectDomImages();
    const resolvedImages = resolveImages({ images, files, basePath });
    this.images = domImages.length ? domImages : resolvedImages;
    this.pageSize = Math.max(1, Number(pageSize || maxVisible || DEFAULT_PAGE_SIZE));
    this.totalPages = Math.max(1, Math.ceil(this.images.length / this.pageSize));
    this.currentPage = 0;
    this.activeIndex = 0;
    this.items = [];
    this.pager = null;
    this.shouldFocusFirst = false;
    this.ready = false;

    if (!this.grid || !this.lightboxElement || this.images.length === 0) {
      return;
    }

    this.wrapper = this.grid.parentElement || this.root || null;
    this.disableGradient =
      readBooleanFlag(this.grid?.dataset?.noGradient) ||
      readBooleanFlag(this.wrapper?.dataset?.noGradient) ||
      readBooleanFlag(this.root?.dataset?.noGradient);

    this.lightbox = new Lightbox({
      element: this.lightboxElement,
      fallbackSrc: this.fallbackSrc,
      onChange: this.handleLightboxChange.bind(this),
      onEdge: this.handleLightboxEdge.bind(this),
      onClose: this.handleLightboxClose.bind(this),
    });

    if (!this.lightbox.ready) {
      return;
    }

    this.ready = true;
    this.grid.setAttribute("role", "list");
    this.pager = this.setupPager();
    this.lightbox.setItems(this.images);
    this.renderGrid();
  }

  setImages(nextImages) {
    this.images = resolveImages({ images: nextImages, basePath: this.basePath });
    if (!this.ready) return;
    this.totalPages = Math.max(1, Math.ceil(this.images.length / this.pageSize));
    this.currentPage = clampIndex(this.currentPage, this.totalPages - 1);
    this.activeIndex = clampIndex(this.activeIndex, this.images.length - 1);
    this.lightbox.setItems(this.images);
    this.renderGrid();
  }

  renderGrid() {
    if (!this.ready) return;
    this.teardownItems();
    this.grid.textContent = "";

    const start = this.currentPage * this.pageSize;
    const end = Math.min(start + this.pageSize, this.images.length);
    const visible = this.images.slice(start, end);

    visible.forEach((image, localIndex) => {
      const globalIndex = start + localIndex;
      const entry = this.createItem(image, globalIndex, localIndex);
      this.grid.appendChild(entry.button);
      this.items.push(entry);
    });

    this.highlightActiveItem();
    this.updatePager();

    if (this.shouldFocusFirst && this.items[0]?.button) {
      this.items[0].button.focus();
    }
    this.shouldFocusFirst = false;
  }

  createItem(image, globalIndex, localIndex) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "gallery-item gallery-item--glow";
    button.dataset.index = String(globalIndex);
    button.setAttribute("role", "listitem");
    button.setAttribute("aria-label", this.buildAriaLabel(image, globalIndex));
    button.setAttribute("aria-haspopup", "dialog");
    if (this.lightboxId) {
      button.setAttribute("aria-controls", this.lightboxId);
    }

    const box = document.createElement("div");
    box.className = "img-box";

    const img = document.createElement("img");
    img.src = image.src;
    img.alt = image.alt || "";
    img.decoding = "async";
    img.loading = localIndex < 4 || this.reduceMotion ? "eager" : "lazy";
    if (typeof image.width === "number") img.width = image.width;
    if (typeof image.height === "number") img.height = image.height;

    const errorHandler = () => this.handleImageError(img, button, image);
    img.addEventListener("error", errorHandler);

    box.appendChild(img);
    if (!this.disableGradient) {
      const gradient = document.createElement("span");
      gradient.className = "img-gradient-bottom";
      gradient.setAttribute("aria-hidden", "true");
      box.appendChild(gradient);
    }

    button.appendChild(box);

    if (image.caption) {
      const caption = document.createElement("p");
      caption.className = "gallery-item__caption muted";
      caption.textContent = image.caption;
      button.appendChild(caption);
    }

    const clickHandler = () => this.openFromGrid(globalIndex, button);
    button.addEventListener("click", clickHandler);

    return { button, image, clickHandler, img, errorHandler };
  }

  buildAriaLabel(image, index) {
    const label = image?.alt?.trim() || `Gallery item ${index + 1}`;
    return `Open ${label} in viewer`;
  }

  openFromGrid(index, trigger) {
    if (!this.ready) return;
    this.activeIndex = clampIndex(index, this.images.length - 1);
    this.lightbox.setItems(this.images);
    this.lightbox.open(this.activeIndex, { trigger });
    this.highlightActiveItem();
  }

  handleLightboxChange(index) {
    const nextIndex = clampIndex(index, this.images.length - 1);
    this.activeIndex = nextIndex;
    const targetPage = Math.floor(nextIndex / this.pageSize);
    if (targetPage !== this.currentPage) {
      this.currentPage = targetPage;
      this.renderGrid();
    } else {
      this.highlightActiveItem();
      this.updatePager();
    }
  }

  handleLightboxEdge() {
    return false;
  }

  handleLightboxClose() {
    this.highlightActiveItem();
  }

  handleImageError(img, button, image) {
    if (!img || img.dataset.fallbackApplied === "true") return;
    img.dataset.fallbackApplied = "true";
    img.src = this.fallbackSrc;
    const label = image?.alt?.trim() || "Gallery image";
    img.alt = `${label} preview unavailable`;
    button?.classList.add("is-placeholder");
  }

  highlightActiveItem() {
    const activeIndex = this.activeIndex;
    this.items.forEach(({ button }) => {
      if (!button) return;
      const isActive = Number(button.dataset.index) === activeIndex;
      button.classList.toggle("is-active", isActive);
    });
  }

  setupPager() {
    if (!this.wrapper) return null;
    const pager = document.createElement("div");
    pager.className = "gallery-pager";

    const prev = document.createElement("button");
    prev.type = "button";
    prev.className = "gallery-pager__button btn btn-ghost";
    prev.setAttribute("aria-label", "Previous gallery page");
    prev.textContent = "← Prev";

    const status = document.createElement("span");
    status.setAttribute("aria-live", "polite");

    const next = document.createElement("button");
    next.type = "button";
    next.className = "gallery-pager__button btn btn-ghost";
    next.setAttribute("aria-label", "Next gallery page");
    next.textContent = "Next →";

    pager.append(prev, status, next);
    this.grid.insertAdjacentElement("afterend", pager);

    const handlePrev = () => this.goToPage(this.currentPage - 1);
    const handleNext = () => this.goToPage(this.currentPage + 1);
    prev.addEventListener("click", handlePrev);
    next.addEventListener("click", handleNext);

    return { root: pager, prev, next, status, handlePrev, handleNext };
  }

  updatePager() {
    if (!this.pager) return;
    const { root, prev, next, status } = this.pager;
    const total = this.totalPages;
    const current = this.currentPage + 1;
    root.hidden = total <= 1;

    const atStart = current <= 1;
    const atEnd = current >= total;

    prev.disabled = atStart;
    next.disabled = atEnd;
    prev.setAttribute("aria-disabled", atStart ? "true" : "false");
    next.setAttribute("aria-disabled", atEnd ? "true" : "false");

    if (status) {
      status.textContent = `Page ${current} of ${total}`;
    }
  }

  goToPage(page) {
    if (!this.ready) return;
    const target = clampIndex(page, this.totalPages - 1);
    if (target === this.currentPage) return;
    this.currentPage = target;
    this.activeIndex = clampIndex(target * this.pageSize, this.images.length - 1);
    this.shouldFocusFirst = true;
    this.renderGrid();
  }

  teardownItems() {
    if (!Array.isArray(this.items)) return;
    this.items.forEach(({ button, clickHandler, img, errorHandler }) => {
      if (button && clickHandler) {
        button.removeEventListener("click", clickHandler);
      }
      if (img && errorHandler) {
        img.removeEventListener("error", errorHandler);
      }
    });
    this.items = [];
  }

  destroy() {
    if (!this.ready) return;
    this.teardownItems();
    this.lightbox.destroy();
    if (this.pager) {
      this.pager.prev.removeEventListener("click", this.pager.handlePrev);
      this.pager.next.removeEventListener("click", this.pager.handleNext);
      this.pager.root.remove();
      this.pager = null;
    }
    this.ready = false;
  }

  collectDomImages() {
    if (!this.grid) return [];
    const items = Array.from(this.grid.querySelectorAll(".gallery-item"));
    if (!items.length) return [];
    return items
      .map((node) => {
        const img = node.querySelector("img");
        if (!img) return null;
        const captionNode = node.querySelector(".gallery-item__caption");
        const width = img.getAttribute("width");
        const height = img.getAttribute("height");
        return {
          src: img.getAttribute("src") || "",
          alt: img.getAttribute("alt") || "",
          width: width ? Number(width) : undefined,
          height: height ? Number(height) : undefined,
          caption: captionNode ? captionNode.textContent.trim() : undefined,
        };
      })
      .filter((data) => data && data.src);
  }
}

export function initGallery(options = {}) {
  return new GalleryController(options);
}

export function initGalleryPager(options = {}) {
  return new GalleryController(options);
}

export { resolveImages, toGalleryImage };
