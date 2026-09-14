import type { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import { env } from '../config/env'

export async function registerCors(fastify: FastifyInstance) {
    const allowedOrigins = new Set(env.clientOrigins)

    await fastify.register(cors, {
        origin(origin, callback) {
            if (!origin || allowedOrigins.has(origin)) {
                callback(null, true)
                return
            }

            callback(null, false)
        },
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type'],
        maxAge: 86_400,
    })
}
