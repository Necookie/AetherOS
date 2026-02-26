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
        if (sortCol === col) setSortAsc(!sortAsc);
        else {
            setSortCol(col);
            setSortAsc(true);
        }
    };

    const sortedItems = [...items].sort((a, b) => {
        const factor = sortAsc ? 1 : -1;
        if (sortCol === 'name') return a.name.localeCompare(b.name) * factor;
        if (sortCol === 'type') {
            if (a.type !== b.type) return a.type === VfsNodeType.DIR ? -factor : factor;
            return a.name.localeCompare(b.name) * factor;
        }
        if (sortCol === 'size') return (a.size - b.size) * factor;
        if (sortCol === 'modified') return (a.modifiedAt - b.modifiedAt) * factor; // Mocked timestamps
        return 0;
    });

    const formatSize = (bytes: number, type: VfsNodeType) => {
        if (type === VfsNodeType.DIR) return '';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const formatModified = (ts: number) => {
        // Simplified mapping for deterministic clock output
        return `Tick ${ts}`;
    };

    const handleDoubleClick = (node: VfsNode) => {
        if (node.type === VfsNodeType.DIR) {
            navigate(currentPath === '/' ? `/${node.name}` : `${currentPath}/${node.name}`);
        } else {
            console.log('openFile event triggered for nodeId:', node.id);
            // Stub for OS-level openFile(nodeId)
        }
    };

    return (
        <div className="flex flex-col w-full h-full min-w-max text-sm relative outline-none select-none">
            {/* Headers row - sticky if we want */}
            <div className="flex sticky top-0 bg-[#1e1e24] shadow-sm z-10 border-b border-[#3f3f46] text-xs font-semibold text-gray-400 py-1 pl-6">
                <div className="flex-1 min-w-[200px] cursor-pointer hover:bg-white/5 px-2" onClick={() => handleSort('name')}>
                    Name {sortCol === 'name' && (sortAsc ? '▲' : '▼')}
                </div>
                <div className="w-32 cursor-pointer hover:bg-white/5 px-2" onClick={() => handleSort('modified')}>
                    Date modified {sortCol === 'modified' && (sortAsc ? '▲' : '▼')}
                </div>
                <div className="w-32 cursor-pointer hover:bg-white/5 px-2" onClick={() => handleSort('type')}>
                    Type {sortCol === 'type' && (sortAsc ? '▲' : '▼')}
                </div>
                <div className="w-24 cursor-pointer hover:bg-white/5 px-2 text-right" onClick={() => handleSort('size')}>
                    Size {sortCol === 'size' && (sortAsc ? '▲' : '▼')}
                </div>
            </div>

            {/* List */}
            <div className="flex-1 pb-4">
                {sortedItems.map(item => {
                    const isSelected = selectedIds.includes(item.id);
                    return (
                        <div
                            key={item.id}
                            data-id={item.id}
                            className={`flex items-center group cursor-pointer border-b border-transparent pl-4 ${isSelected ? 'bg-blue-600/40 border-blue-600/50' : 'hover:bg-white/5'
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
                            <div className="w-4 flex justify-center -ml-2 text-gray-500 opacity-80 pointer-events-none">
                                {item.type === VfsNodeType.DIR ? <Folder size={14} fill="currentColor" fillOpacity={0.2} className="text-blue-400" /> : <FileIcon size={14} className="text-gray-400" />}
                            </div>
                            <div className={`flex-1 min-w-[200px] truncate py-1.5 px-2 pointer-events-none ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                                {item.name}
                            </div>
                            <div className={`w-32 truncate py-1.5 px-2 pointer-events-none text-xs ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                                {formatModified(item.modifiedAt)}
                            </div>
                            <div className={`w-32 truncate py-1.5 px-2 pointer-events-none text-xs ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                                {item.type === VfsNodeType.DIR ? 'File folder' : 'File'}
                            </div>
                            <div className={`w-24 truncate py-1.5 px-2 pointer-events-none text-right text-xs ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                                {formatSize(item.size, item.type)}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
