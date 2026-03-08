import { useEffect } from 'react'
import { useWindowStore } from '../../stores/windowStore'
import { APP_MANIFEST } from '../../config/appManifest'
import { DEFAULT_APPS } from '../../config/windows'
import { getWindowAtPosition } from './navigation'

function isEditableTarget(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) {
        return false
    }

    return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

const APP_BY_ID = new Map(DEFAULT_APPS.map((app) => [app.id, app]))
const APP_ORDER = APP_MANIFEST.map((app) => app.id)

export function useWindowShortcuts() {
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (isEditableTarget(event.target)) {
                return
            }

            const store = useWindowStore.getState()
            const focusedId = store.focusedWindowId

            if (event.altKey && event.key === 'Tab') {
                event.preventDefault()
                store.cycleFocus(event.shiftKey ? -1 : 1)
                return
            }

            if (event.ctrlKey && event.key === 'F6') {
                event.preventDefault()
                store.cycleFocus(event.shiftKey ? -1 : 1)
                return
            }

            const position = Number(event.key)
            if (event.metaKey && Number.isInteger(position) && position >= 1 && position <= 9) {
                event.preventDefault()
                const appId = APP_ORDER[position - 1]
                if (!appId) {
                    return
                }

                const app = APP_BY_ID.get(appId)
                if (!app) {
                    return
                }

                if (store.windows[appId]) {
                    store.restoreWindow(appId)
                } else {
                    store.openWindow(app)
                }
                return
            }

            if (event.ctrlKey && !event.shiftKey && event.key.toLowerCase() === 'w' && focusedId) {
                event.preventDefault()
                store.closeWindow(focusedId)
                return
            }

            if (event.ctrlKey && !event.shiftKey && event.key.toLowerCase() === 'm' && focusedId) {
                event.preventDefault()
                store.toggleMinimize(focusedId)
                return
            }

            if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'm' && focusedId) {
                event.preventDefault()
                store.toggleMaximize(focusedId)
                return
            }

            if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'r' && focusedId) {
                event.preventDefault()
                store.restoreWindow(focusedId)
                return
            }

            if (event.altKey && !event.ctrlKey && !event.metaKey && Number.isInteger(position) && position >= 1 && position <= 9) {
                event.preventDefault()
                const targetId = getWindowAtPosition(store.windowOrder, position)
                if (targetId) {
                    store.restoreWindow(targetId)
                }
            }
        }

        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [])
}
