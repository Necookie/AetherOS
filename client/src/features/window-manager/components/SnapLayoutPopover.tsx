import { memo } from 'react'
import type { SnapMode } from '../../../types/windowManager'
import { useWindowStore } from '../../../stores/windowStore'

interface SnapLayoutPopoverProps {
    windowId: string
    isOpen: boolean
    onClose: () => void
}

export const SnapLayoutPopover = memo(function SnapLayoutPopover({
    windowId,
    isOpen,
    onClose,
}: SnapLayoutPopoverProps) {
    const snapWindow = useWindowStore((state) => state.snapWindow)
    const toggleMaximize = useWindowStore((state) => state.toggleMaximize)
    const windowState = useWindowStore((state) => state.windows[windowId])

    if (!isOpen) return null

    const handleTile = (mode: SnapMode) => {
        onClose()
        if (mode === 'maximize') {
            if (!windowState?.state.isMaximized) {
                toggleMaximize(windowId)
            }
        } else {
            snapWindow(windowId, mode)
        }
    }

    return (
        <div
            className="absolute left-0 top-7 z-[9999] w-64 rounded-xl border border-hairline bg-surface/95 p-3 text-ink shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-100"
            onMouseLeave={onClose}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Snap layouts"
        >
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
                Snap Layouts
            </p>

            <div className="grid grid-cols-3 gap-2">
                {/* 1. Full Maximize Layout */}
                <button
                    onClick={() => handleTile('maximize')}
                    className="group flex flex-col items-center gap-1.5 rounded-lg border border-hairline bg-tile-1 p-2 transition-all hover:border-primary hover:bg-tile-2 focus:outline-none"
                    title="Maximize window"
                >
                    <div className="flex h-10 w-full rounded border border-hairline/80 bg-surface group-hover:border-primary/60 group-hover:bg-primary/10 transition-colors" />
                    <span className="text-[10px] font-medium text-muted group-hover:text-ink">Full</span>
                </button>

                {/* 2. Side-by-Side 50/50 Layout */}
                <div className="flex flex-col items-center gap-1.5 rounded-lg border border-hairline bg-tile-1 p-2">
                    <div className="flex h-10 w-full gap-1">
                        <button
                            onClick={() => handleTile('left-half')}
                            className="h-full flex-1 rounded border border-hairline/80 bg-surface hover:border-primary hover:bg-primary/20 transition-all focus:outline-none"
                            title="Snap left 50%"
                        />
                        <button
                            onClick={() => handleTile('right-half')}
                            className="h-full flex-1 rounded border border-hairline/80 bg-surface hover:border-primary hover:bg-primary/20 transition-all focus:outline-none"
                            title="Snap right 50%"
                        />
                    </div>
                    <span className="text-[10px] font-medium text-muted">Split 50/50</span>
                </div>

                {/* 3. Four Corners 25% Layout */}
                <div className="flex flex-col items-center gap-1.5 rounded-lg border border-hairline bg-tile-1 p-2">
                    <div className="grid h-10 w-full grid-cols-2 gap-1">
                        <button
                            onClick={() => handleTile('top-left')}
                            className="rounded border border-hairline/80 bg-surface hover:border-primary hover:bg-primary/20 transition-all focus:outline-none"
                            title="Snap top-left quarter"
                        />
                        <button
                            onClick={() => handleTile('top-right')}
                            className="rounded border border-hairline/80 bg-surface hover:border-primary hover:bg-primary/20 transition-all focus:outline-none"
                            title="Snap top-right quarter"
                        />
                        <button
                            onClick={() => handleTile('bottom-left')}
                            className="rounded border border-hairline/80 bg-surface hover:border-primary hover:bg-primary/20 transition-all focus:outline-none"
                            title="Snap bottom-left quarter"
                        />
                        <button
                            onClick={() => handleTile('bottom-right')}
                            className="rounded border border-hairline/80 bg-surface hover:border-primary hover:bg-primary/20 transition-all focus:outline-none"
                            title="Snap bottom-right quarter"
                        />
                    </div>
                    <span className="text-[10px] font-medium text-muted">Quarters</span>
                </div>
            </div>
        </div>
    )
})
