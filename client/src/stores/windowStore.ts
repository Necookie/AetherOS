import { create } from 'zustand'
import {
    applyWindowSnapState,
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
import { getSnapContext } from '../features/window-manager/shellMetrics'
import { getNextWindowInCycle } from '../features/window-manager/navigation'
import type { AppDefinition, SnapMode, WindowBounds, WindowData } from '../types/windowManager'
import type { SnapPreview } from '../features/window-manager/types'
import { useKernelStore } from './useKernelStore'
import { registryService, useAppRegistryStore } from './appRegistryStore'
import { useSessionStore } from './useSessionStore'
import { getActiveAccount } from '../features/accounts/services/sessionSelectors'
import { checkAppLaunchAccess } from '../features/permissions/guards'
import { permissionService } from '../features/permissions/permissionService'

export interface WindowStore {
    windows: Record<string, WindowData>
    windowOrder: string[]
    focusedWindowId: string | null
    snapPreview: SnapPreview | null
    lastGuardError: string | null
    openWindow: (app: AppDefinition) => void
    closeWindow: (id: string) => void
    focusWindow: (id: string) => void
    toggleMinimize: (id: string) => void
    toggleMaximize: (id: string) => void
    snapWindow: (id: string, mode: SnapMode) => void
    restoreWindow: (id: string) => void
    updateBounds: (id: string, bounds: Partial<WindowBounds>) => void
    setSnapPreview: (preview: SnapPreview | null) => void
    clearSnapPreview: () => void
    cycleFocus: (step: 1 | -1) => void
    getZIndex: (id: string) => number
    resetWindows: () => void
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
    snapPreview: null,
    lastGuardError: null,
    openWindow: (app) => set((state) => {
        const installed = useAppRegistryStore.getState().installed
        if (!registryService.canLaunch(app.id, installed)) {
            return state
        }

        const sessionState = useSessionStore.getState()
        const activeAccount = getActiveAccount(sessionState)
        if (!activeAccount) {
            return {
                ...state,
                lastGuardError: 'No active session. Please log in to continue.',
            }
        }

        const access = checkAppLaunchAccess(activeAccount.role, app.id)
        if (!access.allowed) {
            if (access.needsPrompt && access.permission) {
                const granted = permissionService.request(sessionState.activeUserId ?? activeAccount.id, access.permission, access.reason ?? `Allow launching ${app.title}`)
                if (!granted) {
                    return {
                        ...state,
                        lastGuardError: access.reason ?? 'Permission denied.',
                    }
                }
            } else {
                return {
                    ...state,
                    lastGuardError: access.reason ?? 'You are not allowed to launch this app.',
                }
            }
        }

        const wasOpen = Boolean(state.windows[app.id])
        const nextState = openWindowState(state, app, getViewport())

        if (!wasOpen) {
            useKernelStore.getState().spawnAppProcess(app.id, app.title)
            void useAppRegistryStore.getState().dispatchLifecycleEvent('launch', app.id)
        }

        return {
            ...nextState,
            snapPreview: null,
            lastGuardError: null,
        }
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
    snapWindow: (id, mode) => set((state) => {
        const nextState = applyWindowSnapState(state, id, mode, getSnapContext(getViewport()))
        return {
            ...nextState,
            snapPreview: null,
        }
    }),
    restoreWindow: (id) => set((state) => {
        const nextState = restoreWindowState(state, id, getViewport())
        if (nextState !== state) {
            void useAppRegistryStore.getState().dispatchLifecycleEvent('launch', id)
        }
        return {
            ...nextState,
            snapPreview: null,
        }
    }),
    updateBounds: (id, bounds) => set((state) => updateWindowBoundsState(state, id, bounds, getViewport())),
    setSnapPreview: (preview) => set((state) => {
        if (
            state.snapPreview?.windowId === preview?.windowId &&
            state.snapPreview?.region.mode === preview?.region.mode &&
            state.snapPreview?.region.bounds.x === preview?.region.bounds.x &&
            state.snapPreview?.region.bounds.y === preview?.region.bounds.y &&
            state.snapPreview?.region.bounds.width === preview?.region.bounds.width &&
            state.snapPreview?.region.bounds.height === preview?.region.bounds.height
        ) {
            return state
        }

        return {
            ...state,
            snapPreview: preview,
        }
    }),
    clearSnapPreview: () => set((state) => {
        if (!state.snapPreview) {
            return state
        }

        return {
            ...state,
            snapPreview: null,
        }
    }),
    cycleFocus: (step) => set((state) => {
        const nextWindowId = getNextWindowInCycle(state.windows, state.windowOrder, state.focusedWindowId, step)
        if (!nextWindowId) {
            return state
        }

        return focusWindowState(state, nextWindowId)
    }),
    getZIndex: (id) => getWindowZIndex(get().windowOrder, id),
    resetWindows: () => set((state) => {
        Object.keys(state.windows).forEach((appId) => {
            useKernelStore.getState().killAppProcess(appId)
            void useAppRegistryStore.getState().dispatchLifecycleEvent('suspend', appId)
        })

        return {
            windows: {},
            windowOrder: [],
            focusedWindowId: null,
            snapPreview: null,
            lastGuardError: null,
        }
    }),
}))
