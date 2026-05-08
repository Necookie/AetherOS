const AETHER_BROWSER_HOST = 'browser.aether'

export interface SimulationSearchLocation {
    kind: 'search'
    query: string
}

export interface SimulationResultLocation {
    kind: 'result'
    query: string
    id: string
    targetUrl: string
}

export type SimulationLocation = SimulationSearchLocation | SimulationResultLocation

export function buildSimulationSearchUrl(query: string) {
    const encodedQuery = encodeURIComponent(query.trim())
    return `https://${AETHER_BROWSER_HOST}/search?q=${encodedQuery}`
}

export function buildSimulationResultUrl(args: { query: string; id: string; targetUrl: string }) {
    const params = new URLSearchParams({
        q: args.query.trim(),
        id: args.id,
        target: args.targetUrl,
    })
    return `https://${AETHER_BROWSER_HOST}/result?${params.toString()}`
}

export function parseSimulationUrl(url: string): SimulationLocation | null {
    try {
        const parsed = new URL(url)
        if (parsed.hostname !== AETHER_BROWSER_HOST) {
            return null
        }

        if (parsed.pathname === '/search') {
            const query = parsed.searchParams.get('q')?.trim() ?? ''
            if (!query) {
                return null
            }

            return {
                kind: 'search',
                query,
            }
        }

        if (parsed.pathname === '/result') {
            const query = parsed.searchParams.get('q')?.trim() ?? ''
            const id = parsed.searchParams.get('id')?.trim() ?? ''
            const targetUrl = parsed.searchParams.get('target')?.trim() ?? ''
            if (!query || !id || !targetUrl) {
                return null
            }

            return {
                kind: 'result',
                query,
                id,
                targetUrl,
            }
        }
    } catch {
        return null
    }

    return null
}

export function isSimulationUrl(url: string) {
    return parseSimulationUrl(url) !== null
}

export function getDisplayUrlForStoredUrl(url: string) {
    const parsed = parseSimulationUrl(url)
    if (!parsed) {
        return url
    }

    if (parsed.kind === 'search') {
        return parsed.query
    }

    return parsed.targetUrl
}
