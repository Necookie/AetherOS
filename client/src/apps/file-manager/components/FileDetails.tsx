import { Folder, File as FileIcon } from 'lucide-react';
import { useClipboardSnapshot } from '../../../features/clipboard';
import { VfsNodeType, type VfsNode } from '../../../vfs/types';
import { useFsStore } from '../../../stores/fsStore';

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
    const clipboard = useClipboardSnapshot()
    const pendingCutIds = new Set(
        clipboard.payload?.kind === 'files' && clipboard.payload.operation === 'cut'
            ? clipboard.payload.entries.map((entry) => entry.nodeId)
            : [],
    )

    const formatSize = (bytes: number, type: VfsNodeType) => {
        if (type === VfsNodeType.DIR) {
            return '';
        }
        if (bytes < 1024) {
            return `${bytes} B`;
        }
        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const formatModified = (ts: number) => `Tick ${Math.floor(ts)}`;

    const handleDoubleClick = (node: VfsNode) => {
        if (node.type === VfsNodeType.DIR) {
            navigate(currentPath === '/' ? `/${node.name}` : `${currentPath}/${node.name}`);
            return;
        }
        console.log('openFile event triggered for nodeId:', node.id);
    };

    const sortLabel = (column: typeof sortBy) => (sortBy === column ? (sortDirection === 'asc' ? 'Asc' : 'Desc') : '');

    return (
        <div className="relative flex h-full w-full min-w-max select-none flex-col text-sm outline-none">
            <div className="sticky top-0 z-10 flex border-b border-slate-700 bg-slate-900/85 py-1 pl-6 text-xs font-semibold text-slate-400 backdrop-blur-md">
                <button className="min-w-[200px] flex-1 px-2 text-left hover:bg-slate-800/80" onClick={() => setSort('name')}>
                    Name {sortLabel('name')}
                </button>
                <button className="w-32 px-2 text-left hover:bg-slate-800/80" onClick={() => setSort('modified')}>
                    Date modified {sortLabel('modified')}
                </button>
                <button className="w-32 px-2 text-left hover:bg-slate-800/80" onClick={() => setSort('type')}>
                    Type {sortLabel('type')}
                </button>
                <button className="w-24 px-2 text-right hover:bg-slate-800/80" onClick={() => setSort('size')}>
                    Size {sortLabel('size')}
                </button>
            </div>

            <div className="flex-1 pb-4">
                {items.map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    const isPendingCut = pendingCutIds.has(item.id)
                    return (
                        <div
                            key={item.id}
                            data-id={item.id}
                            data-selectable-id={item.id}
                            className={`group flex cursor-pointer items-center border-b border-transparent pl-4 ${isSelected ? 'border-indigo-500/35 bg-indigo-500/20' : 'hover:bg-slate-800/45'} ${isPendingCut ? 'opacity-50' : ''}`}
                            onClick={(event) => {
                                event.stopPropagation();
                                selectItem(item.id, event.ctrlKey || event.metaKey, event.shiftKey);
                            }}
                            onDoubleClick={(event) => {
                                event.stopPropagation();
                                handleDoubleClick(item);
                            }}
                        >
                            <div className="pointer-events-none -ml-2 flex w-4 justify-center text-slate-500 opacity-80">
                                {item.type === VfsNodeType.DIR
                                    ? <Folder size={14} fill="currentColor" fillOpacity={0.2} className="text-indigo-300" />
                                    : <FileIcon size={14} className="text-slate-500" />}
                            </div>
                            <div className={`pointer-events-none min-w-[200px] flex-1 truncate px-2 py-1.5 ${isSelected ? 'font-medium text-indigo-100' : 'text-slate-200'} ${isPendingCut ? 'text-amber-100' : ''}`}>
                                {item.name}
                            </div>
                            <div className={`pointer-events-none w-32 truncate px-2 py-1.5 text-xs ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`}>
                                {formatModified(item.modifiedAt)}
                            </div>
                            <div className={`pointer-events-none w-32 truncate px-2 py-1.5 text-xs ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`}>
                                {item.type === VfsNodeType.DIR ? 'File folder' : 'File'}
                            </div>
                            <div className={`pointer-events-none w-24 truncate px-2 py-1.5 text-right text-xs ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`}>
                                {formatSize(item.size, item.type)}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
