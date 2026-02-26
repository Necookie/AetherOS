import { create } from 'zustand';
import { getKernelTime } from '../lib/kernelClock';
import { TabState, HistoryEntry, BrowserSettings, TabMode, SearchEngine } from '../types/browser';

interface BrowserStore {
    tabsById: Record<string, TabState>;
    tabOrder: string[];
    activeTabId: string | null;
    settings: BrowserSettings;
    historyGlobal: HistoryEntry[];

    // Actions
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

const generateId = () => `tab_${Math.random().toString(36).substring(2, 9)}`;

export const useBrowserStore = create<BrowserStore>((set, get) => ({
    tabsById: {},
    tabOrder: [],
    activeTabId: null,
    settings: {
        defaultSearchEngine: 'duckduckgo',
    },
    historyGlobal: [],

    newTab: (args = {}) => {
        const id = generateId();
        const { url = '', mode = 'internal' } = args;
        const newTab: TabState = {
            id,
            title: url ? url : 'New Tab',
            url,
            displayUrl: url,
            mode,
            isLoading: false,
            backStack: [],
            forwardStack: []
        };

        set((state) => ({
            tabsById: { ...state.tabsById, [id]: newTab },
            tabOrder: [...state.tabOrder, id],
            activeTabId: id
        }));
    },

    closeTab: (id) => {
        set((state) => {
            const { tabsById, tabOrder, activeTabId } = state;
            const newTabsById = { ...tabsById };
            delete newTabsById[id];

            const newTabOrder = tabOrder.filter(tId => tId !== id);

            // If closed the active tab, try to activate the one before it
            let newActiveTabId = activeTabId;
            if (activeTabId === id) {
                if (newTabOrder.length > 0) {
                    const closedIdx = tabOrder.indexOf(id);
                    const newIdx = Math.max(0, closedIdx - 1);
                    newActiveTabId = newTabOrder[newIdx];
                } else {
                    newActiveTabId = null;
                }
            }

            // Always ensure at least one tab or let component handle empty state?
            if (newTabOrder.length === 0) {
                // Auto spawn new tab if last is closed
                const newId = generateId();
                return {
                    tabsById: {
                        [newId]: {
                            id: newId,
                            title: 'New Tab',
                            url: '',
                            displayUrl: '',
                            mode: 'internal',
                            isLoading: false,
                            backStack: [],
                            forwardStack: []
                        }
                    },
                    tabOrder: [newId],
                    activeTabId: newId
                }
            }

            return {
                tabsById: newTabsById,
                tabOrder: newTabOrder,
                activeTabId: newActiveTabId
            };
        });
    },

    setActiveTab: (id) => set({ activeTabId: id }),

    navigate: (id, inputString) => {
        // Will be connected to urlUtils shortly!
        // For now dummy call
        get().navigateToUrl(id, inputString);
    },

    navigateToUrl: (id, url) => {
        set((state) => {
            const tab = state.tabsById[id];
            if (!tab) return state;

            return {
                tabsById: {
                    ...state.tabsById,
                    [id]: {
                        ...tab,
                        backStack: tab.url ? [...tab.backStack, tab.url] : tab.backStack,
                        forwardStack: [], // clear forward stack on new navigation
                        url,
                        displayUrl: url,
                        isLoading: true, // will be finished by webview loading eagerly
                    }
                }
            };
        });
    },

    openExternal: (url, opts = {}) => {
        const { reuseTabId } = opts;

        // Use existing or spawn new external tab
        const tabId = reuseTabId || generateId();

        set((state) => {
            const existingTab = state.tabsById[tabId];
            const newTab: TabState = {
                id: tabId,
                title: new URL(url).hostname || 'External Link',
                url,
                displayUrl: url,
                mode: 'external',
                externalUrl: url,
                openedAt: getKernelTime(),
                isLoading: false,
                backStack: existingTab ? existingTab.backStack : [],
                forwardStack: existingTab ? existingTab.forwardStack : []
            };

            const newTabOrder = existingTab ? state.tabOrder : [...state.tabOrder, tabId];

            return {
                tabsById: { ...state.tabsById, [tabId]: newTab },
                tabOrder: newTabOrder,
                activeTabId: tabId
            };
        });

        // The actual side effect!
        try {
            window.open(url, "_blank", "noopener,noreferrer");
        } catch (e) {
            console.error('Failed to open _blank tab', e);
        }
    },

    back: (id) => {
        set((state) => {
            const tab = state.tabsById[id];
            if (!tab || tab.backStack.length === 0) return state;

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
                        isLoading: true
                    }
                }
            };
        });
    },

    forward: (id) => {
        set((state) => {
            const tab = state.tabsById[id];
            if (!tab || tab.forwardStack.length === 0) return state;

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
                        isLoading: true
                    }
                }
            };
        });
    },

    reload: (id) => {
        set((state) => {
            const tab = state.tabsById[id];
            if (!tab) return state;

            return {
                tabsById: {
                    ...state.tabsById,
                    [id]: {
                        ...tab,
                        isLoading: true,
                        // A neat trick to force iframe reload in React is toggling a key or url minimally
                        // For our store we just flip isLoading to true
                    }
                }
            };
        });
    },

    setSearchEngine: (engine) => set((state) => ({
        settings: { ...state.settings, defaultSearchEngine: engine }
    })),

    recordHistory: (entry) => set((state) => ({
        historyGlobal: [
            ...state.historyGlobal,
            { ...entry, timestamp: getKernelTime() }
        ]
    }))

}));
