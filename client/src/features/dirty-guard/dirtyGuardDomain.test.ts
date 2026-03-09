import { describe, expect, it, vi } from 'vitest'
import { applyDirtyGuardDecision } from './dirtyGuardDomain'
import type { DirtyGuardScope } from './types'

function createScope(overrides: Partial<DirtyGuardScope> = {}): DirtyGuardScope {
    return {
        id: overrides.id ?? 'notes',
        label: overrides.label ?? 'Notes',
        isDirty: overrides.isDirty ?? (() => true),
        save: overrides.save ?? (() => true),
        discard: overrides.discard ?? (() => undefined),
    }
}

describe('applyDirtyGuardDecision', () => {
    it('cancels transition without mutating state', async () => {
        const save = vi.fn(() => true)
        const discard = vi.fn()
        const scope = createScope({ save, discard })

        const result = await applyDirtyGuardDecision([scope], 'cancel')

        expect(result).toBe(false)
        expect(save).not.toHaveBeenCalled()
        expect(discard).not.toHaveBeenCalled()
    })

    it('discards dirty scopes and allows transition', async () => {
        const discard = vi.fn()
        const scope = createScope({ discard })

        const result = await applyDirtyGuardDecision([scope], 'discard')

        expect(result).toBe(true)
        expect(discard).toHaveBeenCalledTimes(1)
    })

    it('saves dirty scopes and allows transition', async () => {
        let dirty = true
        const scope = createScope({
            isDirty: () => dirty,
            save: () => {
                dirty = false
                return true
            },
        })

        const result = await applyDirtyGuardDecision([scope], 'save')
        expect(result).toBe(true)
    })

    it('blocks transition when save fails', async () => {
        const scope = createScope({
            save: () => false,
        })

        const result = await applyDirtyGuardDecision([scope], 'save')
        expect(result).toBe(false)
    })
})

