import Fastify from 'fastify'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import dotenv from 'dotenv'
import { healthRoute } from './routes/health'
import { aiRoute } from './routes/ai'

dotenv.config()

const fastify = Fastify({ logger: true })

fastify.register(cors, {
    origin: '*',
})

fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute'
})

fastify.register(healthRoute)
fastify.register(aiRoute, { prefix: '/api' })

const start = async () => {
    try {
        const port = parseInt(process.env.PORT || '3000', 10)
        await fastify.listen({ port, host: '0.0.0.0' })
        console.log(`Server listening on port ${port}`)
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

start()
