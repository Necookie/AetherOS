import type { WindowBounds } from '../types/windowManager'

export interface AppManifestEntry {
    id: string
    title: string
    defaultBounds?: WindowBounds
}

export const APP_MANIFEST: AppManifestEntry[] = [
    {
        id: 'appstore',
        title: 'App Store',
        defaultBounds: { x: 180, y: 90, width: 1020, height: 680 },
    },
    {
        id: 'term',
        title: 'Terminal',
        defaultBounds: { x: 50, y: 50, width: 600, height: 400 },
    },
    {
        id: 'taskmgr',
        title: 'Task Manager',
        defaultBounds: { x: 100, y: 100, width: 600, height: 400 },
    },
    {
        id: 'explorer',
        title: 'File Manager',
        defaultBounds: { x: 150, y: 150, width: 800, height: 500 },
    },
    {
        id: 'browser',
        title: 'Aether Browser',
        defaultBounds: { x: 100, y: 60, width: 900, height: 600 },
    },
    {
        id: 'settings',
        title: 'Settings',
        defaultBounds: { x: 140, y: 90, width: 980, height: 640 },
    },
    {
        id: 'notes',
        title: 'Notes',
        defaultBounds: { x: 190, y: 80, width: 1040, height: 690 },
    },
    {
        id: 'docs',
        title: 'Docs',
        defaultBounds: { x: 210, y: 95, width: 1080, height: 710 },
    },
    {
        id: 'boards',
        title: 'Boards',
        defaultBounds: { x: 230, y: 110, width: 1100, height: 720 },
    },
    {
        id: 'downloads',
        title: 'Download Manager',
        defaultBounds: { x: 260, y: 120, width: 980, height: 680 },
    },
]
