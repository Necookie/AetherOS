import { getBootTotalDuration } from './model'
import type { BootServiceRuntime, BootSnapshot } from './types'

export function getBootSnapshot(services: BootServiceRuntime[], elapsedMs: number): BootSnapshot {
    const totalDurationMs = getBootTotalDuration(services)
    const totalElapsedMs = clamp(elapsedMs, 0, totalDurationMs)
    let remainingMs = totalElapsedMs
    let activeServiceId: string | null = null
    let completedServices = 0
    let warningCount = 0

    const snapshots = services.map((service) => {
        if (remainingMs <= 0) {
            return {
                ...service,
                elapsedMs: 0,
                state: 'pending' as const,
            }
        }

        if (remainingMs < service.durationMs) {
            activeServiceId = service.id
            const elapsedWithinService = remainingMs
            remainingMs = 0

            return {
                ...service,
                elapsedMs: elapsedWithinService,
                state: 'starting' as const,
            }
        }

        remainingMs -= service.durationMs
        completedServices += 1

        if (service.warningActive) {
            warningCount += 1
        }

        return {
            ...service,
            elapsedMs: service.durationMs,
            state: service.warningActive ? ('warning' as const) : ('ready' as const),
        }
    })

    const readinessState =
        totalElapsedMs < totalDurationMs ? 'booting' : warningCount > 0 ? 'ready-with-warnings' : 'ready'

    return {
        activeServiceId,
        completedServices,
        progressPercent: totalDurationMs === 0 ? 100 : Math.round((totalElapsedMs / totalDurationMs) * 100),
        readinessState,
        services: snapshots,
        totalDurationMs,
        totalElapsedMs,
        warningCount,
    }
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max)
}
