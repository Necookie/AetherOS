import React, { useEffect, useRef, useState } from 'react'
import { Maximize2, Minimize2, Minus, X } from 'lucide-react'
import { selectWindowById, selectWindowZIndex } from '../../features/window-manager/selectors'
import { useWindowManager } from '../../hooks/useWindowManager'
import { useWindowStore } from '../../stores/windowStore'
import { SnapLayoutPopover } from '../../features/window-manager/components/SnapLayoutPopover'
import { calculateTiledResize, type ResizeDirection } from '../../features/window-manager/tiling'
import { getSnapContext } from '../../features/window-manager/shellMetrics'
import { getWorkspaceRect } from '../../features/window-manager/workspace'

interface WindowProps {
    id: string
    title: string
    children: React.ReactNode
}

export default function Window({ id, title, children }: WindowProps) {
    const windowState = useWindowStore(selectWindowById(id))
    const zIndex = useWindowStore(selectWindowZIndex(id))
    const closeWindow = useWindowStore((state) => state.closeWindow)
    const completeWindowEnter = useWindowStore((state) => state.completeWindowEnter)
    const focusWindow = useWindowStore((state) => state.focusWindow)
    const toggleMinimize = useWindowStore((state) => state.toggleMinimize)
    const toggleMaximize = useWindowStore((state) => state.toggleMaximize)
    const updateMultipleBounds = useWindowStore((state) => state.updateMultipleBounds)
    const { handlePointerDown, handlePointerMove, handlePointerUp, isDragging, restoreWindow } = useWindowManager({ id })
    const [isResizing, setIsResizing] = useState(false)
    const [snapPopoverOpen, setSnapPopoverOpen] = useState(false)
    const popoverTimerRef = useRef<number | null>(null)
    const windowRef = useRef<HTMLDivElement>(null)

    const handleMaximizeMouseEnter = () => {
        popoverTimerRef.current = window.setTimeout(() => {
            setSnapPopoverOpen(true)
        }, 250)
    }

    const handleMaximizeMouseLeave = () => {
        if (popoverTimerRef.current !== null) {
            clearTimeout(popoverTimerRef.current)
            popoverTimerRef.current = null
        }
    }

    useEffect(() => {
        if (!windowState) {
            return
        }

        const { isFocused, isMinimized } = windowState.state
        if (!isFocused || isMinimized) {
            return
        }

        const activeElement = document.activeElement
        const shouldKeepChildFocus = activeElement && windowRef.current?.contains(activeElement)
        if (shouldKeepChildFocus) {
            return
        }

        windowRef.current?.focus({ preventScroll: true })
    }, [windowState])

    useEffect(() => {
        if (!windowState?.state.isEntering) {
            return
        }

        let frameA = 0
        let frameB = 0
        frameA = requestAnimationFrame(() => {
            frameB = requestAnimationFrame(() => {
                completeWindowEnter(id)
            })
        })

        return () => {
            cancelAnimationFrame(frameA)
            cancelAnimationFrame(frameB)
        }
    }, [completeWindowEnter, id, windowState?.state.isEntering])

    if (!windowState) {
        return null
    }

    const { bounds, state } = windowState
    const { isEntering, isFocused, isMaximized, isMinimized } = state

    const startResize = (event: React.PointerEvent<HTMLDivElement>, direction: ResizeDirection) => {
        event.stopPropagation()
        focusWindow(id)
        setIsResizing(true)
        const startX = event.clientX
        const startY = event.clientY
        const resizeHandle = event.currentTarget
        resizeHandle.setPointerCapture(event.pointerId)

        const snapContext = getSnapContext()
        const workspace = getWorkspaceRect(snapContext)
        const initialWindows = useWindowStore.getState().windows

        let pendingEvent: PointerEvent | null = null
        let resizeRaf: number | null = null

        const handleMove = (moveEvent: PointerEvent) => {
            pendingEvent = moveEvent

            if (resizeRaf === null) {
                resizeRaf = requestAnimationFrame(() => {
                    resizeRaf = null
                    if (!pendingEvent) return

                    const deltaX = pendingEvent.clientX - startX
                    const deltaY = pendingEvent.clientY - startY

                    const updates = calculateTiledResize(
                        id,
                        direction,
                        deltaX,
                        deltaY,
                        initialWindows,
                        workspace,
                    )

                    if (Object.keys(updates).length > 0) {
                        updateMultipleBounds(updates)
                    }
                })
            }
        }

        const handleUp = (upEvent: PointerEvent) => {
            if (resizeRaf !== null) {
                cancelAnimationFrame(resizeRaf)
                resizeRaf = null
            }
            setIsResizing(false)
            if (resizeHandle.hasPointerCapture(upEvent.pointerId)) {
                try {
                    resizeHandle.releasePointerCapture(upEvent.pointerId)
                } catch {
                    // Ignore if already released
                }
            }
            window.removeEventListener('pointermove', handleMove)
            window.removeEventListener('pointerup', handleUp)
        }

        window.addEventListener('pointermove', handleMove)
        window.addEventListener('pointerup', handleUp)
    }

    const isTransforming = isDragging || isResizing

    return (
        <div
            ref={windowRef}
            role="dialog"
            aria-modal={false}
            aria-label={title}
            tabIndex={0}
            className={`pointer-events-auto absolute flex flex-col overflow-hidden border
                ${isTransforming ? 'os-window-dragging' : 'os-window-smooth-motion'}
                ${isMaximized ? 'rounded-none' : 'rounded-xl'}
                ${isMinimized ? 'pointer-events-none opacity-0 scale-[0.98]' : isEntering ? 'opacity-0 translate-y-2 scale-[0.985]' : isFocused ? 'brightness-100 opacity-100 translate-y-0 scale-100' : 'opacity-95 translate-y-0 scale-100'}
            `}
            style={{
                left: bounds.x,
                top: bounds.y,
                width: bounds.width,
                height: bounds.height,
                zIndex,
                visibility: isMinimized ? 'hidden' : 'visible',
                background: 'var(--ds-color-surface-0)',
                borderColor: 'var(--ds-color-border)',
                // The system's one reserved drop-shadow lives here, and only
                // on the focused window — every other surface stays flat.
                boxShadow: isFocused ? 'var(--ds-shadow-elevated)' : 'none',
                backdropFilter: `blur(var(--os-window-backdrop-blur))`,
            }}
            onPointerDown={() => focusWindow(id)}
            onFocusCapture={() => focusWindow(id)}
        >
            <div
                className="relative flex h-10 select-none items-center border-b border-hairline bg-[rgba(245,245,247,0.8)] px-3 backdrop-blur-frosted"
                style={{
                    cursor: isDragging ? 'grabbing' : isMaximized ? 'default' : 'grab',
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onDoubleClick={() => toggleMaximize(id)}
            >
                <div className="group/controls absolute left-1 flex items-center" data-drag-handle="false">
                    <button
                        onClick={(e) => { e.stopPropagation(); closeWindow(id) }}
                        className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-black/5 active:scale-95"
                        title="Close window"
                        aria-label="Close window"
                    >
                        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#e0443e] bg-[#ff5f56] text-[#4d0000]">
                            <X className="h-2 w-2 stroke-[2.5] opacity-70 transition-opacity group-hover/controls:opacity-100" />
                        </span>
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); toggleMinimize(id) }}
                        className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-black/5 active:scale-95"
                        title="Minimize window"
                        aria-label="Minimize window"
                    >
                        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#d89e24] bg-[#febc2e] text-[#5c3e00]">
                            <Minus className="h-2 w-2 stroke-[2.5] opacity-70 transition-opacity group-hover/controls:opacity-100" />
                        </span>
                    </button>
                    <button
                        onMouseEnter={handleMaximizeMouseEnter}
                        onMouseLeave={handleMaximizeMouseLeave}
                        onClick={(e) => {
                            e.stopPropagation()
                            setSnapPopoverOpen(false)
                            if (isMaximized) {
                                restoreWindow()
                                return
                            }

                            toggleMaximize(id)
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-black/5 active:scale-95"
                        title={isMaximized ? 'Restore window' : 'Maximize window (hover for snap layouts)'}
                        aria-label={isMaximized ? 'Restore window' : 'Maximize window'}
                    >
                        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#1aab29] bg-[#28c840] text-[#004d11]">
                            {isMaximized ? (
                                <Minimize2 className="h-2 w-2 stroke-[2.5] opacity-70 transition-opacity group-hover/controls:opacity-100" />
                            ) : (
                                <Maximize2 className="h-2 w-2 stroke-[2.5] opacity-70 transition-opacity group-hover/controls:opacity-100" />
                            )}
                        </span>
                    </button>

                    <SnapLayoutPopover
                        windowId={id}
                        isOpen={snapPopoverOpen}
                        onClose={() => setSnapPopoverOpen(false)}
                    />
                </div>

                <div className="pointer-events-none min-w-0 flex-1 truncate px-24 text-center text-sm font-semibold text-ink">
                    {title}
                </div>
            </div>

            <div className="relative flex-1 overflow-hidden bg-surface">
                {children}
                {isTransforming && (
                    <div className="absolute inset-0 z-30 select-none bg-transparent" />
                )}
            </div>

            {!isMaximized && (
                <>
                    {/* Edge resize handles */}
                    <div
                        className="absolute -top-1 left-3 right-3 h-2 cursor-ns-resize z-40"
                        data-drag-handle="false"
                        onPointerDown={(event) => startResize(event, 'n')}
                    />
                    <div
                        className="absolute -bottom-1 left-3 right-3 h-2 cursor-ns-resize z-40"
                        data-drag-handle="false"
                        onPointerDown={(event) => startResize(event, 's')}
                    />
                    <div
                        className="absolute -left-1 top-3 bottom-3 w-2 cursor-ew-resize z-40"
                        data-drag-handle="false"
                        onPointerDown={(event) => startResize(event, 'w')}
                    />
                    <div
                        className="absolute -right-1 top-3 bottom-3 w-2 cursor-ew-resize z-40"
                        data-drag-handle="false"
                        onPointerDown={(event) => startResize(event, 'e')}
                    />

                    {/* Corner resize handles */}
                    <div
                        className="absolute -top-1 -left-1 h-3.5 w-3.5 cursor-nwse-resize z-50"
                        data-drag-handle="false"
                        onPointerDown={(event) => startResize(event, 'nw')}
                    />
                    <div
                        className="absolute -top-1 -right-1 h-3.5 w-3.5 cursor-nesw-resize z-50"
                        data-drag-handle="false"
                        onPointerDown={(event) => startResize(event, 'ne')}
                    />
                    <div
                        className="absolute -bottom-1 -left-1 h-3.5 w-3.5 cursor-nesw-resize z-50"
                        data-drag-handle="false"
                        onPointerDown={(event) => startResize(event, 'sw')}
                    />
                    <div
                        className="absolute -bottom-1 -right-1 h-4 w-4 cursor-nwse-resize z-50"
                        data-drag-handle="false"
                        onPointerDown={(event) => startResize(event, 'se')}
                    >
                        <div className="pointer-events-none absolute bottom-1 right-1 h-2 w-2 rounded-br-[2px] border-b-2 border-r-2 border-ink-muted-48" />
                    </div>
                </>
            )}
        </div>
    )
}
