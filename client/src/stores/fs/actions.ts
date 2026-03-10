import { getDirectoryTree, getParentPath, getVisibleItems, navigateToPath, stepHistory } from '../../vfs/fsState';
import { fsService } from '../../vfs/vfsService';
import { VfsNodeType, type VfsSnapshot } from '../../vfs/types';
import { getActiveAccount } from '../../features/accounts/services/sessionSelectors';
import { clipboardService } from '../../features/clipboard';
import { useSessionStore } from '../useSessionStore';
import { checkFileMutationAccess, checkFilePathAccess } from '../../features/permissions/guards';
import { formatPermissionDecisionMessage } from '../../features/permissions/messages';
import { permissionService } from '../../features/permissions/permissionService';
import { resolveClickSelection } from '../../features/selection/selectionDomain';
import { reportKernelActivity } from '../../features/kernel/activityReporter';
import type { FsStore } from './types';
import { VfsError, ErrorCodes } from '../../vfs/types';

const TRASH_PATH = '/home/user/.Trash';

function isTrashPath(path: string): boolean {
    const normalized = fsService.normalizePath(path);
    return normalized === TRASH_PATH || normalized.startsWith(`${TRASH_PATH}/`);
}

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
        statusMessage: snapshot.statusMessage,
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
        return true;
    } catch (error: unknown) {
        fsService.restoreSnapshot(serviceSnapshot);
        restoreUiState(set, uiSnapshot);
        set({ error: toErrorMessage(error) });
        return false;
    }
}

function getClipboardEntries(ids: string[]) {
    return ids.map((id) => {
        const node = fsService.getNodeById(id);
        if (!node) {
            throw new Error(`Missing file node: ${id}`);
        }

        return {
            nodeId: node.id,
            path: fsService.getPath(node.id),
            name: node.name,
            type: node.type,
        };
    });
}

