import { Cpu, HardDrive, Info, ShieldCheck, X } from 'lucide-react'
import AetherMark from '../brand/AetherMark'
import type { AccountProfile } from '../../features/accounts/types'

interface AboutModalProps {
    isOpen: boolean
    onClose: () => void
    activeAccount?: AccountProfile | null
    onOpenSettings?: () => void
    onOpenTaskMgr?: () => void
}

export default function AboutModal({
    isOpen,
    onClose,
    activeAccount,
    onOpenSettings,
    onOpenTaskMgr,
}: AboutModalProps) {
    if (!isOpen) {
        return null
    }

    return (
        <div
            className="fixed inset-0 z-[var(--ds-z-modal)] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="about-aetheros-title"
        >
            <div
                className="relative w-full max-w-md rounded-lg border border-hairline bg-canvas p-6 text-ink shadow-elevated"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-parchment hover:text-ink"
                    aria-label="Close dialog"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white mb-4">
                        <AetherMark className="h-10 w-10 text-white" />
                    </div>

                    <h2 id="about-aetheros-title" className="text-2xl font-semibold tracking-tight text-ink">
                        AetherOS
                    </h2>
                    <p className="mt-1 text-xs text-ink-muted">
                        Version 1.0.0 (Build 2026.03) · System Simulator
                    </p>
                </div>

                <div className="mt-6 space-y-2.5 rounded-lg border border-hairline bg-parchment p-3 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-hairline/60">
                        <span className="flex items-center gap-2 text-ink-muted">
                            <Cpu className="h-3.5 w-3.5 text-primary" />
                            Processor
                        </span>
                        <span className="font-semibold text-ink">Virtual Kernel Core (Web Worker)</span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-hairline/60">
                        <span className="flex items-center gap-2 text-ink-muted">
                            <HardDrive className="h-3.5 w-3.5 text-primary" />
                            Memory & Storage
                        </span>
                        <span className="font-semibold text-ink">16 GB Simulated RAM · Virtual FS</span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-hairline/60">
                        <span className="flex items-center gap-2 text-ink-muted">
                            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                            Active Profile
                        </span>
                        <span className="font-semibold text-ink">
                            {activeAccount ? `${activeAccount.displayName} (${activeAccount.role})` : 'System User'}
                        </span>
                    </div>

                    <div className="flex items-center justify-between py-1">
                        <span className="flex items-center gap-2 text-ink-muted">
                            <Info className="h-3.5 w-3.5 text-primary" />
                            Graphics & Compositor
                        </span>
                        <span className="font-semibold text-ink">Aether Display Engine</span>
                    </div>
                </div>

                <p className="mt-4 text-center text-[11px] leading-relaxed text-ink-muted">
                    Designed for operating systems & HCI evaluation. Pure canvas surfaces, predictable scheduling, and sandboxed VFS.
                </p>

                <div className="mt-6 flex items-center justify-end gap-2">
                    {onOpenTaskMgr && (
                        <button
                            onClick={() => {
                                onClose()
                                onOpenTaskMgr()
                            }}
                            className="rounded-pill border border-hairline bg-parchment px-3.5 py-1.5 text-xs font-semibold text-ink transition-transform active:scale-95 hover:bg-canvas"
                        >
                            Task Manager
                        </button>
                    )}
                    {onOpenSettings && (
                        <button
                            onClick={() => {
                                onClose()
                                onOpenSettings()
                            }}
                            className="rounded-pill bg-primary px-4 py-1.5 text-xs font-semibold text-white transition-transform active:scale-95 hover:bg-primary/90"
                        >
                            System Settings...
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
