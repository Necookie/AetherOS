interface AttachmentPanelProps {
    attachments: string[]
    attachmentInput: string
    onAttachmentInputChange: (value: string) => void
    onAddAttachment: () => void
    onRemoveAttachment: (path: string) => void
    variant?: 'dark' | 'light'
}

export default function AttachmentPanel({
    attachments,
    attachmentInput,
    onAttachmentInputChange,
    onAddAttachment,
    onRemoveAttachment,
    variant = 'dark',
}: AttachmentPanelProps) {
    const isLight = variant === 'light'
    return (
        <section className={`rounded-lg border p-3 ${isLight ? 'border-hairline bg-canvas text-ink' : 'border-white/10 bg-tile-2 text-on-dark'}`}>
            <p className={`text-[12px] font-semibold ${isLight ? 'text-ink-muted' : 'text-on-dark-muted'}`}>Attachments (VFS paths)</p>
            <div className="mt-2 flex gap-2">
                <input
                    value={attachmentInput}
                    onChange={(event) => onAttachmentInputChange(event.target.value)}
                    placeholder="/home/user/Downloads/example.txt"
                    className={`flex-1 rounded-pill border px-3 py-1.5 text-xs outline-none ${
                        isLight
                            ? 'border-hairline bg-canvas text-ink placeholder:text-ink-muted-48 focus:border-primary-focus'
                            : 'border-white/10 bg-tile-1 text-on-dark focus:border-primary-on-dark'
                    }`}
                />
                <button
                    onClick={onAddAttachment}
                    className={`rounded-pill px-3 py-1 text-xs font-semibold transition-transform active:scale-95 ${
                        isLight
                            ? 'bg-primary text-on-dark hover:bg-primary/90'
                            : 'border border-white/10 bg-tile-1 text-on-dark'
                    }`}
                >
                    Add
                </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
                {attachments.map((path) => (
                    <button
                        key={path}
                        className={`rounded-pill border px-2.5 py-1 text-xs transition-colors ${
                            isLight
                                ? 'border-hairline bg-pearl text-ink hover:border-danger hover:text-danger'
                                : 'border-white/10 bg-tile-1 text-on-dark'
                        }`}
                        onClick={() => onRemoveAttachment(path)}
                        title="Click to remove"
                    >
                        {path} ×
                    </button>
                ))}
            </div>
        </section>
    )
}
