import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import {
  newId,
  type AppMeta,
  type Person,
  type Suggestion,
  type SuggestionSource,
  type SuggestionStatus,
} from './types'

interface SRGSchema extends DBSchema {
  people: {
    key: string
    value: Person
    indexes: { 'by-updated': number }
  }
  suggestions: {
    key: string
    value: Suggestion
    indexes: { 'by-status': string; 'by-suggested': number }
  }
  meta: {
    key: string
    value: AppMeta & { id: string }
  }
}

const DB_NAME = 'silent-relationship-guardian'
const DB_VERSION = 1
const META_KEY = 'app'

let dbPromise: Promise<IDBPDatabase<SRGSchema>> | null = null

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<SRGSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const people = db.createObjectStore('people', { keyPath: 'id' })
        people.createIndex('by-updated', 'updatedAt')

        const suggestions = db.createObjectStore('suggestions', { keyPath: 'id' })
        suggestions.createIndex('by-status', 'status')
        suggestions.createIndex('by-suggested', 'suggestedAt')

        db.createObjectStore('meta', { keyPath: 'id' })
      },
    })
  }
  return dbPromise
}

export async function getMeta(): Promise<AppMeta> {
  const db = await getDb()
  const row = await db.get('meta', META_KEY)
  if (row) {
    return { onboardingDone: row.onboardingDone, lastOpenedAt: row.lastOpenedAt }
  }
  const fresh: AppMeta = { onboardingDone: false, lastOpenedAt: Date.now() }
  await db.put('meta', { id: META_KEY, ...fresh })
  return fresh
}

export async function setMeta(patch: Partial<AppMeta>): Promise<AppMeta> {
  const db = await getDb()
  const current = await getMeta()
  const next: AppMeta = {
    onboardingDone: patch.onboardingDone ?? current.onboardingDone,
    lastOpenedAt: patch.lastOpenedAt ?? current.lastOpenedAt,
  }
  await db.put('meta', { id: META_KEY, ...next })
  return next
}

export async function listPeople(): Promise<Person[]> {
  const db = await getDb()
  return db.getAll('people')
}

export async function getPerson(id: string): Promise<Person | undefined> {
  const db = await getDb()
  return db.get('people', id)
}

export async function putPerson(person: Person): Promise<void> {
  const db = await getDb()
  await db.put('people', person)
}

export async function createPerson(input: {
  name: string
  desiredDays: number
  notes?: string
  lastContactAt?: number | null
}): Promise<Person> {
  const now = Date.now()
  const person: Person = {
    id: newId(),
    name: input.name.trim(),
    desiredDays: input.desiredDays,
    notes: (input.notes ?? '').trim(),
    lastContactAt: input.lastContactAt ?? null,
    createdAt: now,
    updatedAt: now,
  }
  await putPerson(person)
  return person
}

export async function updatePerson(
  id: string,
  patch: Partial<Pick<Person, 'name' | 'desiredDays' | 'notes' | 'lastContactAt'>>,
): Promise<Person | undefined> {
  const current = await getPerson(id)
  if (!current) return undefined
  const next: Person = {
    ...current,
    ...patch,
    name: patch.name !== undefined ? patch.name.trim() : current.name,
    notes: patch.notes !== undefined ? patch.notes.trim() : current.notes,
    updatedAt: Date.now(),
  }
  await putPerson(next)
  return next
}

export async function logContact(id: string, at: number = Date.now()): Promise<Person | undefined> {
  return updatePerson(id, { lastContactAt: at })
}

export async function deletePerson(id: string): Promise<void> {
  const db = await getDb()
  const tx = db.transaction(['people', 'suggestions'], 'readwrite')
  await tx.objectStore('people').delete(id)
  const all = await tx.objectStore('suggestions').getAll()
  await Promise.all(
    all
      .filter((s) => s.personId === id)
      .map((s) => tx.objectStore('suggestions').delete(s.id)),
  )
  await tx.done
}

export async function listSuggestions(): Promise<Suggestion[]> {
  const db = await getDb()
  return db.getAll('suggestions')
}

export async function listPendingSuggestions(): Promise<Suggestion[]> {
  const db = await getDb()
  const all = await db.getAllFromIndex('suggestions', 'by-status', 'pending')
  return all.sort((a, b) => b.suggestedAt - a.suggestedAt)
}

export async function putSuggestion(suggestion: Suggestion): Promise<void> {
  const db = await getDb()
  await db.put('suggestions', suggestion)
}

export async function createSuggestion(input: {
  personId: string | null
  label: string
  suggestedAt?: number
  source?: SuggestionSource
}): Promise<Suggestion> {
  const suggestion: Suggestion = {
    id: newId(),
    personId: input.personId,
    label: input.label,
    suggestedAt: input.suggestedAt ?? Date.now(),
    status: 'pending',
    source: input.source ?? 'manual',
  }
  await putSuggestion(suggestion)
  return suggestion
}

export async function updateSuggestion(
  id: string,
  patch: Partial<Suggestion>,
): Promise<Suggestion | undefined> {
  const db = await getDb()
  const current = await db.get('suggestions', id)
  if (!current) return undefined
  const next = { ...current, ...patch }
  await db.put('suggestions', next)
  return next
}

export async function updateSuggestionStatus(
  id: string,
  status: SuggestionStatus,
): Promise<Suggestion | undefined> {
  return updateSuggestion(id, { status })
}

export type ExportPayload = {
  exportedAt: number
  people: Person[]
  suggestions: Suggestion[]
  meta: AppMeta
}

export async function exportAll(): Promise<ExportPayload> {
  const [people, suggestions, meta] = await Promise.all([
    listPeople(),
    listSuggestions(),
    getMeta(),
  ])
  return { exportedAt: Date.now(), people, suggestions, meta }
}

export async function deleteAllData(): Promise<void> {
  const db = await getDb()
  const tx = db.transaction(['people', 'suggestions', 'meta'], 'readwrite')
  await Promise.all([
    tx.objectStore('people').clear(),
    tx.objectStore('suggestions').clear(),
    tx.objectStore('meta').clear(),
  ])
  await tx.done
  await db.put('meta', {
    id: META_KEY,
    onboardingDone: true,
    lastOpenedAt: Date.now(),
  })
}

/** Seed three sample people with varied health for demos. */
export async function seedSamplePeople(): Promise<Person[]> {
  const now = Date.now()
  const day = 86_400_000
  const samples: Array<{
    name: string
    desiredDays: number
    notes: string
    lastContactAt: number | null
  }> = [
    {
      name: 'Alex',
      desiredDays: 7,
      notes: 'Sibling — weekend check-ins work best',
      lastContactAt: now - 12 * day,
    },
    {
      name: 'Jordan',
      desiredDays: 14,
      notes: 'College friend',
      lastContactAt: now - 13 * day,
    },
    {
      name: 'Sam',
      desiredDays: 30,
      notes: 'Mentor',
      lastContactAt: now - 10 * day,
    },
  ]

  const created: Person[] = []
  for (const s of samples) {
    created.push(await createPerson(s))
  }
  return created
}
