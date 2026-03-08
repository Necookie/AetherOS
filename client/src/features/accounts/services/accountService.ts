import type { AccountProfile } from '../types'

const ACCOUNT_INDEX = new Map<string, { profile: AccountProfile, pin: string }>([
    ['admin', {
        profile: { id: 'admin', displayName: 'Administrator', role: 'admin', pinHint: '0420' },
        pin: '0420',
    }],
    ['alex', {
        profile: { id: 'alex', displayName: 'Alex Rivera', role: 'member', pinHint: '2401' },
        pin: '2401',
    }],
    ['guest', {
        profile: { id: 'guest', displayName: 'Guest Session', role: 'guest', pinHint: '0000' },
        pin: '0000',
    }],
])

function toPublicProfile(entry: { profile: AccountProfile }) {
    return { ...entry.profile }
}

export const accountService = {
    listProfiles(): AccountProfile[] {
        return [...ACCOUNT_INDEX.values()]
            .map(toPublicProfile)
    },

    getProfile(userId: string): AccountProfile | null {
        const account = ACCOUNT_INDEX.get(userId)
        return account ? toPublicProfile(account) : null
    },

    getDefaultLoginUserId() {
        return 'admin'
    },

    authenticate(userId: string, pin: string) {
        const account = ACCOUNT_INDEX.get(userId)
        if (!account) {
            return false
        }

        return account.pin === pin
    },
}
