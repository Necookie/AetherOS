import type { CreateNotificationInput } from '../notifications/types'
import type {
    DownloadItem,
    DownloadManagerEvent,
    DownloadManagerService,
    DownloadManagerSnapshot,
    DownloadSimulationProfile,
} from './types'

interface DownloadRuntime {
    profile: Required<DownloadSimulationProfile>
    queueTicksRemaining: number
    stepIndex: number
}

interface DownloadManagerOptions {
    now?: () => number
    tickMs?: number
    publishNotification?: (notification: CreateNotificationInput) => string
    publishEvent?: (event: DownloadManagerEvent) => void
}

type Listener = () => void
type IntervalHandle = ReturnType<typeof globalThis.setInterval>

const DEFAULT_PATTERN = [72_000, 88_000, 96_000, 104_000, 112_000, 120_000]

function cloneItem(item: DownloadItem): DownloadItem {
    return { ...item }
}

function createSnapshot(items: DownloadItem[]): DownloadManagerSnapshot {
    return {
        items: items.map(cloneItem),
        activeCount: items.filter((item) => item.status === 'downloading').length,
        queuedCount: items.filter((item) => item.status === 'queued').length,
        failedCount: items.filter((item) => item.status === 'failed').length,
        completedCount: items.filter((item) => item.status === 'complete').length,
    }
}

function normalizeProfile(simulation?: DownloadSimulationProfile): Required<DownloadSimulationProfile> {
    return {
        queueTicks: Math.max(0, simulation?.queueTicks ?? 1),
        progressPattern: simulation?.progressPattern?.length ? [...simulation.progressPattern] : [...DEFAULT_PATTERN],
        failAtStepByAttempt: { ...(simulation?.failAtStepByAttempt ?? {}) },
    }
}

function canRetry(item: DownloadItem) {
    return item.attemptCount - 1 < item.maxRetries
}

