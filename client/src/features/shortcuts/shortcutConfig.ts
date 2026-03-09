import { detectShortcutConflicts, normalizeShortcut, type ShortcutConflict } from './shortcutDomain'

export const SHORTCUT_ACTION_IDS = {
    launcherToggle: 'launcher.toggle',
    appSwitcherNext: 'app-switcher.next',
    appSwitcherPrevious: 'app-switcher.previous',
    openTaskManager: 'window.open-task-manager',
    openTerminal: 'window.open-terminal',
    closeFocusedWindow: 'window.close-focused',
    minimizeFocusedWindow: 'window.minimize-focused',
    maximizeFocusedWindow: 'window.maximize-focused',
} as const

export type ShortcutActionId = (typeof SHORTCUT_ACTION_IDS)[keyof typeof SHORTCUT_ACTION_IDS]
export type RemappableShortcutActionId =
    | typeof SHORTCUT_ACTION_IDS.launcherToggle
    | typeof SHORTCUT_ACTION_IDS.openTaskManager
    | typeof SHORTCUT_ACTION_IDS.openTerminal
    | typeof SHORTCUT_ACTION_IDS.closeFocusedWindow
    | typeof SHORTCUT_ACTION_IDS.minimizeFocusedWindow
    | typeof SHORTCUT_ACTION_IDS.maximizeFocusedWindow

export const REMAPPABLE_SHORTCUTS: RemappableShortcutActionId[] = [
    SHORTCUT_ACTION_IDS.launcherToggle,
    SHORTCUT_ACTION_IDS.openTaskManager,
    SHORTCUT_ACTION_IDS.openTerminal,
    SHORTCUT_ACTION_IDS.closeFocusedWindow,
    SHORTCUT_ACTION_IDS.minimizeFocusedWindow,
    SHORTCUT_ACTION_IDS.maximizeFocusedWindow,
]

export const DEFAULT_SHORTCUT_KEYMAP: Record<ShortcutActionId, string> = {
    [SHORTCUT_ACTION_IDS.launcherToggle]: 'Ctrl+Alt+K',
    [SHORTCUT_ACTION_IDS.appSwitcherNext]: 'Ctrl+Alt+BracketRight',
    [SHORTCUT_ACTION_IDS.appSwitcherPrevious]: 'Ctrl+Alt+BracketLeft',
    [SHORTCUT_ACTION_IDS.openTaskManager]: 'Ctrl+Alt+M',
    [SHORTCUT_ACTION_IDS.openTerminal]: 'Ctrl+Alt+T',
    [SHORTCUT_ACTION_IDS.closeFocusedWindow]: 'Ctrl+Alt+W',
    [SHORTCUT_ACTION_IDS.minimizeFocusedWindow]: 'Ctrl+Alt+N',
    [SHORTCUT_ACTION_IDS.maximizeFocusedWindow]: 'Ctrl+Alt+X',
}

export type ShortcutOverrides = Partial<Record<RemappableShortcutActionId, string>>

export interface ShortcutValidationResult {
    isValid: boolean
    normalizedOverrides: ShortcutOverrides
    conflicts: ShortcutConflict[]
    invalidActionIds: RemappableShortcutActionId[]
}

export function resolveShortcutKeymap(overrides: ShortcutOverrides | undefined): Record<ShortcutActionId, string> {
    if (!overrides) {
        return { ...DEFAULT_SHORTCUT_KEYMAP }
    }

    const resolved: Record<ShortcutActionId, string> = { ...DEFAULT_SHORTCUT_KEYMAP }
    REMAPPABLE_SHORTCUTS.forEach((actionId) => {
        const combo = overrides[actionId]
        if (!combo) {
            return
        }

        const normalized = normalizeShortcut(combo)
        if (normalized) {
            resolved[actionId] = normalized
        }
    })

    return resolved
}

export function validateShortcutOverrides(overrides: ShortcutOverrides | undefined): ShortcutValidationResult {
    if (!overrides) {
        return {
            isValid: true,
            normalizedOverrides: {},
            conflicts: [],
            invalidActionIds: [],
        }
    }

    const normalizedOverrides: ShortcutOverrides = {}
    const invalidActionIds: RemappableShortcutActionId[] = []

    REMAPPABLE_SHORTCUTS.forEach((actionId) => {
        const combo = overrides[actionId]
        if (!combo) {
            return
        }

        const normalized = normalizeShortcut(combo)
        if (!normalized) {
            invalidActionIds.push(actionId)
            return
        }

        normalizedOverrides[actionId] = normalized
    })

    const conflicts = detectShortcutConflicts(resolveShortcutKeymap(normalizedOverrides))
    return {
        isValid: invalidActionIds.length === 0 && conflicts.length === 0,
        normalizedOverrides,
        conflicts,
        invalidActionIds,
    }
}

