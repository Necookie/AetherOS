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

        expect(tokens.colorBgCanvas).toBe('#0b1220')
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

    it('returns gradient css for non-image wallpapers', () => {
        const value = getWallpaperCss('aurora')
        expect(value).toContain('linear-gradient')
        expect(value).not.toContain('url(')
    })
})
