/** Re-export domain types for convenience. Prefer importing from `./db/types`. */
export type {
  Person,
  Suggestion,
  SuggestionStatus,
  SuggestionSource,
  AppMeta,
  HealthStatus,
  FrequencyPreset,
} from './db/types'

export { FREQUENCY_PRESETS, newId } from './db/types'
