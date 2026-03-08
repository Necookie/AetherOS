import { afterEach, describe, expect, it, vi } from 'vitest'
import { permissionService } from './permissionService'

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
    })
})
