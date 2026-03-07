import React, { useRef, useState } from 'react';
import { useFsStore } from '../../../stores/fsStore';
import FileGrid from './FileGrid';
import FileDetails from './FileDetails';
import ContextMenu from './ContextMenu';

export default function FilePane() {
    const { viewMode, items, showHidden, clearSelection, error, clearError, selectedIds, selectItem } = useFsStore();
    const paneRef = useRef<HTMLDivElement>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, targetId: string | null } | null>(null);

    const visibleItems = items.filter(item => showHidden || !item.name.startsWith('.'));

    const handlePaneClick = (e: React.MouseEvent) => {
        if (e.target === paneRef.current) {
            clearSelection();
        }
        if (contextMenu) setContextMenu(null);
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();

        // Find if we clicked on an item
        const target = e.target as HTMLElement;
        const itemEl = target.closest('[data-id]') as HTMLElement;
        const targetId = itemEl ? itemEl.getAttribute('data-id') : null;

        if (targetId && !selectedIds.includes(targetId)) {
            selectItem(targetId, false, false);
        }

        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            targetId
        });
    };

    return (
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

            {viewMode === 'icons' ? (
                <FileGrid items={visibleItems} />
            ) : (
                <FileDetails items={visibleItems} />
            )}

            {contextMenu && (
                <ContextMenu
                    position={{ x: contextMenu.x, y: contextMenu.y }}
                    targetId={contextMenu.targetId}
                    onClose={() => setContextMenu(null)}
                />
            )}
        </div>
    );
}
