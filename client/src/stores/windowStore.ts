import { create } from 'zustand'
import type { WindowData, WindowBounds, AppDefinition } from '../types/windowManager'
import { DEFAULT_APPS } from '../config/windows'

interface WindowStore {
    windows: Record<string, WindowData>
    windowOrder: string[] // Array of window IDs, last element is on top
    focusedWindowId: string | null

    openWindow: (app: AppDefinition) => void
    closeWindow: (id: string) => void
    focusWindow: (id: string) => void
    toggleMinimize: (id: string) => void
    toggleMaximize: (id: string) => void
    updateBounds: (id: string, bounds: Partial<WindowBounds>) => void

    // Helper to get z-index
    getZIndex: (id: string) => number
}

// Initialize with default apps open
const initialWindows: Record<string, WindowData> = {}
const initialOrder: string[] = []

DEFAULT_APPS.forEach(app => {
    initialWindows[app.id] = {
        id: app.id,
        title: app.title,
        component: app.component,
        bounds: app.defaultBounds || { x: 100, y: 100, width: 600, height: 400 },
        state: {
            isMinimized: false,
            isMaximized: false,
            isFocused: false
        }
    }
    initialOrder.push(app.id)
})
// Focus the last one
if (initialOrder.length > 0) {
    const lastId = initialOrder[initialOrder.length - 1]
    initialWindows[lastId].state.isFocused = true
}

export const useWindowStore = create<WindowStore>((set, get) => ({
    windows: initialWindows,
    windowOrder: initialOrder,
    focusedWindowId: initialOrder.length > 0 ? initialOrder[initialOrder.length - 1] : null,

    openWindow: (app: AppDefinition) => set((state) => {
        if (state.windows[app.id]) {
            // If already open, just focus it and ensure it's not minimized
            const updatedWindows = { ...state.windows }
            updatedWindows[app.id] = {
                ...updatedWindows[app.id],
                state: {
                    ...updatedWindows[app.id].state,
                    isMinimized: false,
                    isFocused: true
                }
            }
            // Remove previous focus
            if (state.focusedWindowId && state.focusedWindowId !== app.id && updatedWindows[state.focusedWindowId]) {
                updatedWindows[state.focusedWindowId].state.isFocused = false
            }

            // Move to top
            const newOrder = state.windowOrder.filter(wId => wId !== app.id)
            newOrder.push(app.id)

            return { windows: updatedWindows, windowOrder: newOrder, focusedWindowId: app.id }
        }

        const newWindow: WindowData = {
            id: app.id,
            title: app.title,
            component: app.component,
            bounds: app.defaultBounds || { x: 150, y: 150, width: 600, height: 400 },
            state: {
                isMinimized: false,
                isMaximized: false,
                isFocused: true
            }
        }

        const updatedWindows = { ...state.windows, [app.id]: newWindow }

        // Remove previous focus
        if (state.focusedWindowId && updatedWindows[state.focusedWindowId]) {
            updatedWindows[state.focusedWindowId].state.isFocused = false
        }

        return {
            windows: updatedWindows,
            windowOrder: [...state.windowOrder, app.id],
            focusedWindowId: app.id
        }
    }),

    closeWindow: (id: string) => set((state) => {
        const { [id]: removed, ...remainingWindows } = state.windows
        const newOrder = state.windowOrder.filter(wId => wId !== id)

        let newFocusedId = state.focusedWindowId
        if (state.focusedWindowId === id) {
            newFocusedId = newOrder.length > 0 ? newOrder[newOrder.length - 1] : null
            if (newFocusedId && remainingWindows[newFocusedId]) {
                remainingWindows[newFocusedId].state.isFocused = true
            }
        }

        return {
            windows: remainingWindows,
            windowOrder: newOrder,
            focusedWindowId: newFocusedId
        }
    }),

    focusWindow: (id: string) => set((state) => {
        if (state.focusedWindowId === id || !state.windows[id]) return state

        const updatedWindows = { ...state.windows }

        if (state.focusedWindowId && updatedWindows[state.focusedWindowId]) {
            updatedWindows[state.focusedWindowId].state.isFocused = false
        }

        updatedWindows[id].state.isFocused = true
        // If it was minimized, un-minimize
        updatedWindows[id].state.isMinimized = false

        const newOrder = state.windowOrder.filter(wId => wId !== id)
        newOrder.push(id)

        return {
            windows: updatedWindows,
            windowOrder: newOrder,
            focusedWindowId: id
        }
    }),

    toggleMinimize: (id: string) => set((state) => {
        if (!state.windows[id]) return state

        const win = state.windows[id]
        const isMinimizing = !win.state.isMinimized

        const updatedWindows = { ...state.windows }
        updatedWindows[id] = {
            ...win,
            state: {
                ...win.state,
                isMinimized: isMinimizing,
                isFocused: isMinimizing ? false : true
            }
        }

        let newFocusedId = state.focusedWindowId

        if (isMinimizing) {
            // Find next unminimized window to focus
            const reversedOrder = [...state.windowOrder].reverse()
            const nextFocus = reversedOrder.find(wId => wId !== id && !updatedWindows[wId].state.isMinimized)

            if (nextFocus) {
                newFocusedId = nextFocus
                updatedWindows[nextFocus].state.isFocused = true
            } else {
                newFocusedId = null
            }
        } else {
            // We are un-minimizing, focus it
            if (state.focusedWindowId && state.focusedWindowId !== id && updatedWindows[state.focusedWindowId]) {
                updatedWindows[state.focusedWindowId].state.isFocused = false
            }
            newFocusedId = id

            // Move to top if un-minimizing
            const newOrder = state.windowOrder.filter(wId => wId !== id)
            newOrder.push(id)
            return { windows: updatedWindows, windowOrder: newOrder, focusedWindowId: newFocusedId }
        }

        return { windows: updatedWindows, focusedWindowId: newFocusedId }
    }),

    toggleMaximize: (id: string) => set((state) => {
        if (!state.windows[id]) return state

        const win = state.windows[id]
        const isMaximizing = !win.state.isMaximized

        const updatedWindows = { ...state.windows }

        if (isMaximizing) {
            updatedWindows[id] = {
                ...win,
                state: {
                    ...win.state,
                    isMaximized: true,
                    previousBounds: win.bounds
                },
                bounds: { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight } // Initial maximize bounds
            }
        } else {
            updatedWindows[id] = {
                ...win,
                state: {
                    ...win.state,
                    isMaximized: false
                },
                bounds: win.state.previousBounds || win.bounds
            }
        }

        return { windows: updatedWindows }
    }),

    updateBounds: (id: string, bounds: Partial<WindowBounds>) => set((state) => {
        if (!state.windows[id]) return state

        const win = state.windows[id]

        // Don't update bounds if maximized
        if (win.state.isMaximized) return state

        const updatedWindows = { ...state.windows }
        updatedWindows[id] = {
            ...win,
            bounds: { ...win.bounds, ...bounds }
        }

        return { windows: updatedWindows }
    }),

    getZIndex: (id: string) => {
        const orderIndex = get().windowOrder.indexOf(id)
        if (orderIndex === -1) return 10 // baseline
        return 10 + orderIndex
    }
}))
