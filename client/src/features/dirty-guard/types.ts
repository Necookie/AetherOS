export type DirtyGuardReason = 'close-window' | 'minimize-window' | 'lock-session' | 'logout-session'
export type DirtyGuardDecision = 'save' | 'discard' | 'cancel'

export interface DirtyGuardScope {
    id: string
    label: string
    isDirty: () => boolean
    save: () => Promise<boolean> | boolean
    discard: () => void
}

export interface DirtyGuardPromptState {
    reason: DirtyGuardReason
    labels: string[]
}

