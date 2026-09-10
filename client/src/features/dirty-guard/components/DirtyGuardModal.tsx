import { useDirtyGuardStore } from '../dirtyGuardStore'

function getReasonLabel(reason: string) {
    switch (reason) {
        case 'close-window':
            return 'before closing this window'
        case 'minimize-window':
            return 'before minimizing this window'
        case 'lock-session':
            return 'before locking this session'
        case 'logout-session':
            return 'before logging out'
        default:
            return 'before continuing'
    }
}

export default function DirtyGuardModal() {
    const prompt = useDirtyGuardStore((state) => state.prompt)
    const resolvePrompt = useDirtyGuardStore((state) => state.resolvePrompt)

    if (!prompt) {
        return null
    }

    const label = getReasonLabel(prompt.reason)
    const affected = prompt.labels.join(', ')

    return (
        <div className="absolute inset-0 z-[12000] flex items-center justify-center bg-[rgba(0,0,0,0.4)] p-4">
            <div className="w-full max-w-md rounded-lg border border-hairline bg-canvas p-4 text-ink shadow-elevated">
                <h2 className="text-base font-semibold">Unsaved changes detected</h2>
                <p className="mt-2 text-sm text-ink-muted">
                    {affected ? `${affected} has unsaved changes ${label}.` : `There are unsaved changes ${label}.`}
                </p>
                <p className="mt-1 text-xs text-ink-muted-48">Choose Save, Discard, or Cancel.</p>
                <div className="mt-4 flex justify-end gap-2">
                    <button
                        className="rounded-md border border-hairline bg-parchment px-3 py-1.5 text-sm text-ink transition-transform active:scale-95"
                        onClick={() => resolvePrompt('cancel')}
                    >
                        Cancel
                    </button>
                    <button
                        className="rounded-md border border-hairline bg-parchment px-3 py-1.5 text-sm text-danger transition-transform active:scale-95"
                        onClick={() => resolvePrompt('discard')}
                    >
                        Discard
                    </button>
                    <button
                        className="rounded-pill bg-primary px-3 py-1.5 text-sm text-white transition-transform active:scale-95"
                        onClick={() => resolvePrompt('save')}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    )
}

