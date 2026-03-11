import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import Window from '../../components/system/Window'
import { clipboardService } from '../../features/clipboard'
import AttachmentPanel from '../productivity/components/AttachmentPanel'
import LinkedRecordsPanel from '../productivity/components/LinkedRecordsPanel'
import RecordListPane from '../productivity/components/RecordListPane'
import { useProductivityDeepLink } from '../productivity/hooks/useProductivityDeepLink'
import { useProductivityEditor } from '../productivity/hooks/useProductivityEditor'
import {
    createDocsBlock,
    extractMarkdownLinks,
    parseDocsDocument,
    serializeDocsDocument,
    updateBlockType,
    type DocsBlock,
    type DocsBlockType,
} from './documentModel'

type SelectionState = {
    blockId: string
    start: number
    end: number
}

function resizeTextarea(element: HTMLTextAreaElement | null) {
    if (!element) {
        return
    }

    element.style.height = '0px'
    element.style.height = `${element.scrollHeight}px`
}

function getPlaceholder(block: DocsBlock) {
    if (block.type === 'heading') {
        return `Heading ${block.level ?? 1}`
    }

    if (block.type === 'checklist') {
        return 'Checklist item'
    }

    return 'Write a paragraph. Use [[docs:abc123]] for record links.'
}

function getBlockClasses(block: DocsBlock) {
    if (block.type === 'heading') {
        return {
            shell: 'border-amber-300/20 bg-amber-300/8',
            label: `H${block.level ?? 1}`,
            textarea: block.level === 1
                ? 'text-2xl font-semibold leading-tight text-slate-50'
                : block.level === 2
                    ? 'text-xl font-semibold leading-tight text-slate-100'
                    : 'text-lg font-semibold leading-snug text-slate-100',
        }
    }

    if (block.type === 'checklist') {
        return {
            shell: 'border-emerald-400/25 bg-emerald-400/8',
            label: 'Task',
            textarea: 'text-sm leading-6 text-slate-100',
        }
    }

    return {
        shell: 'border-slate-700/80 bg-slate-950/70',
        label: 'Text',
        textarea: 'text-sm leading-7 text-slate-100',
    }
}

