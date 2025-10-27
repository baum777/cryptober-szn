# HOWTO: Cyberpunk Neon Roadmap/QuestMap System

## Overview

The Cyberpunk Neon Roadmap/QuestMap system provides a dual-view milestone presentation:

1. **Timeline Section (top)**: Quick scan view with H3 titles + StatusGlyphs, alternating cards along a vertical neon spine
2. **QuestMap Section (below)**: Deep read view with H3 titles + full descriptions + optional meta, stacked centered cards

Both sections render from the same milestone data (`/assets/roadmap.json`) but serve different purposes.

---

## Architecture

### Files

- **CSS**: `/workspace/styles.css` — Contains all token definitions and component styles
- **JavaScript**: `/workspace/js/neon-roadmap.js` — Handles data loading and rendering
- **HTML**: `/workspace/index.html` — Contains section containers `#neon-timeline` and `#neon-questmap`
- **Data**: `/assets/roadmap.json` — Milestone data source

### Component Hierarchy

```
Timeline Section
├── .timeline-container (3-col grid)
│   ├── .timeline-spine (center column, neon gradient)
│   └── .roadmap-step-card (alternating left/right)
│       ├── .roadmap-step-card__header
│       │   ├── .status-glyph
│       │   └── h3.roadmap-step-card__title
│       └── (NO body text)

QuestMap Section
├── .questmap-container (single column, centered)
│   └── .quest-card (stacked vertically)
│       ├── .quest-card__header (with inner glow)
│       │   ├── .status-glyph
│       │   └── h3.quest-card__title
│       ├── p.quest-card__body (description)
│       ├── .quest-card__meta (optional)
│       └── .quest-card__progress-ribbon (optional)
```

---

## Visual Token Reference

### Core Neon Palette

```css
--neon: #39ff88;
--glow: 0 0 12px rgba(57,255,136,.35);
--frame: rgba(255,255,255,.08);
--glass: rgba(255,255,255,.03);
--radius: 18px;
--gap: 18px;
```

### Status Colors

