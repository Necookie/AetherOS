import { BellOff, CheckCheck, Trash2 } from 'lucide-react'
import { groupNotifications } from '../grouping'
import { useNotificationSnapshot } from '../notificationStore'
import { notificationService } from '../notificationStore'
import type { NotificationActionTone } from '../types'

const actionToneClass: Record<NotificationActionTone, string> = {
    default: 'border-slate-300/90 bg-white/65 text-slate-800 hover:bg-white/90',
    primary: 'border-blue-500/70 bg-blue-500 text-white hover:bg-blue-600',
    danger: 'border-rose-500/70 bg-rose-500 text-white hover:bg-rose-600',
}

function priorityStyle(priority: 'low' | 'normal' | 'high') {
    if (priority === 'high') {
        return 'border-rose-300/80 bg-rose-50/85'
    }
    if (priority === 'normal') {
        return 'border-blue-300/75 bg-blue-50/75'
    }
    return 'border-slate-300/70 bg-white/65'
}

function formatTime(createdAt: number) {
    return new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function NotificationCenterFlyout() {
    const snapshot = useNotificationSnapshot()
    const groups = groupNotifications(snapshot.items)

    return (
        <section
            className="animate-os-flyout-in absolute right-2 top-[calc(var(--shell-topbar-height)+0.4rem)] z-[var(--ds-z-flyout)] w-[min(26rem,calc(100vw-1rem))] rounded-2xl border border-white/65 p-3 backdrop-blur-2xl md:right-4"
            style={{
                background: 'linear-gradient(180deg, rgb(255 255 255 / 0.7), rgb(255 255 255 / 0.44))',
                boxShadow: '0 20px 40px rgb(15 23 42 / 0.28)',
            }}
            aria-label="Notification center"
        >
            <header className="mb-3 flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-semibold text-slate-900">Notifications</h2>
                    <p className="text-[11px] text-slate-600">{snapshot.unreadCount} unread</p>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => notificationService.markAllRead()}
                        className="os-interactive inline-flex items-center gap-1 rounded-md border border-slate-300/80 bg-white/70 px-2 py-1 text-[11px] text-slate-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={snapshot.unreadCount === 0}
                    >
                        <CheckCheck className="h-3.5 w-3.5" />
                        Mark all
                    </button>
                    <button
                        onClick={() => notificationService.clear()}
                        className="os-interactive inline-flex items-center gap-1 rounded-md border border-slate-300/80 bg-white/70 px-2 py-1 text-[11px] text-slate-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={groups.length === 0}
                    >
                        <BellOff className="h-3.5 w-3.5" />
                        Clear
                    </button>
                </div>
            </header>

            <div className="max-h-[24rem] space-y-2 overflow-auto pr-1">
                {groups.map((group) => (
                    <div key={group.key} className="rounded-xl border border-white/45 bg-white/35 p-2">
                        <div className="mb-1 flex items-center justify-between px-1">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">{group.key}</p>
                            <p className="text-[11px] text-slate-500">{group.unreadCount} unread</p>
                        </div>
                        <div className="space-y-1.5">
                            {group.items.map((item) => (
                                <article
                                    key={item.id}
                                    className={`rounded-lg border p-2 ${priorityStyle(item.priority)} ${item.isRead ? 'opacity-75' : ''}`}
                                >
                                    <div className="mb-1 flex items-start justify-between gap-2">
                                        <div>
                                            <p className="text-xs font-semibold text-slate-900">{item.title}</p>
                                            <p className="text-[11px] text-slate-600">{item.source}</p>
                                        </div>
                                        <p className="text-[10px] text-slate-500">{formatTime(item.createdAt)}</p>
                                    </div>
                                    <p className="text-xs text-slate-700">{item.message}</p>
                                    <div className="mt-2 flex flex-wrap items-center gap-1">
                                        {item.actions.map((action) => (
                                            <button
                                                key={action.id}
                                                onClick={() => {
                                                    void notificationService.invokeAction(item.id, action.id)
                                                }}
                                                className={`os-interactive rounded-md border px-2 py-1 text-[11px] font-medium ${actionToneClass[action.tone]}`}
                                            >
                                                {action.label}
                                            </button>
                                        ))}
                                        {!item.isRead ? (
                                            <button
                                                onClick={() => notificationService.markRead(item.id)}
                                                className="os-interactive rounded-md border border-slate-300/90 bg-white/70 px-2 py-1 text-[11px] text-slate-700 hover:bg-white"
                                            >
                                                Mark read
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => notificationService.markUnread(item.id)}
                                                className="os-interactive rounded-md border border-slate-300/90 bg-white/70 px-2 py-1 text-[11px] text-slate-700 hover:bg-white"
                                            >
                                                Mark unread
                                            </button>
                                        )}
                                        <button
                                            onClick={() => notificationService.remove(item.id)}
                                            className="os-interactive rounded-md border border-slate-300/90 bg-white/70 px-2 py-1 text-[11px] text-slate-700 hover:bg-white"
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
                    <div className="rounded-xl border border-white/50 bg-white/45 p-6 text-center">
                        <p className="text-sm font-medium text-slate-800">No notifications</p>
                        <p className="mt-1 text-xs text-slate-600">Incoming system and app alerts will appear here.</p>
                    </div>
                ) : null}
            </div>
        </section>
    )
}
