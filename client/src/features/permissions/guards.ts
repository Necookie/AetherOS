import type { AccountRole } from '../accounts/types'
import type { FilePermissionAction, PermissionDecision } from './types'

const SYSTEM_PATH_PREFIXES = ['/etc', '/var', '/data']

function inSystemPath(path: string) {
    return SYSTEM_PATH_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
}

export function checkAppLaunchAccess(role: AccountRole, appId: string): PermissionDecision {
    if (role === 'admin') {
        return { allowed: true, reason: null, needsPrompt: false }
    }

    if (role === 'guest') {
        const allowed = new Set(['browser'])
        if (!allowed.has(appId)) {
            return { allowed: false, reason: 'Guest profile cannot launch this app.', needsPrompt: false }
        }
        return { allowed: true, reason: null, needsPrompt: false }
    }

    if (appId === 'taskmgr') {
        return {
            allowed: false,
            reason: 'Member profile is blocked from launching Task Manager.',
            needsPrompt: false,
        }
    }

    if (appId === 'settings') {
        return {
            allowed: false,
            reason: 'Settings access requires explicit consent.',
            needsPrompt: true,
            permission: 'app.launch.settings',
        }
    }

    return { allowed: true, reason: null, needsPrompt: false }
}

export function checkFileMutationAccess(role: AccountRole, action: FilePermissionAction, path: string): PermissionDecision {
    if (role === 'admin') {
        return { allowed: true, reason: null, needsPrompt: false }
    }

    if (role === 'guest') {
        return { allowed: false, reason: 'Guest profile is read-only for files.', needsPrompt: false }
    }

    if (action === 'delete') {
        return {
            allowed: false,
            reason: 'Deleting files requires explicit consent.',
            needsPrompt: true,
            permission: 'files.delete',
        }
    }

    if (action === 'move' && inSystemPath(path)) {
        return {
            allowed: false,
            reason: 'Moving files into system paths requires explicit consent.',
            needsPrompt: true,
            permission: 'files.move.system',
        }
    }

    return { allowed: true, reason: null, needsPrompt: false }
}

export function checkFilePathAccess(role: AccountRole, path: string): PermissionDecision {
    if (role === 'admin') {
        return { allowed: true, reason: null, needsPrompt: false }
    }

    if (role === 'guest' && inSystemPath(path)) {
        return {
            allowed: false,
            reason: 'Guest profile cannot open protected system paths.',
            needsPrompt: false,
        }
    }

    return { allowed: true, reason: null, needsPrompt: false }
}

export function checkSettingsAccess(role: AccountRole): PermissionDecision {
    if (role === 'admin') {
        return { allowed: true, reason: null, needsPrompt: false }
    }

    if (role === 'guest') {
        return {
            allowed: false,
            reason: 'Guest profile cannot modify settings.',
            needsPrompt: false,
        }
    }

    return {
        allowed: false,
        reason: 'Changing settings requires explicit consent.',
        needsPrompt: true,
        permission: 'settings.modify',
    }
}
