import { useSyncExternalStore } from 'react'
import { getScopedStorageKey, onActiveUserChange } from '../accounts/services/userScope'
import type { ClipboardFileEntry, ClipboardPayload, ClipboardService, ClipboardSnapshot } from './types'

const PERSIST_KEY = 'aether.clipboard.snapshot.v1'

function isClipboardFileEntry(value: unknown): value is ClipboardFileEntry {
    if (!value || typeof value !== 'object') {
        return false
    }

    const candidate = value as Partial<ClipboardFileEntry>
    return typeof candidate.nodeId === 'string'
        && typeof candidate.path === 'string'
        && typeof candidate.name === 'string'
        && typeof candidate.type === 'string'
}

function sanitizePayload(value: unknown): ClipboardPayload | null {
    if (!value || typeof value !== 'object') {
        return null
    }

    const candidate = value as Partial<ClipboardPayload>
    if (candidate.kind === 'text' && typeof candidate.text === 'string') {
        return {
            kind: 'text',
            text: candidate.text,
            sourceAppId: typeof candidate.sourceAppId === 'string' ? candidate.sourceAppId : undefined,
        }
    }

    if (candidate.kind === 'files' && (candidate.operation === 'copy' || candidate.operation === 'cut') && Array.isArray(candidate.entries)) {
        const entries = candidate.entries.filter(isClipboardFileEntry)
        if (entries.length === 0) {
            return null
        }

        return {
            kind: 'files',
            operation: candidate.operation,
            entries,
            sourceAppId: typeof candidate.sourceAppId === 'string' ? candidate.sourceAppId : undefined,
        }
    }

    return null
}

function loadPersistedSnapshot(): ClipboardSnapshot {
    if (typeof window === 'undefined' || !window.localStorage) {
        return { payload: null, revision: 0, updatedAt: null }
    }

    const serialized = window.localStorage.getItem(getScopedStorageKey(PERSIST_KEY))
    if (!serialized) {
        return { payload: null, revision: 0, updatedAt: null }
    }

    try {
        const parsed = JSON.parse(serialized) as Partial<ClipboardSnapshot>
        return {
            payload: sanitizePayload(parsed.payload),
            revision: typeof parsed.revision === 'number' ? parsed.revision : 0,
            updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : null,
        }
    } catch {
        return { payload: null, revision: 0, updatedAt: null }
    }
}

function createClipboardService(): ClipboardService {
    let state = loadPersistedSnapshot()
    const listeners = new Set<() => void>()

    const emit = () => {
        listeners.forEach((listener) => listener())
    }

    const persist = () => {
        if (typeof window === 'undefined' || !window.localStorage) {
            return
        }

        try {
            window.localStorage.setItem(getScopedStorageKey(PERSIST_KEY), JSON.stringify(state))
        } catch {
            // Ignore persistence failures and keep runtime state active.
        }
    }

    const update = (payload: ClipboardPayload | null) => {
        state = {
            payload,
            revision: state.revision + 1,
            updatedAt: payload ? Date.now() : null,
        }
        persist()
        emit()
    }

    onActiveUserChange(() => {
        state = loadPersistedSnapshot()
        emit()
    })

    return {
        setText: (text, sourceAppId) => {
            const normalized = text
            if (!normalized) {
                update(null)
                return
            }

            update({
                kind: 'text',
                text: normalized,
                sourceAppId,
            })
        },
        copyFiles: (entries, sourceAppId) => {
            if (entries.length === 0) {
                update(null)
                return
            }

            update({
                kind: 'files',
                operation: 'copy',
                entries: [...entries],
                sourceAppId,
            })
        },
        cutFiles: (entries, sourceAppId) => {
            if (entries.length === 0) {
                update(null)
                return
            }

            update({
                kind: 'files',
                operation: 'cut',
                entries: [...entries],
                sourceAppId,
            })
        },
        clear: () => {
            update(null)
        },
        getSnapshot: () => state,
        subscribe: (listener) => {
            listeners.add(listener)
            return () => listeners.delete(listener)
        },
    }
}

export const clipboardService = createClipboardService()

export function useClipboardSnapshot() {
    return useSyncExternalStore(
        clipboardService.subscribe,
        clipboardService.getSnapshot,
        clipboardService.getSnapshot,
    )
}
