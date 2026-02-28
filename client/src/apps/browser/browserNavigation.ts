import type { BrowserSettings, TabState } from '../../types/browser'
import { isEmbeddableUrl } from './security/embedPolicy'
import { parseInputToUrl } from './security/urlUtils'

export type BrowserNavigationResult =
    | { kind: 'blocked' }
    | { kind: 'noop' }
    | { kind: 'embed'; url: string; title: string }
    | { kind: 'external'; url: string; title: string }

export function resolveBrowserNavigation(input: string, settings: BrowserSettings): BrowserNavigationResult {
    const { url, isSearch, isUnsafe } = parseInputToUrl(input, settings.defaultSearchEngine)

    if (isUnsafe) {
        return { kind: 'blocked' }
    }

    if (!url) {
        return { kind: 'noop' }
    }

    const title = isSearch ? `Search — ${input}` : getHostnameOrUrl(url)

    if (isSearch || isEmbeddableUrl(url)) {
        return { kind: 'embed', url, title }
    }

    return { kind: 'external', url, title }
}

export function updateTabForNavigation(tab: TabState, nextState: {
    url: string
    title: string
    mode: TabState['mode']
    isLoading: boolean
    externalUrl?: string
}) {
    return {
        ...tab,
        backStack: tab.url ? [...tab.backStack, tab.url] : tab.backStack,
        forwardStack: [],
        url: nextState.url,
        displayUrl: nextState.url,
        title: nextState.title,
        mode: nextState.mode,
        isLoading: nextState.isLoading,
        externalUrl: nextState.externalUrl,
    }
}

export function getHostnameOrUrl(url: string) {
    try {
        return new URL(url).hostname
    } catch {
        return url
    }
}
