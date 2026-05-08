export interface BrowserSearchResult {
    id: string
    title: string
    url: string
    displayUrl: string
    snippet: string
    source: 'live' | 'mock'
}

export interface BrowserSearchResponse {
    query: string
    mode: 'live' | 'mock'
    results: BrowserSearchResult[]
}

export async function querySearch(query: string): Promise<BrowserSearchResponse> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/search?q=${encodeURIComponent(query)}`)

    if (!response.ok) {
        throw new Error(`Search request failed: ${response.status}`)
    }

    return response.json()
}
