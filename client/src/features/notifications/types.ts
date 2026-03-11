import type { NotificationDeepLink } from '../deep-links/types'

export type NotificationPriority = 'low' | 'normal' | 'high'

export type NotificationActionTone = 'default' | 'primary' | 'danger'

export interface NotificationActionInput {
    id: string
    label: string
    tone?: NotificationActionTone
    markAsReadOnInvoke?: boolean
    deepLink?: NotificationDeepLink
    onInvoke?: () => void | Promise<void>
}

export interface CreateNotificationInput {
    id?: string
    title: string
    message: string
    source: string
    groupKey?: string
    priority?: NotificationPriority
    deepLink?: NotificationDeepLink
    actions?: NotificationActionInput[]
    autoCloseMs?: number
}

export interface NotificationAction {
    id: string
    label: string
    tone: NotificationActionTone
    markAsReadOnInvoke: boolean
    deepLink?: NotificationDeepLink
}

export interface NotificationItem {
    id: string
    title: string
    message: string
    source: string
    groupKey: string
    priority: NotificationPriority
    createdAt: number
    isRead: boolean
    deepLink?: NotificationDeepLink
    actions: NotificationAction[]
}

export interface NotificationSnapshot {
    items: NotificationItem[]
    unreadCount: number
}

export interface NotificationService {
    publish: (notification: CreateNotificationInput) => string
    markRead: (id: string) => void
    markUnread: (id: string) => void
    markAllRead: () => void
    remove: (id: string) => void
    clear: () => void
    open: (notificationId: string) => Promise<boolean>
    invokeAction: (notificationId: string, actionId: string) => Promise<boolean>
    getSnapshot: () => NotificationSnapshot
    subscribe: (listener: () => void) => () => void
    dispose: () => void
}
