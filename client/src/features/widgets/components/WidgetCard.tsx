import type { ReactNode } from 'react'

interface WidgetCardProps {
    title: string
    subtitle?: string
    children: ReactNode
}

export default function WidgetCard({ title, subtitle, children }: WidgetCardProps) {
    return (
        <section className="rounded-lg border border-hairline bg-canvas p-3.5">
            <header className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-xs font-semibold text-ink-muted">{title}</h3>
                {subtitle ? <p className="text-[12px] text-ink-muted-48">{subtitle}</p> : null}
            </header>
            {children}
        </section>
    )
}
