import type { ProductivityAppId } from './types'

export const PRODUCTIVITY_ROOT_PATH = '/home/user/Documents/Productivity'

export function getRecordDirectoryPath(appId: ProductivityAppId) {
    return `${PRODUCTIVITY_ROOT_PATH}/${appId}`
}

export function getRecordFilePath(appId: ProductivityAppId, id: string) {
    return `${getRecordDirectoryPath(appId)}/${id}.json`
}

export function getDraftDirectoryPath(appId: ProductivityAppId) {
    return `${PRODUCTIVITY_ROOT_PATH}/.drafts/${appId}`
}

export function getDraftFilePath(appId: ProductivityAppId, id: string) {
    return `${getDraftDirectoryPath(appId)}/${id}.json`
}

export function getConflictDirectoryPath(appId: ProductivityAppId) {
    return `${PRODUCTIVITY_ROOT_PATH}/.conflicts/${appId}`
}

export function getConflictFilePath(appId: ProductivityAppId, id: string, timestamp: number) {
    return `${getConflictDirectoryPath(appId)}/${id}.${timestamp}.json`
}
