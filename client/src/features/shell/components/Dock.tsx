import { useMemo, useState } from 'react'
import { LayoutGrid, Maximize2, Minimize2 } from 'lucide-react'
import { SHELL_APPS } from '../model/appCatalog'
import { ShellAppIcon } from '../model/appIcons'
import type { WindowData } from '../../../types/windowManager'

interface DockProps {
    windows: Record<string, WindowData>
    onLaunchOrToggle: (appId: string) => void
    onToggleLauncher: () => void
}

export default function Dock({ windows, onLaunchOrToggle, onToggleLauncher }: DockProps) {
    const [previewAppId, setPreviewAppId] = useState<string | null>(null)
    const previewWindow = useMemo(() => (
        previewAppId ? windows[previewAppId] : undefined
    ), [previewAppId, windows])

    return (
        <nav
            className="absolute bottom-[var(--shell-edge-gap)] left-1/2 z-[var(--ds-z-dock)] flex h-[var(--shell-dock-height)] w-[min(36rem,calc(100vw-1.5rem))] -translate-x-1/2 items-center gap-1 rounded-2xl px-2 backdrop-blur-2xl"
            style={{
                background: 'linear-gradient(180deg, rgb(255 255 255 / 0.35), rgb(255 255 255 / 0.16))',
                border: '1px solid rgb(255 255 255 / 0.45)',
                boxShadow: '0 20px 35px rgb(15 23 42 / 0.35)',
            }}
            aria-label="AetherOS dock"
        >
            <button
                onClick={onToggleLauncher}
                className="group flex h-10 w-10 items-center justify-center rounded-xl bg-white/55 text-slate-900 transition-transform hover:scale-110"
                aria-label="Open app launcher"
            >
                <LayoutGrid className="h-4 w-4" />
            </button>

            <div className="mx-1 h-7 w-px bg-slate-500/30" />

            <div className="grid flex-1 grid-cols-4 gap-1">
                {SHELL_APPS.map((app) => {
                    const isOpen = Boolean(windows[app.id])
                    const isFocused = windows[app.id]?.state.isFocused
                    const isMinimized = windows[app.id]?.state.isMinimized
                    const isPreviewing = previewAppId === app.id && isOpen
                    return (
                        <div
                            key={app.id}
                            className="relative flex items-center justify-center"
                            onMouseEnter={() => isOpen && setPreviewAppId(app.id)}
                            onMouseLeave={() => setPreviewAppId((current) => (current === app.id ? null : current))}
                        >
                            <button
                                onClick={() => onLaunchOrToggle(app.id)}
                                className={`group relative flex h-10 w-12 items-center justify-center rounded-xl transition-all ${
                                    isFocused ? 'bg-white/35 ring-1 ring-white/40' : 'hover:bg-white/25'
                                }`}
                                aria-label={`Open ${app.title}`}
                                title={app.title}
                            >
                                <ShellAppIcon appId={app.id} className="h-8 w-8 transition-transform group-hover:scale-110" />
                                {isOpen && (
                                    <span className={`absolute -bottom-0.5 h-1 rounded-full ${isFocused ? 'w-4 bg-[var(--os-accent)]' : isMinimized ? 'w-1 bg-slate-500/70' : 'w-2 bg-slate-900/80'}`} />
                                )}
                            </button>

                            {isPreviewing && previewWindow && (
                                <div className="pointer-events-none absolute bottom-12 left-1/2 z-[var(--ds-z-flyout)] w-56 -translate-x-1/2 rounded-xl border border-white/50 bg-white/75 p-2 text-left shadow-xl backdrop-blur-xl">
                                    <div className="mb-1 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                                        <span>{previewWindow.title}</span>
                                        {previewWindow.state.isMaximized ? <Maximize2 className="h-3 w-3" /> : previewWindow.state.isMinimized ? <Minimize2 className="h-3 w-3" /> : null}
                                    </div>
                                    <div className="rounded-lg border border-slate-300/80 bg-gradient-to-br from-slate-100 to-slate-200 p-2">
                                        <p className="truncate text-xs font-medium text-slate-700">{previewWindow.title}</p>
                                        <p className="mt-1 text-[11px] text-slate-500">
                                            {Math.round(previewWindow.bounds.width)}x{Math.round(previewWindow.bounds.height)} px
                                        </p>
                                        <p className="mt-2 text-[11px] text-slate-600">
                                            {previewWindow.state.isFocused ? 'Active window' : 'Click icon to restore focus'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </nav>
    )
}
