import type { ProductivityRecord } from '../../../features/productivity'

interface RecordListPaneProps {
    label: string
    records: ProductivityRecord[]
    activeId: string | null
    onCreate: () => void
    onOpenTemplates?: () => void
    onSelect: (id: string) => void
}

export default function RecordListPane({ label, records, activeId, onCreate, onOpenTemplates, onSelect }: RecordListPaneProps) {
    return (
        <aside className="w-full border-b border-white/10 bg-tile-2 md:w-72 md:border-b-0 md:border-r">
            <div className="px-3 py-3">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-[12px] font-semibold text-on-dark-muted">{label}</p>
                    <button
                        className="rounded-sm border border-white/10 bg-tile-1 px-2 py-1 text-xs text-on-dark transition-transform active:scale-95"
                        onClick={onCreate}
                    >
                        New
                    </button>
                </div>
                {onOpenTemplates ? (
                    <button
                        className="mt-2 w-full rounded-md border border-white/10 bg-tile-1 px-3 py-2 text-left text-xs text-on-dark-muted transition-colors hover:border-primary-on-dark"
                        onClick={onOpenTemplates}
                    >
                        Quick create from template
                    </button>
                ) : null}
            </div>
            <div className="max-h-44 overflow-auto md:max-h-none md:h-[calc(100%-5.5rem)]">
                {records.map((record) => (
                    <button
                        key={record.id}
                        className={`block w-full border-l-2 px-3 py-2 text-left transition-colors ${
                            activeId === record.id
                                ? 'border-primary-on-dark bg-tile-1 text-on-dark'
                                : 'border-transparent text-on-dark-muted hover:bg-tile-1'
                        }`}
                        onClick={() => onSelect(record.id)}
                    >
                        <p className="truncate text-sm font-semibold">{record.title || 'Untitled'}</p>
                        <p className="mt-1 truncate text-xs text-on-dark-muted">rev {record.revision}</p>
                    </button>
                ))}
                {records.length === 0 && (
                    <p className="px-3 py-4 text-xs text-on-dark-muted">No items yet.</p>
                )}
            </div>
        </aside>
    )
}
