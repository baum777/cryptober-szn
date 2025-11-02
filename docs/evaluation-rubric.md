# Evaluation Rubric

## Scoring System (0–5)

Each feature is evaluated across 5 dimensions with weighted scores:

### 1. Functionality (35% weight)
**Does the feature work as specified?**

- **5**: Perfect implementation, handles all edge cases
- **4**: Works well with minor edge case issues
- **3**: Core functionality works, some scenarios fail
- **2**: Partially functional, major gaps
- **1**: Barely functional, critical issues
- **0**: Not implemented or completely broken

### 2. Resiliency (20% weight)
**How does it handle errors, offline states, and edge cases?**

- **5**: Graceful degradation, error recovery, offline support
- **4**: Good error handling, clear messages
- **3**: Basic error handling, some edge cases missed
- **2**: Poor error handling, crashes on edge cases
- **1**: Breaks easily, no error handling
- **0**: Fails catastrophically

### 3. UX/Accessibility (20% weight)
**Is it usable, accessible, and delightful?**

- **5**: WCAG AAA, excellent UX flow, keyboard/screen reader perfect
- **4**: WCAG AA compliant, good UX, minor a11y gaps
- **3**: Mostly accessible, UX is acceptable
- **2**: Major a11y violations, confusing UX
- **1**: Poor UX, inaccessible
- **0**: Completely unusable

### 4. Performance (15% weight)
**Does it load fast and run smoothly?**

- **5**: LCP < 1.5s, TTI < 2s, 60fps animations, optimized assets
- **4**: LCP < 2.5s, TTI < 3s, smooth animations
- **3**: LCP < 4s, acceptable performance
- **2**: Slow load, janky animations
- **1**: Very slow, poor performance
- **0**: Unusable due to performance

### 5. Code Quality / DX (10% weight)
**Is the code maintainable and well-tested?**

- **5**: Perfect code quality, full test coverage, documented
- **4**: Good structure, tests present, mostly documented
- **3**: Acceptable code, some tests, basic docs
- **2**: Poor structure, minimal tests
- **1**: Messy code, no tests
- **0**: Unmaintainable

---

## Composite Score Calculation

```
Total Score = (Functionality × 0.35) + 
              (Resiliency × 0.20) + 
              (UX/A11y × 0.20) + 
              (Performance × 0.15) + 
              (Code Quality × 0.10)
```

### Rating Bands

- **4.5 – 5.0**: 🟢 Excellent
- **4.0 – 4.4**: 🟢 Good
- **3.5 – 3.9**: 🟡 Acceptable
- **3.0 – 3.4**: 🟡 Needs Improvement
- **2.0 – 2.9**: 🔴 Poor
- **0.0 – 1.9**: 🔴 Critical Issues

---

## Quick-Win Criteria

Features scoring below **3.5** should include a **Quick-Wins** section with:

1. **High-impact, low-effort improvements** (1-2 hours)
2. **Medium improvements** (half-day)
3. **Technical debt items** (requires refactor)

---

## Automated Checks

### Lighthouse Thresholds (Required)

- **Performance**: ≥ 85
- **Accessibility**: ≥ 90
- **Best Practices**: ≥ 90
- **SEO**: ≥ 90

### Playwright Tests (Required)

- ✅ All routes render H1 + sections
- ✅ Keyboard navigation works
- ✅ Focus visible throughout
- ✅ ARIA attributes correct
- ✅ No uncaught exceptions
- ✅ Images have alt text
- ✅ Links have proper targets

### Performance Budgets

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **TTI** (Time to Interactive): < 3.5s

---

## Report Template

```markdown
# Feature Evaluation: [Feature Name]

**Route:** [route]  
**Feature ID:** [feat-XXX]  
**Date:** [YYYY-MM-DD]

## Scores

| Dimension      | Score | Weight | Weighted |
|----------------|-------|--------|----------|
| Functionality  | X/5   | 35%    | X.XX     |
| Resiliency     | X/5   | 20%    | X.XX     |
| UX/A11y        | X/5   | 20%    | X.XX     |
| Performance    | X/5   | 15%    | X.XX     |
| Code Quality   | X/5   | 10%    | X.XX     |
| **TOTAL**      |       |        | **X.XX** |

**Rating:** 🟢/🟡/🔴

## Observations

### ✅ Strengths
- [Point 1]
- [Point 2]

### ⚠️ Issues
- [Issue 1]
- [Issue 2]

### 🚀 Quick-Wins
1. [Action 1] — [effort estimate]
2. [Action 2] — [effort estimate]

## Test Results

- Playwright: ✅ X/X passing
- Lighthouse: Performance 85 | A11y 92 | BP 90 | SEO 95
- Manual checks: [notes]

---
```

## Example Evaluation

### Feature: Hero Section with CA Copy

**Route:** `/`  
**Feature ID:** feat-001

| Dimension      | Score | Weight | Weighted |
|----------------|-------|--------|----------|
| Functionality  | 5/5   | 35%    | 1.75     |
| Resiliency     | 4/5   | 20%    | 0.80     |
| UX/A11y        | 4/5   | 20%    | 0.80     |
| Performance    | 5/5   | 15%    | 0.75     |
| Code Quality   | 4/5   | 10%    | 0.40     |
| **TOTAL**      |       |        | **4.50** |

**Rating:** 🟢 Excellent

### ✅ Strengths
- Copy-to-clipboard works perfectly across browsers
- Toast notification clear and accessible
- Clean implementation with proper ARIA

### ⚠️ Issues
- No fallback for unsupported Clipboard API (very old browsers)
- Could add haptic feedback on mobile

### 🚀 Quick-Wins
1. Add feature detection + fallback (30 min)
2. Add vibration API for mobile feedback (15 min)
