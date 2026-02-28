import type { FastifyInstance } from 'fastify'
import rateLimit from '@fastify/rate-limit'

export async function registerRateLimit(fastify: FastifyInstance) {
    await fastify.register(rateLimit, { max: 100, timeWindow: '1 minute' })
}
