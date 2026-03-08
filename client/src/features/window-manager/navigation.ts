import type { WindowData } from '../../types/windowManager'

export function getVisibleWindowIds(windows: Record<string, WindowData>, windowOrder: string[]) {
    return windowOrder.filter((id) => !windows[id]?.state.isMinimized)
}

export function getNextWindowInCycle(
    windows: Record<string, WindowData>,
    windowOrder: string[],
    focusedWindowId: string | null,
    step: 1 | -1,
) {
    const visibleWindowIds = getVisibleWindowIds(windows, windowOrder)
    if (visibleWindowIds.length === 0) {
        return null
    }

    const currentIndex = visibleWindowIds.indexOf(focusedWindowId ?? '')
    const startIndex = currentIndex === -1 ? (step === 1 ? -1 : 0) : currentIndex
    const nextIndex = (startIndex + step + visibleWindowIds.length) % visibleWindowIds.length
    return visibleWindowIds[nextIndex]
}

export function getWindowAtPosition(windowOrder: string[], position: number) {
    if (position < 1 || position > windowOrder.length) {
        return null
    }

    return windowOrder[position - 1] ?? null
}
