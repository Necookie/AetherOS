import React from 'react'
import { X, Minus, Square } from 'lucide-react'
import { useWindowStore } from '../../stores/windowStore'
import { useWindowManager } from '../../hooks/useWindowManager'

interface WindowProps {
    id: string
    title: string
    children: React.ReactNode
}

export default function Window({ id, title, children }: WindowProps) {
    const windowState = useWindowStore(state => state.windows[id])
    const zIndex = useWindowStore(state => state.getZIndex(id))

    // Actions
    const closeWindow = useWindowStore(state => state.closeWindow)
    const focusWindow = useWindowStore(state => state.focusWindow)
    const toggleMinimize = useWindowStore(state => state.toggleMinimize)
    const toggleMaximize = useWindowStore(state => state.toggleMaximize)
    const updateBounds = useWindowStore(state => state.updateBounds)

    const { handlePointerDown, handlePointerMove, handlePointerUp } = useWindowManager({ id })

    if (!windowState || windowState.state.isMinimized) {
        return null
    }

    const { bounds, state } = windowState
    const { isMaximized, isFocused } = state

    return (
        <div
            className={`absolute flex flex-col overflow-hidden transition-all duration-150 ease-out
                ${isMaximized ? 'rounded-none' : 'rounded-2xl'}
                ${isFocused ? 'shadow-2xl border-white/80 brightness-105' : 'shadow-lg border-white/40 opacity-95'}
                bg-white/40 backdrop-blur-md border border-white/60
            `}
            style={{
                left: bounds.x,
                top: bounds.y,
                width: bounds.width,
                height: bounds.height,
                zIndex,
                visibility: state.isMinimized ? 'hidden' : 'visible',
            }}
            onPointerDown={() => focusWindow(id)}
        >
            {/* Title Bar */}
            <div
                className="h-10 bg-white/40 backdrop-blur-md flex items-center justify-between px-3 select-none border-b border-white/30"
                style={{ cursor: isMaximized ? 'default' : 'grab' }}
                onPointerDown={isMaximized ? undefined : handlePointerDown}
                onPointerMove={isMaximized ? undefined : handlePointerMove}
                onPointerUp={isMaximized ? undefined : handlePointerUp}
                onPointerCancel={isMaximized ? undefined : handlePointerUp}
                onDoubleClick={() => toggleMaximize(id)}
            >
                {/* Left: App Icon Placeholder */}
                <div className="flex-shrink-0 w-4 h-4 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 shadow-sm ml-1" />

                {/* Center: Title */}
                <div className="flex-1 text-center font-semibold text-xs text-gray-800 pointer-events-none truncate px-4">
                    {title}
                </div>

                {/* Right: Controls */}
                <div className="flex space-x-1 flex-shrink-0" data-drag-handle="false">
                    <button
                        onClick={(e) => { e.stopPropagation(); toggleMinimize(id); }}
                        className="p-1.5 hover:bg-black/10 rounded-full text-gray-700 transition-all hover:scale-110 active:scale-95"
                    >
                        <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); toggleMaximize(id); }}
                        className="p-1.5 hover:bg-black/10 rounded-full text-gray-700 transition-all hover:scale-110 active:scale-95"
                    >
                        <Square className="w-3 h-3" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); closeWindow(id); }}
                        className="p-1.5 hover:bg-red-500 hover:text-white rounded-full text-gray-700 transition-all hover:scale-110 active:scale-95"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto bg-gray-50/60 relative">
                {/* Prevent pointer events on iframe/content while scrolling/dragging if needed, handled by pointer capture usually */}
                {children}
            </div>

            {/* Resize Handle (Bottom Right) */}
            {!isMaximized && (
                <div
                    className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-50"
                    data-drag-handle="false"
                    onPointerDown={(e) => {
                        e.stopPropagation();
                        // Handle resize logic...
                        focusWindow(id);

                        const startX = e.clientX;
                        const startY = e.clientY;
                        const startW = bounds.width;
                        const startH = bounds.height;

                        const onMove = (moveEvent: PointerEvent) => {
                            const newW = Math.max(320, startW + (moveEvent.clientX - startX));
                            const newH = Math.max(200, startH + (moveEvent.clientY - startY));
                            updateBounds(id, { width: newW, height: newH });
                        };

                        const onUp = () => {
                            window.removeEventListener('pointermove', onMove);
                            window.removeEventListener('pointerup', onUp);
                        };

                        window.addEventListener('pointermove', onMove);
                        window.addEventListener('pointerup', onUp);
                    }}
                >
                    <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-gray-400/50 rounded-br-[2px]" />
                </div>
            )}
        </div>
    )
}
