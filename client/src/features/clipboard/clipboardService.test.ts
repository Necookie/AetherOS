import { beforeEach, describe, expect, it } from 'vitest'
import { VfsNodeType } from '../../vfs/types'
import { clipboardService } from './clipboardService'

describe('clipboardService', () => {
    beforeEach(() => {
        clipboardService.clear()
    })

    it('stores text payloads with type information', () => {
        clipboardService.setText('hello world', 'notes')

        expect(clipboardService.getSnapshot().payload).toEqual({
            kind: 'text',
            text: 'hello world',
            sourceAppId: 'notes',
        })
    })

    it('stores file payloads for copy and cut operations', () => {
        const entries = [
            {
                nodeId: 'node-1',
                path: '/home/user/Documents/readme.txt',
                name: 'readme.txt',
                type: VfsNodeType.FILE,
            },
        ]

        clipboardService.copyFiles(entries, 'explorer')
        expect(clipboardService.getSnapshot().payload).toEqual({
            kind: 'files',
            operation: 'copy',
            entries,
            sourceAppId: 'explorer',
        })

        clipboardService.cutFiles(entries, 'explorer')
        expect(clipboardService.getSnapshot().payload).toEqual({
            kind: 'files',
            operation: 'cut',
            entries,
            sourceAppId: 'explorer',
        })
    })
})
