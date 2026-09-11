import { describe, expect, it } from 'vitest'
import {
    calculateTiledResize,
    calculateWindowResize,
    MIN_WINDOW_HEIGHT,
    MIN_WINDOW_WIDTH,
} from './tiling'
import type { WindowBounds, WindowData } from '../../types/windowManager'
import type { WorkspaceRect } from './types'

const workspace: WorkspaceRect = {
    x: 0,
    y: 32,
    width: 1200,
    height: 700,
}

const createWindow = (id: string, bounds: WindowBounds, snapMode?: any): WindowData => ({
    id,
    title: id,
    component: () => null,
    bounds,
    state: {
        isFocused: true,
        isMinimized: false,
        isMaximized: false,
        snapMode,
    },
})

describe('calculateWindowResize (8-directional OS resizing)', () => {
    const initialBounds: WindowBounds = { x: 200, y: 150, width: 500, height: 400 }

    it('resizes East (e) by expanding width while keeping x pinned', () => {
        const result = calculateWindowResize(initialBounds, 50, 0, 'e', workspace)
        expect(result.x).toBe(200)
        expect(result.width).toBe(550)
        expect(result.y).toBe(150)
        expect(result.height).toBe(400)
    })

    it('resizes West (w) by moving x and adjusting width while keeping right edge pinned', () => {
        const rightEdge = initialBounds.x + initialBounds.width // 700
        const result = calculateWindowResize(initialBounds, -50, 0, 'w', workspace)
        expect(result.width).toBe(550)
        expect(result.x).toBe(rightEdge - 550) // 150
        expect(result.x + result.width).toBe(rightEdge)
    })

    it('enforces MIN_WINDOW_WIDTH when resizing West (w)', () => {
        const rightEdge = initialBounds.x + initialBounds.width // 700
        const result = calculateWindowResize(initialBounds, 400, 0, 'w', workspace)
        expect(result.width).toBe(MIN_WINDOW_WIDTH)
        expect(result.x).toBe(rightEdge - MIN_WINDOW_WIDTH)
    })

    it('resizes South (s) by expanding height while keeping y pinned', () => {
        const result = calculateWindowResize(initialBounds, 0, 60, 's', workspace)
        expect(result.y).toBe(150)
        expect(result.height).toBe(460)
    })

    it('resizes North (n) by moving y and adjusting height while keeping bottom edge pinned', () => {
        const bottomEdge = initialBounds.y + initialBounds.height // 550
        const result = calculateWindowResize(initialBounds, 0, -50, 'n', workspace)
        expect(result.height).toBe(450)
        expect(result.y).toBe(bottomEdge - 450) // 100
        expect(result.y + result.height).toBe(bottomEdge)
    })

    it('enforces MIN_WINDOW_HEIGHT when resizing North (n)', () => {
        const bottomEdge = initialBounds.y + initialBounds.height // 550
        const result = calculateWindowResize(initialBounds, 0, 300, 'n', workspace)
        expect(result.height).toBe(MIN_WINDOW_HEIGHT)
        expect(result.y).toBe(bottomEdge - MIN_WINDOW_HEIGHT)
    })

    it('resizes North-West (nw) corner simultaneously', () => {
        const rightEdge = initialBounds.x + initialBounds.width
        const bottomEdge = initialBounds.y + initialBounds.height
        const result = calculateWindowResize(initialBounds, -40, -30, 'nw', workspace)
        expect(result.width).toBe(540)
        expect(result.height).toBe(430)
        expect(result.x).toBe(rightEdge - 540)
        expect(result.y).toBe(bottomEdge - 430)
    })

    it('resizes South-East (se) corner simultaneously', () => {
        const result = calculateWindowResize(initialBounds, 40, 50, 'se', workspace)
        expect(result.x).toBe(200)
        expect(result.y).toBe(150)
        expect(result.width).toBe(540)
        expect(result.height).toBe(450)
    })
})

