# Silent Relationship Guardian — Product Brief

**Owner:** Chief of Staff  
**Status:** v0.1 — approved for MVP build  
**Last updated:** 2026-09-05

## Mission
An almost invisible relationship-maintenance system. It does most of the work in the background. The user rarely logs anything. The app detects likely meaningful contact when permissions allow, asks for one-tap confirmation only when unsure, and surfaces only when a relationship is genuinely drifting.

## Principles (non-negotiable)
1. **Invisible by default** — quiet until useful  
2. **Near-zero daily friction** — no journaling habit required  
3. **High signal, low noise** — no spam, no guilt trips  
4. **Private & respectful** — local-first; privacy beats features  
5. **Actually useful** — real-life contact patterns, not vanity metrics  

## Personas
- Busy adult with a handful of important people (family, close friends, mentor) who drift without malice  
- Wants a safety net, not a CRM or streak app  

## Core loop
1. Add a person + desired contact frequency (e.g. weekly / every 2 weeks / monthly)  
2. System tracks last *meaningful* contact (manual or confirmed passive hint)  
3. Health = time since last contact vs desired cadence → green / yellow / red  
4. Optional passive hints (call, long thread, calendar meet) → one-tap “Was this with X?”  
5. Alert only when crossing into yellow/red — calm copy, once per threshold, snoozeable  

## MVP scope (v1)
### In
- People CRUD: name, desired frequency, optional notes/context, optional emoji/avatar letter  
- Manual “log contact” (one tap) as reliable baseline  
- Health dashboard (sorted: red → yellow → green → unknown)  
- Soft alerts / badges when drifting (in-app first; optional web push later if user opts in)  
- Lightweight confirmation queue for suggested contacts  
- Local-first storage (IndexedDB); data never leaves device by default  
- Mobile-first PWA (installable, offline read, fast)  
- Simulated / demo passive suggestions (deterministic heuristics) so the confirm flow is real even before OS permissions  

### Explicitly out of v1
- Cloud accounts / social graph import  
- Reading SMS content or scraping chat apps  
- Guilt copy, streaks, social sharing  
- Multi-user / couples mode  
- AI-generated conversation prompts (maybe later, opt-in)  

## Passive detection strategy (privacy-first)
| Signal | v1 approach | Permission |
| --- | --- | --- |
| Manual log | Primary, always available | None |
| User-initiated “I just talked to…” quick add | Supported | None |
| Calendar events (title/attendees) | Optional later; match names → suggestion | Calendar |
| Call log | Optional later on platforms that allow; never default-on | Phone/call |
| Notifications / messages | **Not** scraped in v1 | — |

v1 ships a **Suggestion engine stub**: from demo seeds + user actions, create “Did you connect with X?” cards. Architecture must accept real adapters later without rewriting the confirm UX.

## Confirmation UX
- Max one question at a time  
- Yes / Not them / Dismiss  
- Yes → set lastContactAt = suggestion time, clear card  
- Never stack nagging; max N pending suggestions; older ones expire quietly  

## Health model
- `desiredDays` from frequency  
- `ratio = daysSinceLast / desiredDays`  
- green: ratio < 0.85  
- yellow: 0.85–1.25  
- red: > 1.25  
- unknown: never contacted  
- No red on day one after add (grace: treat as green for `desiredDays * 0.5` after create if no contact yet? **Decision:** new people start **neutral/unknown**, not red.)

## Tone
Calm, adult, brief. Prefer “Alex is due a hello” over “You neglected Alex.”

## Success criteria for “excellent”
- Add 5 people + cadences in under 2 minutes  
- Log contact in ≤2 taps  
- Confirm a suggestion in 1 tap  
- Dashboard readable on phone in 3 seconds  
- Works offline after first load  
- Privacy story is honest and short  
- Publishable on `*.grok.me`

## Open decisions (resolved for MVP)
- Stack: Vite + React + TypeScript + IndexedDB (idb) + vanilla CSS (no heavy UI kit)  
- No backend for MVP  
- Push notifications: deferred; in-app “Needs attention” is enough for v1  

## Privacy (binding — see docs/PRIVACY.md)
All relationship data stays in the browser (IndexedDB). No account, no analytics, no cloud sync. Manual log is the default; v1 confirm cards are **demo/practice only**, not device sensing. Calendar/call hints are future, default-off, point-of-use permission only. Export and delete-all live in Settings. Message scraping is out of scope. Privacy beats features.
