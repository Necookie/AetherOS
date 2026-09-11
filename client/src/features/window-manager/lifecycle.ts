import type { AppDefinition, SnapMode, WindowBounds, WindowData } from '../../types/windowManager'
import { bringWindowToFront, clearFocusedWindow, focusWindow } from './focus'
import { DEFAULT_WINDOW_BOUNDS, clampBoundsToViewport, getCenteredBounds, getCenteredBoundsInWorkspace, mergeWindowBounds } from './geometry'
import { getVisibleWindowIds } from './navigation'
import { getSnapRegion } from './snap'
import type { SnapContext, Viewport, WindowSnapshot, WorkspaceRect } from './types'
import { getMaximizedBounds, getWorkspaceRect } from './workspace'

export function createWindowSnapshot(): WindowSnapshot {
    return {
        windows: {},
        windowOrder: [],
        focusedWindowId: null,
    }
}

export function openWindowState(
    state: WindowSnapshot,
    app: AppDefinition,
    viewport: Viewport,
    workspace?: WorkspaceRect,
): WindowSnapshot {
    if (state.windows[app.id]) {
        const focused = focusWindow(state.windows, state.focusedWindowId, app.id)
        return {
            windows: focused.windows,
            windowOrder: bringWindowToFront(state.windowOrder, app.id),
            focusedWindowId: focused.focusedWindowId,
        }
    }

    const defaultBounds = app.defaultBounds || DEFAULT_WINDOW_BOUNDS
    // Center within the usable workspace (below the topbar, above the dock) when
    // available, so tall default windows never spawn clipped under shell chrome.
    const centeredBounds = workspace
        ? getCenteredBoundsInWorkspace(defaultBounds, workspace)
        : getCenteredBounds(defaultBounds, viewport)
    const newWindow: WindowData = {
        id: app.id,
        title: app.title,
        component: app.component,
        bounds: centeredBounds,
        state: {
            isEntering: true,
            isMinimized: false,
            isMaximized: false,
            isFocused: true,
        },
    }

    const clearedWindows = clearFocusedWindow(state.windows, state.focusedWindowId)
    return {
        windows: { ...clearedWindows, [app.id]: newWindow },
        windowOrder: [...state.windowOrder, app.id],
        focusedWindowId: app.id,
    }
}

export function closeWindowState(state: WindowSnapshot, id: string): WindowSnapshot {
    const { [id]: removedWindow, ...remainingWindows } = state.windows
    if (!removedWindow) {
        return state
    }

    const windowOrder = state.windowOrder.filter((windowId) => windowId !== id)
    const visibleWindows = getVisibleWindowIds(remainingWindows, windowOrder)
    const nextFocusedWindowId = state.focusedWindowId === id
        ? (visibleWindows[visibleWindows.length - 1] ?? null)
        : state.focusedWindowId

    const focused = nextFocusedWindowId
        ? focusWindow(remainingWindows, null, nextFocusedWindowId)
        : { windows: clearFocusedWindow(remainingWindows, state.focusedWindowId), focusedWindowId: null }

    return {
        windows: focused.windows,
        windowOrder,
        focusedWindowId: focused.focusedWindowId,
    }
}

export function focusWindowState(state: WindowSnapshot, id: string): WindowSnapshot {
    if (state.focusedWindowId === id || !state.windows[id]) {
        return state
    }

    const focused = focusWindow(state.windows, state.focusedWindowId, id)
    return {
        windows: focused.windows,
        windowOrder: bringWindowToFront(state.windowOrder, id),
        focusedWindowId: focused.focusedWindowId,
    }
}

export function toggleMinimizeState(state: WindowSnapshot, id: string): WindowSnapshot {
    const targetWindow = state.windows[id]
    if (!targetWindow) {
        return state
    }

    if (targetWindow.state.isMinimized) {
        return focusWindowState(state, id)
    }

    let windows = clearFocusedWindow(state.windows, state.focusedWindowId)
    windows = {
        ...windows,
        [id]: {
            ...targetWindow,
            state: {
                ...targetWindow.state,
                isMinimized: true,
                isFocused: false,
            },
        },
    }

    const visibleWindowIds = getVisibleWindowIds(windows, state.windowOrder)
    const nextFocusedWindowId = visibleWindowIds[visibleWindowIds.length - 1] ?? null
    const focused = nextFocusedWindowId ? focusWindow(windows, null, nextFocusedWindowId) : { windows, focusedWindowId: null }

    return {
        windows: focused.windows,
        windowOrder: state.windowOrder,
        focusedWindowId: focused.focusedWindowId,
    }
}

export function toggleMaximizeState(
    state: WindowSnapshot,
    id: string,
    viewport: Viewport,
    context?: SnapContext,
): WindowSnapshot {
    const targetWindow = state.windows[id]
    if (!targetWindow) {
        return state
    }

    const isMaximizing = !targetWindow.state.isMaximized
    const restoredBounds = targetWindow.state.previousBounds || targetWindow.bounds
    const maximizedBounds = context
        ? getMaximizedBounds(context)
        : {
            x: 0,
            y: 44,
            width: viewport.width,
            height: Math.max(220, viewport.height - 44 - 80),
        }
    const nextBounds = isMaximizing
        ? maximizedBounds
        : clampBoundsToViewport(restoredBounds, viewport)

    const focusedState = focusWindowState(state, id)
    const focusedWindow = focusedState.windows[id]
    if (!focusedWindow) {
        return focusedState
    }

    return {
        ...focusedState,
        windows: {
            ...focusedState.windows,
            [id]: {
                ...focusedWindow,
                bounds: nextBounds,
                state: {
                    ...focusedWindow.state,
                    isFocused: true,
                    isMinimized: false,
                    isMaximized: isMaximizing,
                    snapMode: undefined,
                    previousBounds: isMaximizing ? focusedWindow.bounds : focusedWindow.state.previousBounds,
                },
            },
        },
    }
}

