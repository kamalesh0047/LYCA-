# LYCA — Cinematic Website

Complete React + TypeScript multipage website, updated according to the supplied Index CSS Adjustments PDF.

## Run on Windows / VS Code

Install Node.js 22.12 or newer, extract the ZIP and open `LYCA-Dark-Glass-Website` in VS Code. In the CMD terminal run:

```cmd
npm install
npm run dev
```

Open the local address printed by Vite. To check the production version:

```cmd
npm run build
npm run preview
```

Stop an existing server with Ctrl+C before starting another. The Windows launcher also starts the development server.

## PDF changes applied

- `src/app/cinematic.tsx`: fBm fog, light rays, pointer-driven WebGL scene; 36 sprite-based dust motes (14 on phones); letterbox bars and 3.3-second title opening once per tab; photo depth and parallax, velocity tilt, chapter colour lighting and flare layers.
- `src/app/motion.tsx`: shutter-style entrance and exit with clip and scale; route scroll restoration preserved.
- `src/app/components.tsx`: persistent WebGL, Atmosphere, Dust and Letterbox layers mounted in Layout.
- `src/premium.tsx`: glass-card spotlights and a cursor ring, scroll progress/velocity hooks, kinetic gradients, marquee speed/drag hooks and completed counter glow.
- `src/cinema.css`: new final stylesheet containing the PDF's cinema layer, responsive rules and reduced-motion fallback. Existing `index.css` is preserved.
- `src/main.tsx`: stylesheet order is `index.css`, `premium.css`, then `cinema.css`.

The PDF uses shortened source paths; this project keeps its existing `src/app/` folder and correct relative imports. Opening timers and transient layers clean up on unmount, and the image captions retain their existing anchored layout. Tickers retain automatic scrolling without Pause buttons.

To replay the first-load opening while developing, clear the `lyca:opened` sessionStorage key or use a fresh tab. The opening has a 1900 ms fade-start and a 3300 ms finish. Reduced-motion visitors receive the static photo grid without the opening/dust/camera effects.

## Pages and enquiries

Home; seven searchable ingredient collections; six application cards; company; regional network; enquiry; privacy; terms; custom 404. Product links prefill the enquiry form.

The form composes an email unless `VITE_ENQUIRY_API_URL` is configured. It does not claim delivery through an unconfigured backend. Edit the business information/legal notices before public launch.

## GitHub / Vercel update

Copy this folder's contents into your existing repository, retaining its `.git` folder and including `.gitattributes`, `src`, `public` and `scripts`.

```cmd
npm install
npm run build
git add .
git add --renormalize public src/assets
git commit -m "Apply LYCA cinematic design instructions"
git push
```

Vercel: framework Vite, build `npm run build`, output `dist`. The included SPA rewrite supports direct route loading. Images and fonts are normal Git files; prebuild verification rejects Git LFS pointer files.

## Rendering and automatic performance fallback

This revision keeps the photo carousel, pointer parallax, first-load title and shutter transitions. It removes the per-frame photo blur/colour filters, full-page blur, animated grain/aurora, giant cursor glow and whole-page skew that caused expensive painting.

- WebGL fog uses three noise octaves, a 640px maximum drawing-buffer dimension and about 16 background frames/second. The carousel runs independently.
- Dust uses a cached sprite, a smaller canvas and 36 particles (14 on phones).
- Pointer lighting updates the hovered card instead of measuring all page cards on every mouse movement.
- On low-spec devices, or when a startup frame sample detects sustained slow rendering, `RuntimeQuality` freezes the ambient background and hides dust/cursor decoration. The GSAP carousel stays active.
- Hidden-tab rendering pauses; the title opening and reduced-motion layout remain available.

For the best local performance check use `npm run build` then `npm run preview`, and open the printed preview address. Actual frame rate depends on device and browser.
