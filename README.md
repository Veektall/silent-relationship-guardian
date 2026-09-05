# Silent Relationship Guardian

A calm, local-first PWA that helps you stay in touch with people who matter.

Data stays in your browser (IndexedDB). No accounts, analytics, or backend. Each browser/device has its own data.

## Features (MVP)

- People CRUD with cadence presets
- Dashboard health sorting
- One-tap Logged + Undo toast
- Person detail
- Practice demo confirm sheet
- Opt-in sample people
- Export and delete controls
- Silent first-run
- Installable PWA

## Health model

- unknown: never contacted
- green under 0.85
- yellow 0.85 to 1.25
- red over 1.25

## Local

Use package.json scripts for install, dev, test, build, and preview.

## Deploy

Vercel free static hosting (Vite SPA via `vercel.json`). No Analytics or Speed Insights.

## Docs

See docs/PRODUCT_BRIEF.md, docs/PRIVACY.md, docs/TEST_SCRIPT.md, and the Build handoff doc in docs/.
