import { createApiUrl } from './apiUrl'
import { fetchApi, getApiError } from './request'

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
    const response = await fetchApi(createApiUrl(`/api/search?q=${encodeURIComponent(query)}`), {
        headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
        throw new Error(await getApiError(response, `Search request failed (${response.status}).`))
    }

    return response.json()
}
