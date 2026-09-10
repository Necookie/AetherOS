import { shallow } from 'zustand/shallow'
import { useKernelStore } from '../../../stores/useKernelStore'
import WidgetCard from './WidgetCard'

function statBarClass(value: number) {
    if (value >= 85) {
        return 'bg-danger'
    }
    if (value >= 65) {
        return 'bg-warning'
    }
    return 'bg-success'
}

export default function SystemStatsWidget() {
    const { cpuUsage, memUsage, netUsage } = useKernelStore((state) => ({
        cpuUsage: state.cpuUsage,
        memUsage: state.memUsage,
        netUsage: state.netUsage,
    }), shallow)

    return (
        <WidgetCard title="System Stats" subtitle="Live kernel feed">
            <div className="space-y-2 rounded-md border border-hairline bg-parchment p-3">
                {[
                    { label: 'CPU', value: cpuUsage },
                    { label: 'Memory', value: memUsage },
                    { label: 'Network', value: netUsage },
                ].map((metric) => (
                    <div key={metric.label}>
                        <div className="mb-1 flex items-center justify-between text-[12px] text-ink-muted">
                            <span>{metric.label}</span>
                            <span className="font-semibold text-ink">{metric.value.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full border border-hairline bg-canvas">
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
