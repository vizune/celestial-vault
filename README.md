# Celestial Vault — Coming Soon

A responsive, static coming-soon page with **plain HTML and CSS**, designed for Neocities and inspired by the layout of the Vizune Reviews splash page.

## Publish to Neocities

Upload `index.html`, `styles.css`, and the `assets/` folder to the root of your Neocities site. There is no build step and no JavaScript.

You can also put these files in Astro's `public/` folder so Astro copies them without hashing their filenames. Keep in mind that Astro's normal home page route can collide with a `public/index.html`; for a coming-soon site it is simplest to deploy these files directly while building the full Astro site separately.

## Replace the Photoshop artwork

The temporary art is `assets/hero-placeholder.webp`, made from your Celestial Vault banner. Replace the file with your Photoshop export (same filename), or change the `src` in `index.html` to your new PNG/WebP.

Suggested Photoshop canvas: 1200 × 850 px, with the main subject centered. The CSS adds a soft radial fade (`mask-image`) so artwork dissolves into the background. If you export a transparent PNG, you can remove that mask from `.illustration__image` to preserve its natural edges.

The banner and the logo are your earlier assets; the art is only intended as a placeholder.

## Fonts

- **Manrope** — slogan heading, introductory copy, and coming-soon label
- **Marcellus** — small footer motto
- The logo already supplies the decorative fantasy lettering.

Fonts load from Google Fonts with system-font fallbacks.

## Palette

- Background `#090B1B`
- Primary text `#F7F0FF`
- Muted description `#AAA8C2`
- Lavender `#C8B7FF`
- Rose `#EEC8E3`
- Lantern gold `#F5C785`
- Deep indigo `#29254C`

Everything is defined as CSS custom properties in `styles.css`.
