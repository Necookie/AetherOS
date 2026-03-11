import { afterEach, describe, expect, it } from 'vitest'
import { sessionStorage } from './sessionStorage'

function createLocalStorageMock() {
    const map = new Map<string, string>()

    return {
        getItem: (key: string) => map.get(key) ?? null,
        setItem: (key: string, value: string) => {
            map.set(key, value)
        },
        removeItem: (key: string) => {
            map.delete(key)
        },
        clear: () => {
            map.clear()
        },
    }
}

describe('session storage', () => {
    afterEach(() => {
        // @ts-expect-error test cleanup
        delete globalThis.window
    })

    it('forces the lock screen when persisted state has no valid active user', () => {
        const localStorage = createLocalStorageMock()
        localStorage.setItem('aether.session.v1', JSON.stringify({
            activeUserId: null,
            selectedLoginUserId: 'admin',
            isLocked: false,
        }))

        // @ts-expect-error test setup
        globalThis.window = { localStorage }

        expect(sessionStorage.load()).toEqual({
            activeUserId: null,
            selectedLoginUserId: 'admin',
            isLocked: true,
        })
    })
})
