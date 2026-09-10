import { VfsNode, VfsNodeType } from '../../../vfs/types';
import { useClipboardSnapshot } from '../../../features/clipboard';
import { useFsStore } from '../../../stores/fsStore';
import { Folder, FileText, FileCode, Image as Img } from 'lucide-react';

// One accent only: folders (the navigable/actionable type) get primary,
// every file type is neutral ink-muted-48 — shape (not color) carries the
// type distinction between text/image/code icons.
const getIcon = (type: VfsNodeType, name: string) => {
    if (type === VfsNodeType.DIR) return <Folder size={48} className="text-primary" fill="currentColor" fillOpacity={0.2} strokeWidth={1.5} />;

    if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.svg')) return <Img size={48} className="text-ink-muted-48" strokeWidth={1.5} />;
    if (name.endsWith('.ts') || name.endsWith('.tsx') || name.endsWith('.js') || name.endsWith('.json')) return <FileCode size={48} className="text-ink-muted-48" strokeWidth={1.5} />;

    return <FileText size={48} className="text-ink-muted-48" strokeWidth={1.5} />;
};

export default function FileGrid({ items }: { items: VfsNode[] }) {
    const { selectedIds, selectItem, navigate, currentPath } = useFsStore();
    const clipboard = useClipboardSnapshot()
    const pendingCutIds = new Set(
        clipboard.payload?.kind === 'files' && clipboard.payload.operation === 'cut'
            ? clipboard.payload.entries.map((entry) => entry.nodeId)
            : [],
    )

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
                const isPendingCut = pendingCutIds.has(item.id)
                return (
                    <div
                        key={item.id}
                        data-id={item.id}
                        data-selectable-id={item.id}
                        className={`h-28 w-24 cursor-pointer rounded-sm p-2 transition-colors ${isSelected ? 'bg-[rgba(0,102,204,0.1)] outline outline-1 outline-primary-focus' : 'hover:bg-parchment'
                            } ${isPendingCut ? 'opacity-45 outline outline-1 outline-dashed outline-warning' : ''
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
                        <div className="mb-1 flex h-14 items-center justify-center pointer-events-none">
                            {getIcon(item.type, item.name)}
                        </div>
                        <div className={`pointer-events-none w-full break-words px-1 text-center text-xs line-clamp-2 ${isSelected ? 'font-semibold text-ink' : 'text-ink'} ${isPendingCut ? 'text-warning' : ''}`}>
                            {item.name}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
