import { create } from 'zustand'
import { sessionService, type SessionState } from '../features/accounts/services/sessionService'

interface SessionActions {
    selectLoginUser: (userId: string) => void
    loginWithPin: (pin: string) => Promise<void>
    lockSession: () => void
    logout: () => void
}

export type SessionStore = SessionState & SessionActions

const LOGIN_DELAY_MS = 800

export const useSessionStore = create<SessionStore>((set, get) => ({
    ...sessionService.createInitialState(),
    selectLoginUser: (userId) => set((state) => sessionService.selectLoginUser(state, userId)),
    loginWithPin: async (pin) => {
        set((state) => sessionService.startLogin(state))

        await new Promise((resolve) => {
            setTimeout(resolve, LOGIN_DELAY_MS)
        })

        const { selectedLoginUserId } = get()
        if (!sessionService.canAuthenticate(selectedLoginUserId, pin)) {
            set((state) => sessionService.failLogin(state))
            return
        }

        set((state) => sessionService.completeLogin(state, selectedLoginUserId))
    },
    lockSession: () => set((state) => sessionService.lock(state)),
    logout: () => set((state) => sessionService.logout(state)),
}))
