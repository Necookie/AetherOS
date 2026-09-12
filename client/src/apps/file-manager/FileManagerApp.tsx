import { useEffect } from 'react';
import { shallow } from 'zustand/shallow';
import Window from '../../components/system/Window';
import { useClipboardSnapshot } from '../../features/clipboard';
import { useFsStore } from '../../stores/fsStore';
import FilePane from './components/FilePane';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import FileManagerDialog from './components/FileManagerDialog';
import { fileManagerDialogs } from './dialogStore';

export default function FileManagerApp({ id }: { id: string }) {
    const {
        refresh,
        items,
        selectedIds,
        currentPath,
        toggleHidden,
        setViewMode,
        deleteItems,
        restoreItems,
        permanentlyDeleteItems,
        emptyTrash,
        renameItem,
        moveItems,
        copyItemsToClipboard,
        cutItemsToClipboard,
        pasteClipboard,
        statusMessage,
    } = useFsStore((state) => ({
        refresh: state.refresh,
        items: state.items,
        selectedIds: state.selectedIds,
        currentPath: state.currentPath,
        toggleHidden: state.toggleHidden,
        setViewMode: state.setViewMode,
        deleteItems: state.deleteItems,
        restoreItems: state.restoreItems,
        permanentlyDeleteItems: state.permanentlyDeleteItems,
        emptyTrash: state.emptyTrash,
        renameItem: state.renameItem,
        moveItems: state.moveItems,
        copyItemsToClipboard: state.copyItemsToClipboard,
        cutItemsToClipboard: state.cutItemsToClipboard,
        pasteClipboard: state.pasteClipboard,
        statusMessage: state.statusMessage,
    }), shallow);
    const clipboard = useClipboardSnapshot()
    const inTrash = currentPath === '/home/user/.Trash';
    const clipboardStatus = clipboard.payload?.kind === 'files'
        ? `${clipboard.payload.operation === 'cut' ? 'Move' : 'Copy'} ${clipboard.payload.entries.length} item${clipboard.payload.entries.length === 1 ? '' : 's'} into ${currentPath}`
        : null

    useEffect(() => {
        refresh();
    }, [refresh, currentPath]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement;
            const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
            const modifier = event.ctrlKey || event.metaKey

            if (modifier && event.key === 'h' && !isInput) {
                event.preventDefault();
                toggleHidden();
            }
            if (modifier && event.key === '1' && !isInput) {
                event.preventDefault();
                setViewMode('icons');
            }
            if (modifier && event.key === '2' && !isInput) {
                event.preventDefault();
                setViewMode('details');
            }
            if (modifier && event.key.toLowerCase() === 'c' && !isInput && selectedIds.length > 0 && !inTrash) {
                event.preventDefault()
                copyItemsToClipboard(selectedIds)
            }
            if (modifier && event.key.toLowerCase() === 'x' && !isInput && selectedIds.length > 0 && !inTrash) {
                event.preventDefault()
                cutItemsToClipboard(selectedIds)
            }
            if (modifier && event.key.toLowerCase() === 'v' && !isInput && !inTrash) {
                event.preventDefault()
                pasteClipboard()
            }
            if (event.key === 'Delete' && !isInput && selectedIds.length > 0) {
                event.preventDefault();
                if (inTrash) {
                    fileManagerDialogs.confirmPermanentDelete(selectedIds.length, () => {
                        permanentlyDeleteItems(selectedIds);
                    });
                } else {
                    fileManagerDialogs.confirmTrash(selectedIds.length, () => {
                        deleteItems(selectedIds);
                    });
                }
            }
            if (modifier && event.key.toLowerCase() === 'r' && !isInput && selectedIds.length > 0 && inTrash) {
                event.preventDefault();
                restoreItems(selectedIds);
            }
            if (modifier && event.shiftKey && event.key.toLowerCase() === 'delete' && !isInput && inTrash) {
                event.preventDefault();
                fileManagerDialogs.confirmEmptyTrash(() => {
                    emptyTrash();
                });
            }
            if (event.key === 'F2' && !isInput && selectedIds.length === 1 && !inTrash) {
                event.preventDefault();
                const targetNode = items.find((it) => it.id === selectedIds[0]);
                const currentName = targetNode?.name ?? 'item';
                fileManagerDialogs.promptRename(currentName, (newName) => {
                    renameItem(selectedIds[0], newName);
                });
            }
            if (modifier && event.shiftKey && event.key.toLowerCase() === 'm' && !isInput && selectedIds.length > 0 && !inTrash) {
                event.preventDefault();
                fileManagerDialogs.promptMove(selectedIds.length, (destination) => {
                    moveItems(selectedIds, destination);
                });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [copyItemsToClipboard, cutItemsToClipboard, deleteItems, emptyTrash, inTrash, items, moveItems, pasteClipboard, permanentlyDeleteItems, renameItem, restoreItems, selectedIds, setViewMode, toggleHidden]);

    return (
        <Window id={id} title="File Manager">
            <div className="relative flex h-full w-full select-none flex-col overflow-hidden bg-canvas text-sm text-ink">
                <TopBar />
                <div className="relative flex flex-1 overflow-hidden">
                    <Sidebar />
                    <FilePane />
                </div>
                <div className="z-10 flex h-6 shrink-0 items-center justify-between border-t border-hairline bg-parchment px-4 text-xs text-ink-muted">
                    <div className="flex gap-4">
                        <span>{items.length} item{items.length !== 1 ? 's' : ''}</span>
                        {selectedIds.length > 0 && <span>{selectedIds.length} item{selectedIds.length !== 1 ? 's' : ''} selected</span>}
                    </div>
                    <span className="hidden max-w-[40rem] truncate sm:inline">
                        {statusMessage ?? clipboardStatus ?? (inTrash ? 'Ctrl+R restore, Del permanent delete' : 'Ctrl+C / Ctrl+X / Ctrl+V for clipboard actions')}
                    </span>
                </div>

                {/* Native In-Window Card Dialog */}
                <FileManagerDialog />
            </div>
        </Window>
    );
}
