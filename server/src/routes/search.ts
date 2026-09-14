import { FastifyInstance } from 'fastify'
import { MAX_SEARCH_QUERY_LENGTH, parseSearchQuery } from '../apiContracts'
import { env } from '../config/env'
import { searchWeb } from '../services/searchService'

export async function searchRoute(fastify: FastifyInstance) {
    fastify.get('/search', {
        config: {
            rateLimit: { max: 30, timeWindow: '1 minute' },
        },
        schema: {
            querystring: {
                type: 'object',
                additionalProperties: false,
                required: ['q'],
                properties: {
                    q: { type: 'string', minLength: 1, maxLength: MAX_SEARCH_QUERY_LENGTH },
                },
            },
        },
    }, async (request, reply) => {
        const parsed = parseSearchQuery(Reflect.get(request.query as object, 'q'))
        if (!parsed.ok) {
            return reply.status(400).send({ error: parsed.error, requestId: request.id })
        }

        try {
            return reply.send(await searchWeb(parsed.value, env.tavilySearchApiKey))
        } catch (error) {
            request.log.error({ err: error, requestId: request.id }, 'Search request failed')
            return reply.status(502).send({ error: 'Search provider is unavailable.', requestId: request.id })
        }
    })
}
