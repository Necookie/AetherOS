import type { ProductivityRecord } from '../../../features/productivity'

interface RecordListPaneProps {
    label: string
    records: ProductivityRecord[]
    activeId: string | null
    onCreate: () => void
    onSelect: (id: string) => void
}

export default function RecordListPane({ label, records, activeId, onCreate, onSelect }: RecordListPaneProps) {
    return (
        <aside className="w-full border-b border-slate-700/70 bg-slate-950/45 md:w-72 md:border-b-0 md:border-r">
            <div className="flex items-center justify-between px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
                <button
                    className="rounded-md border border-slate-600 bg-slate-800 px-2 py-1 text-xs text-slate-200 transition hover:bg-slate-700"
                    onClick={onCreate}
                >
                    New
                </button>
            </div>
            <div className="max-h-44 overflow-auto md:max-h-none md:h-[calc(100%-3.25rem)]">
                {records.map((record) => (
                    <button
                        key={record.id}
                        className={`block w-full border-l-2 px-3 py-2 text-left transition ${
                            activeId === record.id
                                ? 'border-[var(--os-accent)] bg-slate-800/75 text-slate-100'
                                : 'border-transparent text-slate-300 hover:bg-slate-800/50'
                        }`}
                        onClick={() => onSelect(record.id)}
                    >
                        <p className="truncate text-sm font-medium">{record.title || 'Untitled'}</p>
                        <p className="mt-1 truncate text-xs text-slate-400">rev {record.revision}</p>
                    </button>
                ))}
                {records.length === 0 && (
                    <p className="px-3 py-4 text-xs text-slate-400">No items yet.</p>
                )}
            </div>
        </aside>
    )
}
