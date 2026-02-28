import { FastifyInstance } from 'fastify'
import { getAiReply } from '../services/aiService'

interface AiRequestBody {
    message: string
    context?: any
}

export async function aiRoute(fastify: FastifyInstance) {
    fastify.post('/ai', async (request, reply) => {
        try {
            const { message } = request.body as AiRequestBody
            return reply.send(await getAiReply(message))
        } catch (err: any) {
            fastify.log.error(err)
            return reply.status(500).send({ error: 'Failed to process AI request.' })
        }
    })
}
