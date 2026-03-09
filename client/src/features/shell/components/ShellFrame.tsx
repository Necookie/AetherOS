import { useEffect, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { shallow } from 'zustand/shallow'
import { DEFAULT_APPS } from '../../../config/windows'
import { useWindowStore } from '../../../stores/windowStore'
import { useKernelStore } from '../../../stores/useKernelStore'
import { useSettingsStore } from '../../../stores/settingsStore'
import { createBackgroundJobScheduler } from '../../background-jobs'
import NotificationCenterFlyout from '../../notifications/components/NotificationCenterFlyout'
import { notificationService, useNotificationSnapshot } from '../../notifications'
import { getWallpaperCss } from '../../settings/themeEngine'
import WidgetBoard from '../../widgets/components/WidgetBoard'
import DesktopIcons from '../../../components/desktop/DesktopIcons'
import DesktopWindows from '../../../components/desktop/DesktopWindows'
import { useShellClock } from '../hooks/useShellClock'
import { registerShellJobs } from '../services/registerShellJobs'
import AppLauncher from './AppLauncher'
import DateTimeFlyout from './DateTimeFlyout'
import Dock from './Dock'
import QuickSettingsFlyout from './QuickSettingsFlyout'
import TopBar from './TopBar'
import { useSessionStore } from '../../../stores/useSessionStore'
import { getActiveAccount } from '../../accounts/services/sessionSelectors'
import { SHORTCUT_EVENT_LAUNCHER_TOGGLE } from '../../shortcuts/shortcutEvents'
import DirtyGuardModal from '../../dirty-guard/components/DirtyGuardModal'

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
    const { focusedWindowId, openWindow, toggleMinimize, restoreWindow, lastGuardError } = useWindowStore((state) => ({
        focusedWindowId: state.focusedWindowId,
        openWindow: state.openWindow,
        toggleMinimize: state.toggleMinimize,
        restoreWindow: state.restoreWindow,
        lastGuardError: state.lastGuardError,
    }), shallow)
    const wallpaperId = useSettingsStore((state) => state.appearance.wallpaperId)
    const iconScale = useSettingsStore((state) => state.desktop.iconScale)
    const taskbarPosition = useSettingsStore((state) => state.desktop.taskbarPosition)
    const showSecondsInClock = useSettingsStore((state) => state.behavior.showSecondsInClock)
    const sessionAccounts = useSessionStore((state) => state.accounts)
    const activeUserId = useSessionStore((state) => state.activeUserId)
    const lockSession = useSessionStore((state) => state.lockSession)
    const logout = useSessionStore((state) => state.logout)
    const selectLoginUser = useSessionStore((state) => state.selectLoginUser)
    const [isLauncherOpen, setLauncherOpen] = useState(false)
    const [launcherQuery, setLauncherQuery] = useState('')
    const [isQuickSettingsOpen, setQuickSettingsOpen] = useState(false)
    const [isDateTimeOpen, setDateTimeOpen] = useState(false)
    const [isNotificationCenterOpen, setNotificationCenterOpen] = useState(false)
    const now = useShellClock()
    const { unreadCount } = useNotificationSnapshot()
    const [viewedMonth, setViewedMonth] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1))
    const schedulerRef = useRef(createBackgroundJobScheduler({ tickMs: 400 }))
    const seededNotificationsRef = useRef(false)

    const dockRef = useRef<HTMLDivElement>(null)
    const launcherRef = useRef<HTMLDivElement>(null)
    const quickSettingsRef = useRef<HTMLDivElement>(null)
    const dateTimeRef = useRef<HTMLDivElement>(null)
    const notificationCenterRef = useRef<HTMLDivElement>(null)

    const appLookup = useMemo(
        () => new Map(DEFAULT_APPS.map((app) => [app.id, app])),
        [],
    )
    const activeAccount = getActiveAccount({ activeUserId, accounts: sessionAccounts })

    useClickOutside(
        [dockRef, launcherRef, quickSettingsRef, dateTimeRef, notificationCenterRef],
        isLauncherOpen || isQuickSettingsOpen || isDateTimeOpen || isNotificationCenterOpen,
        () => {
            setLauncherOpen(false)
            setQuickSettingsOpen(false)
            setDateTimeOpen(false)
            setNotificationCenterOpen(false)
        },
    )

    useEffect(() => {
        if (!isLauncherOpen) {
            setLauncherQuery('')
        }
    }, [isLauncherOpen])

    useEffect(() => {
        const onToggleLauncher = () => {
            setQuickSettingsOpen(false)
            setDateTimeOpen(false)
            setNotificationCenterOpen(false)
            setLauncherOpen((open) => !open)
        }

        window.addEventListener(SHORTCUT_EVENT_LAUNCHER_TOGGLE, onToggleLauncher)
        return () => window.removeEventListener(SHORTCUT_EVENT_LAUNCHER_TOGGLE, onToggleLauncher)
    }, [])

    useEffect(() => {
        const scheduler = schedulerRef.current
        const unregisterJobs = registerShellJobs({
            scheduler,
            publishNotification: notificationService.publish,
            getMetrics: () => {
                const state = useKernelStore.getState()
                return {
                    cpuUsage: state.cpuUsage,
                    memUsage: state.memUsage,
                    networkLatencyMs: state.networkLatencyMs,
                }
            },
        })

        scheduler.start()

        return () => {
            unregisterJobs()
            scheduler.stop()
        }
    }, [])

    useEffect(() => {
        if (seededNotificationsRef.current) {
            return
        }

        seededNotificationsRef.current = true
        notificationService.publish({
            title: 'Welcome to Phase 7',
            message: 'Notification Center, Widgets, and Background Jobs are now active.',
            source: 'AetherOS',
            groupKey: 'onboarding',
            priority: 'normal',
            actions: [
                {
                    id: 'open-settings',
                    label: 'Open Settings',
                    tone: 'primary',
                    onInvoke: () => {
                        const app = appLookup.get('settings')
                        if (!app) {
                            return
                        }

                        const windowState = useWindowStore.getState()
                        if (!windowState.windows.settings) {
                            windowState.openWindow(app)
                        } else {
                            windowState.restoreWindow('settings')
                        }
                    },
                },
                {
                    id: 'open-taskmgr',
                    label: 'Open Task Manager',
                    tone: 'default',
                    onInvoke: () => {
                        const app = appLookup.get('taskmgr')
                        if (!app) {
                            return
                        }

                        const windowState = useWindowStore.getState()
                        if (!windowState.windows.taskmgr) {
                            windowState.openWindow(app)
                        } else {
                            windowState.restoreWindow('taskmgr')
                        }
                    },
                },
            ],
        })
    }, [appLookup])

    useEffect(() => {
        if (!lastGuardError) {
            return
        }

        notificationService.publish({
            title: 'Access denied',
            message: lastGuardError,
            source: 'Permissions',
            priority: 'high',
            groupKey: 'permissions',
        })
    }, [lastGuardError])

    const handleLaunchOrToggle = (appId: string) => {
        const app = appLookup.get(appId)
        if (!app) {
            return
        }

        const windows = useWindowStore.getState().windows
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

    if (!activeAccount) {
        return null
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
                unreadNotifications={unreadCount}
                notificationsOpen={isNotificationCenterOpen}
                activeAccount={activeAccount}
                accounts={sessionAccounts}
                onToggleLauncher={() => {
                    setQuickSettingsOpen(false)
                    setDateTimeOpen(false)
                    setNotificationCenterOpen(false)
                    setLauncherOpen((open) => !open)
                }}
                onToggleQuickSettings={() => {
                    setLauncherOpen(false)
                    setDateTimeOpen(false)
                    setNotificationCenterOpen(false)
                    setQuickSettingsOpen((open) => !open)
                }}
                onToggleDateTime={() => {
                    setLauncherOpen(false)
                    setQuickSettingsOpen(false)
                    setNotificationCenterOpen(false)
                    setDateTimeOpen((open) => !open)
                    setViewedMonth(new Date(now.getFullYear(), now.getMonth(), 1))
                }}
                onToggleNotifications={() => {
                    setLauncherOpen(false)
                    setQuickSettingsOpen(false)
                    setDateTimeOpen(false)
                    setNotificationCenterOpen((open) => !open)
                }}
                onLockSession={lockSession}
                onLogout={logout}
                onSwitchUser={(userId) => {
                    selectLoginUser(userId)
                    lockSession()
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
                <WidgetBoard />
                <DesktopWindows />
            </main>

            <div ref={dockRef}>
                <Dock
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

            {isNotificationCenterOpen && (
                <div ref={notificationCenterRef}>
                    <NotificationCenterFlyout />
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
            <DirtyGuardModal />
        </div>
    )
}
