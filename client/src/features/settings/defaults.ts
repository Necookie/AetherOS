import type { OsSettingsState, ThemePalette, WallpaperOption } from './types'

export const LIGHT_THEME: ThemePalette = {
    canvas: '#cde8ff',
    elevated: '#f1f7ff',
    surface: '#ffffff',
    surfaceMuted: '#ecf4ff',
    border: '#b9cae2',
    textPrimary: '#172033',
    textMuted: '#4f678a',
    accent: '#0a84ff',
    success: '#22c55e',
    danger: '#ef4444',
}

export const DARK_THEME: ThemePalette = {
    canvas: '#0b1220',
    elevated: '#121b2f',
    surface: '#16233a',
    surfaceMuted: '#1d2c46',
    border: '#2b3c5f',
    textPrimary: '#e6edf8',
    textMuted: '#9ab0d0',
    accent: '#5aa9ff',
    success: '#22c55e',
    danger: '#f87171',
}

export const WALLPAPER_OPTIONS: WallpaperOption[] = [
    {
        id: 'urban-night',
        label: 'Urban Night',
        kind: 'image',
        value: '/assets/wallpapers/urban-night-street.jpg',
    },
    {
        id: 'aurora',
        label: 'Aurora Sky',
        kind: 'gradient',
        value: 'radial-gradient(1200px 700px at 15% 15%, #7dd3fc 0%, transparent 58%), radial-gradient(960px 700px at 85% 20%, #818cf8 0%, transparent 60%), linear-gradient(165deg, #0f172a 0%, #1d4ed8 50%, #0f766e 100%)',
    },
    {
        id: 'sunrise',
        label: 'Soft Sunrise',
        kind: 'gradient',
        value: 'radial-gradient(900px 500px at 20% 10%, #fda4af 0%, transparent 62%), radial-gradient(1000px 600px at 80% 25%, #93c5fd 0%, transparent 65%), linear-gradient(160deg, #fef3c7 0%, #fde68a 35%, #fbcfe8 100%)',
    },
]

export const DEFAULT_SETTINGS: OsSettingsState = {
    appearance: {
        themeMode: 'light',
        customPalette: { ...LIGHT_THEME },
        wallpaperId: WALLPAPER_OPTIONS[0].id,
    },
    desktop: {
        iconScale: 1,
        taskbarPosition: 'bottom',
        accentStrength: 1,
    },
    accessibility: {
        density: 'comfortable',
        fontScale: 1,
        highContrast: false,
        reducedMotion: false,
        keyboardHints: true,
    },
    behavior: {
        animations: true,
        translucentWindows: true,
        showSecondsInClock: false,
    },
}
