import React, { useEffect, useRef } from 'react'
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
                background: 'linear-gradient(180deg, color-mix(in oklab, var(--os-surface-0) 86%, white 14%), color-mix(in oklab, var(--os-surface-1) 82%, transparent 18%))',
                borderColor: 'color-mix(in oklab, var(--os-border) 65%, white 35%)',
                boxShadow: isFocused ? '0 30px 56px rgb(15 23 42 / 0.30)' : '0 14px 30px rgb(15 23 42 / 0.20)',
                backdropFilter: `blur(var(--os-window-backdrop-blur))`,
            }}
            onPointerDown={() => focusWindow(id)}
            onFocusCapture={() => focusWindow(id)}
        >
            <div
                className="flex h-10 select-none items-center justify-between border-b px-3"
                style={{
                    borderColor: 'color-mix(in oklab, var(--os-border) 60%, white 40%)',
                    cursor: isMaximized ? 'default' : 'grab',
                }}
                onPointerDown={isMaximized ? undefined : handlePointerDown}
                onPointerMove={isMaximized ? undefined : handlePointerMove}
                onPointerUp={isMaximized ? undefined : handlePointerUp}
                onPointerCancel={isMaximized ? undefined : handlePointerUp}
                onDoubleClick={() => toggleMaximize(id)}
            >
                <div className="flex items-center gap-2 pl-0.5" data-drag-handle="false">
                    <button
                        onClick={(e) => { e.stopPropagation(); closeWindow(id) }}
                        className="os-hover-motion h-3 w-3 rounded-full border border-red-400/30 bg-[#ff5f57] transition-opacity hover:opacity-100"
                        title="Close window"
                        aria-label="Close window"
                    />
                    <button
                        onClick={(e) => { e.stopPropagation(); toggleMinimize(id) }}
                        className="os-hover-motion h-3 w-3 rounded-full border border-amber-400/30 bg-[#febc2e] transition-opacity hover:opacity-100"
                        title="Minimize window"
                        aria-label="Minimize window"
                    />
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            if (isMaximized) {
                                restoreWindow()
                                return
                            }

                            toggleMaximize(id)
                        }}
                        className="os-hover-motion h-3 w-3 rounded-full border border-emerald-400/30 bg-[#28c840] transition-opacity hover:opacity-100"
                        title={isMaximized ? 'Restore window' : 'Maximize window'}
                        aria-label={isMaximized ? 'Restore window' : 'Maximize window'}
                    />
                </div>

                <div className="pointer-events-none flex-1 truncate px-4 text-center text-[13px] font-medium text-[var(--os-text-0)]">
                    {title}
                </div>

                <div className="w-[52px]" />
            </div>

            <div
                className="relative flex-1 overflow-hidden"
                style={{ background: 'color-mix(in oklab, var(--os-surface-0) 82%, var(--os-bg-1) 18%)' }}
            >
                {children}
            </div>

            {!isMaximized && (
                <div
                    className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize z-50"
                    data-drag-handle="false"
                    onPointerDown={(event) => startResize(event, 'xy')}
                >
                    <div className="absolute bottom-1 right-1 h-2 w-2 rounded-br-[2px] border-b-2 border-r-2 border-slate-500/50" />
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
