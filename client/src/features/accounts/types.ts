export type AccountRole = 'admin' | 'member' | 'guest'

export interface AccountProfile {
    id: string
    displayName: string
    role: AccountRole
    pinHint: string
}

export interface SessionSnapshot {
    activeUserId: string | null
    selectedLoginUserId: string
    isLocked: boolean
}
