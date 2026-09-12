import { useEffect, useMemo, useRef, useState } from 'react'
import { BatteryCharging, Bell, ChevronDown, Download, Layers, Maximize2, Minimize2, Search, UserCircle2, Volume2, Wifi } from 'lucide-react'
import type { AccountProfile } from '../../accounts/types'
import AetherMark from '../../../components/brand/AetherMark'
import { toggleFullscreen, useFullscreen } from '../../../services/fullscreenService'
import { useAppRegistryStore } from '../../../stores/appRegistryStore'

interface TopBarProps {
    now: Date
    showSeconds: boolean
    activeDownloads: number
    queuedDownloads: number
    unreadNotifications: number
    notificationsOpen: boolean
    widgetsOpen?: boolean
    activeAccount: AccountProfile
    accounts: AccountProfile[]
    onToggleLauncher: () => void
    onOpenDownloads: () => void
    onToggleQuickSettings: () => void
    onToggleDateTime: () => void
    onToggleNotifications: () => void
    onToggleWidgets?: () => void
    onLockSession: () => void
    onLogout: () => void
    onSwitchUser: (userId: string) => void
    onOpenAbout?: () => void
    onOpenSettings?: () => void
    onOpenTaskMgr?: () => void
    onOpenOsLab?: () => void
    onRestartShell?: () => void
}

