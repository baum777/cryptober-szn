# HOWTO_QUESTMAP

## Overview
- The questmap is rendered inside `#questmap`/`#quest-spine` via `js/questmap.js`, sourcing data from `assets/roadmap.json` or the hidden DOM fallback.
- Orientation alternates left/right on desktop, stacks on mobile; status classes (`checkpoint--now/done/later`) control visuals.
- Buttons (`Complete`, `Next`) update statuses and announce changes through the live region `#questmap-live`.

## Localization & Audits
- Keep milestone titles, descriptions, button labels, and live-region strings in English.
- After adjusting questmap copy or markup, run `npm run audit:sitemap`; regenerate the translation ledger with `npm run i18n:scan` if the audit flags new text.

## Quick Commands
- `npm run audit:sitemap` — validates required sections and checks for stray German tokens.
- `npm run i18n:scan` — updates `i18n/de-terms.json` based on the latest audit output.
