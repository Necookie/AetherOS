import { useSyncExternalStore } from 'react'
import { createNotificationService } from './notificationService'
import { executeNotificationDeepLink } from '../deep-links'
import { registerNotificationDeepLinkExecutor } from './deepLinkRuntime'

export const notificationService = createNotificationService()
registerNotificationDeepLinkExecutor((link) => executeNotificationDeepLink(link, notificationService.publish))

export function useNotificationSnapshot() {
    return useSyncExternalStore(
        notificationService.subscribe,
        notificationService.getSnapshot,
        notificationService.getSnapshot,
    )
}
