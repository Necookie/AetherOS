import { describe, expect, it } from 'vitest'
import {
    getLauncherEmptyMessage,
    getLauncherItems,
    getLauncherStatusLabel,
    resolveLauncherStatus,
} from './launcher'

describe('launcher model', () => {
    it('resolves launcher status across running states', () => {
        expect(resolveLauncherStatus(undefined)).toBe('not-running')
        expect(resolveLauncherStatus({ state: { isMinimized: true } })).toBe('minimized')
        expect(resolveLauncherStatus({ state: { isMinimized: false } })).toBe('running')
    })

    it('maps status to user-facing labels', () => {
        expect(getLauncherStatusLabel('running')).toBe('Running')
        expect(getLauncherStatusLabel('minimized')).toBe('Minimized')
        expect(getLauncherStatusLabel('not-running')).toBe('Not running')
    })

    it('builds launcher items from filtered apps and window status', () => {
        const items = getLauncherItems('task', {
            taskmgr: { state: { isMinimized: true } },
        })

        expect(items).toEqual([
            {
                id: 'taskmgr',
                title: 'Task Manager',
                status: 'minimized',
            },
        ])
    })

    it('returns contextual empty-state copy', () => {
        expect(getLauncherEmptyMessage('')).toBe('No apps are available in this profile.')
        expect(getLauncherEmptyMessage('notes')).toBe('No apps match "notes".')
    })
})
