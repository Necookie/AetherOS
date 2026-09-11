import { getAiReply } from '../../server/src/services/aiService'
import { jsonResponse, type PagesEnv } from '../_shared'

const MAX_MESSAGE_LENGTH = 4_000

export const onRequestPost: PagesFunction<PagesEnv> = async ({ request, env }) => {
    let body: { message?: unknown }
    try {
        body = await request.json<{ message?: unknown }>()
    } catch {
        return jsonResponse({ error: 'Request body must be valid JSON.' }, 400)
    }

    if (typeof body.message !== 'string' || !body.message.trim()) {
        return jsonResponse({ error: 'Message is required.' }, 400)
    }

    const message = body.message.trim()
    if (message.length > MAX_MESSAGE_LENGTH) {
        return jsonResponse({ error: 'Message is too long.' }, 400)
    }

    try {
        return jsonResponse(await getAiReply(message, env.OPENAI_API_KEY))
    } catch (error) {
        console.error(JSON.stringify({
            message: 'AI request failed',
            error: error instanceof Error ? error.message : String(error),
        }))
        return jsonResponse({ error: 'Failed to process AI request.' }, 500)
    }
}
