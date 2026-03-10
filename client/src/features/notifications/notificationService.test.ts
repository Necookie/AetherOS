import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createNotificationService } from './notificationService'
import { registerNotificationDeepLinkExecutor } from './deepLinkRuntime'

describe('notificationService lifecycle', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        registerNotificationDeepLinkExecutor(() => false)
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

    it('delegates notification opens and action deep links through the registered executor', async () => {
        const executor = vi.fn(() => true)
        registerNotificationDeepLinkExecutor(executor)
        const service = createNotificationService(() => 250)
        const id = service.publish({
            title: 'CPU spike detected',
            message: 'Open Task Manager.',
            source: 'System Monitor',
            deepLink: {
                kind: 'task-manager',
                tab: 'Performance',
            },
            actions: [
                {
                    id: 'inspect',
                    label: 'Inspect',
                    deepLink: {
                        kind: 'task-manager',
                        tab: 'Processes',
                    },
                },
            ],
        })

        await service.open(id)
        await service.invokeAction(id, 'inspect')

        expect(executor).toHaveBeenCalledTimes(2)
        expect(service.getSnapshot().items[0].isRead).toBe(true)
    })
})
