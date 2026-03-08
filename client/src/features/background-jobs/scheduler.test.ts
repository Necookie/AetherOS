import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createBackgroundJobScheduler } from './scheduler'

describe('background job scheduler', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('runs periodic jobs and stops cleanly', async () => {
        const scheduler = createBackgroundJobScheduler({ tickMs: 20 })
        const task = vi.fn()

        scheduler.register({
            id: 'heartbeat',
            intervalMs: 80,
            runImmediately: true,
            task,
        })

        scheduler.start()
        await vi.advanceTimersByTimeAsync(260)

        expect(task).toHaveBeenCalledTimes(3)
        expect(scheduler.getSnapshot().isRunning).toBe(true)

        scheduler.stop()
        await vi.advanceTimersByTimeAsync(200)
        expect(task).toHaveBeenCalledTimes(3)
        expect(scheduler.getSnapshot().isRunning).toBe(false)
    })

    it('aborts running job when unregistered', async () => {
        const scheduler = createBackgroundJobScheduler({ tickMs: 20 })
        const aborted = vi.fn()

        scheduler.register({
            id: 'slow-job',
            intervalMs: 200,
            runImmediately: true,
            task: ({ signal }) => new Promise<void>((_, reject) => {
                signal.addEventListener('abort', () => {
                    aborted()
                    reject({ name: 'AbortError' })
                }, { once: true })
            }),
        })

        scheduler.start()
        await vi.advanceTimersByTimeAsync(30)
        scheduler.unregister('slow-job')
        await vi.advanceTimersByTimeAsync(10)

        expect(aborted).toHaveBeenCalledTimes(1)
        expect(scheduler.getSnapshot().jobs).toHaveLength(0)
    })
})
