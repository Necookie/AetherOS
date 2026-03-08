import { Power, Search } from 'lucide-react'
import { filterShellApps } from '../model/appCatalog'
import { ShellAppIcon } from '../model/appIcons'
import type { WindowData } from '../../../types/windowManager'

interface AppLauncherProps {
    query: string
    windows: Record<string, WindowData>
    onQueryChange: (nextValue: string) => void
    onLaunch: (appId: string) => void
}

export default function AppLauncher({
    query,
    windows,
    onQueryChange,
    onLaunch,
}: AppLauncherProps) {
    const filteredApps = filterShellApps(query)

    return (
        <div
            className="absolute bottom-[calc(var(--shell-dock-height)+var(--shell-edge-gap)+0.5rem)] left-0 z-[var(--ds-z-flyout)] w-[min(30rem,calc(100vw-1.5rem))] rounded-2xl p-3 backdrop-blur-2xl"
            style={{
                background: 'linear-gradient(180deg, rgb(255 255 255 / 0.54), rgb(255 255 255 / 0.34))',
                border: '1px solid rgb(255 255 255 / 0.56)',
                boxShadow: '0 20px 42px rgb(15 23 42 / 0.28)',
            }}
        >
            <div className="mb-3 rounded-xl border border-white/55 bg-white/40 p-3">
                <div className="mb-3 flex items-center justify-between">
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-600">AetherOS</p>
                        <h2 className="text-sm font-semibold text-slate-900">Spotlight</h2>
                    </div>
                    <button className="rounded-lg border border-white/60 bg-white/70 px-3 py-1 text-xs font-medium text-slate-800 transition-colors hover:bg-white">
                        <Power className="h-3.5 w-3.5" />
                        Power
                    </button>
                </div>

                <label className="relative block">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ds-color-text-muted)]" />
                    <input
                        value={query}
                        onChange={(event) => onQueryChange(event.target.value)}
                        placeholder="Search apps"
                        className="w-full rounded-lg border border-white/60 bg-white/80 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-white"
                        type="search"
                    />
                </label>
            </div>

            <div className="mb-2 flex items-center justify-between px-1 text-[11px] text-slate-600">
                <span>Applications</span>
                <span>{filteredApps.length} items</span>
            </div>

            <div className="grid max-h-72 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                {filteredApps.map((app) => {
                    const isRunning = Boolean(windows[app.id]) && !windows[app.id].state.isMinimized
                    return (
                        <button
                            key={app.id}
                            onClick={() => onLaunch(app.id)}
                            className="flex items-center gap-2 rounded-xl border border-white/55 bg-white/42 p-2 text-left transition-colors hover:bg-white/65"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/70">
                                <ShellAppIcon appId={app.id} className="h-8 w-8" />
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-slate-900">{app.title}</p>
                                <p className={`text-[11px] ${isRunning ? 'text-emerald-700' : 'text-slate-600'}`}>
                                    {isRunning ? 'Running' : 'Not running'}
                                </p>
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
