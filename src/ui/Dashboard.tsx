import { useMemo } from 'react'
import type { Person, Suggestion } from '../db/types'
import { formatDaysAgo, healthStatus, sortPeopleByHealth, statusLabel } from '../health'
import { ConfirmCard } from './ConfirmCard'

type Props = {
  people: Person[]
  pending: Suggestion | null
  pendingName: string | null
  onAdd: () => void
  onOpen: (id: string) => void
  onLogContact: (id: string) => void
  onConfirmYes: () => void
  onConfirmNotThem: () => void
  onConfirmDismiss: () => void
  onSettings: () => void
  onSeedDemo: () => void
  seeding?: boolean
}

export function Dashboard({
  people,
  pending,
  pendingName,
  onAdd,
  onOpen,
  onLogContact,
  onConfirmYes,
  onConfirmNotThem,
  onConfirmDismiss,
  onSettings,
  onSeedDemo,
  seeding,
}: Props) {
  const sorted = useMemo(() => sortPeopleByHealth(people), [people])

  return (
    <div className="screen dashboard">
      <header className="topbar">
        <span className="topbar-spacer" aria-hidden />
        <h1>People</h1>
        <div className="topbar-actions">
          <button type="button" className="btn ghost" onClick={onSettings} aria-label="Settings">
            Settings
          </button>
        </div>
      </header>

      {pending ? (
        <ConfirmCard
          suggestion={pending}
          personName={pendingName}
          onYes={onConfirmYes}
          onNotThem={onConfirmNotThem}
          onDismiss={onConfirmDismiss}
        />
      ) : null}

      {sorted.length === 0 ? (
        <div className="empty-state centered">
          <h2>Quiet until useful</h2>
          <p className="muted empty-copy">
            Add a few people you want to stay in touch with. Log when you connect —
            no streaks, no guilt.
          </p>
          <button type="button" className="btn primary" onClick={onAdd}>
            Add someone
          </button>
          <button
            type="button"
            className="btn text"
            onClick={onSeedDemo}
            disabled={seeding}
          >
            {seeding ? 'Adding…' : 'Try with sample people'}
          </button>
        </div>
      ) : (
        <>
          <ul className="person-list" aria-label="People by attention needed">
            {sorted.map((person) => {
              const status = healthStatus(person)
              const initial = person.name.trim().charAt(0).toUpperCase() || '?'
              const days = formatDaysAgo(person)
              return (
                <li key={person.id} className={`person-row health-${status}`}>
                  <button
                    type="button"
                    className="person-main"
                    onClick={() => onOpen(person.id)}
                    aria-label={`${person.name}, ${statusLabel(status)}, ${days}`}
                  >
                    <span className={`avatar status-${status}`} aria-hidden>
                      {initial}
                    </span>
                    <span className="person-meta">
                      <span className="person-name">{person.name}</span>
                      <span className="days-since muted">{days}</span>
                    </span>
                    <span
                      className={`health-chip health-${status}`}
                      title={statusLabel(status)}
                      aria-hidden
                    >
                      <span className={`dot health-${status}`} />
                    </span>
                  </button>
                  <button
                    type="button"
                    className="btn ghost log-btn"
                    onClick={() => onLogContact(person.id)}
                    aria-label={`Logged — ${person.name}`}
                  >
                    Logged
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="fab-bar">
            <button type="button" className="btn primary wide" onClick={onAdd}>
              Add person
            </button>
          </div>
        </>
      )}
    </div>
  )
}