function formatBytes(value: number) {
    if (value >= 1_000_000_000) {
        return `${(value / 1_000_000_000).toFixed(1)} GB`
    }
    if (value >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(1)} MB`
    }
    if (value >= 1_000) {
        return `${(value / 1_000).toFixed(1)} KB`
    }
    return `${value} B`
}

export function createDownloadManagerService(options: DownloadManagerOptions = {}): DownloadManagerService {
    const now = options.now ?? Date.now
    const tickMs = options.tickMs ?? 550
    const listeners = new Set<Listener>()
    const runtimeById = new Map<string, DownloadRuntime>()
    const publishNotification = options.publishNotification
    const publishEvent = options.publishEvent
    let idCounter = 0
    let intervalId: IntervalHandle | null = null
    let items: DownloadItem[] = []
    let snapshot = createSnapshot(items)

    const emit = () => {
        snapshot = createSnapshot(items)
        listeners.forEach((listener) => listener())
    }

    const updateItem = (id: string, updater: (item: DownloadItem) => DownloadItem) => {
        let didUpdate = false
        items = items.map((item) => {
            if (item.id !== id) {
                return item
            }

            didUpdate = true
            return updater(item)
        })
        return didUpdate
    }

    const getItem = (id: string) => items.find((item) => item.id === id)

    let service: DownloadManagerService

    const publish = (event: DownloadManagerEvent) => {
        publishEvent?.({
            ...event,
            item: cloneItem(event.item),
        })

        if (!publishNotification) {
            return
        }

        if (event.type === 'completed') {
            publishNotification({
                title: 'Download complete',
                message: `${event.item.fileName} is ready in ${event.item.destinationPath}.`,
                source: 'Downloads',
                groupKey: 'downloads',
                priority: 'normal',
                deepLink: { kind: 'downloads' },
                actions: [
                    {
                        id: `open-downloads-${event.item.id}`,
                        label: 'Open manager',
                        tone: 'primary',
                        deepLink: { kind: 'downloads' },
                    },
                    {
                        id: `show-file-${event.item.id}`,
                        label: 'Show file',
                        deepLink: {
                            kind: 'file-manager-path',
                            path: event.item.destinationPath,
                        },
                    },
                ],
            })
            return
        }

        if (event.type === 'failed') {
            publishNotification({
                title: 'Download failed',
                message: `${event.item.fileName} stopped at ${formatBytes(event.item.receivedBytes)} of ${formatBytes(event.item.totalBytes)}.`,
                source: 'Downloads',
                groupKey: 'downloads',
                priority: 'high',
                deepLink: { kind: 'downloads' },
                actions: [
                    ...(canRetry(event.item)
                        ? [{
                            id: `retry-download-${event.item.id}`,
                            label: 'Retry',
                            tone: 'primary' as const,
                            onInvoke: () => {
                                service.retry(event.item.id)
                            },
                        }]
                        : []),
                    {
                        id: `open-downloads-${event.item.id}`,
                        label: 'Open manager',
                        deepLink: { kind: 'downloads' },
                    },
                ],
            })
            return
        }

        if (event.type === 'canceled') {
            publishNotification({
                title: 'Download canceled',
                message: `${event.item.fileName} has been removed from the active queue.`,
                source: 'Downloads',
                groupKey: 'downloads',
                priority: 'low',
                autoCloseMs: 4000,
                deepLink: { kind: 'downloads' },
            })
            return
        }

        if (event.type === 'retried') {
            publishNotification({
                title: 'Retrying download',
                message: `Attempt ${event.item.attemptCount} started for ${event.item.fileName}.`,
                source: 'Downloads',
                groupKey: 'downloads',
                priority: 'normal',
                autoCloseMs: 4000,
                deepLink: { kind: 'downloads' },
            })
        }
    }

    const tick = () => {
        const currentNow = now()
        let didChange = false

        items = items.map((item) => {
            const runtime = runtimeById.get(item.id)
            if (!runtime) {
                return item
            }

            if (item.status === 'queued') {
                if (runtime.queueTicksRemaining > 0) {
                    runtime.queueTicksRemaining -= 1
                    return item
                }

                const nextItem = {
                    ...item,
                    status: 'downloading' as const,
                    updatedAt: currentNow,
                }
                didChange = true
                publish({ type: 'started', item: nextItem })
                return nextItem
            }

            if (item.status !== 'downloading') {
                return item
            }

            runtime.stepIndex += 1
            const failStep = runtime.profile.failAtStepByAttempt[item.attemptCount]
            if (failStep !== undefined && runtime.stepIndex === failStep) {
                const failedItem = {
                    ...item,
                    status: 'failed' as const,
                    updatedAt: currentNow,
                    errorMessage: 'Connection lost during transfer.',
                }
                didChange = true
                publish({ type: 'failed', item: failedItem })
                return failedItem
            }

            const increment = runtime.profile.progressPattern[(runtime.stepIndex - 1) % runtime.profile.progressPattern.length]
            const receivedBytes = Math.min(item.totalBytes, item.receivedBytes + increment)

            if (receivedBytes >= item.totalBytes) {
                const completedItem = {
                    ...item,
                    receivedBytes,
                    status: 'complete' as const,
                    updatedAt: currentNow,
                    errorMessage: undefined,
                }
                didChange = true
                publish({ type: 'completed', item: completedItem })
                return completedItem
            }

            const progressedItem = {
                ...item,
                receivedBytes,
                updatedAt: currentNow,
            }
            didChange = true
            publish({ type: 'progress', item: progressedItem })
            return progressedItem
        })

        if (didChange) {
            emit()
        }
    }

    service = {
        enqueue: (input) => {
            const id = input.id ?? `download-${now()}-${++idCounter}`
            const createdAt = now()
            const profile = normalizeProfile(input.simulation)
            const item: DownloadItem = {
                id,
                fileName: input.fileName,
                destinationPath: input.destinationPath,
                totalBytes: input.totalBytes,
                receivedBytes: 0,
                status: 'queued',
                source: input.source,
                createdAt,
                updatedAt: createdAt,
                attemptCount: 1,
                maxRetries: Math.max(0, input.maxRetries ?? 2),
                sourceUrl: input.sourceUrl,
                mimeType: input.mimeType,
            }

            runtimeById.set(id, {
                profile,
                queueTicksRemaining: profile.queueTicks,
                stepIndex: 0,
            })
            items = [item, ...items]
            publish({ type: 'queued', item })
            emit()
            return id
        },
        retry: (id) => {
            const current = getItem(id)
            if (!current || current.status !== 'failed' || !canRetry(current)) {
                return false
            }

            const runtime = runtimeById.get(id)
            if (!runtime) {
                return false
            }

            runtime.queueTicksRemaining = Math.max(0, Math.min(1, runtime.profile.queueTicks))
            runtime.stepIndex = 0
            updateItem(id, (item) => ({
                ...item,
                attemptCount: item.attemptCount + 1,
                receivedBytes: 0,
                status: 'queued',
                errorMessage: undefined,
                updatedAt: now(),
            }))

            const retried = getItem(id)
            if (!retried) {
                return false
            }

            publish({ type: 'retried', item: retried })
            emit()
            return true
        },
        cancel: (id) => {
            const current = getItem(id)
            if (!current || !['queued', 'downloading', 'failed'].includes(current.status)) {
                return false
            }

            updateItem(id, (item) => ({
                ...item,
                status: 'canceled',
                updatedAt: now(),
                errorMessage: undefined,
            }))

            const canceled = getItem(id)
            if (!canceled) {
                return false
            }

            publish({ type: 'canceled', item: canceled })
            emit()
            return true
        },
        remove: (id) => {
            if (!getItem(id)) {
                return
            }

            runtimeById.delete(id)
            items = items.filter((item) => item.id !== id)
            emit()
        },
        clearTerminal: () => {
            const removableIds = items
                .filter((item) => ['complete', 'failed', 'canceled'].includes(item.status))
                .map((item) => item.id)

            if (removableIds.length === 0) {
                return
            }

            removableIds.forEach((id) => runtimeById.delete(id))
            items = items.filter((item) => !removableIds.includes(item.id))
            emit()
        },
        getSnapshot: () => snapshot,
        subscribe: (listener) => {
            listeners.add(listener)
            return () => listeners.delete(listener)
        },
        start: () => {
            if (intervalId !== null) {
                return
            }

            intervalId = globalThis.setInterval(tick, tickMs)
        },
        stop: () => {
            if (intervalId !== null) {
                globalThis.clearInterval(intervalId)
                intervalId = null
            }
        },
        dispose: () => {
            service.stop()
            listeners.clear()
            runtimeById.clear()
            items = []
            snapshot = createSnapshot(items)
        },
    }

    return service
}
