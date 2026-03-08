import type { WindowData } from '../../../types/windowManager'
import { filterShellApps } from './appCatalog'

export type LauncherStatus = 'running' | 'minimized' | 'not-running'

interface LauncherWindowState {
    state: Pick<WindowData['state'], 'isMinimized'>
}

export interface LauncherItem {
    id: string
    title: string
    status: LauncherStatus
}

export function resolveLauncherStatus(windowData: LauncherWindowState | undefined): LauncherStatus {
    if (!windowData) {
        return 'not-running'
    }

    if (windowData.state.isMinimized) {
        return 'minimized'
    }

    return 'running'
}

export function getLauncherStatusLabel(status: LauncherStatus): string {
    if (status === 'running') {
        return 'Running'
    }

    if (status === 'minimized') {
        return 'Minimized'
    }

    return 'Not running'
}

export function getLauncherItems(query: string, windows: Record<string, LauncherWindowState | undefined>): LauncherItem[] {
    return filterShellApps(query).map((app) => ({
        id: app.id,
        title: app.title,
        status: resolveLauncherStatus(windows[app.id]),
    }))
}

export function getLauncherEmptyMessage(query: string): string {
    if (!query.trim()) {
        return 'No apps are available in this profile.'
    }

    return `No apps match "${query.trim()}".`
}
