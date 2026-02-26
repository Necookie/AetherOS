import { VfsNode, VfsNodeType } from '../../../vfs/types';
import { useFsStore } from '../../../stores/fsStore';
import { Folder, FileText, FileCode, Image as Img } from 'lucide-react';

const getIcon = (type: VfsNodeType, name: string) => {
    if (type === VfsNodeType.DIR) return <Folder size={48} className="text-blue-400" fill="currentColor" fillOpacity={0.2} strokeWidth={1.5} />;

    // Simple mime check via extension
    if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.svg')) return <Img size={48} className="text-purple-400" strokeWidth={1.5} />;
    if (name.endsWith('.ts') || name.endsWith('.tsx') || name.endsWith('.js') || name.endsWith('.json')) return <FileCode size={48} className="text-yellow-400" strokeWidth={1.5} />;

    return <FileText size={48} className="text-gray-300" strokeWidth={1.5} />;
};

export default function FileGrid({ items }: { items: VfsNode[] }) {
    const { selectedIds, selectItem, navigate, currentPath } = useFsStore();

    const handleDoubleClick = (node: VfsNode) => {
        if (node.type === VfsNodeType.DIR) {
            navigate(currentPath === '/' ? `/${node.name}` : `${currentPath}/${node.name}`);
        } else {
            console.log('openFile event triggered for nodeId:', node.id);
            // Stub for OS-level openFile(nodeId)
        }
    };

    return (
        <div className="flex flex-wrap gap-2 content-start p-2">
            {items.map(item => {
                const isSelected = selectedIds.includes(item.id);
                return (
                    <div
                        key={item.id}
                        data-id={item.id}
                        className={`w-24 h-28 flex flex-col items-center justify-start p-2 rounded cursor-pointer transition-colors ${isSelected ? 'bg-blue-600/40 outline outline-1 outline-blue-400' : 'hover:bg-white/5'
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
                        <div className="h-14 flex items-center justify-center pointer-events-none mb-1 shadow-sm">
                            {getIcon(item.type, item.name)}
                        </div>
                        <div className={`text-center text-xs break-words w-full line-clamp-2 px-1 pointer-events-none ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                            {item.name}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
