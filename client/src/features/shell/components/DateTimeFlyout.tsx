import { WEEKDAY_LABELS, getCalendarGrid, isSameDay } from '../model/calendar'

interface DateTimeFlyoutProps {
    now: Date
    viewedMonth: Date
    onBackMonth: () => void
    onForwardMonth: () => void
}

export default function DateTimeFlyout({
    now,
    viewedMonth,
    onBackMonth,
    onForwardMonth,
}: DateTimeFlyoutProps) {
    const days = getCalendarGrid(viewedMonth)

    return (
        <div
            className="absolute bottom-[calc(var(--shell-dock-height)+var(--shell-edge-gap)+0.5rem)] right-0 z-[var(--ds-z-flyout)] w-[min(26rem,calc(100vw-1.5rem))] rounded-2xl p-4 backdrop-blur-2xl"
            style={{
                background: 'linear-gradient(180deg, rgb(255 255 255 / 0.58), rgb(255 255 255 / 0.34))',
                border: '1px solid rgb(255 255 255 / 0.58)',
                boxShadow: '0 20px 40px rgb(15 23 42 / 0.25)',
            }}
        >
            <div className="mb-4 flex items-center justify-between">
                <p className="text-base font-semibold text-slate-900">
                    {now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-sm text-slate-700">
                    {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>

            <div className="rounded-xl border border-white/58 bg-white/45 p-4">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">
                        {viewedMonth.toLocaleDateString([], { month: 'long', year: 'numeric' })}
                    </h3>
                    <div className="flex items-center gap-2">
                        <button onClick={onBackMonth} className="rounded border border-white/65 bg-white/70 px-2 py-1 text-xs text-slate-900" aria-label="Previous month">&lt;</button>
                        <button onClick={onForwardMonth} className="rounded border border-white/65 bg-white/70 px-2 py-1 text-xs text-slate-900" aria-label="Next month">&gt;</button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-y-2 text-center text-sm">
                    {WEEKDAY_LABELS.map((weekday) => (
                        <p key={weekday} className="text-xs uppercase tracking-wide text-slate-600">{weekday}</p>
                    ))}

                    {days.map((date) => {
                        const isCurrentMonth = date.getMonth() === viewedMonth.getMonth()
                        const isToday = isSameDay(date, now)

                        return (
                            <div
                                key={date.toISOString()}
                                className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm ${
                                    isToday
                                        ? 'bg-[var(--ds-color-accent)] text-white'
                                        : isCurrentMonth
                                            ? 'text-slate-900'
                                            : 'text-slate-500'
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
