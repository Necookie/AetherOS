export type SearchEngine = 'duckduckgo' | 'google' | 'bing' | 'brave' | 'startpage';

export type TabMode = 'internal' | 'embed' | 'external';

export interface HistoryEntry {
    url: string;
    title: string;
    timestamp: number; // Kernel clock timestamp
}

export interface TabState {
    id: string;
    title: string;
    url: string;
    displayUrl: string; // The URL shown in the address bar (clean)
    mode: TabMode;
    isLoading: boolean;
    backStack: string[];    // URLs in back history
    forwardStack: string[]; // URLs in forward history
    externalUrl?: string;   // Original requested URL if opened externally
    openedAt?: number;      // Kernel clock timestamp when opened externally
    lastError?: string;     // Any loading error
}

export interface BrowserSettings {
    defaultSearchEngine: SearchEngine;
}
