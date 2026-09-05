type Props = {
  onBack: () => void
  onExport: () => void
  onDeleteAll: () => void
  onSeedDemo?: () => void
  seeding?: boolean
}

export function Settings({
  onBack,
  onExport,
  onDeleteAll,
  onSeedDemo,
  seeding,
}: Props) {
  return (
    <div className="screen">
      <header className="topbar">
        <button type="button" className="btn ghost" onClick={onBack}>
          Back
        </button>
        <h1>Settings</h1>
        <span className="topbar-spacer" aria-hidden />
      </header>

      <section className="detail-card settings-block" aria-labelledby="privacy-heading">
        <h2 id="privacy-heading">Privacy</h2>
        <p className="muted">
          Your people, notes, and contact history stay on this device only
          (IndexedDB in your browser). There is no account, no analytics, and no
          cloud sync — nothing is uploaded. Clearing site data in your browser
          removes everything unless you exported a backup first.
        </p>
      </section>

      <section className="detail-card settings-block" aria-labelledby="data-heading">
        <h2 id="data-heading">Your data</h2>
        <div className="stack-actions">
          <button type="button" className="btn ghost wide" onClick={onExport}>
            Export JSON
          </button>
          <p className="muted hint">
            This file may include names and private notes — treat it as a private
            backup — do not share it.
          </p>
          {onSeedDemo ? (
            <>
              <button
                type="button"
                className="btn text wide"
                onClick={onSeedDemo}
                disabled={seeding}
              >
                {seeding ? 'Adding…' : 'Add sample people / suggestion'}
              </button>
              <p className="muted hint">
                Sample people and practice suggestions are demo only — not from
                your phone or calendar.
              </p>
            </>
          ) : null}
          <button type="button" className="btn danger text wide" onClick={onDeleteAll}>
            Delete all data
          </button>
        </div>
      </section>
    </div>
  )
}
