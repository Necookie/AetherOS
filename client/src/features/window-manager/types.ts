import type { TaskbarPosition } from '../settings/types'
import type { SnapMode, WindowBounds, WindowData } from '../../types/windowManager'

export interface WindowSnapshot {
    windows: Record<string, WindowData>
    windowOrder: string[]
    focusedWindowId: string | null
}

export interface Viewport {
    width: number
    height: number
}

export interface WorkspaceInsets {
    top: number
    right: number
    bottom: number
    left: number
}

export interface WorkspaceRect extends WindowBounds {}

export interface SnapRegionMetadata {
    mode: SnapMode
    bounds: WindowBounds
}

export interface SnapPreview {
    windowId: string
    region: SnapRegionMetadata
}

export interface SnapContext {
    viewport: Viewport
    taskbarPosition: TaskbarPosition
    minWindowWidth: number
    minWindowHeight: number
    safeMargin: number
    shellTopbarHeight: number
    shellDockHeight: number
    shellEdgeGap: number
}

export interface PointerPosition {
    x: number
    y: number
}
