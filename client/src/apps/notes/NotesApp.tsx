import { useMemo, useRef, useState, type KeyboardEvent } from 'react'
import {
    Check,
    CheckSquare,
    Copy,
    Download,
    FolderDown,
    List,
    PanelLeft,
    Paperclip,
    PenSquare,
    Search,
    Sparkles,
    Upload,
} from 'lucide-react'
import Window from '../../components/system/Window'
import { fsService } from '../../vfs/vfsService'
import { VfsNodeType } from '../../vfs/types'
import { clipboardService } from '../../features/clipboard'
import AttachmentPanel from '../productivity/components/AttachmentPanel'
import LinkedRecordsPanel from '../productivity/components/LinkedRecordsPanel'
import TemplatePicker from '../productivity/components/TemplatePicker'
import { useProductivityDeepLink } from '../productivity/hooks/useProductivityDeepLink'
import { useProductivityEditor } from '../productivity/hooks/useProductivityEditor'

function formatNoteDate(timestamp?: number): string {
    if (!timestamp) return 'Today'
    const date = new Date(timestamp)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    if (isToday) {
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function formatFullDate(timestamp?: number): string {
    const date = timestamp ? new Date(timestamp) : new Date()
    const datePart = date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    })
    const timePart = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
    })
    return `${datePart} at ${timePart}`
}

