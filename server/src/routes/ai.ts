import { FastifyInstance } from 'fastify'
import { env } from '../config/env'
import { requestChatCompletion } from '../services/openaiClient'

interface AiRequestBody {
    message: string
    context?: any
}

export async function aiRoute(fastify: FastifyInstance) {
    fastify.post('/ai', async (request, reply) => {
        try {
            const { message } = request.body as AiRequestBody
            const apiKey = env.openaiApiKey

            if (!apiKey) {
                return reply.send({
                    reply: `[MOCK] You asked: "${message}". Set OPENAI_API_KEY to use live AI.`,
                    mode: 'mock'
                })
            }

            return reply.send({
                reply: await requestChatCompletion(apiKey, message),
                mode: 'live'
            })

        } catch (err: any) {
            fastify.log.error(err)
            return reply.status(500).send({ error: 'Failed to process AI request.' })
        }
    })
}
