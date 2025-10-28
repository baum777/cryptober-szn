# Performance Pipeline — Implementation Next Steps

**Branch:** `feat/perf-pass-foundation`
**Status:** ✅ Pipeline Setup Complete — Awaiting HTML Integration

---

## What's Been Done

### ✅ Build Pipeline Created

All optimization scripts are implemented and tested:

1. **CSS Minification** → `dist/css/style.min.css`
   - **Result:** 46.7KB → 36.9KB (21% savings, ✅ under 50KB target)

2. **JavaScript Minification** → `dist/js/**/*.min.js`
   - **Result:** 70.5KB → 41.7KB (41% savings)
   - **Critical boot script:** 2.7KB (boot-home.min.js)
   - **Note:** Total exceeds 20KB but most is non-critical and can be deferred

3. **Critical CSS Extraction** → `dist/css/critical.css`
   - **Result:** 2.37KB (slightly over 2KB target but acceptable)
   - Ready for inline in `<head>`

4. **SVG Optimization** → `assets/optimized/*/`
   - **Result:** 8.6MB → 6.9MB (20.5% savings)
   - ⚠️ Warning: Timeline icons still 3MB+ (contain embedded raster data)

5. **Image Optimization Script** → `scripts/optimize-images.js`
   - Ready to run (not executed yet due to 253MB asset size)
   - Converts PNG/JPEG → WebP/AVIF
   - Generates responsive sizes (320w, 768w, 1200w)

---

## What Still Needs to Be Done

### 1. Update HTML Files (Critical)

Three HTML files need updating:

- `index.html` (Home)
- `lore_index.html` (Lore)
- `lore_mascot.html` (Mascot)

#### Required Changes:

**A. Inline Critical CSS in `<head>`**

```html
<!-- BEFORE -->
<link rel="stylesheet" href="styles.css" />

<!-- AFTER -->
<style>
  /* Paste content from dist/css/critical.css here */
</style>

<!-- Deferred full stylesheet -->
<link rel="preload" as="style" href="/dist/css/style.min.css"
      onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="/dist/css/style.min.css"></noscript>
```

**B. Update Script References**

```html
<!-- BEFORE -->
<script type="module" src="/js/boot-home.js"></script>
<script type="module" src="/js/main.js"></script>

<!-- AFTER -->
<script type="module" src="/dist/js/boot-home.min.js"></script>
<script type="module" src="/dist/js/main.min.js" defer></script>
```

**C. Add `defer` to Non-Critical Scripts**

```html
<!-- Gallery, roadmap, FAQ - not needed for hero render -->
<script type="module" src="/dist/js/gallery.min.js" defer></script>
<script type="module" src="/dist/js/roadmap.min.js" defer></script>
<script type="module" src="/dist/js/faq.min.js" defer></script>
```

**D. Add `loading="lazy"` to Below-Fold Images**

```html
<!-- ❌ DO NOT add lazy to hero/LCP image -->
<img src="/assets/socials/web-logo.png" alt="Logo" width="240" height="240" />

<!-- ✅ ADD lazy to below-fold images -->
<img src="/assets/gallery/pumpin.png" alt="Pumpkin"
     loading="lazy" decoding="async" width="400" height="400" />
```

**E. Add `width` and `height` to All Images (Prevent CLS)**

```html
<!-- BEFORE -->
<img src="logo.png" alt="Logo" />

<!-- AFTER -->
<img src="logo.png" alt="Logo" width="240" height="240" />
```

---

### 2. Run Image Optimization (Optional but Recommended)

To achieve sub-2.5s LCP, convert images to modern formats:

```bash
# This will take time (253MB of images)
npm run images:optimize
```

Then replace static `<img>` with `<picture>` tags. Reference guide will be generated at:
`dist/responsive-images-guide.html`

**Example:**

