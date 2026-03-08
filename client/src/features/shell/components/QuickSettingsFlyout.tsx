import { BatteryCharging, Bluetooth, Plane, SunMedium, Volume2, Wifi } from 'lucide-react'

export default function QuickSettingsFlyout({ taskbarPosition }: { taskbarPosition: 'bottom' | 'top' }) {
    return (
        <div
            className={`absolute right-24 z-[var(--ds-z-flyout)] w-[min(24rem,calc(100vw-1.5rem))] rounded-2xl p-4 backdrop-blur-2xl ${taskbarPosition === 'top' ? 'top-[calc(var(--shell-topbar-height)+var(--shell-dock-height)+var(--shell-edge-gap)+0.5rem)]' : 'bottom-[calc(var(--shell-dock-height)+var(--shell-edge-gap)+0.5rem)]'}`}
            style={{
                background: 'linear-gradient(180deg, rgb(255 255 255 / 0.58), rgb(255 255 255 / 0.34))',
                border: '1px solid rgb(255 255 255 / 0.58)',
                boxShadow: '0 20px 40px rgb(15 23 42 / 0.25)',
            }}
        >
            <div className="grid grid-cols-3 gap-2">
                <button className="rounded-lg bg-[var(--ds-color-accent)] px-3 py-3 text-xs font-medium text-white">Wi-Fi</button>
                <button className="rounded-lg bg-[var(--ds-color-accent)] px-3 py-3 text-xs font-medium text-white">Bluetooth</button>
                <button className="rounded-lg border border-white/60 bg-white/45 px-3 py-3 text-xs font-medium text-slate-900">Airplane</button>
            </div>

            <div className="my-4 space-y-3">
                <div className="flex items-center gap-2">
                    <SunMedium className="h-4 w-4 text-slate-700" />
                    <input type="range" min={0} max={100} defaultValue={90} readOnly className="h-1 w-full accent-[var(--ds-color-accent)]" />
                </div>
                <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-slate-700" />
                    <input type="range" min={0} max={100} defaultValue={30} readOnly className="h-1 w-full accent-[var(--ds-color-accent)]" />
                </div>
            </div>

            <div className="flex items-center justify-between text-sm text-slate-900">
                <div className="flex items-center gap-2">
                    <BatteryCharging className="h-4 w-4 text-[var(--ds-color-success)]" />
                    <span>100%</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                    <Wifi className="h-4 w-4" />
                    <Bluetooth className="h-4 w-4" />
                    <Plane className="h-4 w-4" />
                </div>
            </div>
        </div>
    )
}
