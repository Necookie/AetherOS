import { getScopedStorageKey } from '../accounts/services/userScope'
import type { PermissionId } from './types'

const PERMISSION_KEY = 'aether.permissions.v1'

interface PermissionMap {
    grants: PermissionId[]
}

function canUseStorage() {
    return typeof window !== 'undefined' && Boolean(window.localStorage)
}

function readGrants(userId: string): Set<PermissionId> {
    if (!canUseStorage()) {
        return new Set()
    }

    const key = getScopedStorageKey(PERMISSION_KEY, userId)
    const raw = window.localStorage.getItem(key)
    if (!raw) {
        return new Set()
    }

    try {
        const parsed = JSON.parse(raw) as PermissionMap
        return new Set(parsed.grants ?? [])
    } catch {
        return new Set()
    }
}

function writeGrants(userId: string, grants: Set<PermissionId>) {
    if (!canUseStorage()) {
        return
    }

    const key = getScopedStorageKey(PERMISSION_KEY, userId)

    try {
        window.localStorage.setItem(key, JSON.stringify({ grants: [...grants] }))
    } catch {
        // Keep runtime flow active even if persistence is unavailable.
    }
}

function canPrompt() {
    return typeof window !== 'undefined' && typeof window.confirm === 'function'
}

export const permissionService = {
    hasGrant(userId: string, permission: PermissionId) {
        return readGrants(userId).has(permission)
    },

    request(userId: string, permission: PermissionId, reason: string) {
        if (this.hasGrant(userId, permission)) {
            return true
        }

        if (!canPrompt()) {
            return false
        }

        const allowed = window.confirm(`Permission request: ${reason}`)
        if (!allowed) {
            return false
        }

        const remember = window.confirm('Remember this permission for this profile?')
        if (remember) {
            const grants = readGrants(userId)
            grants.add(permission)
            writeGrants(userId, grants)
        }

        return true
    },

    clearUserGrants(userId: string) {
        if (!canUseStorage()) {
            return
        }

        const key = getScopedStorageKey(PERMISSION_KEY, userId)
        window.localStorage.removeItem(key)
    },
}
