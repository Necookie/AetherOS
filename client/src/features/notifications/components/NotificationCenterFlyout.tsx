import { BellOff, CheckCheck, Trash2 } from 'lucide-react'
import { groupNotifications } from '../grouping'
import { useNotificationSnapshot } from '../notificationStore'
import { notificationService } from '../notificationStore'
import type { NotificationActionTone } from '../types'

const actionToneClass: Record<NotificationActionTone, string> = {
    default: 'border-hairline bg-parchment text-ink hover:bg-canvas',
    primary: 'border-primary bg-primary text-white hover:bg-primary',
    danger: 'border-danger bg-canvas text-danger hover:bg-parchment',
}

// State is expressed by surface change, not a second hue: high priority gets
// a parchment fill and a primary-focus left rule; everything else stays flat
// canvas + hairline, low priority just reads quieter (muted ink).
function priorityStyle(priority: 'low' | 'normal' | 'high') {
    if (priority === 'high') {
        return 'border-hairline border-l-2 border-l-primary-focus bg-parchment'
    }
    if (priority === 'low') {
        return 'border-hairline bg-canvas text-ink-muted-48'
    }
    return 'border-hairline bg-canvas'
}

function formatTime(createdAt: number) {
    return new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function NotificationCenterFlyout() {
    const snapshot = useNotificationSnapshot()
    const groups = groupNotifications(snapshot.items)

    return (
        <section
            className="absolute right-2 top-[calc(var(--shell-topbar-height)+0.4rem)] z-[var(--ds-z-flyout)] w-[min(26rem,calc(100vw-1rem))] rounded-lg border border-hairline bg-canvas p-3 md:right-4"
            aria-label="Notification center"
        >
            <header className="mb-3 flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-semibold text-ink">Notifications</h2>
                    <p className="text-[12px] text-ink-muted">{snapshot.unreadCount} unread</p>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => notificationService.markAllRead()}
                        className="inline-flex items-center gap-1 rounded-sm border border-hairline bg-parchment px-2 py-1 text-[12px] text-ink transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={snapshot.unreadCount === 0}
                    >
                        <CheckCheck className="h-3.5 w-3.5" />
                        Mark all
                    </button>
                    <button
                        onClick={() => notificationService.clear()}
                        className="inline-flex items-center gap-1 rounded-sm border border-hairline bg-parchment px-2 py-1 text-[12px] text-ink transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={groups.length === 0}
                    >
                        <BellOff className="h-3.5 w-3.5" />
                        Clear
                    </button>
                </div>
            </header>

            <div className="max-h-[24rem] space-y-2 overflow-auto pr-1">
                {groups.map((group) => (
                    <div key={group.key} className="rounded-lg border border-hairline bg-parchment p-2">
                        <div className="mb-1 flex items-center justify-between px-1">
                            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-muted">{group.key}</p>
                            <p className="text-[12px] text-ink-muted-48">{group.unreadCount} unread</p>
                        </div>
                        <div className="space-y-1.5">
                            {group.items.map((item) => (
                                <article
                                    key={item.id}
                                    className={`rounded-md border p-2 ${priorityStyle(item.priority)} ${item.isRead ? 'opacity-75' : ''} ${item.deepLink ? 'cursor-pointer' : ''}`}
                                    onClick={() => {
                                        if (!item.deepLink) {
                                            return
                                        }

                                        void notificationService.open(item.id)
                                    }}
                                >
                                    <div className="mb-1 flex items-start justify-between gap-2">
                                        <div>
                                            <p className="text-xs font-semibold text-ink">{item.title}</p>
                                            <p className="text-[12px] text-ink-muted">{item.source}</p>
                                        </div>
                                        <p className="text-[10px] text-ink-muted-48">{formatTime(item.createdAt)}</p>
                                    </div>
                                    <p className="text-xs text-ink-muted">{item.message}</p>
                                    <div className="mt-2 flex flex-wrap items-center gap-1">
                                        {item.actions.map((action) => (
                                            <button
                                                key={action.id}
                                                onClick={(event) => {
                                                    event.stopPropagation()
                                                    void notificationService.invokeAction(item.id, action.id)
                                                }}
                                                className={`rounded-sm border px-2 py-1 text-[12px] font-semibold transition-transform active:scale-95 ${actionToneClass[action.tone]}`}
                                            >
                                                {action.label}
                                            </button>
                                        ))}
                                        {!item.isRead ? (
                                            <button
                                                onClick={(event) => {
                                                    event.stopPropagation()
                                                    notificationService.markRead(item.id)
                                                }}
                                                className="rounded-sm border border-hairline bg-parchment px-2 py-1 text-[12px] text-ink transition-transform active:scale-95 hover:bg-canvas"
                                            >
                                                Mark read
                                            </button>
                                        ) : (
                                            <button
                                                onClick={(event) => {
                                                    event.stopPropagation()
                                                    notificationService.markUnread(item.id)
                                                }}
                                                className="rounded-sm border border-hairline bg-parchment px-2 py-1 text-[12px] text-ink transition-transform active:scale-95 hover:bg-canvas"
                                            >
                                                Mark unread
                                            </button>
                                        )}
                                        <button
                                            onClick={(event) => {
                                                event.stopPropagation()
                                                notificationService.remove(item.id)
                                            }}
                                            className="rounded-sm border border-hairline bg-parchment px-2 py-1 text-[12px] text-ink transition-transform active:scale-95 hover:bg-canvas"
                                            aria-label="Delete notification"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                ))}

                {groups.length === 0 ? (
                    <div className="rounded-lg border border-hairline bg-parchment p-6 text-center">
                        <p className="text-sm font-semibold text-ink">No notifications</p>
                        <p className="mt-1 text-xs text-ink-muted">Incoming system and app alerts will appear here.</p>
                    </div>
                ) : null}
            </div>
        </section>
    )
}
