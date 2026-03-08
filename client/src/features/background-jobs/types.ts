export interface BackgroundJobContext {
    now: number
    previousRunAt: number | null
    signal: AbortSignal
}

export interface BackgroundJobDefinition {
    id: string
    intervalMs: number
    runImmediately?: boolean
    task: (context: BackgroundJobContext) => void | Promise<void>
}

export interface BackgroundJobStatus {
    id: string
    intervalMs: number
    nextRunAt: number
    previousRunAt: number | null
    isRunning: boolean
    runCount: number
    errorCount: number
    lastError: string | null
}

export interface BackgroundSchedulerSnapshot {
    isRunning: boolean
    jobs: BackgroundJobStatus[]
}

export interface BackgroundJobScheduler {
    register: (job: BackgroundJobDefinition) => void
    unregister: (jobId: string) => void
    start: () => void
    stop: () => void
    getSnapshot: () => BackgroundSchedulerSnapshot
    subscribe: (listener: () => void) => () => void
}
