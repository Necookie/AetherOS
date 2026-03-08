import { Apple, BatteryCharging, Search, Volume2, Wifi } from 'lucide-react'

interface TopBarProps {
    now: Date
    showSeconds: boolean
    onToggleLauncher: () => void
    onToggleQuickSettings: () => void
    onToggleDateTime: () => void
}

export default function TopBar({
    now,
    showSeconds,
    onToggleLauncher,
    onToggleQuickSettings,
    onToggleDateTime,
}: TopBarProps) {
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
                <button className="rounded px-2 py-0.5 hover:bg-white/20" onClick={onToggleDateTime} aria-label="Date and time">
                    {now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: showSeconds ? '2-digit' : undefined })}
                </button>
            </div>
        </header>
    )
}
