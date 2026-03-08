import type { WindowBounds } from '../../types/windowManager'

export function getDraggedWindowPosition(
    bounds: WindowBounds,
    pointer: { startX: number; startY: number; currentX: number; currentY: number },
) {
    const maxX = Math.max(0, window.innerWidth - bounds.width)
    const maxY = Math.max(0, window.innerHeight - bounds.height)
    const nextX = bounds.x + (pointer.currentX - pointer.startX)
    const nextY = bounds.y + (pointer.currentY - pointer.startY)

    return {
        x: Math.max(0, Math.min(nextX, maxX)),
        y: Math.max(0, Math.min(nextY, maxY)),
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
