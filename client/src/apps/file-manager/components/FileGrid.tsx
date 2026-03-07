import { VfsNode, VfsNodeType } from '../../../vfs/types';
import { useFsStore } from '../../../stores/fsStore';
import { Folder, FileText, FileCode, Image as Img } from 'lucide-react';

const getIcon = (type: VfsNodeType, name: string) => {
    if (type === VfsNodeType.DIR) return <Folder size={48} className="text-indigo-300" fill="currentColor" fillOpacity={0.2} strokeWidth={1.5} />;

    // Simple mime check via extension
    if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.svg')) return <Img size={48} className="text-sky-300" strokeWidth={1.5} />;
    if (name.endsWith('.ts') || name.endsWith('.tsx') || name.endsWith('.js') || name.endsWith('.json')) return <FileCode size={48} className="text-amber-300" strokeWidth={1.5} />;

    return <FileText size={48} className="text-slate-400" strokeWidth={1.5} />;
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
                        className={`h-28 w-24 cursor-pointer rounded p-2 transition-colors ${isSelected ? 'bg-indigo-500/20 outline outline-1 outline-indigo-400/70' : 'hover:bg-slate-800/55'
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
                        <div className="mb-1 flex h-14 items-center justify-center pointer-events-none shadow-sm">
                            {getIcon(item.type, item.name)}
                        </div>
                        <div className={`pointer-events-none w-full break-words px-1 text-center text-xs line-clamp-2 ${isSelected ? 'font-medium text-indigo-100' : 'text-slate-200'}`}>
                            {item.name}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
