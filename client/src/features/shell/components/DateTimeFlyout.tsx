import { WEEKDAY_LABELS, getCalendarGrid, isSameDay } from '../model/calendar'

interface DateTimeFlyoutProps {
    taskbarPosition: 'bottom' | 'top'
    showSeconds: boolean
    now: Date
    viewedMonth: Date
    onBackMonth: () => void
    onForwardMonth: () => void
}

export default function DateTimeFlyout({
    taskbarPosition,
    showSeconds,
    now,
    viewedMonth,
    onBackMonth,
    onForwardMonth,
}: DateTimeFlyoutProps) {
    const days = getCalendarGrid(viewedMonth)

    return (
        <div
            className={`absolute right-0 z-[var(--ds-z-flyout)] w-[min(26rem,calc(100vw-1.5rem))] rounded-lg border border-hairline bg-canvas p-4 ${taskbarPosition === 'top' ? 'top-[calc(var(--shell-topbar-height)+var(--shell-dock-height)+var(--shell-edge-gap)+0.5rem)]' : 'bottom-[calc(var(--shell-dock-height)+var(--shell-edge-gap)+0.5rem)]'}`}
        >
            <div className="mb-4 flex items-center justify-between">
                <p className="text-base font-semibold text-ink">
                    {now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-sm text-ink-muted">
                    {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: showSeconds ? '2-digit' : undefined })}
                </p>
            </div>

            <div className="rounded-md border border-hairline bg-parchment p-4">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-ink">
                        {viewedMonth.toLocaleDateString([], { month: 'long', year: 'numeric' })}
                    </h3>
                    <div className="flex items-center gap-2">
                        <button onClick={onBackMonth} className="rounded border border-hairline bg-canvas px-2 py-1 text-xs text-ink transition-transform active:scale-95" aria-label="Previous month">&lt;</button>
                        <button onClick={onForwardMonth} className="rounded border border-hairline bg-canvas px-2 py-1 text-xs text-ink transition-transform active:scale-95" aria-label="Next month">&gt;</button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-y-2 text-center text-sm">
                    {WEEKDAY_LABELS.map((weekday) => (
                        <p key={weekday} className="text-xs uppercase tracking-wide text-ink-muted">{weekday}</p>
                    ))}

                    {days.map((date) => {
                        const isCurrentMonth = date.getMonth() === viewedMonth.getMonth()
                        const isToday = isSameDay(date, now)

                        return (
                            <div
                                key={date.toISOString()}
                                className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm ${
                                    isToday
                                        ? 'bg-primary text-white'
                                        : isCurrentMonth
                                            ? 'text-ink'
                                            : 'text-ink-muted-48'
                                }`}
                            >
                                {date.getDate()}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
