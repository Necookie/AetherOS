export type DownloadStatus = 'queued' | 'downloading' | 'failed' | 'complete' | 'canceled'

export type DownloadSource = 'browser' | 'app-store' | 'system'

export interface DownloadSimulationProfile {
    queueTicks?: number
    progressPattern?: number[]
    failAtStepByAttempt?: Record<number, number>
}

export interface DownloadItem {
    id: string
    fileName: string
    destinationPath: string
    totalBytes: number
    receivedBytes: number
    status: DownloadStatus
    source: DownloadSource
    createdAt: number
    updatedAt: number
    attemptCount: number
    maxRetries: number
    sourceUrl?: string
    mimeType?: string
    errorMessage?: string
}

export interface CreateDownloadInput {
    id?: string
    fileName: string
    destinationPath: string
    totalBytes: number
    source: DownloadSource
    sourceUrl?: string
    mimeType?: string
    maxRetries?: number
    simulation?: DownloadSimulationProfile
}

export type DownloadManagerEvent =
    | { type: 'queued'; item: DownloadItem }
    | { type: 'started'; item: DownloadItem }
    | { type: 'progress'; item: DownloadItem }
    | { type: 'failed'; item: DownloadItem }
    | { type: 'retried'; item: DownloadItem }
    | { type: 'completed'; item: DownloadItem }
    | { type: 'canceled'; item: DownloadItem }

export interface DownloadManagerSnapshot {
    items: DownloadItem[]
    activeCount: number
    queuedCount: number
    failedCount: number
    completedCount: number
}

export interface DownloadManagerService {
    enqueue: (input: CreateDownloadInput) => string
    retry: (id: string) => boolean
    cancel: (id: string) => boolean
    remove: (id: string) => void
    clearTerminal: () => void
    getSnapshot: () => DownloadManagerSnapshot
    subscribe: (listener: () => void) => () => void
    start: () => void
    stop: () => void
    dispose: () => void
}
