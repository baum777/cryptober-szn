# QA Infrastructure Documentation

## Overview

This document describes the Quality Assurance (QA) infrastructure for the Cryptober project, including automated testing, evaluation rubrics, and reporting systems.

---

## Architecture

The QA system consists of four main components:

### 1. H1 Sitemap Generator
**Location:** `scripts/generate-h1-sitemap.js`

Automatically scans HTML files and extracts:
- Page titles (H1 elements)
- Section headings (H2 elements)
- Route mappings

**Outputs:**
- `docs/h1-sitemap.json` - Machine-readable sitemap
- `docs/h1-sitemap.md` - Human-readable documentation

**Usage:**
```bash
npm run generate:sitemap
```

### 2. Test Matrix
**Location:** `docs/test-matrix.json`

Feature catalog with:
- Feature IDs
- Route associations
- Test scenarios (Given/When/Then)
- Tools required
- Priority levels
- Implementation status

### 3. Evaluation Rubric
**Location:** `docs/evaluation-rubric.md`

Scoring system (0–5) across 5 dimensions:
- **Functionality** (35% weight) - Does it work?
- **Resiliency** (20% weight) - Error handling, edge cases
- **UX/Accessibility** (20% weight) - WCAG compliance, usability
- **Performance** (15% weight) - LCP, TTI, FPS
- **Code Quality** (10% weight) - Maintainability, tests, docs

**Composite Score Formula:**
```
Total = (Functionality × 0.35) + (Resiliency × 0.20) + 
        (UX/A11y × 0.20) + (Performance × 0.15) + 
        (Code Quality × 0.10)
```

**Rating Bands:**
- 4.5–5.0: 🟢 Excellent
- 4.0–4.4: 🟢 Good
- 3.5–3.9: 🟡 Acceptable
- 3.0–3.4: 🟡 Needs Improvement
- 2.0–2.9: 🔴 Poor
- 0.0–1.9: 🔴 Critical Issues

### 4. Evaluation Report Generator
**Location:** `scripts/generate-evaluation-report.js`

Generates comprehensive quality reports:
- Route-by-route evaluations
- Composite scores
- Strengths/issues/quick-wins
- Feature coverage matrix
- Prioritized recommendations

**Outputs:**
- `reports/quality-report.md` - Markdown report
- `reports/quality-report.json` - JSON data

**Usage:**
```bash
npm run generate:report
```

---

## Test Infrastructure

### Playwright E2E Tests
**Location:** `tests/e2e/routes.spec.js`  
**Config:** `playwright.config.js`

**Test Coverage:**
- ✅ H1 presence and correctness
- ✅ H2 section visibility
- ✅ Basic accessibility (landmarks, alt text)
- ✅ Keyboard navigation
- ✅ Responsive behavior (mobile/desktop)
- ✅ Cross-route navigation
- ✅ Footer presence

**Running Tests:**
```bash
# Run all E2E tests
npm run test:e2e

# Run with UI (interactive)
npm run test:e2e:ui

# View report
npm run test:e2e:report
```

**Test Modes:**
- Chromium (Desktop Chrome)
- Firefox (Desktop Firefox)
- WebKit (Desktop Safari)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

### Unit Tests (Vitest)
**Location:** `tests/*.test.js`

**Existing Coverage:**
- Motion utilities
- Component logic (QuestCard, RoadmapStepCard, etc.)
- Status glyphs
- Timeline sections

**Running Tests:**
```bash
# Run once
npm test

# Watch mode
npm run test:watch

# UI mode
npm run test:ui
```

---

## NPM Scripts Reference

### Quality Assurance
```bash
# Generate H1 sitemap from HTML files
npm run generate:sitemap

# Generate evaluation report with scores
npm run generate:report

# Full QA suite (sitemap + report + E2E tests)
npm run qa:full
```

### Testing
```bash
# Unit tests (Vitest)
npm test
npm run test:watch
npm run test:ui

# E2E tests (Playwright)
npm run test:e2e
npm run test:e2e:ui
npm run test:e2e:report
```

### Code Quality
```bash
# Lint JavaScript
npm run lint

# Type check (TypeScript/JSDoc)
npm run typecheck

# Sitemap audit
npm run audit:sitemap

# i18n scan
npm run i18n:scan
```

---

## CI/CD Integration

### Recommended Pipeline

