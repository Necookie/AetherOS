import type { AccountProfile } from '../types'
import type { SessionState } from './sessionService'

export function getActiveAccount(state: Pick<SessionState, 'activeUserId' | 'accounts'>): AccountProfile | null {
    if (!state.activeUserId) {
        return null
    }

    return state.accounts.find((account) => account.id === state.activeUserId) ?? null
}
