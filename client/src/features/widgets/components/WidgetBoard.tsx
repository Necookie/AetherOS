import { useState, useEffect } from 'react'
import { Layers, Minimize2, ChevronRight } from 'lucide-react'
import ClockWidget from './ClockWidget'
import SystemStatsWidget from './SystemStatsWidget'
import WeatherWidget from './WeatherWidget'

const WIDGETS_STORAGE_KEY = 'aetheros-widgets-collapsed'

interface WidgetBoardProps {
    isOpen?: boolean
    onToggle?: () => void
}

export default function WidgetBoard({ isOpen, onToggle }: WidgetBoardProps) {
    const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
        if (isOpen !== undefined) {
            return !isOpen
        }
        try {
            return localStorage.getItem(WIDGETS_STORAGE_KEY) === 'true'
        } catch {
            return false
        }
    })

    // Sync when external isOpen prop changes
    useEffect(() => {
        if (isOpen !== undefined) {
            setIsCollapsed(!isOpen)
        }
    }, [isOpen])

    const handleToggle = () => {
        const next = !isCollapsed
        setIsCollapsed(next)
        try {
            localStorage.setItem(WIDGETS_STORAGE_KEY, String(next))
        } catch {
            // ignore storage errors
        }
        onToggle?.()
    }

    if (isCollapsed) {
        return (
            <div className="pointer-events-auto absolute right-4 top-4 z-10 transition-all duration-300">
                <button
                    onClick={handleToggle}
                    className="flex items-center gap-2 rounded-pill border border-hairline/90 bg-canvas/80 px-3.5 py-1.5 text-ink shadow-md backdrop-blur-frosted transition-all hover:border-primary/40 hover:bg-canvas hover:shadow-lg active:scale-95"
                    aria-label="Open widget drawer"
                    title="Show widgets"
                >
                    <Layers className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-semibold">Widgets</span>
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/15 px-1 text-[10px] font-bold text-primary">
                        3
                    </span>
                    <ChevronRight className="h-3 w-3 text-ink-muted-48" />
                </button>
            </div>
        )
    }

    return (
        <aside
            className="pointer-events-auto absolute right-4 top-4 z-10 flex w-[min(22rem,calc(100vw-2rem))] flex-col rounded-2xl border border-hairline/90 bg-[rgba(245,245,247,0.72)] p-3 shadow-elevated backdrop-blur-2xl transition-all duration-300 md:right-5 md:w-[20.5rem]"
            aria-label="Desktop widgets drawer"
        >
            {/* Dedicated Widget Section Header */}
            <div className="mb-2.5 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Layers className="h-3.5 w-3.5" />
                    </div>
                    <div>
                        <h2 className="text-xs font-bold uppercase tracking-wider text-ink">Widgets</h2>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={handleToggle}
                        className="flex h-6 w-6 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-black/5 hover:text-ink active:scale-95"
                        aria-label="Collapse widgets"
                        title="Collapse widget section"
                    >
                        <Minimize2 className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            {/* Scrollable Widget Stack with Compact Spacing */}
            <div className="flex max-h-[calc(100vh-10rem)] flex-col gap-2.5 overflow-y-auto pr-0.5 scrollbar-thin">
                <ClockWidget />
                <WeatherWidget />
                <SystemStatsWidget />
            </div>

            {/* Footer indicator */}
            <div className="mt-2.5 flex items-center justify-between border-t border-hairline/60 px-1 pt-2 text-[10px] text-ink-muted-48">
                <span>Aether Glance</span>
                <button
                    onClick={handleToggle}
                    className="font-medium text-primary hover:underline"
                >
                    Hide
                </button>
            </div>
        </aside>
    )
}
