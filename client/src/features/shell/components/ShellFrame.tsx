import { useEffect, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { shallow } from 'zustand/shallow'
import { DEFAULT_APPS } from '../../../config/windows'
import { useWindowStore } from '../../../stores/windowStore'
import { useKernelStore } from '../../../stores/useKernelStore'
import { useSettingsStore } from '../../../stores/settingsStore'
import { createBackgroundJobScheduler } from '../../background-jobs'
import { productivityRepository } from '../../productivity'
import NotificationCenterFlyout from '../../notifications/components/NotificationCenterFlyout'
import { notificationService, useNotificationSnapshot } from '../../notifications'
import { downloadManagerService, useDownloadManagerSnapshot } from '../../downloads'
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
import { executeNotificationDeepLink } from '../../deep-links/executor'
import { registerNotificationDeepLinkExecutor } from '../../notifications/deepLinkRuntime'

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
    const downloadSnapshot = useDownloadManagerSnapshot()
    const [viewedMonth, setViewedMonth] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1))
    const schedulerRef = useRef(createBackgroundJobScheduler({ tickMs: 400 }))
    const seededNotificationsRef = useRef(false)
    const seededDownloadsRef = useRef(false)

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
        registerNotificationDeepLinkExecutor((link) => executeNotificationDeepLink(link, notificationService.publish))
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
        const firstNote = productivityRepository.listRecords('notes')[0]
            ?? productivityRepository.createRecord({
                appId: 'notes',
                title: 'Inbox',
                body: 'Capture quick ideas and alerts here.',
            })
        const firstDoc = productivityRepository.listRecords('docs')[0]
            ?? productivityRepository.createRecord({
                appId: 'docs',
                title: 'Release checklist',
                body: '<p>Track rollout notes and follow-up actions.</p>',
            })
        const firstBoard = productivityRepository.listRecords('boards')[0]
            ?? productivityRepository.createRecord({
                appId: 'boards',
                title: 'Sprint board',
                body: JSON.stringify({
                    columns: [
                        { id: 'todo', title: 'To do', cards: [{ id: 'card-1', title: 'Review alerts', description: '' }] },
                        { id: 'doing', title: 'Doing', cards: [] },
                        { id: 'done', title: 'Done', cards: [] },
                    ],
                }, null, 2),
            })

        notificationService.publish({
            title: 'Workspace actions ready',
            message: 'Notification actions now open the right app, window, and section.',
            source: 'AetherOS',
            groupKey: 'onboarding',
            priority: 'normal',
            deepLink: {
                kind: 'settings-section',
                section: 'behavior',
            },
            actions: [
                {
                    id: 'open-settings-behavior',
                    label: 'Open behavior',
                    tone: 'primary',
                    deepLink: {
                        kind: 'settings-section',
                        section: 'behavior',
                    },
                },
                {
                    id: 'open-taskmgr-performance',
                    label: 'Open Task Manager',
                    deepLink: {
                        kind: 'task-manager',
                        tab: 'Performance',
                    },
                },
            ],
        })
        notificationService.publish({
            title: 'Productivity space primed',
            message: 'Jump straight into your note, doc, or board from here.',
            source: 'Workspace',
            groupKey: 'onboarding',
            priority: 'normal',
            actions: [
                {
                    id: 'open-note',
                    label: 'Open note',
                    tone: 'primary',
                    deepLink: {
                        kind: 'productivity-record',
                        appId: 'notes',
                        recordId: firstNote.id,
                        panel: 'editor',
                    },
                },
                {
                    id: 'open-doc',
                    label: 'Open doc',
                    deepLink: {
                        kind: 'productivity-record',
                        appId: 'docs',
                        recordId: firstDoc.id,
                        panel: 'editor',
                    },
                },
                {
                    id: 'open-board',
                    label: 'Open board',
                    deepLink: {
                        kind: 'productivity-record',
                        appId: 'boards',
                        recordId: firstBoard.id,
                        panel: 'editor',
                    },
                },
            ],
        })
        notificationService.publish({
            title: 'Quick destinations',
            message: 'Browser and File Manager links now land in the right place.',
            source: 'Workspace',
            groupKey: 'onboarding',
            priority: 'low',
            actions: [
                {
                    id: 'open-browser-status',
                    label: 'Open browser',
                    tone: 'primary',
                    deepLink: {
                        kind: 'browser-url',
                        url: 'https://example.com/aetheros/guide',
                        reuseExistingTab: true,
                    },
                },
                {
                    id: 'reveal-documents',
                    label: 'Reveal Documents',
                    deepLink: {
                        kind: 'file-manager-path',
                        path: '/home/user/Documents/readme.txt',
                    },
                },
            ],
        })
    }, [])

    useEffect(() => {
        if (seededDownloadsRef.current || downloadManagerService.getSnapshot().items.length > 0) {
            return
        }

        seededDownloadsRef.current = true
        downloadManagerService.enqueue({
            id: 'demo-browser-guide',
            fileName: 'AetherOS_UI_kit.zip',
            destinationPath: '/home/user/Downloads/AetherOS_UI_kit.zip',
            totalBytes: 3_200_000,
            source: 'browser',
            sourceUrl: 'https://example.com/ui-kit.zip',
            simulation: {
                queueTicks: 0,
                progressPattern: [220_000, 260_000, 240_000, 280_000, 300_000],
            },
        })
        downloadManagerService.enqueue({
            id: 'demo-failed-log-bundle',
            fileName: 'perf-trace-bundle.tar',
            destinationPath: '/home/user/Downloads/perf-trace-bundle.tar',
            totalBytes: 2_100_000,
            source: 'system',
            maxRetries: 2,
            simulation: {
                queueTicks: 1,
                progressPattern: [180_000, 210_000, 190_000],
                failAtStepByAttempt: {
                    1: 4,
                },
            },
        })
        downloadManagerService.enqueue({
            id: 'demo-appstore-pack',
            fileName: 'illustration-pack.dmg',
            destinationPath: '/home/user/Downloads/illustration-pack.dmg',
            totalBytes: 4_600_000,
            source: 'app-store',
            simulation: {
                queueTicks: 2,
                progressPattern: [260_000, 290_000, 320_000, 350_000],
            },
        })
    }, [downloadSnapshot.items.length])

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
            actions: [
                {
                    id: 'open-permission-center',
                    label: 'Open Permission Center',
                    tone: 'primary',
                    deepLink: {
                        kind: 'settings-section',
                        section: 'permissions',
                    },
                },
            ],
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
        return (
            <div className="os-desktop-bg relative h-full w-full" aria-hidden="true" />
        )
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
                activeDownloads={downloadSnapshot.activeCount}
                queuedDownloads={downloadSnapshot.queuedCount}
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
                onOpenDownloads={() => {
                    const downloadsApp = appLookup.get('downloads')
                    if (!downloadsApp) {
                        return
                    }

                    setLauncherOpen(false)
                    setQuickSettingsOpen(false)
                    setDateTimeOpen(false)
                    setNotificationCenterOpen(false)
                    handleLaunchOrToggle(downloadsApp.id)
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
                        onClose={() => setLauncherOpen(false)}
                        executor={{
                            launchApp: launchFromMenu,
                            openDeepLink: (link) => executeNotificationDeepLink(link, notificationService.publish),
                            lockSession,
                        }}
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
