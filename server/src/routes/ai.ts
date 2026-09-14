import { FastifyInstance } from 'fastify'
import { MAX_AI_MESSAGE_LENGTH, parseAiRequestBody } from '../apiContracts'
import { env } from '../config/env'
import { getAiReply } from '../services/aiService'

export async function aiRoute(fastify: FastifyInstance) {
    fastify.post('/ai', {
        schema: {
            body: {
                type: 'object',
                additionalProperties: false,
                required: ['message'],
                properties: {
                    message: { type: 'string', minLength: 1, maxLength: MAX_AI_MESSAGE_LENGTH },
                },
            },
        },
    }, async (request, reply) => {
        const parsed = parseAiRequestBody(request.body)
        if (!parsed.ok) {
            return reply.status(400).send({ error: parsed.error, requestId: request.id })
        }

        try {
            return reply.send(await getAiReply(parsed.value.message, env.openaiApiKey))
        } catch (error) {
            request.log.error({ err: error, requestId: request.id }, 'AI request failed')
            return reply.status(502).send({ error: 'AI provider is unavailable.', requestId: request.id })
        }
    })
}
