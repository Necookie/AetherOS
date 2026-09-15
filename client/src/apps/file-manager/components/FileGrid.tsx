import { VfsNode, VfsNodeType } from '../../../vfs/types';
import { useClipboardSnapshot } from '../../../features/clipboard';
import { useFsStore } from '../../../stores/fsStore';
import { FileIconView } from './FileIconView';
import { FolderOpen } from 'lucide-react';

export default function FileGrid({ items }: { items: VfsNode[] }) {
    const { selectedIds, selectItem, navigate, currentPath } = useFsStore();
    const clipboard = useClipboardSnapshot();
    const pendingCutIds = new Set(
        clipboard.payload?.kind === 'files' && clipboard.payload.operation === 'cut'
            ? clipboard.payload.entries.map((entry) => entry.nodeId)
            : [],
    );

    const handleDoubleClick = (node: VfsNode) => {
        if (node.type !== VfsNodeType.DIR) {
            return;
        }

        navigate(currentPath === '/' ? `/${node.name}` : `${currentPath}/${node.name}`);
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
        <div className="flex flex-wrap gap-2.5 content-start p-3 select-none" role="listbox" aria-label="Files" aria-multiselectable="true">
            {items.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                const isPendingCut = pendingCutIds.has(item.id);
                const itemPath = currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`;

                return (
                    <div
                        key={item.id}
                        data-id={item.id}
                        data-selectable-id={item.id}
                        role="option"
                        aria-selected={isSelected}
                        tabIndex={0}
                        className={`group relative flex h-32 w-28 cursor-pointer flex-col items-center rounded-lg p-2 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary active:scale-98 ${
                            isSelected
                                ? 'bg-primary/10 ring-1.5 ring-primary/50 shadow-2xs'
                                : 'hover:bg-black/[0.04]'
                        } ${isPendingCut ? 'opacity-40 ring-1.5 ring-dashed ring-warning' : ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            selectItem(item.id, e.ctrlKey || e.metaKey, e.shiftKey);
                        }}
                        onDoubleClick={(e) => {
                            e.stopPropagation();
                            handleDoubleClick(item);
                        }}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                event.preventDefault();
                                handleDoubleClick(item);
                            } else if (event.key === ' ') {
                                event.preventDefault();
                                selectItem(item.id, event.ctrlKey || event.metaKey, event.shiftKey);
                            }
                        }}
                        title={item.name}
                    >
                        {/* Icon display */}
                        <div className="pointer-events-none mb-1.5 flex h-16 w-full items-center justify-center">
                            <FileIconView
                                type={item.type}
                                name={item.name}
                                path={itemPath}
                                size="lg"
                            />
                        </div>

                        {/* File/Folder Name */}
                        <div
                            className={`pointer-events-none w-full break-words px-1 text-center text-xs leading-snug line-clamp-2 ${
                                isSelected ? 'font-semibold text-primary' : 'text-ink'
                            } ${isPendingCut ? 'text-warning' : ''}`}
                        >
                            {item.name}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
