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
            <div className="flex h-full flex-col">
                <header className="border-b border-white/60 bg-white/55 px-4 py-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.12em] text-slate-600">Aether Package Registry</p>
                            <h2 className="text-lg font-semibold text-slate-900">Discover and maintain apps</h2>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-700">
                            <span className="rounded-md border border-white/70 bg-white/70 px-2 py-1">Installed: {installedCount}</span>
                            <span className="rounded-md border border-white/70 bg-white/70 px-2 py-1">Updates: {updateCount}</span>
                        </div>
                    </div>

                    <label className="relative mt-3 block">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <input
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search apps or capabilities"
                            className="w-full rounded-lg border border-white/70 bg-white/80 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-white"
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
                            <article key={app.id} className="rounded-xl border border-white/65 bg-white/52 p-3 shadow-sm">
                                <div className="mb-2 flex items-start justify-between gap-2">
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-900">{app.title}</h3>
                                        <p className="mt-0.5 text-xs text-slate-600">{app.summary}</p>
                                    </div>
                                    <span className="rounded-md border border-white/70 bg-white/70 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-slate-600">
                                        {categoryLabel(app.category)}
                                    </span>
                                </div>

                                <div className="mb-2 grid grid-cols-2 gap-2 text-xs text-slate-700">
                                    <div className="rounded-md border border-white/70 bg-white/65 px-2 py-1">
                                        Latest: <span className="font-semibold">{latestVersion}</span>
                                    </div>
                                    <div className="rounded-md border border-white/70 bg-white/65 px-2 py-1">
                                        Installed: <span className="font-semibold">{installedApp?.version ?? 'No'}</span>
                                    </div>
                                </div>

                                {operation && operation.state !== 'idle' && (
                                    <div className="mb-2 rounded-md border border-amber-200 bg-amber-50/80 px-2 py-1 text-xs text-amber-800">
                                        <p>{operation.message}</p>
                                        <div className="mt-1 h-1.5 w-full rounded-full bg-amber-100">
                                            <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${operation.progress}%` }} />
                                        </div>
                                    </div>
                                )}

                                {issues.length > 0 && (
                                    <div className="mb-2 rounded-md border border-rose-200 bg-rose-50/80 px-2 py-1.5 text-xs text-rose-800">
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
                                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-100/90 px-2.5 py-1.5 text-xs font-medium text-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <DownloadCloud className="h-3.5 w-3.5" />
                                            Install
                                        </button>
                                    )}

                                    {installedApp && hasUpdate && (
                                        <button
                                            onClick={() => void updateApp(app.id)}
                                            disabled={isBusy}
                                            className="inline-flex items-center gap-1 rounded-lg border border-sky-300 bg-sky-100/90 px-2.5 py-1.5 text-xs font-medium text-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <RefreshCw className="h-3.5 w-3.5" />
                                            Update
                                        </button>
                                    )}

                                    {installedApp && (
                                        <button
                                            onClick={() => void uninstallApp(app.id)}
                                            disabled={isBusy || installedApp.source === 'system'}
                                            className="inline-flex items-center gap-1 rounded-lg border border-rose-300 bg-rose-100/90 px-2.5 py-1.5 text-xs font-medium text-rose-800 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <PackageMinus className="h-3.5 w-3.5" />
                                            Uninstall
                                        </button>
                                    )}

                                    {installedApp && !hasUpdate && (
                                        <span className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-slate-100/90 px-2.5 py-1.5 text-xs text-slate-700">
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
