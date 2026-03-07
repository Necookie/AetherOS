import { useEffect } from 'react';
import { shallow } from 'zustand/shallow';
import Window from '../../components/system/Window';
import { useFsStore } from '../../stores/fsStore';
import FilePane from './components/FilePane';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';

export default function FileManagerApp({ id }: { id: string }) {
    const { refresh, items, selectedIds, currentPath, toggleHidden, setViewMode, deleteItems, renameItem } = useFsStore((state) => ({
        refresh: state.refresh,
        items: state.items,
        selectedIds: state.selectedIds,
        currentPath: state.currentPath,
        toggleHidden: state.toggleHidden,
        setViewMode: state.setViewMode,
        deleteItems: state.deleteItems,
        renameItem: state.renameItem,
    }), shallow);

    useEffect(() => {
        refresh();
    }, [refresh, currentPath]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

            if (e.ctrlKey && e.key === 'h' && !isInput) {
                e.preventDefault();
                toggleHidden();
            }
            if (e.ctrlKey && e.key === '1' && !isInput) {
                e.preventDefault();
                setViewMode('icons');
            }
            if (e.ctrlKey && e.key === '2' && !isInput) {
                e.preventDefault();
                setViewMode('details');
            }
            if (e.key === 'Delete' && !isInput && selectedIds.length > 0) {
                e.preventDefault();
                if (confirm(`Are you sure you want to delete ${selectedIds.length} item(s)?`)) {
                    deleteItems(selectedIds);
                }
            }
            if (e.key === 'F2' && !isInput && selectedIds.length === 1) {
                e.preventDefault();
                const newName = prompt('Enter new name:');
                if (newName) {
                    renameItem(selectedIds[0], newName);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [deleteItems, renameItem, selectedIds, setViewMode, toggleHidden]);

    return (
        <Window id={id} title="File Manager">
            <div className="flex h-full w-full select-none flex-col overflow-hidden rounded-b-lg text-sm text-slate-200">
                <TopBar />
                <div className="flex flex-1 overflow-hidden relative">
                    <Sidebar />
                    <FilePane />
                </div>
                <div className="z-10 flex h-6 shrink-0 items-center justify-between border-t border-slate-700 bg-slate-900/85 px-4 text-xs text-slate-400 backdrop-blur">
                    <div className="flex gap-4">
                        <span>{items.length} item{items.length !== 1 ? 's' : ''}</span>
                        {selectedIds.length > 0 && (
                            <span>{selectedIds.length} item{selectedIds.length !== 1 ? 's' : ''} selected</span>
                        )}
                    </div>
                </div>
            </div>
        </Window>
    );
}
