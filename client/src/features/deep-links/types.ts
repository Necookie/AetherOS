import type { ProductivityAppId } from '../productivity'

export type ProductivityPanel = 'editor' | 'links' | 'attachments'

export type SettingsSection = 'appearance' | 'desktop' | 'accessibility' | 'behavior' | 'shortcuts'

export type TaskManagerTab = 'Processes' | 'Performance' | 'Network'

export type NotificationDeepLink =
    | {
        kind: 'app'
        appId: 'browser' | 'explorer' | 'settings' | 'taskmgr' | 'downloads' | ProductivityAppId
    }
    | {
        kind: 'productivity-record'
        appId: ProductivityAppId
        recordId: string
        panel?: ProductivityPanel
    }
    | {
        kind: 'browser-url'
        url: string
        reuseExistingTab?: boolean
    }
    | {
        kind: 'file-manager-path'
        path: string
    }
    | {
        kind: 'settings-section'
        section: SettingsSection
    }
    | {
        kind: 'task-manager'
        tab?: TaskManagerTab
        processId?: number
        processName?: string
    }
    | {
        kind: 'downloads'
    }
