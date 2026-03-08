import { useEffect, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { shallow } from 'zustand/shallow'
import { DEFAULT_APPS } from '../../../config/windows'
import { useWindowStore } from '../../../stores/windowStore'
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
    const { windows, openWindow, toggleMinimize } = useWindowStore((state) => ({
        windows: state.windows,
        openWindow: state.openWindow,
        toggleMinimize: state.toggleMinimize,
    }), shallow)
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

        toggleMinimize(app.id)
    }

    const launchFromMenu = (appId: string) => {
        handleLaunchOrToggle(appId)
        setLauncherOpen(false)
    }

    return (
        <div className="os-desktop-bg relative h-full w-full overflow-hidden">
            <TopBar
                now={now}
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
                    top: 'var(--shell-topbar-height)',
                    bottom: 'calc(var(--shell-dock-height) + var(--shell-edge-gap) * 2)',
                }}
            >
                <DesktopIcons />
                <DesktopWindows />
            </main>

            <div ref={dockRef}>
                <Dock
                    windows={windows}
                    onLaunchOrToggle={handleLaunchOrToggle}
                    onToggleLauncher={() => {
                        setQuickSettingsOpen(false)
                        setDateTimeOpen(false)
                        setLauncherOpen((open) => !open)
                    }}
                />
            </div>

            {isLauncherOpen && (
                <div ref={launcherRef} className="absolute bottom-0 left-[var(--shell-edge-gap)] right-[var(--shell-edge-gap)]">
                    <AppLauncher
                        query={launcherQuery}
                        windows={windows}
                        onQueryChange={setLauncherQuery}
                        onLaunch={launchFromMenu}
                    />
                </div>
            )}

            {isQuickSettingsOpen && (
                <div ref={quickSettingsRef}>
                    <QuickSettingsFlyout />
                </div>
            )}

            {isDateTimeOpen && (
                <div ref={dateTimeRef}>
                    <DateTimeFlyout
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
