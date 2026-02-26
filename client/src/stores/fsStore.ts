import { create } from 'zustand';
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
    items: vfs.readDir('/home/user'),
    error: null,

    refresh: () => {
        const { currentPath, searchQuery } = get();
        try {
            let items = vfs.readDir(currentPath);
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                items = items.filter(n => n.name.toLowerCase().includes(query));
            }
            // Sort: directories first, then files by name
            items.sort((a, b) => {
                if (a.type === b.type) return a.name.localeCompare(b.name);
                return a.type === VfsNodeType.DIR ? -1 : 1;
            });
            set({ items, error: null });
        } catch (e: any) {
            set({ error: e.message });
        }
    },

    navigate: (path: string) => {
        const { history, historyIndex, currentPath } = get();
        if (path === currentPath) return; // Ignore if already there
        try {
            const node = vfs.resolvePath(path);
            if (node.type !== VfsNodeType.DIR) throw new Error('Not a directory');

            const newHistory = history.slice(0, historyIndex + 1);
            newHistory.push(path);

            set({
                currentPath: path,
                history: newHistory,
                historyIndex: newHistory.length - 1,
                selectedIds: [],
                searchQuery: '',
                error: null
            });
            get().refresh();
        } catch (e: any) {
            set({ error: e.message });
        }
    },

    goBack: () => {
        const { history, historyIndex } = get();
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            set({
                currentPath: history[newIndex],
                historyIndex: newIndex,
                selectedIds: [],
                searchQuery: '',
                error: null
            });
            get().refresh();
        }
    },

    goForward: () => {
        const { history, historyIndex } = get();
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            set({
                currentPath: history[newIndex],
                historyIndex: newIndex,
                selectedIds: [],
                searchQuery: '',
                error: null
            });
            get().refresh();
        }
    },

    goUp: () => {
        const { currentPath } = get();
        if (currentPath === '/') return;
        try {
            const node = vfs.resolvePath(currentPath);
            if (node.parentId) {
                const parentNode = vfs.getNodeById(node.parentId)!;
                const parentPath = vfs.getPath(parentNode.id);
                get().navigate(parentPath);
            }
        } catch (e: any) {
            set({ error: e.message });
        }
    },

    setViewMode: (mode) => set({ viewMode: mode }),

    toggleHidden: () => {
        set((state) => ({ showHidden: !state.showHidden }));
    },

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
                        ? state.selectedIds.filter(x => x !== id)
                        : [...state.selectedIds, id]
                };
            }
            if (range) {
                // Future enhancement: proper shift-click index based range selection
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
            if (!node) return;
            const path = vfs.getPath(id);
            vfs.rename(path, newName);
            get().refresh();
        } catch (e: any) {
            set({ error: e.message });
        }
    },

    deleteItems: (ids) => {
        try {
            for (const id of ids) {
                try {
                    const path = vfs.getPath(id);
                    vfs.delete(path);
                } catch (e) { /* ignore single error if multiple delete */ }
            }
            set({ selectedIds: [] });
            get().refresh();
        } catch (e: any) {
            set({ error: e.message });
        }
    },

    clearError: () => set({ error: null })
}));
