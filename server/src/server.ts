import Fastify from 'fastify'
import { registerCors } from './plugins/cors'
import { registerRateLimit } from './plugins/rateLimit'
import { aiRoute } from './routes/ai'
import { healthRoute } from './routes/health'

export function buildServer() {
    const fastify = Fastify({ logger: true })

    fastify.register(registerCors)
    fastify.register(registerRateLimit)
    fastify.register(healthRoute)
    fastify.register(aiRoute, { prefix: '/api' })

    return fastify
}
