import type { ReactNode } from 'react'

interface WidgetCardProps {
    title: string
    subtitle?: string
    icon?: ReactNode
    badge?: ReactNode
    children: ReactNode
    className?: string
}

export default function WidgetCard({
    title,
    subtitle,
    icon,
    badge,
    children,
    className = '',
}: WidgetCardProps) {
    return (
        <section
            className={`group/widget relative overflow-hidden rounded-xl border border-hairline/80 bg-canvas/85 p-3.5 shadow-xs backdrop-blur-md transition-all duration-200 hover:border-primary/30 hover:shadow-sm ${className}`}
        >
            <header className="mb-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    {icon && <span className="shrink-0 text-primary">{icon}</span>}
                    <div className="min-w-0">
                        <h3 className="truncate text-xs font-semibold tracking-wide text-ink">{title}</h3>
                        {subtitle && <p className="truncate text-[11px] text-ink-muted-48">{subtitle}</p>}
                    </div>
                </div>
                {badge && <div className="shrink-0">{badge}</div>}
            </header>
            {children}
        </section>
    )
}
