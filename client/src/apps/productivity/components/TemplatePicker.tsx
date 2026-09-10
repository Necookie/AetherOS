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
        <section className="rounded-lg border border-white/10 bg-tile-2 p-3">
            <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                    <p className="text-[12px] font-semibold text-on-dark-muted">Quick create</p>
                    <h3 className="mt-1 text-sm font-semibold text-on-dark">{appLabel} templates</h3>
                    <p className="mt-1 text-xs text-on-dark-muted">Choose a starter and open a working draft immediately.</p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-pill border border-white/10 bg-tile-1 px-2.5 py-1 text-[12px] font-semibold text-on-dark-muted transition-transform active:scale-95"
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
                        className="rounded-lg border border-white/10 bg-tile-1 p-3 text-left transition-colors hover:border-primary-on-dark"
                    >
                        <div className="flex items-center justify-between gap-2">
                            <span className="rounded-pill border border-white/10 bg-tile-2 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-on-dark-muted">
                                {template.category}
                            </span>
                            <span className="text-[10px] uppercase tracking-[0.18em] text-on-dark-muted">Use template</span>
                        </div>
                        <p className="mt-3 text-sm font-semibold text-on-dark">{template.title}</p>
                        <p className="mt-1 min-h-[2.5rem] text-xs leading-5 text-on-dark-muted">{template.summary}</p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                            {template.highlights.map((highlight) => (
                                <span
                                    key={`${template.id}-${highlight}`}
                                    className="rounded-pill bg-tile-2 px-2 py-1 text-[12px] text-on-dark-muted"
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
