import type {
    NotificationActionInput,
    NotificationItem,
    NotificationService,
    NotificationSnapshot,
} from './types'

type Listener = () => void

interface NotificationState {
    items: NotificationItem[]
    unreadCount: number
    snapshot: NotificationSnapshot
}

type TimeoutHandle = ReturnType<typeof globalThis.setTimeout>

const priorityScore: Record<NotificationItem['priority'], number> = {
    high: 3,
    normal: 2,
    low: 1,
}

function toAction(action: NotificationActionInput) {
    return {
        id: action.id,
        label: action.label,
        tone: action.tone ?? 'default',
        markAsReadOnInvoke: action.markAsReadOnInvoke ?? true,
    } as const
}

function sortItems(items: NotificationItem[]) {
    items.sort((left, right) => {
        const priorityDiff = priorityScore[right.priority] - priorityScore[left.priority]
        if (priorityDiff !== 0) {
            return priorityDiff
        }
        return right.createdAt - left.createdAt
    })
}

export function createNotificationService(now: () => number = Date.now): NotificationService {
    let state: NotificationState = {
        items: [],
        unreadCount: 0,
        snapshot: { items: [], unreadCount: 0 },
    }
    let idCounter = 0
    const listeners = new Set<Listener>()
    const actionHandlers = new Map<string, NotificationActionInput['onInvoke']>()
    const autoCloseTimers = new Map<string, TimeoutHandle>()

    const emit = () => {
        listeners.forEach((listener) => listener())
    }

    const setState = (updater: (current: NotificationItem[]) => NotificationItem[]) => {
        const items = updater(state.items)
        const unreadCount = items.reduce((count, item) => (item.isRead ? count : count + 1), 0)
        state = {
            items,
            unreadCount,
            snapshot: {
                items,
                unreadCount,
            },
        }
        emit()
    }

    const clearNotificationRuntime = (id: string) => {
        const timerId = autoCloseTimers.get(id)
        if (timerId !== undefined) {
            globalThis.clearTimeout(timerId)
            autoCloseTimers.delete(id)
        }

        for (const key of [...actionHandlers.keys()]) {
            if (key.startsWith(`${id}:`)) {
                actionHandlers.delete(key)
            }
        }
    }

    const removeById = (id: string) => {
        clearNotificationRuntime(id)
        setState((current) => current.filter((item) => item.id !== id))
    }

    return {
        publish: (notification) => {
            const id = notification.id ?? `notif-${now()}-${++idCounter}`
            const createdAt = now()
            const actions = (notification.actions ?? []).map(toAction)
            const item: NotificationItem = {
                id,
                title: notification.title,
                message: notification.message,
                source: notification.source,
                groupKey: notification.groupKey ?? notification.source,
                priority: notification.priority ?? 'normal',
                createdAt,
                isRead: false,
                actions,
            }

            for (const action of notification.actions ?? []) {
                if (action.onInvoke) {
                    actionHandlers.set(`${id}:${action.id}`, action.onInvoke)
                }
            }

            if ((notification.autoCloseMs ?? 0) > 0) {
                const timerId = globalThis.setTimeout(() => removeById(id), notification.autoCloseMs)
                autoCloseTimers.set(id, timerId)
            }

            setState((current) => {
                const items = [item, ...current]
                sortItems(items)
                return items
            })

            return id
        },
        markRead: (id) => {
            setState((current) => current.map((item) => (item.id === id ? { ...item, isRead: true } : item)))
        },
        markUnread: (id) => {
            setState((current) => current.map((item) => (item.id === id ? { ...item, isRead: false } : item)))
        },
        markAllRead: () => {
            setState((current) => current.map((item) => (item.isRead ? item : { ...item, isRead: true })))
        },
        remove: (id) => {
            removeById(id)
        },
        clear: () => {
            for (const id of state.items.map((item) => item.id)) {
                clearNotificationRuntime(id)
            }
            setState(() => [])
        },
        invokeAction: async (notificationId, actionId) => {
            const item = state.items.find((candidate) => candidate.id === notificationId)
            if (!item) {
                return false
            }

            const action = item.actions.find((candidate) => candidate.id === actionId)
            if (!action) {
                return false
            }

            const handler = actionHandlers.get(`${notificationId}:${actionId}`)
            if (handler) {
                await handler()
            }

            if (action.markAsReadOnInvoke) {
                setState((current) =>
                    current.map((candidate) =>
                        candidate.id === notificationId ? { ...candidate, isRead: true } : candidate,
                    ),
                )
            }

            return true
        },
        getSnapshot: () => state.snapshot,
        subscribe: (listener) => {
            listeners.add(listener)
            return () => listeners.delete(listener)
        },
        dispose: () => {
            listeners.clear()
            for (const timerId of autoCloseTimers.values()) {
                globalThis.clearTimeout(timerId)
            }
            autoCloseTimers.clear()
            actionHandlers.clear()
            state = {
                items: [],
                unreadCount: 0,
                snapshot: { items: [], unreadCount: 0 },
            }
        },
    }
}
