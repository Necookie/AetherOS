import { useEffect, useMemo, useRef, useState } from 'react'
import { Activity, BatteryCharging, Globe, LayoutGrid, Monitor, Power, Search, Settings, Terminal, Volume2, Wifi } from 'lucide-react'
import { shallow } from 'zustand/shallow'
import { DEFAULT_APPS } from '../config/windows'
import { useWindowStore } from '../stores/windowStore'
import type { AppDefinition, WindowData } from '../types/windowManager'

function AppIcon({ appId, className }: { appId: string; className?: string }) {
    if (appId === 'term') {
        return <Terminal className={className} />
    }

    if (appId === 'explorer') {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
            </svg>
        )
    }

    if (appId === 'taskmgr') {
        return <Activity className={className} />
    }

    if (appId === 'browser') {
        return <Globe className={className} />
    }

    return <Settings className={className} />
}

function StartMenu({
    apps,
    windows,
    query,
    onQueryChange,
    onLaunch,
}: {
    apps: AppDefinition[]
    windows: Record<string, WindowData>
    query: string
    onQueryChange: (value: string) => void
    onLaunch: (app: AppDefinition) => void
}) {
    return (
        <div
            className="animate-os-window-in absolute bottom-16 left-0 z-[10000] w-[24rem] rounded-2xl border border-slate-600/70 p-3 shadow-2xl backdrop-blur-xl"
            style={{
                background: 'color-mix(in oklab, var(--os-surface-0) 78%, black 22%)',
            }}
        >
            <div className="mb-3 rounded-xl border border-slate-700/80 bg-slate-900/50 p-3">
                <div className="mb-3 flex items-center justify-between">
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">AetherOS</p>
                        <p className="text-sm font-semibold text-slate-100">Start Menu</p>
                    </div>
                    <button className="rounded-lg border border-slate-700 bg-slate-800/80 px-2 py-1 text-[11px] font-medium text-slate-200 transition-colors hover:bg-slate-700">
                        <Power className="mr-1 inline h-3.5 w-3.5" />
                        Power
                    </button>
                </div>

                <label className="relative block">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => onQueryChange(e.target.value)}
                        placeholder="Search apps"
                        className="w-full rounded-lg border border-slate-700 bg-slate-900/80 py-2 pl-9 pr-3 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-slate-500"
                    />
                </label>
            </div>

            <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Applications</span>
                <span className="text-[11px] text-slate-500">{apps.length} items</span>
            </div>

            <div className="grid max-h-72 grid-cols-2 gap-2 overflow-y-auto pr-1">
                {apps.map((app) => {
                    const isRunning = Boolean(windows[app.id]) && !windows[app.id].state.isMinimized
                    return (
                        <button
                            key={app.id}
                            onClick={() => onLaunch(app)}
                            className="group flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/45 p-2 text-left transition-colors hover:border-slate-500 hover:bg-slate-800/70"
                        >
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-600/80 bg-slate-800 text-slate-200">
                                <AppIcon appId={app.id} className="h-4.5 w-4.5" />
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-slate-100">{app.title}</p>
                                <p className={`text-[11px] ${isRunning ? 'text-emerald-400' : 'text-slate-400'}`}>
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

export default function Taskbar() {
    const { windows, toggleMinimize, openWindow } = useWindowStore((state) => ({
        windows: state.windows,
        toggleMinimize: state.toggleMinimize,
        openWindow: state.openWindow,
    }), shallow)
    const [isStartMenuOpen, setIsStartMenuOpen] = useState(false)
    const [startQuery, setStartQuery] = useState('')
    const startButtonRef = useRef<HTMLButtonElement>(null)
    const startMenuRef = useRef<HTMLDivElement>(null)

    const filteredApps = useMemo(() => {
        const query = startQuery.trim().toLowerCase()
        if (!query) {
            return DEFAULT_APPS
        }

        return DEFAULT_APPS.filter((app) => app.title.toLowerCase().includes(query) || app.id.toLowerCase().includes(query))
    }, [startQuery])

    useEffect(() => {
        if (!isStartMenuOpen) {
            return
        }

        const onPointerDown = (event: MouseEvent) => {
            const target = event.target as Node | null
            if (!target) {
                return
            }

            if (
                startMenuRef.current?.contains(target)
                || startButtonRef.current?.contains(target)
            ) {
                return
            }

            setIsStartMenuOpen(false)
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsStartMenuOpen(false)
            }
        }

        window.addEventListener('mousedown', onPointerDown)
        window.addEventListener('keydown', onKeyDown)
        return () => {
            window.removeEventListener('mousedown', onPointerDown)
            window.removeEventListener('keydown', onKeyDown)
        }
    }, [isStartMenuOpen])

    useEffect(() => {
        if (!isStartMenuOpen) {
            setStartQuery('')
        }
    }, [isStartMenuOpen])

    const launchFromStartMenu = (app: AppDefinition) => {
        openWindow(app)
        setIsStartMenuOpen(false)
    }

    return (
        <div
            className="os-panel-motion relative flex h-14 w-full max-w-4xl items-center justify-between rounded-xl px-3 text-[12px] shadow-2xl backdrop-blur"
            style={{
                background: 'color-mix(in oklab, var(--os-surface-0) 86%, black 14%)',
                border: '1px solid color-mix(in oklab, var(--os-border) 70%, black 30%)',
            }}
        >
            <div className="flex items-center space-x-1">
                <button
                    ref={startButtonRef}
                    onClick={() => setIsStartMenuOpen((open) => !open)}
                    className={`os-hover-motion group rounded-lg p-2 transition-colors ${isStartMenuOpen ? 'bg-white/10' : 'hover:bg-white/10'}`}
                    aria-expanded={isStartMenuOpen}
                    aria-label="Open Start menu"
                >
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-[var(--os-accent)]/90 transition-transform group-hover:scale-105">
                        <LayoutGrid className="h-4 w-4 text-white" />
                    </div>
                </button>

                {isStartMenuOpen && (
                    <div ref={startMenuRef}>
                        <StartMenu
                            apps={filteredApps}
                            windows={windows}
                            query={startQuery}
                            onQueryChange={setStartQuery}
                            onLaunch={launchFromStartMenu}
                        />
                    </div>
                )}

                <div className="mx-1 h-6 w-px bg-slate-600/80" />
                <button className="os-hover-motion rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-slate-100">
                    <Search className="h-5 w-5" />
                </button>

                <button className="os-hover-motion relative rounded-lg border border-slate-600 bg-slate-800/90 p-2 shadow-sm transition-colors hover:bg-slate-700">
                    <Monitor className="h-5 w-5 text-[var(--os-accent)]" />
                    <div className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[var(--os-accent)]" />
                </button>

                {DEFAULT_APPS.map((app) => {
                    const isOpen = !!windows[app.id]
                    const winState = windows[app.id]?.state
                    const isFocused = winState?.isFocused
                    const isMinimized = winState?.isMinimized

                    const handleClick = () => {
                        setIsStartMenuOpen(false)
                        if (!isOpen) {
                            openWindow(app)
                        } else {
                            toggleMinimize(app.id)
                        }
                    }

                    return (
                        <button
                            key={app.id}
                            onClick={handleClick}
                            className={`os-hover-motion relative rounded-lg p-2 transition-colors ${isFocused ? 'border border-slate-600 bg-slate-800/90 shadow-sm' : 'text-slate-300 hover:bg-white/10 hover:text-slate-100'}`}
                            title={app.title}
                        >
                            <AppIcon appId={app.id} className={`h-5 w-5 ${isOpen && !isMinimized ? 'text-slate-100' : 'text-slate-400'}`} />
                            {isOpen && (
                                <div className={`absolute -bottom-1 left-1/2 h-1 -translate-x-1/2 rounded-full ${isFocused ? 'w-2 bg-[var(--os-accent)]' : 'w-1 bg-slate-500'}`}></div>
                            )}
                        </button>
                    )
                })}
            </div>

            <div className="flex items-center space-x-2 border-l border-slate-700 pl-3">
                <div className="os-hover-motion flex cursor-pointer space-x-1 rounded-md px-2 py-1 text-slate-300 transition-colors hover:bg-white/10 hover:text-slate-100">
                    <Wifi className="h-4 w-4" />
                    <Volume2 className="h-4 w-4" />
                    <BatteryCharging className="h-4 w-4" />
                </div>

                <div className="os-hover-motion flex cursor-pointer flex-col items-end rounded-md px-2 py-1 text-[10px] font-medium leading-tight text-slate-300 transition-colors hover:bg-white/10 hover:text-slate-100">
                    <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>{new Date().toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    )
}
