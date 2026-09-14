import { searchWeb } from '../../server/src/services/searchService'
import { parseSearchQuery } from '../../server/src/apiContracts'
import { jsonResponse, type PagesEnv } from '../_shared'

export const onRequestGet: PagesFunction<PagesEnv> = async ({ request, env }) => {
    const parsed = parseSearchQuery(new URL(request.url).searchParams.get('q'))
    if (!parsed.ok) {
        return jsonResponse({ error: parsed.error }, 400)
    }

    try {
        return jsonResponse(await searchWeb(parsed.value, env.TAVILY_SEARCH_API_KEY ?? env.TAVILY_API_KEY))
    } catch (error) {
        console.error(JSON.stringify({
            message: 'Search request failed',
            error: error instanceof Error ? error.message : String(error),
        }))
        return jsonResponse({ error: 'Failed to search.' }, 500)
    }
}
