import {
  createSuggestion,
  listPendingSuggestions,
  listSuggestions,
  updateSuggestionStatus,
} from '../db'
import type { Person } from '../db/types'

/** Keep the pending queue small; UI shows at most one card. */
const MAX_PENDING = 1

/** Seed demo suggestions for the given people (confirm flow without OS permissions). */
export async function seedDemoSuggestions(people: Person[]): Promise<number> {
  const pending = await listPendingSuggestions()
  const room = Math.max(0, MAX_PENDING - pending.length)
  if (room === 0) return 0

  const all = await listSuggestions()
  const pendingPersonIds = new Set(
    pending.map((s) => s.personId).filter((id): id is string => id != null),
  )
  // Avoid immediately re-asking the same person after dismiss/reject/confirm
  // when the user re-seeds; prefer people with no prior demo suggestion.
  const previouslyDemoed = new Set(
    all
      .filter((s) => s.source === 'demo' && s.personId != null && s.status !== 'pending')
      .map((s) => s.personId as string),
  )

  const fresh = people.filter(
    (p) => !pendingPersonIds.has(p.id) && !previouslyDemoed.has(p.id),
  )
  const fallback = people.filter((p) => !pendingPersonIds.has(p.id))
  const candidates = pickCandidates(fresh.length > 0 ? fresh : fallback)
  const now = Date.now()
  let created = 0

  for (const person of candidates.slice(0, room)) {
    const hoursAgo = 2 + created * 5
    await createSuggestion({
      personId: person.id,
      label: `Practice check-in · ${person.name}`,
      suggestedAt: now - hoursAgo * 60 * 60 * 1000,
      source: 'demo',
    })
    created += 1
  }

  if (created < room && people.length === 0) {
    await createSuggestion({
      personId: null,
      label: 'Practice check-in · earlier today',
      suggestedAt: now - 3 * 60 * 60 * 1000,
      source: 'demo',
    })
    created += 1
  }

  return created
}

function pickCandidates(people: Person[]): Person[] {
  return [...people]
    .sort((a, b) => {
      const aLast = a.lastContactAt ?? 0
      const bLast = b.lastContactAt ?? 0
      return aLast - bLast
    })
    .slice(0, 5)
}

/** Quietly dismiss pending suggestions older than maxAgeDays. */
export async function expireOldSuggestions(maxAgeDays = 7): Promise<number> {
  const all = await listSuggestions()
  const cutoff = Date.now() - maxAgeDays * 86_400_000
  let expired = 0
  for (const s of all) {
    if (s.status === 'pending' && s.suggestedAt < cutoff) {
      await updateSuggestionStatus(s.id, 'dismissed')
      expired += 1
    }
  }
  return expired
}
