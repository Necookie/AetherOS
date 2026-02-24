import { FastifyInstance } from 'fastify'

interface AiRequestBody {
    message: string
    context?: any
}

export async function aiRoute(fastify: FastifyInstance) {
    fastify.post('/ai', async (request, reply) => {
        try {
            const { message } = request.body as AiRequestBody
            const apiKey = process.env.OPENAI_API_KEY

            if (!apiKey) {
                return reply.send({
                    reply: `[MOCK] You asked: "${message}". Set OPENAI_API_KEY to use live AI.`,
                    mode: 'mock'
                })
            }

            // Live request (simplistic OpenAI Responses shape)
            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
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

            const data = await res.json()
            const answer = data.choices?.[0]?.message?.content || 'No response.'

            return reply.send({
                reply: answer,
                mode: 'live'
            })

        } catch (err: any) {
            fastify.log.error(err)
            return reply.status(500).send({ error: 'Failed to process AI request.' })
        }
    })
}