export function completeWindowEnterState(state: WindowSnapshot, id: string): WindowSnapshot {
    const targetWindow = state.windows[id]
    if (!targetWindow || !targetWindow.state.isEntering) {
        return state
    }

    return {
        ...state,
        windows: {
            ...state.windows,
            [id]: {
                ...targetWindow,
                state: {
                    ...targetWindow.state,
                    isEntering: false,
                },
            },
        },
    }
}

export function restoreWindowState(
    state: WindowSnapshot,
    id: string,
    viewport: Viewport,
): WindowSnapshot {
    const targetWindow = state.windows[id]
    if (!targetWindow) {
        return state
    }

    if (targetWindow.state.isMinimized) {
        return focusWindowState({
            ...state,
            windows: {
                ...state.windows,
                [id]: {
                    ...targetWindow,
                    state: {
                        ...targetWindow.state,
                        isMinimized: false,
                    },
                },
            },
        }, id)
    }

    if (targetWindow.state.isMaximized) {
        const focusedState = focusWindowState(state, id)
        const focusedWindow = focusedState.windows[id]
        if (!focusedWindow) {
            return focusedState
        }

        return {
            ...focusedState,
            windows: {
                ...focusedState.windows,
                [id]: {
                    ...focusedWindow,
                    bounds: clampBoundsToViewport(focusedWindow.state.previousBounds || focusedWindow.bounds, viewport),
                    state: {
                        ...focusedWindow.state,
                        isMaximized: false,
                        snapMode: undefined,
                        isFocused: true,
                    },
                },
            },
        }
    }

    if (targetWindow.state.snapMode) {
        const focusedState = focusWindowState(state, id)
        const focusedWindow = focusedState.windows[id]
        if (!focusedWindow) {
            return focusedState
        }

        const restoredBounds = focusedWindow.state.previousBounds || focusedWindow.bounds
        const bounds = clampBoundsToViewport(restoredBounds, viewport)

        return {
            ...focusedState,
            windows: {
                ...focusedState.windows,
                [id]: {
                    ...focusedWindow,
                    bounds,
                    state: {
                        ...focusedWindow.state,
                        isFocused: true,
                        snapMode: undefined,
                    },
                },
            },
        }
    }

    return focusWindowState(state, id)
}

export function applyWindowSnapState(
    state: WindowSnapshot,
    id: string,
    mode: SnapMode,
    context: SnapContext,
): WindowSnapshot {
    const targetWindow = state.windows[id]
    if (!targetWindow || targetWindow.state.isMinimized) {
        return state
    }

    const focusedState = focusWindowState(state, id)
    const focusedWindow = focusedState.windows[id]
    if (!focusedWindow) {
        return focusedState
    }

    const workspace = getWorkspaceRect(context)
    const region = getSnapRegion(mode, workspace, context)
    const previousBounds = focusedWindow.state.snapMode && focusedWindow.state.previousBounds
        ? focusedWindow.state.previousBounds
        : focusedWindow.state.isMaximized
            ? (focusedWindow.state.previousBounds || focusedWindow.bounds)
            : focusedWindow.bounds

    return {
        ...focusedState,
        windows: {
            ...focusedState.windows,
            [id]: {
                ...focusedWindow,
                bounds: region.bounds,
                state: {
                    ...focusedWindow.state,
                    isFocused: true,
                    isMinimized: false,
                    isMaximized: mode === 'maximize',
                    snapMode: mode,
                    previousBounds,
                },
            },
        },
    }
}

export function updateWindowBoundsState(
    state: WindowSnapshot,
    id: string,
    bounds: Partial<WindowBounds>,
    viewport: Viewport,
): WindowSnapshot {
    const targetWindow = state.windows[id]
    if (!targetWindow || targetWindow.state.isMaximized) {
        return state
    }

    return {
        ...state,
        windows: {
            ...state.windows,
            [id]: {
                ...targetWindow,
                bounds: clampBoundsToViewport(mergeWindowBounds(targetWindow.bounds, bounds), viewport),
                state: {
                    ...targetWindow.state,
                    snapMode: undefined,
                },
            },
        },
    }
}

export function updateMultipleBoundsState(
    state: WindowSnapshot,
    updates: Record<string, { bounds: Partial<WindowBounds>; snapMode?: SnapMode }>,
    viewport: Viewport,
): WindowSnapshot {
    let hasChanges = false
    const nextWindows = { ...state.windows }

    for (const [id, update] of Object.entries(updates)) {
        const targetWindow = state.windows[id]
        if (!targetWindow || targetWindow.state.isMaximized) {
            continue
        }

        hasChanges = true
        nextWindows[id] = {
            ...targetWindow,
            bounds: clampBoundsToViewport(mergeWindowBounds(targetWindow.bounds, update.bounds), viewport),
            state: {
                ...targetWindow.state,
                snapMode: update.snapMode !== undefined ? update.snapMode : targetWindow.state.snapMode,
            },
        }
    }

    if (!hasChanges) {
        return state
    }

    return {
        ...state,
        windows: nextWindows,
    }
}
