import { useMemo, useState } from 'react'
import { Apple, BatteryCharging, Bell, ChevronDown, Search, UserCircle2, Volume2, Wifi } from 'lucide-react'
import type { AccountProfile } from '../../accounts/types'

interface TopBarProps {
    now: Date
    showSeconds: boolean
    unreadNotifications: number
    notificationsOpen: boolean
    activeAccount: AccountProfile
    accounts: AccountProfile[]
    onToggleLauncher: () => void
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
    unreadNotifications,
    notificationsOpen,
    activeAccount,
    accounts,
    onToggleLauncher,
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
            className="absolute left-0 right-0 top-0 z-[var(--ds-z-topbar)] flex h-[var(--shell-topbar-height)] items-center justify-between px-3 backdrop-blur-xl"
            style={{
                background: 'color-mix(in oklab, #111827 60%, transparent)',
                borderBottom: '1px solid color-mix(in oklab, white 16%, transparent)',
            }}
        >
            <div className="flex items-center gap-3 text-[13px] text-white/90">
                <button className="rounded px-1 py-0.5 hover:bg-white/20" aria-label="Apple menu">
                    <Apple className="h-4 w-4" />
                </button>
                <button className="rounded px-2 py-0.5 font-semibold hover:bg-white/20">AetherOS</button>
                <button onClick={onToggleLauncher} className="hidden rounded px-2 py-0.5 hover:bg-white/20 md:block">Go</button>
            </div>

            <div className="flex items-center gap-1 text-xs text-white/90">
                <button className="rounded p-1 hover:bg-white/20" onClick={onToggleQuickSettings} aria-label="Wi-Fi and volume">
                    <Wifi className="h-3.5 w-3.5" />
                </button>
                <button className="rounded p-1 hover:bg-white/20" onClick={onToggleQuickSettings} aria-label="Sound settings">
                    <Volume2 className="h-3.5 w-3.5" />
                </button>
                <button className="rounded p-1 hover:bg-white/20" onClick={onToggleQuickSettings} aria-label="Battery">
                    <BatteryCharging className="h-3.5 w-3.5" />
                </button>
                <button className="rounded p-1 hover:bg-white/20" onClick={onToggleLauncher} aria-label="Spotlight">
                    <Search className="h-3.5 w-3.5" />
                </button>
                <button
                    className={`relative rounded p-1 ${notificationsOpen ? 'bg-white/25' : 'hover:bg-white/20'}`}
                    onClick={onToggleNotifications}
                    aria-label="Notifications"
                >
                    <Bell className="h-3.5 w-3.5" />
                    {unreadNotifications > 0 ? (
                        <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-rose-500 px-1 text-center text-[10px] leading-4 text-white">
                            {unreadNotifications > 9 ? '9+' : unreadNotifications}
                        </span>
                    ) : null}
                </button>
                <button className="rounded px-2 py-0.5 hover:bg-white/20" onClick={onToggleDateTime} aria-label="Date and time">
                    {now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: showSeconds ? '2-digit' : undefined })}
                </button>

                <div className="relative ml-1">
                    <button
                        className="flex items-center gap-1 rounded px-2 py-0.5 hover:bg-white/20"
                        aria-label="Account menu"
                        onClick={() => setMenuOpen((open) => !open)}
                    >
                        <UserCircle2 className="h-4 w-4" />
                        <span className="hidden sm:inline">{activeAccount.displayName}</span>
                        <ChevronDown className="h-3 w-3" />
                    </button>

                    {menuOpen ? (
                        <div className="absolute right-0 top-8 w-60 rounded-xl border border-white/40 bg-slate-900/90 p-2 text-[11px] text-white shadow-2xl backdrop-blur-xl">
                            <div className="mb-2 rounded-lg bg-white/10 px-2 py-1.5">
                                <p className="font-semibold">{activeAccount.displayName}</p>
                                <p className="uppercase tracking-[0.08em] text-white/70">{activeAccount.role}</p>
                            </div>

                            {switchableAccounts.length > 0 ? (
                                <div className="mb-2 space-y-1">
                                    {switchableAccounts.map((account) => (
                                        <button
                                            key={account.id}
                                            className="w-full rounded-md px-2 py-1 text-left hover:bg-white/15"
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
                                className="mb-1 w-full rounded-md px-2 py-1 text-left hover:bg-white/15"
                                onClick={() => {
                                    onLockSession()
                                    setMenuOpen(false)
                                }}
                            >
                                Lock Screen
                            </button>
                            <button
                                className="w-full rounded-md px-2 py-1 text-left text-rose-200 hover:bg-rose-500/25"
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
