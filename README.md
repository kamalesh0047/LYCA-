# LYCA — Refined Corporate Website

Responsive, multi-page React + TypeScript website in purple, white and lime green. Uses Motion (formerly Framer Motion) for restrained page fades, scroll reveals, menu animation and scroll progress. Includes a lightweight WebGL hero with a static fallback.

## Run on Windows / VS Code

Install Node.js 22.12 or newer. Extract this ZIP into a new folder, open it in VS Code, and run:

```cmd
npm install
npm run dev
```

Open the address printed in the terminal (normally http://localhost:8443). If that port is occupied, Vite selects another available port. You can also double-click `START_LYCA_WINDOWS.bat`.

For a production build:

```cmd
npm run build
npm run preview
```

## Pages and features

- Home: ingredient photography, WebGL visual, company overview and portfolio links.
- Ingredients: all seven collections, live search, category anchors and individual product enquiries.
- Applications: six manufacturing applications.
- Company and Global Network: company background, six regional contacts, phone/email/map links.
- Enquiry: product/category prefill, field validation and accessible error feedback.
- Privacy, Terms and custom 404 pages.
- Legacy `/home` and `/landing` addresses redirect to the home page.

## UI improvements

- Cleaner typography, spacing, hero imagery, cards and footer layout.
- Responsive layouts at phone, tablet and desktop sizes.
- Native wheel/touch/keyboard scrolling; smooth anchor navigation.
- Motion-based page fades and subtle reveals without nested transform conflicts.
- Mobile menu closes on navigation, Escape, outside clicks and desktop resizing.
- Browser Back/Forward scroll restoration and sticky-header anchor offsets.
- Images bundled locally, including a replacement for the broken coconut photograph.
- Reduced-motion preferences respected; readable content is never dependent on an animation observer.

## Enquiry delivery

Without a configured backend, submission opens a composed email in the visitor's mail application. The visitor must review and send it. The website does not claim an enquiry was delivered automatically.

To enable direct submission, copy `.env.example` to `.env` and set `VITE_ENQUIRY_API_URL` to your form backend. It must accept JSON POST requests and return a success response only after delivery/storage. Never place secret API keys in `VITE_` variables.

## Hosting and content

`vercel.json` includes SPA rewrites so page refreshes work on deep links. Other hosts need an equivalent fallback to `index.html`.

Ingredient photos are illustrative; their Unsplash source URLs are recorded in `IMAGE_SOURCES.md`. Review business contact details, product information and website notices before launch.

## Validation

TypeScript and production build checked. Browser checks covered nine routes at 375, 768, 1024 and 1440 pixels, menu navigation, search/clear, enquiry prefill, invalid-form focus, category anchors, browser history and reduced motion.
