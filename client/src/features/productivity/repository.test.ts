import { beforeEach, describe, expect, it } from 'vitest'
import { fsService } from '../../vfs/vfsService'
import { ProductivityRepository } from './repository'
import type { ProductivityTemplate } from './types'

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

    it('keeps docs links discoverable after structured body saves', () => {
        const repository = new ProductivityRepository({
            now: () => 1000,
            generateId: () => 'doc-1',
        })

        const created = repository.createRecord({
            appId: 'docs',
            title: 'Spec',
            body: '## Launch\n\nRead [status](https://example.com) and ping [[notes:abc123]].\n\n- [ ] Review checklist',
        })

        expect(created.links).toEqual(['notes:abc123'])

        const loaded = repository.getRecord('docs', created.id)
        expect(loaded?.body).toContain('- [ ] Review checklist')
        expect(loaded?.links).toEqual(['notes:abc123'])
    })

    it('creates records from templates with starter body, links, and attachments', () => {
        const repository = new ProductivityRepository({
            now: () => 1000,
            generateId: () => 'board-1',
        })
        const template: ProductivityTemplate = {
            id: 'linked-board',
            appId: 'boards',
            title: 'Linked board',
            summary: 'Tracks execution from a starter board.',
            category: 'Delivery',
            highlights: ['Linked work', 'Attachments'],
            record: {
                title: 'Sprint board',
                body: JSON.stringify({
                    summary: 'Coordinate with [[docs:doc-42]] before review.',
                    columns: [],
                }),
                attachments: ['/home/user/Documents/readme.txt'],
            },
        }

        const created = repository.createRecordFromTemplateDefinition(template)

        expect(created.title).toBe('Sprint board')
        expect(created.attachments).toEqual(['/home/user/Documents/readme.txt'])
        expect(created.links).toEqual(['docs:doc-42'])
        expect(repository.getRecord('boards', created.id)?.body).toContain('[[docs:doc-42]]')
    })
})
