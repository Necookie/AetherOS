import type { AppDefinition, WindowBounds, WindowData } from '../../types/windowManager'

export type WindowSnapshot = {
    windows: Record<string, WindowData>
    windowOrder: string[]
    focusedWindowId: string | null
}

const DEFAULT_BOUNDS: WindowBounds = { x: 150, y: 150, width: 600, height: 400 }

function clearFocusedWindow(windows: Record<string, WindowData>, focusedWindowId: string | null) {
    if (focusedWindowId && windows[focusedWindowId]) {
        windows[focusedWindowId] = {
            ...windows[focusedWindowId],
            state: {
                ...windows[focusedWindowId].state,
                isFocused: false,
            },
        }
    }
}

export function createWindowSnapshot(): WindowSnapshot {
    return {
        windows: {},
        windowOrder: [],
        focusedWindowId: null,
    }
}

export function openWindowState(state: WindowSnapshot, app: AppDefinition): WindowSnapshot {
    if (state.windows[app.id]) {
        const updatedWindows = { ...state.windows }

        clearFocusedWindow(updatedWindows, state.focusedWindowId)

        updatedWindows[app.id] = {
            ...updatedWindows[app.id],
            state: {
                ...updatedWindows[app.id].state,
                isMinimized: false,
                isFocused: true,
            },
        }

        return {
            windows: updatedWindows,
            windowOrder: bringWindowToFront(state.windowOrder, app.id),
            focusedWindowId: app.id,
        }
    }

    const newWindow: WindowData = {
        id: app.id,
        title: app.title,
        component: app.component,
        bounds: app.defaultBounds || DEFAULT_BOUNDS,
        state: {
            isMinimized: false,
            isMaximized: false,
            isFocused: true,
        },
    }

    const updatedWindows = { ...state.windows, [app.id]: newWindow }
    clearFocusedWindow(updatedWindows, state.focusedWindowId)

    return {
        windows: updatedWindows,
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
    const focusedWindowId = state.focusedWindowId === id
        ? windowOrder[windowOrder.length - 1] ?? null
        : state.focusedWindowId

    if (focusedWindowId && remainingWindows[focusedWindowId]) {
        remainingWindows[focusedWindowId] = {
            ...remainingWindows[focusedWindowId],
            state: {
                ...remainingWindows[focusedWindowId].state,
                isFocused: true,
            },
        }
    }

    return {
        windows: remainingWindows,
        windowOrder,
        focusedWindowId,
    }
}

export function focusWindowState(state: WindowSnapshot, id: string): WindowSnapshot {
    if (state.focusedWindowId === id || !state.windows[id]) {
        return state
    }

    const updatedWindows = { ...state.windows }
    clearFocusedWindow(updatedWindows, state.focusedWindowId)

    updatedWindows[id] = {
        ...updatedWindows[id],
        state: {
            ...updatedWindows[id].state,
            isFocused: true,
            isMinimized: false,
        },
    }

    return {
        windows: updatedWindows,
        windowOrder: bringWindowToFront(state.windowOrder, id),
        focusedWindowId: id,
    }
}

export function toggleMinimizeState(state: WindowSnapshot, id: string): WindowSnapshot {
    const targetWindow = state.windows[id]
    if (!targetWindow) {
        return state
    }

    const isMinimizing = !targetWindow.state.isMinimized
    const updatedWindows = { ...state.windows }

    updatedWindows[id] = {
        ...targetWindow,
        state: {
            ...targetWindow.state,
            isMinimized: isMinimizing,
            isFocused: !isMinimizing,
        },
    }

    if (!isMinimizing) {
        clearFocusedWindow(updatedWindows, state.focusedWindowId)
        updatedWindows[id] = {
            ...updatedWindows[id],
            state: {
                ...updatedWindows[id].state,
                isFocused: true,
            },
        }

        return {
            windows: updatedWindows,
            windowOrder: bringWindowToFront(state.windowOrder, id),
            focusedWindowId: id,
        }
    }

    const nextFocusedWindowId = [...state.windowOrder]
        .reverse()
        .find((windowId) => windowId !== id && !updatedWindows[windowId].state.isMinimized) ?? null

    if (nextFocusedWindowId) {
        updatedWindows[nextFocusedWindowId] = {
            ...updatedWindows[nextFocusedWindowId],
            state: {
                ...updatedWindows[nextFocusedWindowId].state,
                isFocused: true,
            },
        }
    }

    return {
        windows: updatedWindows,
        windowOrder: state.windowOrder,
        focusedWindowId: nextFocusedWindowId,
    }
}

export function toggleMaximizeState(
    state: WindowSnapshot,
    id: string,
    viewport: { width: number; height: number },
): WindowSnapshot {
    const targetWindow = state.windows[id]
    if (!targetWindow) {
        return state
    }

    const isMaximizing = !targetWindow.state.isMaximized
    const updatedWindows = { ...state.windows }

    updatedWindows[id] = isMaximizing
        ? {
            ...targetWindow,
            state: {
                ...targetWindow.state,
                isMaximized: true,
                previousBounds: targetWindow.bounds,
            },
            bounds: {
                x: 0,
                y: 0,
                width: viewport.width,
                height: viewport.height,
            },
        }
        : {
            ...targetWindow,
            state: {
                ...targetWindow.state,
                isMaximized: false,
            },
            bounds: targetWindow.state.previousBounds || targetWindow.bounds,
        }

    return {
        ...state,
        windows: updatedWindows,
    }
}

export function updateWindowBoundsState(
    state: WindowSnapshot,
    id: string,
    bounds: Partial<WindowBounds>,
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
                bounds: {
                    ...targetWindow.bounds,
                    ...bounds,
                },
            },
        },
    }
}

export function bringWindowToFront(windowOrder: string[], id: string) {
    return [...windowOrder.filter((windowId) => windowId !== id), id]
}

export function getWindowZIndex(windowOrder: string[], id: string) {
    const orderIndex = windowOrder.indexOf(id)
    return orderIndex === -1 ? 10 : 10 + orderIndex
}
