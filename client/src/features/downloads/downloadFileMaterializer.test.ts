import { describe, expect, it } from 'vitest'
import { AetherVFS } from '../../vfs/vfsCore'
import { VfsNodeType } from '../../vfs/types'
import { createDownloadFileMaterializer } from './downloadFileMaterializer'
import type { DownloadItem } from './types'

function seedVfs() {
    const vfs = new AetherVFS()
    vfs.createNode('/', 'home', VfsNodeType.DIR, '', '', true)
    vfs.createNode('/home', 'user', VfsNodeType.DIR, '', '', true)
    vfs.createNode('/home/user', 'Downloads', VfsNodeType.DIR, '', '', true)
    return vfs
}

function createDownload(overrides: Partial<DownloadItem> = {}): DownloadItem {
    return {
        id: 'download-1',
        fileName: 'system-report.csv',
        destinationPath: '/home/user/Downloads/system-report.csv',
        totalBytes: 512,
        receivedBytes: 512,
        status: 'downloading',
        source: 'browser',
        createdAt: 0,
        updatedAt: 0,
        attemptCount: 1,
        maxRetries: 2,
        sourceUrl: 'https://downloads.aether.local/reports/system-report.csv',
        mimeType: 'text/csv',
        ...overrides,
    }
}

describe('downloadFileMaterializer', () => {
    it('writes completed downloads into the VFS Downloads directory', () => {
        const vfs = seedVfs()
        const materializer = createDownloadFileMaterializer({ fs: vfs })

        const result = materializer.materialize(createDownload())

        expect(result.destinationPath).toBe('/home/user/Downloads/system-report.csv')
        expect(vfs.readFile(result.destinationPath)).toContain('Downloaded asset: system-report.csv')
    })

    it('allocates safe copy names when the target filename already exists', () => {
        const vfs = seedVfs()
        vfs.createNode('/home/user/Downloads', 'system-report.csv', VfsNodeType.FILE, 'existing', 'text/csv', true)
        const materializer = createDownloadFileMaterializer({ fs: vfs })

        const result = materializer.materialize(createDownload())

        expect(result.fileName).toBe('system-report (copy 1).csv')
        expect(vfs.readFile('/home/user/Downloads/system-report (copy 1).csv')).toContain('Downloaded asset')
    })
})
