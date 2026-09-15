import { useState } from 'react'
import {
    BatteryCharging,
    Bluetooth,
    Check,
    Plane,
    Sliders,
    SunMedium,
    Volume2,
    VolumeX,
    Wifi,
    WifiOff,
} from 'lucide-react'

interface QuickSettingsFlyoutProps {
    taskbarPosition: 'bottom' | 'top'
    brightness?: number
    onBrightnessChange?: (value: number) => void
    volume?: number
    onVolumeChange?: (value: number) => void
    onOpenSettings?: () => void
}

export default function QuickSettingsFlyout({
    taskbarPosition,
    brightness: externalBrightness,
    onBrightnessChange,
    volume: externalVolume,
    onVolumeChange,
    onOpenSettings,
}: QuickSettingsFlyoutProps) {
    const [internalWifi, setInternalWifi] = useState(true)
    const [internalBluetooth, setInternalBluetooth] = useState(true)
    const [internalAirplane, setInternalAirplane] = useState(false)
    const [internalBrightness, setInternalBrightness] = useState(90)
    const [internalVolume, setInternalVolume] = useState(45)
    const [isMuted, setIsMuted] = useState(false)

    const brightness = externalBrightness ?? internalBrightness
    const volume = isMuted ? 0 : (externalVolume ?? internalVolume)

    const handleToggleWifi = () => {
        if (internalAirplane) {
            setInternalAirplane(false)
        }
        setInternalWifi((prev) => !prev)
    }

    const handleToggleBluetooth = () => {
        if (internalAirplane) {
            setInternalAirplane(false)
        }
        setInternalBluetooth((prev) => !prev)
    }

    const handleToggleAirplane = () => {
        setInternalAirplane((prev) => {
            const next = !prev
            if (next) {
                setInternalWifi(false)
                setInternalBluetooth(false)
            } else {
                setInternalWifi(true)
                setInternalBluetooth(true)
            }
            return next
        })
    }

    const handleBrightness = (val: number) => {
        setInternalBrightness(val)
        onBrightnessChange?.(val)
    }

    const handleVolume = (val: number) => {
        setIsMuted(false)
        setInternalVolume(val)
        onVolumeChange?.(val)
    }

    const handleToggleMute = () => {
        setIsMuted((prev) => !prev)
    }

    return (
        <div
            className={`absolute right-24 z-[var(--ds-z-flyout)] w-[min(24rem,calc(100vw-1.5rem))] rounded-lg border border-hairline bg-canvas p-4 text-ink shadow-elevated ${
                taskbarPosition === 'top'
                    ? 'top-[calc(var(--shell-topbar-height)+var(--shell-dock-height)+var(--shell-edge-gap)+0.5rem)]'
                    : 'bottom-[calc(var(--shell-dock-height)+var(--shell-edge-gap)+0.5rem)]'
            }`}
        >
            <div className="grid grid-cols-3 gap-2">
                <button
                    onClick={handleToggleWifi}
                    className={`flex flex-col items-start gap-1 rounded-lg p-3 text-xs font-semibold transition-all active:scale-95 ${
                        internalWifi
                            ? 'bg-primary text-white'
                            : 'border border-hairline bg-parchment text-ink hover:bg-canvas'
                    }`}
                    aria-label="Toggle Wi-Fi"
                >
                    <div className="flex w-full items-center justify-between">
                        {internalWifi ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4 text-ink-muted" />}
                        {internalWifi && <Check className="h-3 w-3 opacity-80" />}
                    </div>
                    <span>Wi-Fi</span>
                    <span className={`text-[10px] font-normal ${internalWifi ? 'text-white/80' : 'text-ink-muted'}`}>
                        {internalWifi ? 'AetherNet 5G' : 'Disconnected'}
                    </span>
                </button>

                <button
                    onClick={handleToggleBluetooth}
                    className={`flex flex-col items-start gap-1 rounded-lg p-3 text-xs font-semibold transition-all active:scale-95 ${
                        internalBluetooth
                            ? 'bg-primary text-white'
                            : 'border border-hairline bg-parchment text-ink hover:bg-canvas'
                    }`}
                    aria-label="Toggle Bluetooth"
                >
                    <div className="flex w-full items-center justify-between">
                        <Bluetooth className="h-4 w-4" />
                        {internalBluetooth && <Check className="h-3 w-3 opacity-80" />}
                    </div>
                    <span>Bluetooth</span>
                    <span className={`text-[10px] font-normal ${internalBluetooth ? 'text-white/80' : 'text-ink-muted'}`}>
                        {internalBluetooth ? 'Active' : 'Off'}
                    </span>
                </button>

                <button
                    onClick={handleToggleAirplane}
                    className={`flex flex-col items-start gap-1 rounded-lg p-3 text-xs font-semibold transition-all active:scale-95 ${
                        internalAirplane
                            ? 'bg-primary text-white'
                            : 'border border-hairline bg-parchment text-ink hover:bg-canvas'
                    }`}
                    aria-label="Toggle Airplane mode"
                >
                    <div className="flex w-full items-center justify-between">
                        <Plane className="h-4 w-4" />
                        {internalAirplane && <Check className="h-3 w-3 opacity-80" />}
                    </div>
                    <span>Airplane</span>
                    <span className={`text-[10px] font-normal ${internalAirplane ? 'text-white/80' : 'text-ink-muted'}`}>
                        {internalAirplane ? 'Enabled' : 'Off'}
                    </span>
                </button>
            </div>

            <div className="my-4 space-y-3.5 rounded-lg border border-hairline bg-parchment p-3">
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-ink-muted">
                        <span className="flex items-center gap-1.5 text-ink">
                            <SunMedium className="h-3.5 w-3.5 text-primary" />
                            Display Brightness
                        </span>
                        <span>{brightness}%</span>
                    </div>
                    <input
                        type="range"
                        min={30}
                        max={100}
                        value={brightness}
                        onChange={(e) => handleBrightness(Number(e.target.value))}
                        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-hairline accent-primary"
                    />
                </div>

                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-ink-muted">
                        <button
                            onClick={handleToggleMute}
                            className="flex min-h-8 items-center gap-1.5 rounded px-1 text-ink hover:text-primary"
                        >
                            {isMuted || volume === 0 ? (
                                <VolumeX className="h-3.5 w-3.5 text-danger" />
                            ) : (
                                <Volume2 className="h-3.5 w-3.5 text-primary" />
                            )}
                            Sound Output
                        </button>
                        <span>{volume}%</span>
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={100}
                        value={volume}
                        onChange={(e) => handleVolume(Number(e.target.value))}
                        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-hairline accent-primary"
                    />
                </div>
            </div>

            <div className="flex items-center justify-between text-xs text-ink">
                <div className="flex items-center gap-2">
                    <BatteryCharging className="h-4 w-4 text-success" />
                    <span className="font-semibold">100% · Power Adapter</span>
                </div>

                {onOpenSettings && (
                    <button
                        onClick={onOpenSettings}
                        className="flex items-center gap-1 rounded-sm px-2 py-1 text-ink-muted transition-colors hover:bg-parchment hover:text-ink"
                    >
                        <Sliders className="h-3.5 w-3.5" />
                        Settings
                    </button>
                )}
            </div>
        </div>
    )
}
