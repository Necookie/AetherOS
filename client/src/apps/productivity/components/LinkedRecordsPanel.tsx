import type { ProductivityRecord } from '../../../features/productivity'

interface LinkedRecordsPanelProps {
    records: ProductivityRecord[]
    variant?: 'dark' | 'light'
}

export default function LinkedRecordsPanel({ records, variant = 'dark' }: LinkedRecordsPanelProps) {
    const isLight = variant === 'light'
    return (
        <section className={`rounded-lg border p-3 ${isLight ? 'border-hairline bg-canvas text-ink' : 'border-white/10 bg-tile-2 text-on-dark'}`}>
            <p className={`text-[12px] font-semibold ${isLight ? 'text-ink-muted' : 'text-on-dark-muted'}`}>Cross-app links</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
                {records.map((record) => (
                    <span
                        key={`${record.appId}:${record.id}`}
                        className={`rounded-pill border px-2.5 py-1 text-xs ${
                            isLight
                                ? 'border-hairline bg-pearl text-ink'
                                : 'border-white/10 bg-tile-1 text-on-dark'
                        }`}
                    >
                        <span className="font-semibold text-primary">{record.appId}</span> · {record.title || 'Untitled'}
                    </span>
                ))}
                {records.length === 0 && (
                    <p className={`text-xs ${isLight ? 'text-ink-muted-48' : 'text-on-dark-muted'}`}>No linked records found.</p>
                )}
            </div>
        </section>
    )
}
