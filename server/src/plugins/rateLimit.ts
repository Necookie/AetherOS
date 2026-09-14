import type { FastifyInstance } from 'fastify'
import rateLimit from '@fastify/rate-limit'

export async function registerRateLimit(fastify: FastifyInstance) {
    await fastify.register(rateLimit, {
        max: 60,
        timeWindow: '1 minute',
        errorResponseBuilder(_request, context) {
            return {
                error: 'Too many requests.',
                retryAfter: context.after,
            }
        },
    })
}
