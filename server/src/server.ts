import Fastify, { type FastifyError, type FastifyServerOptions } from 'fastify'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import { corsOptions } from './plugins/cors'
import { rateLimitOptions } from './plugins/rateLimit'
import { aiRoute } from './routes/ai'
import { healthRoute } from './routes/health'
import { searchRoute } from './routes/search'

export function buildServer(options: FastifyServerOptions = {}) {
    const fastify = Fastify({
        logger: true,
        bodyLimit: 16 * 1024,
        requestTimeout: 15_000,
        connectionTimeout: 10_000,
        ajv: {
            customOptions: {
                removeAdditional: false,
            },
        },
        ...options,
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

        if (statusCode === 429) {
            return reply.status(429).send({
                error: 'Too many requests.',
                requestId: request.id,
                retryAfter: Reflect.get(error, 'retryAfter'),
            })
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

    fastify.register(cors, corsOptions)
    fastify.register(rateLimit, rateLimitOptions)
    fastify.register(healthRoute)
    fastify.register(aiRoute, { prefix: '/api' })
    fastify.register(searchRoute, { prefix: '/api' })

    return fastify
}
