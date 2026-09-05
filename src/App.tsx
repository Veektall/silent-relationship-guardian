import { useCallback, useEffect, useRef, useState } from "react"
import {
  createPerson,
  deleteAllData,
  deletePerson,
  exportAll,
  getMeta,
  getPerson,
  listPeople,
  logContact,
  seedSamplePeople,
  setMeta,
  updatePerson,
} from "./db"
import type { Person, Suggestion } from "./db/types"
import {
  confirmSuggestion,
  dismissSuggestion,
  getNextPendingSuggestion,
  rejectSuggestion,
  resolvePersonName,
  seedDemoSuggestions,
} from "./suggestions"
import { Dashboard } from "./ui/Dashboard"
import { PersonDetail } from "./ui/PersonDetail"
import { PersonForm } from "./ui/PersonForm"
import { Settings } from "./ui/Settings"

type View =
  | { name: "loading" }
  | { name: "dashboard" }
  | { name: "add" }
  | { name: "edit"; personId: string }
  | { name: "detail"; personId: string }
  | { name: "settings" }

export default function App() {
  const [view, setView] = useState<View>({ name: "loading" })
  const [people, setPeople] = useState<Person[]>([])
  const [detailPerson, setDetailPerson] = useState<Person | null>(null)
  const [editPerson, setEditPerson] = useState<Person | null>(null)
  const [pending, setPending] = useState<Suggestion | null>(null)
  const [pendingName, setPendingName] = useState<string | null>(null)
  const [seeding, setSeeding] = useState(false)
  const [toast, setToast] = useState<{ message: string; undo?: () => void } | null>(null)
  const toastTimer = useRef<number | null>(null)
  const loggingIds = useRef(new Set<string>())
  const confirmBusy = useRef(false)
  const viewRef = useRef(view)
  viewRef.current = view

  const clearToast = useCallback(() => {
    if (toastTimer.current != null) {
      window.clearTimeout(toastTimer.current)
      toastTimer.current = null
    }
    setToast(null)
  }, [])

  const showToast = useCallback(
    (next: { message: string; undo?: () => void }, ms = 1500) => {
      clearToast()
      setToast(next)
      toastTimer.current = window.setTimeout(() => {
        setToast(null)
        toastTimer.current = null
      }, ms)
    },
    [clearToast],
  )

  const refresh = useCallback(async () => {
    const list = await listPeople()
    setPeople(list)
    const next = await getNextPendingSuggestion()
    setPending(next)
    setPendingName(next ? await resolvePersonName(next) : null)
  }, [])

  const syncDetailIfOpen = useCallback(async (id: string) => {
    const current = viewRef.current
    if (current.name === "detail" && current.personId === id) {
      const p = await getPerson(id)
      if (p) setDetailPerson(p)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      await getMeta()
      // Silent first-run: no onboarding wall (Product/Design/Privacy/Testing P0).
      await setMeta({ onboardingDone: true, lastOpenedAt: Date.now() })
      await refresh()
      if (cancelled) return
      setView({ name: "dashboard" })
    })().catch((err) => {
      console.error(err)
      if (!cancelled) setView({ name: "dashboard" })
    })
    return () => {
      cancelled = true
    }
  }, [refresh])

  useEffect(() => {
    if (view.name !== "detail") {
      setDetailPerson(null)
      return
    }
    let cancelled = false
    getPerson(view.personId).then((p) => {
      if (!cancelled) {
        if (p) setDetailPerson(p)
        else setView({ name: "dashboard" })
      }
    })
    return () => {
      cancelled = true
    }
  }, [view])

  useEffect(() => {
    if (view.name !== "edit") {
      setEditPerson(null)
      return
    }
    let cancelled = false
    getPerson(view.personId).then((p) => {
      if (!cancelled) {
        if (p) setEditPerson(p)
        else setView({ name: "dashboard" })
      }
    })
    return () => {
      cancelled = true
    }
  }, [view])

  const handleLog = useCallback(
    async (id: string) => {
      if (loggingIds.current.has(id)) return
      loggingIds.current.add(id)
      try {
        const before = await getPerson(id)
        const previous = before?.lastContactAt ?? null
        await logContact(id)
        await refresh()
        await syncDetailIfOpen(id)
        showToast(
          {
            message: "Logged",
            undo: async () => {
              await updatePerson(id, { lastContactAt: previous })
              await refresh()
              await syncDetailIfOpen(id)
              clearToast()
            },
          },
          2000,
        )
      } finally {
        loggingIds.current.delete(id)
      }
    },
    [refresh, syncDetailIfOpen, showToast, clearToast],
  )

  const handleSeedDemo = useCallback(async () => {
    if (seeding) return
    setSeeding(true)
    try {
      let list = await listPeople()
      if (list.length === 0) {
        list = await seedSamplePeople()
      }
      await seedDemoSuggestions(list)
      await refresh()
    } finally {
      setSeeding(false)
    }
  }, [seeding, refresh])

  const handleExport = useCallback(async () => {
    const ok = window.confirm(
      "Export includes names and private notes. Download a private JSON backup to this device?",
    )
    if (!ok) return
    const payload = await exportAll()
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `srg-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  const handleDeleteAll = useCallback(async () => {
    const ok = window.confirm(
      "Remove everyone and all suggestions from this device? This cannot be undone.",
    )
    if (!ok) return
    clearToast()
    await deleteAllData()
    await refresh()
    setDetailPerson(null)
    setEditPerson(null)
    setView({ name: "dashboard" })
  }, [clearToast, refresh])

  const handleConfirmYes = useCallback(async () => {
    if (!pending || confirmBusy.current) return
    confirmBusy.current = true
    try {
      await confirmSuggestion(pending)
      await refresh()
      showToast({ message: "Logged" }, 1500)
    } finally {
      confirmBusy.current = false
    }
  }, [pending, refresh, showToast])

  const handleConfirmNotThem = useCallback(async () => {
    if (!pending || confirmBusy.current) return
    confirmBusy.current = true
    try {
      await rejectSuggestion(pending.id)
      await refresh()
    } finally {
      confirmBusy.current = false
    }
  }, [pending, refresh])

  const handleConfirmDismiss = useCallback(async () => {
    if (!pending || confirmBusy.current) return
    confirmBusy.current = true
    try {
      await dismissSuggestion(pending.id)
      await refresh()
    } finally {
      confirmBusy.current = false
    }
  }, [pending, refresh])

  const toastEl = toast ? (
    <div className="toast" role="status" aria-live="polite">
      <span>{toast.message}</span>
      {toast.undo ? (
        <button type="button" onClick={() => { void toast.undo?.() }}>
          Undo
        </button>
      ) : null}
    </div>
  ) : null

  if (view.name === "loading") {
    return (
      <div className="app-shell">
        <div className="screen loading">
          <p className="muted">Loading…</p>
        </div>
      </div>
    )
  }

  if (view.name === "add") {
    return (
      <div className="app-shell">
        <PersonForm
          title="Add person"
          submitLabel="Save"
          onCancel={() => setView({ name: "dashboard" })}
          onSubmit={async (data) => {
            await createPerson(data)
            await refresh()
            setView({ name: "dashboard" })
          }}
        />
      </div>
    )
  }

  if (view.name === "edit") {
    if (!editPerson) {
      return (
        <div className="app-shell">
          <div className="screen loading">
            <p className="muted">Loading…</p>
          </div>
        </div>
      )
    }
    return (
      <div className="app-shell">
        <PersonForm
          initial={editPerson}
          title="Edit person"
          submitLabel="Save changes"
          onCancel={() => setView({ name: "detail", personId: editPerson.id })}
          onSubmit={async (data) => {
            await updatePerson(editPerson.id, data)
            await refresh()
            setView({ name: "detail", personId: editPerson.id })
          }}
        />
      </div>
    )
  }

  if (view.name === "detail") {
    if (!detailPerson) {
      return (
        <div className="app-shell">
          <div className="screen loading">
            <p className="muted">Loading…</p>
          </div>
        </div>
      )
    }
    return (
      <div className="app-shell">
        <PersonDetail
          person={detailPerson}
          onBack={() => setView({ name: "dashboard" })}
          onEdit={() => setView({ name: "edit", personId: detailPerson.id })}
          onLogContact={() => { void handleLog(detailPerson.id) }}
          onDelete={async () => {
            const ok = window.confirm(`Remove ${detailPerson.name} from your list?`)
            if (!ok) return
            clearToast()
            await deletePerson(detailPerson.id)
            await refresh()
            setView({ name: "dashboard" })
          }}
        />
        {toastEl}
      </div>
    )
  }

  if (view.name === "settings") {
    return (
      <div className="app-shell">
        <Settings
          onBack={() => setView({ name: "dashboard" })}
          onExport={() => { void handleExport() }}
          onDeleteAll={() => { void handleDeleteAll() }}
          onSeedDemo={() => { void handleSeedDemo() }}
          seeding={seeding}
        />
      </div>
    )
  }

  return (
    <div className="app-shell">
      <Dashboard
        people={people}
        pending={pending}
        pendingName={pendingName}
        seeding={seeding}
        onAdd={() => setView({ name: "add" })}
        onOpen={(id) => setView({ name: "detail", personId: id })}
        onLogContact={(id) => { void handleLog(id) }}
        onSettings={() => setView({ name: "settings" })}
        onSeedDemo={() => { void handleSeedDemo() }}
        onConfirmYes={() => { void handleConfirmYes() }}
        onConfirmNotThem={() => { void handleConfirmNotThem() }}
        onConfirmDismiss={() => { void handleConfirmDismiss() }}
      />
      {toastEl}
    </div>
  )
}