export default function TopBar({
    now,
    showSeconds,
    activeDownloads,
    queuedDownloads,
    unreadNotifications,
    notificationsOpen,
    widgetsOpen,
    activeAccount,
    accounts,
    onToggleLauncher,
    onOpenDownloads,
    onToggleQuickSettings,
    onToggleDateTime,
    onToggleNotifications,
    onToggleWidgets,
    onLockSession,
    onLogout,
    onSwitchUser,
    onOpenAbout,
    onOpenSettings,
    onOpenTaskMgr,
    onOpenOsLab,
    onRestartShell,
}: TopBarProps) {
    const [menuOpen, setMenuOpen] = useState(false)
    const [systemMenuOpen, setSystemMenuOpen] = useState(false)
    const isFullscreenActive = useFullscreen()
    const installed = useAppRegistryStore((state) => state.installed)
    const systemMenuRef = useRef<HTMLDivElement>(null)
    const accountMenuRef = useRef<HTMLDivElement>(null)

    const switchableAccounts = useMemo(
        () => (accounts || []).filter((account) => account.id !== activeAccount?.id),
        [accounts, activeAccount?.id],
    )

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node | null
            if (!target) {
                return
            }

            if (systemMenuRef.current && !systemMenuRef.current.contains(target)) {
                setSystemMenuOpen(false)
            }
            if (accountMenuRef.current && !accountMenuRef.current.contains(target)) {
                setMenuOpen(false)
            }
        }

        window.addEventListener('mousedown', handleClickOutside)
        return () => window.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <header
            className="absolute left-0 right-0 top-0 z-[var(--ds-z-topbar)] flex h-[var(--shell-topbar-height)] items-center justify-between bg-void px-3 text-on-dark"
        >
            <div ref={systemMenuRef} className="relative flex items-center gap-2 text-[12px]">
                <button
                    className={`flex items-center gap-1.5 rounded px-2 py-0.5 transition-transform active:scale-95 ${
                        systemMenuOpen ? 'bg-tile-2' : 'hover:bg-tile-1'
                    }`}
                    aria-label="AetherOS system menu"
                    onClick={() => {
                        setMenuOpen(false)
                        setSystemMenuOpen((open) => !open)
                    }}
                >
                    <AetherMark className="h-4 w-4 text-primary" />
                    <span className="font-semibold">AetherOS</span>
                </button>
                <button
                    onClick={onToggleLauncher}
                    className="hidden rounded px-2 py-0.5 transition-transform active:scale-95 hover:bg-tile-1 md:block"
                >
                    Go
                </button>

                {systemMenuOpen && (
                    <div className="absolute left-0 top-8 w-56 rounded-lg border border-white/10 bg-tile-1 p-1.5 text-[12px] text-on-dark shadow-elevated">
                        <button
                            className="w-full rounded px-2.5 py-1.5 text-left font-semibold transition-colors hover:bg-tile-2"
                            onClick={() => {
                                setSystemMenuOpen(false)
                                onOpenAbout?.()
                            }}
                        >
                            About AetherOS
                        </button>
                        <div className="my-1 border-b border-white/10" />
                        <button
                            className="w-full rounded px-2.5 py-1.5 text-left transition-colors hover:bg-tile-2"
                            onClick={() => {
                                setSystemMenuOpen(false)
                                onOpenSettings?.()
                            }}
                        >
                            System Settings...
                        </button>
                        <button
                            className="w-full rounded px-2.5 py-1.5 text-left transition-colors hover:bg-tile-2"
                            onClick={() => {
                                setSystemMenuOpen(false)
                                onOpenTaskMgr?.()
                            }}
                        >
                            Task Manager
                        </button>
                        {installed['os-lab'] && (
                            <button
                                className="w-full rounded px-2.5 py-1.5 text-left transition-colors hover:bg-tile-2"
                                onClick={() => {
                                    setSystemMenuOpen(false)
                                    onOpenOsLab?.()
                                }}
                            >
                                OS Simulation Lab
                            </button>
                        )}
                        <div className="my-1 border-b border-white/10" />
                        <button
                            className="w-full rounded px-2.5 py-1.5 text-left transition-colors hover:bg-tile-2"
                            onClick={() => {
                                setSystemMenuOpen(false)
                                toggleFullscreen()
                            }}
                        >
                            {isFullscreenActive ? 'Exit Fullscreen' : 'Enter Fullscreen (F11)'}
                        </button>
                        <div className="my-1 border-b border-white/10" />
                        <button
                            className="w-full rounded px-2.5 py-1.5 text-left transition-colors hover:bg-tile-2"
                            onClick={() => {
                                setSystemMenuOpen(false)
                                onLockSession()
                            }}
                        >
                            Sleep / Lock Screen
                        </button>
                        <button
                            className="w-full rounded px-2.5 py-1.5 text-left transition-colors hover:bg-tile-2"
                            onClick={() => {
                                setSystemMenuOpen(false)
                                onRestartShell?.()
                            }}
                        >
                            Restart Desktop Shell
                        </button>
                        <button
                            className="w-full rounded px-2.5 py-1.5 text-left text-danger transition-colors hover:bg-tile-2"
                            onClick={() => {
                                setSystemMenuOpen(false)
                                onLogout()
                            }}
                        >
                            Sign Out {activeAccount?.displayName ?? ''}...
                        </button>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-1 text-xs">
                <button
                    className="rounded p-1 transition-transform active:scale-95 hover:bg-tile-1"
                    onClick={onToggleQuickSettings}
                    aria-label="Wi-Fi and network"
                >
                    <Wifi className="h-3.5 w-3.5" />
                </button>
                <button
                    className="rounded p-1 transition-transform active:scale-95 hover:bg-tile-1"
                    onClick={onToggleQuickSettings}
                    aria-label="Sound settings"
                >
                    <Volume2 className="h-3.5 w-3.5" />
                </button>
                <button
                    className="rounded p-1 transition-transform active:scale-95 hover:bg-tile-1"
                    onClick={onToggleQuickSettings}
                    aria-label="Battery"
                >
                    <BatteryCharging className="h-3.5 w-3.5" />
                </button>
                <button
                    className="rounded p-1 transition-transform active:scale-95 hover:bg-tile-1"
                    onClick={onToggleLauncher}
                    aria-label="Search"
                >
                    <Search className="h-3.5 w-3.5" />
                </button>
                <button
                    className="rounded p-1 transition-transform active:scale-95 hover:bg-tile-1"
                    onClick={() => toggleFullscreen()}
                    aria-label={isFullscreenActive ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                    title={isFullscreenActive ? 'Exit Fullscreen (F11 / Esc)' : 'Enter Fullscreen (F11)'}
                >
                    {isFullscreenActive ? (
                        <Minimize2 className="h-3.5 w-3.5 text-primary-focus" />
                    ) : (
                        <Maximize2 className="h-3.5 w-3.5" />
                    )}
                </button>
                <button
                    className="relative rounded p-1 transition-transform active:scale-95 hover:bg-tile-1"
                    onClick={onOpenDownloads}
                    aria-label="Downloads"
                >
                    <Download className="h-3.5 w-3.5" />
                    {activeDownloads + queuedDownloads > 0 ? (
                        <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-primary px-1 text-center text-[10px] leading-4 text-on-dark">
                            {activeDownloads + queuedDownloads > 9 ? '9+' : activeDownloads + queuedDownloads}
                        </span>
                    ) : null}
                </button>
                <button
                    className={`relative rounded p-1 transition-transform active:scale-95 ${notificationsOpen ? 'bg-tile-2' : 'hover:bg-tile-1'}`}
                    onClick={onToggleNotifications}
                    aria-label="Notifications"
                >
                    <Bell className="h-3.5 w-3.5" />
                    {unreadNotifications > 0 ? (
                        <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-primary px-1 text-center text-[10px] leading-4 text-on-dark">
                            {unreadNotifications > 9 ? '9+' : unreadNotifications}
                        </span>
                    ) : null}
                </button>
                {onToggleWidgets && (
                    <button
                        className={`relative rounded p-1 transition-transform active:scale-95 ${widgetsOpen ? 'bg-tile-2 text-primary-focus' : 'hover:bg-tile-1'}`}
                        onClick={onToggleWidgets}
                        aria-label="Toggle Widgets Drawer"
                        title={widgetsOpen ? 'Hide Widgets Drawer' : 'Show Widgets Drawer'}
                    >
                        <Layers className="h-3.5 w-3.5" />
                    </button>
                )}
                <button
                    className="rounded px-2 py-0.5 transition-transform active:scale-95 hover:bg-tile-1"
                    onClick={onToggleDateTime}
                    aria-label="Date and time"
                >
                    {now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}{' '}
                    {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: showSeconds ? '2-digit' : undefined })}
                </button>

                <div ref={accountMenuRef} className="relative ml-1">
                    <button
                        className={`flex items-center gap-1 rounded px-2 py-0.5 transition-transform active:scale-95 ${
                            menuOpen ? 'bg-tile-2' : 'hover:bg-tile-1'
                        }`}
                        aria-label="Account menu"
                        onClick={() => {
                            setSystemMenuOpen(false)
                            setMenuOpen((open) => !open)
                        }}
                    >
                        <UserCircle2 className="h-4 w-4" />
                        <span className="hidden sm:inline">{activeAccount?.displayName ?? 'User'}</span>
                        <ChevronDown className="h-3 w-3" />
                    </button>

                    {menuOpen ? (
                        <div className="absolute right-0 top-8 w-60 rounded-lg border border-white/10 bg-tile-1 p-2 text-[12px] text-on-dark shadow-elevated">
                            <div className="mb-2 rounded-md bg-tile-2 px-2 py-1.5">
                                <p className="font-semibold">{activeAccount?.displayName ?? 'User'}</p>
                                <p className="uppercase tracking-[0.08em] text-on-dark-muted">{activeAccount?.role ?? 'User'}</p>
                            </div>

                            {switchableAccounts.length > 0 ? (
                                <div className="mb-2 space-y-1">
                                    {switchableAccounts.map((account) => (
                                        <button
                                            key={account.id}
                                            className="w-full rounded px-2 py-1 text-left transition-colors hover:bg-tile-2"
                                            onClick={() => {
                                                onSwitchUser(account.id)
                                                setMenuOpen(false)
                                            }}
                                        >
                                            Switch to {account.displayName}
                                        </button>
                                    ))}
                                </div>
                            ) : null}

                            <button
                                className="mb-1 w-full rounded px-2 py-1 text-left transition-colors hover:bg-tile-2"
                                onClick={() => {
                                    onLockSession()
                                    setMenuOpen(false)
                                }}
                            >
                                Lock Screen
                            </button>
                            <button
                                className="w-full rounded px-2 py-1 text-left text-danger transition-colors hover:bg-tile-2"
                                onClick={() => {
                                    onLogout()
                                    setMenuOpen(false)
                                }}
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : null}
                </div>
            </div>
        </header>
    )
}
