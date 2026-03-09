import type { SnapMode } from '../../types/windowManager'
import type { PointerPosition, SnapContext, SnapRegionMetadata, WorkspaceRect } from './types'

const SNAP_ACTIVATION_DISTANCE = 56

function clampDimension(dimension: number, minDimension: number, maxDimension: number) {
    if (maxDimension <= minDimension) {
        return maxDimension
    }

    return Math.max(minDimension, Math.min(dimension, maxDimension))
}

function buildRegion(
    mode: SnapMode,
    workspace: WorkspaceRect,
    segment: { x: number; y: number; width: number; height: number },
    minWindowWidth: number,
    minWindowHeight: number,
): SnapRegionMetadata {
    const width = clampDimension(segment.width, minWindowWidth, workspace.width)
    const height = clampDimension(segment.height, minWindowHeight, workspace.height)
    const maxX = workspace.x + workspace.width - width
    const maxY = workspace.y + workspace.height - height

    return {
        mode,
        bounds: {
            x: Math.max(workspace.x, Math.min(segment.x, maxX)),
            y: Math.max(workspace.y, Math.min(segment.y, maxY)),
            width,
            height,
        },
    }
}

export function getSnapRegion(
    mode: SnapMode,
    workspace: WorkspaceRect,
    context: Pick<SnapContext, 'minWindowWidth' | 'minWindowHeight'>,
): SnapRegionMetadata {
    const halfWidth = Math.floor(workspace.width / 2)
    const halfHeight = Math.floor(workspace.height / 2)
    const rightX = workspace.x + halfWidth
    const bottomY = workspace.y + halfHeight

    switch (mode) {
    case 'left-half':
        return buildRegion(mode, workspace, {
            x: workspace.x,
            y: workspace.y,
            width: halfWidth,
            height: workspace.height,
        }, context.minWindowWidth, context.minWindowHeight)
    case 'right-half':
        return buildRegion(mode, workspace, {
            x: rightX,
            y: workspace.y,
            width: workspace.width - halfWidth,
            height: workspace.height,
        }, context.minWindowWidth, context.minWindowHeight)
    case 'top-left':
        return buildRegion(mode, workspace, {
            x: workspace.x,
            y: workspace.y,
            width: halfWidth,
            height: halfHeight,
        }, context.minWindowWidth, context.minWindowHeight)
    case 'top-right':
        return buildRegion(mode, workspace, {
            x: rightX,
            y: workspace.y,
            width: workspace.width - halfWidth,
            height: halfHeight,
        }, context.minWindowWidth, context.minWindowHeight)
    case 'bottom-left':
        return buildRegion(mode, workspace, {
            x: workspace.x,
            y: bottomY,
            width: halfWidth,
            height: workspace.height - halfHeight,
        }, context.minWindowWidth, context.minWindowHeight)
    case 'bottom-right':
        return buildRegion(mode, workspace, {
            x: rightX,
            y: bottomY,
            width: workspace.width - halfWidth,
            height: workspace.height - halfHeight,
        }, context.minWindowWidth, context.minWindowHeight)
    }
}

export function resolveSnapModeFromPointer(
    pointer: PointerPosition,
    workspace: WorkspaceRect,
    activationDistance = SNAP_ACTIVATION_DISTANCE,
): SnapMode | null {
    const nearLeft = pointer.x <= workspace.x + activationDistance
    const nearRight = pointer.x >= workspace.x + workspace.width - activationDistance
    const nearTop = pointer.y <= workspace.y + activationDistance
    const nearBottom = pointer.y >= workspace.y + workspace.height - activationDistance

    if (nearLeft && nearTop) {
        return 'top-left'
    }
    if (nearRight && nearTop) {
        return 'top-right'
    }
    if (nearLeft && nearBottom) {
        return 'bottom-left'
    }
    if (nearRight && nearBottom) {
        return 'bottom-right'
    }
    if (nearLeft) {
        return 'left-half'
    }
    if (nearRight) {
        return 'right-half'
    }

    return null
}

export const SNAP_REGION_POINTER_DISTANCE = SNAP_ACTIVATION_DISTANCE
