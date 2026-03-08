import { beforeEach, describe, expect, it } from 'vitest'
import { fsService } from '../../vfs/vfsService'
import { autosaveDraft } from './autosave'
import { ProductivityRepository } from './repository'

describe('autosaveDraft', () => {
    beforeEach(() => {
        fsService.resetToDefaults()
    })

    it('commits draft changes when revision is current', () => {
        const repository = new ProductivityRepository({
            generateId: () => 'note-1',
        })
        const created = repository.createRecord({ appId: 'notes', title: 'A', body: 'start' })

        const result = autosaveDraft(repository, {
            appId: 'notes',
            id: created.id,
            title: 'A',
            body: 'updated content',
            attachments: ['/home/user/Documents/readme.txt'],
            baseRevision: created.revision,
        })

        expect(result.status).toBe('saved')
        if (result.status === 'saved') {
            expect(result.record.revision).toBe(2)
        }
        expect(repository.loadDraft('notes', created.id)).toBeNull()
    })

    it('writes a conflict snapshot when saving stale draft', () => {
        const repository = new ProductivityRepository({
            generateId: () => 'note-1',
        })
        const created = repository.createRecord({ appId: 'notes', title: 'A', body: 'start' })

        const firstSave = repository.updateRecord({
            appId: 'notes',
            id: created.id,
            expectedRevision: created.revision,
            title: 'A',
            body: 'remote update',
            attachments: [],
        })
        expect(firstSave.status).toBe('saved')

        const result = autosaveDraft(repository, {
            appId: 'notes',
            id: created.id,
            title: 'A local',
            body: 'stale local draft',
            attachments: [],
            baseRevision: created.revision,
        })

        expect(result.status).toBe('conflict')
        if (result.status === 'conflict') {
            expect(result.current.revision).toBeGreaterThan(created.revision)
            expect(() => fsService.resolvePath(result.conflictPath)).not.toThrow()
        }
    })
})
