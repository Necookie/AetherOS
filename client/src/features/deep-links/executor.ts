import { DEFAULT_APPS } from '../../config/windows'
import type { CreateNotificationInput } from '../notifications/types'
import { useBrowserStore } from '../../stores/browserStore'
import { useFsStore } from '../../stores/fsStore'
import { useWindowStore } from '../../stores/windowStore'
import { productivityRepository } from '../productivity'
import { useDeepLinkIntentStore } from './store'
import type { NotificationDeepLink } from './types'

const appLookup = new Map(DEFAULT_APPS.map((app) => [app.id, app]))

function openOrFocusWindow(appId: string) {
    const app = appLookup.get(appId)
    if (!app) {
        return false
    }

    const windowState = useWindowStore.getState()
    const existing = windowState.windows[appId]
    if (!existing) {
        windowState.openWindow(app)
        return true
    }

    if (existing.state.isMinimized) {
        windowState.restoreWindow(appId)
        return true
    }

    windowState.focusWindow(appId)
    return true
}

function publishFallback(
    publishNotification: (notification: CreateNotificationInput) => string,
    title: string,
    message: string,
) {
    publishNotification({
        title,
        message,
        source: 'Notifications',
        groupKey: 'notification-fallbacks',
        priority: 'normal',
        autoCloseMs: 5000,
    })
}

function openBrowserUrl(url: string, reuseExistingTab: boolean) {
    const browserState = useBrowserStore.getState()
    browserState.openUrl(url, { reuseExistingTab })
    return true
}

export function executeNotificationDeepLink(
    link: NotificationDeepLink,
    publishNotification: (notification: CreateNotificationInput) => string,
) {
    switch (link.kind) {
        case 'app': {
            if (!openOrFocusWindow(link.appId)) {
                publishFallback(publishNotification, 'Action unavailable', 'That app is not available right now.')
                return false
            }
            return true
        }
        case 'productivity-record': {
            const record = productivityRepository.getRecord(link.appId, link.recordId)
            if (!record) {
                publishFallback(publishNotification, 'Record unavailable', 'That note, document, or board no longer exists.')
                return false
            }

            if (!openOrFocusWindow(link.appId)) {
                publishFallback(publishNotification, 'Action unavailable', 'The requested app could not be opened.')
                return false
            }

            useDeepLinkIntentStore.getState().openProductivityRecord(link.appId, link.recordId, link.panel)
            return true
        }
        case 'browser-url': {
            if (!openOrFocusWindow('browser')) {
                publishFallback(publishNotification, 'Browser unavailable', 'Aether Browser could not be opened.')
                return false
            }

            return openBrowserUrl(link.url, link.reuseExistingTab ?? true)
        }
        case 'file-manager-path': {
            if (!openOrFocusWindow('explorer')) {
                publishFallback(publishNotification, 'File Manager unavailable', 'File Manager could not be opened.')
                return false
            }

            const revealed = useFsStore.getState().revealPath(link.path)
            if (!revealed) {
                publishFallback(publishNotification, 'File unavailable', 'That file or folder could not be found.')
                return false
            }

            return true
        }
        case 'settings-section': {
            if (!openOrFocusWindow('settings')) {
                publishFallback(publishNotification, 'Settings unavailable', 'Settings could not be opened.')
                return false
            }

            useDeepLinkIntentStore.getState().openSettingsSection(link.section)
            return true
        }
        case 'task-manager': {
            if (!openOrFocusWindow('taskmgr')) {
                publishFallback(publishNotification, 'Task Manager unavailable', 'Task Manager could not be opened.')
                return false
            }

            useDeepLinkIntentStore.getState().openTaskManagerView(
                link.tab ?? 'Processes',
                link.processId,
                link.processName,
            )
            return true
        }
        default:
            return false
    }
}
