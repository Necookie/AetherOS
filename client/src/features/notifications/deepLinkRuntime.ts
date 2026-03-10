import type { NotificationDeepLink } from '../deep-links'

type DeepLinkExecutor = (link: NotificationDeepLink) => boolean

let executor: DeepLinkExecutor | null = null

export function registerNotificationDeepLinkExecutor(nextExecutor: DeepLinkExecutor) {
    executor = nextExecutor
}

export function invokeRegisteredNotificationDeepLink(link: NotificationDeepLink) {
    return executor ? executor(link) : false
}
