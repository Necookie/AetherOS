const API_TIMEOUT_MS = 12_000

export async function fetchApi(input: string, init?: RequestInit) {
    try {
        return await fetch(input, {
            ...init,
            signal: AbortSignal.timeout(API_TIMEOUT_MS),
        })
    } catch (error) {
        if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
            throw new Error('The request timed out. Please try again.')
        }

        throw new Error('The service is unavailable. Please try again.')
    }
}

export async function getApiError(response: Response, fallback: string) {
    try {
        const body = await response.json() as { error?: unknown }
        if (typeof body.error === 'string' && body.error.trim()) {
            return body.error
        }
    } catch {
        // Use the stable fallback when the response is not JSON.
    }

    return fallback
}
