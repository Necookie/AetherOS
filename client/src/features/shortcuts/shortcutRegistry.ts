import { eventMatchesShortcut, isEditableTarget } from './shortcutDomain'

export interface ShortcutBinding {
    actionId: string
    combo: string
    allowInEditable?: boolean
    isEnabled?: () => boolean
    handler: (event: KeyboardEvent) => void
}

export function createShortcutKeydownHandler(bindings: ShortcutBinding[]) {
    return (event: KeyboardEvent) => {
        for (const binding of bindings) {
            if (binding.isEnabled && !binding.isEnabled()) {
                continue
            }

            if (!binding.allowInEditable && isEditableTarget(event.target)) {
                continue
            }

            if (!eventMatchesShortcut(event, binding.combo)) {
                continue
            }

            event.preventDefault()
            binding.handler(event)
            return
        }
    }
}

