import { downloadManagerService } from '../../../features/downloads'

const DOWNLOADS_DIR = '/home/user/Downloads'
const SUPPORTED_EXTENSION_PATTERN = /\.(zip|rar|7z|pdf|csv|json|txt|png|jpg|jpeg|gif|webp)$/i

export interface BrowserDownloadPreset {
    id: string
    label: string
    description: string
    sourceUrl: string
    fileName: string
    totalBytes: number
    mimeType: string
    fileContent: string
}

export interface BrowserDownloadRequest {
    sourceUrl: string
    fileName: string
    totalBytes: number
    mimeType?: string
    fileContent?: string
}

export const browserDownloadPresets: BrowserDownloadPreset[] = [
    {
        id: 'system-report',
        label: 'System Report CSV',
        description: 'Export a deterministic system health snapshot.',
        sourceUrl: 'https://downloads.aether.local/reports/system-report.csv',
        fileName: 'system-report.csv',
        totalBytes: 180_000,
        mimeType: 'text/csv',
        fileContent: 'metric,value\ncpu,18\nmemory,42\ndisk,31\nnetwork,12\n',
    },
    {
        id: 'workspace-backup',
        label: 'Workspace Backup',
        description: 'Simulate a browser-driven JSON export.',
        sourceUrl: 'https://downloads.aether.local/exports/workspace-backup.json',
        fileName: 'workspace-backup.json',
        totalBytes: 240_000,
        mimeType: 'application/json',
        fileContent: '{\n  "app": "AetherOS",\n  "exportedAt": "2026-03-10T00:00:00.000Z",\n  "items": 4\n}\n',
    },
]

function inferMimeType(fileName: string) {
    if (fileName.endsWith('.csv')) {
        return 'text/csv'
    }
    if (fileName.endsWith('.json')) {
        return 'application/json'
    }
    if (fileName.endsWith('.txt')) {
        return 'text/plain'
    }
    if (fileName.endsWith('.pdf')) {
        return 'application/pdf'
    }
    if (/\.(png|jpg|jpeg|gif|webp)$/i.test(fileName)) {
        return 'image/*'
    }
    return 'application/octet-stream'
}

function createGenericDownloadContent(url: string, fileName: string) {
    return `Simulated browser download\nURL: ${url}\nFile: ${fileName}\n`
}

export function resolveBrowserDownload(url: string): BrowserDownloadRequest | null {
    const preset = browserDownloadPresets.find((entry) => entry.sourceUrl === url)
    if (preset) {
        return preset
    }

    let parsedUrl: URL
    try {
        parsedUrl = new URL(url)
    } catch {
        return null
    }

    const fileName = decodeURIComponent(parsedUrl.pathname.split('/').filter(Boolean).pop() ?? '')
    if (!fileName || !SUPPORTED_EXTENSION_PATTERN.test(fileName)) {
        return null
    }

    return {
        sourceUrl: url,
        fileName,
        totalBytes: 320_000,
        mimeType: inferMimeType(fileName),
        fileContent: createGenericDownloadContent(url, fileName),
    }
}

export function startBrowserDownload(request: BrowserDownloadRequest) {
    return downloadManagerService.enqueue({
        fileName: request.fileName,
        destinationPath: `${DOWNLOADS_DIR}/${request.fileName}`,
        totalBytes: request.totalBytes,
        source: 'browser',
        sourceUrl: request.sourceUrl,
        mimeType: request.mimeType,
        fileContent: request.fileContent,
    })
}
