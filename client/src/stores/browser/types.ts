import type {
    BrowserSettings,
    HistoryEntry,
    SearchEngine,
    TabMode,
    TabState,
} from '../../types/browser';

export interface BrowserStoreState {
    tabsById: Record<string, TabState>;
    tabOrder: string[];
    activeTabId: string | null;
    settings: BrowserSettings;
    historyGlobal: HistoryEntry[];
}

export interface BrowserStoreActions {
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

export type BrowserStore = BrowserStoreState & BrowserStoreActions;
