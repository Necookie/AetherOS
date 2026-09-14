import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('./config/env', () => ({
    env: {
        port: 3000,
        openaiApiKey: undefined,
        tavilySearchApiKey: undefined,
        clientOrigins: ['http://localhost:5173'],
    },
}))

import { MAX_AI_MESSAGE_LENGTH, MAX_SEARCH_QUERY_LENGTH } from './apiContracts'
import { buildServer } from './server'

const servers: ReturnType<typeof buildServer>[] = []

function createServer() {
    const server = buildServer({ logger: false })
    servers.push(server)
    return server
}

afterEach(async () => {
    await Promise.all(servers.splice(0).map((server) => server.close()))
})

describe('API server', () => {
    it('serves health with defensive headers', async () => {
        const response = await createServer().inject({ method: 'GET', url: '/health' })

        expect(response.statusCode).toBe(200)
        expect(response.headers['cache-control']).toBe('no-store')
        expect(response.headers['x-content-type-options']).toBe('nosniff')
        expect(response.headers['x-request-id']).toBeTruthy()
        expect(response.json()).toMatchObject({ ok: true })
    })

    it('returns a mock AI reply for a valid bounded message', async () => {
        const response = await createServer().inject({
            method: 'POST',
            url: '/api/ai',
            payload: { message: '  hello  ' },
        })

        expect(response.statusCode).toBe(200)
        expect(response.json()).toEqual({
            reply: '[MOCK] You asked: "hello". Set OPENAI_API_KEY to use live AI.',
            mode: 'mock',
        })
    })

    it.each([
        [{}, 400],
        [{ message: '   ' }, 400],
        [{ message: 'ok', extra: true }, 400],
        [{ message: 'x'.repeat(MAX_AI_MESSAGE_LENGTH + 1) }, 400],
    ])('rejects an invalid AI payload', async (payload, statusCode) => {
        const response = await createServer().inject({ method: 'POST', url: '/api/ai', payload })

        expect(response.statusCode).toBe(statusCode)
        expect(response.json()).toMatchObject({ error: expect.any(String), requestId: expect.any(String) })
    })

    it('rejects oversized request bodies before route work', async () => {
        const response = await createServer().inject({
            method: 'POST',
            url: '/api/ai',
            payload: { message: 'x'.repeat(17 * 1024) },
        })

        expect(response.statusCode).toBe(413)
        expect(response.json()).toMatchObject({ error: 'Request body is too large.' })
    })

    it('returns bounded mock search results', async () => {
        const response = await createServer().inject({ method: 'GET', url: '/api/search?q=systems' })
        const body = response.json()

        expect(response.statusCode).toBe(200)
        expect(body).toMatchObject({ query: 'systems', mode: 'mock' })
        expect(body.results).toHaveLength(6)
    })

    it.each([
        ['/api/search', 400],
        [`/api/search?q=${'x'.repeat(MAX_SEARCH_QUERY_LENGTH + 1)}`, 400],
        ['/api/search?q=ok&extra=1', 400],
    ])('rejects an invalid search request', async (url, statusCode) => {
        const response = await createServer().inject({ method: 'GET', url })

        expect(response.statusCode).toBe(statusCode)
        expect(response.json()).toMatchObject({ error: expect.any(String), requestId: expect.any(String) })
    })

    it('only exposes CORS to configured browser origins', async () => {
        const allowed = await createServer().inject({
            method: 'GET',
            url: '/health',
            headers: { origin: 'http://localhost:5173' },
        })
        const denied = await createServer().inject({
            method: 'GET',
            url: '/health',
            headers: { origin: 'https://untrusted.example' },
        })

        expect(allowed.headers['access-control-allow-origin']).toBe('http://localhost:5173')
        expect(denied.headers['access-control-allow-origin']).toBeUndefined()
    })

    it('enforces the stricter AI route quota', async () => {
        const server = createServer()
        const responses = []

        for (let index = 0; index < 21; index += 1) {
            responses.push(await server.inject({
                method: 'POST',
                url: '/api/ai',
                payload: { message: `message ${index}` },
            }))
        }

        expect(responses.slice(0, 20).every((response) => response.statusCode === 200)).toBe(true)
        expect(responses[20].statusCode).toBe(429)
        expect(responses[20].json()).toMatchObject({ error: 'Too many requests.' })
    })

    it('returns a stable not-found response', async () => {
        const response = await createServer().inject({ method: 'GET', url: '/missing' })

        expect(response.statusCode).toBe(404)
        expect(response.json()).toMatchObject({ error: 'API route not found.', requestId: expect.any(String) })
    })
})
