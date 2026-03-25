import type { WindowStore } from '../../stores/windowStore'

export interface WindowStatusSnapshot {
    title: string | null
    width: number
    height: number
    isOpen: boolean
    isFocused: boolean
    isMaximized: boolean
    isMinimized: boolean
}

const CLOSED_WINDOW_STATUS: WindowStatusSnapshot = {
    title: null,
    width: 0,
    height: 0,
    isOpen: false,
    isFocused: false,
    isMaximized: false,
    isMinimized: false,
}

export function selectWindowById(id: string) {
    return (state: WindowStore) => state.windows[id]
}

export function selectWindowZIndex(id: string) {
    return (state: WindowStore) => state.getZIndex(id)
}

export function selectWindowOrder(state: WindowStore): string[] {
    return state.windowOrder
}

export function selectWindowComponentById(id: string) {
    return (state: WindowStore) => state.windows[id]?.component
}

export function selectWindowStatusById(id: string) {
    return (state: WindowStore): WindowStatusSnapshot => {
        const windowData = state.windows[id]
        if (!windowData) {
            return CLOSED_WINDOW_STATUS
        }

        return {
            title: windowData.title,
            width: windowData.bounds.width,
            height: windowData.bounds.height,
            isOpen: true,
            isFocused: windowData.state.isFocused,
            isMaximized: windowData.state.isMaximized,
            isMinimized: windowData.state.isMinimized,
        }
    }
}

export function selectSnapPreview(state: WindowStore) {
    return state.snapPreview
}
