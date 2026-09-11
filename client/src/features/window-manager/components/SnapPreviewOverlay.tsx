import { memo, useEffect, useState } from 'react'
import type { SnapPreview } from '../types'
import {
    Columns,
    LayoutGrid,
    Maximize2,
} from 'lucide-react'

interface SnapPreviewOverlayProps {
    preview: SnapPreview | null
}

const MODE_LABELS: Record<string, { label: string; icon: typeof Columns }> = {
    'left-half': { label: 'Tile Left (50%)', icon: Columns },
    'right-half': { label: 'Tile Right (50%)', icon: Columns },
    'maximize': { label: 'Maximize (100%)', icon: Maximize2 },
    'top-left': { label: 'Top Left (25%)', icon: LayoutGrid },
    'top-right': { label: 'Top Right (25%)', icon: LayoutGrid },
    'bottom-left': { label: 'Bottom Left (25%)', icon: LayoutGrid },
    'bottom-right': { label: 'Bottom Right (25%)', icon: LayoutGrid },
}

export const SnapPreviewOverlay = memo(function SnapPreviewOverlay({ preview }: SnapPreviewOverlayProps) {
    const [renderedPreview, setRenderedPreview] = useState<SnapPreview | null>(preview)
    const [isVisible, setIsVisible] = useState(Boolean(preview))

    useEffect(() => {
        if (preview) {
            setRenderedPreview(preview)
            setIsVisible(true)
        } else {
            setIsVisible(false)
            const timer = setTimeout(() => {
                setRenderedPreview(null)
            }, 220)
            return () => clearTimeout(timer)
        }
    }, [preview])

    if (!renderedPreview) {
        return null
    }

    const modeInfo = MODE_LABELS[renderedPreview.region.mode] ?? { label: 'Tile', icon: Columns }
    const Icon = modeInfo.icon

    return (
        <div
            className="pointer-events-none fixed z-[9999] transition-[left,top,width,height,opacity,transform] duration-200 ease-out"
            style={{
                left: renderedPreview.region.bounds.x,
                top: renderedPreview.region.bounds.y,
                width: renderedPreview.region.bounds.width,
                height: renderedPreview.region.bounds.height,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'scale(1)' : 'scale(0.98)',
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
        >
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-primary/70 bg-[rgba(0,102,204,0.12)] shadow-[0_0_50px_rgba(0,102,204,0.3),inset_0_0_24px_rgba(0,102,204,0.15)] backdrop-blur-md">
                {/* Subtle glass reflection highlight */}
                <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

                {/* Center visual layout badge */}
                <div className="flex items-center gap-2 rounded-full border border-primary/40 bg-surface/85 px-4 py-2 text-xs font-semibold text-ink shadow-elevated backdrop-blur-xl animate-in fade-in zoom-in-90 duration-150">
                    <Icon className="h-4 w-4 text-primary animate-pulse" />
                    <span>{modeInfo.label}</span>
                </div>
            </div>
        </div>
    )
})
