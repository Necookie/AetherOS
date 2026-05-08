import type { BookmarkEntry, HistoryEntry } from '../../../types/browser'
import type { BrowserSearchResponse, BrowserSearchResult } from '../../../services/searchClient'
import { buildSimulationResultUrl } from './simulationUrls'

export interface SimulatedSearchResult {
    id: string
    title: string
    targetUrl: string
    displayUrl: string
    snippet: string
    source: 'web' | 'bookmark' | 'history'
}

export interface SimulatedPageModel {
    title: string
    displayUrl: string
    targetUrl: string
    badge: string
    lead: string
    sections: Array<{ heading: string; body: string }>
}

export interface ResolvedSearchDataset {
    mode: 'live' | 'mock'
    results: SimulatedSearchResult[]
}

function slugify(value: string) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60) || 'query'
}

function titleCase(value: string) {
    return value
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part[0].toUpperCase() + part.slice(1))
        .join(' ')
}

function dedupeResults(results: SimulatedSearchResult[]) {
    const seen = new Set<string>()
    return results.filter((result) => {
        if (seen.has(result.targetUrl)) {
            return false
        }

        seen.add(result.targetUrl)
        return true
    })
}

function createWebResult(query: string, index: number): SimulatedSearchResult {
    const normalized = titleCase(query)
    const slug = slugify(query)
    const domains = [
        'docs.simnet.dev',
        'guide.horizonhub.app',
        'journal.signalweekly.net',
        'forum.stackcity.dev',
        'wiki.cloudatlas.org',
        'labs.novascope.io',
    ]
    const titles = [
        `${normalized} overview and practical guide`,
        `${normalized}: common workflows and troubleshooting`,
        `${normalized} trends, tools, and best practices`,
        `How teams use ${normalized} in real projects`,
        `${normalized} reference and implementation notes`,
        `${normalized} examples and deep-dive analysis`,
    ]
    const snippets = [
        `A structured summary of ${query} with key concepts, setup notes, and tradeoffs for day-to-day use.`,
        `Walkthrough covering the most common questions people ask about ${query}, including constraints and useful shortcuts.`,
        `A current-looking write-up focused on practical decisions, architecture choices, and operational concerns around ${query}.`,
        `Collected examples showing how ${query} is applied in product, engineering, and design workflows.`,
        `Reference material that turns ${query} into clear steps, linked ideas, and a readable internal guide.`,
        `An approachable deep dive on ${query} with examples, patterns, and implementation recommendations.`,
    ]

    const domain = domains[index % domains.length]
    const targetUrl = `https://${domain}/${slug}/${index + 1}`

    return {
        id: `web-${index + 1}`,
        title: titles[index % titles.length],
        targetUrl,
        displayUrl: targetUrl.replace(/^https?:\/\//, ''),
        snippet: snippets[index % snippets.length],
        source: 'web',
    }
}

function createBookmarkResult(bookmark: BookmarkEntry): SimulatedSearchResult {
    return {
        id: `bookmark-${bookmark.id}`,
        title: bookmark.title,
        targetUrl: bookmark.url,
        displayUrl: bookmark.url.replace(/^https?:\/\//, ''),
        snippet: 'Saved bookmark surfaced inside the AetherOS browser simulation.',
        source: 'bookmark',
    }
}

function createHistoryResult(entry: HistoryEntry, index: number): SimulatedSearchResult {
    return {
        id: `history-${index}`,
        title: entry.title,
        targetUrl: entry.url,
        displayUrl: entry.url.replace(/^https?:\/\//, ''),
        snippet: 'Previously visited page from your browser history, reopened inside the simulation.',
        source: 'history',
    }
}

export function generateSimulatedSearchResults(args: {
    query: string
    bookmarks: BookmarkEntry[]
    history: HistoryEntry[]
}) {
    const query = args.query.trim()
    if (!query) {
        return []
    }

    const normalizedQuery = query.toLowerCase()
    const bookmarkMatches = args.bookmarks
        .filter((bookmark) => `${bookmark.title} ${bookmark.url}`.toLowerCase().includes(normalizedQuery))
        .slice(0, 2)
        .map(createBookmarkResult)

    const historyMatches = args.history
        .filter((entry) => `${entry.title} ${entry.url}`.toLowerCase().includes(normalizedQuery))
        .slice(0, 2)
        .map((entry, index) => createHistoryResult(entry, index))

    const webMatches = Array.from({ length: 6 }, (_, index) => createWebResult(query, index))

    return dedupeResults([...bookmarkMatches, ...historyMatches, ...webMatches]).slice(0, 8)
}

function liftRemoteResult(result: BrowserSearchResult): SimulatedSearchResult {
    return {
        id: result.id,
        title: result.title,
        targetUrl: result.url,
        displayUrl: result.displayUrl,
        snippet: result.snippet,
        source: 'web',
    }
}

export function mergeSearchResults(args: {
    query: string
    response: BrowserSearchResponse | null
    bookmarks: BookmarkEntry[]
    history: HistoryEntry[]
}): ResolvedSearchDataset {
    if (!args.response) {
        return {
            mode: 'mock',
            results: generateSimulatedSearchResults({
                query: args.query,
                bookmarks: args.bookmarks,
                history: args.history,
            }),
        }
    }

    const normalizedQuery = args.query.toLowerCase()
    const bookmarkMatches = args.bookmarks
        .filter((bookmark) => `${bookmark.title} ${bookmark.url}`.toLowerCase().includes(normalizedQuery))
        .slice(0, 2)
        .map(createBookmarkResult)

    const historyMatches = args.history
        .filter((entry) => `${entry.title} ${entry.url}`.toLowerCase().includes(normalizedQuery))
        .slice(0, 2)
        .map((entry, index) => createHistoryResult(entry, index))

    return {
        mode: args.response.mode,
        results: dedupeResults([
            ...bookmarkMatches,
            ...historyMatches,
            ...args.response.results.map(liftRemoteResult),
        ]).slice(0, 8),
    }
}

export function getSimulatedResultById(args: {
    query: string
    id: string
    targetUrl: string
    bookmarks: BookmarkEntry[]
    history: HistoryEntry[]
}) {
    const allResults = generateSimulatedSearchResults({
        query: args.query,
        bookmarks: args.bookmarks,
        history: args.history,
    })

    return allResults.find((result) => result.id === args.id && result.targetUrl === args.targetUrl) ?? null
}

export function createResultNavigationUrl(result: SimulatedSearchResult, query: string) {
    return buildSimulationResultUrl({
        query,
        id: result.id,
        targetUrl: result.targetUrl,
    })
}

export function createSimulatedPageModel(result: SimulatedSearchResult, query: string): SimulatedPageModel {
    const title = result.title
    const displayUrl = result.displayUrl
    const badge = result.source === 'bookmark'
        ? 'Saved bookmark'
        : result.source === 'history'
            ? 'From history'
            : 'Simulated web page'

    return {
        title,
        displayUrl,
        targetUrl: result.targetUrl,
        badge,
        lead: `This page is rendered entirely inside AetherOS to keep the browser simulation self-contained while you explore results for "${query}".`,
        sections: [
            {
                heading: 'Summary',
                body: result.snippet,
            },
            {
                heading: 'What this page covers',
                body: `${title} frames ${query} as a practical topic, outlining the core ideas, expected workflow, and the tradeoffs someone would care about before going deeper.`,
            },
            {
                heading: 'Why it appears here',
                body: result.source === 'web'
                    ? `The simulation ranked this result because it looks relevant to "${query}" and fits the internal-browser experience you asked for.`
                    : `This result is promoted because it already exists in your ${result.source === 'bookmark' ? 'bookmarks' : 'history'}, making it a strong candidate for quick return access.`,
            },
        ],
    }
}
