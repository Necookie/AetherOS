import { SearchEngine } from '../../../types/browser';

const BLOCKED_SCHEMES = ['file:', 'data:', 'javascript:', 'about:', 'chrome:', 'ws:', 'wss:'];

export const normalizeUrl = (input: string): string => {
    let url = input.trim();

    // Auto-prepend https:// if it looks like a domain without a scheme
    if (!/^https?:\/\//i.test(url)) {
        // Basic check if it contains a dot and no spaces, assume it's meant to be a domain
        if (url.includes('.') && !url.includes(' ')) {
            url = `https://${url}`;
        }
    }

    return url;
};

export const getSearchUrl = (query: string, engine: SearchEngine): string => {
    const encodedQuery = encodeURIComponent(query);
    switch (engine) {
        case 'duckduckgo':
            return `https://duckduckgo.com/?q=${encodedQuery}`;
        case 'google':
            return `https://www.google.com/search?q=${encodedQuery}`;
        case 'bing':
            return `https://www.bing.com/search?q=${encodedQuery}`;
        case 'brave':
            return `https://search.brave.com/search?q=${encodedQuery}`;
        case 'startpage':
            return `https://startpage.com/sp/search?query=${encodedQuery}`;
        default:
            return `https://duckduckgo.com/?q=${encodedQuery}`;
    }
};

export const parseInputToUrl = (input: string, defaultEngine: SearchEngine): { url: string; isSearch: boolean; isUnsafe: boolean } => {
    const trimmed = input.trim();

    if (!trimmed) {
        return { url: '', isSearch: false, isUnsafe: false };
    }

    // Check if it's likely a URL vs a search query
    // Very simple heuristic: contains space -> search, else try to parse as URL
    if (trimmed.includes(' ') && !trimmed.startsWith('http')) {
        return { url: getSearchUrl(trimmed, defaultEngine), isSearch: true, isUnsafe: false };
    }

    const normalized = normalizeUrl(trimmed);

    try {
        const parsedUrl = new URL(normalized);

        if (BLOCKED_SCHEMES.includes(parsedUrl.protocol)) {
            return { url: '', isSearch: false, isUnsafe: true };
        }

        return { url: parsedUrl.href, isSearch: false, isUnsafe: false };
    } catch {
        // Failed to parse even after normalization, treat as search
        return { url: getSearchUrl(trimmed, defaultEngine), isSearch: true, isUnsafe: false };
    }
};
