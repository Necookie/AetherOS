import { useEffect, useRef } from 'react'
import { getDraggedWindowPosition } from '../features/window-manager/dragBounds'
import { getSnapContext } from '../features/window-manager/shellMetrics'
import { getSnapRegion, resolveSnapModeFromPointer } from '../features/window-manager/snap'
import { getWorkspaceRect } from '../features/window-manager/workspace'
import { useWindowStore } from '../stores/windowStore'

interface UseWindowManagerProps {
    id: string
}

export function useWindowManager({ id }: UseWindowManagerProps) {
    const updateBounds = useWindowStore((state) => state.updateBounds)
    const focusWindow = useWindowStore((state) => state.focusWindow)
    const restoreWindow = useWindowStore((state) => state.restoreWindow)
    const snapWindow = useWindowStore((state) => state.snapWindow)
    const setSnapPreview = useWindowStore((state) => state.setSnapPreview)
    const clearSnapPreview = useWindowStore((state) => state.clearSnapPreview)

    const dragState = useRef({
        isDragging: false,
        startX: 0,
        startY: 0,
        initialWinX: 0,
        initialWinY: 0,
    })

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.target instanceof Element && e.target.closest('[data-drag-handle="false"]')) {
            return
        }

        focusWindow(id)

        const win = useWindowStore.getState().windows[id]
        if (!win || win.state.isMaximized) {
            return
        }

        dragState.current = {
            isDragging: true,
            startX: e.clientX,
            startY: e.clientY,
            initialWinX: win.bounds.x,
            initialWinY: win.bounds.y,
        }
        clearSnapPreview()

        e.currentTarget.setPointerCapture(e.pointerId)
    }

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!dragState.current.isDragging) {
            return
        }

        const win = useWindowStore.getState().windows[id]
        if (!win) {
            return
        }

        const snapContext = getSnapContext()
        const workspace = getWorkspaceRect(snapContext)

        const nextPosition = getDraggedWindowPosition(
            {
                x: dragState.current.initialWinX,
                y: dragState.current.initialWinY,
                width: win.bounds.width,
                height: win.bounds.height,
            },
            {
                startX: dragState.current.startX,
                startY: dragState.current.startY,
                currentX: e.clientX,
                currentY: e.clientY,
            },
            workspace,
        )

        updateBounds(id, nextPosition)

        const mode = resolveSnapModeFromPointer({ x: e.clientX, y: e.clientY }, workspace)
        if (!mode) {
            clearSnapPreview()
            return
        }

        setSnapPreview({
            windowId: id,
            region: getSnapRegion(mode, workspace, snapContext),
        })
    }

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!dragState.current.isDragging) {
            return
        }

        dragState.current.isDragging = false
        const snapPreview = useWindowStore.getState().snapPreview
        if (snapPreview?.windowId === id) {
            snapWindow(id, snapPreview.region.mode)
        } else {
            clearSnapPreview()
        }
        e.currentTarget.releasePointerCapture(e.pointerId)
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && dragState.current.isDragging) {
                dragState.current.isDragging = false
                clearSnapPreview()
                updateBounds(id, {
                    x: dragState.current.initialWinX,
                    y: dragState.current.initialWinY,
                })
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [clearSnapPreview, id, updateBounds])

    return {
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        focusWindow: () => focusWindow(id),
        restoreWindow: () => restoreWindow(id),
    }
}
