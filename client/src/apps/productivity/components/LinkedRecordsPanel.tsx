import type { ProductivityRecord } from '../../../features/productivity'

interface LinkedRecordsPanelProps {
    records: ProductivityRecord[]
}

export default function LinkedRecordsPanel({ records }: LinkedRecordsPanelProps) {
    return (
        <section className="rounded-md border border-white/10 bg-tile-2 p-3">
            <p className="text-[12px] font-semibold text-on-dark-muted">Cross-app links</p>
            <div className="mt-2 space-y-1">
                {records.map((record) => (
                    <p key={`${record.appId}:${record.id}`} className="truncate text-xs text-on-dark">
                        [{record.appId}] {record.title || 'Untitled'}
                    </p>
                ))}
                {records.length === 0 && <p className="text-xs text-on-dark-muted">No linked records found.</p>}
            </div>
        </section>
    )
}
