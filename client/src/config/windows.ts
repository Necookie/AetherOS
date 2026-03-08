import TerminalWindow from '../components/TerminalWindow'
import TaskManagerWindow from '../components/TaskManagerWindow'
import FileManagerApp from '../apps/file-manager/FileManagerApp'
import BrowserApp from '../apps/browser/BrowserApp'
import SettingsApp from '../apps/settings/SettingsApp'
import AppStoreApp from '../apps/app-store/AppStoreApp'
import { APP_MANIFEST } from './appManifest'
import type { AppDefinition } from '../types/windowManager'

const APP_COMPONENTS: Record<string, AppDefinition['component']> = {
    appstore: AppStoreApp,
    term: TerminalWindow,
    taskmgr: TaskManagerWindow,
    explorer: FileManagerApp,
    browser: BrowserApp,
    settings: SettingsApp,
}

export const DEFAULT_APPS: AppDefinition[] = APP_MANIFEST.map((entry) => ({
    ...entry,
    component: APP_COMPONENTS[entry.id] ?? TerminalWindow,
}))
