# HOWTO_ADJUSTMENTS

## Tokens & Layout Controls
- **Header/rails:** Adjust `--header-height`, `--rail-width`, and `--rail-gap` in `styles.css`.
- **Gallery cards:** `--card-radius`, `--gallery-gap`, `--img-shadow-grad`, `--lightbox-max-w`, and `--lightbox-max-h` live in `styles.css` near the global tokens block.
- **Column counts:** Update `.gallery-grid` breakpoints (4 cols desktop, 3 cols ≤1199px, 2 cols ≤899px, 1 col ≤599px).
- **Quest grid sizing:** `.quest-grid` piggybacks on `.gallery-grid`; tune spacing via `.quest-grid` or `.quest-tile` if needed.
- **Hero/logo tweaks:** Adjust `body.landing .logo-frame__img` in `styles.css` for landing-hero scale.

## Component Styling Hooks
- `.card-glass` drives the frosted cards; hover/active glow is extended via `.gallery-item.card-glass`.
- `.img-box` enforces aspect ratio + object-fit; gradient overlay handled by `.img-gradient-bottom` (opacity animates on hover/focus).
- Tag/button glow: edit `.tag-pill` in `styles.css` for shared pill styles.
- Glossary spacing: tweak `.glossary` and `.glossary-card` grid rules.

## Gallery & Lightbox System
- **Data flow:** `js/gallery.js` bootstraps DOM-sourced grids and wires the shared `Lightbox` (`src/js/lightbox.js`).
- **Pager sync:** `GalleryController` keeps lightbox + grid pages aligned (edges trigger `goToPage`).
- **Fallback handling:** Broken thumbs fall back to the SVG placeholder defined in `gallery.js` (`FALLBACK_IMAGE`).
- **Lazy/preload radius:** adjust `PRELOAD_RADIUS_DEFAULT` in `gallery.js`; thumbs default to eager for first row, lazy afterwards.
- **Accessibility:** Lightbox uses `role="dialog"`, `aria-modal`, focus trap (`utils/a11y.js`), live region (`.lightbox__announcer`), and arrow/Esc keyboard support. Body scroll locks via `body.is-lightbox-open`.
- **Reduced motion:** Only opacity fades are used; all scale/translate animations are gated behind `@media (prefers-reduced-motion: no-preference)`.

## Mascot Quest Grid Notes
- Markup: `lore_mascot.html` → `#quest-grid` contains `.gallery-grid.quest-grid` with `.gallery-item.card-glass.quest-tile` entries.
- Image previews: buttons with `[data-quest-media]` trigger `initQuestGrid` (`js/questgrid.js`) which pipes into the shared lightbox.
- Quest actions: `[data-quest-action="reveal"]` buttons still fire the toast via `initQuestGrid`; Prev/Next buttons remain untouched.
- When wiring elsewhere, pass the existing gallery controller’s `lightbox` into `initQuestGrid({ lightbox })` to avoid duplicate overlays.

## Quick Reference Adjustments
- Text centering or copy tweaks: edit selectors under `.content` as before.
- Catch Phrase copy: update phrases array inside `initRotator` within `boot-lore.js`.

## QA Checklist
- [ ] Desktop shows 4×2 cards; tablet 3×2; mobile 2×N (1×N under 600px).
- [ ] Lightbox opens on gallery + quest images, traps focus, supports Esc/←/→, and announces changes.
- [ ] Swipe gestures function on touch (buttons hide under 600px), desktop buttons visible with focus ring.
- [ ] Pager stays in sync when navigating past first/last item via lightbox or grid controls.
- [ ] Reduced-motion preference removes card lift + image scale; only quick fades remain.
- [ ] Broken/slow assets fall back to the inline SVG placeholder both in-grid and inside the lightbox.
- [ ] Quest grid image clicks open previews; quest action pills and pager buttons keep their original behavior.
