import { searchWeb } from '../../server/src/services/searchService'
import { jsonResponse, type PagesEnv } from '../_shared'

const MAX_QUERY_LENGTH = 300

export const onRequestGet: PagesFunction<PagesEnv> = async ({ request, env }) => {
    const query = new URL(request.url).searchParams.get('q')?.trim() ?? ''
    if (!query) {
        return jsonResponse({ error: 'Missing query.' }, 400)
    }

    if (query.length > MAX_QUERY_LENGTH) {
        return jsonResponse({ error: 'Query is too long.' }, 400)
    }

    try {
        return jsonResponse(await searchWeb(query, env.TAVILY_SEARCH_API_KEY ?? env.TAVILY_API_KEY))
    } catch (error) {
        console.error(JSON.stringify({
            message: 'Search request failed',
            error: error instanceof Error ? error.message : String(error),
        }))
        return jsonResponse({ error: 'Failed to search.' }, 500)
    }
}
