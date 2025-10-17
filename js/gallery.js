// ================================
// /js/gallery.js — Gallery Pager (4x2 grid, pagination skeleton)
// ================================

import { prefersReducedMotion } from "/utils/a11y.js";

const PRELOAD_RADIUS_DEFAULT = 1;
const DEFAULT_BASE_PATH = "/assets/gallery/";

function getPreloadRadius() {
  try {
    const connection =
      navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (
      connection &&
      typeof connection.effectiveType === "string" &&
      connection.effectiveType.includes("2g")
    ) {
      return 0;
    }
  } catch (error) {
    // ignore — fallback to default radius
  }
  return PRELOAD_RADIUS_DEFAULT;
}

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

function queryWithin(root, selector, fallback) {
  if (root && selector) {
    const found = root.querySelector(selector);
    if (found) return found;
  }
  if (selector) {
    try {
      const direct = document.querySelector(selector);
      if (direct) return direct;
    } catch (error) {
      // ignore selector syntax errors and continue
    }
  }
  if (fallback) {
    return document.getElementById(fallback);
  }
  return null;
}

export class GalleryPager {
  constructor({
    rootId,
    gridId = "gallery-grid",
    prevId = "gallery-prev",
    nextId = "gallery-next",
    gridSelector,
    prevSelector,
    nextSelector,
    images,
    files,
    basePath = DEFAULT_BASE_PATH,
    perPage = 8,
  } = {}) {
    this.root = rootId ? document.getElementById(rootId) : null;
    this.grid = queryWithin(this.root, gridSelector, gridId);
    this.prevButton = queryWithin(this.root, prevSelector, prevId);
    this.nextButton = queryWithin(this.root, nextSelector, nextId);
    this.images = resolveImages({ images, files, basePath });
    this.perPage = Math.max(1, perPage);
    this.page = 0;
    this.reduceMotion = prefersReducedMotion();
    this.preloadRadius = this.reduceMotion ? 0 : getPreloadRadius();
    this.destroyed = false;

    if (!this.grid || !this.prevButton || !this.nextButton || this.images.length === 0) {
      this.ready = false;
      return;
    }

    this.ready = true;
    this.grid.setAttribute("role", "list");
    this.grid.setAttribute("data-gallery-total", String(this.images.length));
    this.prevButton.setAttribute("data-gallery-control", "prev");
    this.nextButton.setAttribute("data-gallery-control", "next");

    this.handlePrev = this.prev.bind(this);
    this.handleNext = this.next.bind(this);

    this.prevButton.addEventListener("click", this.handlePrev);
    this.nextButton.addEventListener("click", this.handleNext);

    this.renderPage();
  }

  get totalPages() {
    return Math.ceil(this.images.length / this.perPage);
  }

  renderPage() {
    if (!this.ready || !this.grid) return;
    const start = this.page * this.perPage;
    const slice = this.images.slice(start, start + this.perPage);

    this.grid.innerHTML = "";

    slice.forEach((img, index) => {
      const item = document.createElement("div");
      item.className = "gallery-item";
      item.setAttribute("role", "listitem");

      const picture = document.createElement("img");
      picture.src = img.src;
      picture.alt = img.alt || "";
      picture.decoding = "async";
      picture.loading = this.page === 0 && index === 0 ? "eager" : "lazy";
      if (typeof img.width === "number") picture.width = img.width;
      if (typeof img.height === "number") picture.height = img.height;

      item.appendChild(picture);
      this.grid.appendChild(item);
    });

    this.grid.setAttribute("data-gallery-page", String(this.page + 1));
    this.updateControls();
    this.preloadNeighbors();
  }

  updateControls() {
    if (!this.ready) return;
    const total = this.totalPages;
    const atStart = this.page === 0;
    const atEnd = this.page >= total - 1;

    this.prevButton.disabled = atStart;
    this.prevButton.setAttribute("aria-disabled", atStart ? "true" : "false");
    this.nextButton.disabled = atEnd;
    this.nextButton.setAttribute("aria-disabled", atEnd ? "true" : "false");
  }

  next() {
    if (!this.ready || this.page >= this.totalPages - 1) return;
    this.page += 1;
    this.renderPage();
  }

  prev() {
    if (!this.ready || this.page === 0) return;
    this.page -= 1;
    this.renderPage();
  }

  goTo(page) {
    if (!this.ready) return;
    const target = Math.max(0, Math.min(this.totalPages - 1, page));
    if (target === this.page) return;
    this.page = target;
    this.renderPage();
  }

  preloadNeighbors() {
    if (!this.ready || this.preloadRadius <= 0) return;
    for (let offset = 1; offset <= this.preloadRadius; offset += 1) {
      this.preloadPage(this.page + offset);
      this.preloadPage(this.page - offset);
    }
  }

  preloadPage(pageIndex) {
    if (!this.ready) return;
    if (pageIndex < 0 || pageIndex >= this.totalPages) return;

    const start = pageIndex * this.perPage;
    const slice = this.images.slice(start, start + this.perPage);
    slice.forEach((img) => {
      if (!img || !img.src) return;
      const preloadImage = new Image();
      preloadImage.src = img.src;
    });
  }

  destroy() {
    if (!this.ready || this.destroyed) return;
    this.prevButton.removeEventListener("click", this.handlePrev);
    this.nextButton.removeEventListener("click", this.handleNext);
    this.destroyed = true;
  }
}

export function initGallery(options = {}) {
  return new GalleryPager(options);
}

export function initGalleryPager(options = {}) {
  return new GalleryPager(options);
}
