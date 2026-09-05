import type { Person } from '../db/types'
import { formatDaysAgo, frequencyLabel, healthStatus, statusLabel } from '../health'

type Props = {
  person: Person
  onBack: () => void
  onEdit: () => void
  onLogContact: () => void
  onDelete: () => void
}

export function PersonDetail({
  person,
  onBack,
  onEdit,
  onLogContact,
  onDelete,
}: Props) {
  const status = healthStatus(person)
  const initial = person.name.trim().charAt(0).toUpperCase() || '?'

  return (
    <div className="screen">
      <header className="topbar">
        <button type="button" className="btn ghost" onClick={onBack}>
          Back
        </button>
        <h1>Person</h1>
        <div className="topbar-actions">
          <button type="button" className="btn text" onClick={onEdit} aria-label={`Edit ${person.name}`}>
            Edit
          </button>
        </div>
      </header>

      <div className="detail-card">
        <div className="person-hero">
          <div className={`avatar lg status-${status}`} aria-hidden>
            {initial}
          </div>
          <h2>{person.name}</h2>
          <p
            className={`health-chip label health-${status}`}
            aria-label={statusLabel(status)}
          >
            <span className={`dot health-${status}`} aria-hidden />
            {statusLabel(status)}
          </p>
          <p className="muted person-sub">{frequencyLabel(person.desiredDays)}</p>
        </div>

        <dl className="detail-dl">
          <div>
            <dt>Last contact</dt>
            <dd>{formatDaysAgo(person)}</dd>
          </div>
          {person.notes ? (
            <div className="notes-block">
              <dt>Notes</dt>
              <dd>{person.notes}</dd>
            </div>
          ) : null}
        </dl>

        <div className="stack-actions">
          <button
            type="button"
            className="btn primary wide"
            onClick={onLogContact}
            aria-label={`Logged — ${person.name}`}
          >
            Logged
          </button>
          <button type="button" className="btn danger text wide" onClick={onDelete}>
            Remove person
          </button>
        </div>
      </div>
    </div>
  )
}
