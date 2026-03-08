import { fsService } from './vfsService';
import { VfsNodeType, type VfsNode } from './types';

export type FsNavigationState = {
    currentPath: string;
    history: string[];
    historyIndex: number;
    searchQuery: string;
};

export type FsSortBy = 'name' | 'type' | 'size' | 'modified';
export type FsSortDirection = 'asc' | 'desc';

interface ListOptions {
    includeHidden: boolean;
    sortBy: FsSortBy;
    sortDirection: FsSortDirection;
    useIndexedSearch?: boolean;
}

export function getVisibleItems(currentPath: string, searchQuery: string, options: ListOptions): VfsNode[] {
    const { includeHidden, sortBy, sortDirection, useIndexedSearch = true } = options;

    let items = searchQuery.trim() && useIndexedSearch
        ? fsService.search(searchQuery, {
            rootPath: currentPath,
            includeHidden,
            limit: 500,
        })
        : fsService.readDir(currentPath);

    if (!includeHidden) {
        items = items.filter((node) => !node.name.startsWith('.'));
    }

    if (searchQuery.trim() && !useIndexedSearch) {
        const normalizedQuery = searchQuery.toLowerCase();
        items = items.filter((node) => node.name.toLowerCase().includes(normalizedQuery));
    }

    return sortItems(items, sortBy, sortDirection);
}

export function sortItems(items: VfsNode[], sortBy: FsSortBy, direction: FsSortDirection): VfsNode[] {
    const factor = direction === 'asc' ? 1 : -1;

    return [...items].sort((left, right) => {
        const directoryPriority = left.type === VfsNodeType.DIR ? 0 : 1;
        const rightDirectoryPriority = right.type === VfsNodeType.DIR ? 0 : 1;
        if (directoryPriority !== rightDirectoryPriority) {
            return directoryPriority - rightDirectoryPriority;
        }

        if (sortBy === 'type') {
            const byType = left.type.localeCompare(right.type) * factor;
            return byType !== 0 ? byType : left.name.localeCompare(right.name) * factor;
        }

        if (sortBy === 'size') {
            const bySize = (left.size - right.size) * factor;
            return bySize !== 0 ? bySize : left.name.localeCompare(right.name);
        }

        if (sortBy === 'modified') {
            const byModified = (left.modifiedAt - right.modifiedAt) * factor;
            return byModified !== 0 ? byModified : left.name.localeCompare(right.name);
        }

        return left.name.localeCompare(right.name) * factor;
    });
}

export function navigateToPath(state: FsNavigationState, path: string) {
    const normalizedPath = fsService.normalizePath(path);
    if (normalizedPath === state.currentPath) {
        return state;
    }

    const node = fsService.resolvePath(normalizedPath);
    if (node.type !== VfsNodeType.DIR) {
        throw new Error('Not a directory');
    }

    const history = state.history.slice(0, state.historyIndex + 1);
    history.push(normalizedPath);

    return {
        currentPath: normalizedPath,
        history,
        historyIndex: history.length - 1,
        searchQuery: '',
    };
}

export function stepHistory(state: FsNavigationState, direction: -1 | 1) {
    const nextIndex = state.historyIndex + direction;
    if (nextIndex < 0 || nextIndex >= state.history.length) {
        return null;
    }

    return {
        currentPath: state.history[nextIndex],
        history: state.history,
        historyIndex: nextIndex,
        searchQuery: '',
    };
}

export function getParentPath(currentPath: string) {
    if (currentPath === '/') {
        return null;
    }

    const node = fsService.resolvePath(currentPath);
    if (!node.parentId) {
        return null;
    }

    return fsService.getPath(node.parentId);
}

export function getDirectoryTree(path: string, includeHidden: boolean) {
    return fsService.listTree(path, {
        depth: 4,
        includeHidden,
    });
}
