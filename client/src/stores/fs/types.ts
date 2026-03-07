import type { VfsNode } from '../../vfs/types';

export type ViewMode = 'icons' | 'details';

export interface FsStoreState {
    currentPath: string;
    history: string[];
    historyIndex: number;
    viewMode: ViewMode;
    selectedIds: string[];
    showHidden: boolean;
    searchQuery: string;
    items: VfsNode[];
    error: string | null;
}

export interface FsStoreActions {
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

export type FsStore = FsStoreState & FsStoreActions;
