import type { WindowBounds } from '../../types/windowManager'
import type { Viewport } from './types'

export const DEFAULT_WINDOW_BOUNDS: WindowBounds = { x: 150, y: 150, width: 600, height: 400 }

export function clampBoundsToViewport(bounds: WindowBounds, viewport: Viewport): WindowBounds {
    const width = Math.min(bounds.width, viewport.width)
    const height = Math.min(bounds.height, viewport.height)
    const maxX = Math.max(0, viewport.width - width)
    const maxY = Math.max(0, viewport.height - height)

    return {
        ...bounds,
        width,
        height,
        x: Math.max(0, Math.min(bounds.x, maxX)),
        y: Math.max(0, Math.min(bounds.y, maxY)),
    }
}

export function getCenteredBounds(bounds: WindowBounds, viewport: Viewport): WindowBounds {
    return clampBoundsToViewport(
        {
            ...bounds,
            x: Math.max(0, Math.floor((viewport.width - bounds.width) / 2)),
            y: Math.max(0, Math.floor((viewport.height - bounds.height) / 2)),
        },
        viewport,
    )
}

export function mergeWindowBounds(bounds: WindowBounds, update: Partial<WindowBounds>) {
    return {
        ...bounds,
        ...update,
    }
}
