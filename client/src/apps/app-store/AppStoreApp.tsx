import { useMemo, useState } from 'react'
import {
    AlertCircle,
    DownloadCloud,
    ExternalLink,
    PackageCheck,
    PackageMinus,
    RefreshCw,
    Search,
    ShieldCheck,
    Sparkles,
} from 'lucide-react'
import Window from '../../components/system/Window'
import { registryService, useAppRegistryStore } from '../../stores/appRegistryStore'
import { compareSemver } from '../../features/app-registry/versioning'
import { ShellAppIcon } from '../../features/shell/model/appIcons'
import { DEFAULT_APPS } from '../../config/windows'
import { useWindowStore } from '../../stores/windowStore'
import type { AppCategory } from '../../features/app-registry/types'

const CATEGORIES: Array<{ id: 'all' | AppCategory; label: string }> = [
    { id: 'all', label: 'All Apps' },
    { id: 'productivity', label: 'Productivity' },
    { id: 'developer', label: 'Developer' },
    { id: 'utility', label: 'Utilities' },
    { id: 'system', label: 'System' },
]

export default function AppStoreApp({ id }: { id: string }) {
    const [query, setQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<'all' | AppCategory>('all')
    const [confirmUninstallId, setConfirmUninstallId] = useState<string | null>(null)

    const { installed, operations, issuesByApp, installApp, updateApp, uninstallApp } = useAppRegistryStore((state) => ({
        installed: state.installed,
        operations: state.operations,
        issuesByApp: state.issuesByApp,
        installApp: state.installApp,
        updateApp: state.updateApp,
        uninstallApp: state.uninstallApp,
    }))
    const openWindow = useWindowStore((state) => state.openWindow)

    const apps = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase()

        return registryService
            .listAvailable()
            .filter((app) => {
                const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory
                if (!matchesCategory) return false

                if (normalizedQuery.length === 0) return true
                return (
                    app.title.toLowerCase().includes(normalizedQuery) ||
                    app.summary.toLowerCase().includes(normalizedQuery) ||
                    app.id.toLowerCase().includes(normalizedQuery)
                )
            })
    }, [query, selectedCategory])

    const installedCount = Object.keys(installed).length
    const updateCount = registryService.getUpdateCandidates(installed).length
    const totalCount = registryService.listAvailable().length

    return (
        <Window id={id} title="App Store">
            <div className="flex h-full flex-col bg-parchment">
                {/* Header */}
                <header className="border-b border-hairline bg-canvas px-6 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-[12px] font-semibold text-primary">
                                <Sparkles className="h-3.5 w-3.5" />
                                <span>AetherOS Application Registry</span>
                            </div>
                            <h1 className="mt-0.5 text-xl font-semibold text-ink">Discover and manage apps</h1>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-ink-muted">
                            <span className="rounded-pill border border-hairline bg-parchment px-3 py-1 font-medium">
                                {installedCount} of {totalCount} Installed
                            </span>
                            {updateCount > 0 && (
                                <span className="rounded-pill border border-primary/30 bg-primary/10 px-3 py-1 font-semibold text-primary">
                                    {updateCount} Update{updateCount > 1 ? 's' : ''} available
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Search & Category Filter */}
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative flex-1 max-w-md">
                            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted-48" />
                            <input
                                type="search"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search apps, tools, and capabilities..."
                                className="w-full rounded-pill border border-hairline bg-canvas py-2 pl-10 pr-4 text-sm text-ink placeholder:text-ink-muted-48 focus:border-primary-focus focus:outline-none focus:ring-1 focus:ring-primary-focus transition-colors"
                            />
                        </div>

                        {/* Category Segmented Pills */}
                        <div className="flex flex-wrap items-center gap-1.5">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`rounded-pill px-3 py-1 text-xs font-semibold transition-colors active:scale-95 ${
                                        selectedCategory === cat.id
                                            ? 'bg-primary text-white shadow-xs'
                                            : 'border border-hairline bg-canvas text-ink-muted hover:bg-parchment'
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                {/* Main App Grid */}
                <section className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto p-6 md:grid-cols-2 lg:grid-cols-2">
                    {apps.map((app) => {
                        const installedApp = installed[app.id]
                        const isSystemApp = installedApp?.source === 'system' || app.category === 'system'
                        const operation = operations[app.id]
                        const issues = issuesByApp[app.id] ?? []
                        const latestVersion = registryService.getLatestVersion(app.id) ?? '1.0.0'
                        const hasUpdate = installedApp ? compareSemver(latestVersion, installedApp.version) > 0 : false
                        const isBusy = operation && ['installing', 'updating', 'removing'].includes(operation.state)
                        const isConfirming = confirmUninstallId === app.id
                        const appDef = DEFAULT_APPS.find((a) => a.id === app.id)

                        return (
                            <article
                                key={app.id}
                                className="flex flex-col justify-between rounded-lg border border-hairline bg-canvas p-4 transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-xs"
                            >
                                <div>
                                    {/* App Header with Tile Icon */}
                                    <div className="flex items-start gap-3.5">
                                        <ShellAppIcon appId={app.id} variant="tile" size="lg" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <h3 className="truncate text-base font-semibold text-ink">{app.title}</h3>
                                                <span className="shrink-0 rounded-pill border border-hairline bg-parchment px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted-48">
                                                    {app.category}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-xs leading-relaxed text-ink-muted line-clamp-2">
                                                {app.summary}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Version & Status Badges */}
                                    <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs">
                                        <span className="rounded-sm border border-hairline bg-parchment px-2 py-0.5 text-[11px] text-ink-muted">
                                            v{latestVersion}
                                        </span>

                                        {isSystemApp ? (
                                            <span className="inline-flex items-center gap-1 rounded-pill border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-[#0066cc]">
                                                <ShieldCheck className="h-3 w-3" /> Built-in
                                            </span>
                                        ) : installedApp ? (
                                            <span className="inline-flex items-center gap-1 rounded-pill border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                                                <PackageCheck className="h-3 w-3" /> Installed (v{installedApp.version})
                                            </span>
                                        ) : (
                                            <span className="rounded-pill border border-hairline bg-parchment px-2 py-0.5 text-[11px] text-ink-muted-48">
                                                Available
                                            </span>
                                        )}

                                        {hasUpdate && (
                                            <span className="rounded-pill border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                                                Update available
                                            </span>
                                        )}
                                    </div>

                                    {/* Operation Progress */}
                                    {operation && operation.state !== 'idle' && (
                                        <div className="mt-3 rounded-md border border-hairline bg-parchment p-2 text-xs text-ink-muted">
                                            <div className="flex items-center justify-between">
                                                <span>{operation.message}</span>
                                                <span className="font-semibold text-primary">{operation.progress}%</span>
                                            </div>
                                            <div className="mt-1.5 h-1.5 w-full rounded-full bg-hairline overflow-hidden">
                                                <div
                                                    className="h-full w-full origin-left rounded-full bg-primary transition-transform duration-300"
                                                    style={{ transform: `scaleX(${operation.progress / 100})` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Issues & Warnings */}
                                    {issues.length > 0 && (
                                        <div className="mt-3 space-y-1 rounded-md border border-red-200 bg-red-50 p-2 text-xs text-danger">
                                            {issues.map((issue) => (
                                                <p key={`${issue.type}-${issue.appId}-${issue.dependentAppId ?? ''}`} className="flex items-center gap-1">
                                                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                                    {issue.message}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons Footer */}
                                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-hairline/80 pt-3">
                                    <div className="flex items-center gap-2">
                                        {!installedApp ? (
                                            <button
                                                onClick={() => void installApp(app.id)}
                                                disabled={isBusy}
                                                className="inline-flex items-center gap-1.5 rounded-pill bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition-opacity hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <DownloadCloud className="h-3.5 w-3.5" />
                                                Get
                                            </button>
                                        ) : hasUpdate ? (
                                            <button
                                                onClick={() => void updateApp(app.id)}
                                                disabled={isBusy}
                                                className="inline-flex items-center gap-1.5 rounded-pill bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition-opacity hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <RefreshCw className="h-3.5 w-3.5" />
                                                Update
                                            </button>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
                                                <PackageCheck className="h-3.5 w-3.5 text-emerald-600" />
                                                Up to date
                                            </span>
                                        )}

                                        {appDef && installedApp && (
                                            <button
                                                onClick={() => openWindow(appDef)}
                                                className="inline-flex items-center gap-1 rounded-pill border border-hairline bg-canvas px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-parchment active:scale-95"
                                            >
                                                <ExternalLink className="h-3 w-3 text-ink-muted-48" />
                                                Open
                                            </button>
                                        )}
                                    </div>

                                    {/* Uninstall Action for non-system apps */}
                                    <div>
                                        {installedApp && !isSystemApp && (
                                            isConfirming ? (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-medium text-danger">Uninstall?</span>
                                                    <button
                                                        onClick={async () => {
                                                            setConfirmUninstallId(null)
                                                            await uninstallApp(app.id)
                                                        }}
                                                        disabled={isBusy}
                                                        className="rounded-md bg-danger px-2.5 py-1 text-xs font-semibold text-white transition-colors active:scale-95 disabled:opacity-50"
                                                    >
                                                        Confirm
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmUninstallId(null)}
                                                        className="rounded-md border border-hairline bg-canvas px-2.5 py-1 text-xs text-ink transition-colors hover:bg-parchment"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setConfirmUninstallId(app.id)}
                                                    disabled={isBusy}
                                                    className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold text-ink-muted hover:text-danger hover:bg-red-50 transition-colors disabled:opacity-50"
                                                    title={`Uninstall ${app.title}`}
                                                >
                                                    <PackageMinus className="h-3.5 w-3.5" />
                                                    Uninstall
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                            </article>
                        )
                    })}
                </section>
            </div>
        </Window>
    )
}
