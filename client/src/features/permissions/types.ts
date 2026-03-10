import type { AccountRole } from '../accounts/types'

export type PermissionId =
    | 'app.launch.settings'
    | 'app.launch.taskmgr'
    | 'files.delete'
    | 'files.move.system'
    | 'settings.modify'

export type FilePermissionAction = 'create' | 'rename' | 'delete' | 'move'

export type PermissionCategory = 'apps' | 'files' | 'settings'

export interface PermissionDefinition {
    id: PermissionId
    label: string
    description: string
    category: PermissionCategory
    recovery: string
}

export interface PermissionGrantSource {
    reason: string
    requestedAt: string
}

export interface PermissionGrantRecord {
    permission: PermissionId
    grantedAt: string
    source: PermissionGrantSource
}

export interface PermissionStatus extends PermissionDefinition {
    granted: boolean
    grant: PermissionGrantRecord | null
}

export interface PermissionRequest {
    userId: string
    permission: PermissionId
    reason: string
}

export interface PermissionDecision {
    allowed: boolean
    reason: string | null
    recovery?: string | null
    needsPrompt: boolean
    permission?: PermissionId
}

export interface GuardContext {
    role: AccountRole
    appId?: string
    action?: FilePermissionAction
    path?: string
}
