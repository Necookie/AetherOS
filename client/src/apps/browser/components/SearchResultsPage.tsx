import type { SimulatedSearchResult } from '../simulation/searchSimulation'

interface SearchResultsPageProps {
    query: string
    mode: 'live' | 'mock'
    results: SimulatedSearchResult[]
    onOpenResult: (result: SimulatedSearchResult) => void
}

export default function SearchResultsPage({ query, mode, results, onOpenResult }: SearchResultsPageProps) {
    return (
        <div className="h-full overflow-y-auto bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(244,247,255,0.94))] px-6 py-5">
            <div className="mx-auto max-w-4xl">
                <div className="rounded-3xl border border-white/70 bg-white/70 p-5 shadow-[0_20px_60px_rgb(15_23_42_/_0.10)] backdrop-blur-xl">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">AetherOS search simulation</p>
                    <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{query}</h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Results stay inside the browser window so the shell feels self-contained during demos.
                    </p>
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                        Source: {mode === 'live' ? 'Live server search' : 'Mock server search'}
                    </p>
                </div>

                <div className="mt-5 space-y-3">
                    {results.map((result) => (
                        <button
                            key={`${result.id}:${result.targetUrl}`}
                            onClick={() => onOpenResult(result)}
                            className="block w-full rounded-3xl border border-white/70 bg-white/78 p-5 text-left shadow-[0_18px_40px_rgb(15_23_42_/_0.08)] transition-transform duration-150 hover:-translate-y-0.5 hover:bg-white"
                        >
                            <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                                <span>{result.source === 'web' ? 'Internal result' : result.source}</span>
                                <span className="h-1 w-1 rounded-full bg-slate-400" />
                                <span>{result.displayUrl}</span>
                            </div>
                            <h2 className="mt-2 text-lg font-semibold text-slate-900">{result.title}</h2>
                            <p className="mt-2 text-sm leading-6 text-slate-600">{result.snippet}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
