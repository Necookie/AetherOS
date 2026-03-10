import { useSyncExternalStore } from 'react'
import { notificationService } from '../notifications'
import { useFsStore } from '../../stores/fsStore'
import { fsService } from '../../vfs/vfsService'
import { createDownloadManagerService } from './downloadManagerService'
import { createDownloadFileMaterializer } from './downloadFileMaterializer'

const downloadFileMaterializer = createDownloadFileMaterializer({
    fs: fsService,
    onCommitted: () => {
        useFsStore.getState().refresh()
    },
})

export const downloadManagerService = createDownloadManagerService({
    publishNotification: notificationService.publish,
    materializeFile: downloadFileMaterializer.materialize,
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
