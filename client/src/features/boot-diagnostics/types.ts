export type BootServiceState = 'pending' | 'starting' | 'ready' | 'warning'

export interface BootWarningDefinition {
    code: string
    message: string
    cadence: number
    offset?: number
}

export interface BootServiceDefinition {
    id: string
    label: string
    detail: string
    durationMs: number
    warning?: BootWarningDefinition
}

export interface BootServiceRuntime extends BootServiceDefinition {
    warningActive: boolean
}

export interface BootServiceSnapshot extends BootServiceRuntime {
    elapsedMs: number
    state: BootServiceState
}

export type BootReadinessState = 'booting' | 'ready' | 'ready-with-warnings'

export interface BootSnapshot {
    activeServiceId: string | null
    completedServices: number
    progressPercent: number
    readinessState: BootReadinessState
    services: BootServiceSnapshot[]
    totalDurationMs: number
    totalElapsedMs: number
    warningCount: number
}
