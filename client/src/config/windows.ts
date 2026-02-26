import TerminalWindow from '../components/TerminalWindow'
import TaskManagerWindow from '../components/TaskManagerWindow'
import FileManagerApp from '../apps/file-manager/FileManagerApp'
import BrowserApp from '../apps/browser/BrowserApp'
import type { AppDefinition } from '../types/windowManager'

export const DEFAULT_APPS: AppDefinition[] = [
    {
        id: 'term',
        title: 'Terminal',
        component: TerminalWindow,
        defaultBounds: { x: 50, y: 50, width: 600, height: 400 }
    },
    {
        id: 'taskmgr',
        title: 'Task Manager',
        component: TaskManagerWindow,
        defaultBounds: { x: 100, y: 100, width: 600, height: 400 }
    },
    {
        id: 'explorer',
        title: 'File Manager',
        component: FileManagerApp,
        defaultBounds: { x: 150, y: 150, width: 800, height: 500 }
    },
    {
        id: 'browser',
        title: 'Aether Browser',
        component: BrowserApp,
        defaultBounds: { x: 100, y: 60, width: 900, height: 600 }
    }
]
