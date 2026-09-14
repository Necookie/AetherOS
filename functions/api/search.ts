import { searchWeb } from '../../server/src/services/searchService'
import { parseSearchQuery } from '../../server/src/apiContracts'
import { createRequestId, jsonResponse, methodNotAllowed, type PagesEnv } from '../_shared'

export const onRequest: PagesFunction<PagesEnv> = async ({ request, env }) => {
    const requestId = createRequestId()
    if (request.method !== 'GET') {
        return methodNotAllowed(requestId, 'GET')
    }

    const parsed = parseSearchQuery(new URL(request.url).searchParams.get('q'))
    if (!parsed.ok) {
        return jsonResponse({ error: parsed.error, requestId }, { status: 400, requestId })
    }

    try {
        return jsonResponse(
            await searchWeb(parsed.value, env.TAVILY_SEARCH_API_KEY ?? env.TAVILY_API_KEY),
            { requestId },
        )
    } catch (error) {
        console.error(JSON.stringify({
            message: 'Search request failed',
            requestId,
            error: error instanceof Error ? error.message : String(error),
        }))
        return jsonResponse(
            { error: 'Search provider is unavailable.', requestId },
            { status: 502, requestId },
        )
    }
}
