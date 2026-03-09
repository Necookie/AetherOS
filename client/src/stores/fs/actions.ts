import { getDirectoryTree, getParentPath, getVisibleItems, navigateToPath, stepHistory } from '../../vfs/fsState';
import { fsService } from '../../vfs/vfsService';
import { VfsNodeType, type VfsSnapshot } from '../../vfs/types';
import { getActiveAccount } from '../../features/accounts/services/sessionSelectors';
import { useSessionStore } from '../useSessionStore';
import { checkFileMutationAccess, checkFilePathAccess } from '../../features/permissions/guards';
import { permissionService } from '../../features/permissions/permissionService';
import { resolveClickSelection } from '../../features/selection/selectionDomain';
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
        selectionAnchorId: snapshot.selectionAnchorId,
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
            selectionAnchorId: null,
            error: null,
        });
    } catch (error: unknown) {
        fsService.restoreSnapshot(serviceSnapshot);
        restoreUiState(set, uiSnapshot);
        set({ error: toErrorMessage(error) });
    }
}

function assertFilePermission(action: 'create' | 'rename' | 'delete' | 'move', path: string) {
    const sessionState = useSessionStore.getState();
    const account = getActiveAccount(sessionState);
    if (!account || !sessionState.activeUserId) {
        throw new Error('No active session.');
    }

    const access = checkFileMutationAccess(account.role, action, path);
    if (access.allowed) {
        return;
    }

    if (access.needsPrompt && access.permission) {
        const granted = permissionService.request(sessionState.activeUserId, access.permission, access.reason ?? `Allow file action: ${action}`);
        if (granted) {
            return;
        }
    }

    throw new Error(access.reason ?? 'Permission denied.');
}

function assertPathPermission(path: string) {
    const sessionState = useSessionStore.getState();
    const account = getActiveAccount(sessionState);
    if (!account) {
        throw new Error('No active session.');
    }

    const access = checkFilePathAccess(account.role, path);
    if (!access.allowed) {
        throw new Error(access.reason ?? 'Path access denied.');
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
            assertPathPermission(path);
            const nextState = navigateToPath(get(), path);
            set({
                currentPath: nextState.currentPath,
                history: nextState.history,
                historyIndex: nextState.historyIndex,
                selectedIds: [],
                selectionAnchorId: null,
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
            assertPathPermission(nextState.currentPath);

            set({
                currentPath: nextState.currentPath,
                historyIndex: nextState.historyIndex,
                selectedIds: [],
                selectionAnchorId: null,
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
            assertPathPermission(nextState.currentPath);

            set({
                currentPath: nextState.currentPath,
                historyIndex: nextState.historyIndex,
                selectedIds: [],
                selectionAnchorId: null,
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
                const { selectedIds, anchorId } = resolveClickSelection({
                    currentSelection: state.selectedIds,
                    orderedIds: state.items.map((item) => item.id),
                    clickedId: id,
                    anchorId: state.selectionAnchorId,
                    multi,
                    range,
                });

                return {
                    selectedIds,
                    selectionAnchorId: anchorId,
                };
            });
        },
        setSelection: (ids: string[], anchorId: string | null = null) => set({
            selectedIds: ids,
            selectionAnchorId: anchorId,
        }),
        clearSelection: () => set({
            selectedIds: [],
            selectionAnchorId: null,
        }),
        createFolder: (name: string) => runOptimisticMutation(set, get, () => {
            assertFilePermission('create', get().currentPath);
            fsService.createNode(get().currentPath, name, VfsNodeType.DIR);
        }),
        createFile: (name: string, content = '') => runOptimisticMutation(set, get, () => {
            assertFilePermission('create', get().currentPath);
            fsService.createNode(get().currentPath, name, VfsNodeType.FILE, content);
        }),
        renameItem: (id: string, newName: string) => runOptimisticMutation(set, get, () => {
            const node = fsService.getNodeById(id);
            if (!node) {
                throw new Error(`Missing file node: ${id}`);
            }

            const nodePath = fsService.getPath(node.id);
            assertFilePermission('rename', nodePath);
            fsService.rename(nodePath, newName);
        }),
        deleteItems: (ids: string[]) => runOptimisticMutation(set, get, () => {
            for (const id of ids) {
                const node = fsService.getNodeById(id);
                if (!node) {
                    throw new Error(`Missing file node: ${id}`);
                }

                const nodePath = fsService.getPath(node.id);
                assertFilePermission('delete', nodePath);
                fsService.delete(nodePath);
            }
        }),
        moveItems: (ids: string[], destinationPath: string) => runOptimisticMutation(set, get, () => {
            assertFilePermission('move', destinationPath);
            for (const id of ids) {
                const node = fsService.getNodeById(id);
                if (!node) {
                    throw new Error(`Missing file node: ${id}`);
                }

                fsService.move(fsService.getPath(node.id), destinationPath);
            }

            if (destinationPath !== get().currentPath) {
                set({
                    selectedIds: [],
                    selectionAnchorId: null,
                });
            }
        }),
        clearError: () => set({ error: null }),
    };
}
