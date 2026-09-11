import type { OsSettingsState, ThemeMode, ThemePalette, WallpaperOption } from './types'

// Apple design-system palette (see design.md). One accent, flat surfaces,
// hairline borders. textMuted uses Apple's real secondary gray (#6e6e73)
// rather than the spec's fine-print-only ink-muted-48 (#7a7a7a) because
// themeEngine's contrast guard would otherwise silently swap it to near-black
// the moment it fails 4.5:1 against surfaceMuted.
export const LIGHT_THEME: ThemePalette = {
    canvas: '#f5f5f7',
    elevated: '#ffffff',
    surface: '#ffffff',
    surfaceMuted: '#f5f5f7',
    border: '#e0e0e0',
    textPrimary: '#1d1d1f',
    textMuted: '#6e6e73',
    accent: '#0066cc',
    success: '#1a7f37',
    danger: '#d92d20',
}

// Dark tiles use the spec's near-black tile scale rather than a navy;
// accent uses Sky Link Blue (#2997ff) — the source system's dark-surface
// variant of the single accent — since Action Blue is reserved as the
// primary-button fill and reads better as a fill than as text/focus color
// against true black.
export const DARK_THEME: ThemePalette = {
    canvas: '#000000',
    elevated: '#252527',
    surface: '#272729',
    surfaceMuted: '#2a2a2c',
    border: 'rgba(255, 255, 255, 0.12)',
    textPrimary: '#ffffff',
    textMuted: '#cccccc',
    accent: '#2997ff',
    success: '#30a350',
    danger: '#ff6961',
}

export const WALLPAPER_OPTIONS: WallpaperOption[] = [
    {
        id: 'aether-daybreak',
        label: 'Aether Daybreak',
        kind: 'image',
        value: '/assets/wallpapers/aether-daybreak.webp',
        theme: 'light',
        desktopText: 'dark',
        scrim: 0,
    },
    {
        id: 'aether-cirrus',
        label: 'Aether Cirrus',
        kind: 'image',
        value: '/assets/wallpapers/aether-cirrus.webp',
        theme: 'light',
        desktopText: 'dark',
        scrim: 0,
    },
    {
        id: 'aether-midnight',
        label: 'Aether Midnight',
        kind: 'image',
        value: '/assets/wallpapers/aether-midnight.webp',
        theme: 'dark',
        desktopText: 'light',
        scrim: 0,
    },
    {
        id: 'aether-eclipse',
        label: 'Aether Eclipse',
        kind: 'image',
        value: '/assets/wallpapers/aether-eclipse.webp',
        theme: 'dark',
        desktopText: 'light',
        scrim: 0,
    },
    {
        id: 'aether-bloom',
        label: 'Aether Bloom',
        kind: 'image',
        value: '/assets/wallpapers/aether-bloom.webp',
        theme: 'custom',
        desktopText: 'dark',
        scrim: 0.08,
    },
    {
        id: 'aether-topology',
        label: 'Signal Topology',
        kind: 'image',
        value: '/assets/wallpapers/aether-topology.webp',
        theme: 'custom',
        desktopText: 'light',
        scrim: 0.08,
    },
    {
        id: 'urban-night',
        label: 'Urban Night',
        kind: 'image',
        value: '/assets/wallpapers/urban-night-street.jpg',
        theme: 'dark',
        desktopText: 'light',
        scrim: 0.35,
    },
    {
        id: 'parchment',
        label: 'Parchment',
        kind: 'solid',
        value: '#f5f5f7',
        theme: 'light',
        desktopText: 'dark',
    },
    {
        id: 'studio-black',
        label: 'Studio Black',
        kind: 'solid',
        value: '#1d1d1f',
        theme: 'dark',
        desktopText: 'light',
    },
]

export const DEFAULT_WALLPAPER_BY_THEME: Record<ThemeMode, string> = {
    light: 'aether-daybreak',
    dark: 'aether-midnight',
    custom: 'aether-bloom',
}

export const DEFAULT_SETTINGS: OsSettingsState = {
    appearance: {
        themeMode: 'light',
        customPalette: { ...LIGHT_THEME },
        wallpaperId: DEFAULT_WALLPAPER_BY_THEME.light,
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
    shortcuts: {
        overrides: {},
    },
}
