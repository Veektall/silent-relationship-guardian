import type { HealthStatus, Person } from '../db/types'

const MS_PER_DAY = 86_400_000

export function daysSince(epochMs: number, now: number = Date.now()): number {
  return (now - epochMs) / MS_PER_DAY
}

export function healthRatio(person: Person, now: number = Date.now()): number | null {
  if (person.lastContactAt == null) return null
  if (person.desiredDays <= 0) return null
  return daysSince(person.lastContactAt, now) / person.desiredDays
}

/** Health from days-since-last vs desired cadence (product brief ratios). */
export function healthStatus(person: Person, now: number = Date.now()): HealthStatus {
  const ratio = healthRatio(person, now)
  if (ratio == null) return 'unknown'
  if (ratio < 0.85) return 'green'
  if (ratio <= 1.25) return 'yellow'
  return 'red'
}

/** Status-only chip / a11y label — no guilt language. */
export function statusLabel(status: HealthStatus): string {
  return status
}

const STATUS_ORDER: Record<HealthStatus, number> = {
  red: 0,
  yellow: 1,
  green: 2,
  unknown: 3,
}

export function healthSortKey(person: Person, now: number = Date.now()): number {
  return STATUS_ORDER[healthStatus(person, now)]
}

export function sortPeopleByHealth(people: Person[], now: number = Date.now()): Person[] {
  return [...people].sort((a, b) => {
    const sa = healthSortKey(a, now)
    const sb = healthSortKey(b, now)
    if (sa !== sb) return sa - sb
    const ra = healthRatio(a, now) ?? -1
    const rb = healthRatio(b, now) ?? -1
    if (ra !== rb) return rb - ra
    return a.name.localeCompare(b.name)
  })
}

/** Factual days-since — Design/AC: never / today / N days */
export function formatDaysAgo(person: Person, now: number = Date.now()): string {
  if (person.lastContactAt == null) return 'never'
  const days = daysSince(person.lastContactAt, now)
  if (days < 1) return 'today'
  if (days < 2) return '1 day'
  return `${Math.floor(days)} days`
}


export function frequencyLabel(desiredDays: number): string {
  if (desiredDays === 7) return 'Weekly'
  if (desiredDays === 14) return 'Every 2 weeks'
  if (desiredDays === 30) return 'Monthly'
  return `Every ${desiredDays} days`
}
