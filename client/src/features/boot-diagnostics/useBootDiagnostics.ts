import { useEffect, useMemo, useRef, useState } from 'react'
import { BOOT_HANDOFF_MS, BOOT_TICK_MS, createBootRun, getBootRunId, getBootTotalDuration } from './model'
import { getBootSnapshot } from './progression'
import type { BootSnapshot } from './types'

interface UseBootDiagnosticsOptions {
    onComplete: () => void
}

export function useBootDiagnostics({ onComplete }: UseBootDiagnosticsOptions): BootSnapshot {
    const [runId] = useState(() => getBootRunId(getStorage()))
    const [elapsedMs, setElapsedMs] = useState(0)
    const onCompleteCalledRef = useRef(false)
    const services = useMemo(() => createBootRun(runId), [runId])
    const totalDurationMs = useMemo(() => getBootTotalDuration(services), [services])
    const snapshot = useMemo(() => getBootSnapshot(services, elapsedMs), [elapsedMs, services])

    useEffect(() => {
        if (typeof window === 'undefined') {
            setElapsedMs(totalDurationMs)
            return
        }

        const startedAt = window.performance.now()
        const intervalId = window.setInterval(() => {
            const nextElapsed = Math.round(window.performance.now() - startedAt)
            setElapsedMs(Math.min(nextElapsed, totalDurationMs))
        }, BOOT_TICK_MS)

        return () => {
            window.clearInterval(intervalId)
        }
    }, [totalDurationMs])

    useEffect(() => {
        if (snapshot.readinessState === 'booting' || onCompleteCalledRef.current) {
            return
        }

        onCompleteCalledRef.current = true
        const timeoutId = window.setTimeout(() => {
            onComplete()
        }, BOOT_HANDOFF_MS)

        return () => {
            window.clearTimeout(timeoutId)
        }
    }, [onComplete, snapshot.readinessState])

    return snapshot
}

function getStorage(): Storage | null {
    if (typeof window === 'undefined') {
        return null
    }

    try {
        return window.sessionStorage
    } catch {
        return null
    }
}
