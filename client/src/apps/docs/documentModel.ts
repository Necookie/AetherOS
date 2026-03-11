export type DocsBlockType = 'paragraph' | 'heading' | 'checklist'

export interface DocsBlock {
    id: string
    type: DocsBlockType
    text: string
    level?: 1 | 2 | 3
    checked?: boolean
}

const LINK_PATTERN = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g

function createId() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID().slice(0, 8)
    }

    return Math.random().toString(36).slice(2, 10)
}

function decodeHtmlEntities(value: string) {
    return value
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
}

function stripTags(value: string) {
    return decodeHtmlEntities(value.replace(/<[^>]+>/g, ''))
}

function normalizeText(value: string) {
    return value.replace(/\r\n/g, '\n').trim()
}

function createBlock(input?: Partial<DocsBlock>): DocsBlock {
    return {
        id: input?.id ?? createId(),
        type: input?.type ?? 'paragraph',
        text: input?.text ?? '',
        level: input?.type === 'heading' ? input.level ?? 1 : undefined,
        checked: input?.type === 'checklist' ? input.checked ?? false : undefined,
    }
}

function parseStructuredBlocks(source: string) {
    const normalized = source.replace(/\r\n/g, '\n').trim()
    if (!normalized) {
        return [createBlock()]
    }

    const chunks = normalized
        .split(/\n{2,}/)
        .map((chunk) => chunk.trim())
        .filter(Boolean)

    const blocks = chunks.map((chunk) => {
        const heading = chunk.match(/^(#{1,3})\s+([\s\S]+)$/)
        if (heading) {
            return createBlock({
                type: 'heading',
                level: heading[1].length as 1 | 2 | 3,
                text: heading[2].replace(/\n+/g, ' ').trim(),
            })
        }

        const checklist = chunk.match(/^- \[([ xX])\]\s+([\s\S]+)$/)
        if (checklist) {
            return createBlock({
                type: 'checklist',
                checked: checklist[1].toLowerCase() === 'x',
                text: checklist[2].replace(/\n+/g, ' ').trim(),
            })
        }

        return createBlock({
            type: 'paragraph',
            text: chunk,
        })
    })

    return blocks.length > 0 ? blocks : [createBlock()]
}

function htmlToStructuredText(source: string) {
    let normalized = source.replace(/\r\n/g, '\n')

    normalized = normalized.replace(/<br\s*\/?>/gi, '\n')
    normalized = normalized.replace(/<a\b[^>]*href=(['"])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi, (_, __, href: string, label: string) => {
        const text = stripTags(label).trim() || href.trim()
        return `[${text}](${decodeHtmlEntities(href.trim())})`
    })
    normalized = normalized.replace(/<li\b[^>]*data-checked=(['"])(true|false)\1[^>]*>([\s\S]*?)<\/li>/gi, (_, __, checked: string, content: string) => {
        const marker = checked === 'true' ? 'x' : ' '
        return `\n\n- [${marker}] ${stripTags(content).trim()}`
    })
    normalized = normalized.replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, (_, content: string) => `\n\n- [ ] ${stripTags(content).trim()}`)
    normalized = normalized.replace(/<h([1-3])\b[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level: string, content: string) => {
        return `\n\n${'#'.repeat(Number(level))} ${stripTags(content).trim()}`
    })
    normalized = normalized.replace(/<(p|div)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, content: string) => `\n\n${stripTags(content).trim()}`)
    normalized = normalized.replace(/<\/?(ul|ol|strong|b|em|i|u|span)[^>]*>/gi, '')
    normalized = normalized.replace(/<[^>]+>/g, '')

    return decodeHtmlEntities(normalized)
        .replace(/\n{3,}/g, '\n\n')
        .trim()
}

export function parseDocsDocument(source: string) {
    const normalized = normalizeText(source)
    if (!normalized) {
        return [createBlock()]
    }

    const structured = /<[^>]+>/.test(normalized)
        ? htmlToStructuredText(normalized)
        : normalized

    return parseStructuredBlocks(structured)
}

export function serializeDocsDocument(blocks: DocsBlock[]) {
    const normalizedBlocks = blocks.length > 0 ? blocks : [createBlock()]

    return normalizedBlocks
        .map((block) => {
            const text = block.text.trim()
            if (!text) {
                return block.type === 'checklist'
                    ? `- [${block.checked ? 'x' : ' '}]`
                    : block.type === 'heading'
                        ? `${'#'.repeat(block.level ?? 1)}`
                        : ''
            }

            if (block.type === 'heading') {
                return `${'#'.repeat(block.level ?? 1)} ${text.replace(/\n+/g, ' ')}`
            }

            if (block.type === 'checklist') {
                return `- [${block.checked ? 'x' : ' '}] ${text.replace(/\n+/g, ' ')}`
            }

            return text
        })
        .filter((chunk, index, all) => chunk.length > 0 || all.length === 1 || index < all.length - 1)
        .join('\n\n')
}

export function createDocsBlock(type: DocsBlockType = 'paragraph', input?: Partial<DocsBlock>) {
    return createBlock({
        ...input,
        type,
    })
}

export function updateBlockType(block: DocsBlock, type: DocsBlockType, level?: 1 | 2 | 3) {
    if (type === 'heading') {
        return createBlock({
            ...block,
            type,
            level: level ?? block.level ?? 1,
        })
    }

    if (type === 'checklist') {
        return createBlock({
            ...block,
            type,
            checked: block.checked ?? false,
        })
    }

    return createBlock({
        ...block,
        type,
    })
}

export function extractMarkdownLinks(value: string) {
    const matches: Array<{ label: string; href: string }> = []

    for (const match of value.matchAll(LINK_PATTERN)) {
        matches.push({
            label: match[1],
            href: match[2],
        })
    }

    return matches
}
