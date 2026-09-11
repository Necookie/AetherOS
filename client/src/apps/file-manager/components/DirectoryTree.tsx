import { ChevronRight, FolderTree } from 'lucide-react';
import { useMemo } from 'react';
import { useFsStore } from '../../../stores/fsStore';
import { fsService } from '../../../vfs/vfsService';
import type { VfsNode } from '../../../vfs/types';

interface TreeNode {
    id: string;
    label: string;
    path: string;
    depth: number;
}

export default function DirectoryTree() {
    const { directoryTree, currentPath, navigate } = useFsStore((state) => ({
        directoryTree: state.directoryTree,
        currentPath: state.currentPath,
        navigate: state.navigate,
    }));

    const rows = useMemo<TreeNode[]>(() => {
        const byParent = new Map<string, VfsNode[]>();
        const byId = new Map<string, VfsNode>();
        for (const node of directoryTree) {
            byId.set(node.id, node);
            if (!node.parentId) {
                continue;
            }
            const bucket = byParent.get(node.parentId);
            if (bucket) {
                bucket.push(node);
            } else {
                byParent.set(node.parentId, [node]);
            }
        }

        for (const children of byParent.values()) {
            children.sort((left, right) => left.name.localeCompare(right.name));
        }

        const rootId = fsService.getRootId();
        const flattened: TreeNode[] = [];
        const stack: Array<{ id: string; depth: number }> = [{ id: rootId, depth: 0 }];

        while (stack.length > 0) {
            const current = stack.pop();
            if (!current) {
                continue;
            }

            if (current.id !== rootId) {
                const node = byId.get(current.id);
                if (!node) {
                    continue;
                }
                flattened.push({
                    id: node.id,
                    label: node.name,
                    path: fsService.getPath(node.id),
                    depth: current.depth,
                });
            }

            const children = byParent.get(current.id) ?? [];
            for (let index = children.length - 1; index >= 0; index -= 1) {
                stack.push({ id: children[index].id, depth: current.depth + 1 });
            }
        }

        return flattened;
    }, [directoryTree]);

    return (
        <div className="mt-2 border-t border-hairline pt-2">
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-ink-muted-48">Folder Tree</div>
            <button
                type="button"
                onClick={() => navigate('/')}
                className={`group mx-1.5 mb-1 flex w-[calc(100%-0.75rem)] items-center gap-2 rounded-md px-2.5 py-1 text-left text-xs transition-colors ${
                    currentPath === '/'
                        ? 'bg-primary/10 font-semibold text-primary shadow-2xs'
                        : 'text-ink-muted hover:bg-black/[0.04] hover:text-ink'
                }`}
            >
                <FolderTree size={14} className={currentPath === '/' ? 'text-primary' : 'text-ink-muted-48'} />
                <span className="truncate">Root (/)</span>
            </button>

            <div className="max-h-48 overflow-y-auto px-0.5">
                {rows.map((row) => (
                    <button
                        type="button"
                        key={row.id}
                        onClick={() => navigate(row.path)}
                        className={`mx-1.5 flex w-[calc(100%-0.75rem)] items-center rounded-md px-2 py-1 text-left text-xs transition-colors ${
                            currentPath === row.path
                                ? 'bg-primary/10 font-semibold text-primary shadow-2xs'
                                : 'text-ink-muted hover:bg-black/[0.04] hover:text-ink'
                        }`}
                        style={{ paddingLeft: `${Math.max(8, row.depth * 10)}px` }}
                    >
                        <ChevronRight size={11} className="mr-1 shrink-0 text-ink-muted-48" />
                        <span className="truncate">{row.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
