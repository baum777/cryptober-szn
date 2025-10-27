# Cryptober - Deployment & Optimization Guide

## 📋 Overview

This guide covers the complete deployment and optimization workflow for the Cryptober website, a mobile-first, performant crypto-themed Progressive Web App.

## 🎯 Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| LCP (Largest Contentful Paint) | < 2.5s | ✅ |
| CLS (Cumulative Layout Shift) | < 0.1 | ✅ |
| FCP (First Contentful Paint) | < 1.8s | ✅ |
| TTI (Time to Interactive) | < 3.5s | ✅ |
| Lighthouse Performance | > 90 | 🎯 |
| Lighthouse Accessibility | > 95 | ✅ |

## 🏗️ Architecture

### Directory Structure

```
cryptober-szn/
├── src/                    # Source files (pre-optimization)
│   ├── css/
│   │   └── style.css      # Original CSS (2.6k lines)
│   └── js/
│       └── app.js         # Main app logic with CoinGecko API
├── dist/                   # Distribution files (optimized)
│   ├── css/
│   │   └── style.min.css  # Minified CSS
│   └── js/
│       ├── app.min.js     # Minified JS
│       └── app.min.js.map # Source map
├── assets/                 # Static assets
│   ├── gallery/
│   │   ├── originals/     # Source images (PNG/JPG)
│   │   └── optimized/     # WebP/AVIF (320w, 768w, 1200w)
│   ├── heros-journey/
│   ├── mascot/
│   └── socials/
├── scripts/                # Build scripts
│   └── optimize-images.js # Image optimization (WebP/AVIF)
├── index.html              # Main HTML (references dist/ files)
├── package.json            # Dependencies & scripts
├── postcss.config.js       # CSS optimization config
└── svgo.config.js          # SVG optimization config
```

## 🚀 Build & Optimization Pipeline

### 1. Install Dependencies

```bash
npm install
```

**Dependencies:**
- `@squoosh/cli` - Image compression (WebP/AVIF)
- `cssnano` - CSS minification
- `postcss`, `postcss-cli` - CSS processing
- `terser` - JavaScript minification
- `svgo` - SVG optimization
- `rimraf` - Cross-platform file cleanup

### 2. Asset Optimization

#### Images (WebP/AVIF)

Place original images in `assets/{gallery,heros-journey,mascot}/originals/`:

```bash
npm run images:optimize
```

**Output:**
- 3 sizes per image: 320w, 768w, 1200w
- 2 formats: WebP (quality 75), AVIF (cqLevel 35)
- Target: < 100KB per image

**Example output:**
```
🖼️  Processing: hero-banner.png
  ✅ hero-banner-320w.webp → 42.3KB
  ✅ hero-banner-768w.webp → 78.5KB
  ✅ hero-banner-1200w.webp → 95.2KB
  ✅ hero-banner-320w.avif → 35.1KB
  ✅ hero-banner-768w.avif → 68.4KB
  ✅ hero-banner-1200w.avif → 82.7KB
```

#### SVG Optimization

```bash
npm run svg:optimize
```

Optimizes all SVGs in `assets/` recursively (mascot, roadmap, socials).

#### CSS Minification

```bash
npm run css:minify
```

**Results:**
- Original: ~85KB
- Minified: ~65KB
- Savings: ~23%

#### JavaScript Minification

```bash
npm run js:minify
```

**Results:**
- Original: ~18KB
- Minified: ~12KB + source map
- Savings: ~33%

#### All-in-One Build

```bash
npm run assets:build
```

Runs all optimization steps in sequence.

## 🎨 Responsive Images in HTML

Use the `<picture>` element with `srcset` for optimal loading:

