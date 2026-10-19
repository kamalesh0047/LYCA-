# LYCA — Violet & Electric Lime Edition

Complete React + TypeScript multipage website. This revision keeps the full cinematic treatment and removes redundant carousel, pointer and scroll work.

## Run in VS Code / Windows CMD

Install Node.js 22.12 or newer. Extract the ZIP and open `LYCA-Dark-Glass-Website` in VS Code.

```cmd
npm install
npm run build
npm run preview
```

Open the preview address printed in the terminal. Stop an old server with Ctrl+C first. For editing, `npm run dev` starts Vite's development server.

## Effects retained

- Animated fog, light rays, aurora and film grain; pointer-driven lighting.
- Cinematic GSAP/ScrollTrigger photo carousel with rack focus, perspective, tilt and parallax.
- Animated dust (90 particles on desktop, 45 on phones).
- Light leaks, photo flare, glass navigation, cursor glow/ring, card spotlights.
- Dolly motion on visible photographs, kinetic heading sheen and automatic ingredient tickers.
- First-load title/letterbox opening and shutter navigation with a brief blur lens.

The opening runs once per tab. Clear `lyca:opened` in sessionStorage to replay it. Tickers have no Pause buttons. Reduced-motion preferences continue to receive the accessible static layout.

## How rendering is optimized

- `src/app/noiseTexture.ts`: bakes five-octave noise once. The WebGL shader samples the texture instead of recalculating procedural noise for every pixel every frame. Fog, aurora and grain share one shader pass.
- `public/images/focus/`: small pre-rendered rack-focus images (about 34 KB total). `FocusPhoto` blends these with the sharp image using opacity, preserving blur/dimming without a live filter. No blur images are generated on the visitor's device.
- `src/app/frameLoop.ts`: shares GSAP's clock between Lenis, WebGL, dust and pointer interpolation. Hidden tabs skip work.
- Dust is batched as GPU points in the existing WebGL canvas, rather than repainting a second full-screen particle canvas. Flare and soft light layers animate cached surfaces with transforms.
- Photo dolly/sheens pause off-screen. Spotlights update only the hovered card.
- The route blur uses one temporary viewport lens; the tall document is not continuously filtered.
- `RuntimeQuality` adjusts buffer detail (512px / 384px maximum dimension). It never freezes the background or switches effects off. Ambient effects remain animated, including on the lower-detail tier.

Rendering speed still depends on the browser and GPU; the included validation records what was actually checked.

## Pages and enquiries

Home; seven searchable ingredient collections; six application cards; company; regional network; enquiry; privacy; terms; custom 404. Product links prefill the enquiry form. The form composes an email unless `VITE_ENQUIRY_API_URL` is configured.

## Existing GitHub / Vercel project

Copy all source files and assets into the existing repository, retaining its `.git` folder. Include the new `src/app/frameLoop.ts`, `focusPhoto.tsx`, `noiseTexture.ts`, updated `quality.tsx`, and `public/images/focus` folder.

```cmd
npm install
npm run build
git add .
git add --renormalize public src/assets
git commit -m "Restore full cinematic effects with cached rendering"
git push
```

Vercel: Vite, build `npm run build`, output `dist`. SPA rewrite supports direct route loading. Assets are normal Git files; prebuild rejects Git LFS pointers.

Stylesheet order remains `index.css`, `premium.css`, `cinema.css`. Business/legal content remains editable in `src/app/pages.tsx` and `src/app/data.ts`.

## Reference colours

Violet `#5a47e1`, electric lime `#d4ff4d`, ink `#080c15` and off-white `#fefefc`. Theme tokens and final component colours are in `src/palette.css`; WebGL lighting and the original logo tint are matched in `src/app/cinematic.tsx`. Animation timing, particle counts, photo assets and rendering budgets are retained.

## Performance update — same UI and effects

- Carousel scroll and pointer changes commit once per display frame, instead of drawing independently in both handlers.
- Focus opacity and flare transforms update their own elements; no per-frame inherited carousel variables invalidate the whole subtree.
- Hover spotlight geometry is read once per frame, before style writes. Scroll progress caches the page height instead of measuring the document on every scroll.
- Upcoming carousel images decode sequentially during idle time to avoid decoding when a new chapter enters view.
- The animation clock keeps its timing on 60/120/144 Hz displays; the existing WebGL rate and buffer/particle settings are retained.
- Removed a duplicate, invisible progress bar's Motion subscription. The visible progress effect remains.

All CSS, photographs, colours and animation durations are unchanged. Run `npm run test:animation-clock` for the clock regression check.

For a local performance check, use `npm run build` then `npm run preview` and open the printed address. This tests the production build without development tooling. If replacing an older folder, stop its server first and hard-refresh the new preview with Ctrl+F5.
