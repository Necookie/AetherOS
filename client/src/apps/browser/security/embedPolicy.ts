export const ALLOWED_EMBED_HOSTNAMES = [
    'duckduckgo.com',
    'www.google.com',
    'google.com', // Normalize often drops www
    'bing.com',
    'www.bing.com',
    'search.brave.com',
    'startpage.com',
];

export const isEmbeddableUrl = (urlStr: string): boolean => {
    try {
        const parsed = new URL(urlStr);
        return ALLOWED_EMBED_HOSTNAMES.includes(parsed.hostname);
    } catch {
        return false;
    }
};
