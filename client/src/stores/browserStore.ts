import { create } from 'zustand';
import {
    createExternalTabState,
    createHistoryEntry,
    createTabId,
    createTabState,
} from '../apps/browser/browserState';
import { BrowserSettings, HistoryEntry, SearchEngine, TabMode, TabState } from '../types/browser';

interface BrowserStore {
    tabsById: Record<string, TabState>;
    tabOrder: string[];
    activeTabId: string | null;
    settings: BrowserSettings;
    historyGlobal: HistoryEntry[];
    newTab: (args?: { url?: string; mode?: TabMode }) => void;
    closeTab: (id: string) => void;
    setActiveTab: (id: string) => void;
    navigate: (id: string, inputString: string) => void;
    navigateToUrl: (id: string, url: string) => void;
    openExternal: (url: string, opts?: { reuseTabId?: string }) => void;
    back: (id: string) => void;
    forward: (id: string) => void;
    reload: (id: string) => void;
    setSearchEngine: (engine: SearchEngine) => void;
    recordHistory: (entry: Omit<HistoryEntry, 'timestamp'>) => void;
}

export const useBrowserStore = create<BrowserStore>((set, get) => ({
    tabsById: {},
    tabOrder: [],
    activeTabId: null,
    settings: {
        defaultSearchEngine: 'duckduckgo',
    },
    historyGlobal: [],
    newTab: (args = {}) => {
        const id = createTabId();
        const newTab = createTabState(id, args);

        set((state) => ({
            tabsById: { ...state.tabsById, [id]: newTab },
            tabOrder: [...state.tabOrder, id],
            activeTabId: id,
        }));
    },
    closeTab: (id) => {
        set((state) => {
            const newTabsById = { ...state.tabsById };
            delete newTabsById[id];

            const newTabOrder = state.tabOrder.filter((tabId) => tabId !== id);
            let newActiveTabId = state.activeTabId;

            if (state.activeTabId === id) {
                if (newTabOrder.length > 0) {
                    const closedIndex = state.tabOrder.indexOf(id);
                    newActiveTabId = newTabOrder[Math.max(0, closedIndex - 1)];
                } else {
                    newActiveTabId = null;
                }
            }

            if (newTabOrder.length === 0) {
                const newId = createTabId();
                return {
                    tabsById: { [newId]: createTabState(newId) },
                    tabOrder: [newId],
                    activeTabId: newId,
                };
            }

            return {
                tabsById: newTabsById,
                tabOrder: newTabOrder,
                activeTabId: newActiveTabId,
            };
        });
    },
    setActiveTab: (id) => set({ activeTabId: id }),
    navigate: (id, inputString) => {
        get().navigateToUrl(id, inputString);
    },
    navigateToUrl: (id, url) => {
        set((state) => {
            const tab = state.tabsById[id];
            if (!tab) {
                return state;
            }

            return {
                tabsById: {
                    ...state.tabsById,
                    [id]: {
                        ...tab,
                        backStack: tab.url ? [...tab.backStack, tab.url] : tab.backStack,
                        forwardStack: [],
                        url,
                        displayUrl: url,
                        isLoading: true,
                    },
                },
            };
        });
    },
    openExternal: (url, opts = {}) => {
        const tabId = opts.reuseTabId || createTabId();

        set((state) => {
            const existingTab = state.tabsById[tabId];
            const newTab = createExternalTabState(tabId, url, existingTab);
            const newTabOrder = existingTab ? state.tabOrder : [...state.tabOrder, tabId];

            return {
                tabsById: { ...state.tabsById, [tabId]: newTab },
                tabOrder: newTabOrder,
                activeTabId: tabId,
            };
        });

        try {
            window.open(url, '_blank', 'noopener,noreferrer');
        } catch (error) {
            console.error('Failed to open _blank tab', error);
        }
    },
    back: (id) => {
        set((state) => {
            const tab = state.tabsById[id];
            if (!tab || tab.backStack.length === 0) {
                return state;
            }

            const newBackStack = [...tab.backStack];
            const previousUrl = newBackStack.pop()!;

            return {
                tabsById: {
                    ...state.tabsById,
                    [id]: {
                        ...tab,
                        backStack: newBackStack,
                        forwardStack: tab.url ? [...tab.forwardStack, tab.url] : tab.forwardStack,
                        url: previousUrl,
                        displayUrl: previousUrl,
                        isLoading: true,
                    },
                },
            };
        });
    },
    forward: (id) => {
        set((state) => {
            const tab = state.tabsById[id];
            if (!tab || tab.forwardStack.length === 0) {
                return state;
            }

            const newForwardStack = [...tab.forwardStack];
            const nextUrl = newForwardStack.pop()!;

            return {
                tabsById: {
                    ...state.tabsById,
                    [id]: {
                        ...tab,
                        forwardStack: newForwardStack,
                        backStack: tab.url ? [...tab.backStack, tab.url] : tab.backStack,
                        url: nextUrl,
                        displayUrl: nextUrl,
                        isLoading: true,
                    },
                },
            };
        });
    },
    reload: (id) => {
        set((state) => {
            const tab = state.tabsById[id];
            if (!tab) {
                return state;
            }

            return {
                tabsById: {
                    ...state.tabsById,
                    [id]: {
                        ...tab,
                        isLoading: true,
                    },
                },
            };
        });
    },
    setSearchEngine: (engine) => set((state) => ({
        settings: { ...state.settings, defaultSearchEngine: engine },
    })),
    recordHistory: (entry) => set((state) => ({
        historyGlobal: [...state.historyGlobal, createHistoryEntry(entry)],
    })),
}));
