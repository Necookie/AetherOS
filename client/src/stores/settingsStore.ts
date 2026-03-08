import { create } from 'zustand'
import { DEFAULT_SETTINGS } from '../features/settings/defaults'
import { normalizeSettingsState } from '../features/settings/normalize'
import { settingsStorage } from '../features/settings/storage'
import type { DensityMode, OsSettingsState, TaskbarPosition, ThemeMode, ThemePalette } from '../features/settings/types'
import { useSessionStore } from './useSessionStore'
import { getActiveAccount } from '../features/accounts/services/sessionSelectors'
import { checkSettingsAccess } from '../features/permissions/guards'
import { permissionService } from '../features/permissions/permissionService'

interface SettingsActions {
    hydrateForActiveUser: () => void
    setThemeMode: (mode: ThemeMode) => void
    updateCustomPalette: (patch: Partial<ThemePalette>) => void
    setWallpaper: (wallpaperId: string) => void
    setIconScale: (scale: number) => void
    setTaskbarPosition: (position: TaskbarPosition) => void
    setAccentStrength: (strength: number) => void
    setDensity: (density: DensityMode) => void
    setFontScale: (scale: number) => void
    setHighContrast: (enabled: boolean) => void
    setReducedMotion: (enabled: boolean) => void
    setKeyboardHints: (enabled: boolean) => void
    setAnimations: (enabled: boolean) => void
    setTranslucentWindows: (enabled: boolean) => void
    setShowSecondsInClock: (enabled: boolean) => void
    resetSettings: () => void
}

export type SettingsStore = OsSettingsState & SettingsActions

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const loadInitialState = (): OsSettingsState => {
    try {
        return normalizeSettingsState(settingsStorage.load())
    } catch {
        return structuredClone(DEFAULT_SETTINGS)
    }
}

function persist(state: OsSettingsState) {
    settingsStorage.save(state)
}

function canMutateSettings() {
    const sessionState = useSessionStore.getState()
    const account = getActiveAccount(sessionState)

    if (!account || !sessionState.activeUserId) {
        return false
    }

    const access = checkSettingsAccess(account.role)
    if (access.allowed) {
        return true
    }

    if (access.needsPrompt && access.permission) {
        return permissionService.request(
            sessionState.activeUserId,
            access.permission,
            access.reason ?? 'Allow settings changes for this profile.',
        )
    }

    return false
}

const initialState = loadInitialState()

export const useSettingsStore = create<SettingsStore>((set) => ({
    ...initialState,
    hydrateForActiveUser: () => set(() => loadInitialState()),
    setThemeMode: (themeMode) => set((state) => {
        if (!canMutateSettings()) {
            return state
        }
        const next: OsSettingsState = {
            ...state,
            appearance: {
                ...state.appearance,
                themeMode,
            },
        }
        persist(next)
        return next
    }),
    updateCustomPalette: (patch) => set((state) => {
        if (!canMutateSettings()) {
            return state
        }
        const next: OsSettingsState = {
            ...state,
            appearance: {
                ...state.appearance,
                themeMode: 'custom',
                customPalette: {
                    ...state.appearance.customPalette,
                    ...patch,
                },
            },
        }
        persist(next)
        return next
    }),
    setWallpaper: (wallpaperId) => set((state) => {
        if (!canMutateSettings()) {
            return state
        }
        const next: OsSettingsState = {
            ...state,
            appearance: {
                ...state.appearance,
                wallpaperId,
            },
        }
        persist(next)
        return next
    }),
    setIconScale: (iconScale) => set((state) => {
        if (!canMutateSettings()) {
            return state
        }
        const next: OsSettingsState = {
            ...state,
            desktop: {
                ...state.desktop,
                iconScale: clamp(iconScale, 0.8, 1.35),
            },
        }
        persist(next)
        return next
    }),
    setTaskbarPosition: (taskbarPosition) => set((state) => {
        if (!canMutateSettings()) {
            return state
        }
        const next: OsSettingsState = {
            ...state,
            desktop: {
                ...state.desktop,
                taskbarPosition,
            },
        }
        persist(next)
        return next
    }),
    setAccentStrength: (accentStrength) => set((state) => {
        if (!canMutateSettings()) {
            return state
        }
        const next: OsSettingsState = {
            ...state,
            desktop: {
                ...state.desktop,
                accentStrength: clamp(accentStrength, 0.7, 1.4),
            },
        }
        persist(next)
        return next
    }),
    setDensity: (density) => set((state) => {
        if (!canMutateSettings()) {
            return state
        }
        const next: OsSettingsState = {
            ...state,
            accessibility: {
                ...state.accessibility,
                density,
            },
        }
        persist(next)
        return next
    }),
    setFontScale: (fontScale) => set((state) => {
        if (!canMutateSettings()) {
            return state
        }
        const next: OsSettingsState = {
            ...state,
            accessibility: {
                ...state.accessibility,
                fontScale: clamp(fontScale, 0.85, 1.35),
            },
        }
        persist(next)
        return next
    }),
    setHighContrast: (highContrast) => set((state) => {
        if (!canMutateSettings()) {
            return state
        }
        const next: OsSettingsState = {
            ...state,
            accessibility: {
                ...state.accessibility,
                highContrast,
            },
        }
        persist(next)
        return next
    }),
    setReducedMotion: (reducedMotion) => set((state) => {
        if (!canMutateSettings()) {
            return state
        }
        const next: OsSettingsState = {
            ...state,
            accessibility: {
                ...state.accessibility,
                reducedMotion,
            },
        }
        persist(next)
        return next
    }),
    setKeyboardHints: (keyboardHints) => set((state) => {
        if (!canMutateSettings()) {
            return state
        }
        const next: OsSettingsState = {
            ...state,
            accessibility: {
                ...state.accessibility,
                keyboardHints,
            },
        }
        persist(next)
        return next
    }),
    setAnimations: (animations) => set((state) => {
        if (!canMutateSettings()) {
            return state
        }
        const next: OsSettingsState = {
            ...state,
            behavior: {
                ...state.behavior,
                animations,
            },
        }
        persist(next)
        return next
    }),
    setTranslucentWindows: (translucentWindows) => set((state) => {
        if (!canMutateSettings()) {
            return state
        }
        const next: OsSettingsState = {
            ...state,
            behavior: {
                ...state.behavior,
                translucentWindows,
            },
        }
        persist(next)
        return next
    }),
    setShowSecondsInClock: (showSecondsInClock) => set((state) => {
        if (!canMutateSettings()) {
            return state
        }
        const next: OsSettingsState = {
            ...state,
            behavior: {
                ...state.behavior,
                showSecondsInClock,
            },
        }
        persist(next)
        return next
    }),
    resetSettings: () => set((state) => {
        if (!canMutateSettings()) {
            return state
        }
        const next = structuredClone(DEFAULT_SETTINGS)
        persist(next)
        return next
    }),
}))

export function selectSettingsState(state: SettingsStore): OsSettingsState {
    return {
        appearance: state.appearance,
        desktop: state.desktop,
        accessibility: state.accessibility,
        behavior: state.behavior,
    }
}
