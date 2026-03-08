import { beforeEach, describe, expect, it } from 'vitest'
import { fsService } from '../../vfs/vfsService'
import { ProductivityRepository } from './repository'

describe('ProductivityRepository', () => {
    beforeEach(() => {
        fsService.resetToDefaults()
    })

    it('handles document lifecycle create list update remove', () => {
        const repository = new ProductivityRepository({
            now: () => 1000,
            generateId: () => 'note-1',
        })

        const created = repository.createRecord({
            appId: 'notes',
            title: 'Daily',
            body: 'hello',
        })

        expect(created.revision).toBe(1)
        expect(repository.listRecords('notes')).toHaveLength(1)

        const saveResult = repository.updateRecord({
            appId: 'notes',
            id: created.id,
            expectedRevision: 1,
            title: 'Daily log',
            body: 'updated',
            attachments: [],
        })

        expect(saveResult.status).toBe('saved')
        if (saveResult.status === 'saved') {
            expect(saveResult.record.revision).toBe(2)
            expect(saveResult.record.title).toBe('Daily log')
        }

        expect(repository.removeRecord('notes', created.id)).toBe(true)
        expect(repository.getRecord('notes', created.id)).toBeNull()
    })
})