function pathExists(path: string) {
    try {
        fsService.resolvePath(path);
        return true;
    } catch {
        return false;
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

    throw new Error(formatPermissionDecisionMessage(access));
}

function assertPathPermission(path: string) {
    const sessionState = useSessionStore.getState();
    const account = getActiveAccount(sessionState);
    if (!account) {
        throw new Error('No active session.');
    }

    const access = checkFilePathAccess(account.role, path);
    if (!access.allowed) {
        throw new Error(formatPermissionDecisionMessage(access));
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
        revealPath: (path: string) => {
            try {
                const normalizedPath = fsService.normalizePath(path)
                assertPathPermission(normalizedPath)
                const node = fsService.resolvePath(normalizedPath)

                if (node.type === VfsNodeType.DIR) {
                    get().navigate(normalizedPath)
                    return true
                }

                const parentPath = getParentPath(normalizedPath)
                if (!parentPath) {
                    return false
                }

                get().navigate(parentPath)
                set({
                    selectedIds: [node.id],
                    selectionAnchorId: node.id,
                    error: null,
                })
                return true
            } catch (error: unknown) {
                set({ error: toErrorMessage(error) })
                return false
            }
        },
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
            reportKernelActivity({
                type: 'file-delete',
                sourceAppId: 'explorer',
                targetAppId: 'explorer',
                units: Math.max(1, ids.length * 0.75),
            });
        }),
        restoreItems: (ids: string[]) => runOptimisticMutation(set, get, () => {
            for (const id of ids) {
                const node = fsService.getNodeById(id);
                if (!node) {
                    throw new Error(`Missing file node: ${id}`);
                }

                const nodePath = fsService.getPath(node.id);
                if (!isTrashPath(nodePath)) {
                    throw new Error('Restore is only available for items in Trash.');
                }

                assertFilePermission('move', nodePath);
                fsService.restoreFromTrash(nodePath, 'keep-both');
            }
            reportKernelActivity({
                type: 'file-restore',
                sourceAppId: 'explorer',
                targetAppId: 'explorer',
                units: Math.max(1, ids.length * 0.7),
            });
        }),
        permanentlyDeleteItems: (ids: string[]) => runOptimisticMutation(set, get, () => {
            for (const id of ids) {
                const node = fsService.getNodeById(id);
                if (!node) {
                    throw new Error(`Missing file node: ${id}`);
                }

                const nodePath = fsService.getPath(node.id);
                if (!isTrashPath(nodePath)) {
                    throw new Error('Permanent delete is only available for items in Trash.');
                }

                assertFilePermission('delete', nodePath);
                fsService.deletePermanently(nodePath);
            }
        }),
        emptyTrash: () => runOptimisticMutation(set, get, () => {
            const trashNodes = fsService.listTrash();
            for (const node of trashNodes) {
                const nodePath = fsService.getPath(node.id);
                assertFilePermission('delete', nodePath);
            }

            fsService.emptyTrash();
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
            reportKernelActivity({
                type: 'file-move',
                sourceAppId: 'explorer',
                targetAppId: 'explorer',
                units: Math.max(1, ids.length * 0.8),
            });

            if (destinationPath !== get().currentPath) {
                set({
                    selectedIds: [],
                    selectionAnchorId: null,
                });
            }
        }),
        copyItemsToClipboard: (ids: string[]) => runWithErrorBoundary(set, () => {
            const entries = getClipboardEntries(ids);
            clipboardService.copyFiles(entries, 'explorer');
            const message = `Copied ${entries.length} item${entries.length === 1 ? '' : 's'} to the clipboard.`;
            set({ statusMessage: message, error: null });
        }),
        cutItemsToClipboard: (ids: string[]) => runWithErrorBoundary(set, () => {
            const entries = getClipboardEntries(ids);
            clipboardService.cutFiles(entries, 'explorer');
            const message = `Ready to move ${entries.length} item${entries.length === 1 ? '' : 's'} on the next paste.`;
            set({ statusMessage: message, error: null });
        }),
        pasteClipboard: (destinationPath?: string) => runWithErrorBoundary(set, () => {
            const payload = clipboardService.getSnapshot().payload;
            if (!payload || payload.kind !== 'files' || payload.entries.length === 0) {
                throw new Error('Clipboard does not contain any files to paste.');
            }

            const resolvedDestinationPath = fsService.normalizePath(destinationPath ?? get().currentPath);
            assertPathPermission(resolvedDestinationPath);
            const destinationNode = fsService.resolvePath(resolvedDestinationPath);
            if (destinationNode.type !== VfsNodeType.DIR) {
                throw new Error('Paste destination must be a folder.');
            }

            const mutationSucceeded = runOptimisticMutation(set, get, () => {
                let renamedCount = 0;

                for (const entry of payload.entries) {
                    const parentPath = getParentPath(entry.path);
                    if (payload.operation === 'cut' && parentPath === resolvedDestinationPath) {
                        throw new Error(`Paste blocked: ${entry.name} is already in this folder.`);
                    }

                    assertFilePermission(payload.operation === 'copy' ? 'create' : 'move', resolvedDestinationPath);

                    let nextName = entry.name;
                    const preferredTargetPath = fsService.normalizePath(`${resolvedDestinationPath}/${entry.name}`);
                    if (pathExists(preferredTargetPath)) {
                        nextName = fsService.allocateAvailableName(
                            resolvedDestinationPath,
                            entry.name,
                            payload.operation === 'cut' ? 'moved' : 'copy',
                        );
                        renamedCount += 1;
                    }

                    if (payload.operation === 'copy') {
                        fsService.copy(entry.path, resolvedDestinationPath, nextName);
                    } else {
                        try {
                            fsService.move(entry.path, resolvedDestinationPath, nextName);
                        } catch (error) {
                            if (error instanceof VfsError && error.code === ErrorCodes.EEXIST) {
                                throw new Error(`Paste blocked: ${entry.name} already exists in the destination.`);
                            }
                            throw error;
                        }
                    }
                }

                const actionLabel = payload.operation === 'copy' ? 'Pasted' : 'Moved';
                const renamedSuffix = renamedCount > 0 ? ` Renamed ${renamedCount} item${renamedCount === 1 ? '' : 's'} to avoid conflicts.` : '';
                const message = `${actionLabel} ${payload.entries.length} item${payload.entries.length === 1 ? '' : 's'} into ${resolvedDestinationPath}.${renamedSuffix}`;
                set({ statusMessage: message });
            });

            if (!mutationSucceeded) {
                return;
            }

            if (payload.operation === 'cut') {
                clipboardService.clear();
            }

            reportKernelActivity({
                type: payload.operation === 'copy' ? 'file-copy' : 'file-move',
                sourceAppId: 'explorer',
                targetAppId: 'explorer',
                units: Math.max(1, payload.entries.length * (payload.operation === 'copy' ? 0.9 : 0.8)),
            });
        }),
        setStatusMessage: (message: string | null) => set({ statusMessage: message }),
        clearError: () => set({ error: null }),
    };
}
