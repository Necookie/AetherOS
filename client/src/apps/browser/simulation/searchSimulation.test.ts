import { describe, expect, it } from 'vitest'
import { generateSimulatedSearchResults, mergeSearchResults } from './searchSimulation'

describe('searchSimulation', () => {
    it('does not surface internal search pages as web results', () => {
        const results = generateSimulatedSearchResults({
            query: 'gemini',
            bookmarks: [],
            history: [{
                url: 'https://browser.aether/search?q=gemini',
                title: 'Search - gemini',
                timestamp: 1,
            }],
        })

        expect(results.some((result) => result.targetUrl.includes('browser.aether/search'))).toBe(false)
    })

    it('keeps live provider results available to the browser', () => {
        const dataset = mergeSearchResults({
            query: 'aetheros',
            bookmarks: [],
            history: [],
            response: {
                query: 'aetheros',
                mode: 'live',
                results: [{
                    id: 'live-1',
                    title: 'AetherOS',
                    url: 'https://example.com/aetheros',
                    displayUrl: 'example.com/aetheros',
                    snippet: 'A live result.',
                    source: 'live',
                }],
            },
        })

        expect(dataset.results).toContainEqual(expect.objectContaining({
            id: 'live-1',
            targetUrl: 'https://example.com/aetheros',
        }))
    })
})
