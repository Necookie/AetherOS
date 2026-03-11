import { describe, expect, it, vi } from 'vitest'
import {
    executeCommandPaletteAction,
    getCommandPaletteResults,
    getNextCommandPaletteIndex,
} from './commandPalette'

describe('command palette model', () => {
    it('ranks strong fuzzy matches ahead of weaker substring candidates', () => {
        const results = getCommandPaletteResults('tm', {
            taskmgr: { state: { isMinimized: true } },
        })

        expect(results[0]?.id).toBe('taskmgr')
        expect(results[0]?.titleHighlights).toEqual([0, 5])
    })

    it('returns command entries alongside apps for actionable shell navigation', () => {
        const results = getCommandPaletteResults('download', {})

        expect(results.map((item) => item.id)).toContain('downloads')
        expect(results.map((item) => item.id)).toContain('command-downloads-open')
        expect(results.find((item) => item.id === 'command-downloads-open')?.kind).toBe('command')
    })

    it('surfaces productivity quick-create templates through launcher search', () => {
        const results = getCommandPaletteResults('lecture', {})

        expect(results[0]?.id).toBe('command-template-notes-lecture-notes')
        expect(results[0]?.action).toEqual({
            kind: 'productivity-template',
            appId: 'notes',
            templateId: 'lecture-notes',
        })
    })

    it('wraps keyboard navigation across the result set', () => {
        expect(getNextCommandPaletteIndex(-1, 1, 4)).toBe(0)
        expect(getNextCommandPaletteIndex(0, -1, 4)).toBe(3)
        expect(getNextCommandPaletteIndex(3, 1, 4)).toBe(0)
        expect(getNextCommandPaletteIndex(0, 1, 0)).toBe(-1)
    })

    it('executes app, deep-link, and session actions through the executor', () => {
        const launchApp = vi.fn()
        const openDeepLink = vi.fn(() => true)
        const lockSession = vi.fn()
        const quickCreateProductivity = vi.fn()

        expect(executeCommandPaletteAction({ kind: 'app', appId: 'notes' }, { launchApp, openDeepLink, lockSession, quickCreateProductivity })).toBe(true)
        expect(executeCommandPaletteAction({
            kind: 'deep-link',
            link: { kind: 'downloads' },
        }, { launchApp, openDeepLink, lockSession, quickCreateProductivity })).toBe(true)
        expect(executeCommandPaletteAction({
            kind: 'productivity-template',
            appId: 'docs',
            templateId: 'project-brief',
        }, { launchApp, openDeepLink, lockSession, quickCreateProductivity })).toBe(true)
        expect(executeCommandPaletteAction({ kind: 'lock-session' }, { launchApp, openDeepLink, lockSession, quickCreateProductivity })).toBe(true)

        expect(launchApp).toHaveBeenCalledWith('notes')
        expect(openDeepLink).toHaveBeenCalledWith({ kind: 'downloads' })
        expect(quickCreateProductivity).toHaveBeenCalledWith('docs', 'project-brief')
        expect(lockSession).toHaveBeenCalledTimes(1)
    })
})
