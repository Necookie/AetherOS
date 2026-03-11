export type ProductivityAppId = 'notes' | 'docs' | 'boards'

export interface ProductivityTemplateRecord {
    title: string
    body: string
    attachments?: string[]
}

export interface ProductivityTemplate {
    id: string
    appId: ProductivityAppId
    title: string
    summary: string
    category: string
    highlights: string[]
    record: ProductivityTemplateRecord
}

export interface ProductivityRecord {
    id: string
    appId: ProductivityAppId
    title: string
    body: string
    links: string[]
    attachments: string[]
    revision: number
    createdAt: number
    updatedAt: number
}

export interface ProductivityDraft {
    id: string
    appId: ProductivityAppId
    title: string
    body: string
    links: string[]
    attachments: string[]
    baseRevision: number
    updatedAt: number
}

export type SaveConflictResult = {
    status: 'conflict'
    current: ProductivityRecord
    conflictPath: string
}

export type SaveSuccessResult = {
    status: 'saved'
    record: ProductivityRecord
}

export type SaveRecordResult = SaveConflictResult | SaveSuccessResult

export type CommitDraftResult =
    | {
        status: 'noop'
    }
    | SaveRecordResult
