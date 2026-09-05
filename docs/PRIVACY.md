# Privacy & Trust — Silent Relationship Guardian

**Owner:** SRG Privacy  
**Status:** v1 review — binding for ship  
**Last updated:** 2026-09-05  
**Rule:** Privacy beats feature completeness.

## Charter (non-negotiable)

1. **Local-first by default** — people, notes, contact timestamps, and suggestions live in IndexedDB on the user’s device. No account. No cloud sync unless the user later opts in to a separately reviewed sync design.
2. **Data minimization** — store only what the core loop needs: name, desired cadence, optional notes, last meaningful contact time, and suggestion queue state. No social graph, no message bodies, no location, no contacts-book dump.
3. **No silent sensing** — passive adapters (calendar, call log, etc.) are off until the user turns them on at point of use, with plain-language purpose. v1 ships **demo suggestions only**; they must never read like real OS detection.
4. **No message scraping** — SMS, chat apps, notification content: permanently out unless a future design passes a dedicated privacy review (default answer: no).
5. **No analytics / telemetry / crash phones-home** in MVP. Static asset hosting only. Adding any third-party SDK requires Privacy sign-off.
6. **User control** — export (local JSON download) and delete-all must remain one step from Settings. Per-person delete must remove that person’s suggestions too (already true).
7. **Honest UX** — copy must not imply capabilities we do not have (real call detection, cloud backup, “we noticed you…” from device signals).
8. **Calm, non-guilt** — health and due copy are a trust surface; shame language is a privacy-adjacent harm (pressure + emotional surveillance vibe). Block guilt streaks and social sharing.

## What we collect today (v1 inventory)

| Data | Where | Leaves device? | Purpose |
| --- | --- | --- | --- |
| Person name, desiredDays, notes | IndexedDB `people` | No | Cadence + context |
| lastContactAt | IndexedDB | No | Health |
| Suggestions (label, source, status, times) | IndexedDB | No | Confirm queue |
| AppMeta (onboardingDone, lastOpenedAt) | IndexedDB | No | First-run + local session |
| PWA cache of static app assets | Service worker | N/A (same origin) | Offline shell |

**Not collected:** accounts, emails, phone numbers (unless the user types them into notes), analytics events, device contacts, calendar, call logs, message content.

## Threat model (MVP)

| Threat | Mitigation |
| --- | --- |
| Cloud breach / vendor access | No backend; nothing to breach |
| Curious roommate / shared browser | Same as any local site data — educate in Settings; delete-all available; no lock screen in v1 (defer) |
| Malicious extension / XSS | Minimize DOM surface; no third-party scripts; CSP later if hosting allows |
| User exports JSON then shares it | Export is user-initiated; file contains relationship notes — warn briefly before download |
| Future “helpful” sync | Block until: E2E or user-held keys, clear retention, revoke, and Privacy review |
| Fake sensing trust | Demo `source: 'demo'` must be labeled in UI so Yes does not train false confidence in device access |
| Clearing site data | Wipes relationships — Settings copy should say backups are the user’s export |

## Permission UX rules (when adapters land)

- **Never** request calendar / phone / contacts on first launch or behind onboarding.
- Ask **at the moment** the user enables that signal in Settings (or a clearly labeled “Connect calendar” control).
- One permission = one sentence why + what is read (e.g. “event titles and attendees only — not email bodies”).
- Default remain **manual log + opt-in demo**. Denied permission = app still fully useful.
- Revoke path: Settings toggle off → stop reading; do not keep raw event/call payloads (store only user-confirmed contact timestamps + minimal suggestion cards).

## Retention

- People & notes: until user deletes person or delete-all.
- Suggestions: expire pending quietly (current: 7 days → dismissed). Confirmed/rejected/dismissed rows may linger — **v1.1 gate:** purge non-pending suggestions older than 30 days or on confirm (keep only the resulting `lastContactAt`).
- No server retention (no server).

## v1 code review — pass / fix / block

### Pass
- Dependencies are `react`, `react-dom`, `idb` only — no analytics SDKs.
- No `fetch` / telemetry in `src/`.
- Settings privacy blurb is accurate for current architecture.
- Export is local download; delete-all confirmed; person delete cascades suggestions.
- Sample people are empty-state opt-in (“Try with sample people”), not auto-seeded.
- Product brief already bans SMS scraping, guilt, social sharing, cloud accounts for v1.

### Fix before ship (honesty / trust)
1. **Demo suggestions must not impersonate sensing.** ConfirmCard for `source === 'demo'` should say practice/demo copy (e.g. “Practice suggestion” / “Demo — not from your phone”) instead of only “Possible call · Name” + “Was this with X?” which implies we observed a call.
2. **Export sensitivity line** — one sentence before or under Export: this file includes names and notes; treat it like a private backup.
3. **Onboarding wall** — Product/Testing already require silent/skippable first-run straight to empty dashboard. Privacy agrees: a forced wall is friction without real consent value; keep the one-line local-only promise in Settings (and optionally a dismissible tip), not a gate.

### Block (do not ship if present)
- Any analytics, crash reporter, or network POST of user content.
- Auto-enabling calendar/call adapters or requesting those permissions on install.
- Reading notification/SMS/chat content.
- Cloud sync or account login without a reviewed design.
- Guilt / streak / share-to-social surfaces.
- Demo or real suggestions that claim “we saw a call/text” without an actual consented adapter.

## Privacy notes for product brief (paste-ready)

> **Privacy (v1):** All relationship data stays in the browser (IndexedDB). No account, no analytics, no cloud sync. Manual log is the default; “passive” confirm cards in v1 are **explicitly demo/practice**, not device sensing. Calendar/call hints are future, default-off, point-of-use permission only. Export and delete-all live in Settings. Message scraping is out of scope. Privacy beats features — if a idea needs creepy collection, redesign or cut it.

## Review checklist (every sensing/sync PR)

- [ ] What new fields are stored? Can any be derived instead?
- [ ] Does anything leave the device? Where? Encrypted? Revocable?
- [ ] Permission timing: point-of-use? Decline path still works?
- [ ] Copy honest about source (`demo` / `calendar` / `calls` / `manual`)?
- [ ] Retention + delete path updated?
- [ ] Third-party SDK? → default **no**
