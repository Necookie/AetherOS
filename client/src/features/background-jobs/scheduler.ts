import type {
    BackgroundJobDefinition,
    BackgroundJobScheduler,
    BackgroundJobStatus,
    BackgroundSchedulerSnapshot,
} from './types'

interface SchedulerOptions {
    now?: () => number
    tickMs?: number
}

interface JobRuntime {
    definition: BackgroundJobDefinition
    status: BackgroundJobStatus
    abortController: AbortController | null
}

type Listener = () => void
type TimerHandle = ReturnType<typeof globalThis.setInterval>

function isAbortError(error: unknown) {
    return typeof error === 'object'
        && error !== null
        && 'name' in error
        && (error as { name: string }).name === 'AbortError'
}

export function createBackgroundJobScheduler(options: SchedulerOptions = {}): BackgroundJobScheduler {
    const now = options.now ?? Date.now
    const tickMs = options.tickMs ?? 250
    const jobs = new Map<string, JobRuntime>()
    const listeners = new Set<Listener>()
    let intervalId: TimerHandle | null = null

    const emit = () => {
        listeners.forEach((listener) => listener())
    }

    const isActive = () => intervalId !== null

    const runJob = async (runtime: JobRuntime) => {
        const startedAt = now()
        runtime.abortController = new AbortController()
        runtime.status.isRunning = true
        emit()

        try {
            await runtime.definition.task({
                now: startedAt,
                previousRunAt: runtime.status.previousRunAt,
                signal: runtime.abortController.signal,
            })
        } catch (error) {
            if (!isAbortError(error)) {
                runtime.status.errorCount += 1
                runtime.status.lastError = error instanceof Error ? error.message : String(error)
            }
        } finally {
            runtime.abortController = null
            runtime.status.isRunning = false
            runtime.status.runCount += 1
            runtime.status.previousRunAt = startedAt
            runtime.status.nextRunAt = startedAt + runtime.status.intervalMs
            emit()
        }
    }

    const tick = () => {
        const currentNow = now()

        for (const runtime of jobs.values()) {
            if (runtime.status.isRunning) {
                continue
            }

            if (runtime.status.nextRunAt > currentNow) {
                continue
            }

            void runJob(runtime)
        }
    }

    return {
        register: (job) => {
            if (jobs.has(job.id)) {
                jobs.delete(job.id)
            }

            const currentNow = now()
            jobs.set(job.id, {
                definition: job,
                abortController: null,
                status: {
                    id: job.id,
                    intervalMs: Math.max(100, job.intervalMs),
                    nextRunAt: job.runImmediately ? currentNow : currentNow + Math.max(100, job.intervalMs),
                    previousRunAt: null,
                    isRunning: false,
                    runCount: 0,
                    errorCount: 0,
                    lastError: null,
                },
            })

            emit()
            if (isActive()) {
                tick()
            }
        },
        unregister: (jobId) => {
            const runtime = jobs.get(jobId)
            if (!runtime) {
                return
            }

            runtime.abortController?.abort()
            jobs.delete(jobId)
            emit()
        },
        start: () => {
            if (isActive()) {
                return
            }

            intervalId = globalThis.setInterval(tick, tickMs)
            tick()
            emit()
        },
        stop: () => {
            if (intervalId !== null) {
                globalThis.clearInterval(intervalId)
                intervalId = null
            }

            for (const runtime of jobs.values()) {
                runtime.abortController?.abort()
                runtime.abortController = null
                runtime.status.isRunning = false
            }

            emit()
        },
        getSnapshot: () => ({
            isRunning: isActive(),
            jobs: [...jobs.values()]
                .map((runtime) => ({ ...runtime.status }))
                .sort((left, right) => left.id.localeCompare(right.id)),
        }) satisfies BackgroundSchedulerSnapshot,
        subscribe: (listener) => {
            listeners.add(listener)
            return () => listeners.delete(listener)
        },
    }
}
