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
    const entities: Record<string, string> = {
        nbsp: ' ',
        amp: '&',
        lt: '<',
        gt: '>',
        quot: '"',
        '#39': "'",
    }

    return value.replace(/&(nbsp|amp|lt|gt|quot|#39);/g, (_, entity: string) => entities[entity])
}

function stripTags(value: string) {
    let output = ''
    let inTag = false

    for (const character of value) {
        if (character === '<') {
            inTag = true
            continue
        }

        if (inTag) {
            if (character === '>') {
                inTag = false
            }
            continue
        }

        output += character
    }

    return decodeHtmlEntities(output)
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
    return stripTags(normalized)
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

export function markdownToHtml(source: string): string {
    const normalized = source.replace(/\r\n/g, '\n').trim()
    if (!normalized) {
        return '<p></p>'
    }

    if (/^\s*<(p|h[1-6]|ul|ol|blockquote|div)\b/i.test(normalized)) {
        return normalized
    }

    const rawBlocks = normalized.split(/\n{2,}/)
    const htmlBlocks: string[] = []

    for (const rawBlock of rawBlocks) {
        const lines = rawBlock.split('\n')

        const headingMatch = lines[0].match(/^(#{1,6})\s+(.+)$/)
        if (headingMatch && lines.length === 1) {
            const level = headingMatch[1].length
            const content = formatInlineMarkdown(headingMatch[2].trim())
            htmlBlocks.push(`<h${level}>${content}</h${level}>`)
            continue
        }

        if (/^(-{3,}|\*{3,}|_{3,})$/.test(lines[0].trim()) && lines.length === 1) {
            htmlBlocks.push('<hr>')
            continue
        }

        const isChecklist = lines.every((line) => /^\s*-\s+\[([ xX])\]\s+(.*)$/.test(line))
        if (isChecklist) {
            const items = lines.map((line) => {
                const match = line.match(/^\s*-\s+\[([ xX])\]\s*(.*)$/)
                if (!match) return ''
                const checked = match[1].toLowerCase() === 'x'
                const content = formatInlineMarkdown(match[2].trim())
                return `<li data-type="taskItem" data-checked="${checked}"><p>${content}</p></li>`
            }).join('')
            htmlBlocks.push(`<ul data-type="taskList">${items}</ul>`)
            continue
        }

        const isBulletList = lines.every((line) => /^\s*[-*•]\s+(.*)$/.test(line))
        if (isBulletList) {
            const items = lines.map((line) => {
                const match = line.match(/^\s*[-*•]\s*(.*)$/)
                const content = formatInlineMarkdown(match ? match[1].trim() : line.trim())
                return `<li><p>${content}</p></li>`
            }).join('')
            htmlBlocks.push(`<ul>${items}</ul>`)
            continue
        }

        const isOrderedList = lines.every((line) => /^\s*\d+\.\s+(.*)$/.test(line))
        if (isOrderedList) {
            const items = lines.map((line) => {
                const match = line.match(/^\s*\d+\.\s*(.*)$/)
                const content = formatInlineMarkdown(match ? match[1].trim() : line.trim())
                return `<li><p>${content}</p></li>`
            }).join('')
            htmlBlocks.push(`<ol>${items}</ol>`)
            continue
        }

        const isBlockquote = lines.every((line) => /^\s*>\s*(.*)$/.test(line))
        if (isBlockquote) {
            const content = lines.map((line) => line.replace(/^\s*>\s*/, '')).join('<br>')
            htmlBlocks.push(`<blockquote><p>${formatInlineMarkdown(content)}</p></blockquote>`)
            continue
        }

        const formatted = lines.map((line) => formatInlineMarkdown(line)).join('<br>')
        htmlBlocks.push(`<p>${formatted}</p>`)
    }

    return htmlBlocks.join('')
}

function formatInlineMarkdown(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2">$1</a>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/__([^_]+)__/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/_([^_]+)_/g, '<em>$1</em>')
        .replace(/~~([^~]+)~~/g, '<s>$1</s>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
}

export function htmlToMarkdown(html: string): string {
    let text = html.replace(/\r\n/g, '\n')

    text = text.replace(/<br\s*\/?>/gi, '\n')

    text = text.replace(/<a\b[^>]*href=(['"])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi, (_, __, href: string, label: string) => {
        const cleanedLabel = stripTags(label).trim() || href.trim()
        return `[${cleanedLabel}](${decodeHtmlEntities(href.trim())})`
    })

    text = text.replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, content: string) => `**${stripTags(content)}**`)
    text = text.replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, content: string) => `*${stripTags(content)}*`)
    text = text.replace(/<(s|del|strike)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, content: string) => `~~${stripTags(content)}~~`)
    text = text.replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, (_, content: string) => `\`${stripTags(content)}\``)

    text = text.replace(/<li\b[^>]*data-type=(['"])taskItem\1[^>]*data-checked=(['"])(true|false)\2[^>]*>([\s\S]*?)<\/li>/gi, (_, __, ___, checked: string, content: string) => {
        const marker = checked === 'true' ? 'x' : ' '
        const inner = stripTags(content).trim()
        return `\n- [${marker}] ${inner}`
    })

    text = text.replace(/<li\b[^>]*data-checked=(['"])(true|false)\1[^>]*>([\s\S]*?)<\/li>/gi, (_, __, checked: string, content: string) => {
        const marker = checked === 'true' ? 'x' : ' '
        const inner = stripTags(content).trim()
        return `\n- [${marker}] ${inner}`
    })

    text = text.replace(/<ul\b[^>]*>([\s\S]*?)<\/ul>/gi, (_, content: string) => {
        if (/data-type=["']taskItem["']|data-checked=/.test(content)) {
            return `\n\n${content}\n\n`
        }
        const items = content.match(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)
        if (!items) return content
        const parsed = items.map((li: string) => {
            const inner = stripTags(li).trim()
            return `- ${inner}`
        }).join('\n')
        return `\n\n${parsed}\n\n`
    })

    text = text.replace(/<ol\b[^>]*>([\s\S]*?)<\/ol>/gi, (_, content: string) => {
        const items = content.match(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)
        if (!items) return content
        let counter = 1
        const parsed = items.map((li: string) => {
            const inner = stripTags(li).trim()
            return `${counter++}. ${inner}`
        }).join('\n')
        return `\n\n${parsed}\n\n`
    })

    text = text.replace(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level: string, content: string) => {
        const prefix = '#'.repeat(Number(level))
        return `\n\n${prefix} ${stripTags(content).trim()}\n\n`
    })

    text = text.replace(/<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, content: string) => {
        const inner = stripTags(content).trim()
        return `\n\n> ${inner}\n\n`
    })

    text = text.replace(/<hr\s*\/?>/gi, '\n\n---\n\n')

    text = text.replace(/<(p|div)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, content: string) => {
        const inner = stripTags(content).trim()
        return inner ? `\n\n${inner}\n\n` : '\n\n'
    })

    text = stripTags(text)

    return decodeHtmlEntities(text)
        .replace(/\n{3,}/g, '\n\n')
        .trim()
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
