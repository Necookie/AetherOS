import React, { useEffect, useRef } from 'react'
import { Maximize2, Minimize2, Minus, X } from 'lucide-react'
import { selectWindowById, selectWindowZIndex } from '../../features/window-manager/selectors'
import { useWindowManager } from '../../hooks/useWindowManager'
import { useWindowStore } from '../../stores/windowStore'

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
    const updateBounds = useWindowStore((state) => state.updateBounds)
    const { handlePointerDown, handlePointerMove, handlePointerUp, restoreWindow } = useWindowManager({ id })
    const windowRef = useRef<HTMLDivElement>(null)

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

    const startResize = (event: React.PointerEvent<HTMLDivElement>, axis: 'x' | 'y' | 'xy') => {
        event.stopPropagation()
        focusWindow(id)
        const initialBounds = bounds
        const startX = event.clientX
        const startY = event.clientY
        const resizeHandle = event.currentTarget
        resizeHandle.setPointerCapture(event.pointerId)

        const handleMove = (moveEvent: PointerEvent) => {
            const width = Math.max(320, initialBounds.width + (moveEvent.clientX - startX))
            const height = Math.max(220, initialBounds.height + (moveEvent.clientY - startY))
            updateBounds(id, {
                ...(axis === 'x' || axis === 'xy' ? { width } : {}),
                ...(axis === 'y' || axis === 'xy' ? { height } : {}),
            })
        }

        const handleUp = (upEvent: PointerEvent) => {
            if (resizeHandle.hasPointerCapture(upEvent.pointerId)) {
                resizeHandle.releasePointerCapture(upEvent.pointerId)
            }
            window.removeEventListener('pointermove', handleMove)
            window.removeEventListener('pointerup', handleUp)
        }

        window.addEventListener('pointermove', handleMove)
        window.addEventListener('pointerup', handleUp)
    }

    return (
        <div
            ref={windowRef}
            role="dialog"
            aria-modal={false}
            aria-label={title}
            tabIndex={0}
            className={`pointer-events-auto os-window-motion absolute flex flex-col overflow-hidden border transition-[left,top,width,height,opacity,transform]
                ${isMaximized ? 'rounded-none' : 'rounded-lg'}
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
                className="flex h-10 select-none items-center justify-between border-b border-hairline bg-[rgba(245,245,247,0.8)] px-3 backdrop-blur-frosted"
                style={{
                    cursor: isMaximized ? 'default' : 'grab',
                }}
                onPointerDown={isMaximized ? undefined : handlePointerDown}
                onPointerMove={isMaximized ? undefined : handlePointerMove}
                onPointerUp={isMaximized ? undefined : handlePointerUp}
                onPointerCancel={isMaximized ? undefined : handlePointerUp}
                onDoubleClick={() => toggleMaximize(id)}
            >
                <div className="group/controls flex items-center gap-2 pl-0.5" data-drag-handle="false">
                    <button
                        onClick={(e) => { e.stopPropagation(); closeWindow(id) }}
                        className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#ff5f56] border border-[#e0443e] text-[#4d0000] transition-transform active:scale-90 hover:opacity-90 focus:outline-none"
                        title="Close window"
                        aria-label="Close window"
                    >
                        <X className="h-2 w-2 stroke-[2.5] opacity-70 group-hover/controls:opacity-100 transition-opacity" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); toggleMinimize(id) }}
                        className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#febc2e] border border-[#d89e24] text-[#5c3e00] transition-transform active:scale-90 hover:opacity-90 focus:outline-none"
                        title="Minimize window"
                        aria-label="Minimize window"
                    >
                        <Minus className="h-2 w-2 stroke-[2.5] opacity-70 group-hover/controls:opacity-100 transition-opacity" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            if (isMaximized) {
                                restoreWindow()
                                return
                            }

                            toggleMaximize(id)
                        }}
                        className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#28c840] border border-[#1aab29] text-[#004d11] transition-transform active:scale-90 hover:opacity-90 focus:outline-none"
                        title={isMaximized ? 'Restore window' : 'Maximize window'}
                        aria-label={isMaximized ? 'Restore window' : 'Maximize window'}
                    >
                        {isMaximized ? (
                            <Minimize2 className="h-2 w-2 stroke-[2.5] opacity-70 group-hover/controls:opacity-100 transition-opacity" />
                        ) : (
                            <Maximize2 className="h-2 w-2 stroke-[2.5] opacity-70 group-hover/controls:opacity-100 transition-opacity" />
                        )}
                    </button>
                </div>

                <div className="pointer-events-none flex-1 truncate px-4 text-center text-sm font-semibold text-ink">
                    {title}
                </div>

                <div className="w-[52px]" />
            </div>

            <div className="relative flex-1 overflow-hidden bg-surface">
                {children}
            </div>

            {!isMaximized && (
                <div
                    className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize z-50"
                    data-drag-handle="false"
                    onPointerDown={(event) => startResize(event, 'xy')}
                >
                    <div className="absolute bottom-1 right-1 h-2 w-2 rounded-br-[2px] border-b-2 border-r-2 border-ink-muted-48" />
                </div>
            )}

            {!isMaximized && (
                <div
                    className="absolute right-0 top-10 z-40 h-[calc(100%-2.5rem)] w-2 cursor-ew-resize"
                    data-drag-handle="false"
                    onPointerDown={(event) => startResize(event, 'x')}
                />
            )}

            {!isMaximized && (
                <div
                    className="absolute bottom-0 left-0 z-40 h-2 w-full cursor-ns-resize"
                    data-drag-handle="false"
                    onPointerDown={(event) => startResize(event, 'y')}
                />
            )}
        </div>
    )
}
