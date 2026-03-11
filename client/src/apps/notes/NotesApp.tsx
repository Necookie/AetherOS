import { useRef, useState, type KeyboardEvent } from 'react'
import Window from '../../components/system/Window'
import { clipboardService } from '../../features/clipboard'
import AttachmentPanel from '../productivity/components/AttachmentPanel'
import LinkedRecordsPanel from '../productivity/components/LinkedRecordsPanel'
import RecordListPane from '../productivity/components/RecordListPane'
import TemplatePicker from '../productivity/components/TemplatePicker'
import { useProductivityDeepLink } from '../productivity/hooks/useProductivityDeepLink'
import { useProductivityEditor } from '../productivity/hooks/useProductivityEditor'

export default function NotesApp({ id }: { id: string }) {
    const editorRef = useRef<HTMLTextAreaElement>(null)
    const linksRef = useRef<HTMLDivElement>(null)
    const attachmentsRef = useRef<HTMLDivElement>(null)
    const [isTemplatePickerOpen, setTemplatePickerOpen] = useState(false)
    const editor = useProductivityEditor({ appId: 'notes' })
    useProductivityDeepLink({
        appId: 'notes',
        createRecord: editor.createRecord,
        selectRecord: editor.selectRecord,
        refs: {
            editor: editorRef,
            links: linksRef,
            attachments: attachmentsRef,
        },
    })

    const handleClipboardShortcut = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        const modifier = event.ctrlKey || event.metaKey
        if (!modifier || event.altKey) {
            return
        }

        const target = event.currentTarget
        const selectionStart = target.selectionStart ?? 0
        const selectionEnd = target.selectionEnd ?? 0
        const selection = editor.body.slice(selectionStart, selectionEnd)
        const key = event.key.toLowerCase()

        if (key === 'c' && selection.length > 0) {
            event.preventDefault()
            clipboardService.setText(selection, 'notes')
            editor.setStatusLabel(`Copied ${selection.length} character${selection.length === 1 ? '' : 's'}`)
            return
        }

        if (key === 'x' && selection.length > 0) {
            event.preventDefault()
            clipboardService.setText(selection, 'notes')
            const nextBody = `${editor.body.slice(0, selectionStart)}${editor.body.slice(selectionEnd)}`
            editor.setBody(nextBody)
            editor.setStatusLabel(`Cut ${selection.length} character${selection.length === 1 ? '' : 's'}`)
            window.requestAnimationFrame(() => {
                target.selectionStart = selectionStart
                target.selectionEnd = selectionStart
            })
            return
        }

        if (key === 'v') {
            const payload = clipboardService.getSnapshot().payload
            if (!payload || payload.kind !== 'text') {
                return
            }

            event.preventDefault()
            const nextBody = `${editor.body.slice(0, selectionStart)}${payload.text}${editor.body.slice(selectionEnd)}`
            const nextCaret = selectionStart + payload.text.length
            editor.setBody(nextBody)
            editor.setStatusLabel(`Pasted ${payload.text.length} character${payload.text.length === 1 ? '' : 's'}`)
            window.requestAnimationFrame(() => {
                target.selectionStart = nextCaret
                target.selectionEnd = nextCaret
            })
        }
    }

    return (
        <Window id={id} title="Notes">
            <div className="flex h-full flex-col bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/50 text-slate-100 md:flex-row">
                <RecordListPane
                    label="Notebooks"
                    records={editor.records}
                    activeId={editor.activeId}
                    onCreate={editor.createRecord}
                    onOpenTemplates={() => setTemplatePickerOpen((open) => !open)}
                    onSelect={editor.selectRecord}
                />
                <main className="flex min-h-0 flex-1 flex-col">
                    <header className="border-b border-slate-700/70 px-4 py-3">
                        <input
                            value={editor.title}
                            onChange={(event) => editor.setTitle(event.target.value)}
                            placeholder="Note title"
                            className="w-full rounded-md border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-[var(--os-accent)]"
                        />
                        <div className="mt-2 flex items-center justify-between gap-3">
                            <p className="text-xs text-slate-400">{editor.statusLabel}</p>
                            <button
                                type="button"
                                onClick={() => setTemplatePickerOpen((open) => !open)}
                                className="rounded-full border border-emerald-500/35 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-100 transition hover:bg-emerald-500/20"
                            >
                                Templates
                            </button>
                        </div>
                    </header>
                    <div className="grid min-h-0 flex-1 gap-3 p-3 lg:grid-cols-[minmax(0,1fr),19rem]">
                        <div className="min-h-0 space-y-3">
                            {isTemplatePickerOpen ? (
                                <TemplatePicker
                                    appLabel="Notes"
                                    templates={editor.templates}
                                    onClose={() => setTemplatePickerOpen(false)}
                                    onSelect={(templateId) => {
                                        editor.createRecord(templateId)
                                        setTemplatePickerOpen(false)
                                    }}
                                />
                            ) : null}
                            <textarea
                                ref={editorRef}
                                value={editor.body}
                                onChange={(event) => editor.setBody(event.target.value)}
                                onKeyDown={handleClipboardShortcut}
                                placeholder="Write notes here. Cross-link with [[docs:abc123]] or [[boards:def456]]."
                                className="h-full min-h-[220px] rounded-lg border border-slate-700 bg-slate-950/80 p-3 text-sm leading-6 text-slate-100 outline-none focus:border-[var(--os-accent)]"
                            />
                        </div>
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
