import { useShellClock } from '../../shell/hooks/useShellClock'
import WidgetCard from './WidgetCard'

export default function ClockWidget() {
    const now = useShellClock()

    return (
        <WidgetCard title="Local Time" subtitle={now.toLocaleDateString([], { weekday: 'short' })}>
            <div className="rounded-xl border border-white/50 bg-white/45 px-3 py-2">
                <p className="font-term text-2xl font-semibold text-slate-900">
                    {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
                <p className="mt-1 text-xs text-slate-700">
                    {now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
            </div>
        </WidgetCard>
    )
}
