import { describe, expect, it } from 'vitest'
import { createWindowSnapshot, openWindowState } from './windowState'
import { selectWindowById, selectWindowComponentById, selectWindowOrder } from './selectors'

const viewport = { width: 1280, height: 720 }
const Dummy = () => null

const terminalApp = {
    id: 'term',
    title: 'Terminal',
    component: Dummy,
    defaultBounds: { x: 30, y: 30, width: 600, height: 400 },
}

describe('window selectors', () => {
    it('selects a window by id', () => {
        const state = openWindowState(createWindowSnapshot(), terminalApp, viewport)
        const selected = selectWindowById('term')({
            ...state,
            snapPreview: null,
            lastGuardError: null,
            openWindow: () => undefined,
            closeWindow: () => undefined,
            closeWindowImmediate: () => undefined,
            focusWindow: () => undefined,
            toggleMinimize: () => undefined,
            toggleMaximize: () => undefined,
            snapWindow: () => undefined,
            restoreWindow: () => undefined,
            updateBounds: () => undefined,
            setSnapPreview: () => undefined,
            clearSnapPreview: () => undefined,
            cycleFocus: () => undefined,
            getZIndex: () => 0,
            resetWindows: () => undefined,
        })

        expect(selected?.id).toBe('term')
    })

    it('selects window order and component', () => {
        const state = openWindowState(createWindowSnapshot(), terminalApp, viewport)
        const storeLike = {
            ...state,
            snapPreview: null,
            lastGuardError: null,
            openWindow: () => undefined,
            closeWindow: () => undefined,
            closeWindowImmediate: () => undefined,
            focusWindow: () => undefined,
            toggleMinimize: () => undefined,
            toggleMaximize: () => undefined,
            snapWindow: () => undefined,
            restoreWindow: () => undefined,
            updateBounds: () => undefined,
            setSnapPreview: () => undefined,
            clearSnapPreview: () => undefined,
            cycleFocus: () => undefined,
            getZIndex: () => 1,
            resetWindows: () => undefined,
        }

        expect(selectWindowOrder(storeLike)).toEqual(['term'])
        expect(selectWindowComponentById('term')(storeLike)).toBe(Dummy)
    })
})
