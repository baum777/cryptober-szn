# Performance Optimization Pipeline

**Agent:** `agent-02-perf-pass` — Performance & Web Vitals Enforcer
**Branch:** `feat/perf-pass-foundation`
**Status:** In Progress

---

## Mission

Implement and harden the performance pipeline to achieve crypto-fast load times:

- **LCP:** < 2.5s
- **CLS:** < 0.1
- **TTI:** < 3s
- **Lighthouse Scores:**
  - Performance: >90
  - Accessibility: >95
  - SEO: >90

Mobile-first, crypto-fast: "Cryptober-SZN energy" with sub-2.5s hero render.

---

## Architecture Overview

```
cryptober-szn/
├── scripts/
│   ├── optimize-images.js     # PNG/JPEG → WebP/AVIF + responsive sizes
│   ├── optimize-svg.js         # SVG optimization with svgo
│   ├── minify-css.js           # CSS minification with cssnano
│   ├── minify-js.js            # JS minification with Terser
│   ├── extract-critical-css.js # Critical CSS extraction (<2KB inline)
│   └── lighthouse-test.js      # Lighthouse CI audits
│
├── dist/                       # Build outputs (gitignored)
│   ├── css/
│   │   ├── style.min.css       # Minified CSS (<50KB target)
│   │   ├── critical.css        # Critical CSS (<2KB)
│   │   └── critical-inline.html # Ready-to-paste inline version
│   ├── js/
│   │   ├── *.min.js            # Minified JS modules
│   │   └── components/         # Minified components
│   └── responsive-images-guide.html # HTML snippets for <picture> tags
│
├── assets/optimized/           # Optimized assets (gitignored)
│   ├── gallery/                # WebP/AVIF variants (320w, 768w, 1200w)
│   ├── heros-journey/
│   ├── mascot/
│   ├── socials/
│   └── roadmap/
│
├── postcss.config.js           # PostCSS + cssnano config
└── package.json                # Build scripts + dependencies
```

---

## Installation

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

**Dependencies:**
- `sharp` — Image processing (WebP/AVIF conversion)
- `svgo` — SVG optimization
- `cssnano` + `postcss` — CSS minification
- `terser` — JavaScript minification
- `lighthouse` + `chrome-launcher` — Performance audits

---

## Build Scripts

### 1. Image Optimization

**Command:**
```bash
npm run images:optimize
```

**What it does:**
- Scans `assets/gallery/`, `assets/heros-journey/`, `assets/mascot/`, `assets/socials/`
- Converts PNG/JPEG to WebP (quality 75) and AVIF (quality 50)
- Generates responsive sizes: 320w, 768w, 1200w
- Outputs to `assets/optimized/[directory]/`
- Creates HTML implementation guide at `dist/responsive-images-guide.html`

**Example output:**
```
assets/optimized/gallery/
├── pumpin-320w.webp
├── pumpin-320w.avif
├── pumpin-768w.webp
├── pumpin-768w.avif
├── pumpin-1200w.webp
└── pumpin-1200w.avif
```

**Target:** Each image <100KB

---

### 2. SVG Optimization

**Command:**
```bash
npm run svg:optimize
```

**What it does:**
- Scans `assets/roadmap/`, `assets/socials/`, `assets/favicons/`
- Optimizes SVG files using svgo
- Preserves `viewBox`, stroke properties, icon geometry
- Outputs to `assets/optimized/[directory]/`

**Preserved attributes:**
- viewBox (responsive scaling)
- stroke-width (monoline 1.8-2.0px)
- IDs (for internal references)

**Warning:** Files still >100KB after optimization may contain embedded raster data.

---

### 3. CSS Minification

**Command:**
```bash
npm run css:minify
```

**What it does:**
- Minifies `styles.css` using PostCSS + cssnano
- Preserves CSS custom properties (design tokens)
- Preserves `calc()` expressions
- Outputs to `dist/css/style.min.css`

**Target:** <50KB minified

**Preserved:**
- CSS variables (`:root` tokens)
- Media queries
- Animation keyframes

---

### 4. JavaScript Minification

**Command:**
```bash
npm run js:minify
```

