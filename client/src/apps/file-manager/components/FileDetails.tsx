import { ChevronDown, ChevronUp, FolderOpen } from 'lucide-react';
import { useClipboardSnapshot } from '../../../features/clipboard';
import { VfsNodeType, type VfsNode } from '../../../vfs/types';
import { useFsStore } from '../../../stores/fsStore';
import { FileIconView, formatFileTimestamp } from './FileIconView';

export default function FileDetails({ items }: { items: VfsNode[] }) {
    const {
        selectedIds,
        selectItem,
        navigate,
        currentPath,
        sortBy,
        sortDirection,
        setSort,
    } = useFsStore();
    const clipboard = useClipboardSnapshot();
    const pendingCutIds = new Set(
        clipboard.payload?.kind === 'files' && clipboard.payload.operation === 'cut'
            ? clipboard.payload.entries.map((entry) => entry.nodeId)
            : [],
    );

    const formatSize = (bytes: number, type: VfsNodeType) => {
        if (type === VfsNodeType.DIR) {
            return '--';
        }
        if (bytes < 1024) {
            return `${bytes} B`;
        }
        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const handleDoubleClick = (node: VfsNode) => {
        if (node.type === VfsNodeType.DIR) {
            navigate(currentPath === '/' ? `/${node.name}` : `${currentPath}/${node.name}`);
            return;
        }
        console.log('openFile event triggered for nodeId:', node.id);
    };

    const renderSortArrow = (column: typeof sortBy) => {
        if (sortBy !== column) return null;
        return sortDirection === 'asc' ? (
            <ChevronUp size={13} className="ml-1 inline text-primary" />
        ) : (
            <ChevronDown size={13} className="ml-1 inline text-primary" />
        );
    };

    if (items.length === 0) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-8 text-ink-muted-48 select-none">
                <FolderOpen size={48} strokeWidth={1} />
                <span className="text-sm font-medium">This folder is empty</span>
            </div>
        );
    }

    return (
        <div className="relative flex h-full w-full min-w-max select-none flex-col text-sm outline-none">
            {/* Table Header */}
            <div className="sticky top-0 z-10 flex border-b border-hairline bg-parchment/90 py-1.5 px-4 text-xs font-semibold text-ink-muted backdrop-blur-xs select-none">
                <button
                    type="button"
                    className="min-w-[240px] flex-1 px-2 text-left transition-colors hover:text-ink flex items-center"
                    onClick={() => setSort('name')}
                >
                    <span>Name</span>
                    {renderSortArrow('name')}
                </button>
                <button
                    type="button"
                    className="w-36 px-2 text-left transition-colors hover:text-ink flex items-center"
                    onClick={() => setSort('modified')}
                >
                    <span>Date Modified</span>
                    {renderSortArrow('modified')}
                </button>
                <button
                    type="button"
                    className="w-28 px-2 text-left transition-colors hover:text-ink flex items-center"
                    onClick={() => setSort('type')}
                >
                    <span>Kind</span>
                    {renderSortArrow('type')}
                </button>
                <button
                    type="button"
                    className="w-24 px-2 text-right transition-colors hover:text-ink flex items-center justify-end"
                    onClick={() => setSort('size')}
                >
                    <span>Size</span>
                    {renderSortArrow('size')}
                </button>
            </div>

            {/* Table Rows */}
            <div className="flex-1 pb-4">
                {items.map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    const isPendingCut = pendingCutIds.has(item.id);
                    const itemPath = currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`;

                    return (
                        <div
                            key={item.id}
                            data-id={item.id}
                            data-selectable-id={item.id}
                            className={`group flex cursor-pointer items-center border-b border-hairline/30 px-4 py-1.5 transition-colors ${
                                isSelected
                                    ? 'bg-primary/10 font-medium text-primary shadow-2xs'
                                    : 'hover:bg-black/[0.03] text-ink'
                            } ${isPendingCut ? 'opacity-40' : ''}`}
                            onClick={(event) => {
                                event.stopPropagation();
                                selectItem(item.id, event.ctrlKey || event.metaKey, event.shiftKey);
                            }}
                            onDoubleClick={(event) => {
                                event.stopPropagation();
                                handleDoubleClick(item);
                            }}
                        >
                            {/* Icon + Name */}
                            <div className="pointer-events-none min-w-[240px] flex-1 flex items-center gap-2.5 truncate px-2">
                                <FileIconView
                                    type={item.type}
                                    name={item.name}
                                    path={itemPath}
                                    size="sm"
                                    className="shrink-0"
                                />
                                <span className={`truncate text-xs ${isSelected ? 'font-semibold text-primary' : 'text-ink'} ${isPendingCut ? 'text-warning' : ''}`}>
                                    {item.name}
                                </span>
                            </div>

                            {/* Date Modified */}
                            <div className="pointer-events-none w-36 truncate px-2 text-xs text-ink-muted">
                                {formatFileTimestamp(item.modifiedAt)}
                            </div>

                            {/* Kind */}
                            <div className="pointer-events-none w-28 truncate px-2 text-xs text-ink-muted">
                                {item.type === VfsNodeType.DIR ? 'Folder' : item.name.includes('.') ? `${item.name.split('.').pop()?.toUpperCase()} file` : 'Document'}
                            </div>

                            {/* Size */}
                            <div className="pointer-events-none w-24 truncate px-2 text-right text-xs text-ink-muted">
                                {formatSize(item.size, item.type)}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

