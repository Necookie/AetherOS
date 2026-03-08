import type { ReactNode } from 'react'

interface WidgetCardProps {
    title: string
    subtitle?: string
    children: ReactNode
}

export default function WidgetCard({ title, subtitle, children }: WidgetCardProps) {
    return (
        <section
            className="rounded-2xl border border-white/55 p-3.5 backdrop-blur-xl"
            style={{
                background: 'linear-gradient(160deg, rgb(255 255 255 / 0.56), rgb(255 255 255 / 0.28))',
                boxShadow: '0 16px 30px rgb(15 23 42 / 0.24)',
            }}
        >
            <header className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">{title}</h3>
                {subtitle ? <p className="text-[11px] text-slate-600">{subtitle}</p> : null}
            </header>
            {children}
        </section>
    )
}
