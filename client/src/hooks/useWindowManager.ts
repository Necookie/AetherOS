import { useEffect, useRef } from 'react'
import { getDraggedWindowPosition } from '../features/window-manager/dragBounds'
import { useWindowStore } from '../stores/windowStore'

interface UseWindowManagerProps {
    id: string
}

export function useWindowManager({ id }: UseWindowManagerProps) {
    const updateBounds = useWindowStore((state) => state.updateBounds)
    const focusWindow = useWindowStore((state) => state.focusWindow)

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

        e.currentTarget.setPointerCapture(e.pointerId)
    }

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!dragState.current.isDragging) {
            return
        }

        const nextPosition = getDraggedWindowPosition(
            {
                x: dragState.current.initialWinX,
                y: dragState.current.initialWinY,
                width: 0,
                height: 0,
            },
            {
                startX: dragState.current.startX,
                startY: dragState.current.startY,
                currentX: e.clientX,
                currentY: e.clientY,
            },
        )

        updateBounds(id, nextPosition)
    }

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!dragState.current.isDragging) {
            return
        }

        dragState.current.isDragging = false
        e.currentTarget.releasePointerCapture(e.pointerId)
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && dragState.current.isDragging) {
                dragState.current.isDragging = false
                updateBounds(id, {
                    x: dragState.current.initialWinX,
                    y: dragState.current.initialWinY,
                })
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [id, updateBounds])

    return {
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        focusWindow: () => focusWindow(id),
    }
}
