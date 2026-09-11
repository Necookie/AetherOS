import { useSettingsStore } from '../../stores/settingsStore'
import type { SnapContext } from './types'

const DEFAULT_TOPBAR_HEIGHT = 44
const DEFAULT_DOCK_HEIGHT = 56
const DEFAULT_EDGE_GAP = 12
const DEFAULT_SAFE_MARGIN = 8
export const MIN_WINDOW_WIDTH = 320
export const MIN_WINDOW_HEIGHT = 220

function parseCssPixelValue(value: string, fallback: number, rootFontSize = 16): number {
    const trimmed = value.trim()
    if (!trimmed) {
        return fallback
    }

    if (trimmed.endsWith('rem')) {
        const rem = Number.parseFloat(trimmed)
        if (Number.isFinite(rem)) {
            return Math.round(rem * rootFontSize)
        }
    } else if (trimmed.endsWith('px')) {
        const px = Number.parseFloat(trimmed)
        if (Number.isFinite(px)) {
            return Math.round(px)
        }
    } else {
        const num = Number.parseFloat(trimmed)
        if (Number.isFinite(num)) {
            return num <= 5 ? Math.round(num * rootFontSize) : Math.round(num)
        }
    }

    return fallback
}

function readShellCssMetrics() {
    if (typeof document === 'undefined' || typeof window === 'undefined' || !window.getComputedStyle) {
        return {
            shellTopbarHeight: DEFAULT_TOPBAR_HEIGHT,
            shellDockHeight: DEFAULT_DOCK_HEIGHT,
            shellEdgeGap: DEFAULT_EDGE_GAP,
        }
    }

    const root = document.documentElement
    const styles = window.getComputedStyle(root)
    const rootFontSize = Number.parseFloat(styles.fontSize) || 16

    // Attempt to measure rendered DOM elements if available
    const renderedHeader = document.querySelector<HTMLElement>('header')
    const headerHeight = renderedHeader?.offsetHeight && renderedHeader.offsetHeight > 20
        ? renderedHeader.offsetHeight
        : parseCssPixelValue(styles.getPropertyValue('--shell-topbar-height'), DEFAULT_TOPBAR_HEIGHT, rootFontSize)

    const renderedDock = document.querySelector<HTMLElement>('nav[aria-label="AetherOS dock"]')
    const dockHeight = renderedDock?.offsetHeight && renderedDock.offsetHeight > 20
        ? renderedDock.offsetHeight
        : parseCssPixelValue(styles.getPropertyValue('--shell-dock-height'), DEFAULT_DOCK_HEIGHT, rootFontSize)

    const edgeGap = parseCssPixelValue(styles.getPropertyValue('--shell-edge-gap'), DEFAULT_EDGE_GAP, rootFontSize)

    return {
        shellTopbarHeight: headerHeight,
        shellDockHeight: dockHeight,
        shellEdgeGap: edgeGap,
    }
}

export function getSnapContext(viewport = { width: typeof window !== 'undefined' ? window.innerWidth : 1280, height: typeof window !== 'undefined' ? window.innerHeight : 800 }): SnapContext {
    const desktopSettings = useSettingsStore.getState().desktop
    const shellMetrics = readShellCssMetrics()

    return {
        viewport,
        taskbarPosition: desktopSettings.taskbarPosition,
        minWindowWidth: MIN_WINDOW_WIDTH,
        minWindowHeight: MIN_WINDOW_HEIGHT,
        safeMargin: DEFAULT_SAFE_MARGIN,
        ...shellMetrics,
    }
}
