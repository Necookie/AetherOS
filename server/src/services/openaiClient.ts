import { fetchProvider } from './providerFetch'

type ChatCompletionResponse = {
    choices?: { message?: { content?: string } }[]
}

export async function requestChatCompletion(apiKey: string, message: string): Promise<string> {
    const res = await fetchProvider('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: message }],
            max_completion_tokens: 400,
        })
    })

    if (!res.ok) {
        throw new Error(`OPENAI_REQUEST_FAILED:${res.status}`)
    }

    const data = (await res.json()) as ChatCompletionResponse
    const content = data.choices?.[0]?.message?.content?.trim()
    if (!content) {
        throw new Error('OPENAI_RESPONSE_INVALID')
    }

    return content
}
