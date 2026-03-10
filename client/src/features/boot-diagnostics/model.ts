import type { BootServiceDefinition, BootServiceRuntime } from './types'

export const BOOT_TICK_MS = 80
export const BOOT_HANDOFF_MS = 180

const BASE_BOOT_SERVICES: BootServiceDefinition[] = [
    {
        id: 'kernel-bus',
        label: 'Kernel bus',
        detail: 'Negotiating scheduler and device graph',
        durationMs: 260,
    },
    {
        id: 'memory-fabric',
        label: 'Memory fabric',
        detail: 'Seeding cache windows and reclaim tables',
        durationMs: 340,
    },
    {
        id: 'vfs-root',
        label: 'VFS root',
        detail: 'Mounting workspace volumes and journal replay',
        durationMs: 420,
        warning: {
            code: 'WARN-14',
            message: 'Journal replay exceeded warm cache budget. Continuing with local snapshot.',
            cadence: 3,
        },
    },
    {
        id: 'shell-compositor',
        label: 'Shell compositor',
        detail: 'Preparing desktop surfaces and focus channels',
        durationMs: 360,
    },
    {
        id: 'session-broker',
        label: 'Session broker',
        detail: 'Binding profile vault and lock screen policy',
        durationMs: 320,
    },
    {
        id: 'telemetry-watch',
        label: 'Telemetry watch',
        detail: 'Verifying health probes and advisory lanes',
        durationMs: 280,
        warning: {
            code: 'WARN-22',
            message: 'Telemetry relay is in advisory mode. Metrics will backfill after sign-in.',
            cadence: 5,
            offset: 2,
        },
    },
]

export function createBootRun(runId: number): BootServiceRuntime[] {
    return BASE_BOOT_SERVICES.map((service) => ({
        ...service,
        warningActive: shouldActivateWarning(runId, service),
    }))
}

export function getBootRunId(storage?: Storage | null): number {
    if (!storage) {
        return 1
    }

    const key = 'aether.bootRunId'
    const rawValue = storage.getItem(key)
    const previousValue = rawValue ? Number.parseInt(rawValue, 10) : 0
    const safeValue = Number.isFinite(previousValue) && previousValue > 0 ? previousValue : 0
    const nextValue = safeValue + 1

    storage.setItem(key, String(nextValue))

    return nextValue
}

export function getBootTotalDuration(services: BootServiceRuntime[]): number {
    return services.reduce((total, service) => total + service.durationMs, 0)
}

function shouldActivateWarning(runId: number, service: BootServiceDefinition): boolean {
    if (!service.warning) {
        return false
    }

    const offset = service.warning.offset ?? 0
    return (runId + offset) % service.warning.cadence === 0
}
