import { APP_MANIFEST } from './appManifest'
import type { AppDefinition } from '../types/windowManager'
import { createRecoverableLazyWindow } from '../components/system/WindowRecoveryBoundary'

const APP_COMPONENTS: Record<string, AppDefinition['component']> = {
    appstore: createRecoverableLazyWindow('App Store', () => import('../apps/app-store/AppStoreApp')),
    term: createRecoverableLazyWindow('Terminal', () => import('../components/TerminalWindow')),
    taskmgr: createRecoverableLazyWindow('Task Manager', () => import('../components/TaskManagerWindow')),
    explorer: createRecoverableLazyWindow('File Manager', () => import('../apps/file-manager/FileManagerApp')),
    browser: createRecoverableLazyWindow('Aether Browser', () => import('../apps/browser/BrowserApp')),
    settings: createRecoverableLazyWindow('Settings', () => import('../apps/settings/SettingsApp')),
    notes: createRecoverableLazyWindow('Notes', () => import('../apps/notes/NotesApp')),
    docs: createRecoverableLazyWindow('Docs', () => import('../apps/docs/DocsApp')),
    boards: createRecoverableLazyWindow('Boards', () => import('../apps/boards/BoardsApp')),
    downloads: createRecoverableLazyWindow('Download Manager', () => import('../apps/downloads/DownloadManagerApp')),
}

export const DEFAULT_APPS: AppDefinition[] = APP_MANIFEST.map((entry) => ({
    ...entry,
    component: APP_COMPONENTS[entry.id] ?? APP_COMPONENTS.term,
}))