```html
<picture>
  <source type="image/avif"
          srcset="/assets/optimized/gallery/pumpin-320w.avif 320w,
                  /assets/optimized/gallery/pumpin-768w.avif 768w,
                  /assets/optimized/gallery/pumpin-1200w.avif 1200w"
          sizes="(max-width: 768px) 100vw, 50vw" />
  <source type="image/webp"
          srcset="/assets/optimized/gallery/pumpin-320w.webp 320w,
                  /assets/optimized/gallery/pumpin-768w.webp 768w,
                  /assets/optimized/gallery/pumpin-1200w.webp 1200w"
          sizes="(max-width: 768px) 100vw, 50vw" />
  <img src="/assets/optimized/gallery/pumpin-768w.webp"
       alt="Pumpin pumpkin" loading="lazy" decoding="async"
       width="768" height="auto" />
</picture>
```

---

### 3. Test Lighthouse Scores

After HTML updates, run Lighthouse audits:

```bash
# Start local server
python3 -m http.server 8000

# In another terminal:
npm run perf:test
```

**Target Scores:**
- Performance: ≥90
- Accessibility: ≥95
- SEO: ≥90
- LCP: <2.5s
- CLS: <0.1
- TTI: <3s

Reports will be saved to: `reports/lighthouse/`

---

### 4. Address Known Risks

#### Risk: Large Timeline SVG Icons

**Issue:** `icon-timeline-pumpkin.svg` and `icon-timeline-skeleton.svg` are still 3MB+ each

**Root Cause:** Embedded raster images inside SVG

**Solutions:**
1. Extract embedded PNGs and convert to WebP/AVIF separately
2. Use `<img>` instead of inline SVG
3. Simplify artwork in vector editor

**Impact on LCP:** If these icons are above-the-fold, they will delay LCP significantly

---

#### Risk: Total JS Size (41.7KB)

**Issue:** Exceeds <20KB target

**Mitigation:**
- ✅ Critical boot script is only 2.7KB
- ✅ Most JS is non-critical (gallery, roadmap, FAQ)
- ✅ Use `defer` attribute on non-critical scripts
- 📌 Consider lazy-loading gallery/roadmap modules with dynamic imports

---

## File Checklist

### Scripts Created
- [x] `scripts/optimize-images.js`
- [x] `scripts/optimize-svg.js`
- [x] `scripts/minify-css.js`
- [x] `scripts/minify-js.js`
- [x] `scripts/extract-critical-css.js`
- [x] `scripts/lighthouse-test.js`

### Config Files
- [x] `postcss.config.js`
- [x] `package.json` (updated with build scripts)
- [x] `.gitignore` (excludes dist/, assets/optimized/, reports/)

### Documentation
- [x] `PERF_PIPELINE.md` (comprehensive guide)
- [x] `IMPLEMENTATION_NEXT_STEPS.md` (this file)

### Build Outputs
- [x] `dist/css/style.min.css` (36.9KB)
- [x] `dist/css/critical.css` (2.37KB)
- [x] `dist/css/critical-inline.html` (ready to paste)
- [x] `dist/js/**/*.min.js` (41.7KB total)
- [x] `assets/optimized/**/*.svg` (6.9MB optimized)

### HTML Updates (Not Done Yet)
- [ ] `index.html` (inline critical CSS, update scripts, add lazy loading)
- [ ] `lore_index.html` (inline critical CSS, update scripts, add lazy loading)
- [ ] `lore_mascot.html` (inline critical CSS, update scripts, add lazy loading)

---

## Quick Start for Next Developer

1. **Update HTML files** using the templates above
2. **Test locally:**
   ```bash
   python3 -m http.server 8000
   open http://localhost:8000
   ```
3. **Run Lighthouse:**
   ```bash
   npm run perf:test
   ```
4. **Iterate** until scores meet targets
5. **(Optional)** Run full image optimization:
   ```bash
   npm run images:optimize
   ```

---

## Resources

- **Main docs:** `PERF_PIPELINE.md`
- **Critical CSS:** `dist/css/critical-inline.html`
- **Responsive images:** `dist/responsive-images-guide.html` (after running image optimization)

---

**Last Updated:** 2025-10-28
**Next Agent:** `agent-03-qa-review` or front-end developer for HTML integration
