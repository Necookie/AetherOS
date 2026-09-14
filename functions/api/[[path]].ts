import { createRequestId, jsonResponse, type PagesEnv } from '../_shared'

export const onRequest: PagesFunction<PagesEnv> = async () => {
    const requestId = createRequestId()
    return jsonResponse(
        { error: 'API route not found.', requestId },
        { status: 404, requestId },
    )
}
