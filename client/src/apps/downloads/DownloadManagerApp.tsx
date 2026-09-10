import { Copy, FolderOpen, RotateCcw, Trash2, XCircle } from 'lucide-react'
import Window from '../../components/system/Window'
import { useFsStore } from '../../stores/fsStore'
import { useWindowStore } from '../../stores/windowStore'
import { downloadManagerService, useDownloadManagerSnapshot } from '../../features/downloads'
import type { DownloadItem, DownloadStatus } from '../../features/downloads'
import { DEFAULT_APPS } from '../../config/windows'

const SECTION_ORDER: DownloadStatus[] = ['downloading', 'queued', 'failed', 'complete', 'canceled']

// Flat, single-tone per status — no gradients, one hue per state.
const STATUS_COPY: Record<DownloadStatus, { label: string; tone: string; bar: string }> = {
    downloading: { label: 'Downloading', tone: 'border-white/10 bg-tile-2 text-primary-on-dark', bar: 'bg-primary-on-dark' },
    queued: { label: 'Queued', tone: 'border-white/10 bg-tile-2 text-on-dark-muted', bar: 'bg-on-dark-muted' },
    failed: { label: 'Failed', tone: 'border-white/10 bg-tile-2 text-danger', bar: 'bg-danger' },
    complete: { label: 'Complete', tone: 'border-white/10 bg-tile-2 text-success', bar: 'bg-success' },
    canceled: { label: 'Canceled', tone: 'border-white/10 bg-tile-2 text-warning', bar: 'bg-warning' },
}

const explorerApp = DEFAULT_APPS.find((app) => app.id === 'explorer')

