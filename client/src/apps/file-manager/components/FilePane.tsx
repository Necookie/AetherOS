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
            className="flex-1 overflow-y-auto relative bg-[#1e1e24] outline-none"
            onClick={handlePaneClick}
            onContextMenu={handleContextMenu}
        >
            {error && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-900/80 text-white px-4 py-2 rounded shadow flex items-center gap-4">
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
