# HOWTO — Tools Overlay Content & CTA Wiring

This guide explains how to update the modal overlays that back the Tools section on `index.html`.

## 1. Update overlay copy

* Source file: [`js/tools-overlay.js`](../js/tools-overlay.js)
* Content lives in the `overlayCopy` map (keys: `signal-forge`, `specterscan`).
* Each entry contains a `title` string and a `body` HTML template string.
* Keep markup simple (headings, paragraphs, lists) and ensure all text is **English**.
* After edits, run `node tools/audit-sitemap.js` to verify language compliance if the copy changed significantly.

## 2. Wire CTA buttons to overlays

* CTA markup lives inside `index.html` under the `#tools` section.
* Each button must include:
  * `class="btn btn-cta"`
  * `type="button"`
  * `data-overlay="<key>"` where `<key>` matches an entry in `overlayCopy`
  * A descriptive `aria-label` (e.g., "Learn more about Signal Forge").
* Re-using the existing `btn-cta` class ensures the pulsing animation and focus ring stay consistent.

## 3. Accessibility & motion notes

* The overlay container (`#tools-overlay`) uses `role="dialog"`, `aria-modal="true"`, and references `tools-overlay-title`/`tools-overlay-body`.
* Focus is trapped inside the dialog; `Esc`, the close button, and backdrop clicks all dismiss the overlay and restore focus to the trigger button.
* Body scroll locks while the overlay is open via `body.is-overlay-open`.
* `prefers-reduced-motion` disables the CTA pulse animation and removes overlay fade transitions, so avoid introducing large motion in custom content.

## 4. Adding more overlays

* Extend the `overlayCopy` map with a new key/value pair.
* Add a matching CTA button (`data-overlay="new-key"`).
* Optional: adjust styles in `styles.css` under the `.overlay` block if the new content requires different sizing.
