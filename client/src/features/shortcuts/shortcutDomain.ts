const MODIFIER_ORDER = ['ctrl', 'alt', 'shift', 'meta'] as const
type Modifier = (typeof MODIFIER_ORDER)[number]

export interface ParsedShortcut {
    key: string
    modifiers: Modifier[]
}

export interface ShortcutConflict {
    combo: string
    actionIds: string[]
}

const MODIFIER_ALIASES: Record<string, Modifier> = {
    control: 'ctrl',
    ctrl: 'ctrl',
    alt: 'alt',
    option: 'alt',
    shift: 'shift',
    meta: 'meta',
    cmd: 'meta',
    command: 'meta',
}

const KEY_ALIASES: Record<string, string> = {
    esc: 'escape',
    return: 'enter',
    spacebar: 'space',
    ' ': 'space',
    '.': 'period',
    ',': 'comma',
    '[': 'bracketleft',
    ']': 'bracketright',
}

function normalizeKeyToken(token: string) {
    const trimmed = token.trim().toLowerCase()
    if (!trimmed) {
        return ''
    }

    return KEY_ALIASES[trimmed] ?? trimmed
}

function normalizeKeyFromEvent(event: KeyboardEvent) {
    const key = event.key.toLowerCase()
    return KEY_ALIASES[key] ?? key
}

function sortModifiers(modifiers: Modifier[]) {
    return [...modifiers].sort((left, right) => MODIFIER_ORDER.indexOf(left) - MODIFIER_ORDER.indexOf(right))
}

export function parseShortcut(combo: string): ParsedShortcut | null {
    if (typeof combo !== 'string' || combo.trim().length === 0) {
        return null
    }

    const tokens = combo
        .split('+')
        .map((token) => token.trim())
        .filter((token) => token.length > 0)

    if (tokens.length === 0) {
        return null
    }

    const modifiers = new Set<Modifier>()
    let key = ''

    for (const rawToken of tokens) {
        const token = rawToken.toLowerCase()
        const modifier = MODIFIER_ALIASES[token]
        if (modifier) {
            modifiers.add(modifier)
            continue
        }

        if (key) {
            return null
        }
        key = normalizeKeyToken(token)
    }

    if (!key) {
        return null
    }

    return {
        key,
        modifiers: sortModifiers([...modifiers]),
    }
}

export function normalizeShortcut(combo: string): string | null {
    const parsed = parseShortcut(combo)
    if (!parsed) {
        return null
    }

    return [...parsed.modifiers, parsed.key].join('+')
}

export function eventMatchesShortcut(event: KeyboardEvent, combo: string) {
    const parsed = parseShortcut(combo)
    if (!parsed) {
        return false
    }

    const activeModifiers: Modifier[] = []
    if (event.ctrlKey) {
        activeModifiers.push('ctrl')
    }
    if (event.altKey) {
        activeModifiers.push('alt')
    }
    if (event.shiftKey) {
        activeModifiers.push('shift')
    }
    if (event.metaKey) {
        activeModifiers.push('meta')
    }

    const normalizedModifiers = sortModifiers(activeModifiers)
    if (normalizedModifiers.length !== parsed.modifiers.length) {
        return false
    }

    for (let index = 0; index < normalizedModifiers.length; index += 1) {
        if (normalizedModifiers[index] !== parsed.modifiers[index]) {
            return false
        }
    }

    return normalizeKeyFromEvent(event) === parsed.key
}

export function detectShortcutConflicts(actionMap: Record<string, string>) {
    const byCombo = new Map<string, string[]>()

    Object.entries(actionMap).forEach(([actionId, combo]) => {
        const normalized = normalizeShortcut(combo)
        if (!normalized) {
            return
        }
        const existing = byCombo.get(normalized) ?? []
        byCombo.set(normalized, [...existing, actionId])
    })

    const conflicts: ShortcutConflict[] = []
    byCombo.forEach((actionIds, combo) => {
        if (actionIds.length > 1) {
            conflicts.push({ combo, actionIds })
        }
    })
    return conflicts
}

export function isEditableTarget(target: EventTarget | null) {
    if (typeof HTMLElement === 'undefined' || !(target instanceof HTMLElement)) {
        return false
    }

    return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}
