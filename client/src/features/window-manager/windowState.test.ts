import { describe, expect, it } from 'vitest'
import { getNextWindowInCycle } from './navigation'
import {
    applyWindowSnapState,
    createWindowSnapshot,
    focusWindowState,
    openWindowState,
    restoreWindowState,
    toggleMaximizeState,
    toggleMinimizeState,
    updateWindowBoundsState,
} from './windowState'
import type { SnapContext } from './types'

const viewport = { width: 1280, height: 720 }
const snapContext: SnapContext = {
    viewport,
    taskbarPosition: 'bottom',
    minWindowWidth: 320,
    minWindowHeight: 220,
    safeMargin: 8,
    shellTopbarHeight: 32,
    shellDockHeight: 56,
    shellEdgeGap: 12,
}
const Dummy = () => null

const terminalApp = {
    id: 'term',
    title: 'Terminal',
    component: Dummy,
    defaultBounds: { x: 10, y: 10, width: 640, height: 360 },
}

const browserApp = {
    id: 'browser',
    title: 'Browser',
    component: Dummy,
    defaultBounds: { x: 40, y: 40, width: 900, height: 620 },
}

describe('window manager lifecycle', () => {
    it('restores a minimized window and focuses it', () => {
        const opened = openWindowState(createWindowSnapshot(), terminalApp, viewport)
        const minimized = toggleMinimizeState(opened, terminalApp.id)
        const restored = restoreWindowState(minimized, terminalApp.id, viewport)

        expect(restored.focusedWindowId).toBe(terminalApp.id)
        expect(restored.windows[terminalApp.id].state.isMinimized).toBe(false)
        expect(restored.windows[terminalApp.id].state.isFocused).toBe(true)
    })

    it('maximizes then restores to prior bounds', () => {
        const opened = openWindowState(createWindowSnapshot(), browserApp, viewport)
        const maximized = toggleMaximizeState(opened, browserApp.id, viewport)
        const restored = restoreWindowState(maximized, browserApp.id, viewport)

        expect(maximized.windows[browserApp.id].state.isMaximized).toBe(true)
        expect(maximized.windows[browserApp.id].bounds).toEqual({ x: 0, y: 0, width: viewport.width, height: viewport.height })
        expect(restored.windows[browserApp.id].state.isMaximized).toBe(false)
        expect(restored.windows[browserApp.id].bounds).toEqual(opened.windows[browserApp.id].bounds)
    })

    it('clamps updated bounds to viewport limits', () => {
        const opened = openWindowState(createWindowSnapshot(), terminalApp, viewport)
        const resized = updateWindowBoundsState(opened, terminalApp.id, {
            x: -100,
            y: -100,
            width: 1600,
            height: 1000,
        }, viewport)

        expect(resized.windows[terminalApp.id].bounds).toEqual({
            x: 0,
            y: 0,
            width: viewport.width,
            height: viewport.height,
        })
    })

    it('applies snap bounds and restores to pre-snap bounds', () => {
        const opened = openWindowState(createWindowSnapshot(), browserApp, viewport)
        const snapped = applyWindowSnapState(opened, browserApp.id, 'right-half', snapContext)
        const restored = restoreWindowState(snapped, browserApp.id, viewport)

        expect(snapped.windows[browserApp.id].state.snapMode).toBe('right-half')
        expect(snapped.windows[browserApp.id].bounds).toEqual({
            x: 640,
            y: 40,
            width: 628,
            height: 592,
        })
        expect(restored.windows[browserApp.id].state.snapMode).toBeUndefined()
        expect(restored.windows[browserApp.id].bounds).toEqual(opened.windows[browserApp.id].bounds)
    })
})

describe('window manager navigation', () => {
    it('cycles through visible windows only', () => {
        const opened = openWindowState(
            openWindowState(createWindowSnapshot(), terminalApp, viewport),
            browserApp,
            viewport,
        )
        const focusedTerminal = focusWindowState(opened, terminalApp.id)
        const minimizedTerminal = toggleMinimizeState(focusedTerminal, terminalApp.id)
        const next = getNextWindowInCycle(
            minimizedTerminal.windows,
            minimizedTerminal.windowOrder,
            minimizedTerminal.focusedWindowId,
            1,
        )

        expect(next).toBe(browserApp.id)
    })
})