function getParentPath(path: string) {
    const normalized = path.replace(/\\/g, '/')
    const segments = normalized.split('/').filter(Boolean)
    if (segments.length <= 1) {
        return '/'
    }

    return `/${segments.slice(0, -1).join('/')}`
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

function progressPercent(item: DownloadItem) {
    return Math.min(100, Math.round((item.receivedBytes / item.totalBytes) * 100))
}

function detailCopy(item: DownloadItem) {
    if (item.status === 'complete') {
        return 'Ready to open in File Manager'
    }
    if (item.status === 'failed') {
        return item.errorMessage ?? 'Transfer interrupted'
    }
    if (item.status === 'canceled') {
        return 'Canceled by user'
    }
    return `${formatBytes(item.receivedBytes)} of ${formatBytes(item.totalBytes)}`
}

function canRetry(item: DownloadItem) {
    return item.status === 'failed' && item.attemptCount - 1 < item.maxRetries
}

export default function DownloadManagerApp({ id }: { id: string }) {
    const snapshot = useDownloadManagerSnapshot()
    const openWindow = useWindowStore((state) => state.openWindow)
    const revealPath = useFsStore((state) => state.revealPath)
    const copyPath = async (path: string) => {
        try {
            await navigator.clipboard.writeText(path)
        } catch {
            // Ignore clipboard failures in the manager UI.
        }
    }
    const grouped = SECTION_ORDER
        .map((status) => ({
            status,
            items: snapshot.items.filter((item) => item.status === status),
        }))
        .filter((group) => group.items.length > 0)

    return (
        <Window id={id} title="Download Manager">
            <div className="flex h-full flex-col bg-tile-1 text-on-dark">
                <header className="border-b border-white/10 px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-[12px] text-on-dark-muted">Transfers</p>
                            <h1 className="mt-1 text-xl font-semibold">Download Manager</h1>
                            <p className="mt-1 text-sm text-on-dark-muted">
                                {snapshot.activeCount} active, {snapshot.queuedCount} queued, {snapshot.failedCount} failed
                            </p>
                        </div>
                        <button
                            onClick={() => downloadManagerService.clearTerminal()}
                            className="inline-flex items-center gap-2 rounded-sm border border-white/10 bg-tile-2 px-3 py-2 text-xs text-on-dark transition-transform active:scale-95"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Clear finished
                        </button>
                    </div>
                </header>

                <div className="min-h-0 flex-1 overflow-auto px-4 py-4">
                    {grouped.length === 0 ? (
                        <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-white/10 bg-tile-2">
                            <div className="text-center">
                                <p className="text-base font-semibold text-on-dark">No downloads yet</p>
                                <p className="mt-1 text-sm text-on-dark-muted">Browser and system transfers will appear here.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {grouped.map((group) => (
                                <section key={group.status} className="rounded-lg border border-white/10 bg-tile-2 p-3">
                                    <div className="mb-3 flex items-center gap-2">
                                        <span className={`rounded-pill border px-2 py-1 text-[12px] font-semibold uppercase tracking-[0.12em] ${STATUS_COPY[group.status].tone}`}>
                                            {STATUS_COPY[group.status].label}
                                        </span>
                                        <span className="text-xs text-on-dark-muted">{group.items.length} item{group.items.length === 1 ? '' : 's'}</span>
                                    </div>

                                    <div className="space-y-3">
                                        {group.items.map((item) => (
                                            <article key={item.id} className="rounded-md border border-white/10 bg-tile-1 p-3">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <p className="truncate text-sm font-semibold text-on-dark">{item.fileName}</p>
                                                            <span className="rounded-pill bg-tile-2 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-on-dark-muted">
                                                                {item.source}
                                                            </span>
                                                        </div>
                                                        <p className="mt-1 truncate text-xs text-on-dark-muted">{item.destinationPath}</p>
                                                        <p className="mt-2 text-xs text-on-dark-muted">{detailCopy(item)}</p>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {item.status === 'complete' && explorerApp ? (
                                                            <>
                                                                <button
                                                                    onClick={() => {
                                                                        openWindow(explorerApp)
                                                                        revealPath(item.destinationPath)
                                                                    }}
                                                                    className="inline-flex items-center gap-1 rounded-sm border border-white/10 bg-tile-2 px-2.5 py-2 text-xs text-on-dark transition-transform active:scale-95"
                                                                >
                                                                    <FolderOpen className="h-3.5 w-3.5" />
                                                                    Open file
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        openWindow(explorerApp)
                                                                        revealPath(getParentPath(item.destinationPath))
                                                                    }}
                                                                    className="inline-flex items-center gap-1 rounded-sm border border-white/10 bg-tile-2 px-2.5 py-2 text-xs text-on-dark transition-transform active:scale-95"
                                                                >
                                                                    <FolderOpen className="h-3.5 w-3.5" />
                                                                    Open folder
                                                                </button>
                                                                <button
                                                                    onClick={() => void copyPath(item.destinationPath)}
                                                                    className="inline-flex items-center gap-1 rounded-sm border border-white/10 bg-tile-2 px-2.5 py-2 text-xs text-on-dark transition-transform active:scale-95"
                                                                >
                                                                    <Copy className="h-3.5 w-3.5" />
                                                                    Copy path
                                                                </button>
                                                            </>
                                                        ) : null}
                                                        {canRetry(item) ? (
                                                            <button
                                                                onClick={() => downloadManagerService.retry(item.id)}
                                                                className="inline-flex items-center gap-1 rounded-sm border border-white/10 bg-tile-2 px-2.5 py-2 text-xs text-primary-on-dark transition-transform active:scale-95"
                                                            >
                                                                <RotateCcw className="h-3.5 w-3.5" />
                                                                Retry
                                                            </button>
                                                        ) : null}
                                                        {['queued', 'downloading', 'failed'].includes(item.status) ? (
                                                            <button
                                                                onClick={() => downloadManagerService.cancel(item.id)}
                                                                className="inline-flex items-center gap-1 rounded-sm border border-white/10 bg-tile-2 px-2.5 py-2 text-xs text-danger transition-transform active:scale-95"
                                                            >
                                                                <XCircle className="h-3.5 w-3.5" />
                                                                Cancel
                                                            </button>
                                                        ) : null}
                                                    </div>
                                                </div>

                                                <div className="mt-3">
                                                    <div className="h-2 overflow-hidden rounded-full bg-tile-2">
                                                        <div
                                                            className={`h-full rounded-full transition-[width] duration-500 ${STATUS_COPY[item.status].bar}`}
                                                            style={{ width: `${progressPercent(item)}%` }}
                                                        />
                                                    </div>
                                                    <div className="mt-2 flex items-center justify-between text-[12px] text-on-dark-muted">
                                                        <span>{progressPercent(item)}%</span>
                                                        <span>Attempt {item.attemptCount} of {item.maxRetries + 1}</span>
                                                    </div>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Window>
    )
}
