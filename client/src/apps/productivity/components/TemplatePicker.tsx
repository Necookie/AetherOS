import type { ProductivityTemplate } from '../../../features/productivity'

interface TemplatePickerProps {
    appLabel: string
    templates: ProductivityTemplate[]
    onSelect: (templateId: string) => void
    onClose: () => void
}

export default function TemplatePicker({
    appLabel,
    templates,
    onSelect,
    onClose,
}: TemplatePickerProps) {
    return (
        <section className="rounded-2xl border border-white/10 bg-slate-950/80 p-3 shadow-[0_22px_60px_rgba(2,6,23,0.34)] backdrop-blur">
            <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Quick create</p>
                    <h3 className="mt-1 text-sm font-semibold text-slate-100">{appLabel} templates</h3>
                    <p className="mt-1 text-xs text-slate-400">Choose a starter and open a working draft immediately.</p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-300 transition hover:bg-slate-800"
                >
                    Close
                </button>
            </div>
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {templates.map((template) => (
                    <button
                        key={template.id}
                        type="button"
                        onClick={() => onSelect(template.id)}
                        className="group rounded-2xl border border-slate-800 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(15,23,42,0.74))] p-3 text-left transition hover:border-[var(--os-accent)] hover:bg-[linear-gradient(180deg,rgba(15,23,42,1),rgba(30,41,59,0.9))]"
                    >
                        <div className="flex items-center justify-between gap-2">
                            <span className="rounded-full border border-slate-700 bg-slate-900/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                                {template.category}
                            </span>
                            <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500 group-hover:text-slate-300">Use template</span>
                        </div>
                        <p className="mt-3 text-sm font-semibold text-slate-100">{template.title}</p>
                        <p className="mt-1 min-h-[2.5rem] text-xs leading-5 text-slate-400">{template.summary}</p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                            {template.highlights.map((highlight) => (
                                <span
                                    key={`${template.id}-${highlight}`}
                                    className="rounded-full bg-white/5 px-2 py-1 text-[11px] text-slate-300"
                                >
                                    {highlight}
                                </span>
                            ))}
                        </div>
                    </button>
                ))}
            </div>
        </section>
    )
}
