# HOWTO_ROADMAP

## Tokens & Layout
- Adjust roadmap spacing or sizes via CSS variables in `styles.css` (`--rm-grid-gap`, `--rm-card-radius`, `--rm-col-width`, `--rm-accent`).
- Timeline progress color uses `--rm-accent` / `--rm-accent-dim`.

## Data Source
- Default items live in `assets/roadmap.json`; update `id`, `title`, `desc`, `status`, `quarter`, `col`, and optional `deps` arrays.
- Valid `status` values should match CSS chip modifiers (`planned`, `inprogress`, `risk`, `done`).
- `quarter` is free text but timeline buttons currently cover `Q4`, `Q1`, `Q2`, `Q3`.

## Behaviour
- Filters (`#rm-filter-status`, `#rm-filter-quarter`) combine to narrow visible cards.
- Toggle dependencies via `#rm-toggle-deps` (adds dependency chips per card).
- Move cards with arrow buttons or focus the card and use ← / → keys. Announcements appear in `#rm-live`.
- Timeline dots sync with the quarter filter and update the progress bar gradient.

## Reduced Motion & A11y
- Global `@media (prefers-reduced-motion: reduce)` already disables transitions site-wide.
- Cards use focus outlines (`.rm-card:focus`) and remain keyboard reachable (`tabindex="0"`).
- Live region summarises filter state (`Showing X items...`) and moves.

## QA Checklist
- Confirm filters, timeline, and dependency toggle work with JSON-driven data.
- Verify arrow keys move focused cards between columns.
- Emulate reduced motion to ensure no lingering animations.
- Test responsive layout (desktop 3 columns, mobile single column).
