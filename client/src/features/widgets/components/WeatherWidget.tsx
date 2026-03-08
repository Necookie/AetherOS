import { useEffect, useMemo, useState } from 'react'
import { Cloud, CloudRain, Sun } from 'lucide-react'
import WidgetCard from './WidgetCard'

type WeatherCondition = 'Sunny' | 'Cloudy' | 'Rain'

interface WeatherSnapshot {
    tempC: number
    humidity: number
    windKph: number
    condition: WeatherCondition
}

const conditions: WeatherCondition[] = ['Sunny', 'Cloudy', 'Rain']

function createSnapshot(seed: number): WeatherSnapshot {
    const base = Math.abs(Math.floor(seed / 1000))
    return {
        tempC: 24 + (base % 7),
        humidity: 46 + (base % 28),
        windKph: 8 + (base % 14),
        condition: conditions[base % conditions.length],
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

    const ConditionIcon = useMemo(() => {
        if (snapshot.condition === 'Sunny') {
            return Sun
        }
        if (snapshot.condition === 'Rain') {
            return CloudRain
        }
        return Cloud
    }, [snapshot.condition])

    return (
        <WidgetCard title="Weather (Mock)" subtitle="Metro profile">
            <div className="rounded-xl border border-white/50 bg-white/45 p-3">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-2xl font-semibold text-slate-900">{snapshot.tempC}C</p>
                        <p className="text-xs text-slate-700">{snapshot.condition}</p>
                    </div>
                    <ConditionIcon className="h-8 w-8 text-amber-500" />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                    <div className="rounded-lg border border-white/45 bg-white/50 px-2 py-1.5">
                        Humidity {snapshot.humidity}%
                    </div>
                    <div className="rounded-lg border border-white/45 bg-white/50 px-2 py-1.5">
                        Wind {snapshot.windKph} kph
                    </div>
                </div>
            </div>
        </WidgetCard>
    )
}
