import type { BrowserStoreState } from './types';
import { createInitialSessionState } from '../../apps/browser/domains/session/sessionDomain';

export const initialBrowserStoreState: BrowserStoreState = {
    tabsById: {},
    tabOrder: [],
    activeTabId: null,
    settings: {
        defaultSearchEngine: 'duckduckgo',
    },
    historyGlobal: [],
    bookmarks: [],
    session: createInitialSessionState(),
    connectivity: {
        online: true,
        latencyMs: 200,
        jitterMs: 120,
    },
};
