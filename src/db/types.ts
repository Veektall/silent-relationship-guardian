export type Person = {
  id: string
  name: string
  desiredDays: number
  notes: string
  lastContactAt: number | null
  createdAt: number
  updatedAt: number
}

export type SuggestionStatus = 'pending' | 'confirmed' | 'rejected' | 'dismissed'

export type SuggestionSource = 'manual' | 'demo' | 'calendar' | 'calls'

export type Suggestion = {
  id: string
  personId: string | null
  label: string
  suggestedAt: number
  status: SuggestionStatus
  source: SuggestionSource
}

export type AppMeta = {
  onboardingDone: boolean
  lastOpenedAt: number
}

export type HealthStatus = 'green' | 'yellow' | 'red' | 'unknown'

export type FrequencyPreset = 'weekly' | 'biweekly' | 'monthly' | 'custom'

export const FREQUENCY_PRESETS: Record<Exclude<FrequencyPreset, 'custom'>, number> = {
  weekly: 7,
  biweekly: 14,
  monthly: 30,
}

export function newId(): string {
  return crypto.randomUUID()
}
