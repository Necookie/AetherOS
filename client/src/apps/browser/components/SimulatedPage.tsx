import type { SimulatedPageModel, SimulatedSearchResult } from '../simulation/searchSimulation'

interface SimulatedPageProps {
    page: SimulatedPageModel
    relatedResults: SimulatedSearchResult[]
    onOpenResult: (result: SimulatedSearchResult) => void
}

export default function SimulatedPage({ page, relatedResults, onOpenResult }: SimulatedPageProps) {
    return (
        <div className="h-full overflow-y-auto bg-parchment px-6 py-6">
            <article className="mx-auto max-w-4xl rounded-lg border border-hairline bg-canvas p-7">
                <div className="flex flex-wrap items-center gap-3 text-[12px] text-ink-muted-48">
                    <span className="rounded-pill bg-[rgba(0,102,204,0.1)] px-3 py-1 text-primary">{page.badge}</span>
                    <span>{page.displayUrl}</span>
                </div>

                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink">{page.title}</h1>
                <p className="mt-4 text-base leading-7 text-ink-muted">{page.lead}</p>

                <div className="mt-8 space-y-6">
                    {page.sections.map((section) => (
                        <section key={section.heading}>
                            <h2 className="text-lg font-semibold text-ink">{section.heading}</h2>
                            <p className="mt-2 text-sm leading-7 text-ink-muted">{section.body}</p>
                        </section>
                    ))}
                </div>

                {relatedResults.length > 0 && (
                    <div className="mt-10 border-t border-hairline pt-6">
                        <h2 className="text-sm font-semibold text-ink-muted">Related inside AetherOS</h2>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            {relatedResults.map((result) => (
                                <button
                                    key={`${result.id}:${result.targetUrl}`}
                                    onClick={() => onOpenResult(result)}
                                    className="rounded-lg border border-hairline bg-parchment p-4 text-left transition-colors hover:bg-canvas"
                                >
                                    <p className="text-sm font-semibold text-ink">{result.title}</p>
                                    <p className="mt-1 text-xs text-ink-muted-48">{result.displayUrl}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </article>
        </div>
    )
}
