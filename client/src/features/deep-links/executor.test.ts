import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_APPS } from '../../config/windows'
import { setActiveUserId } from '../accounts/services/userScope'
import { executeNotificationDeepLink } from './executor'
import { useDeepLinkIntentStore } from './store'
import { useSessionStore } from '../../stores/useSessionStore'
import { useWindowStore } from '../../stores/windowStore'
import { productivityRepository } from '../productivity'
import { PRODUCTIVITY_ROOT_PATH } from '../productivity/paths'
import { fsService } from '../../vfs/vfsService'
import { VfsNodeType } from '../../vfs/types'

describe('notification deep-link executor', () => {
    beforeEach(() => {
        vi.stubGlobal('window', {
            innerWidth: 1440,
            innerHeight: 900,
            setTimeout,
            clearTimeout,
        })
        setActiveUserId('admin')
        useSessionStore.setState((state) => ({
            ...state,
            activeUserId: 'admin',
            selectedLoginUserId: 'admin',
            isLocked: false,
            error: null,
            isAuthenticating: false,
        }))
        fsService.resetToDefaults()
        fsService.createNode('/home/user/Documents', 'Productivity', VfsNodeType.DIR)
        fsService.createNode(PRODUCTIVITY_ROOT_PATH, '.drafts', VfsNodeType.DIR)
        fsService.createNode(PRODUCTIVITY_ROOT_PATH, '.conflicts', VfsNodeType.DIR)
        fsService.createNode(PRODUCTIVITY_ROOT_PATH, 'notes', VfsNodeType.DIR)
        fsService.createNode(PRODUCTIVITY_ROOT_PATH, 'docs', VfsNodeType.DIR)
        fsService.createNode(PRODUCTIVITY_ROOT_PATH, 'boards', VfsNodeType.DIR)
        fsService.createNode(`${PRODUCTIVITY_ROOT_PATH}/.drafts`, 'notes', VfsNodeType.DIR)
        fsService.createNode(`${PRODUCTIVITY_ROOT_PATH}/.drafts`, 'docs', VfsNodeType.DIR)
        fsService.createNode(`${PRODUCTIVITY_ROOT_PATH}/.drafts`, 'boards', VfsNodeType.DIR)
        fsService.createNode(`${PRODUCTIVITY_ROOT_PATH}/.conflicts`, 'notes', VfsNodeType.DIR)
        fsService.createNode(`${PRODUCTIVITY_ROOT_PATH}/.conflicts`, 'docs', VfsNodeType.DIR)
        fsService.createNode(`${PRODUCTIVITY_ROOT_PATH}/.conflicts`, 'boards', VfsNodeType.DIR)
        useWindowStore.getState().resetWindows()
        useDeepLinkIntentStore.setState({
            productivity: {},
            settings: null,
            taskManager: null,
        })
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it('restores an existing minimized window and dispatches the target productivity record intent', () => {
        const note = productivityRepository.createRecord({
            appId: 'notes',
            title: 'Incident log',
            body: 'Track the alert here.',
        })
        const noteApp = DEFAULT_APPS.find((app) => app.id === 'notes')
        expect(noteApp).toBeTruthy()
        if (!noteApp) {
            return
        }

        useWindowStore.getState().openWindow(noteApp)
        useWindowStore.setState((state) => ({
            ...state,
            focusedWindowId: null,
            windows: {
                ...state.windows,
                notes: {
                    ...state.windows.notes,
                    state: {
                        ...state.windows.notes.state,
                        isFocused: false,
                        isMinimized: true,
                    },
                },
            },
        }))

        const published: Array<{ title: string; message: string }> = []
        const handled = executeNotificationDeepLink({
            kind: 'productivity-record',
            appId: 'notes',
            recordId: note.id,
            panel: 'editor',
        }, (notification) => {
            published.push({ title: notification.title, message: notification.message })
            return notification.id ?? 'published'
        })

        expect(handled).toBe(true)
        expect(published).toEqual([])
        expect(useWindowStore.getState().windows.notes.state.isMinimized).toBe(false)
        expect(useWindowStore.getState().focusedWindowId).toBe('notes')
        expect(useDeepLinkIntentStore.getState().productivity.notes?.payload.recordId).toBe(note.id)
    })

    it('publishes a graceful fallback when the target record no longer exists', () => {
        const published: Array<{ title: string; message: string }> = []

        const handled = executeNotificationDeepLink({
            kind: 'productivity-record',
            appId: 'docs',
            recordId: 'missing-record',
            panel: 'editor',
        }, (notification) => {
            published.push({ title: notification.title, message: notification.message })
            return notification.id ?? 'published'
        })

        expect(handled).toBe(false)
        expect(published).toEqual([
            {
                title: 'Record unavailable',
                message: 'That note, document, or board no longer exists.',
            },
        ])
    })
})
