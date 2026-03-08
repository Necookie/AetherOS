import { useSyncExternalStore } from 'react'
import { createNotificationService } from './notificationService'

export const notificationService = createNotificationService()

export function useNotificationSnapshot() {
    return useSyncExternalStore(
        notificationService.subscribe,
        notificationService.getSnapshot,
        notificationService.getSnapshot,
    )
}
