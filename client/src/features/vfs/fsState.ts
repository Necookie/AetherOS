import { vfs } from '../../vfs/vfsService'
import { VfsNodeType, type VfsNode } from '../../vfs/types'

export type FsNavigationState = {
    currentPath: string
    history: string[]
    historyIndex: number
    searchQuery: string
}

export function getVisibleItems(currentPath: string, searchQuery: string): VfsNode[] {
    let items = vfs.readDir(currentPath)

    if (searchQuery) {
        const normalizedQuery = searchQuery.toLowerCase()
        items = items.filter((node) => node.name.toLowerCase().includes(normalizedQuery))
    }

    return [...items].sort((left, right) => {
        if (left.type === right.type) {
            return left.name.localeCompare(right.name)
        }

        return left.type === VfsNodeType.DIR ? -1 : 1
    })
}

export function navigateToPath(state: FsNavigationState, path: string) {
    if (path === state.currentPath) {
        return state
    }

    const node = vfs.resolvePath(path)
    if (node.type !== VfsNodeType.DIR) {
        throw new Error('Not a directory')
    }

    const history = state.history.slice(0, state.historyIndex + 1)
    history.push(path)

    return {
        currentPath: path,
        history,
        historyIndex: history.length - 1,
        searchQuery: '',
    }
}

export function stepHistory(state: FsNavigationState, direction: -1 | 1) {
    const nextIndex = state.historyIndex + direction
    if (nextIndex < 0 || nextIndex >= state.history.length) {
        return null
    }

    return {
        currentPath: state.history[nextIndex],
        history: state.history,
        historyIndex: nextIndex,
        searchQuery: '',
    }
}

export function getParentPath(currentPath: string) {
    if (currentPath === '/') {
        return null
    }

    const node = vfs.resolvePath(currentPath)
    if (!node.parentId) {
        return null
    }

    return vfs.getPath(node.parentId)
}
