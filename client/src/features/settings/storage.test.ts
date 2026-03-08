import { afterEach, describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS } from './defaults'
import { createSettingsStorage } from './storage'

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

describe('settings storage', () => {
    afterEach(() => {
        // @ts-expect-error test cleanup
        delete globalThis.window
    })

    it('returns defaults when browser storage is unavailable', () => {
        const storage = createSettingsStorage()
        expect(storage.load()).toEqual(DEFAULT_SETTINGS)
    })

    it('round-trips persisted values through localStorage', () => {
        // @ts-expect-error test setup
        globalThis.window = { localStorage: createLocalStorageMock() }
        const storage = createSettingsStorage()

        const next = {
            ...DEFAULT_SETTINGS,
            behavior: {
                ...DEFAULT_SETTINGS.behavior,
                showSecondsInClock: true,
            },
        }

        storage.save(next)

        expect(storage.load().behavior.showSecondsInClock).toBe(true)
    })
})
