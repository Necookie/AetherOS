import { describe, expect, it } from 'vitest'
import {
    createDocsBlock,
    extractMarkdownLinks,
    htmlToMarkdown,
    markdownToHtml,
    parseDocsDocument,
    serializeDocsDocument,
} from './documentModel'

describe('docs document model', () => {
    it('parses legacy html into structured blocks', () => {
        const blocks = parseDocsDocument(`
            <h1>Launch Plan</h1>
            <p>Read <a href="https://example.com/spec">the spec</a> before [[notes:abc123]].</p>
            <ul data-list-type="checklist">
                <li data-checked="true">Release checklist item</li>
            </ul>
        `)

        expect(blocks).toHaveLength(3)
        expect(blocks[0]).toMatchObject({ type: 'heading', level: 1, text: 'Launch Plan' })
        expect(blocks[1]).toMatchObject({
            type: 'paragraph',
            text: 'Read [the spec](https://example.com/spec) before [[notes:abc123]].',
        })
        expect(blocks[2]).toMatchObject({ type: 'checklist', checked: true, text: 'Release checklist item' })
    })

    it('serializes and reparses headings, links, and checklist blocks', () => {
        const serialized = serializeDocsDocument([
            createDocsBlock('heading', { level: 2, text: 'Project Brief' }),
            createDocsBlock('paragraph', { text: 'Open [status page](https://status.example.com) and ping [[docs:abc123]].' }),
            createDocsBlock('checklist', { text: 'Confirm autosave survives reopen', checked: false }),
        ])

        expect(serialized).toContain('## Project Brief')
        expect(serialized).toContain('[status page](https://status.example.com)')
        expect(serialized).toContain('- [ ] Confirm autosave survives reopen')

        const reparsed = parseDocsDocument(serialized)
        expect(reparsed).toHaveLength(3)
        expect(reparsed[0]).toMatchObject({ type: 'heading', level: 2, text: 'Project Brief' })
        expect(reparsed[1]).toMatchObject({ type: 'paragraph' })
        expect(reparsed[2]).toMatchObject({ type: 'checklist', checked: false })
    })

    it('extracts inline markdown links for preview rendering', () => {
        expect(extractMarkdownLinks('See [OpenAI](https://openai.com) and [Docs](https://example.com/docs).')).toEqual([
            { label: 'OpenAI', href: 'https://openai.com' },
            { label: 'Docs', href: 'https://example.com/docs' },
        ])
    })

    it('converts markdown to html for tiptap editor', () => {
        const markdown = '# Project Brief\n\nWelcome to **AetherDocs** with [link](https://example.com).\n\n- [x] Done item\n- [ ] Pending item'
        const html = markdownToHtml(markdown)

        expect(html).toContain('<h1>Project Brief</h1>')
        expect(html).toContain('<strong>AetherDocs</strong>')
        expect(html).toContain('<a href="https://example.com">link</a>')
        expect(html).toContain('<ul data-type="taskList">')
        expect(html).toContain('<li data-type="taskItem" data-checked="true"><p>Done item</p></li>')
        expect(html).toContain('<li data-type="taskItem" data-checked="false"><p>Pending item</p></li>')
    })

    it('converts tiptap html to markdown for storage', () => {
        const html = '<h1>Meeting Readout</h1><p>Discussed <em>timeline</em> and <strong>deliverables</strong>.</p><ul data-type="taskList"><li data-type="taskItem" data-checked="true"><p>Action 1</p></li></ul>'
        const markdown = htmlToMarkdown(html)

        expect(markdown).toContain('# Meeting Readout')
        expect(markdown).toContain('*timeline*')
        expect(markdown).toContain('**deliverables**')
        expect(markdown).toContain('- [x] Action 1')
    })
})
