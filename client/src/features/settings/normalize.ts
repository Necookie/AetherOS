import { DEFAULT_SETTINGS, WALLPAPER_OPTIONS } from './defaults'
import { validateShortcutOverrides } from '../shortcuts/shortcutConfig'
import type {
    AccessibilitySettings,
    BehaviorSettings,
    DesktopSettings,
    OsSettingsState,
    ThemeMode,
    ThemePalette,
} from './types'

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max)
}

function isThemeMode(value: unknown): value is ThemeMode {
    return value === 'light' || value === 'dark' || value === 'custom'
}

function normalizePalette(value: unknown): ThemePalette {
    if (!value || typeof value !== 'object') {
        return { ...DEFAULT_SETTINGS.appearance.customPalette }
    }

    const source = value as Partial<ThemePalette>
    const fallback = DEFAULT_SETTINGS.appearance.customPalette

    return {
        canvas: typeof source.canvas === 'string' ? source.canvas : fallback.canvas,
        elevated: typeof source.elevated === 'string' ? source.elevated : fallback.elevated,
        surface: typeof source.surface === 'string' ? source.surface : fallback.surface,
        surfaceMuted: typeof source.surfaceMuted === 'string' ? source.surfaceMuted : fallback.surfaceMuted,
        border: typeof source.border === 'string' ? source.border : fallback.border,
        textPrimary: typeof source.textPrimary === 'string' ? source.textPrimary : fallback.textPrimary,
        textMuted: typeof source.textMuted === 'string' ? source.textMuted : fallback.textMuted,
        accent: typeof source.accent === 'string' ? source.accent : fallback.accent,
        success: typeof source.success === 'string' ? source.success : fallback.success,
        danger: typeof source.danger === 'string' ? source.danger : fallback.danger,
    }
}

function normalizeDesktop(value: unknown): DesktopSettings {
    if (!value || typeof value !== 'object') {
        return { ...DEFAULT_SETTINGS.desktop }
    }

    const source = value as Partial<DesktopSettings>

    return {
        iconScale: clamp(typeof source.iconScale === 'number' ? source.iconScale : DEFAULT_SETTINGS.desktop.iconScale, 0.8, 1.35),
        taskbarPosition: source.taskbarPosition === 'top' ? 'top' : 'bottom',
        accentStrength: clamp(typeof source.accentStrength === 'number' ? source.accentStrength : DEFAULT_SETTINGS.desktop.accentStrength, 0.7, 1.4),
    }
}

function normalizeAccessibility(value: unknown): AccessibilitySettings {
    if (!value || typeof value !== 'object') {
        return { ...DEFAULT_SETTINGS.accessibility }
    }

    const source = value as Partial<AccessibilitySettings>

    return {
        density: source.density === 'compact' || source.density === 'cozy' ? source.density : 'comfortable',
        fontScale: clamp(typeof source.fontScale === 'number' ? source.fontScale : DEFAULT_SETTINGS.accessibility.fontScale, 0.85, 1.35),
        highContrast: Boolean(source.highContrast),
        reducedMotion: Boolean(source.reducedMotion),
        keyboardHints: source.keyboardHints !== false,
    }
}

function normalizeBehavior(value: unknown): BehaviorSettings {
    if (!value || typeof value !== 'object') {
        return { ...DEFAULT_SETTINGS.behavior }
    }

    const source = value as Partial<BehaviorSettings>

    return {
        animations: source.animations !== false,
        translucentWindows: source.translucentWindows !== false,
        showSecondsInClock: Boolean(source.showSecondsInClock),
    }
}

function normalizeShortcuts(value: unknown) {
    if (!value || typeof value !== 'object') {
        return { ...DEFAULT_SETTINGS.shortcuts }
    }

    const source = value as { overrides?: unknown }
    const overrides = source.overrides && typeof source.overrides === 'object' ? source.overrides : undefined
    const validation = validateShortcutOverrides(overrides)

    return {
        overrides: validation.normalizedOverrides,
    }
}

export function normalizeSettingsState(value: unknown): OsSettingsState {
    if (!value || typeof value !== 'object') {
        return structuredClone(DEFAULT_SETTINGS)
    }

    const source = value as Partial<OsSettingsState>
    const normalizedWallpaperId = typeof source.appearance?.wallpaperId === 'string'
        && WALLPAPER_OPTIONS.some((option) => option.id === source.appearance?.wallpaperId)
        ? source.appearance.wallpaperId
        : DEFAULT_SETTINGS.appearance.wallpaperId

    return {
        appearance: {
            themeMode: isThemeMode(source.appearance?.themeMode) ? source.appearance.themeMode : DEFAULT_SETTINGS.appearance.themeMode,
            customPalette: normalizePalette(source.appearance?.customPalette),
            wallpaperId: normalizedWallpaperId,
        },
        desktop: normalizeDesktop(source.desktop),
        accessibility: normalizeAccessibility(source.accessibility),
        behavior: normalizeBehavior(source.behavior),
        shortcuts: normalizeShortcuts(source.shortcuts),
    }
}
