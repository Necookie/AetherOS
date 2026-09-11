import { useEffect, useRef, useState } from 'react'
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

    const [isDragging, setIsDragging] = useState(false)

    const dragState = useRef({
        isDragging: false,
        startX: 0,
        startY: 0,
        initialWinX: 0,
        initialWinY: 0,
        hasBrokenFromSnap: false,
    })

    const pendingMove = useRef<{ clientX: number; clientY: number } | null>(null)
    const rafId = useRef<number | null>(null)

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.target instanceof Element && e.target.closest('[data-drag-handle="false"]')) {
            return
        }

        focusWindow(id)

        const win = useWindowStore.getState().windows[id]
        if (!win) {
            return
        }

        // If maximized, smoothly un-maximize on drag
        if (win.state.isMaximized) {
            const restoredBounds = win.state.previousBounds || { width: 800, height: 500, x: 100, y: 100 }
            const snapContext = getSnapContext()
            const workspace = getWorkspaceRect(snapContext)
            const ratio = e.clientX / Math.max(1, window.innerWidth)
            const newX = Math.max(workspace.x, Math.min(workspace.x + workspace.width - restoredBounds.width, e.clientX - restoredBounds.width * ratio))
            const newY = Math.max(workspace.y, e.clientY - 20)

            restoreWindow(id)
            updateBounds(id, { x: newX, y: newY, width: restoredBounds.width, height: restoredBounds.height })

            dragState.current = {
                isDragging: true,
                startX: e.clientX,
                startY: e.clientY,
                initialWinX: newX,
                initialWinY: newY,
                hasBrokenFromSnap: true,
            }
            setIsDragging(true)
            clearSnapPreview()
            e.currentTarget.setPointerCapture(e.pointerId)
            return
        }

        dragState.current = {
            isDragging: true,
            startX: e.clientX,
            startY: e.clientY,
            initialWinX: win.bounds.x,
            initialWinY: win.bounds.y,
            hasBrokenFromSnap: !win.state.snapMode,
        }
        setIsDragging(true)
        clearSnapPreview()

        e.currentTarget.setPointerCapture(e.pointerId)
    }

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!dragState.current.isDragging) {
            return
        }

        pendingMove.current = { clientX: e.clientX, clientY: e.clientY }

        if (rafId.current === null) {
            rafId.current = requestAnimationFrame(() => {
                rafId.current = null
                if (!dragState.current.isDragging || !pendingMove.current) {
                    return
                }

                const { clientX, clientY } = pendingMove.current
                const win = useWindowStore.getState().windows[id]
                if (!win) {
                    return
                }

                const snapContext = getSnapContext()
                const workspace = getWorkspaceRect(snapContext)

                // Smoothly un-snap if user drags away from snapped position
                if (!dragState.current.hasBrokenFromSnap && win.state.snapMode) {
                    const dx = Math.abs(clientX - dragState.current.startX)
                    const dy = Math.abs(clientY - dragState.current.startY)
                    if (dx > 8 || dy > 8) {
                        dragState.current.hasBrokenFromSnap = true
                        const restored = win.state.previousBounds || { width: 720, height: 480, x: 100, y: 100 }
                        const newX = Math.max(workspace.x, Math.min(workspace.x + workspace.width - restored.width, clientX - restored.width / 2))
                        const newY = Math.max(workspace.y, clientY - 20)

                        dragState.current.startX = clientX
                        dragState.current.startY = clientY
                        dragState.current.initialWinX = newX
                        dragState.current.initialWinY = newY

                        updateBounds(id, { x: newX, y: newY, width: restored.width, height: restored.height })
                        return
                    }
                }

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
                        currentX: clientX,
                        currentY: clientY,
                    },
                    workspace,
                )

                updateBounds(id, nextPosition)

                const mode = resolveSnapModeFromPointer({ x: clientX, y: clientY }, workspace)
                if (!mode) {
                    clearSnapPreview()
                    return
                }

                setSnapPreview({
                    windowId: id,
                    region: getSnapRegion(mode, workspace, snapContext),
                })
            })
        }
    }

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!dragState.current.isDragging) {
            return
        }

        if (rafId.current !== null) {
            cancelAnimationFrame(rafId.current)
            rafId.current = null
        }

        dragState.current.isDragging = false
        setIsDragging(false)

        const snapPreview = useWindowStore.getState().snapPreview
        if (snapPreview?.windowId === id) {
            snapWindow(id, snapPreview.region.mode)
        } else {
            clearSnapPreview()
        }

        try {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                e.currentTarget.releasePointerCapture(e.pointerId)
            }
        } catch {
            // pointer capture already released
        }
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && dragState.current.isDragging) {
                if (rafId.current !== null) {
                    cancelAnimationFrame(rafId.current)
                    rafId.current = null
                }
                dragState.current.isDragging = false
                setIsDragging(false)
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
        isDragging,
        focusWindow: () => focusWindow(id),
        restoreWindow: () => restoreWindow(id),
    }
}