export default function DocsApp({ id }: { id: string }) {
    const editorRef = useRef<HTMLDivElement>(null)
    const linksRef = useRef<HTMLDivElement>(null)
    const attachmentsRef = useRef<HTMLDivElement>(null)
    const blockRefs = useRef<Record<string, HTMLTextAreaElement | null>>({})
    const selectionRef = useRef<SelectionState | null>(null)
    const syncedBodyRef = useRef('')

    const editor = useProductivityEditor({
        appId: 'docs',
        createDefaults: () => ({
            title: `Document ${new Date().toLocaleDateString()}`,
            body: 'Start writing your document...',
        }),
    })
    const [blocks, setBlocks] = useState<DocsBlock[]>(() => parseDocsDocument(editor.body))
    const [activeBlockId, setActiveBlockId] = useState<string | null>(blocks[0]?.id ?? null)

    useProductivityDeepLink({
        appId: 'docs',
        selectRecord: editor.selectRecord,
        refs: {
            editor: editorRef,
            links: linksRef,
            attachments: attachmentsRef,
        },
    })

    useEffect(() => {
        if (editor.body === syncedBodyRef.current) {
            return
        }

        const nextBlocks = parseDocsDocument(editor.body)
        syncedBodyRef.current = serializeDocsDocument(nextBlocks)
        setBlocks(nextBlocks)
        setActiveBlockId(nextBlocks[0]?.id ?? null)
        selectionRef.current = nextBlocks[0]
            ? {
                blockId: nextBlocks[0].id,
                start: 0,
                end: 0,
            }
            : null
    }, [editor.body])

    useEffect(() => {
        blocks.forEach((block) => resizeTextarea(blockRefs.current[block.id] ?? null))
    }, [blocks])

    const focusBlock = (blockId: string, caret?: number) => {
        window.requestAnimationFrame(() => {
            const target = blockRefs.current[blockId]
            if (!target) {
                return
            }

            target.focus()
            const position = caret ?? target.value.length
            target.setSelectionRange(position, position)
            resizeTextarea(target)
        })
    }

    const commitBlocks = (
        nextBlocks: DocsBlock[],
        options?: {
            activeBlockId?: string | null
            focusCaret?: number
        },
    ) => {
        const ensuredBlocks = nextBlocks.length > 0 ? nextBlocks : [createDocsBlock()]
        const serialized = serializeDocsDocument(ensuredBlocks)

        syncedBodyRef.current = serialized
        setBlocks(ensuredBlocks)
        editor.setBody(serialized)

        const nextActiveId = options?.activeBlockId ?? ensuredBlocks[0]?.id ?? null
        setActiveBlockId(nextActiveId)

        if (nextActiveId) {
            selectionRef.current = {
                blockId: nextActiveId,
                start: options?.focusCaret ?? 0,
                end: options?.focusCaret ?? 0,
            }
            focusBlock(nextActiveId, options?.focusCaret)
        }
    }

    const activeBlock = blocks.find((block) => block.id === activeBlockId) ?? blocks[0] ?? null

    const replaceBlock = (blockId: string, updater: (block: DocsBlock) => DocsBlock, focusCaret?: number) => {
        const nextBlocks = blocks.map((block) => (block.id === blockId ? updater(block) : block))
        commitBlocks(nextBlocks, {
            activeBlockId: blockId,
            focusCaret,
        })
    }

    const insertBlockAfterActive = (type: DocsBlockType = 'paragraph') => {
        const nextBlock = createDocsBlock(type)
        if (!activeBlock) {
            commitBlocks([nextBlock], {
                activeBlockId: nextBlock.id,
                focusCaret: 0,
            })
            return
        }

        const index = blocks.findIndex((block) => block.id === activeBlock.id)
        const nextBlocks = [...blocks]
        nextBlocks.splice(index + 1, 0, nextBlock)
        commitBlocks(nextBlocks, {
            activeBlockId: nextBlock.id,
            focusCaret: 0,
        })
    }

    const applyBlockType = (type: DocsBlockType, level?: 1 | 2 | 3) => {
        if (!activeBlock) {
            insertBlockAfterActive(type)
            return
        }

        replaceBlock(activeBlock.id, (block) => updateBlockType(block, type, level))
    }

    const applyLink = () => {
        if (!activeBlock) {
            return
        }

        const selection = selectionRef.current?.blockId === activeBlock.id
            ? selectionRef.current
            : {
                blockId: activeBlock.id,
                start: activeBlock.text.length,
                end: activeBlock.text.length,
            }
        const selectedText = activeBlock.text.slice(selection.start, selection.end)
        const href = window.prompt('Link URL', 'https://')
        if (!href) {
            return
        }

        const label = selectedText || window.prompt('Link label', href) || href
        const replacement = `[${label}](${href.trim()})`
        const nextText = `${activeBlock.text.slice(0, selection.start)}${replacement}${activeBlock.text.slice(selection.end)}`
        const nextCaret = selection.start + replacement.length

        replaceBlock(activeBlock.id, (block) => ({
            ...block,
            text: nextText,
        }), nextCaret)
    }

    const toggleChecklist = (blockId: string) => {
        replaceBlock(blockId, (block) => ({
            ...block,
            type: 'checklist',
            checked: !block.checked,
        }))
    }

    const removeBlock = (blockId: string) => {
        const index = blocks.findIndex((block) => block.id === blockId)
        if (index === -1) {
            return
        }

        const nextBlocks = blocks.filter((block) => block.id !== blockId)
        const fallbackIndex = Math.max(0, index - 1)
        const fallbackBlock = nextBlocks[fallbackIndex] ?? nextBlocks[0] ?? createDocsBlock()
        const ensuredBlocks = nextBlocks.length > 0 ? nextBlocks : [fallbackBlock]

        commitBlocks(ensuredBlocks, {
            activeBlockId: fallbackBlock.id,
            focusCaret: fallbackBlock.text.length,
        })
    }

    const handleClipboardShortcut = (event: KeyboardEvent<HTMLTextAreaElement>, block: DocsBlock) => {
        const modifier = event.ctrlKey || event.metaKey
        if (!modifier || event.altKey) {
            return false
        }

        const target = event.currentTarget
        const selectionStart = target.selectionStart ?? 0
        const selectionEnd = target.selectionEnd ?? 0
        const selection = block.text.slice(selectionStart, selectionEnd)
        const key = event.key.toLowerCase()

        if (key === 'c' && selection.length > 0) {
            event.preventDefault()
            clipboardService.setText(selection, 'docs')
            editor.setStatusLabel(`Copied ${selection.length} character${selection.length === 1 ? '' : 's'}`)
            return true
        }

        if (key === 'x' && selection.length > 0) {
            event.preventDefault()
            clipboardService.setText(selection, 'docs')
            const nextText = `${block.text.slice(0, selectionStart)}${block.text.slice(selectionEnd)}`
            replaceBlock(block.id, (current) => ({
                ...current,
                text: nextText,
            }), selectionStart)
            editor.setStatusLabel(`Cut ${selection.length} character${selection.length === 1 ? '' : 's'}`)
            return true
        }

        if (key === 'v') {
            const payload = clipboardService.getSnapshot().payload
            if (!payload || payload.kind !== 'text') {
                return false
            }

            event.preventDefault()
            const nextText = `${block.text.slice(0, selectionStart)}${payload.text}${block.text.slice(selectionEnd)}`
            const nextCaret = selectionStart + payload.text.length
            replaceBlock(block.id, (current) => ({
                ...current,
                text: nextText,
            }), nextCaret)
            editor.setStatusLabel(`Pasted ${payload.text.length} character${payload.text.length === 1 ? '' : 's'}`)
            return true
        }

        return false
    }

    const handleBlockKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>, block: DocsBlock) => {
        if (handleClipboardShortcut(event, block)) {
            return
        }

        const target = event.currentTarget
        const selectionStart = target.selectionStart ?? 0
        const selectionEnd = target.selectionEnd ?? 0
        selectionRef.current = {
            blockId: block.id,
            start: selectionStart,
            end: selectionEnd,
        }

        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault()

            const head = block.text.slice(0, selectionStart)
            const tail = block.text.slice(selectionEnd)
            const updatedBlock: DocsBlock = {
                ...block,
                text: head,
            }
            const nextBlock = createDocsBlock(block.type, {
                text: tail,
                level: block.level,
                checked: block.type === 'checklist' ? false : undefined,
            })
            const index = blocks.findIndex((item) => item.id === block.id)
            const nextBlocks = [...blocks]
            nextBlocks.splice(index, 1, updatedBlock, nextBlock)
            commitBlocks(nextBlocks, {
                activeBlockId: nextBlock.id,
                focusCaret: 0,
            })
            return
        }

        if (event.key === 'Backspace' && block.text.length === 0 && blocks.length > 1) {
            event.preventDefault()
            removeBlock(block.id)
        }
    }

    return (
        <Window id={id} title="Docs">
            <div className="flex h-full flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/45 text-slate-100 md:flex-row">
                <RecordListPane
                    label="Documents"
                    records={editor.records}
                    activeId={editor.activeId}
                    onCreate={editor.createRecord}
                    onSelect={editor.selectRecord}
                />
                <main className="flex min-h-0 flex-1 flex-col">
                    <header className="border-b border-slate-700/70 px-4 py-3">
                        <input
                            value={editor.title}
                            onChange={(event) => editor.setTitle(event.target.value)}
                            placeholder="Document title"
                            className="w-full rounded-md border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-[var(--os-accent)]"
                        />
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <button
                                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-slate-800"
                                onClick={() => applyBlockType('paragraph')}
                                type="button"
                            >
                                Text
                            </button>
                            <button
                                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-slate-800"
                                onClick={() => applyBlockType('heading', 1)}
                                type="button"
                            >
                                H1
                            </button>
                            <button
                                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-slate-800"
                                onClick={() => applyBlockType('heading', 2)}
                                type="button"
                            >
                                H2
                            </button>
                            <button
                                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-slate-800"
                                onClick={() => applyBlockType('heading', 3)}
                                type="button"
                            >
                                H3
                            </button>
                            <button
                                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-slate-800"
                                onClick={() => applyBlockType('checklist')}
                                type="button"
                            >
                                Checklist
                            </button>
                            <button
                                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-slate-800"
                                onClick={applyLink}
                                type="button"
                            >
                                Link
                            </button>
                            <button
                                className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-100 transition hover:bg-cyan-500/20"
                                onClick={() => insertBlockAfterActive('paragraph')}
                                type="button"
                            >
                                Add block
                            </button>
                            <p className="ml-auto text-xs text-slate-400">
                                {editor.statusLabel} · `Ctrl/Cmd+Enter` adds a block
                            </p>
                        </div>
                    </header>
                    <div className="grid min-h-0 flex-1 gap-3 p-3 xl:grid-cols-[minmax(0,1fr),19rem]">
                        <article
                            ref={editorRef}
                            tabIndex={-1}
                            className="min-h-[240px] overflow-auto rounded-lg border border-slate-700 bg-slate-950/70 p-4"
                        >
                            <div className="mx-auto flex max-w-3xl flex-col gap-3">
                                {blocks.map((block) => {
                                    const styles = getBlockClasses(block)
                                    const links = extractMarkdownLinks(block.text)

                                    return (
                                        <section
                                            key={block.id}
                                            className={`rounded-2xl border p-3 shadow-[0_18px_45px_rgba(15,23,42,0.22)] transition ${styles.shell} ${activeBlockId === block.id ? 'ring-1 ring-cyan-400/35' : ''}`}
                                            onMouseDown={() => setActiveBlockId(block.id)}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="mt-1 min-w-[3rem] text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                                                    {styles.label}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-start gap-3">
                                                        {block.type === 'checklist' && (
                                                            <input
                                                                checked={Boolean(block.checked)}
                                                                className="mt-2 h-4 w-4 rounded border-slate-600 bg-slate-900 text-emerald-400 focus:ring-emerald-400"
                                                                onChange={() => toggleChecklist(block.id)}
                                                                type="checkbox"
                                                            />
                                                        )}
                                                        <textarea
                                                            ref={(element) => {
                                                                blockRefs.current[block.id] = element
                                                            }}
                                                            value={block.text}
                                                            rows={Math.max(1, block.text.split('\n').length)}
                                                            placeholder={getPlaceholder(block)}
                                                            className={`w-full resize-none overflow-hidden bg-transparent outline-none placeholder:text-slate-500 ${styles.textarea} ${block.type === 'checklist' && block.checked ? 'text-slate-400 line-through' : ''}`}
                                                            onChange={(event) => {
                                                                const nextText = event.target.value
                                                                resizeTextarea(event.target)
                                                                replaceBlock(block.id, (current) => ({
                                                                    ...current,
                                                                    text: nextText,
                                                                }), event.target.selectionStart ?? nextText.length)
                                                            }}
                                                            onFocus={(event) => {
                                                                setActiveBlockId(block.id)
                                                                selectionRef.current = {
                                                                    blockId: block.id,
                                                                    start: event.target.selectionStart ?? 0,
                                                                    end: event.target.selectionEnd ?? 0,
                                                                }
                                                                resizeTextarea(event.target)
                                                            }}
                                                            onClick={(event) => {
                                                                selectionRef.current = {
                                                                    blockId: block.id,
                                                                    start: event.currentTarget.selectionStart ?? 0,
                                                                    end: event.currentTarget.selectionEnd ?? 0,
                                                                }
                                                            }}
                                                            onKeyDown={(event) => handleBlockKeyDown(event, block)}
                                                            onSelect={(event) => {
                                                                selectionRef.current = {
                                                                    blockId: block.id,
                                                                    start: event.currentTarget.selectionStart ?? 0,
                                                                    end: event.currentTarget.selectionEnd ?? 0,
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                    {links.length > 0 && (
                                                        <div className="mt-3 flex flex-wrap gap-2">
                                                            {links.map((link) => (
                                                                <a
                                                                    key={`${block.id}-${link.href}-${link.label}`}
                                                                    href={link.href}
                                                                    className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-[11px] text-cyan-100 transition hover:bg-cyan-400/20"
                                                                    rel="noreferrer"
                                                                    target="_blank"
                                                                >
                                                                    {link.label}
                                                                </a>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </section>
                                    )
                                })}
                            </div>
                        </article>
                        <div className="space-y-3">
                            <div ref={linksRef} tabIndex={-1} className="rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--os-accent)]">
                                <LinkedRecordsPanel records={editor.linkedRecords} />
                            </div>
                            <div ref={attachmentsRef} tabIndex={-1} className="rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--os-accent)]">
                                <AttachmentPanel
                                    attachments={editor.attachments}
                                    attachmentInput={editor.attachmentInput}
                                    onAttachmentInputChange={editor.setAttachmentInput}
                                    onAddAttachment={editor.addAttachment}
                                    onRemoveAttachment={editor.removeAttachment}
                                />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </Window>
    )
}
