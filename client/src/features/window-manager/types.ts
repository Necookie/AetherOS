import type { WindowData } from '../../types/windowManager'

export interface WindowSnapshot {
    windows: Record<string, WindowData>
    windowOrder: string[]
    focusedWindowId: string | null
}

export interface Viewport {
    width: number
    height: number
}
