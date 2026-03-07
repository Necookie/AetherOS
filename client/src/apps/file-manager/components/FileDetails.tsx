import { useState } from 'react';
import { VfsNode, VfsNodeType } from '../../../vfs/types';
import { useFsStore } from '../../../stores/fsStore';
import { Folder, File as FileIcon } from 'lucide-react';

type SortColumn = 'name' | 'type' | 'size' | 'modified';

export default function FileDetails({ items }: { items: VfsNode[] }) {
    const { selectedIds, selectItem, navigate, currentPath } = useFsStore();
    const [sortCol, setSortCol] = useState<SortColumn>('name');
    const [sortAsc, setSortAsc] = useState(true);

    const handleSort = (col: SortColumn) => {
        if (sortCol === col) {
            setSortAsc(!sortAsc);
            return;
        }
        setSortCol(col);
        setSortAsc(true);
    };

    const sortedItems = [...items].sort((a, b) => {
        const factor = sortAsc ? 1 : -1;
        if (sortCol === 'name') return a.name.localeCompare(b.name) * factor;
        if (sortCol === 'type') {
            if (a.type !== b.type) return a.type === VfsNodeType.DIR ? -factor : factor;
            return a.name.localeCompare(b.name) * factor;
        }
        if (sortCol === 'size') return (a.size - b.size) * factor;
        if (sortCol === 'modified') return (a.modifiedAt - b.modifiedAt) * factor;
        return 0;
    });

    const formatSize = (bytes: number, type: VfsNodeType) => {
        if (type === VfsNodeType.DIR) return '';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const formatModified = (ts: number) => `Tick ${ts}`;

    const handleDoubleClick = (node: VfsNode) => {
        if (node.type === VfsNodeType.DIR) {
            navigate(currentPath === '/' ? `/${node.name}` : `${currentPath}/${node.name}`);
            return;
        }
        console.log('openFile event triggered for nodeId:', node.id);
    };

    return (
        <div className="relative flex h-full w-full min-w-max select-none flex-col text-sm outline-none">
            <div className="sticky top-0 z-10 flex border-b border-slate-700 bg-slate-900/85 py-1 pl-6 text-xs font-semibold text-slate-400 backdrop-blur-md">
                <div className="min-w-[200px] flex-1 cursor-pointer px-2 hover:bg-slate-800/80" onClick={() => handleSort('name')}>
                    Name {sortCol === 'name' && (sortAsc ? 'Asc' : 'Desc')}
                </div>
                <div className="w-32 cursor-pointer px-2 hover:bg-slate-800/80" onClick={() => handleSort('modified')}>
                    Date modified {sortCol === 'modified' && (sortAsc ? 'Asc' : 'Desc')}
                </div>
                <div className="w-32 cursor-pointer px-2 hover:bg-slate-800/80" onClick={() => handleSort('type')}>
                    Type {sortCol === 'type' && (sortAsc ? 'Asc' : 'Desc')}
                </div>
                <div className="w-24 cursor-pointer px-2 text-right hover:bg-slate-800/80" onClick={() => handleSort('size')}>
                    Size {sortCol === 'size' && (sortAsc ? 'Asc' : 'Desc')}
                </div>
            </div>

            <div className="flex-1 pb-4">
                {sortedItems.map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    return (
                        <div
                            key={item.id}
                            data-id={item.id}
                            className={`group flex cursor-pointer items-center border-b border-transparent pl-4 ${
                                isSelected ? 'border-indigo-500/35 bg-indigo-500/20' : 'hover:bg-slate-800/45'
                            }`}
                            onClick={(e) => {
                                e.stopPropagation();
                                selectItem(item.id, e.ctrlKey || e.metaKey, e.shiftKey);
                            }}
                            onDoubleClick={(e) => {
                                e.stopPropagation();
                                handleDoubleClick(item);
                            }}
                        >
                            <div className="pointer-events-none -ml-2 flex w-4 justify-center text-slate-500 opacity-80">
                                {item.type === VfsNodeType.DIR
                                    ? <Folder size={14} fill="currentColor" fillOpacity={0.2} className="text-indigo-300" />
                                    : <FileIcon size={14} className="text-slate-500" />}
                            </div>
                            <div className={`pointer-events-none min-w-[200px] flex-1 truncate px-2 py-1.5 ${isSelected ? 'font-medium text-indigo-100' : 'text-slate-200'}`}>
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
