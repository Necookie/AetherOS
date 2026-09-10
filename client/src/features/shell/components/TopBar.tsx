import { useMemo, useState } from 'react'
import { Apple, BatteryCharging, Bell, ChevronDown, Download, Search, UserCircle2, Volume2, Wifi } from 'lucide-react'
import type { AccountProfile } from '../../accounts/types'

interface TopBarProps {
    now: Date
    showSeconds: boolean
    activeDownloads: number
    queuedDownloads: number
    unreadNotifications: number
    notificationsOpen: boolean
    activeAccount: AccountProfile
    accounts: AccountProfile[]
    onToggleLauncher: () => void
    onOpenDownloads: () => void
    onToggleQuickSettings: () => void
    onToggleDateTime: () => void
    onToggleNotifications: () => void
    onLockSession: () => void
    onLogout: () => void
    onSwitchUser: (userId: string) => void
}

export default function TopBar({
    now,
    showSeconds,
    activeDownloads,
    queuedDownloads,
    unreadNotifications,
    notificationsOpen,
    activeAccount,
    accounts,
    onToggleLauncher,
    onOpenDownloads,
    onToggleQuickSettings,
    onToggleDateTime,
    onToggleNotifications,
    onLockSession,
    onLogout,
    onSwitchUser,
}: TopBarProps) {
    const [menuOpen, setMenuOpen] = useState(false)

    const switchableAccounts = useMemo(
        () => accounts.filter((account) => account.id !== activeAccount.id),
        [accounts, activeAccount.id],
    )

    return (
        <header
            className="absolute left-0 right-0 top-0 z-[var(--ds-z-topbar)] flex h-[var(--shell-topbar-height)] items-center justify-between bg-void px-3 text-on-dark"
        >
            <div className="flex items-center gap-3 text-[12px]">
                <button className="rounded px-1 py-0.5 transition-transform active:scale-95 hover:bg-tile-1" aria-label="Apple menu">
                    <Apple className="h-4 w-4" />
                </button>
                <button className="rounded px-2 py-0.5 font-semibold transition-transform active:scale-95 hover:bg-tile-1">AetherOS</button>
                <button onClick={onToggleLauncher} className="hidden rounded px-2 py-0.5 transition-transform active:scale-95 hover:bg-tile-1 md:block">Go</button>
            </div>

            <div className="flex items-center gap-1 text-xs">
                <button className="rounded p-1 transition-transform active:scale-95 hover:bg-tile-1" onClick={onToggleQuickSettings} aria-label="Wi-Fi and volume">
                    <Wifi className="h-3.5 w-3.5" />
                </button>
                <button className="rounded p-1 transition-transform active:scale-95 hover:bg-tile-1" onClick={onToggleQuickSettings} aria-label="Sound settings">
                    <Volume2 className="h-3.5 w-3.5" />
                </button>
                <button className="rounded p-1 transition-transform active:scale-95 hover:bg-tile-1" onClick={onToggleQuickSettings} aria-label="Battery">
                    <BatteryCharging className="h-3.5 w-3.5" />
                </button>
                <button className="rounded p-1 transition-transform active:scale-95 hover:bg-tile-1" onClick={onToggleLauncher} aria-label="Spotlight">
                    <Search className="h-3.5 w-3.5" />
                </button>
                <button className="relative rounded p-1 transition-transform active:scale-95 hover:bg-tile-1" onClick={onOpenDownloads} aria-label="Downloads">
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
                <button className="rounded px-2 py-0.5 transition-transform active:scale-95 hover:bg-tile-1" onClick={onToggleDateTime} aria-label="Date and time">
                    {now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: showSeconds ? '2-digit' : undefined })}
                </button>

                <div className="relative ml-1">
                    <button
                        className="flex items-center gap-1 rounded px-2 py-0.5 transition-transform active:scale-95 hover:bg-tile-1"
                        aria-label="Account menu"
                        onClick={() => setMenuOpen((open) => !open)}
                    >
                        <UserCircle2 className="h-4 w-4" />
                        <span className="hidden sm:inline">{activeAccount.displayName}</span>
                        <ChevronDown className="h-3 w-3" />
                    </button>

                    {menuOpen ? (
                        <div className="absolute right-0 top-8 w-60 rounded-lg border border-white/10 bg-tile-1 p-2 text-[12px] text-on-dark">
                            <div className="mb-2 rounded-md bg-tile-2 px-2 py-1.5">
                                <p className="font-semibold">{activeAccount.displayName}</p>
                                <p className="uppercase tracking-[0.08em] text-on-dark-muted">{activeAccount.role}</p>
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
