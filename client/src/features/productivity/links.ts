import type { ProductivityAppId, ProductivityRecord } from './types'

const TOKEN_PATTERN = /\[\[([a-z0-9_-]+)(?::([a-z0-9_-]+))?\]\]/gi

export function extractLinkTargets(value: string) {
    const references = new Set<string>()
    const matches = value.matchAll(TOKEN_PATTERN)

    for (const match of matches) {
        const prefix = match[1]?.toLowerCase()
        const id = (match[2] ?? match[1] ?? '').trim().toLowerCase()

        if (!id) {
            continue
        }

        if (prefix === 'notes' || prefix === 'docs' || prefix === 'boards') {
            references.add(`${prefix}:${id}`)
            continue
        }

        references.add(id)
    }

    return [...references]
}

export function buildRecordReference(record: Pick<ProductivityRecord, 'appId' | 'id'>) {
    return `${record.appId}:${record.id}`
}

export function parseRecordReference(reference: string): { appId: ProductivityAppId | null; id: string } {
    const normalized = reference.trim().toLowerCase()
    const [prefix, rest] = normalized.split(':')
    if (!rest) {
        return {
            appId: null,
            id: prefix,
        }
    }

    if (prefix !== 'notes' && prefix !== 'docs' && prefix !== 'boards') {
        return {
            appId: null,
            id: rest,
        }
    }

    return {
        appId: prefix,
        id: rest,
    }
}
