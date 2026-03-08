import type { ProductivityRecord } from '../../../features/productivity'

interface LinkedRecordsPanelProps {
    records: ProductivityRecord[]
}

export default function LinkedRecordsPanel({ records }: LinkedRecordsPanelProps) {
    return (
        <section className="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">Cross-app links</p>
            <div className="mt-2 space-y-1">
                {records.map((record) => (
                    <p key={`${record.appId}:${record.id}`} className="truncate text-xs text-slate-200">
                        [{record.appId}] {record.title || 'Untitled'}
                    </p>
                ))}
                {records.length === 0 && <p className="text-xs text-slate-400">No linked records found.</p>}
            </div>
        </section>
    )
}
