import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import {
    FolderPlus,
    FilePlus,
    Scissors,
    Copy,
    Edit2,
    Trash2,
    RotateCcw,
    Info,
    Check,
    EyeOff,
    FolderInput,
    ClipboardPaste,
} from 'lucide-react';
import { useClipboardSnapshot } from '../../../features/clipboard';
import { useFsStore } from '../../../stores/fsStore';
import { fsService } from '../../../vfs/vfsService';
import { VfsNodeType } from '../../../vfs/types';

interface Point {
    x: number;
    y: number;
}

interface ContextMenuProps {
    onClose: () => void;
    position: Point;
    targetId: string | null;
}

interface MenuItemProps {
    icon?: ReactNode;
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    showCheck?: boolean;
}

function MenuItem({ icon, label, onClick, disabled = false, showCheck = false }: MenuItemProps) {
    return (
        <button
            className={`flex w-full items-center gap-3 px-4 py-1.5 text-left text-sm ${disabled ? 'cursor-not-allowed text-slate-600 opacity-50' : 'text-slate-200 hover:bg-slate-800 hover:text-slate-100'}`}
            onClick={disabled || !onClick ? undefined : (event) => {
                event.stopPropagation();
                onClick();
            }}
            disabled={disabled}
        >
            <div className="flex w-4 justify-center">{showCheck ? <Check size={14} className="text-slate-500" /> : icon}</div>
            <span>{label}</span>
        </button>
    );
}

const Separator = () => <div className="mx-2 my-1 h-px bg-slate-700" />;

