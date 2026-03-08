import { create } from 'zustand'
import {
    closeWindowState,
    createWindowSnapshot,
    focusWindowState,
    getWindowZIndex,
    openWindowState,
    restoreWindowState,
    toggleMaximizeState,
    toggleMinimizeState,
    updateWindowBoundsState,
} from '../features/window-manager/windowState'
import { getNextWindowInCycle } from '../features/window-manager/navigation'
import type { AppDefinition, WindowBounds, WindowData } from '../types/windowManager'
import { useKernelStore } from './useKernelStore'
import { registryService, useAppRegistryStore } from './appRegistryStore'

export interface WindowStore {
    windows: Record<string, WindowData>
    windowOrder: string[]
    focusedWindowId: string | null
    openWindow: (app: AppDefinition) => void
    closeWindow: (id: string) => void
    focusWindow: (id: string) => void
    toggleMinimize: (id: string) => void
    toggleMaximize: (id: string) => void
    restoreWindow: (id: string) => void
    updateBounds: (id: string, bounds: Partial<WindowBounds>) => void
    cycleFocus: (step: 1 | -1) => void
    getZIndex: (id: string) => number
}

const initialState = createWindowSnapshot()

function getViewport() {
    return {
        width: window.innerWidth,
        height: window.innerHeight,
    }
}

export const useWindowStore = create<WindowStore>((set, get) => ({
    windows: initialState.windows,
    windowOrder: initialState.windowOrder,
    focusedWindowId: initialState.focusedWindowId,
    openWindow: (app) => set((state) => {
        const installed = useAppRegistryStore.getState().installed
        if (!registryService.canLaunch(app.id, installed)) {
            return state
        }

        const wasOpen = Boolean(state.windows[app.id])
        const nextState = openWindowState(state, app, getViewport())

        if (!wasOpen) {
            useKernelStore.getState().spawnAppProcess(app.id, app.title)
            void useAppRegistryStore.getState().dispatchLifecycleEvent('launch', app.id)
        }

        return nextState
    }),
    closeWindow: (id) => set((state) => {
        const wasOpen = Boolean(state.windows[id])
        const nextState = closeWindowState(state, id)

        if (wasOpen) {
            useKernelStore.getState().killAppProcess(id)
            void useAppRegistryStore.getState().dispatchLifecycleEvent('suspend', id)
        }

        return nextState
    }),
    focusWindow: (id) => set((state) => focusWindowState(state, id)),
    toggleMinimize: (id) => set((state) => {
        const windowData = state.windows[id]
        if (!windowData) {
            return state
        }

        const nextState = toggleMinimizeState(state, id)
        const willMinimize = !windowData.state.isMinimized
        void useAppRegistryStore.getState().dispatchLifecycleEvent(willMinimize ? 'suspend' : 'launch', id)
        return nextState
    }),
    toggleMaximize: (id) => set((state) => toggleMaximizeState(state, id, getViewport())),
    restoreWindow: (id) => set((state) => {
        const nextState = restoreWindowState(state, id, getViewport())
        if (nextState !== state) {
            void useAppRegistryStore.getState().dispatchLifecycleEvent('launch', id)
        }
        return nextState
    }),
    updateBounds: (id, bounds) => set((state) => updateWindowBoundsState(state, id, bounds, getViewport())),
    cycleFocus: (step) => set((state) => {
        const nextWindowId = getNextWindowInCycle(state.windows, state.windowOrder, state.focusedWindowId, step)
        if (!nextWindowId) {
            return state
        }

        return focusWindowState(state, nextWindowId)
    }),
    getZIndex: (id) => getWindowZIndex(get().windowOrder, id),
}))
