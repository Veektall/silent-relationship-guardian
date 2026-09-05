import type { Suggestion } from '../db/types'

type Props = {
  suggestion: Suggestion
  personName: string | null
  onYes: () => void
  onNotThem: () => void
  onDismiss: () => void
}

function formatWhen(ms: number): string {
  const hours = (Date.now() - ms) / 3_600_000
  if (hours < 1) return 'just now'
  if (hours < 24) {
    const h = Math.floor(hours)
    return `${h}h ago`
  }
  const d = Math.floor(hours / 24)
  return `${d}d ago`
}

export function ConfirmCard({
  suggestion,
  personName,
  onYes,
  onNotThem,
  onDismiss,
}: Props) {
  const who = personName ?? 'someone'
  const isDemo = suggestion.source === 'demo'
  return (
    <section
      className="confirm-sheet"
      aria-label={isDemo ? 'Practice suggestion' : 'Suggested contact'}
      aria-live="polite"
    >
      <div className="confirm-sheet-inner">
        {isDemo ? (
          <p className="eyebrow">Practice · demo</p>
        ) : (
          <p className="eyebrow">Suggestion</p>
        )}
        <p className="confirm-question">Possible check-in?</p>
        <h2>{who}</h2>
        <p className="muted confirm-meta">
          {isDemo
            ? `Demo — not from your phone · ${formatWhen(suggestion.suggestedAt)}`
            : `${suggestion.label} · ${formatWhen(suggestion.suggestedAt)}`}
        </p>
        <div className="confirm-actions">
          <button type="button" className="btn primary" onClick={onYes} aria-label={`Yes, logged for ${who}`}>
            Yes
          </button>
          <button type="button" className="btn ghost" onClick={onNotThem} aria-label="Not them">
            Not them
          </button>
          <button type="button" className="btn text" onClick={onDismiss} aria-label="Dismiss suggestion">
            Dismiss
          </button>
        </div>
      </div>
    </section>
  )
}