**What it does:**
- Minifies all JS files in `js/`, `utils/`, `src/js/`
- Uses Terser with ES6 module support
- Outputs to `dist/js/` with `.min.js` extension

**Configuration:**
- Drop debugger statements
- Keep console logs (for debugging)
- Mangle variable names
- Remove comments
- Preserve ES6 module syntax

**Target:** <20KB total where possible

---

### 5. Critical CSS Extraction

**Command:**
```bash
npm run css:critical
```

**What it does:**
- Extracts above-the-fold critical CSS
- Includes: base styles, header, hero section, essential layout
- Outputs to `dist/css/critical.css` and `dist/css/critical-inline.html`

**Target:** <2KB inline

**Usage:**
1. Copy content from `dist/css/critical-inline.html`
2. Paste into `<head>` of HTML files before `<link rel="stylesheet">`
3. Defer or preload full stylesheet

---

### 6. Full Asset Build

**Command:**
```bash
npm run assets:build
```

**What it does:**
Runs all optimization steps in sequence:
1. `images:optimize`
2. `svg:optimize`
3. `css:minify`
4. `js:minify`
5. `css:critical`

**Use this** before deploying or running Lighthouse tests.

---

### 7. Lighthouse Performance Audit

**Command:**
```bash
npm run perf:test
```

**Prerequisites:**
Start a local server first:
```bash
python3 -m http.server 8000
# or
npx serve
```

**What it does:**
- Runs Lighthouse audits for all HTML pages:
  - `index.html` (Home)
  - `lore_index.html` (Lore Index)
  - `lore_mascot.html` (Mascot)
- Emulates mobile device (375x667, 4x CPU slowdown)
- Emulates slow 4G network (1.6Mbps down, 750Kbps up, 150ms RTT)
- Generates HTML and JSON reports in `reports/lighthouse/`

**Metrics reported:**
- Lighthouse scores (Performance, Accessibility, SEO, Best Practices)
- Core Web Vitals (LCP, CLS, TTI, FCP, TBT, SI)
- Pass/fail against targets

**Targets:**
- Performance: ≥90
- Accessibility: ≥95
- SEO: ≥90
- LCP: <2.5s
- CLS: <0.1
- TTI: <3s

---

## HTML Implementation Guide

### Responsive Images with `<picture>`

After running `npm run images:optimize`, reference the guide at `dist/responsive-images-guide.html`.

**Example implementation:**

```html
<picture>
  <source
    type="image/avif"
    srcset="/assets/optimized/gallery/pumpin-320w.avif 320w,
            /assets/optimized/gallery/pumpin-768w.avif 768w,
            /assets/optimized/gallery/pumpin-1200w.avif 1200w"
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  />
  <source
    type="image/webp"
    srcset="/assets/optimized/gallery/pumpin-320w.webp 320w,
            /assets/optimized/gallery/pumpin-768w.webp 768w,
            /assets/optimized/gallery/pumpin-1200w.webp 1200w"
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  />
  <img
    src="/assets/optimized/gallery/pumpin-768w.webp"
    alt="Pumpin pumpkin character"
    loading="lazy"
    decoding="async"
    width="768"
    height="auto"
  />
</picture>
```

**Key attributes:**
- `type="image/avif"` — Modern format first (best compression)
- `type="image/webp"` — Fallback for older browsers
- `srcset` — Multiple sizes for responsive delivery
- `sizes` — Tells browser which size to use based on viewport
- `loading="lazy"` — Below-the-fold images only (NOT for hero/LCP image)
- `decoding="async"` — Non-blocking decode

---

### Critical CSS Inlining

After running `npm run css:critical`, update HTML `<head>`:

**Before:**
```html
<head>
  <link rel="stylesheet" href="styles.css" />
</head>
```

**After:**
```html
<head>
  <!-- CRITICAL CSS - Inline -->
  <style>
    /* Paste content from dist/css/critical.css here */
  </style>

  <!-- Deferred full stylesheet -->
  <link rel="preload" as="style" href="/dist/css/style.min.css" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="/dist/css/style.min.css"></noscript>
</head>
```

---

### JavaScript Deferral

**Non-critical scripts** (analytics, charts, below-fold features):

