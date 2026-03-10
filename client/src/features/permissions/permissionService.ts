import { getScopedStorageKey } from '../accounts/services/userScope'
import { KNOWN_PERMISSION_IDS, getPermissionDefinition } from './definitions'
import type { PermissionGrantRecord, PermissionId, PermissionStatus } from './types'

const PERMISSION_KEY = 'aether.permissions.v1'

interface PermissionMap {
    grants: Partial<Record<PermissionId, PermissionGrantRecord>>
}

function canUseStorage() {
    return typeof window !== 'undefined' && Boolean(window.localStorage)
}

function isPermissionId(value: string): value is PermissionId {
    return KNOWN_PERMISSION_IDS.includes(value as PermissionId)
}

function migrateLegacyGrants(grants: PermissionId[]): Partial<Record<PermissionId, PermissionGrantRecord>> {
    const requestedAt = new Date(0).toISOString()

    return grants.reduce<Partial<Record<PermissionId, PermissionGrantRecord>>>((records, permission) => {
        records[permission] = {
            permission,
            grantedAt: requestedAt,
            source: {
                reason: 'Migrated from remembered permission grant.',
                requestedAt,
            },
        }
        return records
    }, {})
}

function readGrants(userId: string): Partial<Record<PermissionId, PermissionGrantRecord>> {
    if (!canUseStorage()) {
        return {}
    }

    const key = getScopedStorageKey(PERMISSION_KEY, userId)
    const raw = window.localStorage.getItem(key)
    if (!raw) {
        return {}
    }

    try {
        const parsed = JSON.parse(raw) as PermissionMap | { grants?: PermissionId[] }
        if (Array.isArray(parsed.grants)) {
            return migrateLegacyGrants(parsed.grants.filter(isPermissionId))
        }

        return Object.fromEntries(
            Object.entries(parsed.grants ?? {}).filter(([permission, grant]) => isPermissionId(permission) && Boolean(grant)),
        ) as Partial<Record<PermissionId, PermissionGrantRecord>>
    } catch {
        return {}
    }
}

function writeGrants(userId: string, grants: Partial<Record<PermissionId, PermissionGrantRecord>>) {
    if (!canUseStorage()) {
        return
    }

    const key = getScopedStorageKey(PERMISSION_KEY, userId)

    try {
        window.localStorage.setItem(key, JSON.stringify({ grants }))
    } catch {
        // Keep runtime flow active even if persistence is unavailable.
    }
}

function canPrompt() {
    return typeof window !== 'undefined' && typeof window.confirm === 'function'
}

export const permissionService = {
    hasGrant(userId: string, permission: PermissionId) {
        return Boolean(readGrants(userId)[permission])
    },

    getGrant(userId: string, permission: PermissionId) {
        return readGrants(userId)[permission] ?? null
    },

    listPermissionStatuses(userId: string): PermissionStatus[] {
        const grants = readGrants(userId)

        return KNOWN_PERMISSION_IDS.map((permission) => {
            const definition = getPermissionDefinition(permission)
            const grant = grants[permission] ?? null
            return {
                ...definition,
                granted: Boolean(grant),
                grant,
            }
        })
    },

    request(userId: string, permission: PermissionId, reason: string) {
        if (this.hasGrant(userId, permission)) {
            return true
        }

        if (!canPrompt()) {
            return false
        }

        const definition = getPermissionDefinition(permission)
        const allowed = window.confirm(`Permission request: ${definition.label}\n\n${reason}`)
        if (!allowed) {
            return false
        }

        const remember = window.confirm('Remember this permission for this profile?')
        if (remember) {
            const grants = readGrants(userId)
            const requestedAt = new Date().toISOString()
            grants[permission] = {
                permission,
                grantedAt: requestedAt,
                source: {
                    reason,
                    requestedAt,
                },
            }
            writeGrants(userId, grants)
        }

        return true
    },

    revoke(userId: string, permission: PermissionId) {
        const grants = readGrants(userId)
        if (!grants[permission]) {
            return
        }

        delete grants[permission]
        writeGrants(userId, grants)
    },

    clearUserGrants(userId: string) {
        if (!canUseStorage()) {
            return
        }

        const key = getScopedStorageKey(PERMISSION_KEY, userId)
        window.localStorage.removeItem(key)
    },
}
