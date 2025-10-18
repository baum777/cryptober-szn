# Layout & Hero Adjustment Notes

- **Design Tokens**: Control the main width and spacing via `--content-max`, `--content-max-xl`, `--content-pad-x`, `--section-gap`, and the hero-specific `--hero-gap` tokens defined in `styles.css`.
- **Hero Graphic Scaling**: Tweak the hero image emphasis by adjusting the width percentage on `#hero.section .img-box img` (default `115%`) or overriding with the `.hero-graphic` helper class.
- **Responsive Breakpoints**: Update the `900px` and `1600px` breakpoints in `styles.css` to shift between single-/two-column hero layouts or to widen the content shell on ultra-wide screens.
