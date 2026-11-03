import { useCallback, useEffect, useState } from 'react'
import { loadMarket } from '../market/loadMarket.ts'
import { buildCards } from '../ui/dashboardModel.ts'
import { Dashboard, type DashboardStatus } from '../ui/Dashboard.tsx'

export default function App() {
  const [attempt, setAttempt] = useState(0)
  const [status, setStatus] = useState<DashboardStatus>({ kind: 'loading' })
  const offline = typeof navigator !== 'undefined' && navigator.onLine === false

  const retry = useCallback(() => {
    setStatus({ kind: 'loading' })
    setAttempt((value) => value + 1)
  }, [])

  useEffect(() => {
    if (offline) return
    let cancelled = false
    loadMarket()
      .then((readings) => {
        if (cancelled) return
        setStatus(readings.length === 0 ? { kind: 'empty' } : { kind: 'ready', cards: buildCards(readings) })
      })
      .catch(() => {
        if (!cancelled) setStatus({ kind: 'error' })
      })
    return () => {
      cancelled = true
    }
  }, [attempt, offline])

  const shown = offline && status.kind === 'loading' ? { kind: 'offline' as const } : status
  return <Dashboard status={shown} onRetry={retry} />
}
