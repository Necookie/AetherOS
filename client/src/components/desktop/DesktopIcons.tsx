import { DESKTOP_ICONS } from '../../config/desktop'
import { Folder, Monitor, Settings } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType, type KeyboardEvent, type MouseEvent } from 'react'
import { shallow } from 'zustand/shallow'
import { DEFAULT_APPS } from '../../config/windows'
import { useWindowStore } from '../../stores/windowStore'
import { createSelectionRect, rectFromDomRect, rectIntersects, resolveClickSelection, resolveMarqueeSelection, type MarqueeSelectionMode, type SelectionRect } from '../../features/selection'

const DESKTOP_ICON_ASSETS: Record<string, string> = {
    pc: '/assets/candy-icons/pc.svg',
    settings: '/assets/candy-icons/settings.svg',
}

const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
    pc: Monitor,
    settings: Settings,
}

export default function DesktopIcons({ iconScale = 1 }: { iconScale?: number }) {
    const { windows, openWindow, restoreWindow, focusWindow } = useWindowStore((state) => ({
        windows: state.windows,
        openWindow: state.openWindow,
        restoreWindow: state.restoreWindow,
        focusWindow: state.focusWindow,
    }), shallow)
    const containerRef = useRef<HTMLDivElement>(null)
    const dragRef = useRef<{
        startX: number;
        startY: number;
        mode: MarqueeSelectionMode;
        baseSelection: string[];
    } | null>(null)
    const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(null)
    const [selectedIconIds, setSelectedIconIds] = useState<string[]>([])
    const [selectionAnchorId, setSelectionAnchorId] = useState<string | null>(null)

    const appLookup = useMemo(() => new Map(DEFAULT_APPS.map((app) => [app.id, app])), [])

    const launchFromIcon = useCallback((iconId: string) => {
        const icon = DESKTOP_ICONS.find((entry) => entry.id === iconId)
        const appId = icon?.appId
        if (!appId) {
            return
        }

        const app = appLookup.get(appId)
        if (!app) {
            return
        }

        const windowData = windows[appId]
        if (!windowData) {
            openWindow(app)
            return
        }

        if (windowData.state.isMinimized) {
            restoreWindow(appId)
            return
        }

        focusWindow(appId)
    }, [appLookup, focusWindow, openWindow, restoreWindow, windows])

    const selectIcon = useCallback((event: MouseEvent<HTMLButtonElement>, iconId: string) => {
        event.stopPropagation()
        const nextSelection = resolveClickSelection({
            currentSelection: selectedIconIds,
            orderedIds: DESKTOP_ICONS.map((desktopIcon) => desktopIcon.id),
            clickedId: iconId,
            anchorId: selectionAnchorId,
            multi: event.ctrlKey || event.metaKey,
            range: event.shiftKey,
        })
        setSelectedIconIds(nextSelection.selectedIds)
        setSelectionAnchorId(nextSelection.anchorId)
        return nextSelection.selectedIds
    }, [selectedIconIds, selectionAnchorId])

    const handleIconKeyDown = useCallback((event: KeyboardEvent<HTMLButtonElement>, iconId: string) => {
        if (event.key !== 'Enter' && event.key !== ' ') {
            return
        }

        event.preventDefault()
        event.stopPropagation()
        setSelectedIconIds([iconId])
        setSelectionAnchorId(iconId)
        launchFromIcon(iconId)
    }, [launchFromIcon])

    const updateMarqueeSelection = useCallback((nextRect: SelectionRect) => {
        const container = containerRef.current
        const dragState = dragRef.current
        if (!container || !dragState) {
            return
        }

        const hitIds: string[] = []
        container.querySelectorAll<HTMLElement>('[data-selectable-id]').forEach((element) => {
            const selectableId = element.dataset.selectableId
            if (!selectableId) {
                return
            }

            if (rectIntersects(nextRect, rectFromDomRect(element.getBoundingClientRect()))) {
                hitIds.push(selectableId)
            }
        })

        setSelectedIconIds(resolveMarqueeSelection({
            currentSelection: dragState.baseSelection,
            hitIds,
            mode: dragState.mode,
        }))
    }, [])

    const handleMouseMove = useCallback((event: globalThis.MouseEvent) => {
        const dragState = dragRef.current
        if (!dragState) {
            return
        }

        const nextRect = createSelectionRect(dragState.startX, dragState.startY, event.clientX, event.clientY)
        setSelectionRect(nextRect)
        updateMarqueeSelection(nextRect)
    }, [updateMarqueeSelection])

    const endDrag = useCallback(() => {
        dragRef.current = null
        setSelectionRect(null)
        window.removeEventListener('mousemove', handleMouseMove)
    }, [handleMouseMove])

    const handleMouseUp = useCallback(() => {
        window.removeEventListener('mouseup', handleMouseUp)
        endDrag()
    }, [endDrag])

    useEffect(() => {
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [handleMouseMove, handleMouseUp])

    const handleContainerMouseDown = (event: MouseEvent<HTMLDivElement>) => {
        if (event.button !== 0) {
            return
        }

        const target = event.target as HTMLElement
        if (target.closest('[data-selectable-id]')) {
            return
        }

        const mode: MarqueeSelectionMode = event.ctrlKey || event.metaKey
            ? (event.shiftKey ? 'toggle' : 'subtract')
            : (event.shiftKey ? 'add' : 'replace')

        dragRef.current = {
            startX: event.clientX,
            startY: event.clientY,
            mode,
            baseSelection: [...selectedIconIds],
        }

        const startRect = createSelectionRect(event.clientX, event.clientY, event.clientX, event.clientY)
        setSelectionRect(startRect)
        updateMarqueeSelection(startRect)
        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)
    }

    const handleContainerClick = (event: MouseEvent<HTMLDivElement>) => {
        if (dragRef.current) {
            return
        }

        const target = event.target as HTMLElement
        if (!target.closest('[data-selectable-id]') && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
            setSelectedIconIds([])
            setSelectionAnchorId(null)
        }
    }

    return (
        <div
            ref={containerRef}
            onMouseDown={handleContainerMouseDown}
            onClick={handleContainerClick}
            className="absolute left-3 top-2 z-20 grid grid-cols-1 gap-2 sm:left-5 sm:top-5 sm:gap-3"
            style={{ transform: `scale(${iconScale})`, transformOrigin: 'top left' }}
        >
            {DESKTOP_ICONS.map(icon => (
                <button
                    key={icon.id}
                    data-selectable-id={icon.id}
                    onClick={(event) => {
                        selectIcon(event, icon.id)
                    }}
                    onDoubleClick={(event) => {
                        event.stopPropagation()
                        setSelectedIconIds([icon.id])
                        setSelectionAnchorId(icon.id)
                        launchFromIcon(icon.id)
                    }}
                    onKeyDown={(event) => handleIconKeyDown(event, icon.id)}
                    className={`group flex w-20 flex-col items-center rounded-lg p-2 transition-colors sm:w-24 ${selectedIconIds.includes(icon.id) ? 'bg-white/45 outline outline-1 outline-white/80' : 'hover:bg-white/35'}`}
                    aria-label={`Open ${icon.label}`}
                >
                    {(() => {
                        const iconSrc = DESKTOP_ICON_ASSETS[icon.id]
                        const Icon = ICON_MAP[icon.id] ?? Folder
                        return (
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/70 bg-white/58 text-slate-800 shadow-lg">
                                {iconSrc
                                    ? <img src={iconSrc} alt="" aria-hidden className="h-9 w-9" />
                                    : <Icon className="h-6 w-6" />}
                            </div>
                        )
                    })()}
                    <span className="mt-1.5 text-center text-[11px] font-medium text-slate-900 sm:text-[12px]">
                        {icon.label}
                    </span>
                </button>
            ))}
            {selectionRect && (
                <div
                    aria-hidden
                    className="pointer-events-none fixed z-30 border border-white/80 bg-white/20"
                    style={{
                        left: selectionRect.left,
                        top: selectionRect.top,
                        width: selectionRect.right - selectionRect.left,
                        height: selectionRect.bottom - selectionRect.top,
                    }}
                />
            )}
        </div>
    )
}
