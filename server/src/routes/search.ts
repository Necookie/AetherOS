import { FastifyInstance } from 'fastify'
import { searchWeb } from '../services/searchService'

export async function searchRoute(fastify: FastifyInstance) {
    fastify.get('/search', async (request, reply) => {
        const { q } = request.query as { q?: string }

        if (!q?.trim()) {
            return reply.status(400).send({ error: 'Missing query.' })
        }

        try {
            return reply.send(await searchWeb(q))
        } catch (err: any) {
            fastify.log.error(err)
            return reply.status(500).send({ error: 'Failed to search.' })
        }
    })
}
