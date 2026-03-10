import type { VfsNodeType } from '../../vfs/types'

export interface ClipboardTextPayload {
    kind: 'text'
    text: string
    sourceAppId?: string
}

export interface ClipboardFileEntry {
    nodeId: string
    path: string
    name: string
    type: VfsNodeType
}

export interface ClipboardFilesPayload {
    kind: 'files'
    operation: 'copy' | 'cut'
    entries: ClipboardFileEntry[]
    sourceAppId?: string
}

export type ClipboardPayload = ClipboardTextPayload | ClipboardFilesPayload

export interface ClipboardSnapshot {
    payload: ClipboardPayload | null
    revision: number
    updatedAt: number | null
}

export interface ClipboardService {
    setText: (text: string, sourceAppId?: string) => void
    copyFiles: (entries: ClipboardFileEntry[], sourceAppId?: string) => void
    cutFiles: (entries: ClipboardFileEntry[], sourceAppId?: string) => void
    clear: () => void
    getSnapshot: () => ClipboardSnapshot
    subscribe: (listener: () => void) => () => void
}
