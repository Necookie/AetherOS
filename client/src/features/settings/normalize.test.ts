import { describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS } from './defaults'
import { normalizeSettingsState } from './normalize'

describe('normalizeSettingsState', () => {
    it('falls back to defaults for invalid payloads', () => {
        expect(normalizeSettingsState(null)).toEqual(DEFAULT_SETTINGS)
        expect(normalizeSettingsState({ appearance: { themeMode: 'unknown' } })).toEqual({
            ...DEFAULT_SETTINGS,
            appearance: {
                ...DEFAULT_SETTINGS.appearance,
                customPalette: DEFAULT_SETTINGS.appearance.customPalette,
            },
        })
    })

    it('clamps numerical settings and preserves valid values', () => {
        const normalized = normalizeSettingsState({
            appearance: {
                themeMode: 'dark',
                wallpaperId: 'urban-night',
            },
            desktop: {
                iconScale: 2,
                accentStrength: 0.1,
                taskbarPosition: 'top',
            },
            accessibility: {
                density: 'compact',
                fontScale: 0.2,
            },
        })

        expect(normalized.appearance.themeMode).toBe('dark')
        expect(normalized.desktop.iconScale).toBe(1.35)
        expect(normalized.desktop.accentStrength).toBe(0.7)
        expect(normalized.desktop.taskbarPosition).toBe('top')
        expect(normalized.accessibility.fontScale).toBe(0.85)
        expect(normalized.accessibility.density).toBe('compact')
    })
})
