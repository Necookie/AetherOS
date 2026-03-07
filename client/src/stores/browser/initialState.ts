import type { BrowserStoreState } from './types';

export const initialBrowserStoreState: BrowserStoreState = {
    tabsById: {},
    tabOrder: [],
    activeTabId: null,
    settings: {
        defaultSearchEngine: 'duckduckgo',
    },
    historyGlobal: [],
};
