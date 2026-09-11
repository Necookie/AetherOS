import type { ProductivityTemplate } from '../../../features/productivity'

interface TemplatePickerProps {
    appLabel: string
    templates: ProductivityTemplate[]
    onSelect: (templateId: string) => void
    onClose: () => void
    variant?: 'dark' | 'light'
}

export default function TemplatePicker({
    appLabel,
    templates,
    onSelect,
    onClose,
    variant = 'dark',
}: TemplatePickerProps) {
    const isLight = variant === 'light'
    return (
        <section className={`rounded-lg border p-4 shadow-sm ${isLight ? 'border-hairline bg-pearl text-ink' : 'border-white/10 bg-tile-2 text-on-dark'}`}>
            <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                    <p className={`text-[12px] font-semibold ${isLight ? 'text-ink-muted' : 'text-on-dark-muted'}`}>Quick create</p>
                    <h3 className="mt-1 text-sm font-semibold">{appLabel} templates</h3>
                    <p className={`mt-1 text-xs ${isLight ? 'text-ink-muted-48' : 'text-on-dark-muted'}`}>Choose a starter and open a working draft immediately.</p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className={`rounded-pill border px-3 py-1 text-[12px] font-semibold transition-transform active:scale-95 ${
                        isLight
                            ? 'border-hairline bg-canvas text-ink hover:bg-parchment'
                            : 'border-white/10 bg-tile-1 text-on-dark-muted'
                    }`}
                >
                    Close
                </button>
            </div>
            <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
                {templates.map((template) => (
                    <button
                        key={template.id}
                        type="button"
                        onClick={() => onSelect(template.id)}
                        className={`rounded-lg border p-3.5 text-left transition-colors ${
                            isLight
                                ? 'border-hairline bg-canvas hover:border-primary hover:shadow-sm'
                                : 'border-white/10 bg-tile-1 hover:border-primary-on-dark'
                        }`}
                    >
                        <div className="flex items-center justify-between gap-2">
                            <span className={`rounded-pill border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                                isLight
                                    ? 'border-hairline bg-pearl text-ink-muted'
                                    : 'border-white/10 bg-tile-2 text-on-dark-muted'
                            }`}>
                                {template.category}
                            </span>
                            <span className={`text-[10px] uppercase tracking-[0.18em] ${isLight ? 'text-primary' : 'text-on-dark-muted'}`}>Use template</span>
                        </div>
                        <p className="mt-3 text-sm font-semibold">{template.title}</p>
                        <p className={`mt-1 min-h-[2.5rem] text-xs leading-5 ${isLight ? 'text-ink-muted' : 'text-on-dark-muted'}`}>{template.summary}</p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                            {template.highlights.map((highlight) => (
                                <span
                                    key={`${template.id}-${highlight}`}
                                    className={`rounded-pill px-2 py-0.5 text-[11px] ${
                                        isLight
                                            ? 'bg-pearl text-ink-muted'
                                            : 'bg-tile-2 text-on-dark-muted'
                                    }`}
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
