import { createRequestId, jsonResponse, methodNotAllowed, type PagesEnv } from '../_shared'

export const onRequest: PagesFunction<PagesEnv> = async ({ request }) => {
    const requestId = createRequestId()
    if (request.method !== 'GET') {
        return methodNotAllowed(requestId, 'GET')
    }

    return jsonResponse({ ok: true, ts: Date.now(), runtime: 'cloudflare-pages' }, { requestId })
}
