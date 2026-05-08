import type { TabMode, TabState } from '../../../../types/browser';
import { getDisplayUrlForStoredUrl, isSimulationUrl } from '../../simulation/simulationUrls'

export function createTabId() {
    return `tab_${Math.random().toString(36).slice(2, 9)}`;
}

export function createTabState(id: string, args: { url?: string; mode?: TabMode } = {}): TabState {
    const { url = '', mode = 'internal' } = args;

    return {
        id,
        title: url || 'New Tab',
        url,
        displayUrl: getDisplayUrlForStoredUrl(url),
        mode,
        isLoading: false,
        backStack: [],
        forwardStack: [],
    };
}

export function updateTabForNavigation(
    tab: TabState,
    nextState: {
        url: string;
        title: string;
        mode: TabState['mode'];
        isLoading: boolean;
        externalUrl?: string;
    },
): TabState {
    return {
        ...tab,
        backStack: tab.url ? [...tab.backStack, tab.url] : tab.backStack,
        forwardStack: [],
        url: nextState.url,
        displayUrl: getDisplayUrlForStoredUrl(nextState.url),
        title: nextState.title,
        mode: nextState.mode,
        isLoading: nextState.isLoading,
        externalUrl: nextState.externalUrl,
    };
}

export function applyBack(tab: TabState): TabState {
    if (tab.backStack.length === 0) {
        return tab;
    }

    const nextBackStack = [...tab.backStack];
    const previousUrl = nextBackStack.pop()!;

    return {
        ...tab,
        backStack: nextBackStack,
        forwardStack: tab.url ? [...tab.forwardStack, tab.url] : tab.forwardStack,
        url: previousUrl,
        displayUrl: getDisplayUrlForStoredUrl(previousUrl),
        isLoading: !isSimulationUrl(previousUrl),
    };
}

export function applyForward(tab: TabState): TabState {
    if (tab.forwardStack.length === 0) {
        return tab;
    }

    const nextForwardStack = [...tab.forwardStack];
    const nextUrl = nextForwardStack.pop()!;

    return {
        ...tab,
        forwardStack: nextForwardStack,
        backStack: tab.url ? [...tab.backStack, tab.url] : tab.backStack,
        url: nextUrl,
        displayUrl: getDisplayUrlForStoredUrl(nextUrl),
        isLoading: !isSimulationUrl(nextUrl),
    };
}