describe('calculateTiledResize (Tiling manager co-resizing)', () => {
    it('co-resizes left-half and right-half windows synchronously when dragging vertical seam', () => {
        const halfWidth = 600
        const winA = createWindow('winA', { x: 0, y: 32, width: halfWidth, height: 700 }, 'left-half')
        const winB = createWindow('winB', { x: halfWidth, y: 32, width: halfWidth, height: 700 }, 'right-half')

        const windows = { winA, winB }

        // User drags right edge of winA by +50px
        const updates = calculateTiledResize('winA', 'e', 50, 0, windows, workspace)

        expect(updates.winA).toBeDefined()
        expect(updates.winB).toBeDefined()

        // winA gets 650px width
        expect(updates.winA.bounds.width).toBe(650)
        expect(updates.winA.bounds.x).toBe(0)
        expect(updates.winA.snapMode).toBe('left-half')

        // winB starts at 650px and gets 550px width
        expect(updates.winB.bounds.x).toBe(650)
        expect(updates.winB.bounds.width).toBe(550)
        expect(updates.winB.snapMode).toBe('right-half')

        // Total width remains equal to workspace width
        expect(updates.winA.bounds.width + updates.winB.bounds.width).toBe(workspace.width)
    })

    it('co-resizes when dragging West edge of right-half window to the right', () => {
        const halfWidth = 600
        const winA = createWindow('winA', { x: 0, y: 32, width: halfWidth, height: 700 }, 'left-half')
        const winB = createWindow('winB', { x: halfWidth, y: 32, width: halfWidth, height: 700 }, 'right-half')

        const windows = { winA, winB }

        // User drags left edge of winB by +50px (moves seam to the right)
        const updates = calculateTiledResize('winB', 'w', 50, 0, windows, workspace)

        expect(updates.winA.bounds.width).toBe(650)
        expect(updates.winB.bounds.x).toBe(650)
        expect(updates.winB.bounds.width).toBe(550)
    })

    it('enforces minWidth constraint on both sides during tiled co-resize', () => {
        const halfWidth = 600
        const winA = createWindow('winA', { x: 0, y: 32, width: halfWidth, height: 700 }, 'left-half')
        const winB = createWindow('winB', { x: halfWidth, y: 32, width: halfWidth, height: 700 }, 'right-half')

        const windows = { winA, winB }

        // User attempts to expand winA so far that winB would become smaller than MIN_WINDOW_WIDTH
        const updates = calculateTiledResize('winA', 'e', 800, 0, windows, workspace)

        expect(updates.winB.bounds.width).toBe(MIN_WINDOW_WIDTH)
        expect(updates.winA.bounds.width).toBe(workspace.width - MIN_WINDOW_WIDTH)
    })

    it('co-resizes top and bottom quadrant tiles synchronously when dragging horizontal seam', () => {
        const halfWidth = 600
        const halfHeight = 350
        const winTop = createWindow('winTop', { x: 0, y: 32, width: halfWidth, height: halfHeight }, 'top-left')
        const winBottom = createWindow('winBottom', { x: 0, y: 382, width: halfWidth, height: halfHeight }, 'bottom-left')

        const windows = { winTop, winBottom }

        // User drags bottom edge of winTop down by 40px
        const updates = calculateTiledResize('winTop', 's', 0, 40, windows, workspace)

        expect(updates.winTop.bounds.height).toBe(390)
        expect(updates.winBottom.bounds.y).toBe(32 + 390)
        expect(updates.winBottom.bounds.height).toBe(700 - 390)
        expect(updates.winTop.bounds.height + updates.winBottom.bounds.height).toBe(workspace.height)
    })

    it('co-resizes top and bottom quadrant tiles when dragging North edge of bottom window', () => {
        const halfWidth = 600
        const halfHeight = 350
        const winTop = createWindow('winTop', { x: 0, y: 32, width: halfWidth, height: halfHeight }, 'top-left')
        const winBottom = createWindow('winBottom', { x: 0, y: 382, width: halfWidth, height: halfHeight }, 'bottom-left')

        const windows = { winTop, winBottom }

        // User drags top edge of winBottom down by 40px (+deltaY)
        const updates = calculateTiledResize('winBottom', 'n', 0, 40, windows, workspace)

        expect(updates.winTop.bounds.height).toBe(390)
        expect(updates.winBottom.bounds.y).toBe(32 + 390)
        expect(updates.winBottom.bounds.height).toBe(700 - 390)
    })

    it('co-resizes both the column AND row seams when dragging a quadrant corner handle', () => {
        // A full 4-way split, all four quadrants present.
        const halfWidth = 600
        const halfHeight = 350
        const topLeft = createWindow('topLeft', { x: 0, y: 32, width: halfWidth, height: halfHeight }, 'top-left')
        const topRight = createWindow('topRight', { x: halfWidth, y: 32, width: halfWidth, height: halfHeight }, 'top-right')
        const bottomLeft = createWindow('bottomLeft', { x: 0, y: 382, width: halfWidth, height: halfHeight }, 'bottom-left')
        const bottomRight = createWindow('bottomRight', { x: halfWidth, y: 382, width: halfWidth, height: halfHeight }, 'bottom-right')

        const windows = { topLeft, topRight, bottomLeft, bottomRight }

        // User drags the SE corner handle of topLeft by (+50, +40) — both the vertical
        // seam (column widths) and horizontal seam (row heights) should move together.
        const updates = calculateTiledResize('topLeft', 'se', 50, 40, windows, workspace)

        // Vertical seam (width) moved for every window
        expect(updates.topLeft.bounds.width).toBe(650)
        expect(updates.topRight.bounds.x).toBe(650)
        expect(updates.topRight.bounds.width).toBe(550)
        expect(updates.bottomLeft.bounds.width).toBe(650)
        expect(updates.bottomRight.bounds.x).toBe(650)
        expect(updates.bottomRight.bounds.width).toBe(550)

        // Horizontal seam (height) also moved for every window in the same gesture
        expect(updates.topLeft.bounds.height).toBe(390)
        expect(updates.topRight.bounds.height).toBe(390)
        expect(updates.bottomLeft.bounds.y).toBe(32 + 390)
        expect(updates.bottomLeft.bounds.height).toBe(700 - 390)
        expect(updates.bottomRight.bounds.y).toBe(32 + 390)
        expect(updates.bottomRight.bounds.height).toBe(700 - 390)
    })
})
