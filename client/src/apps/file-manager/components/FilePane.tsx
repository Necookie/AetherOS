import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import { useFsStore } from '../../../stores/fsStore';
import { createSelectionRect, rectFromDomRect, rectIntersects, resolveMarqueeSelection, type MarqueeSelectionMode, type SelectionRect } from '../../../features/selection';
import ContextMenu from './ContextMenu';
import FileDetails from './FileDetails';
import FileGrid from './FileGrid';
import SelectionDetails from './SelectionDetails';

const INTERACTIVE_SELECTOR = 'button, input, textarea, select, option, a, [role="button"], [data-disable-marquee="true"]';

interface DragState {
    startX: number;
    startY: number;
    mode: MarqueeSelectionMode;
    baseSelection: string[];
}

export default function FilePane() {
    const {
        viewMode,
        items,
        showHidden,
        clearSelection,
        setSelection,
        error,
        clearError,
        selectedIds,
        selectItem,
        isMutating,
    } = useFsStore();
    const paneRef = useRef<HTMLDivElement>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; targetId: string | null } | null>(null);
    const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(null);
    const dragRef = useRef<DragState | null>(null);

    const visibleItems = items.filter((item) => showHidden || !item.name.startsWith('.'));

    const handlePaneClick = (event: MouseEvent) => {
        if (dragRef.current) {
            return;
        }

        const target = event.target as HTMLElement | null;
        const clickedSelectable = target?.closest('[data-selectable-id]');
        if (!clickedSelectable && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
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

    const updateMarqueeSelection = useCallback((nextRect: SelectionRect) => {
        const pane = paneRef.current;
        const dragState = dragRef.current;
        if (!pane || !dragState) {
            return;
        }

        const selectableItems = pane.querySelectorAll<HTMLElement>('[data-selectable-id]');
        const hitIds: string[] = [];
        selectableItems.forEach((element) => {
            const selectableId = element.dataset.selectableId;
            if (!selectableId) {
                return;
            }

            if (rectIntersects(nextRect, rectFromDomRect(element.getBoundingClientRect()))) {
                hitIds.push(selectableId);
            }
        });

        const nextSelection = resolveMarqueeSelection({
            currentSelection: dragState.baseSelection,
            hitIds,
            mode: dragState.mode,
        });
        setSelection(nextSelection, nextSelection.at(-1) ?? null);
    }, [setSelection]);

    const handleMouseMove = useCallback((event: globalThis.MouseEvent) => {
        const dragState = dragRef.current;
        if (!dragState) {
            return;
        }

        const nextRect = createSelectionRect(dragState.startX, dragState.startY, event.clientX, event.clientY);
        setSelectionRect(nextRect);
        updateMarqueeSelection(nextRect);
    }, [updateMarqueeSelection]);

    const endDrag = useCallback(() => {
        dragRef.current = null;
        setSelectionRect(null);
        window.removeEventListener('mousemove', handleMouseMove);
    }, [handleMouseMove]);

    const handleMouseUp = useCallback(() => {
        window.removeEventListener('mouseup', handleMouseUp);
        endDrag();
    }, [endDrag]);

    const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
        if (event.button !== 0) {
            return;
        }

        const target = event.target as HTMLElement | null;
        if (!target) {
            return;
        }

        if (target.closest(INTERACTIVE_SELECTOR) || target.closest('[data-selectable-id]')) {
            return;
        }

        const mode: MarqueeSelectionMode = event.ctrlKey || event.metaKey
            ? (event.shiftKey ? 'toggle' : 'subtract')
            : (event.shiftKey ? 'add' : 'replace');

        dragRef.current = {
            startX: event.clientX,
            startY: event.clientY,
            mode,
            baseSelection: [...selectedIds],
        };

        const startRect = createSelectionRect(event.clientX, event.clientY, event.clientX, event.clientY);
        setSelectionRect(startRect);
        updateMarqueeSelection(startRect);
        setContextMenu(null);

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    useEffect(() => {
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    return (
        <div className="relative flex flex-1 overflow-hidden">
            <div
                ref={paneRef}
                className="relative flex-1 overflow-y-auto bg-slate-950/30 outline-none"
                onMouseDown={handleMouseDown}
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
                {selectionRect && (
                    <div
                        aria-hidden
                        className="pointer-events-none fixed z-30 border border-indigo-400/70 bg-indigo-500/20"
                        style={{
                            left: selectionRect.left,
                            top: selectionRect.top,
                            width: selectionRect.right - selectionRect.left,
                            height: selectionRect.bottom - selectionRect.top,
                        }}
                    />
                )}

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
