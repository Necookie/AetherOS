import { getKernelTime } from '../../../lib/kernelClock'
import type { AccountProfile, SessionSnapshot } from '../types'
import { accountService } from './accountService'
import { sessionStorage } from './sessionStorage'
import { setActiveUserId } from './userScope'

export interface SessionState extends SessionSnapshot {
    accounts: AccountProfile[]
    isAuthenticating: boolean
    error: string | null
    lastUnlockedAt: number | null
}

function createInitialState(snapshot = sessionStorage.load()): SessionState {
    const accounts = accountService.listProfiles()
    if (snapshot.activeUserId) {
        setActiveUserId(snapshot.activeUserId)
    }

    return {
        ...snapshot,
        accounts,
        isAuthenticating: false,
        error: null,
        lastUnlockedAt: null,
    }
}

function persistSnapshot(state: SessionState) {
    sessionStorage.save({
        activeUserId: state.activeUserId,
        selectedLoginUserId: state.selectedLoginUserId,
        isLocked: state.isLocked,
    })
}

export const sessionService = {
    createInitialState,

    selectLoginUser(state: SessionState, userId: string): SessionState {
        if (!accountService.getProfile(userId)) {
            return state
        }

        const next = {
            ...state,
            selectedLoginUserId: userId,
            error: null,
        }
        persistSnapshot(next)
        return next
    },

    startLogin(state: SessionState): SessionState {
        return {
            ...state,
            isAuthenticating: true,
            error: null,
        }
    },

    failLogin(state: SessionState): SessionState {
        return {
            ...state,
            isAuthenticating: false,
            error: 'Invalid PIN for selected profile.',
        }
    },

    completeLogin(state: SessionState, userId: string): SessionState {
        const user = accountService.getProfile(userId)
        if (!user) {
            return this.failLogin(state)
        }

        setActiveUserId(user.id)

        const next = {
            ...state,
            activeUserId: user.id,
            selectedLoginUserId: user.id,
            isLocked: false,
            isAuthenticating: false,
            error: null,
            lastUnlockedAt: getKernelTime(),
        }

        persistSnapshot(next)
        return next
    },

    lock(state: SessionState): SessionState {
        const next = {
            ...state,
            isLocked: true,
            isAuthenticating: false,
            error: null,
        }
        persistSnapshot(next)
        return next
    },

    logout(state: SessionState): SessionState {
        const next = {
            ...state,
            activeUserId: null,
            isLocked: true,
            isAuthenticating: false,
            error: null,
        }
        persistSnapshot(next)
        return next
    },

    canAuthenticate(userId: string, pin: string) {
        return accountService.authenticate(userId, pin)
    },
}
