import { describe, expect, it, vi } from 'vitest'
import {
    detectShortcutConflicts,
    eventMatchesShortcut,
    isEditableTarget,
    normalizeShortcut,
    parseShortcut,
} from './shortcutDomain'
import { createShortcutKeydownHandler } from './shortcutRegistry'

function createKeyboardEvent(
    key: string,
    options: Partial<KeyboardEvent> = {},
): KeyboardEvent {
    return {
        key,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: false,
        preventDefault: () => undefined,
        ...options,
    } as KeyboardEvent
}

describe('shortcutDomain', () => {
    it('parses and normalizes shortcut combos', () => {
        expect(parseShortcut('Ctrl + Alt + K')).toEqual({
            key: 'k',
            modifiers: ['ctrl', 'alt'],
        })
        expect(normalizeShortcut('Shift + .')).toBe('shift+period')
        expect(normalizeShortcut('Ctrl+Alt')).toBeNull()
    })

    it('matches keyboard events against shortcut combos', () => {
        const event = createKeyboardEvent('k', { ctrlKey: true, altKey: true })
        expect(eventMatchesShortcut(event, 'Ctrl+Alt+K')).toBe(true)
        expect(eventMatchesShortcut(event, 'Ctrl+K')).toBe(false)
    })

    it('detects keymap conflicts', () => {
        const conflicts = detectShortcutConflicts({
            a: 'Ctrl+Alt+K',
            b: 'Ctrl+Alt+K',
            c: 'Ctrl+Alt+T',
        })

        expect(conflicts).toHaveLength(1)
        expect(conflicts[0]?.combo).toBe('ctrl+alt+k')
        expect(conflicts[0]?.actionIds).toEqual(['a', 'b'])
    })

    it('detects editable targets for suppression logic', () => {
        const originalHTMLElement = (globalThis as { HTMLElement?: unknown }).HTMLElement
        class FakeElement {
            public tagName: string
            public isContentEditable: boolean

            public constructor(tagName: string, isContentEditable = false) {
                this.tagName = tagName
                this.isContentEditable = isContentEditable
            }
        }

        Object.defineProperty(globalThis, 'HTMLElement', {
            value: FakeElement,
            configurable: true,
        })

        const input = new FakeElement('INPUT')
        const paragraph = new FakeElement('P', true)
        const div = new FakeElement('DIV')

        expect(isEditableTarget(input as unknown as EventTarget)).toBe(true)
        expect(isEditableTarget(paragraph as unknown as EventTarget)).toBe(true)
        expect(isEditableTarget(div as unknown as EventTarget)).toBe(false)

        Object.defineProperty(globalThis, 'HTMLElement', {
            value: originalHTMLElement,
            configurable: true,
        })
    })
})

describe('shortcutRegistry', () => {
    it('suppresses shortcuts while typing unless explicitly allowed', () => {
        const onTrigger = vi.fn()
        const onEditableTrigger = vi.fn()
        const handler = createShortcutKeydownHandler([
            {
                actionId: 'blocked-in-input',
                combo: 'Ctrl+Alt+K',
                handler: onTrigger,
            },
            {
                actionId: 'allowed-in-input',
                combo: 'Ctrl+Alt+M',
                allowInEditable: true,
                handler: onEditableTrigger,
            },
        ])

        const originalHTMLElement = (globalThis as { HTMLElement?: unknown }).HTMLElement
        class FakeElement {
            public tagName = 'INPUT'
            public isContentEditable = false
        }
        Object.defineProperty(globalThis, 'HTMLElement', {
            value: FakeElement,
            configurable: true,
        })
        const input = new FakeElement()

        const blockedEvent = createKeyboardEvent('k', { ctrlKey: true, altKey: true })
        Object.defineProperty(blockedEvent, 'target', { value: input })
        handler(blockedEvent)

        const allowedEvent = createKeyboardEvent('m', { ctrlKey: true, altKey: true })
        Object.defineProperty(allowedEvent, 'target', { value: input })
        handler(allowedEvent)

        expect(onTrigger).not.toHaveBeenCalled()
        expect(onEditableTrigger).toHaveBeenCalledTimes(1)

        Object.defineProperty(globalThis, 'HTMLElement', {
            value: originalHTMLElement,
            configurable: true,
        })
    })
})
