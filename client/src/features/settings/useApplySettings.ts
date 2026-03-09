import { useEffect } from 'react'
import { useSettingsStore } from '../../stores/settingsStore'
import { createThemeTokens } from './themeEngine'

function applyCssVars(tokens: ReturnType<typeof createThemeTokens>) {
    const root = document.documentElement

    root.style.setProperty('--ds-color-bg-canvas', tokens.colorBgCanvas)
    root.style.setProperty('--ds-color-bg-elevated', tokens.colorBgElevated)
    root.style.setProperty('--ds-color-surface-0', tokens.colorSurface)
    root.style.setProperty('--ds-color-surface-1', tokens.colorSurfaceMuted)
    root.style.setProperty('--ds-color-border', tokens.colorBorder)
    root.style.setProperty('--ds-color-text-primary', tokens.colorTextPrimary)
    root.style.setProperty('--ds-color-text-muted', tokens.colorTextMuted)
    root.style.setProperty('--ds-color-accent', tokens.colorAccent)
    root.style.setProperty('--ds-color-success', tokens.colorSuccess)
    root.style.setProperty('--ds-color-danger', tokens.colorDanger)
    root.style.setProperty('--shell-topbar-height', tokens.shellTopbarHeight)
    root.style.setProperty('--shell-dock-height', tokens.shellDockHeight)
    root.style.setProperty('--shell-edge-gap', tokens.shellEdgeGap)
    root.style.setProperty('--os-density-scale', tokens.densityScale)
    root.style.setProperty('--os-focus-ring-width', tokens.focusRingWidth)
    root.style.setProperty('--os-control-min-height', tokens.controlMinHeight)
    root.style.setProperty('--os-motion-fast', tokens.motionDurationFast)
    root.style.setProperty('--os-motion-normal', tokens.motionDurationNormal)
    root.style.setProperty('--os-window-backdrop-blur', tokens.windowBackdropBlur)
    root.style.fontSize = tokens.fontScalePercent
}

export function useApplySettings() {
    const state = useSettingsStore((current) => ({
        appearance: current.appearance,
        desktop: current.desktop,
        accessibility: current.accessibility,
        behavior: current.behavior,
        shortcuts: current.shortcuts,
    }))

    useEffect(() => {
        const tokens = createThemeTokens(state)
        applyCssVars(tokens)
        document.documentElement.dataset.osTheme = state.appearance.themeMode
    }, [state])
}
