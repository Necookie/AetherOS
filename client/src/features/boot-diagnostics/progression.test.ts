import { describe, expect, it } from 'vitest'
import { createBootRun, getBootTotalDuration } from './model'
import { getBootSnapshot } from './progression'

describe('boot diagnostics progression', () => {
    it('advances services deterministically through pending, starting, and ready states', () => {
        const services = createBootRun(1)
        const firstDuration = services[0]?.durationMs ?? 0
        const secondDuration = services[1]?.durationMs ?? 0

        const initial = getBootSnapshot(services, 0)
        expect(initial.progressPercent).toBe(0)
        expect(initial.services[0]?.state).toBe('pending')

        const duringFirst = getBootSnapshot(services, Math.floor(firstDuration / 2))
        expect(duringFirst.activeServiceId).toBe(services[0]?.id)
        expect(duringFirst.services[0]?.state).toBe('starting')
        expect(duringFirst.services[1]?.state).toBe('pending')

        const afterFirst = getBootSnapshot(services, firstDuration)
        expect(afterFirst.completedServices).toBe(1)
        expect(afterFirst.services[0]?.state).toBe('ready')
        expect(afterFirst.services[1]?.state).toBe('pending')

        const duringSecond = getBootSnapshot(services, firstDuration + Math.floor(secondDuration / 2))
        expect(duringSecond.activeServiceId).toBe(services[1]?.id)
        expect(duringSecond.services[0]?.state).toBe('ready')
        expect(duringSecond.services[1]?.state).toBe('starting')
    })

    it('reports a stable terminal state with advisory warnings when the run enables them', () => {
        const services = createBootRun(3)
        const totalDurationMs = getBootTotalDuration(services)

        const snapshot = getBootSnapshot(services, totalDurationMs + 500)

        expect(snapshot.completedServices).toBe(services.length)
        expect(snapshot.activeServiceId).toBeNull()
        expect(snapshot.readinessState).toBe('ready-with-warnings')
        expect(snapshot.warningCount).toBe(2)
        expect(snapshot.progressPercent).toBe(100)
        expect(snapshot.services.find((service) => service.id === 'vfs-root')?.state).toBe('warning')
        expect(snapshot.services.find((service) => service.id === 'telemetry-watch')?.state).toBe('warning')
    })

    it('finishes in a clean ready state when the run does not trigger advisories', () => {
        const services = createBootRun(1)
        const totalDurationMs = getBootTotalDuration(services)

        const snapshot = getBootSnapshot(services, totalDurationMs)

        expect(snapshot.readinessState).toBe('ready')
        expect(snapshot.warningCount).toBe(0)
        expect(snapshot.services.every((service) => service.state === 'ready')).toBe(true)
    })
})
