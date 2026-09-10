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
        <section className="rounded-md border border-white/10 bg-tile-2 p-3">
            <p className="text-[12px] font-semibold text-on-dark-muted">Attachments (VFS paths)</p>
            <div className="mt-2 flex gap-2">
                <input
                    value={attachmentInput}
                    onChange={(event) => onAttachmentInputChange(event.target.value)}
                    placeholder="/home/user/Downloads/example.txt"
                    className="flex-1 rounded-sm border border-white/10 bg-tile-1 px-2 py-1.5 text-xs text-on-dark outline-none focus:border-primary-on-dark"
                />
                <button
                    onClick={onAddAttachment}
                    className="rounded-sm border border-white/10 bg-tile-1 px-2 py-1 text-xs text-on-dark transition-transform active:scale-95"
                >
                    Add
                </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
                {attachments.map((path) => (
                    <button
                        key={path}
                        className="rounded-sm border border-white/10 bg-tile-1 px-2 py-1 text-[12px] text-on-dark"
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
