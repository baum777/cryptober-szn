# UI Specification — Roadmap/QuestMap Foundation

**Version:** 1.0.0
**Date:** 2025-10-28
**Status:** Foundation Complete

---

## Overview

This document defines the architectural contracts, component specifications, and design tokens for the Sparkfined Roadmap/QuestMap UI foundation.

**Core Principle:** Timeline (scanning) and QuestMap (reading) are **separate by design** and must never be merged.

---

## Architectural Contracts (IMMUTABLE)

### 1. Section Separation

| Section | Purpose | Content | Layout |
|---------|---------|---------|--------|
| **Timeline** | Fast visual scan of milestones | H3 title + StatusGlyph ONLY | Alternating cards around vertical neon spine |
| **QuestMap** | Deep reading of quest details | H3 + full body + optional meta | Single centered column, max-width constrained |

**NEVER merge these sections.** They serve different user needs and must remain architecturally distinct.

### 2. Component Hierarchy

```
Timeline Section
├── TimelineSection (orchestrator)
│   ├── RoadmapStepCard × N
│   │   ├── H3 (title)
│   │   └── StatusGlyph
│   └── Vertical Spine (decorative)

QuestMap Section
├── QuestMapSection (orchestrator)
│   └── QuestCard × N
│       ├── Header
│       │   ├── H3 (title)
│       │   ├── StatusGlyph
│       │   └── Progress Ribbon (optional)
│       ├── Body (descriptive text)
│       └── Footer (meta, optional)
```

---

## Component Specifications

### StatusGlyph

**Purpose:** Visual status indicator for milestones/quests

**API:**
```javascript
createStatusGlyph(status: 'now' | 'next' | 'done' | 'later'): HTMLElement
```

