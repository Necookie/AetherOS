import type { DirtyGuardDecision, DirtyGuardScope } from './types'

export async function applyDirtyGuardDecision(
    scopes: DirtyGuardScope[],
    decision: DirtyGuardDecision,
) {
    if (decision === 'cancel') {
        return false
    }

    if (decision === 'discard') {
        scopes.forEach((scope) => {
            if (scope.isDirty()) {
                scope.discard()
            }
        })
        return true
    }

    for (const scope of scopes) {
        if (!scope.isDirty()) {
            continue
        }

        const result = await scope.save()
        if (!result || scope.isDirty()) {
            return false
        }
    }

    return true
}

