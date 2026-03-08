import type { CommitDraftResult, ProductivityAppId, ProductivityDraft } from './types'
import type { ProductivityRepository } from './repository'

export interface AutosavePayload {
    appId: ProductivityAppId
    id: string
    title: string
    body: string
    attachments: string[]
    baseRevision: number
}

export function autosaveDraft(
    repository: ProductivityRepository,
    payload: AutosavePayload,
): CommitDraftResult {
    const draft: ProductivityDraft = {
        id: payload.id,
        appId: payload.appId,
        title: payload.title,
        body: payload.body,
        links: [],
        attachments: payload.attachments,
        baseRevision: payload.baseRevision,
        updatedAt: Date.now(),
    }

    repository.saveDraft(draft)
    return repository.commitDraft(payload.appId, payload.id)
}
