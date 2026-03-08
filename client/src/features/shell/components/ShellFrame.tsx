import { useEffect, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { shallow } from 'zustand/shallow'
import { DEFAULT_APPS } from '../../../config/windows'
import { useWindowStore } from '../../../stores/windowStore'
import { useSettingsStore } from '../../../stores/settingsStore'
import { getWallpaperCss } from '../../settings/themeEngine'
import DesktopIcons from '../../../components/desktop/DesktopIcons'
import DesktopWindows from '../../../components/desktop/DesktopWindows'
import { useShellClock } from '../hooks/useShellClock'
import AppLauncher from './AppLauncher'
import DateTimeFlyout from './DateTimeFlyout'
import Dock from './Dock'
import QuickSettingsFlyout from './QuickSettingsFlyout'
import TopBar from './TopBar'

function useClickOutside(
    refs: Array<RefObject<HTMLElement | null>>,
    enabled: boolean,
    onOutside: () => void,
) {
    useEffect(() => {
        if (!enabled) {
            return
        }

        const onPointerDown = (event: MouseEvent) => {
            const target = event.target as Node | null
            if (!target) {
                return
            }

            for (const ref of refs) {
                if (ref.current?.contains(target)) {
                    return
                }
            }

            onOutside()
        }

        const onEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onOutside()
            }
        }

        window.addEventListener('mousedown', onPointerDown)
        window.addEventListener('keydown', onEscape)
        return () => {
            window.removeEventListener('mousedown', onPointerDown)
            window.removeEventListener('keydown', onEscape)
        }
    }, [enabled, onOutside, refs])
}

export default function ShellFrame() {
    const { windows, focusedWindowId, openWindow, toggleMinimize, restoreWindow } = useWindowStore((state) => ({
        windows: state.windows,
        focusedWindowId: state.focusedWindowId,
        openWindow: state.openWindow,
        toggleMinimize: state.toggleMinimize,
        restoreWindow: state.restoreWindow,
    }), shallow)
    const wallpaperId = useSettingsStore((state) => state.appearance.wallpaperId)
    const iconScale = useSettingsStore((state) => state.desktop.iconScale)
    const taskbarPosition = useSettingsStore((state) => state.desktop.taskbarPosition)
    const showSecondsInClock = useSettingsStore((state) => state.behavior.showSecondsInClock)
    const [isLauncherOpen, setLauncherOpen] = useState(false)
    const [launcherQuery, setLauncherQuery] = useState('')
    const [isQuickSettingsOpen, setQuickSettingsOpen] = useState(false)
    const [isDateTimeOpen, setDateTimeOpen] = useState(false)
    const now = useShellClock()
    const [viewedMonth, setViewedMonth] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1))

    const dockRef = useRef<HTMLDivElement>(null)
    const launcherRef = useRef<HTMLDivElement>(null)
    const quickSettingsRef = useRef<HTMLDivElement>(null)
    const dateTimeRef = useRef<HTMLDivElement>(null)

    const appLookup = useMemo(
        () => new Map(DEFAULT_APPS.map((app) => [app.id, app])),
        [],
    )

    useClickOutside(
        [dockRef, launcherRef, quickSettingsRef, dateTimeRef],
        isLauncherOpen || isQuickSettingsOpen || isDateTimeOpen,
        () => {
            setLauncherOpen(false)
            setQuickSettingsOpen(false)
            setDateTimeOpen(false)
        },
    )

    useEffect(() => {
        if (!isLauncherOpen) {
            setLauncherQuery('')
        }
    }, [isLauncherOpen])

    const handleLaunchOrToggle = (appId: string) => {
        const app = appLookup.get(appId)
        if (!app) {
            return
        }

        if (!windows[app.id]) {
            openWindow(app)
            return
        }

        if (focusedWindowId === app.id && !windows[app.id].state.isMinimized) {
            toggleMinimize(app.id)
            return
        }

        restoreWindow(app.id)
    }

    const launchFromMenu = (appId: string) => {
        handleLaunchOrToggle(appId)
        setLauncherOpen(false)
    }

    return (
        <div
            className="os-desktop-bg relative h-full w-full overflow-hidden"
            style={{
                backgroundImage: getWallpaperCss(wallpaperId),
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <TopBar
                now={now}
                showSeconds={showSecondsInClock}
                onToggleLauncher={() => {
                    setQuickSettingsOpen(false)
                    setDateTimeOpen(false)
                    setLauncherOpen((open) => !open)
                }}
                onToggleQuickSettings={() => {
                    setLauncherOpen(false)
                    setDateTimeOpen(false)
                    setQuickSettingsOpen((open) => !open)
                }}
                onToggleDateTime={() => {
                    setLauncherOpen(false)
                    setQuickSettingsOpen(false)
                    setDateTimeOpen((open) => !open)
                    setViewedMonth(new Date(now.getFullYear(), now.getMonth(), 1))
                }}
            />

            <main
                className="absolute inset-x-0 z-[var(--ds-z-desktop)]"
                style={{
                    top: taskbarPosition === 'top'
                        ? 'calc(var(--shell-topbar-height) + var(--shell-dock-height) + var(--shell-edge-gap) * 2)'
                        : 'var(--shell-topbar-height)',
                    bottom: taskbarPosition === 'bottom' ? 'calc(var(--shell-dock-height) + var(--shell-edge-gap) * 2)' : 'var(--shell-edge-gap)',
                }}
            >
                <DesktopIcons iconScale={iconScale} />
                <DesktopWindows />
            </main>

            <div ref={dockRef}>
                <Dock
                    windows={windows}
                    taskbarPosition={taskbarPosition}
                    onLaunchOrToggle={handleLaunchOrToggle}
                    onToggleLauncher={() => {
                        setQuickSettingsOpen(false)
                        setDateTimeOpen(false)
                        setLauncherOpen((open) => !open)
                    }}
                />
            </div>

            {isLauncherOpen && (
                <div
                    ref={launcherRef}
                    className="absolute left-[var(--shell-edge-gap)] right-[var(--shell-edge-gap)]"
                    style={taskbarPosition === 'top' ? { top: 0 } : { bottom: 0 }}
                >
                    <AppLauncher
                        taskbarPosition={taskbarPosition}
                        query={launcherQuery}
                        windows={windows}
                        onQueryChange={setLauncherQuery}
                        onLaunch={launchFromMenu}
                    />
                </div>
            )}

            {isQuickSettingsOpen && (
                <div ref={quickSettingsRef}>
                    <QuickSettingsFlyout taskbarPosition={taskbarPosition} />
                </div>
            )}

            {isDateTimeOpen && (
                <div ref={dateTimeRef}>
                    <DateTimeFlyout
                        taskbarPosition={taskbarPosition}
                        showSeconds={showSecondsInClock}
                        now={now}
                        viewedMonth={viewedMonth}
                        onBackMonth={() => setViewedMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                        onForwardMonth={() => setViewedMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                    />
                </div>
            )}
        </div>
    )
}
