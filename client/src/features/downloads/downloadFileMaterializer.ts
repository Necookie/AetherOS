import type { DownloadItem } from './types'
import { VfsNodeType } from '../../vfs/types'

const DEFAULT_DOWNLOADS_DIR = '/home/user/Downloads'
const INVALID_NAME_CHARS = /[\\/:*?"<>|\u0000-\u001f]+/g

interface VfsWriteTarget {
    normalizePath: (path: string) => string
    resolvePath: (path: string) => { id: string; type: VfsNodeType }
    readDir: (path: string) => Array<{ name: string }>
    createNode: (
        parentPath: string,
        name: string,
        type: VfsNodeType,
        content?: string,
        mime?: string,
        systemOverride?: boolean,
    ) => unknown
}

interface DownloadFileMaterializerOptions {
    fs: VfsWriteTarget
    downloadsDirectory?: string
    onCommitted?: () => void
}

export interface DownloadMaterializationResult {
    fileName: string
    destinationPath: string
}

function ensureDownloadsDirectory(fs: VfsWriteTarget, downloadsDirectory: string) {
    try {
        fs.resolvePath(downloadsDirectory)
        return
    } catch {
        fs.createNode('/home/user', 'Downloads', VfsNodeType.DIR, '', '', true)
    }
}

function getPreferredFileName(item: DownloadItem) {
    const normalizedPath = item.destinationPath ? item.destinationPath.replace(/\\/g, '/') : ''
    const pathSegments = normalizedPath.split('/').filter(Boolean)
    return pathSegments[pathSegments.length - 1] || item.fileName
}

function sanitizeFileName(name: string) {
    const cleaned = name
        .replace(INVALID_NAME_CHARS, '-')
        .replace(/\s+/g, ' ')
        .trim()

    return cleaned || 'download.bin'
}

function createAvailableName(existingNames: Set<string>, preferredName: string) {
    if (!existingNames.has(preferredName)) {
        return preferredName
    }

    const lastDot = preferredName.lastIndexOf('.')
    const hasExtension = lastDot > 0 && lastDot < preferredName.length - 1
    const baseName = hasExtension ? preferredName.slice(0, lastDot) : preferredName
    const extension = hasExtension ? preferredName.slice(lastDot) : ''

    let counter = 1
    while (counter < 10_000) {
        const candidate = `${baseName} (copy ${counter})${extension}`
        if (!existingNames.has(candidate)) {
            return candidate
        }
        counter += 1
    }

    throw new Error(`Could not allocate a filename for ${preferredName}.`)
}

function buildFileContent(item: DownloadItem, finalPath: string) {
    if (item.fileContent) {
        return item.fileContent
    }

    const lines = [
        `Downloaded asset: ${item.fileName}`,
        `Saved to: ${finalPath}`,
    ]

    if (item.sourceUrl) {
        lines.push(`Source URL: ${item.sourceUrl}`)
    }

    if (item.mimeType) {
        lines.push(`MIME type: ${item.mimeType}`)
    }

    return `${lines.join('\n')}\n`
}

export function createDownloadFileMaterializer(options: DownloadFileMaterializerOptions) {
    const downloadsDirectory = options.fs.normalizePath(options.downloadsDirectory ?? DEFAULT_DOWNLOADS_DIR)

    return {
        materialize(item: DownloadItem): DownloadMaterializationResult {
            ensureDownloadsDirectory(options.fs, downloadsDirectory)

            const existingNames = new Set(options.fs.readDir(downloadsDirectory).map((entry) => entry.name))
            const preferredName = sanitizeFileName(getPreferredFileName(item))
            const finalName = createAvailableName(existingNames, preferredName)
            const finalPath = options.fs.normalizePath(`${downloadsDirectory}/${finalName}`)
            const fileContent = buildFileContent(item, finalPath)

            options.fs.createNode(
                downloadsDirectory,
                finalName,
                VfsNodeType.FILE,
                fileContent,
                item.mimeType ?? '',
                true,
            )

            options.onCommitted?.()

            return {
                fileName: finalName,
                destinationPath: finalPath,
            }
        },
    }
}
