import { DEFAULT_SETTINGS } from './defaults'
import { normalizeSettingsState } from './normalize'
import type { OsSettingsState } from './types'

const PERSIST_KEY = 'aether.settings.v1'

export interface SettingsStorage {
    load: () => OsSettingsState
    save: (settings: OsSettingsState) => void
}

function canUseStorage() {
    return typeof window !== 'undefined' && Boolean(window.localStorage)
}

export function createSettingsStorage(): SettingsStorage {
    return {
        load: () => {
            if (!canUseStorage()) {
                return structuredClone(DEFAULT_SETTINGS)
            }

            const raw = window.localStorage.getItem(PERSIST_KEY)
            if (!raw) {
                return structuredClone(DEFAULT_SETTINGS)
            }

            try {
                return normalizeSettingsState(JSON.parse(raw))
            } catch {
                return structuredClone(DEFAULT_SETTINGS)
            }
        },
        save: (settings) => {
            if (!canUseStorage()) {
                return
            }

            try {
                window.localStorage.setItem(PERSIST_KEY, JSON.stringify(settings))
            } catch {
                // Ignore persistence issues and keep in-memory state active.
            }
        },
    }
}

export const settingsStorage = createSettingsStorage()
