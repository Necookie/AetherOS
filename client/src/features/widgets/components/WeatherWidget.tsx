import { useEffect, useMemo, useState } from 'react'
import { Cloud, CloudRain, CloudSun, Droplets, Sun, Wind } from 'lucide-react'
import WidgetCard from './WidgetCard'

type WeatherCondition = 'Sunny' | 'Cloudy' | 'Rain'

interface WeatherSnapshot {
    tempC: number
    humidity: number
    windKph: number
    condition: WeatherCondition
    highC: number
    lowC: number
}

const conditions: WeatherCondition[] = ['Sunny', 'Cloudy', 'Rain']

function createSnapshot(seed: number): WeatherSnapshot {
    const base = Math.abs(Math.floor(seed / 1000))
    const current = 24 + (base % 7)
    return {
        tempC: current,
        humidity: 46 + (base % 28),
        windKph: 8 + (base % 14),
        condition: conditions[base % conditions.length],
        highC: current + 3,
        lowC: current - 4,
    }
}

export default function WeatherWidget() {
    const [snapshot, setSnapshot] = useState<WeatherSnapshot>(() => createSnapshot(Date.now()))

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            setSnapshot(createSnapshot(Date.now()))
        }, 20_000)

        return () => window.clearInterval(intervalId)
    }, [])

    const { ConditionIcon, iconColor, bgGradient } = useMemo(() => {
        if (snapshot.condition === 'Sunny') {
            return {
                ConditionIcon: Sun,
                iconColor: 'text-amber-500',
                bgGradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
            }
        }
        if (snapshot.condition === 'Rain') {
            return {
                ConditionIcon: CloudRain,
                iconColor: 'text-sky-500',
                bgGradient: 'from-sky-500/10 via-sky-500/5 to-transparent',
            }
        }
        return {
            ConditionIcon: Cloud,
            iconColor: 'text-slate-500',
            bgGradient: 'from-slate-500/10 via-slate-500/5 to-transparent',
        }
    }, [snapshot.condition])

    return (
        <WidgetCard
            title="Weather"
            subtitle="Metro Profile"
            icon={<CloudSun className="h-3.5 w-3.5" />}
            badge={
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE
                </span>
            }
        >
            <div className={`rounded-lg border border-hairline/80 bg-gradient-to-br ${bgGradient} bg-parchment/80 p-3 backdrop-blur-xs`}>
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold tracking-tight text-ink tabular-nums">
                                {snapshot.tempC}°
                            </span>
                            <span className="text-xs font-semibold text-ink-muted">C</span>
                        </div>
                        <p className="mt-0.5 text-xs font-medium text-ink-muted">{snapshot.condition}</p>
                        <p className="text-[11px] text-ink-muted-48">
                            H: {snapshot.highC}° • L: {snapshot.lowC}°
                        </p>
                    </div>
                    <div className="rounded-xl border border-white/40 bg-white/60 p-2.5 shadow-xs backdrop-blur-sm">
                        <ConditionIcon className={`h-7 w-7 ${iconColor}`} />
                    </div>
                </div>

                {/* 3-period forecast chips */}
                <div className="mt-3 grid grid-cols-3 gap-1.5 border-t border-hairline/60 pt-2 text-center text-[11px]">
                    <div className="rounded-md border border-hairline/60 bg-canvas/60 px-1.5 py-1">
                        <span className="text-ink-muted-48 text-[10px]">Now</span>
                        <p className="font-semibold text-ink">{snapshot.tempC}°</p>
                    </div>
                    <div className="rounded-md border border-hairline/60 bg-canvas/60 px-1.5 py-1">
                        <span className="text-ink-muted-48 text-[10px]">+2h</span>
                        <p className="font-semibold text-ink">{snapshot.tempC + 1}°</p>
                    </div>
                    <div className="rounded-md border border-hairline/60 bg-canvas/60 px-1.5 py-1">
                        <span className="text-ink-muted-48 text-[10px]">+4h</span>
                        <p className="font-semibold text-ink">{snapshot.tempC - 1}°</p>
                    </div>
                </div>

                {/* Humidity & Wind metrics */}
                <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-ink-muted">
                    <div className="flex items-center gap-1.5 rounded-md border border-hairline/60 bg-canvas/80 px-2 py-1.5">
                        <Droplets className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                        <span className="truncate">Humidity {snapshot.humidity}%</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-md border border-hairline/60 bg-canvas/80 px-2 py-1.5">
                        <Wind className="h-3.5 w-3.5 text-teal-500 shrink-0" />
                        <span className="truncate">Wind {snapshot.windKph} kph</span>
                    </div>
                </div>
            </div>
        </WidgetCard>
    )
}
