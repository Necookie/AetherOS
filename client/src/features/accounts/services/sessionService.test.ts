import { describe, expect, it } from 'vitest'
import { sessionService } from './sessionService'

describe('session service', () => {
    it('supports account switching through lock screen flow', () => {
        let state = sessionService.createInitialState({
            activeUserId: null,
            selectedLoginUserId: 'admin',
            isLocked: true,
        })

        state = sessionService.selectLoginUser(state, 'alex')
        state = sessionService.completeLogin(state, 'alex')

        expect(state.activeUserId).toBe('alex')
        expect(state.isLocked).toBe(false)

        state = sessionService.lock(state)
        state = sessionService.selectLoginUser(state, 'guest')
        state = sessionService.completeLogin(state, 'guest')

        expect(state.activeUserId).toBe('guest')
        expect(state.selectedLoginUserId).toBe('guest')
        expect(state.isLocked).toBe(false)
    })

    it('returns a login error when authentication fails', () => {
        const base = sessionService.createInitialState({
            activeUserId: null,
            selectedLoginUserId: 'admin',
            isLocked: true,
        })

        const next = sessionService.failLogin(base)
        expect(next.error).toContain('Invalid PIN')
        expect(next.isAuthenticating).toBe(false)
    })
})
