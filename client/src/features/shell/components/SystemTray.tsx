import { BatteryCharging, Volume2, Wifi } from 'lucide-react'

interface SystemTrayProps {
    now: Date
    onToggleQuickSettings: () => void
    onToggleDateTime: () => void
}

export default function SystemTray({
    now,
    onToggleQuickSettings,
    onToggleDateTime,
}: SystemTrayProps) {
    return (
        <div className="absolute bottom-[calc(var(--shell-edge-gap)+0.25rem)] right-[var(--shell-edge-gap)] z-[var(--ds-z-dock)] hidden items-center gap-1 rounded-lg px-1 py-1 text-xs text-[var(--ds-color-text-muted)] md:flex">
            <button
                onClick={onToggleQuickSettings}
                className="ds-surface-subtle flex items-center gap-1 rounded-md px-2 py-1.5 hover:bg-slate-700/55"
                aria-label="Open quick settings"
            >
                <Wifi className="h-3.5 w-3.5" />
                <Volume2 className="h-3.5 w-3.5" />
                <BatteryCharging className="h-3.5 w-3.5" />
            </button>

            <button
                onClick={onToggleDateTime}
                className="ds-surface-subtle rounded-md px-2 py-1.5 text-right leading-tight hover:bg-slate-700/55"
                aria-label="Open date and time"
            >
                <p className="text-[11px] text-[var(--ds-color-text-primary)]">
                    {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p>{now.toLocaleDateString()}</p>
            </button>
        </div>
    )
}
