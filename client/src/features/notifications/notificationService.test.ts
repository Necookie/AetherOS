import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createNotificationService } from './notificationService'

describe('notificationService lifecycle', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('publishes, tracks unread state, and executes actions', async () => {
        let now = 100
        const service = createNotificationService(() => now)
        const actionSpy = vi.fn()

        const id = service.publish({
            title: 'Build completed',
            message: 'All checks passed.',
            source: 'CI',
            groupKey: 'build',
            priority: 'high',
            actions: [
                {
                    id: 'open',
                    label: 'Open logs',
                    tone: 'primary',
                    onInvoke: actionSpy,
                },
            ],
        })

        expect(service.getSnapshot().unreadCount).toBe(1)
        await service.invokeAction(id, 'open')
        expect(actionSpy).toHaveBeenCalledTimes(1)
        expect(service.getSnapshot().items[0].isRead).toBe(true)

        service.markUnread(id)
        expect(service.getSnapshot().items[0].isRead).toBe(false)

        service.markAllRead()
        expect(service.getSnapshot().unreadCount).toBe(0)

        now += 10
        service.publish({
            title: 'Reminder',
            message: 'Check deployment status.',
            source: 'CI',
            groupKey: 'build',
            priority: 'normal',
        })

        const snapshot = service.getSnapshot()
        expect(snapshot.items).toHaveLength(2)
        expect(snapshot.items[0].title).toBe('Build completed')
    })

    it('auto-removes notifications after autoCloseMs', async () => {
        const service = createNotificationService(() => 1_000)
        service.publish({
            title: 'Transient',
            message: 'Temporary alert',
            source: 'System',
            autoCloseMs: 500,
        })

        expect(service.getSnapshot().items).toHaveLength(1)
        await vi.advanceTimersByTimeAsync(550)
        expect(service.getSnapshot().items).toHaveLength(0)
    })
})
