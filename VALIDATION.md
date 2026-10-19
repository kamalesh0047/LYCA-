# Full effects with cached rendering — validation

- TypeScript and production build pass. Asset verification passes for 21 local files, including five pre-rendered focus images (~34 KB total).
- The complete fog/ray/aurora/grain treatment stays animated. A cached five-octave noise texture replaces per-frame procedural noise evaluation.
- Dust remains animated at 90 desktop / 45 mobile particles, batched into the same WebGL canvas. The GL error check returns NO_ERROR.
- Glass navigation, moving light leaks, cursor light/ring, photo flare and rack focus remain present.
- Rack focus blends sharp/pre-rendered soft images. No card blur filter is recalculated while scrolling; focused photos stay sharp.
- Desktop and mobile carousel forward/reverse checks, page navigation, width checks, and zero-JavaScript-error checks pass.
- A simulated 2-core / 2 GB device scales buffer detail while fog and particles keep rendering. No automatic static-background mode remains.
- Reduced-motion preferences still receive the accessible static layout.

The software-rendered Chromium comparison showed less rendering delay than the original full-effects PDF build. Those timings are not a promise of a particular frame rate on other hardware. Verify production preview on the target browser/GPU.

## Violet / electric lime revision — 19 October 2026

- Production build and TypeScript check passed; all 21 local assets verified. Existing large-bundle advisory remains.
- Chromium desktop 1440×1000 and mobile 390×844: no page errors or horizontal overflow; WebGL canvas present.
- Visually inspected both layouts. Body is RGB 90/71/225; lime buttons RGB 212/255/77.
- Only colours and theme documentation changed. Existing animation timing, render budgets, particles, image effects and reduced-motion behavior retained. No new performance guarantee is implied by a colour update.

## Rendering work optimization — 19 October 2026

- TypeScript and production build passed; all 21 local assets present. Existing large-entry-chunk advisory remains.
- CSS, image assets, colour theme, shader appearance, dust counts and animation duration settings are byte-for-byte unchanged from the violet/lime revision (shader diagnostics now avoid writing the same particle-count attribute every frame).
- Browser checks passed: next carousel chapter, ingredient search, enquiry navigation, mobile menu and overflow, reduced-motion toggle and restoration. Desktop WebGL active, 90 particles, GL error 0. No page errors. Stationary carousel: 0 style mutations over 1 second after settling.
- Clock regression checks passed at 60, 120 and 144 Hz for native-display, 60fps and 30fps subscriptions; hidden-tab skipping and listener cleanup passed.
- Same 5-second scroll/pointer scenario, Chromium with SwiftShader software graphics: style recalculation time 172.4 ms before vs 66.2 ms after; total task time 1038.0 vs 862.2 ms. Carousel subtree style mutations 1524 vs 1157; stage mutations 68 vs 2; portal events 123 vs 64.
- This software-rendered environment is not a target-device FPS benchmark. Frame-time outliers remained variable; these measurements demonstrate reduced rendering work and do not establish lag-free performance on every device.
