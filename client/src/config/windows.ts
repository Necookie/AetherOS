import TerminalWindow from '../components/TerminalWindow'
import TaskManagerWindow from '../components/TaskManagerWindow'
import FileManagerApp from '../apps/file-manager/FileManagerApp'
import BrowserApp from '../apps/browser/BrowserApp'
import { APP_MANIFEST } from './appManifest'
import type { AppDefinition } from '../types/windowManager'

const APP_COMPONENTS: Record<string, AppDefinition['component']> = {
    term: TerminalWindow,
    taskmgr: TaskManagerWindow,
    explorer: FileManagerApp,
    browser: BrowserApp,
}

export const DEFAULT_APPS: AppDefinition[] = APP_MANIFEST.map((entry) => ({
    ...entry,
    component: APP_COMPONENTS[entry.id] ?? TerminalWindow,
}))
