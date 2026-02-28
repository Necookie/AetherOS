import { getKernelTime } from '../../lib/kernelClock'
import type { HistoryEntry, TabMode, TabState } from '../../types/browser'

export function createTabId() {
    return `tab_${Math.random().toString(36).substring(2, 9)}`
}

export function createTabState(id: string, args: { url?: string; mode?: TabMode } = {}): TabState {
    const { url = '', mode = 'internal' } = args

    return {
        id,
        title: url || 'New Tab',
        url,
        displayUrl: url,
        mode,
        isLoading: false,
        backStack: [],
        forwardStack: [],
    }
}

export function createExternalTabState(id: string, url: string, previousTab?: TabState): TabState {
    return {
        id,
        title: new URL(url).hostname || 'External Link',
        url,
        displayUrl: url,
        mode: 'external',
        externalUrl: url,
        openedAt: getKernelTime(),
        isLoading: false,
        backStack: previousTab ? previousTab.backStack : [],
        forwardStack: previousTab ? previousTab.forwardStack : [],
    }
}

export function createHistoryEntry(entry: Omit<HistoryEntry, 'timestamp'>): HistoryEntry {
    return {
        ...entry,
        timestamp: getKernelTime(),
    }
}
