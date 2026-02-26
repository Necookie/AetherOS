export interface AiResponse {
    reply: string
    mode: string
}

export async function queryAi(message: string): Promise<AiResponse> {
    const res = await fetch(import.meta.env.VITE_API_URL + '/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
    })

    if (!res.ok) {
        throw new Error(`AI request failed: ${res.status}`)
    }

    return res.json()
}
