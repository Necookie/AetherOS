import { createApiUrl } from './apiUrl'
import { fetchApi, getApiError } from './request'

export interface AiResponse {
    reply: string
    mode: 'live' | 'mock'
}

export async function queryAi(message: string): Promise<AiResponse> {
    const res = await fetchApi(createApiUrl('/api/ai'), {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message })
    })

    if (!res.ok) {
        throw new Error(await getApiError(res, `AI request failed (${res.status}).`))
    }

    return res.json()
}
