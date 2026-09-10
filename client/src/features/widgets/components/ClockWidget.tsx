import { useShellClock } from '../../shell/hooks/useShellClock'
import WidgetCard from './WidgetCard'

export default function ClockWidget() {
    const now = useShellClock()

    return (
        <WidgetCard title="Local Time" subtitle={now.toLocaleDateString([], { weekday: 'short' })}>
            <div className="rounded-md border border-hairline bg-parchment px-3 py-2">
                <p className="font-term text-2xl font-semibold text-ink">
                    {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
                <p className="mt-1 text-xs text-ink-muted">
                    {now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
            </div>
        </WidgetCard>
    )
}
