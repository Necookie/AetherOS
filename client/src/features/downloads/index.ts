import { useSyncExternalStore } from 'react'
import { notificationService } from '../notifications'
import { useFsStore } from '../../stores/fsStore'
import { fsService } from '../../vfs/vfsService'
import { VfsNodeType } from '../../vfs/types'
import { createDownloadManagerService } from './downloadManagerService'

function persistDownloadedFile(path: string, fileName: string) {
    const normalizedPath = fsService.normalizePath(path)
    const segments = normalizedPath.split('/').filter(Boolean)
    const name = segments[segments.length - 1]
    const parentPath = segments.length > 1 ? `/${segments.slice(0, -1).join('/')}` : '/'
    if (!name) {
        return
    }

    try {
        fsService.resolvePath(normalizedPath)
        fsService.writeFile(normalizedPath, `Downloaded asset: ${fileName}\n`, true)
    } catch {
        fsService.createNode(parentPath, name, VfsNodeType.FILE, `Downloaded asset: ${fileName}\n`, '', true)
    }

    useFsStore.getState().refresh()
}

export const downloadManagerService = createDownloadManagerService({
    publishNotification: notificationService.publish,
    publishEvent: (event) => {
        if (event.type === 'completed') {
            persistDownloadedFile(event.item.destinationPath, event.item.fileName)
        }
    },
})

downloadManagerService.start()

export function useDownloadManagerSnapshot() {
    return useSyncExternalStore(
        downloadManagerService.subscribe,
        downloadManagerService.getSnapshot,
        downloadManagerService.getSnapshot,
    )
}

export * from './types'
