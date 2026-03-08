import type { AccountRole } from '../accounts/types'

export type PermissionId =
    | 'app.launch.settings'
    | 'app.launch.taskmgr'
    | 'files.delete'
    | 'files.move.system'
    | 'settings.modify'

export type FilePermissionAction = 'create' | 'rename' | 'delete' | 'move'

export interface PermissionRequest {
    userId: string
    permission: PermissionId
    reason: string
}

export interface PermissionDecision {
    allowed: boolean
    reason: string | null
    needsPrompt: boolean
    permission?: PermissionId
}

export interface GuardContext {
    role: AccountRole
    appId?: string
    action?: FilePermissionAction
    path?: string
}
