import { memo, useState } from 'react'
import { LayoutGrid, Maximize2, Minimize2 } from 'lucide-react'
import { shallow } from 'zustand/shallow'
import { SHELL_APPS } from '../model/appCatalog'
import { ShellAppIcon } from '../model/appIcons'
import { selectWindowStatusById } from '../../window-manager/selectors'
import { useWindowStore } from '../../../stores/windowStore'

interface DockProps {
    taskbarPosition: 'bottom' | 'top'
    onLaunchOrToggle: (appId: string) => void
    onToggleLauncher: () => void
}

interface DockAppButtonProps {
    app: typeof SHELL_APPS[number]
    isPreviewing: boolean
    onLaunchOrToggle: (appId: string) => void
    onPreviewChange: (appId: string | null) => void
}

const DockAppButton = memo(function DockAppButton({
    app,
    isPreviewing,
    onLaunchOrToggle,
    onPreviewChange,
}: DockAppButtonProps) {
    const windowStatus = useWindowStore(selectWindowStatusById(app.id), shallow)

    return (
        <div
            className="relative flex items-center justify-center"
            onMouseEnter={() => windowStatus.isOpen && onPreviewChange(app.id)}
            onMouseLeave={() => {
                if (isPreviewing) {
                    onPreviewChange(null)
                }
            }}
        >
            <button
                onClick={() => onLaunchOrToggle(app.id)}
                className={`os-interactive group relative flex h-10 w-12 items-center justify-center rounded-xl transition-all ${
                    windowStatus.isFocused ? 'bg-white/35 ring-1 ring-white/40' : 'hover:bg-white/25'
                }`}
                aria-label={`Open ${app.title}`}
                title={app.title}
            >
                <ShellAppIcon appId={app.id} className="h-8 w-8 transition-transform group-hover:scale-110" />
                {windowStatus.isOpen && (
                    <span className={`absolute -bottom-0.5 h-1 rounded-full ${windowStatus.isFocused ? 'w-4 bg-[var(--os-accent)]' : windowStatus.isMinimized ? 'w-1 bg-slate-500/70' : 'w-2 bg-slate-900/80'}`} />
                )}
            </button>

            {isPreviewing && windowStatus.isOpen && windowStatus.title && (
                <div className="animate-os-flyout-in pointer-events-none absolute bottom-12 left-1/2 z-[var(--ds-z-flyout)] w-56 -translate-x-1/2 rounded-xl border border-white/50 bg-white/75 p-2 text-left shadow-xl backdrop-blur-xl">
                    <div className="mb-1 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                        <span>{windowStatus.title}</span>
                        {windowStatus.isMaximized ? <Maximize2 className="h-3 w-3" /> : windowStatus.isMinimized ? <Minimize2 className="h-3 w-3" /> : null}
                    </div>
                    <div className="rounded-lg border border-slate-300/80 bg-gradient-to-br from-slate-100 to-slate-200 p-2">
                        <p className="truncate text-xs font-medium text-slate-700">{windowStatus.title}</p>
                        <p className="mt-1 text-[11px] text-slate-500">
                            {Math.round(windowStatus.width)}x{Math.round(windowStatus.height)} px
                        </p>
                        <p className="mt-2 text-[11px] text-slate-600">
                            {windowStatus.isFocused ? 'Active window' : 'Click icon to restore focus'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
})

export default function Dock({ taskbarPosition, onLaunchOrToggle, onToggleLauncher }: DockProps) {
    const [previewAppId, setPreviewAppId] = useState<string | null>(null)

    return (
        <nav
            className={`absolute left-1/2 z-[var(--ds-z-dock)] flex h-[var(--shell-dock-height)] w-[min(36rem,calc(100vw-1.5rem))] -translate-x-1/2 items-center gap-1 rounded-2xl px-2 backdrop-blur-2xl ${taskbarPosition === 'top' ? 'top-[calc(var(--shell-topbar-height)+var(--shell-edge-gap))]' : 'bottom-[var(--shell-edge-gap)]'}`}
            style={{
                background: 'linear-gradient(180deg, rgb(255 255 255 / 0.35), rgb(255 255 255 / 0.16))',
                border: '1px solid rgb(255 255 255 / 0.45)',
                boxShadow: '0 20px 35px rgb(15 23 42 / 0.35)',
            }}
            aria-label="AetherOS dock"
        >
            <button
                onClick={onToggleLauncher}
                className="os-interactive group flex h-10 w-10 items-center justify-center rounded-xl bg-white/55 text-slate-900 transition-transform hover:scale-110"
                aria-label="Open app launcher"
            >
                <LayoutGrid className="h-4 w-4" />
            </button>

            <div className="mx-1 h-7 w-px bg-slate-500/30" />

            <div
                className="grid flex-1 gap-1"
                style={{ gridTemplateColumns: `repeat(${SHELL_APPS.length}, minmax(0, 1fr))` }}
            >
                {SHELL_APPS.map((app) => (
                    <DockAppButton
                        key={app.id}
                        app={app}
                        isPreviewing={previewAppId === app.id}
                        onLaunchOrToggle={onLaunchOrToggle}
                        onPreviewChange={setPreviewAppId}
                    />
                ))}
            </div>
        </nav>
    )
}
