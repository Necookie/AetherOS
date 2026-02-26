import { useRef, useEffect } from 'react'
import { useWindowStore } from '../stores/windowStore'

interface UseWindowManagerProps {
    id: string
}

export function useWindowManager({ id }: UseWindowManagerProps) {
    const updateBounds = useWindowStore(state => state.updateBounds)
    const focusWindow = useWindowStore(state => state.focusWindow)

    // Use refs for tracking drag state to avoid react re-renders
    const dragState = useRef({
        isDragging: false,
        startX: 0,
        startY: 0,
        initialWinX: 0,
        initialWinY: 0
    })

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.target instanceof Element && e.target.closest('[data-drag-handle="false"]')) {
            return // Don't drag if clicking buttons
        }

        focusWindow(id)

        const win = useWindowStore.getState().windows[id]
        if (!win || win.state.isMaximized) return

        dragState.current = {
            isDragging: true,
            startX: e.clientX,
            startY: e.clientY,
            initialWinX: win.bounds.x,
            initialWinY: win.bounds.y
        }

        // Set pointer capture to ensure we keep getting events even if mouse leaves the titlebar
        e.currentTarget.setPointerCapture(e.pointerId)
    }

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!dragState.current.isDragging) return

        const { startX, startY, initialWinX, initialWinY } = dragState.current

        let newX = initialWinX + (e.clientX - startX)
        let newY = initialWinY + (e.clientY - startY)

        // Boundaries constraints
        // Cannot go above 0 (top of viewport)
        if (newY < 0) newY = 0

        // Subtile magnetic snap at edges could go here
        if (newX < 8 && newX > -8) newX = 0
        if (newY < 8 && newY > -8) newY = 0

        // We use requestAnimationFrame automatically via Zustand's internal batched updates and React,
        // but for pure 60fps it's better to bypass React state for 'left/top' while dragging if we experience lag.
        // For now, Zustand shallow updates are very fast.
        updateBounds(id, { x: newX, y: newY })
    }

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!dragState.current.isDragging) return
        dragState.current.isDragging = false
        e.currentTarget.releasePointerCapture(e.pointerId)
    }

    // Cancel drag on ESC
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && dragState.current.isDragging) {
                dragState.current.isDragging = false
                updateBounds(id, { x: dragState.current.initialWinX, y: dragState.current.initialWinY })
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [id, updateBounds])

    // Resize could be added similarly

    return {
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        focusWindow: () => focusWindow(id)
    }
}
