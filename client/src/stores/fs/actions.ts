import {
    getParentPath,
    getVisibleItems,
    navigateToPath,
    stepHistory,
} from '../../vfs/fsState';
import { vfs } from '../../vfs/vfsService';
import { VfsNodeType } from '../../vfs/types';
import type { FsStore } from './types';

function runWithErrorBoundary(set: (partial: FsStore | Partial<FsStore> | ((state: FsStore) => FsStore | Partial<FsStore>), replace?: boolean | undefined) => void, action: () => void) {
    try {
        action();
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        set({ error: message });
    }
}

export function createFsActions(
    set: (partial: FsStore | Partial<FsStore> | ((state: FsStore) => FsStore | Partial<FsStore>), replace?: boolean | undefined) => void,
    get: () => FsStore,
) {
    return {
        refresh: () => runWithErrorBoundary(set, () => {
            const { currentPath, searchQuery } = get();
            set({ items: getVisibleItems(currentPath, searchQuery), error: null });
        }),
        navigate: (path: string) => runWithErrorBoundary(set, () => {
            const nextState = navigateToPath(get(), path);
            set({
                currentPath: nextState.currentPath,
                history: nextState.history,
                historyIndex: nextState.historyIndex,
                selectedIds: [],
                searchQuery: nextState.searchQuery,
                error: null,
            });
            get().refresh();
        }),
        goBack: () => {
            const nextState = stepHistory(get(), -1);
            if (!nextState) {
                return;
            }

            set({
                currentPath: nextState.currentPath,
                historyIndex: nextState.historyIndex,
                selectedIds: [],
                searchQuery: nextState.searchQuery,
                error: null,
            });
            get().refresh();
        },
        goForward: () => {
            const nextState = stepHistory(get(), 1);
            if (!nextState) {
                return;
            }

            set({
                currentPath: nextState.currentPath,
                historyIndex: nextState.historyIndex,
                selectedIds: [],
                searchQuery: nextState.searchQuery,
                error: null,
            });
            get().refresh();
        },
        goUp: () => runWithErrorBoundary(set, () => {
            const { currentPath } = get();
            if (currentPath === '/') {
                return;
            }

            const parentPath = getParentPath(currentPath);
            if (parentPath) {
                get().navigate(parentPath);
            }
        }),
        setViewMode: (mode: FsStore['viewMode']) => set({ viewMode: mode }),
        toggleHidden: () => set((state) => ({ showHidden: !state.showHidden })),
        setSearchQuery: (query: string) => {
            set({ searchQuery: query });
            get().refresh();
        },
        selectItem: (id: string, multi: boolean, range: boolean) => {
            set((state) => {
                if (multi) {
                    const isSelected = state.selectedIds.includes(id);
                    return {
                        selectedIds: isSelected
                            ? state.selectedIds.filter((selectedId) => selectedId !== id)
                            : [...state.selectedIds, id],
                    };
                }

                if (range) {
                    if (!state.selectedIds.includes(id)) {
                        return { selectedIds: [...state.selectedIds, id] };
                    }

                    return state;
                }

                return { selectedIds: [id] };
            });
        },
        clearSelection: () => set({ selectedIds: [] }),
        createFolder: (name: string) => runWithErrorBoundary(set, () => {
            const { currentPath } = get();
            vfs.createNode(currentPath, name, VfsNodeType.DIR);
            get().refresh();
        }),
        createFile: (name: string, content = '') => runWithErrorBoundary(set, () => {
            const { currentPath } = get();
            vfs.createNode(currentPath, name, VfsNodeType.FILE, content);
            get().refresh();
        }),
        renameItem: (id: string, newName: string) => runWithErrorBoundary(set, () => {
            const node = vfs.getNodeById(id);
            if (!node) {
                return;
            }

            vfs.rename(vfs.getPath(id), newName);
            get().refresh();
        }),
        deleteItems: (ids: string[]) => runWithErrorBoundary(set, () => {
            for (const id of ids) {
                try {
                    vfs.delete(vfs.getPath(id));
                } catch {
                    // Preserve current partial-delete behavior.
                }
            }

            set({ selectedIds: [] });
            get().refresh();
        }),
        clearError: () => set({ error: null }),
    };
}
