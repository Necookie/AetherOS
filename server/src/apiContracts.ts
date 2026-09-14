export const MAX_AI_MESSAGE_LENGTH = 4_000
export const MAX_SEARCH_QUERY_LENGTH = 300

export type ValidationResult<T> =
    | { ok: true; value: T }
    | { ok: false; error: string }

export interface AiRequestBody {
    message: string
}

export function parseAiRequestBody(value: unknown): ValidationResult<AiRequestBody> {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return { ok: false, error: 'Request body must be a JSON object.' }
    }

    const message = Reflect.get(value, 'message')
    if (typeof message !== 'string' || !message.trim()) {
        return { ok: false, error: 'Message is required.' }
    }

    const normalizedMessage = message.trim()
    if (normalizedMessage.length > MAX_AI_MESSAGE_LENGTH) {
        return { ok: false, error: 'Message is too long.' }
    }

    return { ok: true, value: { message: normalizedMessage } }
}

export function parseSearchQuery(value: unknown): ValidationResult<string> {
    if (typeof value !== 'string' || !value.trim()) {
        return { ok: false, error: 'Missing query.' }
    }

    const normalizedQuery = value.trim()
    if (normalizedQuery.length > MAX_SEARCH_QUERY_LENGTH) {
        return { ok: false, error: 'Query is too long.' }
    }

    return { ok: true, value: normalizedQuery }
}
