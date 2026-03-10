import { getPermissionDefinition } from './definitions'
import type { PermissionDecision, PermissionId } from './types'

export function formatPermissionDecisionMessage(decision: PermissionDecision) {
    if (!decision.reason) {
        return 'Permission denied.'
    }

    if (!decision.recovery) {
        return decision.reason
    }

    return `${decision.reason} ${decision.recovery}`
}

export function formatPermissionRevokedMessage(permission: PermissionId) {
    const definition = getPermissionDefinition(permission)
    return `${definition.label} was revoked for this profile. ${definition.recovery}`
}
