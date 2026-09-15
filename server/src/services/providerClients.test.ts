import { afterEach, describe, expect, it, vi } from 'vitest'
import { requestChatCompletion } from './openaiClient'
import { fetchProvider } from './providerFetch'
import { searchWeb } from './searchService'

afterEach(() => {
    vi.unstubAllGlobals()
})

describe('provider clients', () => {
    it('adds an abort signal to provider requests', async () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response('{}'))
        vi.stubGlobal('fetch', fetchMock)

        await fetchProvider('https://provider.test', { method: 'GET' }, 50)

        expect(fetchMock).toHaveBeenCalledWith('https://provider.test', expect.objectContaining({
            method: 'GET',
            signal: expect.any(AbortSignal),
        }))
    })

    it('normalizes timeout and network failures', async () => {
        const timeoutError = Object.assign(new Error('timeout detail'), { name: 'TimeoutError' })
        vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(timeoutError).mockRejectedValueOnce(new Error('dns')))

        await expect(fetchProvider('https://provider.test', {})).rejects.toThrow('PROVIDER_REQUEST_TIMED_OUT')
        await expect(fetchProvider('https://provider.test', {})).rejects.toThrow('PROVIDER_REQUEST_FAILED')
    })

    it('returns trimmed OpenAI content with bounded output options', async () => {
        const fetchMock = vi.fn().mockResolvedValue(Response.json({
            choices: [{ message: { content: '  useful answer  ' } }],
        }))
        vi.stubGlobal('fetch', fetchMock)

        await expect(requestChatCompletion('secret', 'hello')).resolves.toBe('useful answer')
        const init = fetchMock.mock.calls[0][1] as RequestInit
        expect(JSON.parse(init.body as string)).toMatchObject({
            model: 'gpt-4o-mini',
            max_completion_tokens: 400,
        })
        expect((init.headers as Record<string, string>).Authorization).toBe('Bearer secret')
    })

    it('rejects unsuccessful or empty OpenAI responses without leaking bodies', async () => {
        vi.stubGlobal('fetch', vi.fn()
            .mockResolvedValueOnce(new Response('sensitive', { status: 401 }))
            .mockResolvedValueOnce(Response.json({ choices: [] })))

        await expect(requestChatCompletion('secret', 'hello')).rejects.toThrow('OPENAI_REQUEST_FAILED:401')
        await expect(requestChatCompletion('secret', 'hello')).rejects.toThrow('OPENAI_RESPONSE_INVALID')
    })

    it('maps bounded Tavily results', async () => {
        const results = Array.from({ length: 8 }, (_, index) => ({
            title: `Result ${index}`,
            url: `https://example.com/${index}`,
            content: `Snippet ${index}`,
        }))
        const fetchMock = vi.fn().mockResolvedValue(Response.json({ results }))
        vi.stubGlobal('fetch', fetchMock)

        const response = await searchWeb(' systems ', 'secret')

        expect(response.mode).toBe('live')
        expect(response.query).toBe('systems')
        expect(response.results).toHaveLength(6)
        const init = fetchMock.mock.calls[0][1] as RequestInit
        expect(JSON.parse(init.body as string)).toMatchObject({ max_results: 6, include_raw_content: false })
    })

    it('falls back to deterministic mock results when search is unavailable', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('provider down')))

        const response = await searchWeb('systems', 'secret')

        expect(response.mode).toBe('mock')
        expect(response.results).toHaveLength(6)
        expect(response.results.every((result) => result.source === 'mock')).toBe(true)
    })
})
