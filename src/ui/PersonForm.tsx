import { useId, useState } from 'react'
import { FREQUENCY_PRESETS, type FrequencyPreset, type Person } from '../db/types'

type Props = {
  initial?: Person | null
  title: string
  submitLabel: string
  onSubmit: (data: { name: string; desiredDays: number; notes: string }) => void | Promise<void>
  onCancel: () => void
}

function presetFromDays(days: number): FrequencyPreset {
  if (days === 7) return 'weekly'
  if (days === 14) return 'biweekly'
  if (days === 30) return 'monthly'
  return 'custom'
}

const MIN_CUSTOM = 1
const MAX_CUSTOM = 365

export function PersonForm({ initial, title, submitLabel, onSubmit, onCancel }: Props) {
  const nameId = useId()
  const customId = useId()
  const errorId = useId()
  const [name, setName] = useState(initial?.name ?? '')
  const [preset, setPreset] = useState<FrequencyPreset>(
    initial ? presetFromDays(initial.desiredDays) : 'weekly',
  )
  const [customDays, setCustomDays] = useState(
    initial && presetFromDays(initial.desiredDays) === 'custom'
      ? String(initial.desiredDays)
      : '10',
  )
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (saving) return
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Add a name to continue')
      return
    }

    let desiredDays: number
    if (preset === 'custom') {
      const n = Number.parseInt(customDays, 10)
      if (!Number.isFinite(n) || n < MIN_CUSTOM || n > MAX_CUSTOM) {
        setError(`Custom days must be between ${MIN_CUSTOM} and ${MAX_CUSTOM}`)
        return
      }
      desiredDays = n
    } else {
      desiredDays = FREQUENCY_PRESETS[preset]
    }

    setSaving(true)
    setError(null)
    try {
      await onSubmit({
        name: trimmed,
        desiredDays,
        notes: notes.trim(),
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="screen">
      <header className="topbar">
        <button type="button" className="btn ghost" onClick={onCancel}>
          Back
        </button>
        <h1>{title}</h1>
        <span className="topbar-spacer" aria-hidden />
      </header>

      <form className="form" onSubmit={handleSubmit} noValidate>
        <label className="field" htmlFor={nameId}>
          <span>Name</span>
          <input
            id={nameId}
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (error) setError(null)
            }}
            placeholder="Who matters"
            autoComplete="name"
            autoFocus
            aria-invalid={error?.includes('name') ? true : undefined}
            aria-describedby={error ? errorId : undefined}
          />
        </label>

        <fieldset className="field">
          <legend>Cadence</legend>
          <div className="chip-row" role="group" aria-label="Cadence">
            {(
              [
                ['weekly', 'Weekly'],
                ['biweekly', 'Every 2 weeks'],
                ['monthly', 'Monthly'],
                ['custom', 'Custom'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={`chip ${preset === value ? 'active' : ''}`}
                aria-pressed={preset === value}
                onClick={() => {
                  setPreset(value)
                  if (error) setError(null)
                }}
              >
                {label}
              </button>
            ))}
          </div>
          {preset === 'custom' ? (
            <label className="field nested" htmlFor={customId}>
              <span>Every how many days?</span>
              <input
                id={customId}
                type="number"
                inputMode="numeric"
                min={MIN_CUSTOM}
                max={MAX_CUSTOM}
                value={customDays}
                onChange={(e) => {
                  setCustomDays(e.target.value)
                  if (error) setError(null)
                }}
                aria-describedby={error ? errorId : undefined}
              />
            </label>
          ) : null}
        </fieldset>

        <label className="field">
          <span>Notes (optional)</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Skip anytime"
          />
        </label>

        {error ? (
          <p id={errorId} className="error" role="alert" aria-live="assertive">
            {error}
          </p>
        ) : null}

        <button type="submit" className="btn primary wide" disabled={saving}>
          {saving ? 'Saving…' : submitLabel}
        </button>
      </form>
    </div>
  )
}
