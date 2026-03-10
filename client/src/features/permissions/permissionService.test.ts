import { afterEach, describe, expect, it, vi } from 'vitest'
import { permissionService } from './permissionService'
import { getScopedStorageKey } from '../accounts/services/userScope'

function createLocalStorageMock() {
    const map = new Map<string, string>()

    return {
        get length() {
            return map.size
        },
        clear: () => {
            map.clear()
        },
        getItem: (key: string) => map.get(key) ?? null,
        key: (index: number) => [...map.keys()][index] ?? null,
        setItem: (key: string, value: string) => {
            map.set(key, value)
        },
        removeItem: (key: string) => {
            map.delete(key)
        },
    } as Storage
}

describe('permission service', () => {
    afterEach(() => {
        // @ts-expect-error test cleanup
        delete globalThis.window
        vi.restoreAllMocks()
    })

    it('persists remembered grants and skips future prompts', () => {
        const confirm = vi.fn()
            .mockReturnValueOnce(true)
            .mockReturnValueOnce(true)

        globalThis.window = {
            localStorage: createLocalStorageMock(),
            confirm,
        } as unknown as Window & typeof globalThis

        const first = permissionService.request('alex', 'settings.modify', 'Allow modifying settings?')
        expect(first).toBe(true)
        expect(confirm).toHaveBeenCalledTimes(2)

        const second = permissionService.request('alex', 'settings.modify', 'Allow modifying settings?')
        expect(second).toBe(true)
        expect(confirm).toHaveBeenCalledTimes(2)
        expect(permissionService.getGrant('alex', 'settings.modify')).toMatchObject({
            permission: 'settings.modify',
            source: {
                reason: 'Allow modifying settings?',
            },
        })
    })

    it('lists grant state and supports revoke', () => {
        const confirm = vi.fn()
            .mockReturnValueOnce(true)
            .mockReturnValueOnce(true)

        globalThis.window = {
            localStorage: createLocalStorageMock(),
            confirm,
        } as unknown as Window & typeof globalThis

        permissionService.request('alex', 'files.delete', 'Allow deleting files?')
        expect(permissionService.hasGrant('alex', 'files.delete')).toBe(true)

        const granted = permissionService.listPermissionStatuses('alex').find((status) => status.id === 'files.delete')
        expect(granted?.granted).toBe(true)
        expect(granted?.grant?.source.reason).toBe('Allow deleting files?')

        permissionService.revoke('alex', 'files.delete')

        const revoked = permissionService.listPermissionStatuses('alex').find((status) => status.id === 'files.delete')
        expect(revoked?.granted).toBe(false)
        expect(revoked?.grant).toBeNull()
    })

    it('requires a new access decision after revoke', () => {
        const confirm = vi.fn()
            .mockReturnValueOnce(true)
            .mockReturnValueOnce(true)
            .mockReturnValueOnce(false)

        globalThis.window = {
            localStorage: createLocalStorageMock(),
            confirm,
        } as unknown as Window & typeof globalThis

        expect(permissionService.request('alex', 'settings.modify', 'Allow modifying settings?')).toBe(true)
        permissionService.revoke('alex', 'settings.modify')

        expect(permissionService.request('alex', 'settings.modify', 'Allow modifying settings?')).toBe(false)
        expect(confirm).toHaveBeenCalledTimes(3)
    })

    it('migrates legacy remembered grants into typed grant records', () => {
        const localStorage = createLocalStorageMock()
        const key = getScopedStorageKey('aether.permissions.v1', 'alex')
        localStorage.setItem(key, JSON.stringify({
            grants: ['settings.modify'],
        }))

        globalThis.window = {
            localStorage,
            confirm: vi.fn(),
        } as unknown as Window & typeof globalThis

        const grant = permissionService.getGrant('alex', 'settings.modify')
        expect(grant).toMatchObject({
            permission: 'settings.modify',
            source: {
                reason: 'Migrated from remembered permission grant.',
            },
        })
    })
})
