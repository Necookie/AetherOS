import { useRef } from 'react'
import Window from '../../components/system/Window'
import AttachmentPanel from '../productivity/components/AttachmentPanel'
import LinkedRecordsPanel from '../productivity/components/LinkedRecordsPanel'
import RecordListPane from '../productivity/components/RecordListPane'
import { useProductivityDeepLink } from '../productivity/hooks/useProductivityDeepLink'
import { useProductivityEditor } from '../productivity/hooks/useProductivityEditor'

export default function NotesApp({ id }: { id: string }) {
    const editorRef = useRef<HTMLTextAreaElement>(null)
    const linksRef = useRef<HTMLDivElement>(null)
    const attachmentsRef = useRef<HTMLDivElement>(null)
    const editor = useProductivityEditor({
        appId: 'notes',
        createDefaults: () => ({
            title: `Note ${new Date().toLocaleTimeString()}`,
            body: '',
        }),
    })
    useProductivityDeepLink({
        appId: 'notes',
        selectRecord: editor.selectRecord,
        refs: {
            editor: editorRef,
            links: linksRef,
            attachments: attachmentsRef,
        },
    })

    return (
        <Window id={id} title="Notes">
            <div className="flex h-full flex-col bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/50 text-slate-100 md:flex-row">
                <RecordListPane
                    label="Notebooks"
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
                            placeholder="Note title"
                            className="w-full rounded-md border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-[var(--os-accent)]"
                        />
                        <p className="mt-2 text-xs text-slate-400">{editor.statusLabel}</p>
                    </header>
                    <div className="grid min-h-0 flex-1 gap-3 p-3 lg:grid-cols-[minmax(0,1fr),19rem]">
                        <textarea
                            ref={editorRef}
                            value={editor.body}
                            onChange={(event) => editor.setBody(event.target.value)}
                            placeholder="Write notes here. Cross-link with [[docs:abc123]] or [[boards:def456]]."
                            className="h-full min-h-[220px] rounded-lg border border-slate-700 bg-slate-950/80 p-3 text-sm leading-6 text-slate-100 outline-none focus:border-[var(--os-accent)]"
                        />
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
