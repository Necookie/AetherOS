import { getAiReply } from '../../server/src/services/aiService'
import { parseAiRequestBody } from '../../server/src/apiContracts'
import { createRequestId, jsonResponse, methodNotAllowed, readJsonBody, type PagesEnv } from '../_shared'

export const onRequest: PagesFunction<PagesEnv> = async ({ request, env }) => {
    const requestId = createRequestId()
    if (request.method !== 'POST') {
        return methodNotAllowed(requestId, 'POST')
    }

    const body = await readJsonBody(request)
    if (!body.ok) {
        return jsonResponse({ error: body.error, requestId }, { status: body.status, requestId })
    }

    const parsed = parseAiRequestBody(body.value)
    if (!parsed.ok) {
        return jsonResponse({ error: parsed.error, requestId }, { status: 400, requestId })
    }

    try {
        return jsonResponse(await getAiReply(parsed.value.message, env.OPENAI_API_KEY), { requestId })
    } catch (error) {
        console.error(JSON.stringify({
            message: 'AI request failed',
            requestId,
            error: error instanceof Error ? error.message : String(error),
        }))
        return jsonResponse(
            { error: 'AI provider is unavailable.', requestId },
            { status: 502, requestId },
        )
    }
}
