export const PROVIDER_TIMEOUT_MS = 10_000

export async function fetchProvider(
    input: string,
    init: RequestInit,
    timeoutMs = PROVIDER_TIMEOUT_MS,
): Promise<Response> {
    try {
        return await fetch(input, {
            ...init,
            signal: AbortSignal.timeout(timeoutMs),
        })
    } catch (error) {
        if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
            throw new Error('PROVIDER_REQUEST_TIMED_OUT', { cause: error })
        }

        throw new Error('PROVIDER_REQUEST_FAILED', { cause: error })
    }
}
