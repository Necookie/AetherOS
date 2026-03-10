import { Copy, FolderOpen, RotateCcw, Trash2, XCircle } from 'lucide-react'
import Window from '../../components/system/Window'
import { useFsStore } from '../../stores/fsStore'
import { useWindowStore } from '../../stores/windowStore'
import { downloadManagerService, useDownloadManagerSnapshot } from '../../features/downloads'
import type { DownloadItem, DownloadStatus } from '../../features/downloads'
import { DEFAULT_APPS } from '../../config/windows'

const SECTION_ORDER: DownloadStatus[] = ['downloading', 'queued', 'failed', 'complete', 'canceled']

const STATUS_COPY: Record<DownloadStatus, { label: string; tone: string }> = {
    downloading: { label: 'Downloading', tone: 'border-sky-400/50 bg-sky-500/15 text-sky-100' },
    queued: { label: 'Queued', tone: 'border-slate-400/40 bg-slate-500/15 text-slate-200' },
    failed: { label: 'Failed', tone: 'border-rose-400/50 bg-rose-500/15 text-rose-100' },
    complete: { label: 'Complete', tone: 'border-emerald-400/50 bg-emerald-500/15 text-emerald-100' },
    canceled: { label: 'Canceled', tone: 'border-amber-300/50 bg-amber-500/15 text-amber-100' },
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
            <div className="flex h-full flex-col bg-[radial-gradient(circle_at_top,_rgb(59_130_246_/_0.18),_transparent_32%),linear-gradient(180deg,_rgb(2_6_23),_rgb(15_23_42)_46%,_rgb(15_23_42)_100%)] text-slate-100">
                <header className="border-b border-white/10 px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.18em] text-sky-200/80">Transfers</p>
                            <h1 className="mt-1 text-xl font-semibold">Download Manager</h1>
                            <p className="mt-1 text-sm text-slate-300">
                                {snapshot.activeCount} active, {snapshot.queuedCount} queued, {snapshot.failedCount} failed
                            </p>
                        </div>
                        <button
                            onClick={() => downloadManagerService.clearTerminal()}
                            className="os-interactive inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-slate-200 hover:bg-white/10"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Clear finished
                        </button>
                    </div>
                </header>

                <div className="min-h-0 flex-1 overflow-auto px-4 py-4">
                    {grouped.length === 0 ? (
                        <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/5">
                            <div className="text-center">
                                <p className="text-base font-medium text-slate-100">No downloads yet</p>
                                <p className="mt-1 text-sm text-slate-400">Browser and system transfers will appear here.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {grouped.map((group) => (
                                <section key={group.status} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                    <div className="mb-3 flex items-center gap-2">
                                        <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${STATUS_COPY[group.status].tone}`}>
                                            {STATUS_COPY[group.status].label}
                                        </span>
                                        <span className="text-xs text-slate-400">{group.items.length} item{group.items.length === 1 ? '' : 's'}</span>
                                    </div>

                                    <div className="space-y-3">
                                        {group.items.map((item) => (
                                            <article key={item.id} className="rounded-xl border border-white/10 bg-slate-950/45 p-3 shadow-[0_12px_24px_rgb(2_6_23_/_0.22)]">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <p className="truncate text-sm font-semibold text-white">{item.fileName}</p>
                                                            <span className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-slate-300">
                                                                {item.source}
                                                            </span>
                                                        </div>
                                                        <p className="mt-1 truncate text-xs text-slate-400">{item.destinationPath}</p>
                                                        <p className="mt-2 text-xs text-slate-300">{detailCopy(item)}</p>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {item.status === 'complete' && explorerApp ? (
                                                            <>
                                                                <button
                                                                    onClick={() => {
                                                                        openWindow(explorerApp)
                                                                        revealPath(item.destinationPath)
                                                                    }}
                                                                    className="os-interactive inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-2 text-xs text-slate-200 hover:bg-white/10"
                                                                >
                                                                    <FolderOpen className="h-3.5 w-3.5" />
                                                                    Open file
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        openWindow(explorerApp)
                                                                        revealPath(getParentPath(item.destinationPath))
                                                                    }}
                                                                    className="os-interactive inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-2 text-xs text-slate-200 hover:bg-white/10"
                                                                >
                                                                    <FolderOpen className="h-3.5 w-3.5" />
                                                                    Open folder
                                                                </button>
                                                                <button
                                                                    onClick={() => void copyPath(item.destinationPath)}
                                                                    className="os-interactive inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-2 text-xs text-slate-200 hover:bg-white/10"
                                                                >
                                                                    <Copy className="h-3.5 w-3.5" />
                                                                    Copy path
                                                                </button>
                                                            </>
                                                        ) : null}
                                                        {canRetry(item) ? (
                                                            <button
                                                                onClick={() => downloadManagerService.retry(item.id)}
                                                                className="os-interactive inline-flex items-center gap-1 rounded-lg border border-sky-400/40 bg-sky-500/15 px-2.5 py-2 text-xs text-sky-100 hover:bg-sky-500/25"
                                                            >
                                                                <RotateCcw className="h-3.5 w-3.5" />
                                                                Retry
                                                            </button>
                                                        ) : null}
                                                        {['queued', 'downloading', 'failed'].includes(item.status) ? (
                                                            <button
                                                                onClick={() => downloadManagerService.cancel(item.id)}
                                                                className="os-interactive inline-flex items-center gap-1 rounded-lg border border-rose-400/40 bg-rose-500/15 px-2.5 py-2 text-xs text-rose-100 hover:bg-rose-500/25"
                                                            >
                                                                <XCircle className="h-3.5 w-3.5" />
                                                                Cancel
                                                            </button>
                                                        ) : null}
                                                    </div>
                                                </div>

                                                <div className="mt-3">
                                                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                                                        <div
                                                            className={`h-full rounded-full transition-[width] duration-500 ${
                                                                item.status === 'failed'
                                                                    ? 'bg-rose-400'
                                                                    : item.status === 'complete'
                                                                        ? 'bg-emerald-400'
                                                                        : item.status === 'canceled'
                                                                            ? 'bg-amber-300'
                                                                            : 'bg-sky-400'
                                                            }`}
                                                            style={{ width: `${progressPercent(item)}%` }}
                                                        />
                                                    </div>
                                                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
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
