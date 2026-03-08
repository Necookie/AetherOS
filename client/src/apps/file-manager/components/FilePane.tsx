import { useRef, useState, type MouseEvent } from 'react';
import { useFsStore } from '../../../stores/fsStore';
import ContextMenu from './ContextMenu';
import FileDetails from './FileDetails';
import FileGrid from './FileGrid';
import SelectionDetails from './SelectionDetails';

export default function FilePane() {
    const {
        viewMode,
        items,
        showHidden,
        clearSelection,
        error,
        clearError,
        selectedIds,
        selectItem,
        isMutating,
    } = useFsStore();
    const paneRef = useRef<HTMLDivElement>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; targetId: string | null } | null>(null);

    const visibleItems = items.filter((item) => showHidden || !item.name.startsWith('.'));

    const handlePaneClick = (event: MouseEvent) => {
        if (event.target === paneRef.current) {
            clearSelection();
        }
        if (contextMenu) {
            setContextMenu(null);
        }
    };

    const handleContextMenu = (event: MouseEvent) => {
        event.preventDefault();

        const target = event.target as HTMLElement;
        const itemElement = target.closest('[data-id]') as HTMLElement | null;
        const targetId = itemElement ? itemElement.getAttribute('data-id') : null;

        if (targetId && !selectedIds.includes(targetId)) {
            selectItem(targetId, false, false);
        }

        setContextMenu({
            x: event.clientX,
            y: event.clientY,
            targetId,
        });
    };

    return (
        <div className="relative flex flex-1 overflow-hidden">
            <div
                ref={paneRef}
                className="relative flex-1 overflow-y-auto bg-slate-950/30 outline-none"
                onClick={handlePaneClick}
                onContextMenu={handleContextMenu}
                tabIndex={0}
            >
                {error && (
                    <div className="absolute left-1/2 top-4 z-50 flex -translate-x-1/2 items-center gap-4 rounded border border-red-700 bg-red-950/90 px-4 py-2 text-red-100 shadow">
                        <span>{error}</span>
                        <button onClick={clearError} className="text-xl leading-none">&times;</button>
                    </div>
                )}

                {isMutating && (
                    <div className="absolute right-4 top-4 z-40 rounded border border-indigo-500/40 bg-indigo-950/80 px-2 py-1 text-xs text-indigo-100">
                        Applying changes...
                    </div>
                )}

                {viewMode === 'icons' ? <FileGrid items={visibleItems} /> : <FileDetails items={visibleItems} />}

                {contextMenu && (
                    <ContextMenu
                        position={{ x: contextMenu.x, y: contextMenu.y }}
                        targetId={contextMenu.targetId}
                        onClose={() => setContextMenu(null)}
                    />
                )}
            </div>

            <SelectionDetails />
        </div>
    );
}
