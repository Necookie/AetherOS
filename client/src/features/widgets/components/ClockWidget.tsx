import { Clock } from 'lucide-react'
import { useShellClock } from '../../shell/hooks/useShellClock'
import WidgetCard from './WidgetCard'

export default function ClockWidget() {
    const now = useShellClock()

    const hours = now.toLocaleTimeString([], { hour: '2-digit', hour12: true }).split(' ')[0]
    const minutes = now.toLocaleTimeString([], { minute: '2-digit' }).padStart(2, '0')
    const seconds = now.toLocaleTimeString([], { second: '2-digit' }).padStart(2, '0')
    const period = now.toLocaleTimeString([], { hour: '2-digit', hour12: true }).split(' ')[1] ?? ''
    const weekday = now.toLocaleDateString([], { weekday: 'short' }).toUpperCase()
    const fullDate = now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'System Local'

    return (
        <WidgetCard
            title="Local Time"
            subtitle={timeZone}
            icon={<Clock className="h-3.5 w-3.5" />}
            badge={
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-primary">
                    {weekday}
                </span>
            }
        >
            <div className="rounded-lg border border-hairline/80 bg-parchment/80 p-3 backdrop-blur-xs">
                <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold tracking-tight text-ink tabular-nums">
                            {hours}:{minutes}
                        </span>
                        <span className="rounded bg-primary/15 px-1.5 py-0.5 text-xs font-bold text-primary tabular-nums">
                            :{seconds}
                        </span>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                        {period}
                    </span>
                </div>
                <div className="mt-2.5 flex items-center justify-between border-t border-hairline/60 pt-2 text-[11px] text-ink-muted">
                    <span>{fullDate}</span>
                    <span className="text-ink-muted-48">24-hr synced</span>
                </div>
            </div>
        </WidgetCard>
    )
}
