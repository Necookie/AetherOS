import { BatteryCharging, Bluetooth, Plane, SunMedium, Volume2, Wifi } from 'lucide-react'

export default function QuickSettingsFlyout({ taskbarPosition }: { taskbarPosition: 'bottom' | 'top' }) {
    return (
        <div
            className={`absolute right-24 z-[var(--ds-z-flyout)] w-[min(24rem,calc(100vw-1.5rem))] rounded-lg border border-hairline bg-canvas p-4 ${taskbarPosition === 'top' ? 'top-[calc(var(--shell-topbar-height)+var(--shell-dock-height)+var(--shell-edge-gap)+0.5rem)]' : 'bottom-[calc(var(--shell-dock-height)+var(--shell-edge-gap)+0.5rem)]'}`}
        >
            <div className="grid grid-cols-3 gap-2">
                <button className="rounded-md bg-primary px-3 py-3 text-xs font-semibold text-white transition-transform active:scale-95">Wi-Fi</button>
                <button className="rounded-md bg-primary px-3 py-3 text-xs font-semibold text-white transition-transform active:scale-95">Bluetooth</button>
                <button className="rounded-md border border-hairline bg-parchment px-3 py-3 text-xs font-semibold text-ink transition-transform active:scale-95">Airplane</button>
            </div>

            <div className="my-4 space-y-3">
                <div className="flex items-center gap-2">
                    <SunMedium className="h-4 w-4 text-ink-muted" />
                    <input type="range" min={0} max={100} defaultValue={90} readOnly className="h-1 w-full accent-primary" />
                </div>
                <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-ink-muted" />
                    <input type="range" min={0} max={100} defaultValue={30} readOnly className="h-1 w-full accent-primary" />
                </div>
            </div>

            <div className="flex items-center justify-between text-sm text-ink">
                <div className="flex items-center gap-2">
                    <BatteryCharging className="h-4 w-4 text-success" />
                    <span>100%</span>
                </div>
                <div className="flex items-center gap-2 text-ink-muted">
                    <Wifi className="h-4 w-4" />
                    <Bluetooth className="h-4 w-4" />
                    <Plane className="h-4 w-4" />
                </div>
            </div>
        </div>
    )
}
