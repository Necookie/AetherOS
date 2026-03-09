import {
    applyBack,
    applyForward,
    createTabId,
    createTabState,
} from '../../apps/browser/domains/tabs/tabDomain';
import { appendHistory } from '../../apps/browser/domains/history/historyDomain';
import {
    hasBookmark,
    removeBookmark,
    upsertBookmark,
} from '../../apps/browser/domains/bookmarks/bookmarkDomain';
import {
    markNavigation,
    markTabActivated,
} from '../../apps/browser/domains/session/sessionDomain';
import { reportKernelActivity } from '../../features/kernel/activityReporter';
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

function isLikelyDownload(url: string) {
    return /\.(zip|rar|7z|pdf|csv|dmg|exe|msi|apk|deb|tar|gz)$/i.test(url);
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
                session: markTabActivated(state.session, id),
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
                        session: markTabActivated(state.session, newId),
                    };
                }

                return {
                    tabsById: newTabsById,
                    tabOrder: newTabOrder,
                    activeTabId: newActiveTabId,
                    session: markTabActivated(state.session, newActiveTabId),
                };
            });
        },
        setActiveTab: (id: string) => set((state) => ({
            activeTabId: id,
            session: markTabActivated(state.session, id),
        })),
        navigate: (id: string, inputString: string) => {
            get().navigateToUrl(id, inputString);
        },
        navigateToUrl: (id: string, url: string) => {
            reportKernelActivity({
                type: 'browser-navigate',
                sourceAppId: 'browser',
                targetAppId: 'browser',
            });
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
            reportKernelActivity({
                type: isLikelyDownload(url) ? 'browser-download' : 'browser-navigate',
                sourceAppId: 'browser',
                targetAppId: 'browser',
                units: isLikelyDownload(url) ? 1.2 : 1,
            });
            const tabId = opts.reuseTabId || createTabId();

            set((state) => {
                const existingTab = state.tabsById[tabId];
                const nextTab = {
                    ...(existingTab || createTabState(tabId)),
                    title: new URL(url).hostname || 'External Link',
                    url,
                    displayUrl: url,
                    mode: 'external' as const,
                    externalUrl: url,
                    isLoading: false,
                };

                return {
                    tabsById: { ...state.tabsById, [tabId]: nextTab },
                    tabOrder: existingTab ? state.tabOrder : [...state.tabOrder, tabId],
                    activeTabId: tabId,
                    session: markTabActivated(state.session, tabId),
                };
            });

            try {
                window.open(url, '_blank', 'noopener,noreferrer');
            } catch (error) {
                console.error('Failed to open _blank tab', error);
            }
        },
        back: (id: string) => {
            reportKernelActivity({
                type: 'browser-navigate',
                sourceAppId: 'browser',
                targetAppId: 'browser',
                units: 0.8,
            });
            set((state) => withUpdatedTab(state, id, (tab) => applyBack(tab)));
        },
        forward: (id: string) => {
            reportKernelActivity({
                type: 'browser-navigate',
                sourceAppId: 'browser',
                targetAppId: 'browser',
                units: 0.8,
            });
            set((state) => withUpdatedTab(state, id, (tab) => applyForward(tab)));
        },
        reload: (id: string) => {
            reportKernelActivity({
                type: 'browser-navigate',
                sourceAppId: 'browser',
                targetAppId: 'browser',
                units: 0.9,
            });
            set((state) => withUpdatedTab(state, id, (tab) => ({ ...tab, isLoading: true })));
        },
        setSearchEngine: (engine: BrowserStore['settings']['defaultSearchEngine']) => set((state) => ({
            settings: { ...state.settings, defaultSearchEngine: engine },
        })),
        recordHistory: (entry: Parameters<BrowserStore['recordHistory']>[0]) => set((state) => ({
            historyGlobal: appendHistory(state.historyGlobal, entry),
            session: markNavigation(state.session, state.activeTabId),
        })),
        toggleBookmark: (entry: { url: string; title: string }) => set((state) => ({
            bookmarks: hasBookmark(state.bookmarks, entry.url)
                ? removeBookmark(state.bookmarks, entry.url)
                : upsertBookmark(state.bookmarks, entry),
        })),
        setConnectivityOnline: (online: boolean) => set((state) => ({
            connectivity: { ...state.connectivity, online },
        })),
        setConnectivityLatency: (latencyMs: number) => set((state) => ({
            connectivity: {
                ...state.connectivity,
                latencyMs: Math.max(0, Math.round(latencyMs)),
            },
        })),
    };
}
