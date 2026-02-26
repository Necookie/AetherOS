import TerminalWindow from '../components/TerminalWindow'
import TaskManagerWindow from '../components/TaskManagerWindow'
import type { DesktopWindowDef } from '../types/window'

export const DEFAULT_WINDOWS: DesktopWindowDef[] = [
    { id: 'term', title: 'Terminal', component: TerminalWindow, isOpen: true },
    { id: 'taskmgr', title: 'Task Manager', component: TaskManagerWindow, isOpen: true }
]
