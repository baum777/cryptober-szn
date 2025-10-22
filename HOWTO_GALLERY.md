# HOWTO_GALLERY

## Overview
- Galleries live in `index.html`, `lore_index.html`, and `lore_mascot.html` under `.gallery-grid` containers.
- `js/gallery.js` bootstraps the DOM items, wires paging, and forwards previews to `src/js/lightbox.js`.
- Quest grids reuse the same card sizing (`.gallery-item.card-glass`) so CSS updates cascade between lore, mascot, and quest contexts.

## Localization & Audits
- All thumbnails, captions, buttons, and aria labels must remain in English.
- After modifying gallery markup or copy, run `npm run audit:sitemap`; if new German strings are removed/added, refresh the inventory with `npm run i18n:scan`.

## Quick Commands
- `npm run audit:sitemap` — verifies required sections plus non-English detection.
- `npm run i18n:scan` — regenerates `i18n/de-terms.json` from the latest audit report.
