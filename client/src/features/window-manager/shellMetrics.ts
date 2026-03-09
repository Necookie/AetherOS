import { useSettingsStore } from '../../stores/settingsStore'
import type { SnapContext } from './types'

const DEFAULT_TOPBAR_HEIGHT = 32
const DEFAULT_DOCK_HEIGHT = 56
const DEFAULT_EDGE_GAP = 12
const DEFAULT_SAFE_MARGIN = 8
export const MIN_WINDOW_WIDTH = 320
export const MIN_WINDOW_HEIGHT = 220

function parseCssPixelValue(value: string, fallback: number) {
    const parsed = Number.parseFloat(value)
    if (!Number.isFinite(parsed)) {
        return fallback
    }

    return parsed
}

function readShellCssMetrics() {
    const root = document.documentElement
    const styles = window.getComputedStyle(root)

    return {
        shellTopbarHeight: parseCssPixelValue(styles.getPropertyValue('--shell-topbar-height'), DEFAULT_TOPBAR_HEIGHT),
        shellDockHeight: parseCssPixelValue(styles.getPropertyValue('--shell-dock-height'), DEFAULT_DOCK_HEIGHT),
        shellEdgeGap: parseCssPixelValue(styles.getPropertyValue('--shell-edge-gap'), DEFAULT_EDGE_GAP),
    }
}

export function getSnapContext(viewport = { width: window.innerWidth, height: window.innerHeight }): SnapContext {
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
