import {
  getPerson,
  listPendingSuggestions,
  logContact,
  updateSuggestionStatus,
} from '../db'
import type { Suggestion } from '../db/types'
import { expireOldSuggestions, seedDemoSuggestions } from './demo'

export { expireOldSuggestions, seedDemoSuggestions }

const MAX_PENDING = 5

/** Pending suggestions, newest first, capped. */
export async function getPendingQueue(limit = MAX_PENDING): Promise<Suggestion[]> {
  await expireOldSuggestions()
  const pending = await listPendingSuggestions()
  return pending.slice(0, limit)
}

/** First pending card for confirm UX (max one at a time in the UI). */
export async function getNextPendingSuggestion(): Promise<Suggestion | null> {
  const queue = await getPendingQueue(1)
  return queue[0] ?? null
}

export async function confirmSuggestion(suggestion: Suggestion): Promise<void> {
  await updateSuggestionStatus(suggestion.id, 'confirmed')
  if (suggestion.personId) {
    await logContact(suggestion.personId, suggestion.suggestedAt)
  }
}

export async function rejectSuggestion(id: string): Promise<void> {
  await updateSuggestionStatus(id, 'rejected')
}

export async function dismissSuggestion(id: string): Promise<void> {
  await updateSuggestionStatus(id, 'dismissed')
}

export async function resolvePersonName(
  suggestion: Suggestion,
): Promise<string | null> {
  if (!suggestion.personId) return null
  const person = await getPerson(suggestion.personId)
  return person?.name ?? null
}