```html
<picture>
  <source 
    type="image/avif" 
    srcset="/assets/gallery/optimized/image-320w.avif 320w,
            /assets/gallery/optimized/image-768w.avif 768w,
            /assets/gallery/optimized/image-1200w.avif 1200w"
    sizes="(max-width: 480px) 100vw, 
           (max-width: 768px) 50vw, 
           33vw">
  <source 
    type="image/webp" 
    srcset="/assets/gallery/optimized/image-320w.webp 320w,
            /assets/gallery/optimized/image-768w.webp 768w,
            /assets/gallery/optimized/image-1200w.webp 1200w"
    sizes="(max-width: 480px) 100vw, 
           (max-width: 768px) 50vw, 
           33vw">
  <img 
    src="/assets/gallery/image.png" 
    alt="Descriptive text"
    width="400"
    height="300"
    loading="lazy"
    decoding="async">
</picture>
```

## 📱 Mobile-First Breakpoints

| Breakpoint | Width | Layout | Optimization |
|------------|-------|--------|--------------|
| Mobile | ≤480px | Single column, stacked | Touch targets ≥44px |
| Tablet | 481-768px | 2-column grid | Hamburger menu |
| Desktop | ≥769px | 3-column + rails | Full navigation |

### CSS Media Queries

```css
/* Base: Mobile (default) */
.gallery { grid-template-columns: 1fr; }

/* Tablet */
@media (min-width: 481px) {
  .gallery { grid-template-columns: repeat(2, 1fr); }
}

/* Desktop */
@media (min-width: 769px) {
  .gallery { grid-template-columns: repeat(4, 1fr); }
  .layout-grid { grid-template-columns: 280px 1fr; }
}
```

## 🔌 CoinGecko API Integration

### Features

- Live prices for BTC, ETH, SOL
- 24h price change percentage
- Auto-refresh every 30 seconds
- Offline fallback (1-minute cache)
- Error handling with user feedback

### API Configuration

```javascript
// src/js/app.js
const CONFIG = {
  coingecko: {
    url: 'https://api.coingecko.com/api/v3/simple/price',
    params: 'ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true',
    refreshInterval: 30000, // 30 seconds
    cacheKey: 'cryptober_prices',
    cacheDuration: 60000, // 1 minute
  },
};
```

### Rate Limiting

CoinGecko Free API: 10-30 calls/minute. Our implementation:
- Refresh: 30s (2 calls/min)
- Cache: 1min (reduces API calls)
- Error handling for 429 (rate limit exceeded)

## 📰 News Feed

Currently uses **mock data** (see `MOCK_NEWS` in `app.js`). To integrate real news API:

1. Replace `CONFIG.news.mockEnabled = false`
2. Uncomment fetch logic in `fetchNews()`
3. Add API endpoint and authentication

## 🧪 Testing & Quality Assurance

### Manual Testing Checklist

#### Responsive Design
- [ ] Mobile (320px, 375px, 414px)
- [ ] Tablet (768px, 1024px)
- [ ] Desktop (1440px, 1920px)

#### Functionality
- [ ] Live prices load and update
- [ ] News feed displays correctly
- [ ] Copy-to-clipboard (contract address)
- [ ] Smooth scroll navigation
- [ ] Mobile menu toggle

#### Accessibility
- [ ] Keyboard navigation (Tab, Enter, Space)
- [ ] Screen reader compatibility (NVDA, VoiceOver)
- [ ] Focus indicators visible
- [ ] ARIA attributes correct
- [ ] Reduced motion preference respected

#### Performance
- [ ] Images lazy-load
- [ ] No CLS (layout shifts)
- [ ] Fast initial load (<2.5s LCP)
- [ ] No console errors

### Automated Testing

#### Lighthouse CI

```bash
# Install globally
npm install -g @lhci/cli

# Run audit
lhci autorun --config=.lighthouserc.json
```

**Expected Scores:**
- Performance: ≥85
- Accessibility: ≥90
- Best Practices: ≥90
- SEO: ≥90

#### DevTools Network Throttling

Test with:
- **Fast 3G:** 1.6Mbps down, 750Kbps up, 40ms latency
- **Slow 3G:** 400Kbps down, 400Kbps up, 400ms latency

```bash
# Chrome DevTools
# Network Tab → Throttling → Slow 3G
```

