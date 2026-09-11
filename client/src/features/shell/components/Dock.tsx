import { useMemo, useState } from 'react'
import { Maximize2, Minimize2 } from 'lucide-react'
import AetherLauncherMark from '../../../components/brand/AetherLauncherMark'
import { SHELL_APPS } from '../model/appCatalog'
import { ShellAppIcon } from '../model/appIcons'
import { useWindowStore } from '../../../stores/windowStore'
import { useAppRegistryStore } from '../../../stores/appRegistryStore'

interface DockProps {
    taskbarPosition: 'bottom' | 'top'
    onLaunchOrToggle: (appId: string) => void
    onToggleLauncher: () => void
}

export default function Dock({ taskbarPosition, onLaunchOrToggle, onToggleLauncher }: DockProps) {
    const windows = useWindowStore((state) => state.windows)
    const installed = useAppRegistryStore((state) => state.installed)
    const [previewAppId, setPreviewAppId] = useState<string | null>(null)
    const previewWindow = useMemo(() => (
        previewAppId ? windows[previewAppId] : undefined
    ), [previewAppId, windows])

    const visibleApps = useMemo(() => {
        return SHELL_APPS.filter((app) => Boolean(installed[app.id]) || Boolean(windows[app.id]))
    }, [installed, windows])

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
                <AetherLauncherMark className="h-6 w-6" />
            </button>

            <div className="mx-1 h-7 w-px bg-hairline" />

            <div
                className="grid flex-1 gap-1"
                style={{ gridTemplateColumns: `repeat(${visibleApps.length}, minmax(0, 1fr))` }}
            >
                {visibleApps.map((app) => {
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
                                className={`group relative flex h-10 w-12 flex-col items-center justify-center rounded-md text-ink transition-all active:scale-95 ${
                                    isFocused
                                        ? 'bg-surface shadow-xs'
                                        : isMinimized
                                            ? 'hover:bg-surface/80'
                                            : 'hover:bg-surface'
                                }`}
                                aria-label={isMinimized ? `${app.title} (Minimized)` : `Open ${app.title}`}
                                title={isMinimized ? `${app.title} (Minimized — Click to restore)` : app.title}
                            >
                                <div className={`transition-all duration-150 ${isMinimized ? 'opacity-70 scale-95' : 'opacity-100'}`}>
                                    <ShellAppIcon appId={app.id} className="h-6 w-6" />
                                </div>
                                {isOpen && (
                                    <span
                                        className={`absolute bottom-0.5 h-[3px] rounded-full transition-all duration-200 ${
                                            isFocused
                                                ? 'w-5 bg-primary shadow-[0_1px_4px_rgba(0,102,204,0.4)]'
                                                : isMinimized
                                                    ? 'w-3.5 bg-ink-muted-48/80'
                                                    : 'w-3.5 bg-ink-muted-48/60'
                                        }`}
                                    />
                                )}
                            </button>

                            {isPreviewing && previewWindow && (
                                <div className="pointer-events-none absolute bottom-12 left-1/2 z-[var(--ds-z-flyout)] w-56 -translate-x-1/2 rounded-lg border border-hairline bg-canvas p-2 text-left shadow-lg">
                                    <div className="mb-1 flex items-center justify-between text-[12px] font-semibold text-ink-muted-48">
                                        <span>{previewWindow.title}</span>
                                        {previewWindow.state.isMinimized ? (
                                            <span className="flex items-center gap-1 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                                                <Minimize2 className="h-2.5 w-2.5" /> Minimized
                                            </span>
                                        ) : previewWindow.state.isMaximized ? (
                                            <Maximize2 className="h-3 w-3" />
                                        ) : null}
                                    </div>
                                    <div className="rounded-md border border-hairline bg-parchment p-2">
                                        <p className="truncate text-xs font-semibold text-ink">{previewWindow.title}</p>
                                        <p className="mt-1 text-[12px] text-ink-muted-48">
                                            {Math.round(previewWindow.bounds.width)}x{Math.round(previewWindow.bounds.height)} px
                                        </p>
                                        <p className="mt-2 text-[12px] text-ink-muted">
                                            {previewWindow.state.isFocused
                                                ? 'Active window'
                                                : previewWindow.state.isMinimized
                                                    ? 'Minimized — click icon to restore'
                                                    : 'Click icon to restore focus'}
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
