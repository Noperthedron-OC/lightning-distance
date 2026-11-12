# Lightning Distance — Design

## Theme

Warm dark, taken from the "warm dark" theme of [erichweihs.com](https://erichweihs.com), where the app is presented: lamp black ground, warm ink, Amber Glow as the accent. The flash is amber, the thunder is the site's Pocket Teal (light step), the result is in plain ink. A low amber glow at the top of the page is the only decoration on the ground.

Like the website: no rounded corners, no all caps, separation by hairlines rather than shadows, a 2 px amber focus ring with 3 px offset.

## Tokens

Theme tokens in `src/design-system/tokens.css` (site token in brackets):

- `--color-canvas: #15100b` — page ground (surface, lamp black)
- `--color-surface: #211912` — result card, dialogs (surface-raised)
- `--color-surface-raised: #2e2215` — (surface-tint)
- `--color-text: #f1e8dc` — (ink)
- `--color-text-muted: #b3a596` — (ink-muted)
- `--color-border: #3a2e22` — hairlines (line)
- `--color-border-strong: #7c6c5b` — secondary buttons, slider tracks (line-strong)
- `--color-primary: #d9a35e`, `--color-on-primary: #15100b` — the start button (accent-fill, on-accent)
- `--color-accent`, `--color-focus`, `--color-flash: #d9a35e` — labels, links, flash state, timer (accent)
- `--color-thunder: #4fb0c0` — thunder state (accent-alt, Pocket Teal)
- `--color-warning: #f0b86e`, `--color-danger: #e98a6f`, `--color-success: #a9c48d`

All radius tokens are 0.

## Typography

Self-hosted from Fontsource (latin subset), the same families as the website:

- **Josefin Sans** (variable, 600) for the app name, headings, the status line, the timer and the distance. History numbers use the light weight, like the site's index numerals.
- **Lato** (400 and 700) for text, labels, buttons and values.

Labels are small bold Lato in the accent, in sentence case. Changing numbers use tabular figures.

## Layout

One column on phones: camera, status, start button, last strike, history, settings. From 60rem wide: camera and controls on the left, readings on the right.

## Motif

Viewfinder corners: thin brackets inside the camera view, muted while watching, amber after a flash, teal when thunder is detected. The same corners frame the bolt in the app icon. The result card repeats the method as a line from flash (amber) to thunder (teal) with the delay on it.

## Navigation

Single page, no routing. Intro dialog on first load; About & diagnostics in the header (shortened to "About" on phones, with the full accessible name).

## Icons

UI icons from Lucide (no emoji). App icon: amber bolt between muted viewfinder corners on lamp black, square; sources in `public/icons/*.svg`.

## Hero picture

`docs/images/lightning-distance-how-it-works.jpg` (2400 × 1500) explains the app in one picture and is used on erichweihs.com. `npm run hero` renders it again from `scripts/hero/`: it draws the storm scene, runs the built app in Chromium with the scene as fake camera, taps the five strikes of the original screenshot (last one 3.70 s at 20 °C, 1.27 km) and places the phone screen in the scene. Run it after visible changes to the app.
