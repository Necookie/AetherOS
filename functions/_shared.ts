export type PagesEnv = Env

const MAX_JSON_BODY_BYTES = 16 * 1024

export type JsonBodyResult =
    | { ok: true; value: unknown }
    | { ok: false; error: string; status: 400 | 413 }

export async function readJsonBody(request: Request): Promise<JsonBodyResult> {
    const contentLength = Number(request.headers.get('Content-Length'))
    if (Number.isFinite(contentLength) && contentLength > MAX_JSON_BODY_BYTES) {
        return { ok: false, error: 'Request body is too large.', status: 413 }
    }

    if (!request.body) {
        return { ok: false, error: 'Request body must be valid JSON.', status: 400 }
    }

    const reader = request.body.getReader()
    const chunks: Uint8Array[] = []
    let byteLength = 0

    while (true) {
        const { done, value } = await reader.read()
        if (done) break

        byteLength += value.byteLength
        if (byteLength > MAX_JSON_BODY_BYTES) {
            await reader.cancel()
            return { ok: false, error: 'Request body is too large.', status: 413 }
        }
        chunks.push(value)
    }

    const bytes = new Uint8Array(byteLength)
    let offset = 0
    for (const chunk of chunks) {
        bytes.set(chunk, offset)
        offset += chunk.byteLength
    }

    try {
        return { ok: true, value: JSON.parse(new TextDecoder().decode(bytes)) }
    } catch {
        return { ok: false, error: 'Request body must be valid JSON.', status: 400 }
    }
}

interface JsonResponseOptions {
    status?: number
    requestId?: string
    headers?: HeadersInit
}

export function createRequestId() {
    return crypto.randomUUID()
}

export function jsonResponse(body: unknown, options: JsonResponseOptions = {}) {
    return Response.json(body, {
        status: options.status ?? 200,
        headers: {
            'Cache-Control': 'no-store',
            'X-Content-Type-Options': 'nosniff',
            ...(options.requestId ? { 'X-Request-Id': options.requestId } : {}),
            ...options.headers,
        },
    })
}

export function methodNotAllowed(requestId: string, allow: string) {
    return jsonResponse(
        { error: 'Method not allowed.', requestId },
        { status: 405, requestId, headers: { Allow: allow } },
    )
}
