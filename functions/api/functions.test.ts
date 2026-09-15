import { describe, expect, it } from 'vitest'
import { MAX_AI_MESSAGE_LENGTH, MAX_SEARCH_QUERY_LENGTH } from '../../server/src/apiContracts'
import { onRequest as handleAi } from './ai'
import { onRequest as handleHealth } from './health'
import { onRequest as handleNotFound } from './[[path]]'
import { onRequest as handleSearch } from './search'

type FunctionHandler = typeof handleAi
type FunctionContext = Parameters<FunctionHandler>[0]

function createContext(request: Request, env: Env = {}): FunctionContext {
    return {
        request,
        env,
        params: {},
        data: {},
        functionPath: new URL(request.url).pathname,
        waitUntil() {},
        next: async () => new Response(null, { status: 404 }),
    } as unknown as FunctionContext
}

async function readBody(response: Response) {
    return response.json() as Promise<Record<string, unknown>>
}

describe('Cloudflare Pages Functions', () => {
    it('serves health with request tracing and no-store headers', async () => {
        const response = await handleHealth(createContext(new Request('https://aether.test/api/health')))

        expect(response.status).toBe(200)
        expect(response.headers.get('Cache-Control')).toBe('no-store')
        expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
        expect(response.headers.get('X-Request-Id')).toBeTruthy()
        expect(await readBody(response)).toMatchObject({ ok: true, runtime: 'cloudflare-pages' })
    })

    it('rejects unsupported methods with an Allow header', async () => {
        const response = await handleHealth(createContext(new Request('https://aether.test/api/health', {
            method: 'POST',
        })))

        expect(response.status).toBe(405)
        expect(response.headers.get('Allow')).toBe('GET')
        expect(await readBody(response)).toMatchObject({ error: 'Method not allowed.' })
    })

    it('returns a mock AI response for valid JSON', async () => {
        const request = new Request('https://aether.test/api/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: '  hello  ' }),
        })
        const response = await handleAi(createContext(request))

        expect(response.status).toBe(200)
        expect(await readBody(response)).toEqual({
            reply: '[MOCK] You asked: "hello". Set OPENAI_API_KEY to use live AI.',
            mode: 'mock',
        })
    })

    it.each([
        ['not-json', 400, 'Request body must be valid JSON.'],
        [JSON.stringify({}), 400, 'Message is required.'],
        [JSON.stringify({ message: 'x'.repeat(MAX_AI_MESSAGE_LENGTH + 1) }), 400, 'Message is too long.'],
    ])('rejects an invalid AI request body', async (body, status, error) => {
        const response = await handleAi(createContext(new Request('https://aether.test/api/ai', {
            method: 'POST',
            body,
        })))

        expect(response.status).toBe(status)
        expect(await readBody(response)).toMatchObject({ error, requestId: expect.any(String) })
    })

    it('stops oversized streamed bodies', async () => {
        const response = await handleAi(createContext(new Request('https://aether.test/api/ai', {
            method: 'POST',
            body: JSON.stringify({ message: 'x'.repeat(17 * 1024) }),
        })))

        expect(response.status).toBe(413)
        expect(await readBody(response)).toMatchObject({ error: 'Request body is too large.' })
    })

    it('returns bounded mock search results', async () => {
        const response = await handleSearch(createContext(new Request('https://aether.test/api/search?q=systems')))
        const body = await readBody(response)

        expect(response.status).toBe(200)
        expect(body).toMatchObject({ query: 'systems', mode: 'mock' })
        expect(body.results).toHaveLength(6)
    })

    it.each([
        ['', 'Missing query.'],
        [`?q=${'x'.repeat(MAX_SEARCH_QUERY_LENGTH + 1)}`, 'Query is too long.'],
    ])('rejects an invalid search query', async (suffix, error) => {
        const response = await handleSearch(createContext(new Request(`https://aether.test/api/search${suffix}`)))

        expect(response.status).toBe(400)
        expect(await readBody(response)).toMatchObject({ error, requestId: expect.any(String) })
    })

    it('returns a stable catch-all response', async () => {
        const response = await handleNotFound(createContext(new Request('https://aether.test/api/missing')))

        expect(response.status).toBe(404)
        expect(await readBody(response)).toMatchObject({ error: 'API route not found.', requestId: expect.any(String) })
    })
})