| Status | CSS Variable | Color | Pulse Animation |
|--------|--------------|-------|-----------------|
| `now` | `--status-now-active` | Neon green (#39ff88) | ✅ Yes |
| `next` | `--status-next` | Neon green (#39ff88) | ❌ No |
| `done` | `--status-done` | Teal (#14b8a6) | ❌ No |
| `later` | `--status-later` | Violet (rgba(139, 92, 246, 0.6)) | ❌ No |

### Layout Tokens

```css
/* Timeline */
--timeline-spine-width: 2px;
--timeline-spine-gap: 24px;
--timeline-card-max: 460px;
--timeline-glyph-size: 12px;
--timeline-glyph-halo: 18px;

/* QuestMap */
--questmap-max-width: 1120px;
--questmap-card-max: 960px;
--questmap-vertical-gap: 48px;
--questmap-card-padding: 20px;
--questmap-header-glow: 0 0 18px rgba(57,255,136,.25);
```

---

## Component Contracts

### StatusGlyph

**Purpose**: Tiny status indicator (12px circle + halo)

**Props** (via `data-status` attribute):
- `"now"` — Current step, neon green with pulse
- `"next"` — Next step, neon green static
- `"done"` — Completed step, teal static
- `"later"` — Future step, violet low opacity static

**CSS Classes**:
```html
<span class="status-glyph" data-status="now" aria-hidden="true"></span>
```

**Behavior**:
- Pulse animation ONLY for `data-status="now"`
- Pulse is automatically disabled when `prefers-reduced-motion: reduce`
- Halo uses `::after` pseudo-element with radial gradient

---

### RoadmapStepCard (Timeline Section)

**Purpose**: Quick scan card for Timeline section

**Props** (via component function):
- `title`: string (H3 text)
- `status`: "now" | "next" | "later" | "done"

**CSS Classes**:
```html
<article class="roadmap-step-card roadmap-step-card--left" role="listitem">
  <div class="roadmap-step-card__header">
    <span class="status-glyph" data-status="now"></span>
    <h3 class="roadmap-step-card__title">Title Here</h3>
  </div>
</article>
```

**Constraints**:
- Contains ONLY H3 + StatusGlyph
- NO body text, NO buttons, NO meta rows
- Alternates `.roadmap-step-card--left` and `.roadmap-step-card--right` classes
- Hover: +2% opacity and subtle glow bump
- Focus-visible: 2px neon ring (`box-shadow: 0 0 0 2px var(--neon)`)

---

### QuestCard (QuestMap Section)

**Purpose**: Deep read card with full description

**Props** (via component function):
- `title`: string (H3 text)
- `status`: "now" | "next" | "later" | "done"
- `body`: string (full description text)
- `meta`: string (optional footer text, e.g., "Q4 · community · lore")
- `progressRibbonState`: (optional, currently not implemented)

**CSS Classes**:
```html
<article class="quest-card" data-status="now" role="listitem" aria-current="step">
  <div class="quest-card__header">
    <span class="status-glyph" data-status="now"></span>
    <h3 class="quest-card__title">Title Here</h3>
  </div>
  <p class="quest-card__body">Description text here...</p>
  <div class="quest-card__meta">Q4 · community · lore</div>
</article>
```

**Constraints**:
- Header strip has STRONGER inner glow than RoadmapStepCard
- Body text: comfortable reading width (max-width: 75ch), line-height 1.5
- Optional meta footer (small, muted text)
- No CTA buttons in footer
- Hover: subtle glow increase
- Focus-visible: 2px neon ring

---

## Responsive Layouts

### Desktop (≥1024px)

**Timeline**:
- 3-column grid: `1fr auto 1fr`
- Spine in center column (2px vertical neon line)
- Cards alternate left (column 1) and right (column 3)
- Gap between spine and card: 24px

**QuestMap**:
- Single centered column
- Max-width: 960px
- Full-width stacked cards with consistent vertical spacing

### Tablet (768–1023px)

**Timeline**:
- Single column layout
- Spine hidden (`display: none`)
- Cards centered, full-width

**QuestMap**:
- Same as desktop, slightly narrower

### Mobile (≤767px)

**Timeline**:
- Full-width single column
- No spine
- Cards stack with consistent spacing

**QuestMap**:
- Full-width cards
- Maintains readability

---

## Accessibility Features

### Screen Reader Support

1. **Section Roles**:
   ```html
   <section role="region" aria-labelledby="questmap-title">
   ```

2. **List Semantics**:
   ```html
   <div role="list">
     <article role="listitem">
   ```

3. **Current Step Indication**:
   ```html
   <article aria-current="step">
   ```

4. **Status Announcements**:
   ```html
   <h3>
     Title Here
     <span class="sr-only"> — current step</span>
   </h3>
   ```

### Focus Management

- All interactive elements have visible focus states
- Focus ring: `box-shadow: 0 0 0 2px var(--neon)`
- No layout shift on focus (outline: none + box-shadow)

### Reduced Motion

All animations respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  .status-glyph[data-status="now"]::after {
    animation: none;
  }
  .roadmap-step-card,
  .quest-card {
    transition: none;
  }
}
```

---

## Data Format

### roadmap.json Structure

```json
[
  {
    "id": "step-id",
    "title": "Milestone Title",
    "desc": "Full description text for QuestMap",
    "status": "inprogress | planned | done",
    "quarter": "Q4",
    "theme": "candle | bull | bear",
    "tags": ["community", "lore"]
  }
]
```

### Status Mapping

JavaScript normalizes `roadmap.json` status to component status:

```javascript
{
  "inprogress": "now",
  "planned": "later",
  "done": "done"
}
```

---

## Glow Policy

**Principle**: Glow is a highlight, not wallpaper.

- **StatusGlyph**: Subtle halo (18px radial gradient)
- **Timeline Spine**: Drop-shadow filter on gradient
- **Card Headers**: Minimal inner glow on hover
- **QuestCard Header**: Slightly stronger inner glow than RoadmapStepCard
- **Whole Surface**: Does NOT emit full neon
- **Black/Dark Space**: Intentional negative space

**Don't**:
- Make everything glow
- Apply glow to backgrounds
- Use glow for body text

**Do**:
- Use glow for status indicators
- Apply subtle glow on hover
- Use glow to emphasize headers

---

## Usage Examples

### Adding a New Milestone

1. Edit `/assets/roadmap.json`:
   ```json
   {
     "id": "new-feature",
     "title": "New Feature Launch",
     "desc": "Complete description of the new feature and its goals.",
     "status": "planned",
     "quarter": "Q1",
     "theme": "candle",
     "tags": ["feature", "launch"]
   }
   ```

2. Reload the page — both Timeline and QuestMap will update automatically

### Changing Status Colors

Edit CSS variables in `/workspace/styles.css`:

```css
:root {
  --status-done: #10b981; /* Change teal to another color */
  --status-later: rgba(168, 85, 247, 0.7); /* Adjust violet */
}
```

### Customizing Layout Spacing

```css
:root {
  --timeline-spine-gap: 32px; /* Increase gap from spine to cards */
  --questmap-vertical-gap: 64px; /* Increase section padding */
  --questmap-card-padding: 24px; /* Increase card padding */
}
```

---

## QA Checklist

### Visual Verification

- [ ] Timeline spine visible on desktop (≥1024px)
- [ ] Cards alternate left/right around spine
- [ ] StatusGlyphs visible and colored correctly
- [ ] "Now" status glyph pulses (if motion enabled)
- [ ] QuestCard headers have inner glow
- [ ] Hover states show subtle glow increase

### Responsive

- [ ] Desktop: 3-column Timeline layout works
- [ ] Tablet: Timeline collapses to single column, spine hidden
- [ ] Mobile: Both sections stack full-width
- [ ] No horizontal scrolling at any breakpoint

### Accessibility

- [ ] Keyboard navigation works (Tab through cards)
- [ ] Focus rings visible (neon ring on focus-visible)
- [ ] Screen reader announces status (e.g., "current step")
- [ ] `aria-current="step"` set correctly on active milestone
- [ ] Reduced motion disables all animations

### Data Loading

- [ ] Milestones load from `/assets/roadmap.json`
- [ ] Both Timeline and QuestMap render correctly
- [ ] Same milestone order in both sections
- [ ] Titles match exactly between sections

---

## Troubleshooting

### Timeline spine not visible

**Check**:
1. Browser width ≥1024px?
2. CSS loaded correctly?
3. `.timeline-spine` element in DOM?

**Fix**: Verify `grid-template-columns: 1fr auto 1fr` on `.timeline-container`

### Cards not alternating

**Check**: JavaScript logic in `createRoadmapStepCard()` applying `--left` / `--right` classes

**Fix**: Verify `const isLeft = index % 2 === 0` logic

### Glyph not pulsing

**Check**:
1. Status is `"now"`?
2. Reduced motion NOT enabled?
3. Animation defined in CSS?

**Fix**: Check `@keyframes status-glyph-pulse` and `.status-glyph[data-status="now"]::after` rule

### Milestones not loading

**Check**:
1. `/assets/roadmap.json` exists and is valid JSON?
2. JavaScript module loaded?
3. Console errors?

**Fix**: Verify fetch() in `loadMilestones()` function succeeds

---

## Future Enhancements

Potential additions while maintaining the spec:

1. **Progress Ribbon**: Implement `quest-card__progress-ribbon` with Now/Next/Later chips
2. **Meta Badges**: Add visual badges for tags (e.g., "community", "tools")
3. **Timeline Animation**: Subtle scroll-triggered animation for spine glow
4. **Interactive Filtering**: Filter by quarter or tag (maintain separation between sections)
5. **Milestone Details Modal**: Click card to open expanded view with more info

**Critical**: Any enhancements must NOT:
- Merge Timeline and QuestMap sections
- Add body text to RoadmapStepCard
- Remove StatusGlyphs
- Break responsive layouts
- Ignore reduced-motion preferences

---

## Related Documentation

- `HOWTO_ROADMAP.md` — Legacy roadmap system (deprecated)
- `HOWTO_QUESTMAP.md` — Legacy questmap system (deprecated)
- `HOWTO_ADJUSTMENTS.md` — General styling guidelines
- `AGENTS.md` — Developer guidelines and conventions

---

**Last Updated**: 2025-10-27  
**System Version**: Cyberpunk Neon v1.0  
**Maintainer**: Codex / Agent
