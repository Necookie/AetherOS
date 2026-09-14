import Fastify, { type FastifyError } from 'fastify'
import { registerCors } from './plugins/cors'
import { registerRateLimit } from './plugins/rateLimit'
import { aiRoute } from './routes/ai'
import { healthRoute } from './routes/health'
import { searchRoute } from './routes/search'

export function buildServer() {
    const fastify = Fastify({
        logger: true,
        bodyLimit: 16 * 1024,
        requestTimeout: 15_000,
        connectionTimeout: 10_000,
    })

    fastify.addHook('onRequest', async (request, reply) => {
        reply.header('X-Request-Id', request.id)
        reply.header('X-Content-Type-Options', 'nosniff')
        reply.header('Cache-Control', 'no-store')
    })

    fastify.setErrorHandler((error: FastifyError, request, reply) => {
        const statusCode = error.statusCode && error.statusCode >= 400 && error.statusCode < 500
            ? error.statusCode
            : 500

        if (statusCode >= 500) {
            request.log.error({ err: error, requestId: request.id }, 'Unhandled API error')
        }

        const message = statusCode === 413
            ? 'Request body is too large.'
            : statusCode < 500
                ? 'Invalid request.'
                : 'Internal server error.'

        return reply.status(statusCode).send({ error: message, requestId: request.id })
    })

    fastify.setNotFoundHandler((request, reply) => {
        return reply.status(404).send({ error: 'API route not found.', requestId: request.id })
    })

    fastify.register(registerCors)
    fastify.register(registerRateLimit)
    fastify.register(healthRoute)
    fastify.register(aiRoute, { prefix: '/api' })
    fastify.register(searchRoute, { prefix: '/api' })

    return fastify
}
