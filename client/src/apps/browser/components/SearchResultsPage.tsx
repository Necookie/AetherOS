import type { SimulatedSearchResult } from '../simulation/searchSimulation'

interface SearchResultsPageProps {
    query: string
    mode: 'live' | 'mock'
    results: SimulatedSearchResult[]
    onOpenResult: (result: SimulatedSearchResult) => void
}

export default function SearchResultsPage({ query, mode, results, onOpenResult }: SearchResultsPageProps) {
    return (
        <div className="h-full overflow-y-auto bg-parchment px-6 py-5">
            <div className="mx-auto max-w-4xl">
                <div className="rounded-lg border border-hairline bg-canvas p-5">
                    <p className="text-[12px] text-ink-muted">AetherOS search simulation</p>
                    <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">{query}</h1>
                    <p className="mt-2 text-sm text-ink-muted">
                        Results stay inside the browser window so the shell feels self-contained during demos.
                    </p>
                    <p className="mt-3 text-xs text-ink-muted-48">
                        Source: {mode === 'live' ? 'Live server search' : 'Mock server search'}
                    </p>
                </div>

                <div className="mt-5 space-y-3">
                    {results.map((result) => (
                        <button
                            key={`${result.id}:${result.targetUrl}`}
                            onClick={() => onOpenResult(result)}
                            className="block w-full rounded-lg border border-hairline bg-canvas p-5 text-left transition-colors hover:bg-parchment"
                        >
                            <div className="flex items-center gap-3 text-[12px] text-ink-muted-48">
                                <span>{result.source === 'web' ? 'Internal result' : result.source}</span>
                                <span className="h-1 w-1 rounded-full bg-ink-muted-48" />
                                <span>{result.displayUrl}</span>
                            </div>
                            <h2 className="mt-2 text-lg font-semibold text-ink">{result.title}</h2>
                            <p className="mt-2 text-sm leading-6 text-ink-muted">{result.snippet}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
