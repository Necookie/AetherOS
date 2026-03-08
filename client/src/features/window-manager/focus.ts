import type { WindowData } from '../../types/windowManager'

function withWindow(
    windows: Record<string, WindowData>,
    id: string,
    updater: (windowData: WindowData) => WindowData,
) {
    const windowData = windows[id]
    if (!windowData) {
        return windows
    }

    return {
        ...windows,
        [id]: updater(windowData),
    }
}

export function bringWindowToFront(windowOrder: string[], id: string) {
    return [...windowOrder.filter((windowId) => windowId !== id), id]
}

export function clearFocusedWindow(
    windows: Record<string, WindowData>,
    focusedWindowId: string | null,
) {
    if (!focusedWindowId || !windows[focusedWindowId]) {
        return windows
    }

    return withWindow(windows, focusedWindowId, (windowData) => ({
        ...windowData,
        state: {
            ...windowData.state,
            isFocused: false,
        },
    }))
}

export function focusWindow(
    windows: Record<string, WindowData>,
    currentFocusedId: string | null,
    targetId: string,
) {
    if (!windows[targetId]) {
        return {
            windows,
            focusedWindowId: currentFocusedId,
        }
    }

    let nextWindows = clearFocusedWindow(windows, currentFocusedId)
    nextWindows = withWindow(nextWindows, targetId, (windowData) => ({
        ...windowData,
        state: {
            ...windowData.state,
            isFocused: true,
            isMinimized: false,
        },
    }))

    return {
        windows: nextWindows,
        focusedWindowId: targetId,
    }
}

export function getWindowZIndex(windowOrder: string[], id: string) {
    const orderIndex = windowOrder.indexOf(id)
    return orderIndex === -1 ? 10 : 10 + orderIndex
}
