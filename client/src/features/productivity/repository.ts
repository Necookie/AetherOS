import { fsService } from '../../vfs/vfsService'
import { VfsNodeType } from '../../vfs/types'
import {
    getConflictFilePath,
    getDraftFilePath,
    getRecordDirectoryPath,
    getRecordFilePath,
    PRODUCTIVITY_ROOT_PATH,
} from './paths'
import { buildRecordReference, extractLinkTargets, parseRecordReference } from './links'
import { createTemplateRecord, getDefaultProductivityTemplate, getProductivityTemplate } from './templates'
import type {
    CommitDraftResult,
    ProductivityAppId,
    ProductivityDraft,
    ProductivityRecord,
    SaveRecordResult,
    ProductivityTemplate,
} from './types'

interface ProductivityRepositoryOptions {
    now?: () => number
    generateId?: () => string
}

interface CreateRecordInput {
    appId: ProductivityAppId
    title: string
    body?: string
    attachments?: string[]
}

interface UpdateRecordInput {
    appId: ProductivityAppId
    id: string
    expectedRevision: number
    title: string
    body: string
    attachments: string[]
}

const ALL_APPS: ProductivityAppId[] = ['notes', 'docs', 'boards']

function sortByUpdatedAtDesc(left: ProductivityRecord, right: ProductivityRecord) {
    return right.updatedAt - left.updatedAt
}

function normalizeAttachments(attachments: string[]) {
    return attachments
        .map((item) => item.trim())
        .filter((item, index, list) => item.length > 0 && list.indexOf(item) === index)
}

export class ProductivityRepository {
    private readonly now: () => number

    private readonly generateId: () => string

    public constructor(options: ProductivityRepositoryOptions = {}) {
        this.now = options.now ?? Date.now
        this.generateId = options.generateId ?? (() => crypto.randomUUID().slice(0, 12))
        this.ensureWorkspace()
    }

    public listRecords(appId: ProductivityAppId) {
        const directoryPath = getRecordDirectoryPath(appId)
        const nodes = this.safeReadDir(directoryPath)

        return nodes
            .filter((node) => node.type === VfsNodeType.FILE && node.name.endsWith('.json'))
            .map((node) => {
                const filePath = `${directoryPath}/${node.name}`
                return this.readJsonFile<ProductivityRecord>(filePath)
            })
            .filter((record): record is ProductivityRecord => Boolean(record))
            .sort(sortByUpdatedAtDesc)
    }

    public listAllRecords() {
        return ALL_APPS.flatMap((appId) => this.listRecords(appId)).sort(sortByUpdatedAtDesc)
    }

    public getRecord(appId: ProductivityAppId, id: string) {
        const filePath = getRecordFilePath(appId, id)
        return this.readJsonFile<ProductivityRecord>(filePath)
    }

    public createRecord(input: CreateRecordInput): ProductivityRecord {
        const now = this.now()
        const id = this.generateId()
        const record: ProductivityRecord = {
            id,
            appId: input.appId,
            title: input.title.trim() || 'Untitled',
            body: input.body ?? '',
            links: extractLinkTargets(input.body ?? ''),
            attachments: normalizeAttachments(input.attachments ?? []),
            revision: 1,
            createdAt: now,
            updatedAt: now,
        }

        this.upsertFile(getRecordFilePath(input.appId, id), JSON.stringify(record, null, 2))
        return record
    }

    public createRecordFromTemplate(appId: ProductivityAppId, templateId?: string): ProductivityRecord {
        const template = templateId
            ? getProductivityTemplate(appId, templateId)
            : getDefaultProductivityTemplate(appId)

        if (!template) {
            throw new Error(`Template not found for ${appId}:${templateId ?? 'default'}`)
        }

        return this.createRecordFromTemplateDefinition(template)
    }

    public createRecordFromTemplateDefinition(template: ProductivityTemplate): ProductivityRecord {
        const record = createTemplateRecord(template)

        return this.createRecord({
            appId: template.appId,
            title: record.title,
            body: record.body,
            attachments: record.attachments,
        })
    }

    public updateRecord(input: UpdateRecordInput): SaveRecordResult {
        const current = this.getRecord(input.appId, input.id)
        if (!current) {
            throw new Error(`Record not found: ${input.appId}:${input.id}`)
        }

        const draft: ProductivityDraft = {
            id: current.id,
            appId: current.appId,
            title: input.title.trim() || 'Untitled',
            body: input.body,
            links: extractLinkTargets(input.body),
            attachments: normalizeAttachments(input.attachments),
            baseRevision: input.expectedRevision,
            updatedAt: this.now(),
        }

        if (current.revision !== input.expectedRevision) {
            const conflictPath = getConflictFilePath(input.appId, input.id, this.now())
            this.upsertFile(conflictPath, JSON.stringify(draft, null, 2))
            return {
                status: 'conflict',
                current,
                conflictPath,
            }
        }

        const record: ProductivityRecord = {
            ...current,
            title: draft.title,
            body: draft.body,
            links: draft.links,
            attachments: draft.attachments,
            revision: current.revision + 1,
            updatedAt: this.now(),
        }

        this.upsertFile(getRecordFilePath(input.appId, input.id), JSON.stringify(record, null, 2))
        return {
            status: 'saved',
            record,
        }
    }

