import type { FastifyCorsOptions } from '@fastify/cors'
import { env } from '../config/env'

const allowedOrigins = new Set(env.clientOrigins)

export const corsOptions: FastifyCorsOptions = {
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
}
