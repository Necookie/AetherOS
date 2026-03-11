import { accountService } from './accountService'
import type { SessionSnapshot } from '../types'

const SESSION_KEY = 'aether.session.v1'

const DEFAULT_SNAPSHOT: SessionSnapshot = {
    activeUserId: null,
    selectedLoginUserId: accountService.getDefaultLoginUserId(),
    isLocked: true,
}

function canUseStorage() {
    if (typeof window === 'undefined') {
        return false
    }

    try {
        return Boolean(window.localStorage)
    } catch {
        return false
    }
}

function normalize(raw: Partial<SessionSnapshot>): SessionSnapshot {
    const selectedUser = accountService.getProfile(raw.selectedLoginUserId ?? '')
    const activeUser = accountService.getProfile(raw.activeUserId ?? '')
    const hasActiveUser = Boolean(activeUser?.id)

    return {
        activeUserId: activeUser?.id ?? null,
        selectedLoginUserId: selectedUser?.id ?? activeUser?.id ?? accountService.getDefaultLoginUserId(),
        isLocked: hasActiveUser ? (raw.isLocked ?? true) : true,
    }
}

export const sessionStorage = {
    load(): SessionSnapshot {
        if (!canUseStorage()) {
            return { ...DEFAULT_SNAPSHOT }
        }

        const serialized = window.localStorage.getItem(SESSION_KEY)
        if (!serialized) {
            return { ...DEFAULT_SNAPSHOT }
        }

        try {
            const parsed = JSON.parse(serialized) as Partial<SessionSnapshot>
            return normalize(parsed)
        } catch {
            return { ...DEFAULT_SNAPSHOT }
        }
    },

    save(snapshot: SessionSnapshot) {
        if (!canUseStorage()) {
            return
        }

        try {
            window.localStorage.setItem(SESSION_KEY, JSON.stringify(snapshot))
        } catch {
            // Keep in-memory session alive when persistence fails.
        }
    },
}
