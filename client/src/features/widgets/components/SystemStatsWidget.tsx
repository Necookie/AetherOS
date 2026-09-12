import { Activity, Cpu, HardDrive, Wifi } from 'lucide-react'
import { shallow } from 'zustand/shallow'
import { useKernelStore } from '../../../stores/useKernelStore'
import WidgetCard from './WidgetCard'

function statGradient(label: string, value: number) {
    if (value >= 85) {
        return 'from-rose-500 to-red-600'
    }
    if (value >= 65) {
        return 'from-amber-500 to-orange-500'
    }
    if (label === 'CPU') {
        return 'from-sky-500 to-blue-600'
    }
    if (label === 'Memory') {
        return 'from-indigo-500 to-violet-600'
    }
    return 'from-emerald-500 to-teal-600'
}

export default function SystemStatsWidget() {
    const { cpuUsage, memUsage, netUsage } = useKernelStore(
        (state) => ({
            cpuUsage: state.cpuUsage,
            memUsage: state.memUsage,
            netUsage: state.netUsage,
        }),
        shallow,
    )

    const metrics = [
        {
            label: 'CPU',
            icon: Cpu,
            value: cpuUsage,
            detail: `${cpuUsage < 10 ? 'Idle' : 'Active'} • 8 Cores`,
        },
        {
            label: 'Memory',
            icon: HardDrive,
            value: memUsage,
            detail: `${Math.round((memUsage / 100) * 16384)} MB / 16 GB`,
        },
        {
            label: 'Network',
            icon: Wifi,
            value: netUsage,
            detail: `↓ ${Math.round(netUsage * 35)} KB/s • ↑ ${Math.round(netUsage * 8)} KB/s`,
        },
    ]

    return (
        <WidgetCard
            title="System Telemetry"
            subtitle="Kernel Live Monitor"
            icon={<Activity className="h-3.5 w-3.5" />}
            badge={
                <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                    SYNCED
                </span>
            }
        >
            <div className="space-y-2.5 rounded-lg border border-hairline/80 bg-parchment/80 p-3 backdrop-blur-xs">
                {metrics.map((metric) => {
                    const Icon = metric.icon
                    const clamped = Math.min(100, Math.max(0, metric.value))
                    return (
                        <div key={metric.label}>
                            <div className="mb-1 flex items-center justify-between text-[11px]">
                                <div className="flex items-center gap-1.5 font-medium text-ink">
                                    <Icon className="h-3 w-3 text-ink-muted shrink-0" />
                                    <span>{metric.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-ink-muted-48">{metric.detail}</span>
                                    <span className="font-semibold text-ink tabular-nums">{metric.value.toFixed(1)}%</span>
                                </div>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full border border-hairline/60 bg-canvas/80 p-[1px]">
                                <div
                                    className={`h-full rounded-full bg-gradient-to-r ${statGradient(metric.label, metric.value)} transition-all duration-300`}
                                    style={{ width: `${clamped}%` }}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>
        </WidgetCard>
    )
}
