import { describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS } from './defaults'
import { runAccessibilityChecks } from './accessibilityChecks'
import { createThemeTokens, getWallpaperCss } from './themeEngine'

describe('createThemeTokens', () => {
    it('switches to dark token colors and scales typography', () => {
        const tokens = createThemeTokens({
            ...DEFAULT_SETTINGS,
            appearance: {
                ...DEFAULT_SETTINGS.appearance,
                themeMode: 'dark',
            },
            accessibility: {
                ...DEFAULT_SETTINGS.accessibility,
                fontScale: 1.2,
            },
        })

        expect(tokens.colorBgCanvas).toBe('#000000')
        expect(tokens.fontScalePercent).toBe('120%')
    })

    it('reduces motion timings when motion is disabled', () => {
        const tokens = createThemeTokens({
            ...DEFAULT_SETTINGS,
            accessibility: {
                ...DEFAULT_SETTINGS.accessibility,
                reducedMotion: true,
            },
        })

        expect(tokens.motionDurationFast).toBe('1ms')
        expect(tokens.motionDurationNormal).toBe('1ms')
    })

    it('passes baseline accessibility checks for defaults', () => {
        const report = runAccessibilityChecks(createThemeTokens(DEFAULT_SETTINGS))

        expect(report.contrastPass).toBe(true)
        expect(report.keyboardFocusPass).toBe(true)
        expect(report.keyboardTargetPass).toBe(true)
    })
})

describe('getWallpaperCss', () => {
    it('returns an image layer stack for image wallpapers', () => {
        expect(getWallpaperCss('urban-night')).toContain("url('/assets/wallpapers/urban-night-street.jpg')")
    })

    it('returns a flat single-tone fill for solid wallpapers', () => {
        const value = getWallpaperCss('parchment')
        expect(value).toBe('linear-gradient(#f5f5f7, #f5f5f7)')
        expect(value).not.toContain('url(')
    })

    it('resolves custom cached wallpapers properly', async () => {
        const { registerCustomWallpaperInMemory } = await import('./wallpaperStorage')
        registerCustomWallpaperInMemory({
            id: 'custom-mywall',
            label: 'My Upload',
            kind: 'image',
            value: 'data:image/png;base64,sample123',
        })

        expect(getWallpaperCss('custom-mywall')).toContain("url('data:image/png;base64,sample123')")
    })
})
