import { create } from 'zustand'
import {
    closeWindowState,
    createWindowSnapshot,
    focusWindowState,
    getWindowZIndex,
    openWindowState,
    toggleMaximizeState,
    toggleMinimizeState,
    updateWindowBoundsState,
} from '../features/window-manager/windowState'
import type { AppDefinition, WindowBounds, WindowData } from '../types/windowManager'
import { useKernelStore } from './useKernelStore'

export interface WindowStore {
    windows: Record<string, WindowData>
    windowOrder: string[]
    focusedWindowId: string | null
    openWindow: (app: AppDefinition) => void
    closeWindow: (id: string) => void
    focusWindow: (id: string) => void
    toggleMinimize: (id: string) => void
    toggleMaximize: (id: string) => void
    updateBounds: (id: string, bounds: Partial<WindowBounds>) => void
    getZIndex: (id: string) => number
}

const initialState = createWindowSnapshot()

export const useWindowStore = create<WindowStore>((set, get) => ({
    windows: initialState.windows,
    windowOrder: initialState.windowOrder,
    focusedWindowId: initialState.focusedWindowId,
    openWindow: (app) => set((state) => {
        const wasOpen = Boolean(state.windows[app.id])
        const nextState = openWindowState(state, app, {
            width: window.innerWidth,
            height: window.innerHeight,
        })

        if (!wasOpen) {
            useKernelStore.getState().spawnAppProcess(app.id, app.title)
        }

        return nextState
    }),
    closeWindow: (id) => set((state) => {
        const wasOpen = Boolean(state.windows[id])
        const nextState = closeWindowState(state, id)

        if (wasOpen) {
            useKernelStore.getState().killAppProcess(id)
        }

        return nextState
    }),
    focusWindow: (id) => set((state) => focusWindowState(state, id)),
    toggleMinimize: (id) => set((state) => toggleMinimizeState(state, id)),
    toggleMaximize: (id) => set((state) => toggleMaximizeState(state, id, {
        width: window.innerWidth,
        height: window.innerHeight,
    })),
    updateBounds: (id, bounds) => set((state) => updateWindowBoundsState(state, id, bounds)),
    getZIndex: (id) => getWindowZIndex(get().windowOrder, id),
}))
