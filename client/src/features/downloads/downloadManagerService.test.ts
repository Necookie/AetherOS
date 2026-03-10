import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createDownloadManagerService } from './downloadManagerService'

describe('downloadManagerService', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('progresses multiple downloads independently to completion', async () => {
        let currentNow = 0
        const events: string[] = []
        const service = createDownloadManagerService({
            now: () => currentNow,
            tickMs: 100,
            publishEvent: (event) => {
                events.push(`${event.type}:${event.item.id}:${event.item.status}:${event.item.receivedBytes}`)
            },
        })

        service.enqueue({
            id: 'dl-a',
            fileName: 'alpha.iso',
            destinationPath: '/home/user/Downloads/alpha.iso',
            totalBytes: 300,
            source: 'browser',
            simulation: {
                queueTicks: 0,
                progressPattern: [120, 120, 120],
            },
        })
        service.enqueue({
            id: 'dl-b',
            fileName: 'beta.zip',
            destinationPath: '/home/user/Downloads/beta.zip',
            totalBytes: 250,
            source: 'browser',
            simulation: {
                queueTicks: 1,
                progressPattern: [90, 90, 90],
            },
        })

        service.start()

        currentNow = 100
        await vi.advanceTimersByTimeAsync(100)
        let snapshot = service.getSnapshot()
        expect(snapshot.activeCount).toBe(1)
        expect(snapshot.items.find((item) => item.id === 'dl-a')?.status).toBe('downloading')
        expect(snapshot.items.find((item) => item.id === 'dl-b')?.status).toBe('queued')

        currentNow = 200
        await vi.advanceTimersByTimeAsync(100)
        currentNow = 300
        await vi.advanceTimersByTimeAsync(100)
        currentNow = 400
        await vi.advanceTimersByTimeAsync(100)
        currentNow = 500
        await vi.advanceTimersByTimeAsync(100)

        snapshot = service.getSnapshot()
        expect(snapshot.completedCount).toBe(2)
        expect(snapshot.items.every((item) => item.status === 'complete')).toBe(true)
        expect(events).toContain('completed:dl-a:complete:300')
        expect(events).toContain('completed:dl-b:complete:250')
    })

    it('fails predictably and retries from the start', async () => {
        let currentNow = 0
        const notifications = vi.fn()
        const service = createDownloadManagerService({
            now: () => currentNow,
            tickMs: 100,
            publishNotification: notifications,
        })

        service.enqueue({
            id: 'dl-fail',
            fileName: 'archive.tar',
            destinationPath: '/home/user/Downloads/archive.tar',
            totalBytes: 280,
            source: 'system',
            maxRetries: 1,
            simulation: {
                queueTicks: 0,
                progressPattern: [100, 100, 100],
                failAtStepByAttempt: {
                    1: 2,
                },
            },
        })

        service.start()

        currentNow = 100
        await vi.advanceTimersByTimeAsync(100)
        currentNow = 200
        await vi.advanceTimersByTimeAsync(100)
        currentNow = 300
        await vi.advanceTimersByTimeAsync(100)

        let snapshot = service.getSnapshot()
        expect(snapshot.items[0].status).toBe('failed')
        expect(snapshot.items[0].receivedBytes).toBe(100)

        expect(service.retry('dl-fail')).toBe(true)

        snapshot = service.getSnapshot()
        expect(snapshot.items[0].status).toBe('queued')
        expect(snapshot.items[0].receivedBytes).toBe(0)
        expect(snapshot.items[0].attemptCount).toBe(2)

        currentNow = 400
        await vi.advanceTimersByTimeAsync(100)
        currentNow = 500
        await vi.advanceTimersByTimeAsync(100)
        currentNow = 600
        await vi.advanceTimersByTimeAsync(100)
        currentNow = 700
        await vi.advanceTimersByTimeAsync(100)

        snapshot = service.getSnapshot()
        expect(snapshot.items[0].status).toBe('complete')
        expect(snapshot.items[0].receivedBytes).toBe(280)
        expect(notifications).toHaveBeenCalled()
    })

    it('marks the download as failed when file materialization throws', async () => {
        let currentNow = 0
        const service = createDownloadManagerService({
            now: () => currentNow,
            tickMs: 100,
            materializeFile: () => {
                throw new Error('Downloads directory is unavailable.')
            },
        })

        service.enqueue({
            id: 'dl-write-fail',
            fileName: 'broken.zip',
            destinationPath: '/home/user/Downloads/broken.zip',
            totalBytes: 100,
            source: 'browser',
            simulation: {
                queueTicks: 0,
                progressPattern: [100],
            },
        })

        service.start()

        currentNow = 100
        await vi.advanceTimersByTimeAsync(100)
        currentNow = 200
        await vi.advanceTimersByTimeAsync(100)

        const snapshot = service.getSnapshot()
        expect(snapshot.failedCount).toBe(1)
        expect(snapshot.items[0].status).toBe('failed')
        expect(snapshot.items[0].errorMessage).toBe('Downloads directory is unavailable.')
    })
})
