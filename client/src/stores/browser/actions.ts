import {
    createExternalTabState,
    createHistoryEntry,
    createTabId,
    createTabState,
} from '../../apps/browser/browserState';
import type { BrowserStore } from './types';

function withUpdatedTab(
    state: BrowserStore,
    id: string,
    updater: (tab: BrowserStore['tabsById'][string]) => BrowserStore['tabsById'][string],
) {
    const tab = state.tabsById[id];
    if (!tab) {
        return state;
    }

    return {
        tabsById: {
            ...state.tabsById,
            [id]: updater(tab),
        },
    };
}

export function createBrowserActions(
    set: (partial: BrowserStore | Partial<BrowserStore> | ((state: BrowserStore) => BrowserStore | Partial<BrowserStore>), replace?: boolean | undefined) => void,
    get: () => BrowserStore,
) {
    return {
        newTab: (args: { url?: string; mode?: BrowserStore['tabsById'][string]['mode'] } = {}) => {
            const id = createTabId();
            const newTab = createTabState(id, args);

            set((state) => ({
                tabsById: { ...state.tabsById, [id]: newTab },
                tabOrder: [...state.tabOrder, id],
                activeTabId: id,
            }));
        },
        closeTab: (id: string) => {
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
        setActiveTab: (id: string) => set({ activeTabId: id }),
        navigate: (id: string, inputString: string) => {
            get().navigateToUrl(id, inputString);
        },
        navigateToUrl: (id: string, url: string) => {
            set((state) => withUpdatedTab(state, id, (tab) => ({
                ...tab,
                backStack: tab.url ? [...tab.backStack, tab.url] : tab.backStack,
                forwardStack: [],
                url,
                displayUrl: url,
                isLoading: true,
            })));
        },
        openExternal: (url: string, opts: { reuseTabId?: string } = {}) => {
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
        back: (id: string) => {
            set((state) => withUpdatedTab(state, id, (tab) => {
                if (tab.backStack.length === 0) {
                    return tab;
                }

                const newBackStack = [...tab.backStack];
                const previousUrl = newBackStack.pop()!;

                return {
                    ...tab,
                    backStack: newBackStack,
                    forwardStack: tab.url ? [...tab.forwardStack, tab.url] : tab.forwardStack,
                    url: previousUrl,
                    displayUrl: previousUrl,
                    isLoading: true,
                };
            }));
        },
        forward: (id: string) => {
            set((state) => withUpdatedTab(state, id, (tab) => {
                if (tab.forwardStack.length === 0) {
                    return tab;
                }

                const newForwardStack = [...tab.forwardStack];
                const nextUrl = newForwardStack.pop()!;

                return {
                    ...tab,
                    forwardStack: newForwardStack,
                    backStack: tab.url ? [...tab.backStack, tab.url] : tab.backStack,
                    url: nextUrl,
                    displayUrl: nextUrl,
                    isLoading: true,
                };
            }));
        },
        reload: (id: string) => {
            set((state) => withUpdatedTab(state, id, (tab) => ({ ...tab, isLoading: true })));
        },
        setSearchEngine: (engine: BrowserStore['settings']['defaultSearchEngine']) => set((state) => ({
            settings: { ...state.settings, defaultSearchEngine: engine },
        })),
        recordHistory: (entry: Parameters<BrowserStore['recordHistory']>[0]) => set((state) => ({
            historyGlobal: [...state.historyGlobal, createHistoryEntry(entry)],
        })),
    };
}
