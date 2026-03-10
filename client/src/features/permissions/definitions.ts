import type { PermissionDefinition, PermissionId } from './types'

export const PERMISSION_DEFINITIONS: Record<PermissionId, PermissionDefinition> = {
    'app.launch.settings': {
        id: 'app.launch.settings',
        label: 'Open Settings',
        description: 'Allows this profile to open the Settings app.',
        category: 'apps',
        recovery: 'Open Settings from the Permission Center and re-allow access for this profile.',
    },
    'app.launch.taskmgr': {
        id: 'app.launch.taskmgr',
        label: 'Open Task Manager',
        description: 'Allows this profile to open Task Manager.',
        category: 'apps',
        recovery: 'Use an admin profile if Task Manager access is required.',
    },
    'files.delete': {
        id: 'files.delete',
        label: 'Delete Files',
        description: 'Allows this profile to delete files and empty Trash.',
        category: 'files',
        recovery: 'Grant Delete Files again in the Permission Center before retrying the file action.',
    },
    'files.move.system': {
        id: 'files.move.system',
        label: 'Move Into System Paths',
        description: 'Allows this profile to move files into protected system directories.',
        category: 'files',
        recovery: 'Grant Move Into System Paths again in the Permission Center or choose a non-system folder.',
    },
    'settings.modify': {
        id: 'settings.modify',
        label: 'Modify Settings',
        description: 'Allows this profile to change OS settings.',
        category: 'settings',
        recovery: 'Grant Modify Settings again in the Permission Center before changing settings.',
    },
}

export const KNOWN_PERMISSION_IDS = Object.keys(PERMISSION_DEFINITIONS) as PermissionId[]

export function getPermissionDefinition(permission: PermissionId) {
    return PERMISSION_DEFINITIONS[permission]
}
