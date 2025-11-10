# Cryptober QA Suite — Quick Start

## TL;DR

```bash
# Install dependencies
npm install

# Generate sitemap + evaluation report + run E2E tests
npm run qa:full
```

---

## What's Included

### 📊 H1 Sitemap Generator
Extracts page titles and sections from HTML:
- **Input:** `index.html`, `lore_index.html`, `lore_mascot.html`
- **Output:** `docs/h1-sitemap.json` + `docs/h1-sitemap.md`

```bash
npm run generate:sitemap
```

### 📈 Evaluation Report Generator
Scores each route across 5 dimensions (0–5):
- Functionality (35%)
- Resiliency (20%)
- UX/Accessibility (20%)
- Performance (15%)
- Code Quality (10%)

**Current Overall Score:** 4.53/5.0 🟢 *Excellent*

```bash
npm run generate:report
```

### 🧪 Playwright E2E Tests
Automated browser tests for:
- H1/H2 presence
- Accessibility basics
- Keyboard navigation
- Responsive behavior
- Cross-route links

```bash
npm run test:e2e           # Run all tests
npm run test:e2e:ui        # Interactive mode
npm run test:e2e:report    # View HTML report
```

---

## Project Structure

```
/workspace/
├── docs/
│   ├── h1-sitemap.json          # Auto-generated sitemap
│   ├── h1-sitemap.md            # Human-readable sitemap
│   ├── test-matrix.json         # Feature catalog
│   ├── evaluation-rubric.md     # Scoring system
│   └── QA-INFRASTRUCTURE.md     # Full documentation
├── scripts/
│   ├── generate-h1-sitemap.js   # Sitemap generator
│   └── generate-evaluation-report.js  # Report generator
├── tests/
│   ├── e2e/
│   │   └── routes.spec.js       # Playwright E2E tests
│   └── *.test.js                # Vitest unit tests
├── reports/
│   ├── quality-report.md        # Latest evaluation report
│   ├── quality-report.json      # JSON data
│   └── e2e-html/                # Playwright test report
├── playwright.config.js         # Playwright configuration
└── package.json                 # NPM scripts
```

---

## Quick Commands

### Quality Assurance
```bash
npm run generate:sitemap   # Generate H1 sitemap
npm run generate:report    # Generate quality report
npm run qa:full            # Full suite (sitemap + report + E2E)
```

### Testing
```bash
npm test                   # Unit tests (Vitest)
npm run test:e2e           # E2E tests (Playwright)
npm run test:e2e:ui        # Playwright UI mode
```

### Code Quality
```bash
npm run lint               # ESLint
npm run typecheck          # TypeScript/JSDoc
```

---

## Current Scores (as of 2025-11-02)

| Route | Page | Score | Rating |
|-------|------|-------|--------|
| `/` | Ride the Pump - $Cryptober | 4.35/5 | 🟢 Good |
| `/lore_index` | Lore (The Story) 🌙 | 4.55/5 | 🟢 Excellent |
| `/lore_mascot` | Sparkfiend – The Flame Keeper | 4.70/5 | 🟢 Excellent |

**Overall:** 4.53/5.0 🟢 *Excellent*

---

## Top Quick-Wins

From latest evaluation report:

### High Priority (< 1 hour)
1. Add `font-display: swap` to reduce CLS (15min)
2. Add Clipboard API feature detection (20min)
3. Add "pause rotation" button for catch-phrase rotator (20min)

### Medium Priority (< 4 hours)
4. Implement intersection-based image loading (30min)
5. Replace placeholder images with production assets (30min)
6. Implement quest pagination controls (1hr)

---

## CI/CD Integration

Add to GitHub Actions:

```yaml
- run: npm ci
- run: npx playwright install --with-deps
- run: npm run qa:full
- uses: actions/upload-artifact@v3
  with:
    name: qa-reports
    path: reports/
```

---

## Documentation

- **Full QA Infrastructure Guide:** [docs/QA-INFRASTRUCTURE.md](docs/QA-INFRASTRUCTURE.md)
- **Evaluation Rubric:** [docs/evaluation-rubric.md](docs/evaluation-rubric.md)
- **Test Matrix:** [docs/test-matrix.json](docs/test-matrix.json)
- **Latest Report:** [reports/quality-report.md](reports/quality-report.md)

---

## Lighthouse Thresholds

Target metrics (all routes):
- Performance: ≥ 85
- Accessibility: ≥ 90
- Best Practices: ≥ 90
- SEO: ≥ 90

**Core Web Vitals:**
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1

---

## Questions?

See [docs/QA-INFRASTRUCTURE.md](docs/QA-INFRASTRUCTURE.md) for complete documentation.