    public removeRecord(appId: ProductivityAppId, id: string) {
        const filePath = getRecordFilePath(appId, id)
        if (!this.exists(filePath)) {
            return false
        }

        fsService.delete(filePath)
        const draftPath = getDraftFilePath(appId, id)
        if (this.exists(draftPath)) {
            fsService.delete(draftPath)
        }
        return true
    }

    public saveDraft(draft: ProductivityDraft) {
        this.upsertFile(getDraftFilePath(draft.appId, draft.id), JSON.stringify(draft, null, 2))
        return draft
    }

    public loadDraft(appId: ProductivityAppId, id: string) {
        return this.readJsonFile<ProductivityDraft>(getDraftFilePath(appId, id))
    }

    public clearDraft(appId: ProductivityAppId, id: string) {
        const path = getDraftFilePath(appId, id)
        if (!this.exists(path)) {
            return
        }

        fsService.delete(path)
    }

    public commitDraft(appId: ProductivityAppId, id: string): CommitDraftResult {
        const draft = this.loadDraft(appId, id)
        if (!draft) {
            return { status: 'noop' }
        }

        const result = this.updateRecord({
            appId,
            id,
            expectedRevision: draft.baseRevision,
            title: draft.title,
            body: draft.body,
            attachments: draft.attachments,
        })

        if (result.status === 'saved') {
            this.clearDraft(appId, id)
        }

        return result
    }

    public resolveLinkedRecords(value: string) {
        const references = extractLinkTargets(value)
        const byReference = new Map<string, ProductivityRecord>()

        for (const reference of references) {
            const parsed = parseRecordReference(reference)

            if (parsed.appId) {
                const record = this.getRecord(parsed.appId, parsed.id)
                if (record) {
                    byReference.set(buildRecordReference(record), record)
                }
                continue
            }

            for (const appId of ALL_APPS) {
                const record = this.getRecord(appId, parsed.id)
                if (record) {
                    byReference.set(buildRecordReference(record), record)
                }
            }
        }

        return [...byReference.values()].sort(sortByUpdatedAtDesc)
    }

    public validateAttachmentPaths(paths: string[]) {
        return paths.filter((path) => this.exists(path))
    }

    private ensureWorkspace() {
        this.ensureDirectory(PRODUCTIVITY_ROOT_PATH)
        this.ensureDirectory(`${PRODUCTIVITY_ROOT_PATH}/.drafts`)
        this.ensureDirectory(`${PRODUCTIVITY_ROOT_PATH}/.conflicts`)

        for (const appId of ALL_APPS) {
            this.ensureDirectory(getRecordDirectoryPath(appId))
            this.ensureDirectory(`${PRODUCTIVITY_ROOT_PATH}/.drafts/${appId}`)
            this.ensureDirectory(`${PRODUCTIVITY_ROOT_PATH}/.conflicts/${appId}`)
        }
    }

    private ensureDirectory(path: string) {
        const segments = path.split('/').filter(Boolean)
        let current = '/'

        for (const segment of segments) {
            const nextPath = current === '/' ? `/${segment}` : `${current}/${segment}`
            if (!this.exists(nextPath)) {
                fsService.createNode(current, segment, VfsNodeType.DIR)
            }
            current = nextPath
        }
    }

    private exists(path: string) {
        try {
            fsService.resolvePath(path)
            return true
        } catch {
            return false
        }
    }

    private safeReadDir(path: string) {
        try {
            return fsService.readDir(path)
        } catch {
            return []
        }
    }

    private readJsonFile<T>(path: string): T | null {
        try {
            const raw = fsService.readFile(path)
            return JSON.parse(raw) as T
        } catch {
            return null
        }
    }

    private upsertFile(path: string, content: string) {
        const segments = path.split('/').filter(Boolean)
        if (segments.length === 0) {
            return
        }

        const parentPath = `/${segments.slice(0, -1).join('/')}`
        const name = segments[segments.length - 1]
        if (!name) {
            return
        }

        if (this.exists(path)) {
            fsService.writeFile(path, content)
            return
        }

        fsService.createNode(parentPath, name, VfsNodeType.FILE, content, 'application/json')
    }
}

export const productivityRepository = new ProductivityRepository()
