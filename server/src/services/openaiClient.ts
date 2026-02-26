type ChatCompletionResponse = {
    choices?: { message?: { content?: string } }[]
}

export async function requestChatCompletion(apiKey: string, message: string): Promise<string> {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: message }]
        })
    })

    if (!res.ok) {
        throw new Error(`OpenAI API Error: ${res.statusText}`)
    }

    const data = (await res.json()) as ChatCompletionResponse
    return data.choices?.[0]?.message?.content || 'No response.'
}
