import { afterEach, describe, expect, it, vi } from 'vitest'
import { queryAi } from './aiClient'
import { fetchApi, getApiError } from './request'
import { querySearch } from './searchClient'

afterEach(() => {
    vi.unstubAllGlobals()
})

describe('API client', () => {
    it('adds a timeout signal to API fetches', async () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response('{}'))
        vi.stubGlobal('fetch', fetchMock)

        await fetchApi('/api/health', { headers: { Accept: 'application/json' } })

        expect(fetchMock).toHaveBeenCalledWith('/api/health', expect.objectContaining({
            headers: { Accept: 'application/json' },
            signal: expect.any(AbortSignal),
        }))
    })

    it('turns timeout and network failures into safe messages', async () => {
        const timeoutError = Object.assign(new Error('internal timeout detail'), { name: 'TimeoutError' })
        vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(timeoutError).mockRejectedValueOnce(new Error('dns')))

        await expect(fetchApi('/api/ai')).rejects.toThrow('The request timed out. Please try again.')
        await expect(fetchApi('/api/ai')).rejects.toThrow('The service is unavailable. Please try again.')
    })

    it('uses a server error when present and a fallback otherwise', async () => {
        await expect(getApiError(
            Response.json({ error: 'Provider unavailable.' }, { status: 502 }),
            'Fallback',
        )).resolves.toBe('Provider unavailable.')
        await expect(getApiError(new Response('not-json', { status: 500 }), 'Fallback')).resolves.toBe('Fallback')
    })

    it('queries AI through the same-origin JSON endpoint', async () => {
        const fetchMock = vi.fn().mockResolvedValue(Response.json({ reply: 'Hi', mode: 'mock' }))
        vi.stubGlobal('fetch', fetchMock)

        await expect(queryAi('hello')).resolves.toEqual({ reply: 'Hi', mode: 'mock' })
        expect(fetchMock).toHaveBeenCalledWith('/api/ai', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ message: 'hello' }),
        }))
    })

    it('surfaces safe AI and search errors', async () => {
        vi.stubGlobal('fetch', vi.fn()
            .mockResolvedValueOnce(Response.json({ error: 'AI provider is unavailable.' }, { status: 502 }))
            .mockResolvedValueOnce(Response.json({ error: 'Invalid request.' }, { status: 400 })))

        await expect(queryAi('hello')).rejects.toThrow('AI provider is unavailable.')
        await expect(querySearch('hello')).rejects.toThrow('Invalid request.')
    })

    it('encodes search terms and returns typed results', async () => {
        const payload = { query: 'os design', mode: 'mock', results: [] }
        const fetchMock = vi.fn().mockResolvedValue(Response.json(payload))
        vi.stubGlobal('fetch', fetchMock)

        await expect(querySearch('os design')).resolves.toEqual(payload)
        expect(fetchMock).toHaveBeenCalledWith('/api/search?q=os%20design', expect.any(Object))
    })
})