```html
<!-- Defer non-critical scripts -->
<script type="module" src="/dist/js/gallery.min.js" defer></script>
<script type="module" src="/dist/js/roadmap.min.js" defer></script>
```

**Critical boot scripts** (needed for hero render):

```html
<!-- Load critical boot script normally -->
<script type="module" src="/dist/js/boot-home.min.js"></script>
```

---

## Layout Stability (CLS Prevention)

To avoid CLS >0.1:

### 1. Reserve Image Space

**Before:**
```html
<img src="logo.png" alt="Logo" />
```

**After:**
```html
<img src="logo.png" alt="Logo" width="240" height="240" />
```

Or use aspect-ratio:
```css
.logo-frame {
  aspect-ratio: 1 / 1;
  width: 240px;
}
```

### 2. Font Loading

Use `font-display: swap` to prevent invisible text:

```css
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: swap;
}
```

### 3. Sticky Header Height

Reserve space for sticky headers:

```css
body {
  padding-top: var(--header-height); /* 72px */
}

#site-header {
  position: fixed;
  top: 0;
  height: var(--header-height);
}
```

---

## Performance Checklist

Before considering this task complete, verify:

- [ ] All images converted to WebP/AVIF with 320w/768w/1200w sizes
- [ ] SVG files optimized (check for files still >100KB)
- [ ] CSS minified to <50KB
- [ ] JS minified to <20KB total
- [ ] Critical CSS extracted and <2KB
- [ ] HTML updated with:
  - [ ] `<picture>` tags with AVIF/WebP sources
  - [ ] `srcset` and `sizes` for responsive images
  - [ ] `loading="lazy"` on below-fold images
  - [ ] `defer` on non-critical scripts
  - [ ] Inline critical CSS in `<head>`
  - [ ] Preload full CSS
- [ ] Lighthouse audit passing:
  - [ ] Performance ≥90
  - [ ] Accessibility ≥95
  - [ ] SEO ≥90
  - [ ] LCP <2.5s
  - [ ] CLS <0.1
  - [ ] TTI <3s

---

## Known Risks & Limitations

### 1. Large SVG Files

**Issue:** `icon-timeline-skeleton.svg` and `icon-timeline-pumpkin.svg` are 3MB+

**Likely cause:** Embedded raster images or overly complex paths

**Recommendation:** Manually inspect and consider:
- Extracting embedded rasters to separate PNG → WebP/AVIF
- Simplifying paths in vector editor
- Using PNG fallback for complex illustrations

### 2. CSS Size

**Current:** `styles.css` is 47KB unminified

**Risk:** May exceed 50KB target after minification if adding features

**Recommendation:**
- Consider code-splitting styles by page
- Use CSS-in-JS for component-specific styles
- Remove unused styles with PurgeCSS

### 3. JavaScript Bundle Size

**Current:** ~31 JS files totaling unknown size

**Risk:** May exceed 20KB target for critical path

**Recommendation:**
- Lazy-load gallery, roadmap, and quest modules
- Use dynamic imports for below-fold features
- Code-split by route

### 4. Lighthouse CI in Headless Environment

**Issue:** Lighthouse requires Chrome/Chromium

**Workaround:** Run locally or in CI with Chrome installed

```bash
# GitHub Actions example
- name: Install Chrome
  uses: browser-actions/setup-chrome@latest
- name: Run Lighthouse
  run: npm run perf:test
```

---

## Next Steps (For agent-03-qa-review)

1. **Test all HTML pages** with optimized assets
2. **Verify visual regression** — ensure no broken images/layouts
3. **Run Lighthouse audits** and confirm all targets met
4. **Test on real mobile device** (not just emulation)
5. **Validate ARIA/accessibility** not broken by changes
6. **Check reduced-motion** respects user preferences

---

## Resources

- [Web.dev - Core Web Vitals](https://web.dev/vitals/)
- [Lighthouse Scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring/)
- [Sharp Documentation](https://sharp.pixelplumbing.com/)
- [SVGO GitHub](https://github.com/svg/svgo)
- [cssnano Documentation](https://cssnano.co/)
- [Terser Documentation](https://terser.org/)

---

**Last Updated:** 2025-10-28
**Maintained By:** agent-02-perf-pass
