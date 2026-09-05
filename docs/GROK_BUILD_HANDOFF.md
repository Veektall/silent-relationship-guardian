# Grok Build handoff — Silent Relationship Guardian

Human steps to open this project in Grok Build (chat Build mode on grok.com / Grok app), verify it runs, and publish a shareable *.grok.me URL.

This app is a local-first PWA: people, notes, and contact history live in IndexedDB in each visitor's browser. There is no backend. Publishing hosts only the static frontend; each visitor's data stays on their device.

---

## 0. Local check (optional but recommended)

On your machine, from the project root:

```bash
npm install
npm test
npm run build
npm run dev
```

- Dev server: open http://localhost:5173
- Production preview after build: `npm run preview`

Confirm:

- Silent first-run → empty dashboard (no onboarding wall)
- Primary CTA **Logged** (one-tap log + Undo toast)
- Add person, Settings Export / Delete
- Settings → Add sample people / suggestion → demo ConfirmCard shows **Practice · demo** then **Possible check-in?**

---

## 1. Open Grok Build

1. Go to https://grok.com or open the Grok iOS/Android app and sign in.
2. Start a new conversation.
3. In the mode switcher, choose Build (not Auto / Fast / Expert).

UI labels can shift; you want the in-chat Build mode that previews and publishes apps (not the terminal Grok Build CLI).

---

## 2. Import this source

Use one of these:

### A. GitHub URL (preferred if the repo is public or connected)

Paste a prompt like:

Import this Vite + React + TypeScript PWA and keep it as a static SPA. Repo: https://github.com/YOUR_ORG/silent-relationship-guardian
Do not add a backend. Do not enable xAI / SpaceXAI APIs. Data must stay in IndexedDB on the client.

Replace the URL with the real repo when you push one.

### B. Upload / unzip (no GitHub yet)

1. Use the release zip: silent-relationship-guardian-handoff.zip (source + docs + config; no node_modules).
2. Unzip locally if needed, then upload the project folder / zip into the Build conversation (whatever import/upload control Grok Build shows).
3. Tell Build: This is a Vite React TypeScript PWA. Install deps, run the production build, and serve the static dist output. Local-first IndexedDB only — no backend, no accounts, no analytics. Do not enable xAI APIs (this app does not need them).

Package notes for Build:

- Include: src/, public/, docs/, index.html, package.json, package-lock.json, vite.config.ts, vitest.config.ts, tsconfig*.json
- Exclude: node_modules/; prefer excluding dist/ so Build rebuilds clean; .git/ optional

---

## 3. Verify it runs in the Build preview

In the live preview, smoke-test:

1. Silent first-run → empty dashboard (no onboarding wall) then add a person.
2. Tap **Logged** then health badge updates.
3. Settings then Add sample people / suggestion then ConfirmCard shows eyebrow **Practice · demo** then **Possible check-in?** + name.
4. Settings then Export JSON then confirm dialog warns about private notes, then downloads a file.
5. Hard-refresh: data still present (IndexedDB).
6. Optional: install / offline shell if the preview supports PWA.

If Build asks to wire cloud sync, auth, or model APIs — decline. Keep static hosting only.

---

## 4. Publish then get a *.grok.me URL

1. Use Publish in the Build UI.
2. Choose access: Public (anyone), or Link / anyone-with-the-link; private/you-only is fine for personal testing.
3. Copy the published https://….grok.me URL.

Important privacy note for visitors: the published site is only the app shell. Each visitor's people and notes stay in their browser IndexedDB. Clearing site data, another device, or another browser = empty app for that context. There is no shared cloud database.

---

## 5. Do not enable xAI APIs

This MVP does not call Grok for chat, images, or voice. Leave xAI / SpaceXAI APIs (in-app model access) off unless you later add an explicit, reviewed feature that needs them. Enabling them is unnecessary cost and a privacy surface this app does not need.

---

## 6. After publish — quick checklist

- [ ] *.grok.me opens on phone and desktop browsers
- [ ] Demo suggestion still labeled as practice / demo
- [ ] Export still warns about private notes
- [ ] No account wall; no unexpected network calls for user data
- [ ] README / docs/PRIVACY.md still match behavior

---

## Project pointers

- README.md — Dev / build / features
- docs/PRODUCT_BRIEF.md — Product scope
- docs/TECH_APPROACH.md — Stack notes
- docs/PRIVACY.md — Privacy rules (local-first)
- docs/TEST_SCRIPT.md — Manual QA
- docs/GROK_BUILD_HANDOFF.md — This file

### Layout bake-in

- `src/{db,health,suggestions,ui}` — IndexedDB layer, health scoring, suggestion engine, UI shells
- PWA via `vite-plugin-pwa` (static shell; offline-capable)
- IndexedDB only — no network calls in app code for people / notes / contact history
- Demo ConfirmCard: eyebrow **Practice · demo** then **Possible check-in?** (+ person name)
- Primary CTA: **Logged**

Stack: Vite 8 + React 19 + TypeScript + idb + vite-plugin-pwa. Scripts: npm run dev, npm run build, npm test, npm run preview.