export default function ContextMenu({ onClose, position, targetId }: ContextMenuProps) {
    const {
        selectedIds,
        currentPath,
        viewMode,
        setViewMode,
        showHidden,
        toggleHidden,
        createFolder,
        createFile,
        renameItem,
        deleteItems,
        restoreItems,
        permanentlyDeleteItems,
        emptyTrash,
        moveItems,
        copyItemsToClipboard,
        cutItemsToClipboard,
        pasteClipboard,
        isMutating,
    } = useFsStore();
    const clipboard = useClipboardSnapshot()
    const inTrash = currentPath === '/home/user/.Trash';
    const targetNode = targetId ? fsService.getNodeById(targetId) : null
    const pasteTargetPath = targetNode?.type === VfsNodeType.DIR ? fsService.getPath(targetNode.id) : currentPath
    const hasFileClipboard = clipboard.payload?.kind === 'files' && clipboard.payload.entries.length > 0

    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    const style: CSSProperties = {
        top: Math.min(position.y, window.innerHeight - 300),
        left: Math.min(position.x, window.innerWidth - 250),
    };

    const handleNewFolder = () => {
        const name = prompt('New Folder Name:', 'New Folder');
        if (name) {
            createFolder(name);
        }
        onClose();
    };

    const handleNewFile = () => {
        const name = prompt('New File Name:', 'New Text Document.txt');
        if (name) {
            createFile(name, '');
        }
        onClose();
    };

    const handleDelete = () => {
        if (selectedIds.length > 0 && confirm(`Move ${selectedIds.length} item(s) to Trash?`)) {
            deleteItems(selectedIds);
        }
        onClose();
    };

    const handleRestore = () => {
        if (selectedIds.length > 0) {
            restoreItems(selectedIds);
        }
        onClose();
    };

    const handlePermanentDelete = () => {
        if (selectedIds.length > 0 && confirm(`Permanently delete ${selectedIds.length} item(s)? This cannot be undone.`)) {
            permanentlyDeleteItems(selectedIds);
        }
        onClose();
    };

    const handleRename = () => {
        if (selectedIds.length === 1) {
            const newName = prompt('Enter new name:');
            if (newName) {
                renameItem(selectedIds[0], newName);
            }
        }
        onClose();
    };

    const handleMove = () => {
        if (selectedIds.length === 0) {
            onClose();
            return;
        }

        const destination = prompt('Move to path:', '/home/user');
        if (destination) {
            moveItems(selectedIds, destination);
        }
        onClose();
    };

    const onEmptySpace = !targetId;
    const hasSelection = selectedIds.length > 0;
    const singleSelection = selectedIds.length === 1;

    return (
        <div
            ref={menuRef}
            style={style}
            className="fixed z-50 w-56 rounded-md border border-slate-700 bg-slate-900/95 py-1 text-slate-100 shadow-xl outline-none backdrop-blur-sm"
            onContextMenu={(event) => {
                event.preventDefault();
                event.stopPropagation();
            }}
        >
            {onEmptySpace ? (
                <>
                    <MenuItem icon={<FolderPlus size={14} />} label="New Folder" onClick={handleNewFolder} disabled={isMutating || inTrash} />
                    <MenuItem icon={<FilePlus size={14} />} label="New File" onClick={handleNewFile} disabled={isMutating || inTrash} />
                    {!inTrash && <MenuItem icon={<ClipboardPaste size={14} />} label="Paste Here" onClick={() => { pasteClipboard(currentPath); onClose(); }} disabled={!hasFileClipboard || isMutating} />}
                    <Separator />
                    {inTrash && (
                        <>
                            <MenuItem icon={<Trash2 size={14} />} label="Empty Trash" onClick={() => {
                                if (confirm('Empty Trash permanently? This cannot be undone.')) {
                                    emptyTrash();
                                }
                                onClose();
                            }} disabled={isMutating} />
                            <Separator />
                        </>
                    )}
                    <MenuItem icon={<EyeOff size={14} />} label="Show hidden files" onClick={() => { toggleHidden(); onClose(); }} showCheck={showHidden} />
                    <div className="relative group">
                        <MenuItem icon={<Check size={14} className="opacity-0" />} label="View" />
                        <div className="absolute left-full top-0 -ml-1 hidden w-40 rounded-md border border-slate-700 bg-slate-900/95 py-1 shadow-2xl backdrop-blur-sm group-hover:block">
                            <MenuItem label="Icons" onClick={() => { setViewMode('icons'); onClose(); }} showCheck={viewMode === 'icons'} />
                            <MenuItem label="Details" onClick={() => { setViewMode('details'); onClose(); }} showCheck={viewMode === 'details'} />
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <MenuItem icon={<Scissors size={14} />} label="Cut" onClick={() => { cutItemsToClipboard(selectedIds); onClose(); }} disabled={!hasSelection || inTrash || isMutating} />
                    <MenuItem icon={<Copy size={14} />} label="Copy" onClick={() => { copyItemsToClipboard(selectedIds); onClose(); }} disabled={!hasSelection || inTrash || isMutating} />
                    {!inTrash && <MenuItem icon={<ClipboardPaste size={14} />} label={targetNode?.type === VfsNodeType.DIR ? 'Paste Into Folder' : 'Paste Here'} onClick={() => { pasteClipboard(pasteTargetPath); onClose(); }} disabled={!hasFileClipboard || isMutating} />}
                    <Separator />
                    {!inTrash && <MenuItem icon={<FolderInput size={14} />} label="Move To..." onClick={handleMove} disabled={!hasSelection || isMutating} />}
                    {!inTrash && <MenuItem icon={<Edit2 size={14} />} label="Rename" onClick={handleRename} disabled={!singleSelection || isMutating} />}
                    {!inTrash && <MenuItem icon={<Trash2 size={14} />} label="Move to Trash" onClick={handleDelete} disabled={!hasSelection || isMutating} />}
                    {inTrash && <MenuItem icon={<RotateCcw size={14} />} label="Restore" onClick={handleRestore} disabled={!hasSelection || isMutating} />}
                    {inTrash && <MenuItem icon={<Trash2 size={14} />} label="Delete Permanently" onClick={handlePermanentDelete} disabled={!hasSelection || isMutating} />}
                    <Separator />
                    <MenuItem icon={<Info size={14} />} label="Properties" disabled={!singleSelection} />
                </>
            )}
        </div>
    );
}
