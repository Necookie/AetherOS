import { useEffect, useRef } from 'react';
import { useFsStore } from '../../../stores/fsStore';
import {
    FolderPlus, FilePlus, Scissors, Copy,
    Edit2, Trash2, Info, Check, EyeOff
} from 'lucide-react';

interface Point {
    x: number;
    y: number;
}

interface ContextMenuProps {
    onClose: () => void;
    position: Point;
    targetId: string | null; // null means empty space
}

export default function ContextMenu({ onClose, position, targetId }: ContextMenuProps) {
    const {
        selectedIds, viewMode, setViewMode, showHidden, toggleHidden,
        createFolder, createFile, renameItem, deleteItems
    } = useFsStore();

    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    // Keep menu within screen bounds
    const style: React.CSSProperties = {
        top: Math.min(position.y, window.innerHeight - 300),
        left: Math.min(position.x, window.innerWidth - 250),
    };

    const handleNewFolder = () => {
        const name = prompt('New Folder Name:', 'New Folder');
        if (name) createFolder(name);
        onClose();
    };

    const handleNewFile = () => {
        const name = prompt('New File Name:', 'New Text Document.txt');
        if (name) createFile(name, '');
        onClose();
    };

    const handleDelete = () => {
        if (selectedIds.length > 0) {
            // Confirm modal integration happens elsewhere, for now just delete
            // (Wait, we plan to implement DeleteConfirmModal, so we trigger a store state or global event.
            //  For simplicity, we'll prompt manually here or call deleteItems directly if no modal hooked up)
            if (confirm(`Are you sure you want to delete ${selectedIds.length} item(s)?`)) {
                deleteItems(selectedIds);
            }
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

    const MenuItem = ({ icon, label, onClick, disabled = false, showCheck = false }: any) => (
        <button
            className={`flex w-full items-center gap-3 px-4 py-1.5 text-left text-sm ${disabled ? 'cursor-not-allowed text-slate-600 opacity-50' : 'text-slate-200 hover:bg-slate-800 hover:text-slate-100'}`}
            onClick={disabled ? undefined : (e) => { e.stopPropagation(); onClick(); }}
            disabled={disabled}
        >
            <div className="w-4 flex justify-center">
                {showCheck ? <Check size={14} className="text-slate-500" /> : icon}
            </div>
            <span>{label}</span>
        </button>
    );

    const Separator = () => <div className="mx-2 my-1 h-px bg-slate-700" />;

    const onEmptySpace = !targetId;
    const hasSelection = selectedIds.length > 0;
    const singleSelection = selectedIds.length === 1;

    return (
        <div
            ref={menuRef}
            style={style}
            className="fixed z-50 w-56 rounded-md border border-slate-700 bg-slate-900/95 py-1 text-slate-100 shadow-xl outline-none backdrop-blur-sm"
            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
            {onEmptySpace ? (
                <>
                    <MenuItem icon={<FolderPlus size={14} />} label="New Folder" onClick={handleNewFolder} />
                    <MenuItem icon={<FilePlus size={14} />} label="New File" onClick={handleNewFile} />
                    <Separator />
                    <MenuItem icon={<EyeOff size={14} />} label="Show hidden files" onClick={() => { toggleHidden(); onClose(); }} showCheck={showHidden} />
                    <div className="relative group">
                        <MenuItem icon={<Check size={14} className="opacity-0" />} label="View " onClick={() => { }} />
                        <div className="absolute left-full top-0 -ml-1 hidden w-40 rounded-md border border-slate-700 bg-slate-900/95 py-1 shadow-2xl backdrop-blur-sm group-hover:block">
                            <MenuItem label="Icons" onClick={() => { setViewMode('icons'); onClose(); }} showCheck={viewMode === 'icons'} />
                            <MenuItem label="Details" onClick={() => { setViewMode('details'); onClose(); }} showCheck={viewMode === 'details'} />
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {/* Clipboard operations mocked for now */}
                    <MenuItem icon={<Scissors size={14} />} label="Cut" onClick={onClose} disabled />
                    <MenuItem icon={<Copy size={14} />} label="Copy" onClick={onClose} disabled />
                    <Separator />
                    <MenuItem icon={<Edit2 size={14} />} label="Rename" onClick={handleRename} disabled={!singleSelection} />
                    <MenuItem icon={<Trash2 size={14} />} label="Delete" onClick={handleDelete} disabled={!hasSelection} />
                    <Separator />
                    <MenuItem icon={<Info size={14} />} label="Properties" onClick={() => { /* stub */ onClose(); }} disabled={!singleSelection} />
                </>
            )}
        </div>
    );
}
