interface AttachmentPanelProps {
    attachments: string[]
    attachmentInput: string
    onAttachmentInputChange: (value: string) => void
    onAddAttachment: () => void
    onRemoveAttachment: (path: string) => void
}

export default function AttachmentPanel({
    attachments,
    attachmentInput,
    onAttachmentInputChange,
    onAddAttachment,
    onRemoveAttachment,
}: AttachmentPanelProps) {
    return (
        <section className="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">Attachments (VFS paths)</p>
            <div className="mt-2 flex gap-2">
                <input
                    value={attachmentInput}
                    onChange={(event) => onAttachmentInputChange(event.target.value)}
                    placeholder="/home/user/Downloads/example.txt"
                    className="flex-1 rounded-md border border-slate-700 bg-slate-950/80 px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-[var(--os-accent)]"
                />
                <button
                    onClick={onAddAttachment}
                    className="rounded-md border border-slate-600 bg-slate-800 px-2 py-1 text-xs text-slate-100 transition hover:bg-slate-700"
                >
                    Add
                </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
                {attachments.map((path) => (
                    <button
                        key={path}
                        className="rounded border border-slate-600 bg-slate-800/70 px-2 py-1 text-[11px] text-slate-200"
                        onClick={() => onRemoveAttachment(path)}
                        title="Click to remove"
                    >
                        {path}
                    </button>
                ))}
            </div>
        </section>
    )
}
