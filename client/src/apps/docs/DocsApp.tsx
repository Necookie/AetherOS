import { useEffect, useRef, type KeyboardEvent } from 'react'
import { Bold, Italic, List, Underline } from 'lucide-react'
import Window from '../../components/system/Window'
import { clipboardService } from '../../features/clipboard'
import AttachmentPanel from '../productivity/components/AttachmentPanel'
import LinkedRecordsPanel from '../productivity/components/LinkedRecordsPanel'
import RecordListPane from '../productivity/components/RecordListPane'
import { useProductivityDeepLink } from '../productivity/hooks/useProductivityDeepLink'
import { useProductivityEditor } from '../productivity/hooks/useProductivityEditor'

const TOOLBAR_ACTIONS: Array<{ id: string; label: string; icon: typeof Bold; command: string }> = [
    { id: 'bold', label: 'Bold', icon: Bold, command: 'bold' },
    { id: 'italic', label: 'Italic', icon: Italic, command: 'italic' },
    { id: 'underline', label: 'Underline', icon: Underline, command: 'underline' },
    { id: 'list', label: 'Bullets', icon: List, command: 'insertUnorderedList' },
]

export default function DocsApp({ id }: { id: string }) {
    const editorRef = useRef<HTMLDivElement>(null)
    const linksRef = useRef<HTMLDivElement>(null)
    const attachmentsRef = useRef<HTMLDivElement>(null)
    const editor = useProductivityEditor({
        appId: 'docs',
        createDefaults: () => ({
            title: `Document ${new Date().toLocaleDateString()}`,
            body: '<p>Start writing your document...</p>',
        }),
    })
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
        const element = editorRef.current
        if (!element || element.innerHTML === editor.body) {
            return
        }

        element.innerHTML = editor.body
    }, [editor.body])

    const runCommand = (command: string) => {
        document.execCommand(command)
        editor.setBody(editorRef.current?.innerHTML ?? '')
    }

    const handleClipboardShortcut = (event: KeyboardEvent<HTMLDivElement>) => {
        const modifier = event.ctrlKey || event.metaKey
        if (!modifier || event.altKey) {
            return
        }

        const element = editorRef.current
        const selection = window.getSelection()
        const key = event.key.toLowerCase()
        if (!element || !selection || selection.rangeCount === 0 || !element.contains(selection.anchorNode)) {
            return
        }

        const selectedText = selection.toString()

        if (key === 'c' && selectedText.length > 0) {
            event.preventDefault()
            clipboardService.setText(selectedText, 'docs')
            editor.setStatusLabel(`Copied ${selectedText.length} character${selectedText.length === 1 ? '' : 's'}`)
            return
        }

        if (key === 'x' && selectedText.length > 0) {
            event.preventDefault()
            clipboardService.setText(selectedText, 'docs')
            selection.deleteFromDocument()
            editor.setBody(element.innerHTML)
            editor.setStatusLabel(`Cut ${selectedText.length} character${selectedText.length === 1 ? '' : 's'}`)
            return
        }

        if (key === 'v') {
            const payload = clipboardService.getSnapshot().payload
            if (!payload || payload.kind !== 'text') {
                return
            }

            event.preventDefault()
            const inserted = document.execCommand('insertText', false, payload.text)
            if (!inserted) {
                const range = selection.getRangeAt(0)
                range.deleteContents()
                range.insertNode(document.createTextNode(payload.text))
                range.collapse(false)
                selection.removeAllRanges()
                selection.addRange(range)
            }
            editor.setBody(element.innerHTML)
            editor.setStatusLabel(`Pasted ${payload.text.length} character${payload.text.length === 1 ? '' : 's'}`)
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
                        <div className="mt-2 flex items-center gap-2">
                            {TOOLBAR_ACTIONS.map((action) => {
                                const Icon = action.icon
                                return (
                                    <button
                                        key={action.id}
                                        className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200 transition hover:bg-slate-800"
                                        onClick={() => runCommand(action.command)}
                                        title={action.label}
                                    >
                                        <Icon className="h-3.5 w-3.5" />
                                    </button>
                                )
                            })}
                            <p className="ml-2 text-xs text-slate-400">{editor.statusLabel}</p>
                        </div>
                    </header>
                    <div className="grid min-h-0 flex-1 gap-3 p-3 xl:grid-cols-[minmax(0,1fr),19rem]">
                        <article className="flex min-h-[240px] flex-1 rounded-lg border border-slate-700 bg-slate-950/70 p-4">
                            <div
                                ref={editorRef}
                                tabIndex={-1}
                                contentEditable
                                suppressContentEditableWarning
                                className="h-full min-h-[220px] w-full overflow-auto text-sm leading-7 text-slate-100 outline-none"
                                onInput={() => editor.setBody(editorRef.current?.innerHTML ?? '')}
                                onKeyDown={handleClipboardShortcut}
                            />
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
