import { create } from 'zustand';
import {
    getParentPath,
    getVisibleItems,
    navigateToPath,
    stepHistory,
} from '../features/vfs/fsState';
import { vfs } from '../vfs/vfsService';
import { VfsNode, VfsNodeType } from '../vfs/types';

export type ViewMode = 'icons' | 'details';

interface FsState {
    currentPath: string;
    history: string[];
    historyIndex: number;
    viewMode: ViewMode;
    selectedIds: string[];
    showHidden: boolean;
    searchQuery: string;
    items: VfsNode[];
    error: string | null;
    navigate: (path: string) => void;
    goBack: () => void;
    goForward: () => void;
    goUp: () => void;
    setViewMode: (mode: ViewMode) => void;
    toggleHidden: () => void;
    setSearchQuery: (query: string) => void;
    selectItem: (id: string, multi: boolean, range: boolean) => void;
    clearSelection: () => void;
    createFolder: (name: string) => void;
    createFile: (name: string, content?: string) => void;
    renameItem: (id: string, newName: string) => void;
    deleteItems: (ids: string[]) => void;
    clearError: () => void;
    refresh: () => void;
}

export const useFsStore = create<FsState>((set, get) => ({
    currentPath: '/home/user',
    history: ['/home/user'],
    historyIndex: 0,
    viewMode: 'icons',
    selectedIds: [],
    showHidden: false,
    searchQuery: '',
    items: getVisibleItems('/home/user', ''),
    error: null,
    refresh: () => {
        const { currentPath, searchQuery } = get();
        try {
            set({ items: getVisibleItems(currentPath, searchQuery), error: null });
        } catch (e: any) {
            set({ error: e.message });
        }
    },
    navigate: (path) => {
        try {
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
        } catch (e: any) {
            set({ error: e.message });
        }
    },
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
    goUp: () => {
        const { currentPath } = get();
        if (currentPath === '/') {
            return;
        }

        try {
            const parentPath = getParentPath(currentPath);
            if (parentPath) {
                get().navigate(parentPath);
            }
        } catch (e: any) {
            set({ error: e.message });
        }
    },
    setViewMode: (mode) => set({ viewMode: mode }),
    toggleHidden: () => set((state) => ({ showHidden: !state.showHidden })),
    setSearchQuery: (query) => {
        set({ searchQuery: query });
        get().refresh();
    },
    selectItem: (id, multi, range) => {
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
    createFolder: (name) => {
        const { currentPath } = get();
        try {
            vfs.createNode(currentPath, name, VfsNodeType.DIR);
            get().refresh();
        } catch (e: any) {
            set({ error: e.message });
        }
    },
    createFile: (name, content = '') => {
        const { currentPath } = get();
        try {
            vfs.createNode(currentPath, name, VfsNodeType.FILE, content);
            get().refresh();
        } catch (e: any) {
            set({ error: e.message });
        }
    },
    renameItem: (id, newName) => {
        try {
            const node = vfs.getNodeById(id);
            if (!node) {
                return;
            }

            vfs.rename(vfs.getPath(id), newName);
            get().refresh();
        } catch (e: any) {
            set({ error: e.message });
        }
    },
    deleteItems: (ids) => {
        try {
            for (const id of ids) {
                try {
                    vfs.delete(vfs.getPath(id));
                } catch {
                    // Preserve current partial-delete behavior.
                }
            }

            set({ selectedIds: [] });
            get().refresh();
        } catch (e: any) {
            set({ error: e.message });
        }
    },
    clearError: () => set({ error: null }),
}));
