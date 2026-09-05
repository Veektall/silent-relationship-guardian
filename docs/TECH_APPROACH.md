# Technical Approach — Silent Relationship Guardian

## Stack
- **Vite + React 18 + TypeScript**
- **idb** (IndexedDB wrapper) for local-first persistence
- **CSS** mobile-first, system fonts, calm palette
- **vite-plugin-pwa** for service worker / installability
- No auth, no server required for MVP

## Data model
```ts
type Person = {
  id: string
  name: string
  desiredDays: number // e.g. 7, 14, 30
  notes: string
  lastContactAt: number | null // epoch ms
  createdAt: number
  updatedAt: number
}

type Suggestion = {
  id: string
  personId: string | null // null if unknown who
  label: string // "Possible call · today"
  suggestedAt: number
  status: 'pending' | 'confirmed' | 'rejected' | 'dismissed'
  source: 'manual' | 'demo' | 'calendar' | 'calls'
}

type AppMeta = {
  onboardingDone: boolean
  lastOpenedAt: number
}
```

## Modules
- `db/` — schema, migrations, CRUD
- `health/` — pure functions for status color
- `suggestions/` — queue rules + demo adapter interface
- `ui/` — Dashboard, Person detail, Add/Edit, Confirm sheet
- `pwa/` — manifest, icons, SW

## Privacy constraints in code
- No analytics SDKs
- No network calls except static hosting / optional future opt-in sync
- Permissions requested only at point of use, with plain-language why
- Export/delete-all from Settings

## Publish path
- Build static assets → host on `*.grok.me` (or box static serve during dev)
- Document URL for user when live

## Testing
- Unit: health thresholds, suggestion expiry
- Manual scripts: cold install, offline, add/log/confirm, drift states
