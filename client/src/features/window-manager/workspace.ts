import type { SnapContext, WorkspaceInsets, WorkspaceRect } from './types'

export function getWorkspaceInsets(context: SnapContext): WorkspaceInsets {
    const baseTop = context.taskbarPosition === 'top'
        ? context.shellTopbarHeight + context.shellDockHeight + context.shellEdgeGap * 2
        : context.shellTopbarHeight
    const baseBottom = context.taskbarPosition === 'bottom'
        ? context.shellDockHeight + context.shellEdgeGap * 2
        : context.shellEdgeGap
    const horizontalInset = Math.max(context.safeMargin, context.shellEdgeGap)

    return {
        top: Math.max(0, Math.floor(baseTop + context.safeMargin)),
        right: Math.max(0, Math.floor(horizontalInset)),
        bottom: Math.max(0, Math.floor(baseBottom + context.safeMargin)),
        left: Math.max(0, Math.floor(horizontalInset)),
    }
}

export function getWorkspaceRect(context: SnapContext): WorkspaceRect {
    const insets = getWorkspaceInsets(context)
    const width = Math.max(0, context.viewport.width - insets.left - insets.right)
    const height = Math.max(0, context.viewport.height - insets.top - insets.bottom)

    return {
        x: insets.left,
        y: insets.top,
        width,
        height,
    }
}
