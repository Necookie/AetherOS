import type { SimulatedPageModel, SimulatedSearchResult } from '../simulation/searchSimulation'

interface SimulatedPageProps {
    page: SimulatedPageModel
    relatedResults: SimulatedSearchResult[]
    onOpenResult: (result: SimulatedSearchResult) => void
}

export default function SimulatedPage({ page, relatedResults, onOpenResult }: SimulatedPageProps) {
    return (
        <div className="h-full overflow-y-auto bg-[linear-gradient(180deg,#f8fbff_0%,#eef4ff_100%)] px-6 py-6">
            <article className="mx-auto max-w-4xl rounded-[2rem] border border-white/70 bg-white/82 p-7 shadow-[0_24px_80px_rgb(15_23_42_/_0.12)] backdrop-blur-xl">
                <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    <span className="rounded-full bg-sky-500/10 px-3 py-1 text-sky-700">{page.badge}</span>
                    <span>{page.displayUrl}</span>
                </div>

                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">{page.title}</h1>
                <p className="mt-4 text-base leading-7 text-slate-600">{page.lead}</p>

                <div className="mt-8 space-y-6">
                    {page.sections.map((section) => (
                        <section key={section.heading}>
                            <h2 className="text-lg font-semibold text-slate-900">{section.heading}</h2>
                            <p className="mt-2 text-sm leading-7 text-slate-600">{section.body}</p>
                        </section>
                    ))}
                </div>

                {relatedResults.length > 0 && (
                    <div className="mt-10 border-t border-slate-200 pt-6">
                        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Related inside AetherOS</h2>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            {relatedResults.map((result) => (
                                <button
                                    key={`${result.id}:${result.targetUrl}`}
                                    onClick={() => onOpenResult(result)}
                                    className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-left transition-colors hover:bg-white"
                                >
                                    <p className="text-sm font-semibold text-slate-900">{result.title}</p>
                                    <p className="mt-1 text-xs text-slate-500">{result.displayUrl}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </article>
        </div>
    )
}
