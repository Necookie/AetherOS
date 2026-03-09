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
        <div className="absolute inset-0 z-[12000] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl border border-slate-600 bg-slate-900 p-4 text-slate-100 shadow-2xl">
                <h2 className="text-base font-semibold">Unsaved changes detected</h2>
                <p className="mt-2 text-sm text-slate-300">
                    {affected ? `${affected} has unsaved changes ${label}.` : `There are unsaved changes ${label}.`}
                </p>
                <p className="mt-1 text-xs text-slate-400">Choose Save, Discard, or Cancel.</p>
                <div className="mt-4 flex justify-end gap-2">
                    <button
                        className="rounded-md border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm hover:bg-slate-700"
                        onClick={() => resolvePrompt('cancel')}
                    >
                        Cancel
                    </button>
                    <button
                        className="rounded-md border border-rose-500/60 bg-rose-950/50 px-3 py-1.5 text-sm text-rose-100 hover:bg-rose-900/50"
                        onClick={() => resolvePrompt('discard')}
                    >
                        Discard
                    </button>
                    <button
                        className="rounded-md bg-[var(--os-accent)] px-3 py-1.5 text-sm text-white hover:opacity-90"
                        onClick={() => resolvePrompt('save')}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    )
}

