import { env } from './config/env'
import { buildServer } from './server'

const start = async () => {
    const fastify = buildServer()
    try {
        await fastify.listen({ port: env.port, host: '0.0.0.0' })
        console.log(`Server listening on port ${env.port}`)
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

start()