export default function NotesApp({ id }: { id: string }) {
    const editorRef = useRef<HTMLTextAreaElement>(null)
    const linksRef = useRef<HTMLDivElement>(null)
    const attachmentsRef = useRef<HTMLDivElement>(null)
    const [isTemplatePickerOpen, setTemplatePickerOpen] = useState(false)
    const [isSidebarOpen, setSidebarOpen] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [showMetaPanel, setShowMetaPanel] = useState(false)
    const [copied, setCopied] = useState(false)

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

    const activeRecord = useMemo(() => {
        return editor.records.find((r) => r.id === editor.activeId)
    }, [editor.activeId, editor.records])

    const filteredRecords = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()
        if (!query) return editor.records
        return editor.records.filter((record) => {
            const titleMatch = (record.title || '').toLowerCase().includes(query)
            const bodyMatch = (record.body || '').toLowerCase().includes(query)
            return titleMatch || bodyMatch
        })
    }, [editor.records, searchQuery])

    const wordCount = useMemo(() => {
        const trimmed = editor.body.trim()
        return trimmed ? trimmed.split(/\s+/).length : 0
    }, [editor.body])

    const charCount = editor.body.length

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

    const handleInsertChecklist = () => {
        const textarea = editorRef.current
        if (!textarea) return
        const start = textarea.selectionStart ?? 0
        const end = textarea.selectionEnd ?? 0
        const text = editor.body
        const lineStart = text.lastIndexOf('\n', start - 1) + 1
        const nextBody = `${text.slice(0, lineStart)}- [ ] ${text.slice(lineStart)}`
        editor.setBody(nextBody)
        window.requestAnimationFrame(() => {
            textarea.focus()
            textarea.selectionStart = start + 6
            textarea.selectionEnd = end + 6
        })
    }

    const handleInsertBullet = () => {
        const textarea = editorRef.current
        if (!textarea) return
        const start = textarea.selectionStart ?? 0
        const end = textarea.selectionEnd ?? 0
        const text = editor.body
        const lineStart = text.lastIndexOf('\n', start - 1) + 1
        const nextBody = `${text.slice(0, lineStart)}• ${text.slice(lineStart)}`
        editor.setBody(nextBody)
        window.requestAnimationFrame(() => {
            textarea.focus()
            textarea.selectionStart = start + 2
            textarea.selectionEnd = end + 2
        })
    }

    const handleCopyAll = () => {
        const fullText = `${editor.title ? `${editor.title}\n\n` : ''}${editor.body}`
        if (!fullText.trim()) return
        clipboardService.setText(fullText, 'notes')
        setCopied(true)
        editor.setStatusLabel('Copied note to clipboard')
        setTimeout(() => setCopied(false), 2000)
    }

    const importFileInputRef = useRef<HTMLInputElement>(null)

    const handleDownloadHost = () => {
        const titleText = editor.title.trim() || 'Untitled'
        const safeName = titleText.replace(/[/\\?%*:|"<>]/g, '_').slice(0, 50)
        const content = `${editor.title ? `# ${editor.title}\n\n` : ''}${editor.body}`
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = `${safeName}.md`
        document.body.appendChild(anchor)
        anchor.click()
        document.body.removeChild(anchor)
        URL.revokeObjectURL(url)
        editor.setStatusLabel(`Downloaded ${safeName}.md to computer`)
    }

    const handleSaveToDocuments = () => {
        const titleText = editor.title.trim() || 'Untitled'
        const safeName = titleText.replace(/[/\\?%*:|"<>]/g, '_').slice(0, 50)
        const filename = `${safeName}.md`
        const targetDir = '/home/user/Documents'
        const targetFile = `${targetDir}/${filename}`
        const content = `${editor.title ? `# ${editor.title}\n\n` : ''}${editor.body}`

        try {
            fsService.resolvePath(targetFile)
            fsService.writeFile(targetFile, content)
            editor.setStatusLabel(`Updated Documents/${filename}`)
        } catch {
            try {
                fsService.createNode(targetDir, filename, VfsNodeType.FILE, content, 'text/markdown')
                editor.setStatusLabel(`Saved to Documents/${filename}`)
            } catch (err) {
                editor.setStatusLabel('Failed to save to Documents')
            }
        }
    }

    const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            const text = (e.target?.result as string) || ''
            const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '').slice(0, 50) || 'Imported Note'
            editor.createRecord()
            window.requestAnimationFrame(() => {
                editor.setTitle(nameWithoutExt)
                editor.setBody(text)
                editor.setStatusLabel(`Imported ${file.name}`)
            })
        }
        reader.readAsText(file)
        event.target.value = ''
    }

    const totalNotesCount = editor.records.length
    const hasAttachmentsOrLinks = editor.attachments.length > 0 || editor.linkedRecords.length > 0

    return (
        <Window id={id} title="Notes">
            <div className="flex h-full w-full select-none overflow-hidden bg-parchment text-ink">
                {/* Left Sidebar - Apple Notes List */}
                {isSidebarOpen && (
                    <aside className="flex w-72 shrink-0 flex-col border-r border-hairline bg-parchment">
                        {/* Sidebar Header */}
                        <div className="border-b border-hairline px-3.5 py-3">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-sm font-semibold tracking-tight text-ink">All Notes</h2>
                                    <span className="rounded-pill bg-canvas px-2 py-0.5 text-[11px] font-semibold text-ink-muted-48 border border-hairline">
                                        {totalNotesCount}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setTemplatePickerOpen((open) => !open)}
                                        className="rounded-sm p-1 text-ink-muted transition-colors hover:bg-canvas hover:text-ink active:scale-95"
                                        title="Templates"
                                        aria-label="Note templates"
                                    >
                                        <Sparkles className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => editor.createRecord()}
                                        className="rounded-sm p-1 text-primary transition-transform hover:bg-canvas active:scale-95"
                                        title="New Note"
                                        aria-label="Create new note"
                                    >
                                        <PenSquare className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Search bar */}
                            <div className="relative mt-2.5">
                                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted-48" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    placeholder="Search notes..."
                                    className="w-full rounded-pill border border-hairline bg-canvas pl-8 pr-3 py-1.5 text-xs text-ink outline-none placeholder:text-ink-muted-48 focus:border-primary-focus focus:ring-1 focus:ring-primary-focus"
                                />
                            </div>
                        </div>

                        {/* Notes Scrollable List */}
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {filteredRecords.map((record) => {
                                const isSelected = editor.activeId === record.id
                                const snippet = record.body.replace(/\n+/g, ' ').trim() || 'No additional text'
                                return (
                                    <button
                                        key={record.id}
                                        type="button"
                                        onClick={() => editor.selectRecord(record.id)}
                                        className={`group relative w-full rounded-lg px-3 py-2.5 text-left transition-colors ${
                                            isSelected
                                                ? 'bg-canvas border border-hairline shadow-[0_1px_3px_rgba(0,0,0,0.04)]'
                                                : 'border border-transparent hover:bg-canvas/60'
                                        }`}
                                    >
                                        {isSelected && (
                                            <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-primary" />
                                        )}
                                        <p className="truncate text-sm font-semibold tracking-tight text-ink">
                                            {record.title || 'New Note'}
                                        </p>
                                        <div className="mt-1 flex items-center gap-2 text-xs text-ink-muted-48">
                                            <span className="shrink-0 font-medium">
                                                {formatNoteDate(record.updatedAt || record.createdAt)}
                                            </span>
                                            <span className="truncate">{snippet}</span>
                                        </div>
                                    </button>
                                )
                            })}

                            {filteredRecords.length === 0 && (
                                <div className="px-4 py-8 text-center text-xs text-ink-muted-48">
                                    {searchQuery ? 'No matching notes found' : 'No notes yet. Click new note to start.'}
                                </div>
                            )}
                        </div>
                    </aside>
                )}

                {/* Right Main Writing Canvas */}
                <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-parchment">
                    {/* Top Notepad Action Ribbon */}
                    <header className="flex shrink-0 items-center justify-between border-b border-hairline bg-parchment px-4 py-2">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setSidebarOpen((open) => !open)}
                                className="rounded-sm p-1.5 text-ink-muted transition-colors hover:bg-canvas hover:text-ink active:scale-95"
                                title={isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
                                aria-label="Toggle sidebar"
                            >
                                <PanelLeft className="h-4 w-4" />
                            </button>
                            <span className="text-xs text-ink-muted-48">
                                {wordCount} {wordCount === 1 ? 'word' : 'words'} · {charCount} chars
                            </span>
                            <span aria-hidden="true" className="text-hairline">|</span>
                            <span className="text-xs text-ink-muted-48">
                                {editor.statusLabel}
                            </span>
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={handleInsertChecklist}
                                className="rounded-sm p-1.5 text-ink-muted transition-colors hover:bg-canvas hover:text-ink active:scale-95"
                                title="Add checklist item"
                                aria-label="Insert checklist"
                            >
                                <CheckSquare className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={handleInsertBullet}
                                className="rounded-sm p-1.5 text-ink-muted transition-colors hover:bg-canvas hover:text-ink active:scale-95"
                                title="Add bullet list item"
                                aria-label="Insert bullet list"
                            >
                                <List className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={handleCopyAll}
                                className="rounded-sm p-1.5 text-ink-muted transition-colors hover:bg-canvas hover:text-ink active:scale-95"
                                title="Copy entire note"
                                aria-label="Copy note"
                            >
                                {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                            </button>
                            <button
                                type="button"
                                onClick={handleDownloadHost}
                                className="rounded-sm p-1.5 text-ink-muted transition-colors hover:bg-canvas hover:text-ink active:scale-95"
                                title="Download note to your computer (.md)"
                                aria-label="Download note to computer"
                            >
                                <Download className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveToDocuments}
                                className="rounded-sm p-1.5 text-ink-muted transition-colors hover:bg-canvas hover:text-ink active:scale-95"
                                title="Save note to AetherOS Documents folder"
                                aria-label="Save to AetherOS Documents"
                            >
                                <FolderDown className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => importFileInputRef.current?.click()}
                                className="rounded-sm p-1.5 text-ink-muted transition-colors hover:bg-canvas hover:text-ink active:scale-95"
                                title="Import note file (.txt / .md)"
                                aria-label="Import note"
                            >
                                <Upload className="h-4 w-4" />
                            </button>
                            <input
                                ref={importFileInputRef}
                                type="file"
                                accept=".txt,.md,text/plain,text/markdown"
                                className="hidden"
                                onChange={handleImportFile}
                            />
                            <button
                                type="button"
                                onClick={() => setShowMetaPanel((open) => !open)}
                                className={`rounded-sm p-1.5 transition-colors active:scale-95 ${
                                    showMetaPanel || hasAttachmentsOrLinks
                                        ? 'text-primary hover:bg-canvas'
                                        : 'text-ink-muted hover:bg-canvas hover:text-ink'
                                }`}
                                title="Attachments & Cross-links"
                                aria-label="Toggle attachments and links"
                            >
                                <Paperclip className="h-4 w-4" />
                            </button>
                        </div>
                    </header>

                    {/* Notepad Paper Area */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-8 sm:py-6">
                        <div className="mx-auto flex min-h-full max-w-3xl flex-col rounded-lg border border-hairline bg-canvas p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] sm:p-10">
                            {/* Template Picker Drawer if open */}
                            {isTemplatePickerOpen && (
                                <div className="mb-6">
                                    <TemplatePicker
                                        appLabel="Notes"
                                        templates={editor.templates}
                                        variant="light"
                                        onClose={() => setTemplatePickerOpen(false)}
                                        onSelect={(templateId) => {
                                            editor.createRecord(templateId)
                                            setTemplatePickerOpen(false)
                                        }}
                                    />
                                </div>
                            )}

                            {/* Centered Classic Note Date */}
                            <p className="text-center text-xs font-medium tracking-tight text-ink-muted-48">
                                {formatFullDate(activeRecord?.updatedAt || activeRecord?.createdAt)}
                            </p>

                            {/* Seamless Notepad Title */}
                            <input
                                type="text"
                                value={editor.title}
                                onChange={(event) => editor.setTitle(event.target.value)}
                                placeholder="Title"
                                className="mt-4 w-full border-b border-hairline/60 bg-transparent pb-3 text-2xl font-semibold tracking-tight text-ink outline-none placeholder:text-ink-muted-48 sm:text-3xl"
                            />

                            {/* Seamless Notepad Body */}
                            <textarea
                                ref={editorRef}
                                value={editor.body}
                                onChange={(event) => editor.setBody(event.target.value)}
                                onKeyDown={handleClipboardShortcut}
                                placeholder="Start writing your note here... Use [[docs:id]] or [[boards:id]] to link other records."
                                className="mt-4 min-h-[360px] w-full flex-1 resize-none bg-transparent text-[17px] leading-[1.6] text-ink outline-none placeholder:text-ink-muted-48"
                            />

                            {/* Collapsible Attachments and Cross-links Tray */}
                            {(showMetaPanel || hasAttachmentsOrLinks) && (
                                <div className="mt-8 space-y-3 border-t border-hairline pt-5">
                                    <div ref={linksRef} tabIndex={-1} className="outline-none focus:ring-2 focus:ring-primary-focus rounded-lg">
                                        <LinkedRecordsPanel records={editor.linkedRecords} variant="light" />
                                    </div>
                                    <div ref={attachmentsRef} tabIndex={-1} className="outline-none focus:ring-2 focus:ring-primary-focus rounded-lg">
                                        <AttachmentPanel
                                            attachments={editor.attachments}
                                            attachmentInput={editor.attachmentInput}
                                            onAttachmentInputChange={editor.setAttachmentInput}
                                            onAddAttachment={editor.addAttachment}
                                            onRemoveAttachment={editor.removeAttachment}
                                            variant="light"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </Window>
    )
}
