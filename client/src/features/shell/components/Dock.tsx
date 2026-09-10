import { useMemo, useState } from 'react'
import { LayoutGrid, Maximize2, Minimize2 } from 'lucide-react'
import { SHELL_APPS } from '../model/appCatalog'
import { ShellAppIcon } from '../model/appIcons'
import { useWindowStore } from '../../../stores/windowStore'

interface DockProps {
    taskbarPosition: 'bottom' | 'top'
    onLaunchOrToggle: (appId: string) => void
    onToggleLauncher: () => void
}

export default function Dock({ taskbarPosition, onLaunchOrToggle, onToggleLauncher }: DockProps) {
    const windows = useWindowStore((state) => state.windows)
    const [previewAppId, setPreviewAppId] = useState<string | null>(null)
    const previewWindow = useMemo(() => (
        previewAppId ? windows[previewAppId] : undefined
    ), [previewAppId, windows])

    return (
        <nav
            className={`absolute left-1/2 z-[var(--ds-z-dock)] flex h-[var(--shell-dock-height)] w-[min(36rem,calc(100vw-1.5rem))] -translate-x-1/2 items-center gap-1 rounded-lg border border-hairline bg-[rgba(245,245,247,0.8)] px-2 backdrop-blur-frosted ${taskbarPosition === 'top' ? 'top-[calc(var(--shell-topbar-height)+var(--shell-edge-gap))]' : 'bottom-[var(--shell-edge-gap)]'}`}
            aria-label="AetherOS dock"
        >
            <button
                onClick={onToggleLauncher}
                className="flex h-10 w-10 items-center justify-center rounded-md bg-ink text-on-dark transition-transform active:scale-95"
                aria-label="Open app launcher"
            >
                <LayoutGrid className="h-4 w-4" />
            </button>

            <div className="mx-1 h-7 w-px bg-hairline" />

            <div
                className="grid flex-1 gap-1"
                style={{ gridTemplateColumns: `repeat(${SHELL_APPS.length}, minmax(0, 1fr))` }}
            >
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
                                className={`group relative flex h-10 w-12 items-center justify-center rounded-md text-ink transition-transform active:scale-95 ${
                                    isFocused ? 'bg-surface' : 'hover:bg-surface'
                                }`}
                                aria-label={`Open ${app.title}`}
                                title={app.title}
                            >
                                <ShellAppIcon appId={app.id} className="h-6 w-6" />
                                {isOpen && (
                                    <span className={`absolute -bottom-0.5 h-1 rounded-full ${isFocused ? 'w-4 bg-primary' : isMinimized ? 'w-1 bg-ink-muted-48' : 'w-2 bg-ink-muted-48'}`} />
                                )}
                            </button>

                            {isPreviewing && previewWindow && (
                                <div className="pointer-events-none absolute bottom-12 left-1/2 z-[var(--ds-z-flyout)] w-56 -translate-x-1/2 rounded-lg border border-hairline bg-canvas p-2 text-left">
                                    <div className="mb-1 flex items-center justify-between text-[12px] font-semibold text-ink-muted-48">
                                        <span>{previewWindow.title}</span>
                                        {previewWindow.state.isMaximized ? <Maximize2 className="h-3 w-3" /> : previewWindow.state.isMinimized ? <Minimize2 className="h-3 w-3" /> : null}
                                    </div>
                                    <div className="rounded-md border border-hairline bg-parchment p-2">
                                        <p className="truncate text-xs font-medium text-ink">{previewWindow.title}</p>
                                        <p className="mt-1 text-[12px] text-ink-muted-48">
                                            {Math.round(previewWindow.bounds.width)}x{Math.round(previewWindow.bounds.height)} px
                                        </p>
                                        <p className="mt-2 text-[12px] text-ink-muted">
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
