import type { WindowData } from '../../types/windowManager'
import type { WindowStore } from '../../stores/windowStore'

export function selectWindowById(id: string) {
    return (state: WindowStore) => state.windows[id]
}

export function selectWindowZIndex(id: string) {
    return (state: WindowStore) => state.getZIndex(id)
}

export function selectOrderedWindows(state: WindowStore): WindowData[] {
    return state.windowOrder
        .map((id) => state.windows[id])
        .filter((windowData): windowData is WindowData => Boolean(windowData))
}
