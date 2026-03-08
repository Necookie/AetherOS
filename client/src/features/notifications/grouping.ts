import type { NotificationItem } from './types'

export interface NotificationGroup {
    key: string
    items: NotificationItem[]
    unreadCount: number
}

export function groupNotifications(items: NotificationItem[]): NotificationGroup[] {
    const groups = new Map<string, NotificationGroup>()

    for (const item of items) {
        const existing = groups.get(item.groupKey)
        if (!existing) {
            groups.set(item.groupKey, {
                key: item.groupKey,
                items: [item],
                unreadCount: item.isRead ? 0 : 1,
            })
            continue
        }

        existing.items.push(item)
        if (!item.isRead) {
            existing.unreadCount += 1
        }
    }

    return [...groups.values()].sort((left, right) => {
        const unreadDiff = right.unreadCount - left.unreadCount
        if (unreadDiff !== 0) {
            return unreadDiff
        }

        const leftNewest = left.items[0]?.createdAt ?? 0
        const rightNewest = right.items[0]?.createdAt ?? 0
        return rightNewest - leftNewest
    })
}
