import { useMemo, useState } from 'react'
import { DownloadCloud, PackageCheck, PackageMinus, RefreshCw, Search } from 'lucide-react'
import Window from '../../components/system/Window'
import { registryService, useAppRegistryStore } from '../../stores/appRegistryStore'
import { compareSemver } from '../../features/app-registry/versioning'

function categoryLabel(category: string) {
    switch (category) {
        case 'developer':
            return 'Developer'
        case 'productivity':
            return 'Productivity'
        case 'system':
            return 'System'
        default:
            return 'Utility'
    }
}

export default function AppStoreApp({ id }: { id: string }) {
    const [query, setQuery] = useState('')
    const { installed, operations, issuesByApp, installApp, updateApp, uninstallApp } = useAppRegistryStore((state) => ({
        installed: state.installed,
        operations: state.operations,
        issuesByApp: state.issuesByApp,
        installApp: state.installApp,
        updateApp: state.updateApp,
        uninstallApp: state.uninstallApp,
    }))

    const apps = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase()

        return registryService
            .listAvailable()
            .filter((app) => normalizedQuery.length === 0
                || app.title.toLowerCase().includes(normalizedQuery)
                || app.summary.toLowerCase().includes(normalizedQuery)
                || app.id.toLowerCase().includes(normalizedQuery))
    }, [query])

    const installedCount = Object.keys(installed).length
    const updateCount = registryService.getUpdateCandidates(installed).length

    return (
        <Window id={id} title="App Store">
            <div className="flex h-full flex-col bg-parchment">
                <header className="border-b border-hairline bg-canvas px-4 py-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <p className="text-[12px] text-ink-muted">Aether Package Registry</p>
                            <h2 className="text-lg font-semibold text-ink">Discover and maintain apps</h2>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-ink-muted">
                            <span className="rounded-pill border border-hairline bg-parchment px-2 py-1">Installed: {installedCount}</span>
                            <span className="rounded-pill border border-hairline bg-parchment px-2 py-1">Updates: {updateCount}</span>
                        </div>
                    </div>

                    <label className="relative mt-3 block">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                        <input
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search apps or capabilities"
                            className="w-full rounded-pill border border-hairline bg-canvas py-2 pl-11 pr-3 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-primary-focus focus:outline focus:outline-2 focus:outline-primary-focus"
                        />
                    </label>
                </header>

                <section className="grid flex-1 grid-cols-1 gap-3 overflow-y-auto p-3 md:grid-cols-2">
                    {apps.map((app) => {
                        const installedApp = installed[app.id]
                        const operation = operations[app.id]
                        const issues = issuesByApp[app.id] ?? []
                        const latestVersion = registryService.getLatestVersion(app.id) ?? '0.0.0'
                        const hasUpdate = installedApp ? compareSemver(latestVersion, installedApp.version) > 0 : false
                        const isBusy = operation && ['installing', 'updating', 'removing'].includes(operation.state)

                        return (
                            <article key={app.id} className="rounded-lg border border-hairline bg-canvas p-3">
                                <div className="mb-2 flex items-start justify-between gap-2">
                                    <div>
                                        <h3 className="text-sm font-semibold text-ink">{app.title}</h3>
                                        <p className="mt-0.5 text-xs text-ink-muted">{app.summary}</p>
                                    </div>
                                    <span className="rounded-pill border border-hairline bg-parchment px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-ink-muted">
                                        {categoryLabel(app.category)}
                                    </span>
                                </div>

                                <div className="mb-2 grid grid-cols-2 gap-2 text-xs text-ink-muted">
                                    <div className="rounded-sm border border-hairline bg-parchment px-2 py-1">
                                        Latest: <span className="font-semibold text-ink">{latestVersion}</span>
                                    </div>
                                    <div className="rounded-sm border border-hairline bg-parchment px-2 py-1">
                                        Installed: <span className="font-semibold text-ink">{installedApp?.version ?? 'No'}</span>
                                    </div>
                                </div>

                                {operation && operation.state !== 'idle' && (
                                    <div className="mb-2 rounded-sm border border-hairline bg-parchment px-2 py-1 text-xs text-ink-muted">
                                        <p>{operation.message}</p>
                                        <div className="mt-1 h-1.5 w-full rounded-full bg-hairline">
                                            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${operation.progress}%` }} />
                                        </div>
                                    </div>
                                )}

                                {issues.length > 0 && (
                                    <div className="mb-2 rounded-sm border border-hairline bg-parchment px-2 py-1.5 text-xs text-danger">
                                        {issues.map((issue) => (
                                            <p key={`${issue.type}-${issue.appId}-${issue.dependentAppId ?? ''}`}>{issue.message}</p>
                                        ))}
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-2">
                                    {!installedApp && (
                                        <button
                                            onClick={() => void installApp(app.id)}
                                            disabled={isBusy}
                                            className="inline-flex items-center gap-1 rounded-pill bg-primary px-2.5 py-1.5 text-xs font-semibold text-white transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <DownloadCloud className="h-3.5 w-3.5" />
                                            Install
                                        </button>
                                    )}

                                    {installedApp && hasUpdate && (
                                        <button
                                            onClick={() => void updateApp(app.id)}
                                            disabled={isBusy}
                                            className="inline-flex items-center gap-1 rounded-pill bg-primary px-2.5 py-1.5 text-xs font-semibold text-white transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <RefreshCw className="h-3.5 w-3.5" />
                                            Update
                                        </button>
                                    )}

                                    {installedApp && (
                                        <button
                                            onClick={() => void uninstallApp(app.id)}
                                            disabled={isBusy || installedApp.source === 'system'}
                                            className="inline-flex items-center gap-1 rounded-pill border border-hairline bg-parchment px-2.5 py-1.5 text-xs font-semibold text-danger transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <PackageMinus className="h-3.5 w-3.5" />
                                            Uninstall
                                        </button>
                                    )}

                                    {installedApp && !hasUpdate && (
                                        <span className="inline-flex items-center gap-1 rounded-pill border border-hairline bg-parchment px-2.5 py-1.5 text-xs text-ink-muted">
                                            <PackageCheck className="h-3.5 w-3.5" />
                                            Up to date
                                        </span>
                                    )}
                                </div>
                            </article>
                        )
                    })}
                </section>
            </div>
        </Window>
    )
}
