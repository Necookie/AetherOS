import { Activity, BatteryCharging, Globe, LayoutGrid, Monitor, Search, Settings, Terminal, Volume2, Wifi } from 'lucide-react'
import { shallow } from 'zustand/shallow'
import { DEFAULT_APPS } from '../config/windows'
import { useWindowStore } from '../stores/windowStore'

export default function Taskbar() {
    const { windows, toggleMinimize, openWindow } = useWindowStore((state) => ({
        windows: state.windows,
        toggleMinimize: state.toggleMinimize,
        openWindow: state.openWindow,
    }), shallow)

    return (
        <div
            className="flex h-14 w-full max-w-4xl items-center justify-between rounded-xl px-3 text-[12px] shadow-2xl backdrop-blur"
            style={{
                background: 'color-mix(in oklab, var(--os-surface-0) 86%, black 14%)',
                border: '1px solid color-mix(in oklab, var(--os-border) 70%, black 30%)',
            }}
        >
            <div className="flex items-center space-x-1">
                <button className="group rounded-lg p-2 transition-colors hover:bg-white/10">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-[var(--os-accent)]/90 transition-transform group-hover:scale-105">
                        <LayoutGrid className="h-4 w-4 text-white" />
                    </div>
                </button>
                <div className="mx-1 h-6 w-px bg-slate-600/80" />
                <button className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-slate-100">
                    <Search className="h-5 w-5" />
                </button>

                <button className="relative rounded-lg border border-slate-600 bg-slate-800/90 p-2 shadow-sm transition-colors hover:bg-slate-700">
                    <Monitor className="h-5 w-5 text-[var(--os-accent)]" />
                    <div className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[var(--os-accent)]" />
                </button>

                {DEFAULT_APPS.map((app) => {
                    const isOpen = !!windows[app.id]
                    const winState = windows[app.id]?.state
                    const isFocused = winState?.isFocused
                    const isMinimized = winState?.isMinimized

                    const handleClick = () => {
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
                            className={`relative rounded-lg p-2 transition-colors ${isFocused ? 'border border-slate-600 bg-slate-800/90 shadow-sm' : 'text-slate-300 hover:bg-white/10 hover:text-slate-100'}`}
                            title={app.title}
                        >
                            {app.id === 'term' ? (
                                <Terminal className={`h-5 w-5 ${isOpen && !isMinimized ? 'text-slate-100' : 'text-slate-400'}`} />
                            ) : app.id === 'explorer' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${isOpen && !isMinimized ? 'text-slate-100' : 'text-slate-400'}`}><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" /></svg>
                            ) : app.id === 'taskmgr' ? (
                                <Activity className={`h-5 w-5 ${isOpen && !isMinimized ? 'text-slate-100' : 'text-slate-400'}`} />
                            ) : app.id === 'browser' ? (
                                <Globe className={`h-5 w-5 ${isOpen && !isMinimized ? 'text-slate-100' : 'text-slate-400'}`} />
                            ) : (
                                <Settings className={`h-5 w-5 ${isOpen && !isMinimized ? 'text-slate-100' : 'text-slate-400'}`} />
                            )}
                            {isOpen && (
                                <div className={`absolute -bottom-1 left-1/2 h-1 -translate-x-1/2 rounded-full ${isFocused ? 'w-2 bg-[var(--os-accent)]' : 'w-1 bg-slate-500'}`}></div>
                            )}
                        </button>
                    )
                })}
            </div>

            <div className="flex items-center space-x-2 border-l border-slate-700 pl-3">
                <div className="flex cursor-pointer space-x-1 rounded-md px-2 py-1 text-slate-300 transition-colors hover:bg-white/10 hover:text-slate-100">
                    <Wifi className="h-4 w-4" />
                    <Volume2 className="h-4 w-4" />
                    <BatteryCharging className="h-4 w-4" />
                </div>

                <div className="flex cursor-pointer flex-col items-end rounded-md px-2 py-1 text-[10px] font-medium leading-tight text-slate-300 transition-colors hover:bg-white/10 hover:text-slate-100">
                    <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>{new Date().toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    )
}
