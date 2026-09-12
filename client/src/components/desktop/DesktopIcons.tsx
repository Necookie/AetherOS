import { DESKTOP_ICONS } from '../../config/desktop'
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react'
import { shallow } from 'zustand/shallow'
import { DEFAULT_APPS } from '../../config/windows'
import { useWindowStore } from '../../stores/windowStore'
import {
    createSelectionRect,
    rectFromDomRect,
    rectIntersects,
    resolveClickSelection,
    resolveMarqueeSelection,
    type MarqueeSelectionMode,
    type SelectionRect,
} from '../../features/selection'
import { fsService } from '../../vfs/vfsService'
import { VfsNodeType, type VfsNode } from '../../vfs/types'
import { useFsStore } from '../../stores/fsStore'
import { ShellAppIcon } from '../../features/shell/model/appIcons'

const DESKTOP_PATH = '/home/user/Desktop'

interface DesktopIconsProps {
    iconScale?: number
    refreshKey?: number
    labelTone?: 'light' | 'dark'
}

interface DesktopItem {
    id: string
    label: string
    isVfs: boolean
    node?: VfsNode
    appId?: string
}

export default function DesktopIcons({ iconScale = 1, refreshKey = 0, labelTone = 'dark' }: DesktopIconsProps) {
    const { windows, openWindow, restoreWindow, focusWindow } = useWindowStore(
        (state) => ({
            windows: state.windows,
            openWindow: state.openWindow,
            restoreWindow: state.restoreWindow,
            focusWindow: state.focusWindow,
        }),
        shallow,
    )
    const fsStoreRefreshTrigger = useFsStore((state) => state.items)
    const containerRef = useRef<HTMLDivElement>(null)
    const dragRef = useRef<{
        startX: number
        startY: number
        mode: MarqueeSelectionMode
        baseSelection: string[]
    } | null>(null)
    const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(null)
    const [selectedIconIds, setSelectedIconIds] = useState<string[]>([])
    const [selectionAnchorId, setSelectionAnchorId] = useState<string | null>(null)
    const [desktopNodes, setDesktopNodes] = useState<VfsNode[]>([])

    const appLookup = useMemo(() => new Map(DEFAULT_APPS.map((app) => [app.id, app])), [])

    // Load nodes from /home/user/Desktop
    useEffect(() => {
        try {
            const nodes = fsService.readDir(DESKTOP_PATH)
            setDesktopNodes(nodes)
        } catch {
            setDesktopNodes([])
        }
    }, [refreshKey, fsStoreRefreshTrigger])

    const allItems = useMemo<DesktopItem[]>(() => {
        const staticItems: DesktopItem[] = DESKTOP_ICONS.map((icon) => ({
            id: icon.id,
            label: icon.label,
            isVfs: false,
            appId: icon.appId,
        }))

        const dynamicItems: DesktopItem[] = desktopNodes.map((node) => ({
            id: `vfs-${node.id}`,
            label: node.name,
            isVfs: true,
            node,
        }))

        return [...staticItems, ...dynamicItems]
    }, [desktopNodes])

    const launchItem = useCallback(
        (item: DesktopItem) => {
            if (!item.isVfs) {
                const appId = item.appId
                if (!appId) return
                const app = appLookup.get(appId)
                if (!app) return

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
                return
            }

            // Dynamic VFS Node
            if (!item.node) return

            if (item.node.type === VfsNodeType.DIR) {
                // Open File Explorer to this folder
                useFsStore.getState().navigate(`${DESKTOP_PATH}/${item.node.name}`)
                const explorerApp = appLookup.get('explorer')
                if (explorerApp) {
                    const windowData = windows.explorer
                    if (!windowData) {
                        openWindow(explorerApp)
                    } else if (windowData.state.isMinimized) {
                        restoreWindow('explorer')
                    } else {
                        focusWindow('explorer')
                    }
                }
            } else {
                // Open text files in Notes
                const notesApp = appLookup.get('notes')
                if (notesApp) {
                    const windowData = windows.notes
                    if (!windowData) {
                        openWindow(notesApp)
                    } else if (windowData.state.isMinimized) {
                        restoreWindow('notes')
                    } else {
                        focusWindow('notes')
                    }
                }
            }
        },
        [appLookup, focusWindow, openWindow, restoreWindow, windows],
    )

    const selectIcon = useCallback(
        (event: MouseEvent<HTMLButtonElement>, itemId: string) => {
            event.stopPropagation()
            const nextSelection = resolveClickSelection({
                currentSelection: selectedIconIds,
                orderedIds: allItems.map((item) => item.id),
                clickedId: itemId,
                anchorId: selectionAnchorId,
                multi: event.ctrlKey || event.metaKey,
                range: event.shiftKey,
            })
            setSelectedIconIds(nextSelection.selectedIds)
            setSelectionAnchorId(nextSelection.anchorId)
            return nextSelection.selectedIds
        },
        [allItems, selectedIconIds, selectionAnchorId],
    )

    const handleIconKeyDown = useCallback(
        (event: KeyboardEvent<HTMLButtonElement>, item: DesktopItem) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                event.stopPropagation()
                setSelectedIconIds([item.id])
                setSelectionAnchorId(item.id)
                launchItem(item)
                return
            }

            // Handle Delete / Backspace for VFS desktop items
            if ((event.key === 'Delete' || event.key === 'Backspace') && item.isVfs && item.node) {
                event.preventDefault()
                try {
                    fsService.delete(`${DESKTOP_PATH}/${item.node.name}`)
                    useFsStore.getState().refresh()
                    setSelectedIconIds([])
                } catch (err) {
                    console.warn('Failed to delete desktop item:', err)
                }
            }
        },
        [launchItem],
    )

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

        setSelectedIconIds(
            resolveMarqueeSelection({
                currentSelection: dragState.baseSelection,
                hitIds,
                mode: dragState.mode,
            }),
        )
    }, [])

    const handleMouseMove = useCallback(
        (event: globalThis.MouseEvent) => {
            const dragState = dragRef.current
            if (!dragState) {
                return
            }

            const nextRect = createSelectionRect(dragState.startX, dragState.startY, event.clientX, event.clientY)
            setSelectionRect(nextRect)
            updateMarqueeSelection(nextRect)
        },
        [updateMarqueeSelection],
    )

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

        const mode: MarqueeSelectionMode =
            event.ctrlKey || event.metaKey
                ? event.shiftKey
                    ? 'toggle'
                    : 'subtract'
                : event.shiftKey
                  ? 'add'
                  : 'replace'

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
            {allItems.map((item) => (
                <button
                    key={item.id}
                    data-selectable-id={item.id}
                    onClick={(event) => {
                        selectIcon(event, item.id)
                    }}
                    onDoubleClick={(event) => {
                        event.stopPropagation()
                        setSelectedIconIds([item.id])
                        setSelectionAnchorId(item.id)
                        launchItem(item)
                    }}
                    onKeyDown={(event) => handleIconKeyDown(event, item)}
                    className={`group flex w-20 flex-col items-center rounded-xl p-2 transition-all active:scale-95 sm:w-24 ${
                        selectedIconIds.includes(item.id)
                            ? 'bg-primary/20 ring-2 ring-primary-focus shadow-xs'
                            : 'hover:bg-white/15'
                    }`}
                    aria-label={`Open ${item.label}`}
                >
                    {(() => {
                        let iconAppId = 'folder'
                        if (!item.isVfs) {
                            if (item.appId) {
                                iconAppId = item.appId
                            } else if (item.id === 'pc') {
                                iconAppId = 'pc'
                            }
                        } else if (item.node?.type === VfsNodeType.FILE) {
                            iconAppId = 'file'
                        } else {
                            iconAppId = 'folder'
                        }

                        return (
                            <div className="relative flex h-12 w-12 items-center justify-center transition-transform group-hover:scale-105">
                                <ShellAppIcon appId={iconAppId} size="lg" />
                            </div>
                        )
                    })()}
                    <span className={`mt-1.5 line-clamp-2 max-w-full rounded px-1.5 py-0.5 text-center text-xs leading-tight font-medium ${
                        selectedIconIds.includes(item.id)
                            ? 'bg-primary text-white shadow-xs'
                            : labelTone === 'light'
                                ? 'bg-black/50 text-white backdrop-blur-xs'
                                : 'text-ink drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]'
                    }`}>
                        {item.label}
                    </span>
                </button>
            ))}
            {selectionRect && (
                <div
                    aria-hidden
                    className="pointer-events-none fixed z-30 border border-primary-focus bg-[rgba(0,102,204,0.1)]"
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
