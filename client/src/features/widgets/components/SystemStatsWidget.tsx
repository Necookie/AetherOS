import { shallow } from 'zustand/shallow'
import { useKernelStore } from '../../../stores/useKernelStore'
import WidgetCard from './WidgetCard'

function statBarClass(value: number) {
    if (value >= 85) {
        return 'bg-gradient-to-r from-rose-500 to-orange-400'
    }
    if (value >= 65) {
        return 'bg-gradient-to-r from-amber-500 to-yellow-400'
    }
    return 'bg-gradient-to-r from-emerald-500 to-teal-400'
}

export default function SystemStatsWidget() {
    const { cpuUsage, memUsage, netUsage } = useKernelStore((state) => ({
        cpuUsage: state.cpuUsage,
        memUsage: state.memUsage,
        netUsage: state.netUsage,
    }), shallow)

    return (
        <WidgetCard title="System Stats" subtitle="Live kernel feed">
            <div className="space-y-2 rounded-xl border border-white/50 bg-white/45 p-3">
                {[
                    { label: 'CPU', value: cpuUsage },
                    { label: 'Memory', value: memUsage },
                    { label: 'Network', value: netUsage },
                ].map((metric) => (
                    <div key={metric.label}>
                        <div className="mb-1 flex items-center justify-between text-[11px] text-slate-700">
                            <span>{metric.label}</span>
                            <span className="font-medium text-slate-800">{metric.value.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full border border-white/45 bg-white/55">
                            <div
                                className={`h-full rounded-full ${statBarClass(metric.value)}`}
                                style={{ width: `${Math.min(100, Math.max(0, metric.value))}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </WidgetCard>
    )
}
