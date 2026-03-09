import { create } from 'zustand'
import type { DirtyGuardDecision, DirtyGuardPromptState } from './types'

interface DirtyGuardStoreState {
    prompt: DirtyGuardPromptState | null
    openPrompt: (prompt: DirtyGuardPromptState) => Promise<DirtyGuardDecision>
    resolvePrompt: (decision: DirtyGuardDecision) => void
}

let promptResolver: ((decision: DirtyGuardDecision) => void) | null = null

export const useDirtyGuardStore = create<DirtyGuardStoreState>((set) => ({
    prompt: null,
    openPrompt: (prompt) => new Promise<DirtyGuardDecision>((resolve) => {
        promptResolver = resolve
        set({ prompt })
    }),
    resolvePrompt: (decision) => {
        const resolver = promptResolver
        promptResolver = null
        set({ prompt: null })
        resolver?.(decision)
    },
}))

