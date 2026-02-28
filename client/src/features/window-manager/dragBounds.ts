import type { WindowBounds } from '../../types/windowManager'

export function getDraggedWindowPosition(
    bounds: WindowBounds,
    pointer: { startX: number; startY: number; currentX: number; currentY: number },
) {
    let x = bounds.x + (pointer.currentX - pointer.startX)
    let y = bounds.y + (pointer.currentY - pointer.startY)

    if (y < 0) {
        y = 0
    }

    if (x < 8 && x > -8) {
        x = 0
    }

    if (y < 8 && y > -8) {
        y = 0
    }

    return { x, y }
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
