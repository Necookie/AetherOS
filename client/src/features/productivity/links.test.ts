import { beforeEach, describe, expect, it } from 'vitest'
import { fsService } from '../../vfs/vfsService'
import { buildRecordReference, extractLinkTargets, parseRecordReference } from './links'
import { ProductivityRepository } from './repository'

describe('productivity links', () => {
    beforeEach(() => {
        fsService.resetToDefaults()
    })

    it('extracts link references from record content', () => {
        const links = extractLinkTargets('See [[docs:abc123]] and [[boards:xyz789]] then [[abc123]].')
        expect(links).toEqual(['docs:abc123', 'boards:xyz789', 'abc123'])
    })

    it('resolves linked records across apps', () => {
        const repository = new ProductivityRepository({
            generateId: (() => {
                const ids = ['notes-1', 'docs-1', 'boards-1']
                return () => ids.shift() ?? 'fallback'
            })(),
        })

        repository.createRecord({ appId: 'notes', title: 'N', body: 'note body' })
        const doc = repository.createRecord({ appId: 'docs', title: 'D', body: 'doc body' })
        const board = repository.createRecord({ appId: 'boards', title: 'B', body: 'board body' })

        const resolved = repository.resolveLinkedRecords(`Refs [[docs:${doc.id}]] [[boards:${board.id}]]`)
        const refs = resolved.map((record) => buildRecordReference(record))

        expect(refs).toContain('docs:docs-1')
        expect(refs).toContain('boards:boards-1')
    })

    it('parses references with and without app prefixes', () => {
        expect(parseRecordReference('docs:abc').appId).toBe('docs')
        expect(parseRecordReference('abc').appId).toBeNull()
    })
})
