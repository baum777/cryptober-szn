# HOWTO_ROADMAP

## Tokens & Theme
- Adjust roadmap spacing and bounds via CSS variables in `styles.css`: `--rm-col-max`, `--rm-gap`, `--rm-dot-size`, `--rm-bg-card`, and `--rm-border`.
- Neon accents and timeline glow use `--rm-accent` / `--rm-accent-dim`. Candle/Bull/Bear glows read from `--rm-candle`, `--rm-bull`, and `--rm-bear`.
- Icon glow intensity comes from `.rm-title .ico`; tweak drop-shadow there if you change the theme.

## Data Source
- Primary data is loaded from `/assets/roadmap.json` (`id`, `title`, `desc`, `quarter`, `status`, `theme`, `tags[]`).
- If the JSON fetch fails, the module falls back to the hidden list `#existing-roadmap-steps` in the DOM. Keep titles/descriptions in that list 1:1 with the JSON copy.
- Valid `status` modifiers: `planned`, `inprogress`, `done`. `theme` accepts `candle`, `bull`, or `bear` (defaults to candle).

## Behaviour & Controls
- Timeline dots map one-to-one to the milestone order. Clicking or pressing Enter/Space opens the detail card underneath.
- Arrow keys (`←` / `→`) cycle the active milestone; `Home` jumps to the first, `End` to the last. Prev/Next buttons mirror those actions.
- Quarter filter selects the first milestone in the chosen quarter; choosing “All” resets to the opener.
- “Show Done” toggles dimming on completed dots. The live region `#rm-live` narrates toggles and milestone switches.

## Accessibility & Reduced Motion
- Each dot sets `aria-current` and `aria-controls` for the active detail card. Detail cards announce via `aria-live="polite"`.
- Global reduced-motion handling already disables transitions; no extra hooks required for the roadmap.
- Ensure focus outlines remain visible after theming; `.rm-btn` and `.rm-dot` share the neon focus ring.

## QA Checklist
- Verify JSON loading and DOM fallback by temporarily renaming `assets/roadmap.json`.
- Test keyboard navigation: Tab to dots, use `←`/`→`, `Home`, `End`, and confirm focus follows.
- Toggle “Show Done” and confirm completed milestones dim without disappearing.
- Emulate reduced motion; timeline and detail card should not animate.
- Resize to mobile widths; horizontal dots remain scrollable and detail card stays centered.