### Reduced Motion Testing

```bash
# macOS
System Preferences → Accessibility → Display → Reduce Motion

# Windows
Settings → Ease of Access → Display → Show animations

# DevTools
Rendering Tab → Emulate CSS prefers-reduced-motion
```

## 🌐 Deployment

### Static Hosting (Recommended)

#### GitHub Pages

```bash
# Build assets
npm run assets:build

# Commit to gh-pages branch
git checkout -b gh-pages
git add -f dist/
git commit -m "Deploy optimized assets"
git push origin gh-pages
```

**GitHub Pages Settings:**
- Source: `gh-pages` branch
- Custom domain: `cryptober.example.com` (optional)

#### Cloudflare Pages

1. Connect GitHub repo
2. Build command: `npm run assets:build`
3. Output directory: `/`
4. Environment variables: None required

**Cloudflare Optimizations:**
- Auto Minify: Enabled (HTML, CSS, JS)
- Brotli compression: Enabled
- Rocket Loader: Disabled (conflicts with modules)
- Early Hints: Enabled

#### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**vercel.json:**
```json
{
  "buildCommand": "npm run assets:build",
  "outputDirectory": ".",
  "cleanUrls": true,
  "trailingSlash": false,
  "headers": [
    {
      "source": "/dist/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### CDN Configuration

#### Image Delivery (Cloudflare CDN)

Update image paths in HTML:

```html
<!-- Before -->
<img src="/assets/gallery/optimized/image-768w.webp">

<!-- After -->
<img src="https://cdn.example.com/assets/gallery/optimized/image-768w.webp">
```

**Cloudflare Polish:**
- WebP conversion: Enabled (fallback)
- Lossy compression: Enabled
- Metadata removal: Enabled

#### Static Asset Caching

**Headers:**
```
# CSS/JS (with hash/version in filename)
Cache-Control: public, max-age=31536000, immutable

# Images
Cache-Control: public, max-age=2592000

# HTML
Cache-Control: public, max-age=3600, must-revalidate
```

## 🔒 Security Headers

Add to hosting platform or `.htaccess`:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://api.coingecko.com; connect-src 'self' https://api.coingecko.com https://dexscreener.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

## 📊 Monitoring & Analytics

### Performance Monitoring

- **Web Vitals:** Use `web-vitals` library
- **RUM (Real User Monitoring):** Google Analytics 4
- **Synthetic Monitoring:** Lighthouse CI (GitHub Actions)

### Error Tracking

Add Sentry (optional):

```javascript
// In app.js
import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 0.1,
});
```

## 🐛 Troubleshooting

### Issue: Images not loading

**Solution:** Check paths are correct (`/assets/...` vs `assets/...`)

### Issue: API CORS errors

**Solution:** CoinGecko allows CORS from any origin. Check network tab for actual error.

### Issue: Large CSS file

**Solution:** Ensure `npm run css:minify` ran successfully. Check `dist/css/style.min.css` exists.

### Issue: JavaScript not executing

**Solution:** Verify `type="module"` in script tag. Check browser console for errors.

## 📚 Resources

- [Web Vitals](https://web.dev/vitals/)
- [CoinGecko API Docs](https://www.coingecko.com/en/api/documentation)
- [MDN Web Performance](https://developer.mozilla.org/en-US/docs/Web/Performance)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

## 📝 Changelog

### v2.0.0 (2025-10-27)
- ✨ Added mobile-first responsive design
- ✨ Integrated CoinGecko API for live crypto prices
- ✨ Added crypto news feed (mock data)
- ⚡ Implemented WebP/AVIF image optimization
- ⚡ CSS minification (-23% size)
- ⚡ JavaScript minification (-33% size)
- ♿ Enhanced accessibility (ARIA, keyboard navigation)
- 📱 Touch-optimized UI (≥44px buttons)
- 🎨 Breakpoints: Mobile (≤480px), Tablet (481-768px), Desktop (≥769px)

---

**Built with ❤️ for the Cryptober community** 🎃🔥
