import { useEffect } from 'react'
import { useWindowStore } from '../../stores/windowStore'
import { DEFAULT_APPS } from '../../config/windows'
import { useSettingsStore } from '../../stores/settingsStore'
import { detectShortcutConflicts } from '../shortcuts/shortcutDomain'
import { dispatchLauncherToggleShortcut } from '../shortcuts/shortcutEvents'
import {
    resolveShortcutKeymap,
    SHORTCUT_ACTION_IDS,
} from '../shortcuts/shortcutConfig'
import { createShortcutKeydownHandler } from '../shortcuts/shortcutRegistry'

const APP_BY_ID = new Map(DEFAULT_APPS.map((app) => [app.id, app]))

export function useWindowShortcuts() {
    const overrides = useSettingsStore((state) => state.shortcuts.overrides)

    useEffect(() => {
        const keymap = resolveShortcutKeymap(overrides)
        const conflicts = detectShortcutConflicts(keymap)
        if (conflicts.length > 0) {
            // Conflicts should be blocked in settings validation; this guards against stale invalid persisted state.
            console.warn('Shortcut conflicts detected', conflicts)
        }

        const onKeyDown = createShortcutKeydownHandler([
            {
                actionId: SHORTCUT_ACTION_IDS.launcherToggle,
                combo: keymap[SHORTCUT_ACTION_IDS.launcherToggle],
                handler: () => {
                    dispatchLauncherToggleShortcut()
                },
            },
            {
                actionId: SHORTCUT_ACTION_IDS.appSwitcherNext,
                combo: keymap[SHORTCUT_ACTION_IDS.appSwitcherNext],
                handler: () => {
                    useWindowStore.getState().cycleFocus(1)
                },
            },
            {
                actionId: SHORTCUT_ACTION_IDS.appSwitcherPrevious,
                combo: keymap[SHORTCUT_ACTION_IDS.appSwitcherPrevious],
                handler: () => {
                    useWindowStore.getState().cycleFocus(-1)
                },
            },
            {
                actionId: SHORTCUT_ACTION_IDS.openTaskManager,
                combo: keymap[SHORTCUT_ACTION_IDS.openTaskManager],
                handler: () => {
                    const app = APP_BY_ID.get('taskmgr')
                    if (!app) {
                        return
                    }

                    const state = useWindowStore.getState()
                    if (state.windows.taskmgr) {
                        state.restoreWindow('taskmgr')
                        return
                    }
                    state.openWindow(app)
                },
            },
            {
                actionId: SHORTCUT_ACTION_IDS.openTerminal,
                combo: keymap[SHORTCUT_ACTION_IDS.openTerminal],
                handler: () => {
                    const app = APP_BY_ID.get('term')
                    if (!app) {
                        return
                    }

                    const state = useWindowStore.getState()
                    if (state.windows.term) {
                        state.restoreWindow('term')
                        return
                    }
                    state.openWindow(app)
                },
            },
            {
                actionId: SHORTCUT_ACTION_IDS.closeFocusedWindow,
                combo: keymap[SHORTCUT_ACTION_IDS.closeFocusedWindow],
                handler: () => {
                    const { focusedWindowId, closeWindow } = useWindowStore.getState()
                    if (focusedWindowId) {
                        closeWindow(focusedWindowId)
                    }
                },
            },
            {
                actionId: SHORTCUT_ACTION_IDS.minimizeFocusedWindow,
                combo: keymap[SHORTCUT_ACTION_IDS.minimizeFocusedWindow],
                handler: () => {
                    const { focusedWindowId, toggleMinimize } = useWindowStore.getState()
                    if (focusedWindowId) {
                        toggleMinimize(focusedWindowId)
                    }
                },
            },
            {
                actionId: SHORTCUT_ACTION_IDS.maximizeFocusedWindow,
                combo: keymap[SHORTCUT_ACTION_IDS.maximizeFocusedWindow],
                handler: () => {
                    const { focusedWindowId, toggleMaximize } = useWindowStore.getState()
                    if (focusedWindowId) {
                        toggleMaximize(focusedWindowId)
                    }
                },
            },
            {
                actionId: 'window.restore-focused',
                combo: 'Ctrl+Alt+R',
                handler: () => {
                    const { focusedWindowId, restoreWindow } = useWindowStore.getState()
                    if (focusedWindowId) {
                        restoreWindow(focusedWindowId)
                    }
                },
            }
        ])

        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [overrides])
}
