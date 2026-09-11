import type { SnapMode, WindowBounds, WindowData } from '../../types/windowManager'
import type { WorkspaceRect } from './types'

export type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se'

export interface WindowBoundsUpdate {
    bounds: WindowBounds
    snapMode?: SnapMode
}

export const MIN_WINDOW_WIDTH = 320
export const MIN_WINDOW_HEIGHT = 220

function clamp(value: number, min: number, max: number): number {
    if (max < min) return min
    return Math.max(min, Math.min(max, value))
}

/**
 * Calculates standard OS 8-directional window resizing for a single window.
 * Properly pins the opposite edge/corner when resizing from North or West.
 */
export function calculateWindowResize(
    initialBounds: WindowBounds,
    deltaX: number,
    deltaY: number,
    direction: ResizeDirection,
    workspace: WorkspaceRect,
    minWidth = MIN_WINDOW_WIDTH,
    minHeight = MIN_WINDOW_HEIGHT,
): WindowBounds {
    let { x, y, width, height } = initialBounds

    // 1. Horizontal calculations
    if (direction.includes('e')) {
        // East: expand or contract to the right. Left edge (x) stays pinned.
        const maxAllowedWidth = Math.max(minWidth, (workspace.x + workspace.width) - x)
        width = clamp(initialBounds.width + deltaX, minWidth, maxAllowedWidth)
    } else if (direction.includes('w')) {
        // West: expand or contract to the left. Right edge (x + width) stays pinned.
        const rightEdge = initialBounds.x + initialBounds.width
        const maxAllowedWidth = Math.max(minWidth, rightEdge - workspace.x)
        width = clamp(initialBounds.width - deltaX, minWidth, maxAllowedWidth)
        x = rightEdge - width
    }

    // 2. Vertical calculations
    if (direction.includes('s')) {
        // South: expand or contract downwards. Top edge (y) stays pinned.
        const maxAllowedHeight = Math.max(minHeight, (workspace.y + workspace.height) - y)
        height = clamp(initialBounds.height + deltaY, minHeight, maxAllowedHeight)
    } else if (direction.includes('n')) {
        // North: expand or contract upwards. Bottom edge (y + height) stays pinned.
        const bottomEdge = initialBounds.y + initialBounds.height
        const maxAllowedHeight = Math.max(minHeight, bottomEdge - workspace.y)
        height = clamp(initialBounds.height - deltaY, minHeight, maxAllowedHeight)
        y = bottomEdge - height
    }

    return { x, y, width, height }
}

/**
 * Detects if a window is part of an active tiling split and calculates
 * synchronized co-resizing across all adjacent tiled partners.
 */
export function calculateTiledResize(
    windowId: string,
    direction: ResizeDirection,
    deltaX: number,
    deltaY: number,
    windows: Record<string, WindowData>,
    workspace: WorkspaceRect,
    minWidth = MIN_WINDOW_WIDTH,
    minHeight = MIN_WINDOW_HEIGHT,
): Record<string, WindowBoundsUpdate> {
    const targetWin = windows[windowId]
    if (!targetWin) {
        return {}
    }

    const snapMode = targetWin.state.snapMode
    const visibleWindows = Object.values(windows).filter(
        (w) => !w.state.isMinimized && !w.state.isMaximized,
    )

    // --- CASE 1: Left-Half & Right-Half (or quadrant columns) Split Resize ---
    const isLeftColumn = snapMode === 'left-half' || snapMode === 'top-left' || snapMode === 'bottom-left'
    const isRightColumn = snapMode === 'right-half' || snapMode === 'top-right' || snapMode === 'bottom-right'

    const isResizingVerticalDivider =
        (isLeftColumn && direction.includes('e')) ||
        (isRightColumn && direction.includes('w'))

    if (isResizingVerticalDivider) {
        // Find left-side windows and right-side windows
        const leftWindows = visibleWindows.filter((w) =>
            w.state.snapMode === 'left-half' ||
            w.state.snapMode === 'top-left' ||
            w.state.snapMode === 'bottom-left',
        )
        const rightWindows = visibleWindows.filter((w) =>
            w.state.snapMode === 'right-half' ||
            w.state.snapMode === 'top-right' ||
            w.state.snapMode === 'bottom-right',
        )

        if (leftWindows.length > 0 && rightWindows.length > 0) {
            // Find current vertical seam position
            const currentSplitX = leftWindows[0].bounds.width
            const effectiveDelta = isLeftColumn ? deltaX : -deltaX
            const maxLeftWidth = workspace.width - minWidth
            const newLeftWidth = clamp(currentSplitX + effectiveDelta, minWidth, maxLeftWidth)
            const newRightWidth = workspace.width - newLeftWidth
            const newRightX = workspace.x + newLeftWidth

            const updates: Record<string, WindowBoundsUpdate> = {}

            leftWindows.forEach((win) => {
                updates[win.id] = {
                    bounds: {
                        ...win.bounds,
                        x: workspace.x,
                        width: newLeftWidth,
                    },
                    snapMode: win.state.snapMode,
                }
            })

            rightWindows.forEach((win) => {
                updates[win.id] = {
                    bounds: {
                        ...win.bounds,
                        x: newRightX,
                        width: newRightWidth,
                    },
                    snapMode: win.state.snapMode,
                }
            })

            return updates
        }
    }

    // --- CASE 2: Top & Bottom Quadrant Split Resize ---
    const isTopRow = snapMode === 'top-left' || snapMode === 'top-right'
    const isBottomRow = snapMode === 'bottom-left' || snapMode === 'bottom-right'

    const isResizingHorizontalDivider =
        (isTopRow && direction.includes('s')) ||
        (isBottomRow && direction.includes('n'))

    if (isResizingHorizontalDivider) {
        const topWindows = visibleWindows.filter((w) =>
            w.state.snapMode === 'top-left' || w.state.snapMode === 'top-right',
        )
        const bottomWindows = visibleWindows.filter((w) =>
            w.state.snapMode === 'bottom-left' || w.state.snapMode === 'bottom-right',
        )

        if (topWindows.length > 0 && bottomWindows.length > 0) {
            const currentSplitY = topWindows[0].bounds.height
            const effectiveDelta = isTopRow ? deltaY : -deltaY
            const maxTopHeight = workspace.height - minHeight
            const newTopHeight = clamp(currentSplitY + effectiveDelta, minHeight, maxTopHeight)
            const newBottomHeight = workspace.height - newTopHeight
            const newBottomY = workspace.y + newTopHeight

            const updates: Record<string, WindowBoundsUpdate> = {}

            topWindows.forEach((win) => {
                updates[win.id] = {
                    bounds: {
                        ...win.bounds,
                        y: workspace.y,
                        height: newTopHeight,
                    },
                    snapMode: win.state.snapMode,
                }
            })

            bottomWindows.forEach((win) => {
                updates[win.id] = {
                    bounds: {
                        ...win.bounds,
                        y: newBottomY,
                        height: newBottomHeight,
                    },
                    snapMode: win.state.snapMode,
                }
            })

            return updates
        }
    }

    // --- CASE 3: Standard Floating Window Resize ---
    const newBounds = calculateWindowResize(
        targetWin.bounds,
        deltaX,
        deltaY,
        direction,
        workspace,
        minWidth,
        minHeight,
    )

    return {
        [windowId]: {
            bounds: newBounds,
            snapMode: undefined, // Transitions to custom floating bounds if resized off snap
        },
    }
}
