import { getAiReply } from '../../server/src/services/aiService'
import { parseAiRequestBody } from '../../server/src/apiContracts'
import { jsonResponse, type PagesEnv } from '../_shared'

export const onRequestPost: PagesFunction<PagesEnv> = async ({ request, env }) => {
    let body: unknown
    try {
        body = await request.json()
    } catch {
        return jsonResponse({ error: 'Request body must be valid JSON.' }, 400)
    }

    const parsed = parseAiRequestBody(body)
    if (!parsed.ok) {
        return jsonResponse({ error: parsed.error }, 400)
    }

    try {
        return jsonResponse(await getAiReply(parsed.value.message, env.OPENAI_API_KEY))
    } catch (error) {
        console.error(JSON.stringify({
            message: 'AI request failed',
            error: error instanceof Error ? error.message : String(error),
        }))
        return jsonResponse({ error: 'Failed to process AI request.' }, 500)
    }
}
