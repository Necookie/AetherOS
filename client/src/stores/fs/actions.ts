import { getDirectoryTree, getParentPath, getVisibleItems, navigateToPath, stepHistory } from '../../vfs/fsState';
import { fsService } from '../../vfs/vfsService';
import { VfsNodeType, type VfsSnapshot } from '../../vfs/types';
import type { FsStore } from './types';

function toErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

function buildViewState(state: FsStore) {
    return {
        items: getVisibleItems(state.currentPath, state.searchQuery, {
            includeHidden: state.showHidden,
            sortBy: state.sortBy,
            sortDirection: state.sortDirection,
        }),
        directoryTree: getDirectoryTree('/', state.showHidden),
    };
}

function restoreUiState(set: StoreSet, snapshot: FsStore) {
    set({
        currentPath: snapshot.currentPath,
        history: snapshot.history,
        historyIndex: snapshot.historyIndex,
        viewMode: snapshot.viewMode,
        selectedIds: snapshot.selectedIds,
        showHidden: snapshot.showHidden,
        searchQuery: snapshot.searchQuery,
        sortBy: snapshot.sortBy,
        sortDirection: snapshot.sortDirection,
        items: snapshot.items,
        directoryTree: snapshot.directoryTree,
        isMutating: false,
    });
}

type StoreSet = (
    partial:
        | FsStore
        | Partial<FsStore>
        | ((state: FsStore) => FsStore | Partial<FsStore>),
    replace?: boolean | undefined,
) => void;

type StoreGet = () => FsStore;

function runWithErrorBoundary(set: StoreSet, action: () => void) {
    try {
        action();
    } catch (error: unknown) {
        set({ error: toErrorMessage(error) });
    }
}

function runOptimisticMutation(set: StoreSet, get: StoreGet, action: () => void) {
    const serviceSnapshot: VfsSnapshot = fsService.createSnapshot();
    const uiSnapshot = get();

    set({ isMutating: true, error: null });

    try {
        action();
        const currentState = get();
        set({
            ...buildViewState(currentState),
            isMutating: false,
            selectedIds: [],
            error: null,
        });
    } catch (error: unknown) {
        fsService.restoreSnapshot(serviceSnapshot);
        restoreUiState(set, uiSnapshot);
        set({ error: toErrorMessage(error) });
    }
}

export function createFsActions(set: StoreSet, get: StoreGet) {
    return {
        refresh: () => runWithErrorBoundary(set, () => {
            const state = get();
            set({
                ...buildViewState(state),
                error: null,
            });
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
            const parentPath = getParentPath(get().currentPath);
            if (parentPath) {
                get().navigate(parentPath);
            }
        }),
        setViewMode: (mode: FsStore['viewMode']) => set({ viewMode: mode }),
        toggleHidden: () => {
            set((state) => ({ showHidden: !state.showHidden }));
            get().refresh();
        },
        setSearchQuery: (query: string) => {
            set({ searchQuery: query });
            get().refresh();
        },
        setSort: (sortBy: FsStore['sortBy'], sortDirection?: FsStore['sortDirection']) => {
            set((state) => {
                const nextDirection = sortDirection
                    ?? (state.sortBy === sortBy && state.sortDirection === 'asc' ? 'desc' : 'asc');

                return {
                    sortBy,
                    sortDirection: nextDirection,
                };
            });
            get().refresh();
        },
        selectItem: (id: string, multi: boolean, range: boolean) => {
            set((state) => {
                if (multi || range) {
                    const exists = state.selectedIds.includes(id);
                    return {
                        selectedIds: exists
                            ? state.selectedIds.filter((selectedId) => selectedId !== id)
                            : [...state.selectedIds, id],
                    };
                }

                return { selectedIds: [id] };
            });
        },
        clearSelection: () => set({ selectedIds: [] }),
        createFolder: (name: string) => runOptimisticMutation(set, get, () => {
            fsService.createNode(get().currentPath, name, VfsNodeType.DIR);
        }),
        createFile: (name: string, content = '') => runOptimisticMutation(set, get, () => {
            fsService.createNode(get().currentPath, name, VfsNodeType.FILE, content);
        }),
        renameItem: (id: string, newName: string) => runOptimisticMutation(set, get, () => {
            const node = fsService.getNodeById(id);
            if (!node) {
                throw new Error(`Missing file node: ${id}`);
            }

            fsService.rename(fsService.getPath(node.id), newName);
        }),
        deleteItems: (ids: string[]) => runOptimisticMutation(set, get, () => {
            for (const id of ids) {
                const node = fsService.getNodeById(id);
                if (!node) {
                    throw new Error(`Missing file node: ${id}`);
                }

                fsService.delete(fsService.getPath(node.id));
            }
        }),
        moveItems: (ids: string[], destinationPath: string) => runOptimisticMutation(set, get, () => {
            for (const id of ids) {
                const node = fsService.getNodeById(id);
                if (!node) {
                    throw new Error(`Missing file node: ${id}`);
                }

                fsService.move(fsService.getPath(node.id), destinationPath);
            }

            if (destinationPath !== get().currentPath) {
                set({ selectedIds: [] });
            }
        }),
        clearError: () => set({ error: null }),
    };
}
