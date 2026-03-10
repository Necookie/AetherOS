import type { VfsNode } from '../../vfs/types';
import type { FsSortBy, FsSortDirection } from '../../vfs/fsState';

export type ViewMode = 'icons' | 'details';

export interface FsStoreState {
    currentPath: string;
    history: string[];
    historyIndex: number;
    viewMode: ViewMode;
    selectedIds: string[];
    selectionAnchorId: string | null;
    showHidden: boolean;
    searchQuery: string;
    sortBy: FsSortBy;
    sortDirection: FsSortDirection;
    items: VfsNode[];
    directoryTree: VfsNode[];
    isMutating: boolean;
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
    setSort: (sortBy: FsSortBy, sortDirection?: FsSortDirection) => void;
    selectItem: (id: string, multi: boolean, range: boolean) => void;
    setSelection: (ids: string[], anchorId?: string | null) => void;
    clearSelection: () => void;
    revealPath: (path: string) => boolean;
    createFolder: (name: string) => void;
    createFile: (name: string, content?: string) => void;
    renameItem: (id: string, newName: string) => void;
    deleteItems: (ids: string[]) => void;
    restoreItems: (ids: string[]) => void;
    permanentlyDeleteItems: (ids: string[]) => void;
    emptyTrash: () => void;
    moveItems: (ids: string[], destinationPath: string) => void;
    clearError: () => void;
    refresh: () => void;
}

export type FsStore = FsStoreState & FsStoreActions;
