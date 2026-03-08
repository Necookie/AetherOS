import { DARK_THEME, LIGHT_THEME, WALLPAPER_OPTIONS } from './defaults'
import type { OsSettingsState, ThemePalette, ThemeTokens, WallpaperOption } from './types'

interface Rgb {
    r: number
    g: number
    b: number
}

function hexToRgb(hex: string): Rgb {
    const normalized = hex.trim().replace('#', '')
    const expanded = normalized.length === 3
        ? normalized.split('').map((char) => `${char}${char}`).join('')
        : normalized

    const value = Number.parseInt(expanded, 16)
    if (Number.isNaN(value) || expanded.length !== 6) {
        return { r: 0, g: 0, b: 0 }
    }

    return {
        r: (value >> 16) & 255,
        g: (value >> 8) & 255,
        b: value & 255,
    }
}

function rgbToHex({ r, g, b }: Rgb) {
    return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, '0')).join('')}`
}

function blend(base: string, overlay: string, weight: number) {
    const baseRgb = hexToRgb(base)
    const overlayRgb = hexToRgb(overlay)
    const clampedWeight = Math.min(Math.max(weight, 0), 1)

    return rgbToHex({
        r: Math.round(baseRgb.r + (overlayRgb.r - baseRgb.r) * clampedWeight),
        g: Math.round(baseRgb.g + (overlayRgb.g - baseRgb.g) * clampedWeight),
        b: Math.round(baseRgb.b + (overlayRgb.b - baseRgb.b) * clampedWeight),
    })
}

function luminance(hex: string) {
    const { r, g, b } = hexToRgb(hex)

    const normalize = (channel: number) => {
        const scaled = channel / 255
        return scaled <= 0.03928
            ? scaled / 12.92
            : ((scaled + 0.055) / 1.055) ** 2.4
    }

    return 0.2126 * normalize(r) + 0.7152 * normalize(g) + 0.0722 * normalize(b)
}

export function contrastRatio(foreground: string, background: string) {
    const light = Math.max(luminance(foreground), luminance(background))
    const dark = Math.min(luminance(foreground), luminance(background))
    return (light + 0.05) / (dark + 0.05)
}

function ensureReadableTextColor(textColor: string, backgroundColor: string) {
    if (contrastRatio(textColor, backgroundColor) >= 4.5) {
        return textColor
    }

    const nearBlack = '#0b1220'
    const nearWhite = '#f8fbff'
    const blackContrast = contrastRatio(nearBlack, backgroundColor)
    const whiteContrast = contrastRatio(nearWhite, backgroundColor)
    return blackContrast > whiteContrast ? nearBlack : nearWhite
}

function resolvePalette(state: OsSettingsState): ThemePalette {
    const base = state.appearance.themeMode === 'dark'
        ? DARK_THEME
        : state.appearance.themeMode === 'custom'
            ? state.appearance.customPalette
            : LIGHT_THEME

    const contrastBoost = state.accessibility.highContrast ? 0.2 : 0
    const accentStrengthDelta = Math.min(Math.max(state.desktop.accentStrength - 1, -0.3), 0.4)
    const enhancedAccent = accentStrengthDelta >= 0
        ? blend(base.accent, '#ffffff', accentStrengthDelta * 0.55)
        : blend(base.accent, '#0f172a', Math.abs(accentStrengthDelta) * 0.45)

    const surface = contrastBoost > 0
        ? blend(base.surface, state.appearance.themeMode === 'dark' ? '#0b1220' : '#ffffff', contrastBoost)
        : base.surface
    const surfaceMuted = contrastBoost > 0
        ? blend(base.surfaceMuted, state.appearance.themeMode === 'dark' ? '#0f172a' : '#ffffff', contrastBoost * 0.8)
        : base.surfaceMuted

    return {
        ...base,
        surface,
        surfaceMuted,
        accent: enhancedAccent,
        textPrimary: ensureReadableTextColor(base.textPrimary, surface),
        textMuted: ensureReadableTextColor(base.textMuted, surfaceMuted),
    }
}

function resolveDensityScale(state: OsSettingsState) {
    switch (state.accessibility.density) {
    case 'compact':
        return 0.86
    case 'cozy':
        return 0.93
    default:
        return 1
    }
}

function scaledRem(baseRem: number, scale: number) {
    return `${(baseRem * scale).toFixed(3)}rem`
}

export function resolveWallpaper(optionId: string): WallpaperOption {
    return WALLPAPER_OPTIONS.find((option) => option.id === optionId) ?? WALLPAPER_OPTIONS[0]
}

export function getWallpaperCss(optionId: string) {
    const wallpaper = resolveWallpaper(optionId)
    if (wallpaper.kind === 'image') {
        return `linear-gradient(180deg, rgb(2 6 23 / 0.28), rgb(2 6 23 / 0.5)), url('${wallpaper.value}')`
    }

    return wallpaper.value
}

export function createThemeTokens(state: OsSettingsState): ThemeTokens {
    const palette = resolvePalette(state)
    const densityScale = resolveDensityScale(state)
    const reducedMotion = state.accessibility.reducedMotion || !state.behavior.animations

    return {
        colorBgCanvas: palette.canvas,
        colorBgElevated: palette.elevated,
        colorSurface: palette.surface,
        colorSurfaceMuted: palette.surfaceMuted,
        colorBorder: palette.border,
        colorTextPrimary: palette.textPrimary,
        colorTextMuted: palette.textMuted,
        colorAccent: palette.accent,
        colorSuccess: palette.success,
        colorDanger: palette.danger,
        shellTopbarHeight: scaledRem(2.75, densityScale),
        shellDockHeight: scaledRem(3.5, densityScale),
        shellEdgeGap: scaledRem(0.75, densityScale),
        densityScale: densityScale.toFixed(2),
        fontScalePercent: `${Math.round(state.accessibility.fontScale * 100)}%`,
        focusRingWidth: state.accessibility.keyboardHints ? '2px' : '1px',
        controlMinHeight: scaledRem(2.25, densityScale),
        motionDurationFast: reducedMotion ? '1ms' : '90ms',
        motionDurationNormal: reducedMotion ? '1ms' : '160ms',
        windowBackdropBlur: state.behavior.translucentWindows ? '22px' : '0px',
    }
}

export function isContrastAccessible(foreground: string, background: string) {
    return contrastRatio(foreground, background) >= 4.5
}