**Rules:**
- 12px circle + 14-18px halo (via CSS `::before`)
- Pulse animation ONLY for `status === "now"`
- Pulse MUST be disabled if `prefers-reduced-motion: reduce`
- Color mapping:
  - `now` → neon-green (#00FF66), animated pulse
  - `next` → neon-green (#00FF66), static
  - `done` → teal (#60ffa6), static
  - `later` → violet (#a78bfa), low opacity, static

**Accessibility:**
- `role="img"`
- `aria-label="Status: {status}"`

**CSS Classes:**
- `.status-glyph` (base)
- `.status-glyph--{status}` (modifier)

---

### RoadmapStepCard

**Purpose:** Minimal milestone card for Timeline section

**API:**
```javascript
createRoadmapStepCard({
  title: string,
  status: 'now' | 'next' | 'done' | 'later',
  id?: string
}): HTMLElement
```

**Contains:**
- H3 title (left-aligned)
- StatusGlyph (right-aligned)

**Does NOT contain:**
- Body text
- Meta/footer
- CTA buttons

**Styling:**
- Inherits `.card-frosted` base
- Additional class: `.roadmap-step-card`
- Hover: +2% opacity, subtle glow
- Focus-visible: 2px neon ring, no layout shift

**Accessibility:**
- `role="article"`
- `aria-label="{title} - Status: {status}"`

---

### QuestCard

**Purpose:** Detailed quest card for QuestMap section

**API:**
```javascript
createQuestCard({
  title: string,
  status: 'now' | 'next' | 'done' | 'later',
  body: string,
  meta?: string,
  progressRibbonState?: 'now' | 'next' | 'done' | 'later',
  id?: string
}): HTMLElement
```

**Structure:**
- **Header** (`.quest-card__header`)
  - H3 title
  - StatusGlyph
  - Optional progress ribbon (chip row)
  - Stronger inner glow than RoadmapStepCard
- **Body** (`.quest-card__body`)
  - Full descriptive text
  - Max-width: 75ch
  - Line-height: 1.5
- **Footer** (`.quest-card__footer`, optional)
  - Meta information (quarter, tags, etc.)

**Styling:**
- Inherits `.card-frosted` base
- Additional class: `.quest-card`
- Header has enhanced glow effect

**Accessibility:**
- `role="article"`
- `aria-label="{title} - Status: {status}"`

---

### TimelineSection

**Purpose:** Orchestrates Timeline layout with alternating cards

**API:**
```javascript
initTimelineSection(
  container: HTMLElement,
  data: Array<MilestoneData>
): { destroy: () => void }
```

**MilestoneData:**
```typescript
{
  id: string;
  title: string;
  status: string; // Will be normalized to contract status
}
```

**Layout Breakpoints:**

| Breakpoint | Behavior |
|------------|----------|
| **Desktop** (≥1024px) | 3-column grid: `1fr \| auto \| 1fr`<br>Vertical neon spine in center<br>Odd cards left, even cards right<br>Gap: `var(--gap)` |
| **Tablet** (768-1023px) | Compressed centered single column<br>Subtle left spine accent<br>Max-width: 640px |
| **Mobile** (≤767px) | Full-width single column<br>Spine hidden |

**Accessibility:**
- Grid has `role="list"`
- `aria-label="Project milestones timeline"`
- Spine has `aria-hidden="true"`
- Live region announces: "Timeline loaded with {N} milestones"

---

### QuestMapSection

**Purpose:** Orchestrates QuestMap layout with stacked detailed cards

**API:**
```javascript
initQuestMapSection(
  container: HTMLElement,
  data: Array<QuestData>
): { destroy: () => void }
```

**QuestData:**
```typescript
{
  id: string;
  title: string;
  status: string; // Will be normalized
  desc: string;
  quarter?: string;
  tags?: string[];
}
```

**Layout:**
- Single centered column
- Max-width: 1120px
- Vertical stacking with consistent gap
- Gap: `var(--quest-gap, clamp(1.6rem, 4vw, 2.6rem))`

**Accessibility:**
- Container has `role="region"`
- `aria-labelledby="questmap-heading"`
- Hidden H2 heading: "Detailed Quest Map"
- Cards container has `role="list"`
- Each card wrapped in `role="listitem"`
- Live region announces: "Quest map loaded with {N} detailed quests"

---

## Design Tokens

### Color Palette

```css
:root {
  /* Neon accents */
  --neon-green: #00FF66;
  --neon-orange: #FF6200;

  /* Status colors */
  --status-now-active: var(--neon-green);
  --status-next: var(--neon-green);
  --status-done: #60ffa6;  /* teal */
  --status-later: #a78bfa;  /* violet */

  /* Glass/frosted effects */
  --frame: rgba(255,255,255,.08);
  --glass: rgba(255,255,255,.03);
  --glow: 0 0 12px rgba(57,255,136,.35);
}
```

### Spacing & Sizing

```css
:root {
  /* Layout */
  --radius: 18px;
  --gap: 18px;

  /* Roadmap/Timeline */
  --rm-col-max: 1240px;
  --rm-dot-size: 34px;

  /* QuestMap */
  --quest-gap: clamp(1.6rem, 4vw, 2.6rem);
  --quest-spine-width: 4px;
  --quest-dot-size: 18px;
  --quest-card-border: rgba(255, 255, 255, 0.08);
}
```

### Component Utilities

#### Frosted Card Base

```css
.card-frosted {
  border: 1px solid var(--frame);
  background: var(--glass);
  backdrop-filter: blur(6px);
  border-radius: var(--radius);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.06);
  transition: background 0.2s ease, box-shadow 0.2s ease;
}

.card-frosted:hover {
  background: rgba(255,255,255,.05);
  box-shadow: var(--glow);
}

.card-frosted:focus-visible {
  outline: 2px solid var(--neon-green);
  outline-offset: 2px;
}
```

#### Focus-Visible Ring

All interactive elements must show a visible focus indicator:
- 2px solid neon-green ring
- 2px offset (no layout shift)
- Applied via `:focus-visible` pseudo-class

---

## Motion Policy

### Pulse Animation

```css
@keyframes status-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.15);
  }
}

.status-glyph--now {
  animation: status-pulse 1.6s ease-in-out infinite;
}
```

### Reduced Motion

**MANDATORY:** All animations must respect user preference:

```css
@media (prefers-reduced-motion: reduce) {
  .status-glyph--now {
    animation: none;
  }
}
```

JavaScript implementation:

```javascript
import { prefersReducedMotion } from '/utils/motion.js';

if (status === 'now' && prefersReducedMotion()) {
  glyph.style.animation = 'none';
}
```

---

## Data Schema

### Roadmap JSON Structure

Located at: `/assets/roadmap.json`

```json
[
  {
    "id": "unique-id",
    "title": "Milestone Title",
    "desc": "Full description for QuestMap",
    "status": "done" | "inprogress" | "planned",
    "quarter": "Q4" | "Q1" | "Q2",
    "theme": "candle" | "bull" | "bear",
    "tags": ["tag1", "tag2"],
    "deps": []
  }
]
```

### Status Normalization

Existing JSON uses different status values than component contract:

```javascript
function normalizeStatus(rawStatus) {
  const statusMap = {
    'inprogress': 'now',
    'planned': 'next',
    'done': 'done'
  };
  return statusMap[rawStatus] || 'later';
}
```

---

## Testing Requirements

### Coverage

All components must have:
1. **Smoke test** — Renders without error
2. **Props test** — Correct classes/attributes applied
3. **Accessibility test** — ARIA attributes present
4. **Motion test** — Reduced motion respected

### Test Framework

- **Vitest** with jsdom environment
- Test files: `/tests/{ComponentName}.test.js`
- Setup: `/tests/setup.js`

### Running Tests

```bash
npm run test          # Run all tests once
npm run test:watch    # Run in watch mode
npm run test:ui       # Open Vitest UI
```

---

## Integration Guide

### Step 1: Add Containers to HTML

```html
<!-- Timeline Section (scanning) -->
<section id="timeline-foundation">
  <!-- Will be populated by JavaScript -->
</section>

<!-- QuestMap Section (reading) -->
<section id="questmap-foundation">
  <!-- Will be populated by JavaScript -->
</section>
```

### Step 2: Import and Initialize

```javascript
import { initTimelineSection } from '/js/components/TimelineSection.js';
import { initQuestMapSection } from '/js/components/QuestMapSection.js';

async function loadRoadmap() {
  const response = await fetch('/assets/roadmap.json', { cache: 'no-store' });
  const data = await response.json();

  // Initialize Timeline
  const timeline = document.getElementById('timeline-foundation');
  const timelineController = initTimelineSection(timeline, data);

  // Initialize QuestMap
  const questmap = document.getElementById('questmap-foundation');
  const questmapController = initQuestMapSection(questmap, data);

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    timelineController.destroy();
    questmapController.destroy();
  });
}

loadRoadmap();
```

### Step 3: Verify Accessibility

- [ ] Keyboard navigation works (Tab, Shift+Tab)
- [ ] Focus-visible rings appear on all interactive elements
- [ ] Screen reader announces section changes
- [ ] ARIA regions properly labeled
- [ ] Reduced motion disables pulse animation

---

## Future Enhancements

These are **NOT** part of the foundation and should be added in separate PRs:

1. **Interactive features**
   - Click to expand/collapse cards
   - Filter by quarter/status/tags
   - Keyboard navigation between cards

2. **Visual enhancements**
   - Progress bar showing completion
   - Animated transitions between states
   - Dependency visualization

3. **Data features**
   - Real-time status updates
   - Dependency graph rendering
   - Export to PDF/image

---

## Maintenance

### Adding a New Status

1. Update `StatusGlyph.js`:
   ```javascript
   export function isValidStatus(status) {
     return ['now', 'next', 'done', 'later', 'NEW_STATUS'].includes(status);
   }
   ```

2. Add CSS in `styles.css`:
   ```css
   .status-glyph--NEW_STATUS {
     background: /* color */;
   }
   ```

3. Update tests in `StatusGlyph.test.js`

4. Document in this spec

### Changing Breakpoints

**DON'T.** Breakpoints are part of the architectural contract:
- Mobile: ≤767px
- Tablet: 768-1023px
- Desktop: ≥1024px

If you absolutely must change them, update:
1. `styles.css` media queries
2. This spec document
3. All component documentation

---

## References

- **AGENTS.md** — Developer workflow guide
- **HOWTO_ROADMAP.md** — Legacy roadmap documentation
- **HOWTO_QUESTMAP.md** — Legacy questmap documentation
- **Vitest Docs** — https://vitest.dev
- **ARIA Authoring Practices** — https://www.w3.org/WAI/ARIA/apg/

---

**End of Specification**
