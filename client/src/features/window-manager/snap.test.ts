import { describe, expect, it } from 'vitest'
import { getSnapRegion, resolveSnapModeFromPointer, SNAP_REGION_POINTER_DISTANCE } from './snap'
import { getWorkspaceRect } from './workspace'
import type { SnapContext } from './types'

const baseContext: SnapContext = {
    viewport: { width: 1200, height: 800 },
    taskbarPosition: 'bottom',
    minWindowWidth: 320,
    minWindowHeight: 220,
    safeMargin: 8,
    shellTopbarHeight: 32,
    shellDockHeight: 56,
    shellEdgeGap: 12,
}

describe('snap region resolution', () => {
    it('detects edge and corner snap zones from pointer position', () => {
        const workspace = getWorkspaceRect(baseContext)

        expect(resolveSnapModeFromPointer({ x: workspace.x + 8, y: workspace.y + 8 }, workspace)).toBe('top-left')
        expect(resolveSnapModeFromPointer({ x: workspace.x + workspace.width - 8, y: workspace.y + 8 }, workspace)).toBe('top-right')
        expect(resolveSnapModeFromPointer({ x: workspace.x + 8, y: workspace.y + workspace.height - 8 }, workspace)).toBe('bottom-left')
        expect(resolveSnapModeFromPointer({ x: workspace.x + workspace.width - 8, y: workspace.y + workspace.height - 8 }, workspace)).toBe('bottom-right')
        expect(resolveSnapModeFromPointer({ x: workspace.x + 8, y: workspace.y + 180 }, workspace)).toBe('left-half')
        expect(resolveSnapModeFromPointer({ x: workspace.x + workspace.width - 8, y: workspace.y + 180 }, workspace)).toBe('right-half')
        expect(resolveSnapModeFromPointer({ x: workspace.x + SNAP_REGION_POINTER_DISTANCE + 40, y: workspace.y + 180 }, workspace)).toBeNull()
    })

    it('builds deterministic bounds that respect shell insets', () => {
        const workspace = getWorkspaceRect(baseContext)
        const region = getSnapRegion('top-left', workspace, baseContext)

        expect(workspace).toEqual({ x: 12, y: 40, width: 1176, height: 672 })
        expect(region.bounds).toEqual({ x: 12, y: 40, width: 588, height: 336 })
    })

    it('enforces min sizes but never exceeds tiny workspace dimensions', () => {
        const tinyContext: SnapContext = {
            ...baseContext,
            viewport: { width: 420, height: 280 },
        }
        const workspace = getWorkspaceRect(tinyContext)
        const rightHalf = getSnapRegion('right-half', workspace, tinyContext)

        expect(workspace).toEqual({ x: 12, y: 40, width: 396, height: 152 })
        expect(rightHalf.bounds).toEqual({ x: 88, y: 40, width: 320, height: 152 })
    })

    it('adjusts workspace origin when taskbar is on top', () => {
        const topTaskbarContext: SnapContext = {
            ...baseContext,
            taskbarPosition: 'top',
        }
        const workspace = getWorkspaceRect(topTaskbarContext)
        const leftHalf = getSnapRegion('left-half', workspace, topTaskbarContext)

        expect(workspace).toEqual({ x: 12, y: 120, width: 1176, height: 660 })
        expect(leftHalf.bounds).toEqual({ x: 12, y: 120, width: 588, height: 660 })
    })
})
