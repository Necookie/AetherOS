import type { RemappableShortcutActionId, ShortcutOverrides } from '../shortcuts/shortcutConfig'
export type ThemeMode = 'light' | 'dark' | 'custom'
export type DensityMode = 'comfortable' | 'cozy' | 'compact'
export type TaskbarPosition = 'bottom' | 'top'

export interface ThemePalette {
    canvas: string
    elevated: string
    surface: string
    surfaceMuted: string
    border: string
    textPrimary: string
    textMuted: string
    accent: string
    success: string
    danger: string
}

export interface AppearanceSettings {
    themeMode: ThemeMode
    customPalette: ThemePalette
    wallpaperId: string
}

export interface DesktopSettings {
    iconScale: number
    taskbarPosition: TaskbarPosition
    accentStrength: number
}

export interface AccessibilitySettings {
    density: DensityMode
    fontScale: number
    highContrast: boolean
    reducedMotion: boolean
    keyboardHints: boolean
}

export interface BehaviorSettings {
    animations: boolean
    translucentWindows: boolean
    showSecondsInClock: boolean
}

export interface ShortcutSettings {
    overrides: ShortcutOverrides
}

export interface OsSettingsState {
    appearance: AppearanceSettings
    desktop: DesktopSettings
    accessibility: AccessibilitySettings
    behavior: BehaviorSettings
    shortcuts: ShortcutSettings
}

export type ShortcutRemapAction = RemappableShortcutActionId

export interface ThemeTokens {
    colorBgCanvas: string
    colorBgElevated: string
    colorSurface: string
    colorSurfaceMuted: string
    colorBorder: string
    colorTextPrimary: string
    colorTextMuted: string
    colorAccent: string
    colorSuccess: string
    colorDanger: string
    shellTopbarHeight: string
    shellDockHeight: string
    shellEdgeGap: string
    densityScale: string
    fontScalePercent: string
    focusRingWidth: string
    controlMinHeight: string
    motionDurationFast: string
    motionDurationNormal: string
    windowBackdropBlur: string
}

export interface WallpaperOption {
    id: string
    label: string
    kind: 'image' | 'gradient'
    value: string
}
