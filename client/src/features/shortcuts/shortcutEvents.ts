export const SHORTCUT_EVENT_LAUNCHER_TOGGLE = 'aether:shortcut-launcher-toggle'

export function dispatchLauncherToggleShortcut() {
    window.dispatchEvent(new CustomEvent(SHORTCUT_EVENT_LAUNCHER_TOGGLE))
}

