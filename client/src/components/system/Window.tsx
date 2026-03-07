import React from 'react'
import { getResizedWindowBounds } from '../../features/window-manager/dragBounds'
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
    const focusWindow = useWindowStore((state) => state.focusWindow)
    const toggleMinimize = useWindowStore((state) => state.toggleMinimize)
    const toggleMaximize = useWindowStore((state) => state.toggleMaximize)
    const updateBounds = useWindowStore((state) => state.updateBounds)
    const { handlePointerDown, handlePointerMove, handlePointerUp } = useWindowManager({ id })

    if (!windowState || windowState.state.isMinimized) {
        return null
    }

    const { bounds, state } = windowState
    const { isFocused, isMaximized } = state
    const RESIZE_EDGE_GUTTER = 14
    const RESIZE_STEP = 26

    return (
        <div
            className={`animate-os-window-in os-window-motion absolute flex flex-col overflow-hidden border transition-[left,top,width,height,opacity,transform]
                ${isMaximized ? 'rounded-none' : 'rounded-lg'}
                ${isFocused ? 'brightness-100' : 'opacity-95'}
            `}
            style={{
                left: bounds.x,
                top: bounds.y,
                width: bounds.width,
                height: bounds.height,
                zIndex,
                visibility: state.isMinimized ? 'hidden' : 'visible',
                background: 'color-mix(in oklab, var(--os-surface-0) 94%, black 6%)',
                borderColor: 'color-mix(in oklab, var(--os-border) 70%, black 30%)',
                boxShadow: isFocused ? '0 24px 56px rgba(2, 6, 23, 0.62)' : '0 10px 28px rgba(2, 6, 23, 0.35)',
            }}
            onPointerDown={() => focusWindow(id)}
            onWheel={(e) => {
                if (isMaximized) {
                    return
                }

                const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
                const nearRight = rect.right - e.clientX <= RESIZE_EDGE_GUTTER
                const nearBottom = rect.bottom - e.clientY <= RESIZE_EDGE_GUTTER

                if (!nearRight && !nearBottom) {
                    return
                }

                e.preventDefault()
                focusWindow(id)

                const delta = Math.sign(Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX)
                if (delta === 0) {
                    return
                }

                const step = delta * RESIZE_STEP
                updateBounds(id, {
                    ...(nearRight ? { width: Math.max(320, bounds.width + step) } : {}),
                    ...(nearBottom ? { height: Math.max(200, bounds.height + step) } : {}),
                })
            }}
        >
            <div
                className="flex h-10 select-none items-center justify-between border-b px-3"
                style={{
                    borderColor: 'color-mix(in oklab, var(--os-border) 65%, black 35%)',
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
                        className="os-hover-motion h-3 w-3 rounded-full bg-[var(--os-danger)]/90 transition-opacity hover:opacity-100"
                        title="Close"
                    />
                    <button
                        onClick={(e) => { e.stopPropagation(); toggleMinimize(id) }}
                        className="os-hover-motion h-3 w-3 rounded-full bg-[var(--os-warn)]/90 transition-opacity hover:opacity-100"
                        title="Minimize"
                    />
                    <button
                        onClick={(e) => { e.stopPropagation(); toggleMaximize(id) }}
                        className="os-hover-motion h-3 w-3 rounded-full bg-[var(--os-success)]/90 transition-opacity hover:opacity-100"
                        title="Maximize"
                    />
                </div>

                <div className="pointer-events-none flex-1 truncate px-4 text-center text-[13px] font-medium text-slate-100">
                    {title}
                </div>

                <div className="w-[52px]" />
            </div>

            <div
                className="relative flex-1 overflow-auto"
                style={{ background: 'color-mix(in oklab, var(--os-surface-0) 88%, black 12%)' }}
            >
                {children}
            </div>

            {!isMaximized && (
                <div
                    className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-50"
                    data-drag-handle="false"
                    onPointerDown={(e) => {
                        e.stopPropagation()
                        focusWindow(id)

                        const startX = e.clientX
                        const startY = e.clientY

                        const onMove = (moveEvent: PointerEvent) => {
                            updateBounds(id, getResizedWindowBounds(bounds, {
                                startX,
                                startY,
                                currentX: moveEvent.clientX,
                                currentY: moveEvent.clientY,
                            }))
                        }

                        const onUp = () => {
                            window.removeEventListener('pointermove', onMove)
                            window.removeEventListener('pointerup', onUp)
                        }

                        window.addEventListener('pointermove', onMove)
                        window.addEventListener('pointerup', onUp)
                    }}
                >
                    <div className="absolute bottom-1 right-1 h-2 w-2 rounded-br-[2px] border-b-2 border-r-2 border-slate-500/70" />
                </div>
            )}
        </div>
    )
}
