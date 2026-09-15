import { useEffect, useRef } from 'react'
import {
    Columns,
    FilePlus,
    Folder,
    FolderPlus,
    Image as ImageIcon,
    Info,
    Maximize2,
    Minimize2,
    RotateCw,
    Settings,
    Terminal,
} from 'lucide-react'
import { toggleFullscreen, useFullscreen } from '../../services/fullscreenService'
import { fsService } from '../../vfs/vfsService'
import { VfsNodeType } from '../../vfs/types'
import { useFsStore } from '../../stores/fsStore'
import { useWindowStore } from '../../stores/windowStore'
import { notificationService } from '../../features/notifications'

export interface DesktopContextMenuProps {
    x: number
    y: number
    isOpen: boolean
    onClose: () => void
    onOpenApp: (appId: string) => void
    onOpenAbout: () => void
    onRefreshDesktop: () => void
}

const DESKTOP_PATH = '/home/user/Desktop'

export default function DesktopContextMenu({
    x,
    y,
    isOpen,
    onClose,
    onOpenApp,
    onOpenAbout,
    onRefreshDesktop,
}: DesktopContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null)
    const isFullscreenActive = useFullscreen()

    useEffect(() => {
        if (!isOpen) return

        const handlePointerDown = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose()
            }
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose()
            }
        }

        window.addEventListener('mousedown', handlePointerDown)
        window.addEventListener('keydown', handleKeyDown)

        return () => {
            window.removeEventListener('mousedown', handlePointerDown)
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    // Clamp coordinates within the viewport
    const menuWidth = 224
    const menuHeight = 340
    const clampedX = Math.min(Math.max(8, x), window.innerWidth - menuWidth - 8)
    const clampedY = Math.min(Math.max(8, y), window.innerHeight - menuHeight - 8)

    const handleCreateFolder = () => {
        onClose()
        try {
            const existingNodes = fsService.readDir(DESKTOP_PATH)
            const existingNames = new Set(existingNodes.map((n) => n.name))
            let folderName = 'New Folder'
            let counter = 2
            while (existingNames.has(folderName)) {
                folderName = `New Folder (${counter})`
                counter++
            }

            fsService.createNode(DESKTOP_PATH, folderName, VfsNodeType.DIR)
            useFsStore.getState().refresh()
            onRefreshDesktop()

            notificationService.publish({
                title: 'Folder Created',
                message: `Created "${folderName}" on Desktop`,
                source: 'Desktop',
                priority: 'low',
            })
        } catch (err) {
            console.warn('Failed to create folder on Desktop:', err)
        }
    }

    const handleCreateFile = () => {
        onClose()
        try {
            const existingNodes = fsService.readDir(DESKTOP_PATH)
            const existingNames = new Set(existingNodes.map((n) => n.name))
            let fileName = 'New Document.txt'
            let counter = 2
            while (existingNames.has(fileName)) {
                fileName = `New Document (${counter}).txt`
                counter++
            }

            fsService.createNode(DESKTOP_PATH, fileName, VfsNodeType.FILE, '')
            useFsStore.getState().refresh()
            onRefreshDesktop()

            notificationService.publish({
                title: 'File Created',
                message: `Created "${fileName}" on Desktop`,
                source: 'Desktop',
                priority: 'low',
            })
        } catch (err) {
            console.warn('Failed to create file on Desktop:', err)
        }
    }

    const handleToggleFullscreen = () => {
        onClose()
        toggleFullscreen()
    }

    const handleRefresh = () => {
        onClose()
        useFsStore.getState().refresh()
        onRefreshDesktop()
        notificationService.publish({
            title: 'Desktop Refreshed',
            message: 'Desktop icons and filesystem state were synchronized.',
            source: 'System',
            priority: 'low',
        })
    }

    const handleTileSideBySide = () => {
        onClose()
        const state = useWindowStore.getState()
        const visibleIds = state.windowOrder.filter(
            (id) => state.windows[id] && !state.windows[id].state.isMinimized
        )
        if (visibleIds.length === 0) return

        if (visibleIds.length === 1) {
            state.snapWindow(visibleIds[0], 'left-half')
        } else {
            state.snapWindow(visibleIds[0], 'left-half')
            state.snapWindow(visibleIds[1], 'right-half')
        }

        notificationService.publish({
            title: 'Windows Tiled',
            message: 'Arranged visible windows side-by-side.',
            source: 'System',
            priority: 'low',
        })
    }

    const menuItemClass = 'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-tile-2 hover:text-ink focus-visible:bg-tile-2'

    return (
        <div
            ref={menuRef}
            className="fixed z-[999999] w-56 select-none rounded-xl border border-hairline bg-surface/95 p-1.5 text-[13px] text-ink shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-75"
            style={{ left: clampedX, top: clampedY }}
            role="menu"
            aria-label="Desktop Context Menu"
        >
            <div className="space-y-0.5">
                <button
                    role="menuitem"
                    onClick={handleCreateFolder}
                    className={menuItemClass}
                >
                    <FolderPlus className="h-4 w-4 text-primary" />
                    <span className="flex-1">New Folder</span>
                </button>
                <button
                    role="menuitem"
                    onClick={handleCreateFile}
                    className={menuItemClass}
                >
                    <FilePlus className="h-4 w-4 text-primary" />
                    <span className="flex-1">New Text Document</span>
                </button>
            </div>

            <div className="my-1 border-b border-hairline/60" />

            <div className="space-y-0.5">
                <button
                    role="menuitem"
                    onClick={() => {
                        onClose()
                        onOpenApp('term')
                    }}
                    className={menuItemClass}
                >
                    <Terminal className="h-4 w-4 opacity-75" />
                    <span className="flex-1">Open Terminal</span>
                </button>
                <button
                    role="menuitem"
                    onClick={() => {
                        onClose()
                        onOpenApp('explorer')
                    }}
                    className={menuItemClass}
                >
                    <Folder className="h-4 w-4 opacity-75" />
                    <span className="flex-1">Open File Explorer</span>
                </button>
                <button
                    role="menuitem"
                    onClick={() => {
                        onClose()
                        onOpenApp('settings')
                    }}
                    className={menuItemClass}
                >
                    <ImageIcon className="h-4 w-4 opacity-75" />
                    <span className="flex-1">Change Wallpaper...</span>
                </button>
            </div>

            <div className="my-1 border-b border-hairline/60" />

            <div className="space-y-0.5">
                <button
                    role="menuitem"
                    onClick={handleToggleFullscreen}
                    className={`${menuItemClass} justify-between`}
                >
                    <div className="flex items-center gap-2.5">
                        {isFullscreenActive ? (
                            <Minimize2 className="h-4 w-4 text-primary" />
                        ) : (
                            <Maximize2 className="h-4 w-4 opacity-75" />
                        )}
                        <span>{isFullscreenActive ? 'Exit Fullscreen' : 'Fullscreen Mode'}</span>
                    </div>
                    <kbd className="rounded bg-tile-1 px-1.5 py-0.5 text-[10px] font-mono text-muted">F11</kbd>
                </button>
                <button
                    role="menuitem"
                    onClick={handleRefresh}
                    className={menuItemClass}
                >
                    <RotateCw className="h-4 w-4 opacity-75" />
                    <span className="flex-1">Refresh Desktop</span>
                </button>
                <button
                    role="menuitem"
                    onClick={handleTileSideBySide}
                    className={menuItemClass}
                >
                    <Columns className="h-4 w-4 text-primary" />
                    <span className="flex-1">Tile Windows Side by Side</span>
                </button>
                <button
                    role="menuitem"
                    onClick={() => {
                        onClose()
                        onOpenApp('settings')
                    }}
                    className={menuItemClass}
                >
                    <Settings className="h-4 w-4 opacity-75" />
                    <span className="flex-1">System Settings</span>
                </button>
                <button
                    role="menuitem"
                    onClick={() => {
                        onClose()
                        onOpenAbout()
                    }}
                    className={menuItemClass}
                >
                    <Info className="h-4 w-4 opacity-75" />
                    <span className="flex-1">About AetherOS</span>
                </button>
            </div>
        </div>
    )
}
