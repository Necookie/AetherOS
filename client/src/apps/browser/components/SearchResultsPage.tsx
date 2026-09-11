import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Bookmark, Clock3, Globe2, Search } from 'lucide-react'
import type { SimulatedSearchResult } from '../simulation/searchSimulation'

interface SearchResultsPageProps {
    query: string
    mode: 'live' | 'mock'
    results: SimulatedSearchResult[]
    isLoading: boolean
    error: string | null
    onSearch: (query: string) => void
    onOpenResult: (result: SimulatedSearchResult) => void
}

type ResultFilter = 'all' | SimulatedSearchResult['source']

const FILTERS: Array<{ id: ResultFilter; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'web', label: 'Web' },
    { id: 'bookmark', label: 'Bookmarks' },
    { id: 'history', label: 'History' },
]

const sourceMeta = {
    web: { label: 'Web', Icon: Globe2 },
    bookmark: { label: 'Saved', Icon: Bookmark },
    history: { label: 'History', Icon: Clock3 },
} satisfies Record<SimulatedSearchResult['source'], { label: string; Icon: typeof Globe2 }>

export default function SearchResultsPage({
    query,
    mode,
    results,
    isLoading,
    error,
    onSearch,
    onOpenResult,
}: SearchResultsPageProps) {
    const [draftQuery, setDraftQuery] = useState(query)
    const [filter, setFilter] = useState<ResultFilter>('all')

    useEffect(() => {
        setDraftQuery(query)
        setFilter('all')
    }, [query])

    const counts = useMemo(() => ({
        all: results.length,
        web: results.filter((result) => result.source === 'web').length,
        bookmark: results.filter((result) => result.source === 'bookmark').length,
        history: results.filter((result) => result.source === 'history').length,
    }), [results])

    const visibleResults = filter === 'all'
        ? results
        : results.filter((result) => result.source === filter)

    const submitSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const nextQuery = draftQuery.trim()
        if (nextQuery && nextQuery !== query) {
            onSearch(nextQuery)
        }
    }

    return (
        <div className="h-full overflow-y-auto bg-canvas">
            <header className="border-b border-hairline bg-pearl">
                <div className="mx-auto max-w-5xl px-5 pb-4 pt-6 sm:px-8">
                    <form onSubmit={submitSearch} className="flex max-w-3xl items-center gap-2">
                        <label className="group relative min-w-0 flex-1">
                            <span className="sr-only">Search the web</span>
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted-48 group-focus-within:text-primary" />
                            <input
                                value={draftQuery}
                                onChange={(event) => setDraftQuery(event.target.value)}
                                className="h-11 w-full rounded-pill border border-hairline bg-canvas pl-11 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted-48 focus:border-primary-focus focus:ring-1 focus:ring-primary-focus"
                                placeholder="Search the web"
                            />
                        </label>
                        <button
                            type="submit"
                            disabled={!draftQuery.trim() || draftQuery.trim() === query}
                            className="h-11 rounded-pill bg-primary px-5 text-sm font-semibold text-on-dark transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Search
                        </button>
                    </form>

                    <nav className="mt-5 flex items-center gap-1" aria-label="Search result filters">
                        {FILTERS.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setFilter(item.id)}
                                disabled={item.id !== 'all' && counts[item.id] === 0}
                                aria-pressed={filter === item.id}
                                className={`rounded-pill px-3 py-1.5 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                                    filter === item.id
                                        ? 'bg-primary text-on-dark'
                                        : 'text-ink-muted hover:bg-canvas hover:text-ink'
                                }`}
                            >
                                {item.label}
                                {counts[item.id] > 0 ? <span className="ml-1.5 opacity-70">{counts[item.id]}</span> : null}
                            </button>
                        ))}
                    </nav>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-5 py-6 sm:px-8">
                <div className="max-w-3xl">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-muted-48">
                        <span>{isLoading ? 'Searching the web…' : `${visibleResults.length} results for “${query}”`}</span>
                        <span aria-hidden="true">·</span>
                        <span>{mode === 'live' ? 'Live web index' : 'Demo index'}</span>
                    </div>

                    {error ? (
                        <div role="status" className="mt-4 rounded-md border border-hairline bg-pearl px-4 py-3 text-sm text-ink-muted">
                            Live search is temporarily unavailable. Showing local results instead.
                        </div>
                    ) : null}

                    {isLoading && results.length === 0 ? (
                        <div className="mt-6 space-y-7" aria-label="Loading search results">
                            {Array.from({ length: 4 }, (_, index) => (
                                <div key={index} className="animate-pulse">
                                    <div className="h-3 w-48 rounded-pill bg-hairline" />
                                    <div className="mt-3 h-5 w-3/4 rounded-pill bg-hairline" />
                                    <div className="mt-3 h-3 w-full rounded-pill bg-hairline" />
                                    <div className="mt-2 h-3 w-5/6 rounded-pill bg-hairline" />
                                </div>
                            ))}
                        </div>
                    ) : visibleResults.length > 0 ? (
                        <ol className="mt-2 divide-y divide-hairline">
                            {visibleResults.map((result) => {
                                const { Icon, label } = sourceMeta[result.source]
                                return (
                                    <li key={`${result.id}:${result.targetUrl}`} className="py-5">
                                        <button
                                            type="button"
                                            onClick={() => onOpenResult(result)}
                                            className="group block w-full rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-primary-focus focus-visible:ring-offset-4"
                                        >
                                            <span className="flex min-w-0 items-center gap-2 text-xs text-ink-muted-48">
                                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-pearl text-ink-muted">
                                                    <Icon className="h-3.5 w-3.5" />
                                                </span>
                                                <span className="min-w-0">
                                                    <span className="block text-ink-muted">{label}</span>
                                                    <span className="block truncate">{result.displayUrl}</span>
                                                </span>
                                            </span>
                                            <h2 className="mt-2 text-lg font-semibold leading-6 tracking-tight text-primary group-hover:underline">
                                                {result.title}
                                            </h2>
                                            <p className="mt-1.5 max-w-[72ch] text-sm leading-6 text-ink-muted">
                                                {result.snippet}
                                            </p>
                                        </button>
                                    </li>
                                )
                            })}
                        </ol>
                    ) : (
                        <div className="py-16">
                            <h2 className="text-lg font-semibold text-ink">No matching results</h2>
                            <p className="mt-2 max-w-md text-sm leading-6 text-ink-muted">
                                Try a broader query or choose another result filter.
                            </p>
                        </div>
                    )}

                    <footer className="border-t border-hairline py-6 text-xs text-ink-muted-48">
                        {mode === 'live' ? 'Search powered by Tavily' : 'Using the AetherOS demo index'}
                    </footer>
                </div>
            </main>
        </div>
    )
}
