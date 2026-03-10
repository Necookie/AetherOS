import { describe, expect, it } from 'vitest'
import { checkAppLaunchAccess, checkFileMutationAccess, checkFilePathAccess, checkSettingsAccess } from './guards'

describe('permission guards', () => {
    it('enforces role-based app launch access', () => {
        const guestSettings = checkAppLaunchAccess('guest', 'settings')
        expect(guestSettings.allowed).toBe(false)
        expect(guestSettings.needsPrompt).toBe(false)

        const memberSettings = checkAppLaunchAccess('member', 'settings')
        expect(memberSettings.allowed).toBe(false)
        expect(memberSettings.needsPrompt).toBe(true)
        expect(memberSettings.permission).toBe('app.launch.settings')
        expect(memberSettings.recovery).toContain('Permission Center')
    })

    it('gates sensitive file actions and protected paths', () => {
        const guestDelete = checkFileMutationAccess('guest', 'delete', '/home/user/Documents/a.txt')
        expect(guestDelete.allowed).toBe(false)

        const memberDelete = checkFileMutationAccess('member', 'delete', '/home/user/Documents/a.txt')
        expect(memberDelete.needsPrompt).toBe(true)
        expect(memberDelete.permission).toBe('files.delete')
        expect(memberDelete.recovery).toContain('Permission Center')

        const guestSystemPath = checkFilePathAccess('guest', '/etc')
        expect(guestSystemPath.allowed).toBe(false)
        expect(guestSystemPath.recovery).toContain('Switch')
    })

    it('blocks unauthorized settings mutations', () => {
        const guest = checkSettingsAccess('guest')
        expect(guest.allowed).toBe(false)
        expect(guest.needsPrompt).toBe(false)

        const member = checkSettingsAccess('member')
        expect(member.allowed).toBe(false)
        expect(member.needsPrompt).toBe(true)
        expect(member.permission).toBe('settings.modify')
        expect(member.recovery).toContain('Permission Center')
    })
})
