import Fastify from 'fastify'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import { healthRoute } from './routes/health'
import { aiRoute } from './routes/ai'

export function buildServer() {
    const fastify = Fastify({ logger: true })

    fastify.register(cors, { origin: '*' })
    fastify.register(rateLimit, { max: 100, timeWindow: '1 minute' })
    fastify.register(healthRoute)
    fastify.register(aiRoute, { prefix: '/api' })

    return fastify
}
