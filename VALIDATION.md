# Cinematic performance correction — validation

- TypeScript and production build pass; asset verification passes for 16 local files. Vite retains a non-blocking large entry chunk warning.
- At 1440 × 900, the WebGL drawing buffer measures 256,000 pixels versus 756,800 in the PDF cinema revision (about 66% fewer pixels).
- The same browser sampling check records zero new radial-gradient allocations for dust versus 4,860 previously. Dust now reuses one sprite.
- Foreground carousel forward/reverse checks pass at 1440px and 390px without horizontal overflow. Photo filters are `none`.
- A simulated 2-core / 2 GB device automatically uses a static ambient frame; the carousel still advances and the background redraws correctly after resize.
- Applications navigation completes, the letterbox cutting state clears and the main page has no blur filter.
- No uncaught JavaScript errors in the completed browser checks.

The measurements describe rendering work in controlled Chromium checks, not a guarantee of FPS on a particular device. The visual fallback reduces ambient motion while preserving the photo carousel.
