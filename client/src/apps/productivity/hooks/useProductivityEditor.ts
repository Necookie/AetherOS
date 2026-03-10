import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { autosaveDraft, productivityRepository } from '../../../features/productivity'
import { reportKernelActivity } from '../../../features/kernel/activityReporter'
import { dirtyGuardService } from '../../../features/dirty-guard/dirtyGuardService'
import type { ProductivityAppId, ProductivityRecord, ProductivityRepository } from '../../../features/productivity'

interface Defaults {
    title: string
    body: string
}

interface UseProductivityEditorOptions {
    appId: ProductivityAppId
    createDefaults: () => Defaults
    repository?: ProductivityRepository
}

interface Snapshot {
    title: string
    body: string
    attachments: string[]
}

function snapshotFromState(title: string, body: string, attachments: string[]): Snapshot {
    return {
        title,
        body,
        attachments: [...attachments],
    }
}

function isEqualSnapshot(left: Snapshot, right: Snapshot) {
    return left.title === right.title
        && left.body === right.body
        && left.attachments.join('\n') === right.attachments.join('\n')
}

export function useProductivityEditor(options: UseProductivityEditorOptions) {
    const repository = options.repository ?? productivityRepository
    const [records, setRecords] = useState<ProductivityRecord[]>(() => repository.listRecords(options.appId))
    const [activeId, setActiveId] = useState<string | null>(records[0]?.id ?? null)
    const [title, setTitle] = useState('')
    const [body, setBody] = useState('')
    const [attachments, setAttachments] = useState<string[]>([])
    const [attachmentInput, setAttachmentInput] = useState('')
    const [statusLabel, setStatusLabel] = useState('Ready')

    const baseRevisionRef = useRef(0)
    const loadedSnapshotRef = useRef<Snapshot>(snapshotFromState('', '', []))
    const dirtyRef = useRef(false)

    const loadRecord = useCallback((recordId: string) => {
        const persisted = repository.getRecord(options.appId, recordId)
        if (!persisted) {
            return
        }

        const existingDraft = repository.loadDraft(options.appId, recordId)
        const nextTitle = existingDraft?.title ?? persisted.title
        const nextBody = existingDraft?.body ?? persisted.body
        const nextAttachments = existingDraft?.attachments ?? persisted.attachments
        const baseRevision = existingDraft?.baseRevision ?? persisted.revision

        setActiveId(recordId)
        setTitle(nextTitle)
        setBody(nextBody)
        setAttachments(nextAttachments)
        baseRevisionRef.current = baseRevision
        loadedSnapshotRef.current = snapshotFromState(nextTitle, nextBody, nextAttachments)
        setStatusLabel(existingDraft ? 'Recovered unsaved draft' : 'Ready')
    }, [options.appId, repository])

    const createRecord = useCallback(() => {
        const defaults = options.createDefaults()
        const created = repository.createRecord({
            appId: options.appId,
            title: defaults.title,
            body: defaults.body,
        })

        setRecords((current) => [created, ...current])
        loadRecord(created.id)
        setStatusLabel('Created')
    }, [loadRecord, options.appId, options.createDefaults, repository])

    useEffect(() => {
        if (records.length === 0) {
            createRecord()
            return
        }

        if (activeId) {
            loadRecord(activeId)
            return
        }

        if (records[0]) {
            loadRecord(records[0].id)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const dirty = useMemo(() => (
        !isEqualSnapshot(loadedSnapshotRef.current, snapshotFromState(title, body, attachments))
    ), [attachments, body, title])
    dirtyRef.current = dirty

    const saveNow = useCallback(async () => {
        if (!activeId || !dirtyRef.current) {
            return true
        }

        const burstUnits = Math.min(3.5, Math.max(0.7, (title.length + body.length + attachments.join('').length) / 1_200))
        const result = autosaveDraft(repository, {
            appId: options.appId,
            id: activeId,
            title,
            body,
            attachments,
            baseRevision: baseRevisionRef.current,
        })

        if (result.status === 'conflict') {
            reportKernelActivity({
                type: 'productivity-autosave',
                sourceAppId: options.appId,
                targetAppId: options.appId,
                units: burstUnits * 1.15,
            })
            baseRevisionRef.current = result.current.revision
            setStatusLabel(`Conflict saved to ${result.conflictPath}`)
            return false
        }

        if (result.status === 'saved') {
            reportKernelActivity({
                type: 'productivity-autosave',
                sourceAppId: options.appId,
                targetAppId: options.appId,
                units: burstUnits,
            })
            baseRevisionRef.current = result.record.revision
            loadedSnapshotRef.current = snapshotFromState(result.record.title, result.record.body, result.record.attachments)
            repository.clearDraft(options.appId, result.record.id)
            setRecords((currentRecords) => {
                const index = currentRecords.findIndex((record) => record.id === result.record.id)
                if (index === -1) {
                    return [result.record, ...currentRecords]
                }

                const clone = [...currentRecords]
                clone[index] = result.record
                return clone.sort((left, right) => right.updatedAt - left.updatedAt)
            })
            setStatusLabel('All changes saved')
        }

        return true
    }, [activeId, attachments, body, options.appId, repository, title])

    const discardChanges = useCallback(() => {
        if (!activeId) {
            return
        }

        repository.clearDraft(options.appId, activeId)
        loadRecord(activeId)
        setStatusLabel('Changes discarded')
    }, [activeId, loadRecord, options.appId, repository])

    useEffect(() => dirtyGuardService.registerScope({
        id: options.appId,
        label: options.appId[0].toUpperCase() + options.appId.slice(1),
        isDirty: () => dirtyRef.current,
        save: saveNow,
        discard: discardChanges,
    }), [discardChanges, options.appId, saveNow])

    useEffect(() => {
        if (!activeId || !dirty) {
            return
        }

        const timerId = window.setTimeout(() => {
            void saveNow()
        }, 650)

        return () => window.clearTimeout(timerId)
    }, [activeId, dirty, saveNow])

    const linkedRecords = useMemo(() => repository.resolveLinkedRecords(body), [body, repository])

    const addAttachment = () => {
        const normalized = attachmentInput.trim()
        if (!normalized) {
            return
        }

        const valid = repository.validateAttachmentPaths([normalized])
        if (valid.length === 0) {
            setStatusLabel('Attachment path not found in VFS')
            return
        }

        setAttachments((current) => {
            if (current.includes(normalized)) {
                return current
            }
            return [...current, normalized]
        })
        setAttachmentInput('')
    }

    const removeAttachment = (path: string) => {
        setAttachments((current) => current.filter((item) => item !== path))
    }

    return {
        records,
        activeId,
        title,
        body,
        attachments,
        linkedRecords,
        statusLabel,
        attachmentInput,
        setTitle,
        setBody,
        createRecord,
        selectRecord: loadRecord,
        setAttachmentInput,
        addAttachment,
        removeAttachment,
        saveNow,
        discardChanges,
        dirty,
        setStatusLabel,
    }
}
