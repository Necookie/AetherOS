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
        <div className="mt-3 border-t border-hairline pt-2">
            <div className="mb-1 px-4 py-1 text-xs font-semibold text-ink-muted-48">Folders</div>
            <button
                onClick={() => navigate('/')}
                className={`mx-2 mb-1 flex w-[calc(100%-1rem)] items-center gap-2 rounded-sm px-2 py-1 text-left text-xs ${currentPath === '/' ? 'bg-[rgba(0,102,204,0.08)] text-ink font-semibold' : 'text-ink-muted hover:bg-canvas'}`}
            >
                <FolderTree size={14} />
                Root
            </button>

            <div className="max-h-48 overflow-y-auto px-1">
                {rows.map((row) => (
                    <button
                        key={row.id}
                        onClick={() => navigate(row.path)}
                        className={`mx-1 flex w-[calc(100%-0.5rem)] items-center rounded-sm px-2 py-1 text-left text-xs ${currentPath === row.path ? 'bg-[rgba(0,102,204,0.08)] text-ink font-semibold' : 'text-ink-muted hover:bg-canvas'}`}
                        style={{ paddingLeft: `${row.depth * 12}px` }}
                    >
                        <ChevronRight size={12} className="mr-1 text-ink-muted-48" />
                        <span className="truncate">{row.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
