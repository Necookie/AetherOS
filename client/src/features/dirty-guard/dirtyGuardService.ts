import { applyDirtyGuardDecision } from './dirtyGuardDomain'
import { useDirtyGuardStore } from './dirtyGuardStore'
import type { DirtyGuardReason, DirtyGuardScope } from './types'

interface DirtyGuardRequest {
    reason: DirtyGuardReason
    scopeIds?: string[]
}

const scopes = new Map<string, DirtyGuardScope>()
let queue = Promise.resolve(true)

function collectDirtyScopes(scopeIds?: string[]) {
    const idFilter = scopeIds ? new Set(scopeIds) : null
    return [...scopes.values()].filter((scope) => {
        if (idFilter && !idFilter.has(scope.id)) {
            return false
        }
        return scope.isDirty()
    })
}

export const dirtyGuardService = {
    registerScope(scope: DirtyGuardScope) {
        scopes.set(scope.id, scope)
        return () => {
            const current = scopes.get(scope.id)
            if (current === scope) {
                scopes.delete(scope.id)
            }
        }
    },
    async confirmTransition(request: DirtyGuardRequest) {
        queue = queue.then(async () => {
            const dirtyScopes = collectDirtyScopes(request.scopeIds)
            if (dirtyScopes.length === 0) {
                return true
            }

            const decision = await useDirtyGuardStore.getState().openPrompt({
                reason: request.reason,
                labels: dirtyScopes.map((scope) => scope.label),
            })

            return applyDirtyGuardDecision(dirtyScopes, decision)
        })

        return queue
    },
}

