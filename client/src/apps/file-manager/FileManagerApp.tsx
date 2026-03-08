import { useEffect } from 'react';
import { shallow } from 'zustand/shallow';
import Window from '../../components/system/Window';
import { useFsStore } from '../../stores/fsStore';
import FilePane from './components/FilePane';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';

export default function FileManagerApp({ id }: { id: string }) {
    const {
        refresh,
        items,
        selectedIds,
        currentPath,
        toggleHidden,
        setViewMode,
        deleteItems,
        renameItem,
        moveItems,
    } = useFsStore((state) => ({
        refresh: state.refresh,
        items: state.items,
        selectedIds: state.selectedIds,
        currentPath: state.currentPath,
        toggleHidden: state.toggleHidden,
        setViewMode: state.setViewMode,
        deleteItems: state.deleteItems,
        renameItem: state.renameItem,
        moveItems: state.moveItems,
    }), shallow);

    useEffect(() => {
        refresh();
    }, [refresh, currentPath]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement;
            const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

            if (event.ctrlKey && event.key === 'h' && !isInput) {
                event.preventDefault();
                toggleHidden();
            }
            if (event.ctrlKey && event.key === '1' && !isInput) {
                event.preventDefault();
                setViewMode('icons');
            }
            if (event.ctrlKey && event.key === '2' && !isInput) {
                event.preventDefault();
                setViewMode('details');
            }
            if (event.key === 'Delete' && !isInput && selectedIds.length > 0) {
                event.preventDefault();
                if (confirm(`Are you sure you want to delete ${selectedIds.length} item(s)?`)) {
                    deleteItems(selectedIds);
                }
            }
            if (event.key === 'F2' && !isInput && selectedIds.length === 1) {
                event.preventDefault();
                const newName = prompt('Enter new name:');
                if (newName) {
                    renameItem(selectedIds[0], newName);
                }
            }
            if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'm' && !isInput && selectedIds.length > 0) {
                event.preventDefault();
                const destination = prompt('Move selected items to:', '/home/user');
                if (destination) {
                    moveItems(selectedIds, destination);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [deleteItems, moveItems, renameItem, selectedIds, setViewMode, toggleHidden]);

    return (
        <Window id={id} title="File Manager">
            <div className="flex h-full w-full select-none flex-col overflow-hidden rounded-b-lg text-sm text-slate-200">
                <TopBar />
                <div className="relative flex flex-1 overflow-hidden">
                    <Sidebar />
                    <FilePane />
                </div>
                <div className="z-10 flex h-6 shrink-0 items-center justify-between border-t border-slate-700 bg-slate-900/85 px-4 text-xs text-slate-400 backdrop-blur">
                    <div className="flex gap-4">
                        <span>{items.length} item{items.length !== 1 ? 's' : ''}</span>
                        {selectedIds.length > 0 && <span>{selectedIds.length} item{selectedIds.length !== 1 ? 's' : ''} selected</span>}
                    </div>
                    <span className="hidden sm:inline">Ctrl+Shift+M to move selected items</span>
                </div>
            </div>
        </Window>
    );
}
