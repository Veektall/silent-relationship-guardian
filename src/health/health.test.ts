import { describe, expect, it } from 'vitest'
import {
  formatDaysAgo,
  frequencyLabel,
  healthStatus,
  sortPeopleByHealth,
  statusLabel,
} from './index'
import type { Person } from '../db/types'

const DAY = 86_400_000

function person(partial: Partial<Person> & Pick<Person, 'desiredDays' | 'lastContactAt'>): Person {
  return {
    id: 'p1',
    name: 'Alex',
    notes: '',
    createdAt: 0,
    updatedAt: 0,
    ...partial,
  }
}

describe('healthStatus thresholds', () => {
  const now = 1_000_000_000_000

  it('returns unknown when never contacted', () => {
    expect(healthStatus(person({ desiredDays: 7, lastContactAt: null }), now)).toBe('unknown')
  })

  it('returns green when ratio < 0.85', () => {
    const p = person({ desiredDays: 7, lastContactAt: now - 5 * DAY })
    expect(healthStatus(p, now)).toBe('green')
  })

  it('returns yellow from 0.85 inclusive through 1.25', () => {
    expect(
      healthStatus(person({ desiredDays: 7, lastContactAt: now - 6 * DAY }), now),
    ).toBe('yellow')
    expect(
      healthStatus(person({ desiredDays: 7, lastContactAt: now - 8.75 * DAY }), now),
    ).toBe('yellow')
  })

  it('returns red when ratio > 1.25', () => {
    expect(
      healthStatus(person({ desiredDays: 7, lastContactAt: now - 9 * DAY }), now),
    ).toBe('red')
  })

  it('exposes status-only labels', () => {
    expect(statusLabel('green')).toBe('green')
    expect(statusLabel('yellow')).toBe('yellow')
    expect(statusLabel('red')).toBe('red')
    expect(statusLabel('unknown')).toBe('unknown')
  })
})

describe('formatDaysAgo', () => {
  const now = 1_000_000_000_000

  it('returns never / today / N days factually', () => {
    expect(formatDaysAgo(person({ desiredDays: 7, lastContactAt: null }), now)).toBe('never')
    expect(formatDaysAgo(person({ desiredDays: 7, lastContactAt: now - 0.5 * DAY }), now)).toBe(
      'today',
    )
    expect(formatDaysAgo(person({ desiredDays: 7, lastContactAt: now - 1.2 * DAY }), now)).toBe(
      '1 day',
    )
    expect(formatDaysAgo(person({ desiredDays: 7, lastContactAt: now - 3.1 * DAY }), now)).toBe(
      '3 days',
    )
  })
})

describe('frequencyLabel', () => {
  it('labels presets and custom', () => {
    expect(frequencyLabel(7)).toBe('Weekly')
    expect(frequencyLabel(14)).toBe('Every 2 weeks')
    expect(frequencyLabel(30)).toBe('Monthly')
    expect(frequencyLabel(10)).toBe('Every 10 days')
  })
})

describe('sortPeopleByHealth', () => {
  const now = 1_000_000_000_000

  it('orders red to yellow to green to unknown', () => {
    const people = [
      person({ id: 'u', name: 'U', desiredDays: 7, lastContactAt: null }),
      person({ id: 'g', name: 'G', desiredDays: 7, lastContactAt: now - 2 * DAY }),
      person({ id: 'r', name: 'R', desiredDays: 7, lastContactAt: now - 12 * DAY }),
      person({ id: 'y', name: 'Y', desiredDays: 7, lastContactAt: now - 7 * DAY }),
    ]
    expect(sortPeopleByHealth(people, now).map((p) => p.id)).toEqual(['r', 'y', 'g', 'u'])
  })
})