```yaml
# Example GitHub Actions workflow
name: QA Suite

on: [push, pull_request]

jobs:
  qa:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npx playwright install --with-deps
      
      # Code quality
      - run: npm run lint
      - run: npm run typecheck
      
      # Generate docs
      - run: npm run generate:sitemap
      - run: npm run generate:report
      
      # Tests
      - run: npm test
      - run: npm run test:e2e
      
      # Upload artifacts
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: qa-reports
          path: |
            reports/
            docs/h1-sitemap.*
```

---

## Lighthouse Integration

### Performance Budgets

Target metrics for all routes:
- **Performance:** ≥ 85
- **Accessibility:** ≥ 90
- **Best Practices:** ≥ 90
- **SEO:** ≥ 90

### Core Web Vitals

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **TTI** (Time to Interactive): < 3.5s

### Running Lighthouse

```bash
# Install globally
npm install -g lighthouse

# Run against local server
npx serve -l 5173 . &
lighthouse http://localhost:5173 --output=json --output-path=./reports/lh-home.json
lighthouse http://localhost:5173/lore_index.html --output=json --output-path=./reports/lh-lore.json
```

---

## Current Status

### Routes Evaluated: 3

| Route | H1 | Score | Rating |
|-------|-----|-------|--------|
| `/` | Ride the Pump - $Cryptober | 4.35/5 | 🟢 Good |
| `/lore_index` | Lore (The Story) 🌙 | 4.55/5 | 🟢 Excellent |
| `/lore_mascot` | Sparkfiend – The Flame Keeper | 4.70/5 | 🟢 Excellent |

**Overall Score:** 4.53/5.0 🟢 *Excellent*

### Features Tested: 12

All features currently implemented and passing basic checks.

---

## Extending the System

### Adding New Routes

1. Add HTML file to workspace root
2. Update `HTML_FILES` array in `scripts/generate-h1-sitemap.js`
3. Run `npm run generate:sitemap`
4. Tests auto-generate from sitemap

### Adding New Features

1. Add entry to `docs/test-matrix.json`
2. Add evaluation scores to `scripts/generate-evaluation-report.js`
3. Write Playwright tests if needed
4. Run `npm run qa:full`

### Custom Evaluations

Edit `ROUTE_EVALUATIONS` object in `scripts/generate-evaluation-report.js`:

```javascript
const ROUTE_EVALUATIONS = {
  '/new-route': {
    functionality: 5,
    resiliency: 4,
    uxAccessibility: 4,
    performance: 4,
    codeQuality: 4,
    notes: {
      strengths: ['...'],
      issues: ['...'],
      quickWins: ['...']
    }
  }
};
```

---

## Best Practices

### For Developers

1. **Run QA before PR:** `npm run qa:full`
2. **Check Lighthouse scores** for affected routes
3. **Update sitemap** when adding new pages
4. **Write E2E tests** for interactive features
5. **Document quick-wins** in evaluation reports

### For Reviewers

1. Check `reports/quality-report.md` for regression
2. Verify Playwright tests pass in CI
3. Review quick-wins list for low-hanging fruit
4. Ensure composite scores don't drop below 3.5

### For QA Engineers

1. Keep test matrix up-to-date
2. Adjust rubric weights if needed
3. Add manual test scenarios for complex flows
4. Monitor real-user metrics vs. synthetic tests

---

## Troubleshooting

### Playwright Tests Failing

```bash
# Install browsers
npx playwright install --with-deps

# Debug mode
npx playwright test --debug

# Specific browser
npx playwright test --project=chromium
```

### Sitemap Generation Issues

- Ensure HTML files have valid structure
- Check for malformed H1/H2 tags
- Verify file paths in `HTML_FILES` array

### Report Generation Errors

- Ensure `docs/h1-sitemap.json` exists
- Run `npm run generate:sitemap` first
- Check `ROUTE_EVALUATIONS` has all routes

---

## Future Enhancements

### Planned Features

- [ ] Visual regression testing (Percy/Chromatic)
- [ ] Automated Lighthouse runs in CI
- [ ] A11y tree snapshots
- [ ] Performance budgets enforcement
- [ ] Automated quick-win prioritization
- [ ] Historical trend analysis

### Potential Integrations

- **Sentry** - Error tracking
- **Datadog RUM** - Real user monitoring
- **Hotjar** - Session recordings
- **Axe DevTools** - A11y auditing

---

## Contact

For questions about the QA infrastructure:
- Documentation: This file (`docs/QA-INFRASTRUCTURE.md`)
- Issues: Use GitHub Issues with `qa` label
- Slack: #cryptober-qa channel

---

*Last Updated: 2025-11-02*
