import type { WindowBounds } from '../../types/windowManager'
import type { WorkspaceRect } from './types'

export function getDraggedWindowPosition(
    bounds: WindowBounds,
    pointer: { startX: number; startY: number; currentX: number; currentY: number },
    workspace: WorkspaceRect,
) {
    const maxX = Math.max(workspace.x, workspace.x + workspace.width - bounds.width)
    const maxY = Math.max(workspace.y, workspace.y + workspace.height - bounds.height)
    const nextX = bounds.x + (pointer.currentX - pointer.startX)
    const nextY = bounds.y + (pointer.currentY - pointer.startY)

    return {
        x: Math.max(workspace.x, Math.min(nextX, maxX)),
        y: Math.max(workspace.y, Math.min(nextY, maxY)),
    }
}

export function getResizedWindowBounds(
    bounds: WindowBounds,
    pointer: { startX: number; startY: number; currentX: number; currentY: number },
) {
    return {
        width: Math.max(320, bounds.width + (pointer.currentX - pointer.startX)),
        height: Math.max(200, bounds.height + (pointer.currentY - pointer.startY)),
    }
}
