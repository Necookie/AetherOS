import TerminalWindow from '../components/TerminalWindow'
import TaskManagerWindow from '../components/TaskManagerWindow'
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
    }
]
