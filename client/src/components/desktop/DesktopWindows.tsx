import { useEffect } from 'react'
import { selectOrderedWindows } from '../../features/window-manager/selectors'
import { useWindowStore } from '../../stores/windowStore'

function isEditableTarget(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) {
        return false
    }

    return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

export default function DesktopWindows() {
    const windows = useWindowStore(selectOrderedWindows)

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (isEditableTarget(e.target)) {
                return
            }

            const store = useWindowStore.getState()
            const visibleWindowIds = store.windowOrder.filter((id) => !store.windows[id]?.state.isMinimized)

            if (e.altKey && e.key === 'Tab') {
                e.preventDefault()
                if (visibleWindowIds.length === 0) {
                    return
                }

                const currentIndex = visibleWindowIds.indexOf(store.focusedWindowId ?? '')
                const step = e.shiftKey ? -1 : 1
                const startIndex = currentIndex === -1 ? 0 : currentIndex
                const nextIndex = (startIndex + step + visibleWindowIds.length) % visibleWindowIds.length
                store.focusWindow(visibleWindowIds[nextIndex])
                return
            }

            const focusedId = store.focusedWindowId
            if (!focusedId) {
                return
            }

            if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 'w') {
                e.preventDefault()
                store.closeWindow(focusedId)
                return
            }

            if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 'm') {
                e.preventDefault()
                store.toggleMinimize(focusedId)
                return
            }

            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'm') {
                e.preventDefault()
                store.toggleMaximize(focusedId)
            }
        }

        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [])

    return (
        <div className="flex-1 relative z-20 pointer-events-auto">
            {windows.map((windowData) => (
                <windowData.component key={windowData.id} id={windowData.id} />
            ))}
        </div>
    )
}
