# Manual test script — Silent Relationship Guardian MVP

Ship gate for cold install → 5 people → log → confirm → drift. Run phone-width (or DevTools device mode). Prefer a fresh profile / cleared site data for step 1.

## 1. Cold install
1. Open the app with empty storage (clear site data / private window).
2. Confirm open lands on the **empty dashboard** in ≤3s — **no** onboarding wall, tour, guilt copy, or push opt-in.
3. Empty state shows calm copy ("Quiet until useful") plus primary CTA **Add someone**. Optional **Try with sample people** is opt-in only.

**Pass:** Silent first-run → empty dashboard. No Get started gate.

## 2. Add 5 people
1. Add five people with name + cadence (mix Weekly / Every 2 weeks / Monthly). Custom days are optional (1–365) — not required on first add.
2. Notes optional and skippable.
3. Empty name → inline error, no save. Rapid double-submit should not create duplicates while Saving….
4. After each save, return to the dashboard with them visible.

**Pass:** Each add ≤3 taps from empty; every new person is **unknown** (never red on day one); unknown-stable when all never-contacted.

## 3. Log contact
1. From a dashboard row, tap **Logged** (one tap).
2. Confirm quiet toast **Logged** with ~2s **Undo**; Undo restores prior `lastContactAt`.
3. Rapid double-tap **Logged** should only apply one log (in-flight guard).
4. Open person sheet → tap **Logged** again.

**Pass:** No channel/mood/note forced; no celebration modal; health recomputes; Undo works.

## 4. Confirm suggestion
1. From empty state or Settings, opt-in seed sample people / suggestion (never forced).
2. Exactly one card: eyebrow **Practice · demo**, then **Possible check-in?** + person name. Meta says **Demo — not from your phone**. Never implies "we saw a call."
3. **Yes** → applies suggestion time as last contact, dismisses; toast **Logged**.
4. Seed again if needed; **Not them** clears with no immediate re-ask; **Dismiss** tertiary also clears.
5. Cap/expiry: never show two cards at once; pending suggestions older than 7 days expire quietly to dismissed.

**Pass:** Max one card; Yes / Not them / Dismiss work; demo clearly practice.

## 5. Drift colors
1. With mixed ages (samples help), list shows red / yellow / green / unknown.
2. Sort: red → yellow → green → unknown.
3. Chips + factual days only: `never` / `today` / `N days` — no "you forgot," no due-hello / overdue guilt lines, no streak chrome.
4. Populated list has **Add person** only — no sample CTA on the fab (seed stays empty-only + Settings).

**Pass:** Scannable in a few seconds; high signal, low noise.

## 6. Settings privacy & data
1. Privacy blurb: local-only IndexedDB, no account / analytics / cloud sync; clearing site data wipes without export.
2. **Export JSON** → confirm warns the file may include names and private notes, then downloads.
3. Sample CTA notes demo is not from phone/calendar.
4. **Delete all data** → confirm → list clears; returns to empty dashboard and stays usable. Pending suggestion cleared.

**Pass:** Honest privacy; export/delete local-only.

## 7. Person delete cascade
1. Seed or add a person that has a pending practice suggestion.
2. Open person → **Remove person** → confirm.
3. Dashboard: person gone; confirm card for that person gone.

**Pass:** Delete person clears their suggestions.

## 8. Offline / PWA sanity
1. Load once online (service worker registers).
2. Go offline; reload or reopen.
3. Add or log while offline.

**Pass:** Shell loads offline after first visit; IndexedDB still works. Install prompt optional. Theme color / icons present for installability.

---

### Notes
- No analytics, backend, or sync in network traffic beyond static assets / SW.
- Privacy red-lines remain hard blocks: no scraping, install-time calendar/call/contacts perms, or cloud sync without a new review.
- If anything feels spammy (stacked suggestion cards, guilt copy, sample CTA on a full list, onboarding wall), treat as a fail.
