import type { WindowStore } from '../../stores/windowStore'

export function selectWindowById(id: string) {
    return (state: WindowStore) => state.windows[id]
}

export function selectWindowZIndex(id: string) {
    return (state: WindowStore) => {
        const orderIndex = state.windowOrder.indexOf(id)
        return orderIndex === -1 ? 10 : 10 + orderIndex
    }
}

export function selectWindowOrder(state: WindowStore): string[] {
    return state.windowOrder
}

export function selectWindowComponentById(id: string) {
    return (state: WindowStore) => state.windows[id]?.component
}

export function selectSnapPreview(state: WindowStore) {
    return state.snapPreview
}
