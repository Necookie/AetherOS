import { useEffect } from 'react';
import { useFsStore } from '../../stores/fsStore';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import FilePane from './components/FilePane';
import Window from '../../components/system/Window';

export default function FileManagerApp({ id }: { id: string }) {
    const { refresh, items, selectedIds, currentPath, toggleHidden, setViewMode, deleteItems, renameItem } = useFsStore();

    useEffect(() => {
        refresh();
    }, [refresh, currentPath]);

    // Global App Hotkeys
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
                if (newName) renameItem(selectedIds[0], newName);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggleHidden, setViewMode]);

    return (
        <Window id={id} title="File Manager">
            <div className="flex flex-col h-full w-full bg-[#1e1e24] text-gray-200 text-sm select-none font-sans overflow-hidden rounded-b-xl">
                <TopBar />
                <div className="flex flex-1 overflow-hidden relative">
                    <Sidebar />
                    <FilePane />
                </div>
                {/* Status Bar */}
                <div className="h-6 flex items-center justify-between px-4 bg-[#18181b] border-t border-[#3f3f46] text-xs text-gray-400 z-10 shrink-0">
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
