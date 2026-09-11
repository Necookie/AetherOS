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

// --- Menu bar helpers ---
type MenuId = 'file' | 'edit' | 'format' | 'view' | null

interface MenuItem {
    label?: string
    shortcut?: string
    action?: () => void
    separator?: boolean
    disabled?: boolean
}

interface MenuDropdownProps {
    items: MenuItem[]
    onClose: () => void
}

function MenuDropdown({ items, onClose }: MenuDropdownProps) {
    return (
        <div
            className="absolute top-full left-0 z-50 mt-px min-w-[180px] rounded-sm border border-hairline bg-canvas shadow-[0_4px_16px_rgba(0,0,0,0.14)]"
            onMouseLeave={onClose}
        >
            {items.map((item, i) =>
                item.separator ? (
                    <div key={i} className="my-1 h-px bg-hairline" />
                ) : (
                    <button
                        key={i}
                        type="button"
                        disabled={item.disabled}
                        onClick={() => {
                            item.action?.()
                            onClose()
                        }}
                        className="flex w-full items-center justify-between gap-6 px-3 py-1.5 text-left text-[13px] text-ink hover:bg-primary hover:text-white disabled:pointer-events-none disabled:opacity-40"
                    >
                        <span>{item.label}</span>
                        {item.shortcut && (
                            <span className="text-[11px] opacity-60">{item.shortcut}</span>
                        )}
                    </button>
                ),
            )}
        </div>
    )
}

export default function NotesApp({ id }: { id: string }) {
    const editorRef = useRef<HTMLTextAreaElement>(null)
    const linksRef = useRef<HTMLDivElement>(null)
    const attachmentsRef = useRef<HTMLDivElement>(null)
    const importFileInputRef = useRef<HTMLInputElement>(null)

    const [openMenu, setOpenMenu] = useState<MenuId>(null)
    const [isTemplatePickerOpen, setTemplatePickerOpen] = useState(false)
    const [isSidebarOpen, setSidebarOpen] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [showMetaPanel, setShowMetaPanel] = useState(false)
    const [copied, setCopied] = useState(false)
    const [wrapLines, setWrapLines] = useState(true)
    const [fontSize, setFontSize] = useState(14)
    const [fontFamily, setFontFamily] = useState<'mono' | 'sans'>('sans')

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

    const lineCount = useMemo(() => editor.body.split('\n').length, [editor.body])

    const wordCount = useMemo(() => {
        const trimmed = editor.body.trim()
        return trimmed ? trimmed.split(/\s+/).length : 0
    }, [editor.body])

    const charCount = editor.body.length

    // --- Handlers ---
    const handleClipboardShortcut = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        const modifier = event.ctrlKey || event.metaKey
        if (!modifier || event.altKey) return

        const target = event.currentTarget
        const selectionStart = target.selectionStart ?? 0
        const selectionEnd = target.selectionEnd ?? 0
        const selection = editor.body.slice(selectionStart, selectionEnd)
        const key = event.key.toLowerCase()

        if (key === 'c' && selection.length > 0) {
            event.preventDefault()
            clipboardService.setText(selection, 'notes')
            editor.setStatusLabel(`Copied ${selection.length} char${selection.length === 1 ? '' : 's'}`)
            return
        }
        if (key === 'x' && selection.length > 0) {
            event.preventDefault()
            clipboardService.setText(selection, 'notes')
            const nextBody = `${editor.body.slice(0, selectionStart)}${editor.body.slice(selectionEnd)}`
            editor.setBody(nextBody)
            editor.setStatusLabel(`Cut ${selection.length} char${selection.length === 1 ? '' : 's'}`)
            window.requestAnimationFrame(() => {
                target.selectionStart = selectionStart
                target.selectionEnd = selectionStart
            })
            return
        }
        if (key === 'v') {
            const payload = clipboardService.getSnapshot().payload
            if (!payload || payload.kind !== 'text') return
            event.preventDefault()
            const nextBody = `${editor.body.slice(0, selectionStart)}${payload.text}${editor.body.slice(selectionEnd)}`
            const nextCaret = selectionStart + payload.text.length
            editor.setBody(nextBody)
            editor.setStatusLabel(`Pasted ${payload.text.length} char${payload.text.length === 1 ? '' : 's'}`)
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
        editor.setBody(`${text.slice(0, lineStart)}- [ ] ${text.slice(lineStart)}`)
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
        editor.setBody(`${text.slice(0, lineStart)}• ${text.slice(lineStart)}`)
        window.requestAnimationFrame(() => {
            textarea.focus()
            textarea.selectionStart = start + 2
            textarea.selectionEnd = end + 2
        })
    }

    const handleSelectAll = () => {
        const textarea = editorRef.current
        if (!textarea) return
        textarea.focus()
        textarea.select()
    }

    const handleCopyAll = () => {
        const fullText = `${editor.title ? `${editor.title}\n\n` : ''}${editor.body}`
        if (!fullText.trim()) return
        clipboardService.setText(fullText, 'notes')
        setCopied(true)
        editor.setStatusLabel('Copied to clipboard')
        setTimeout(() => setCopied(false), 2000)
    }

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
        editor.setStatusLabel(`Downloaded ${safeName}.md`)
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
            } catch {
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

    // --- Menu definitions ---
    const totalNotesCount = editor.records.length
    const hasAttachmentsOrLinks = editor.attachments.length > 0 || editor.linkedRecords.length > 0

    const fileMenuItems: MenuItem[] = [
        { label: 'New Note', shortcut: 'Ctrl+N', action: () => editor.createRecord() },
        { separator: true },
        { label: 'Import File…', action: () => importFileInputRef.current?.click() },
        { label: 'Save to Documents', shortcut: 'Ctrl+S', action: handleSaveToDocuments },
        { label: 'Download as .md', action: handleDownloadHost },
        { separator: true },
        { label: 'Templates…', action: () => setTemplatePickerOpen(true) },
    ]

    const editMenuItems: MenuItem[] = [
        { label: 'Select All', shortcut: 'Ctrl+A', action: handleSelectAll },
        { separator: true },
        { label: 'Copy All', action: handleCopyAll },
        { separator: true },
        { label: 'Insert Checklist Item', action: handleInsertChecklist },
        { label: 'Insert Bullet Point', action: handleInsertBullet },
    ]

    const formatMenuItems: MenuItem[] = [
        { label: wrapLines ? '✓ Word Wrap' : 'Word Wrap', action: () => setWrapLines((w) => !w) },
        { separator: true },
        { label: 'Font: Monospace', action: () => setFontFamily('mono') },
        { label: 'Font: Sans-serif', action: () => setFontFamily('sans') },
        { separator: true },
        { label: 'Increase Font Size', shortcut: 'Ctrl++', action: () => setFontSize((s) => Math.min(s + 1, 28)) },
        { label: 'Decrease Font Size', shortcut: 'Ctrl+-', action: () => setFontSize((s) => Math.max(s - 1, 10)) },
        { label: 'Reset Font Size', action: () => setFontSize(14) },
    ]

    const viewMenuItems: MenuItem[] = [
        {
            label: isSidebarOpen ? '✓ Show Notes List' : 'Show Notes List',
            action: () => setSidebarOpen((o) => !o),
        },
        {
            label: hasAttachmentsOrLinks || showMetaPanel ? '✓ Show Attachments' : 'Show Attachments',
            action: () => setShowMetaPanel((o) => !o),
        },
        { separator: true },
        { label: 'Zoom In', shortcut: 'Ctrl++', action: () => setFontSize((s) => Math.min(s + 1, 28)) },
        { label: 'Zoom Out', shortcut: 'Ctrl+-', action: () => setFontSize((s) => Math.max(s - 1, 10)) },
    ]

    const menus: Array<{ id: MenuId; label: string; items: MenuItem[] }> = [
        { id: 'file', label: 'File', items: fileMenuItems },
        { id: 'edit', label: 'Edit', items: editMenuItems },
        { id: 'format', label: 'Format', items: formatMenuItems },
        { id: 'view', label: 'View', items: viewMenuItems },
    ]

    const editorFontStyle: React.CSSProperties = {
        fontSize: `${fontSize}px`,
        fontFamily: fontFamily === 'mono'
            ? '"Cascadia Code", "Consolas", "Courier New", monospace'
            : '"Segoe UI", system-ui, -apple-system, sans-serif',
        lineHeight: 1.65,
        whiteSpace: wrapLines ? 'pre-wrap' : 'pre',
        wordBreak: wrapLines ? 'break-word' : 'normal',
        overflowX: wrapLines ? 'hidden' : 'auto',
    }

    return (
        <Window id={id} title="Notes">
            {/* Classic Notepad Shell */}
            <div className="flex h-full w-full flex-col overflow-hidden bg-canvas text-ink">

                {/* === MENU BAR === */}
                <div
                    className="flex shrink-0 items-center border-b border-hairline bg-canvas px-1"
                    style={{ height: '24px' }}
                    onMouseLeave={() => setOpenMenu(null)}
                >
                    {menus.map((menu) => (
                        <div key={menu.id} className="relative">
                            <button
                                type="button"
                                className={`relative px-2.5 py-0.5 text-[13px] leading-none transition-colors ${
                                    openMenu === menu.id
                                        ? 'bg-primary text-white'
                                        : 'text-ink hover:bg-canvas-elevated'
                                }`}
                                onMouseEnter={() => {
                                    if (openMenu !== null) setOpenMenu(menu.id)
                                }}
                                onClick={() => setOpenMenu((prev) => (prev === menu.id ? null : menu.id))}
                            >
                                {menu.label}
                            </button>
                            {openMenu === menu.id && (
                                <MenuDropdown items={menu.items} onClose={() => setOpenMenu(null)} />
                            )}
                        </div>
                    ))}
                </div>

                {/* === TOOLBAR === */}
                <div className="flex shrink-0 items-center gap-0.5 border-b border-hairline bg-canvas px-1 py-0.5">
                    {/* New note */}
                    <button
                        type="button"
                        onClick={() => editor.createRecord()}
                        className="rounded p-1.5 text-ink-muted transition-colors hover:bg-canvas-elevated hover:text-ink active:bg-canvas-elevated"
                        title="New Note (Ctrl+N)"
                        aria-label="New note"
                    >
                        <PenSquare className="h-4 w-4" />
                    </button>

                    {/* Toggle sidebar */}
                    <button
                        type="button"
                        onClick={() => setSidebarOpen((o) => !o)}
                        className={`rounded p-1.5 transition-colors hover:bg-canvas-elevated active:bg-canvas-elevated ${
                            isSidebarOpen ? 'text-ink' : 'text-ink-muted'
                        }`}
                        title="Toggle notes list"
                        aria-label="Toggle sidebar"
                    >
                        <PanelLeft className="h-4 w-4" />
                    </button>

                    <div className="mx-1 h-5 w-px bg-hairline" />

                    {/* Checklist */}
                    <button
                        type="button"
                        onClick={handleInsertChecklist}
                        className="rounded p-1.5 text-ink-muted transition-colors hover:bg-canvas-elevated hover:text-ink active:bg-canvas-elevated"
                        title="Insert checklist item"
                        aria-label="Insert checklist"
                    >
                        <CheckSquare className="h-4 w-4" />
                    </button>

                    {/* Bullet */}
                    <button
                        type="button"
                        onClick={handleInsertBullet}
                        className="rounded p-1.5 text-ink-muted transition-colors hover:bg-canvas-elevated hover:text-ink active:bg-canvas-elevated"
                        title="Insert bullet"
                        aria-label="Insert bullet"
                    >
                        <List className="h-4 w-4" />
                    </button>

                    <div className="mx-1 h-5 w-px bg-hairline" />

                    {/* Copy */}
                    <button
                        type="button"
                        onClick={handleCopyAll}
                        className="rounded p-1.5 text-ink-muted transition-colors hover:bg-canvas-elevated hover:text-ink active:bg-canvas-elevated"
                        title="Copy note"
                        aria-label="Copy note"
                    >
                        {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                    </button>

                    {/* Download */}
                    <button
                        type="button"
                        onClick={handleDownloadHost}
                        className="rounded p-1.5 text-ink-muted transition-colors hover:bg-canvas-elevated hover:text-ink active:bg-canvas-elevated"
                        title="Download as .md"
                        aria-label="Download note"
                    >
                        <Download className="h-4 w-4" />
                    </button>

                    {/* Save to Documents */}
                    <button
                        type="button"
                        onClick={handleSaveToDocuments}
                        className="rounded p-1.5 text-ink-muted transition-colors hover:bg-canvas-elevated hover:text-ink active:bg-canvas-elevated"
                        title="Save to AetherOS Documents"
                        aria-label="Save to Documents"
                    >
                        <FolderDown className="h-4 w-4" />
                    </button>

                    {/* Import */}
                    <button
                        type="button"
                        onClick={() => importFileInputRef.current?.click()}
                        className="rounded p-1.5 text-ink-muted transition-colors hover:bg-canvas-elevated hover:text-ink active:bg-canvas-elevated"
                        title="Import .txt/.md file"
                        aria-label="Import file"
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

                    {/* Templates */}
                    <button
                        type="button"
                        onClick={() => setTemplatePickerOpen((o) => !o)}
                        className="rounded p-1.5 text-ink-muted transition-colors hover:bg-canvas-elevated hover:text-ink active:bg-canvas-elevated"
                        title="Templates"
                        aria-label="Templates"
                    >
                        <Sparkles className="h-4 w-4" />
                    </button>

                    <div className="mx-1 h-5 w-px bg-hairline" />

                    {/* Attachments / meta */}
                    <button
                        type="button"
                        onClick={() => setShowMetaPanel((o) => !o)}
                        className={`rounded p-1.5 transition-colors active:bg-canvas-elevated ${
                            showMetaPanel || hasAttachmentsOrLinks
                                ? 'text-primary hover:bg-canvas-elevated'
                                : 'text-ink-muted hover:bg-canvas-elevated hover:text-ink'
                        }`}
                        title="Attachments & Links"
                        aria-label="Toggle attachments"
                    >
                        <Paperclip className="h-4 w-4" />
                    </button>
                </div>

                {/* === BODY AREA === */}
                <div className="flex min-h-0 flex-1">

                    {/* --- Notes List Sidebar --- */}
                    {isSidebarOpen && (
                        <aside
                            className="flex w-60 shrink-0 flex-col border-r border-hairline bg-canvas"
                            style={{ background: 'var(--color-bg-canvas)' }}
                        >
                            {/* Sidebar header */}
                            <div className="flex items-center justify-between border-b border-hairline px-2 py-1.5">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[12px] font-semibold text-ink">Notes</span>
                                    <span className="rounded bg-canvas-elevated px-1.5 py-px text-[10px] font-semibold text-ink-muted">
                                        {totalNotesCount}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => editor.createRecord()}
                                    className="rounded p-1 text-ink-muted hover:bg-canvas-elevated hover:text-ink active:scale-95"
                                    title="New Note"
                                    aria-label="New note"
                                >
                                    <PenSquare className="h-3.5 w-3.5" />
                                </button>
                            </div>

                            {/* Search */}
                            <div className="border-b border-hairline px-2 py-1.5">
                                <div className="relative">
                                    <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-ink-muted-48" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search…"
                                        className="w-full rounded border border-hairline bg-canvas-elevated py-1 pl-6 pr-2 text-[12px] text-ink outline-none placeholder:text-ink-muted-48 focus:border-primary-focus"
                                    />
                                </div>
                            </div>

                            {/* Notes list */}
                            <div className="flex-1 overflow-y-auto">
                                {filteredRecords.map((record) => {
                                    const isSelected = editor.activeId === record.id
                                    const snippet = record.body.replace(/\n+/g, ' ').trim() || 'No text'
                                    return (
                                        <button
                                            key={record.id}
                                            type="button"
                                            onClick={() => editor.selectRecord(record.id)}
                                            className={`block w-full border-b border-hairline px-2 py-2 text-left transition-colors ${
                                                isSelected
                                                    ? 'bg-primary text-white'
                                                    : 'text-ink hover:bg-canvas-elevated'
                                            }`}
                                        >
                                            <p className="truncate text-[12px] font-semibold">
                                                {record.title || 'New Note'}
                                            </p>
                                            <p className={`mt-0.5 truncate text-[11px] ${isSelected ? 'text-white/70' : 'text-ink-muted'}`}>
                                                {formatNoteDate(record.updatedAt || record.createdAt)}
                                                &nbsp;·&nbsp;
                                                {snippet}
                                            </p>
                                        </button>
                                    )
                                })}

                                {filteredRecords.length === 0 && (
                                    <p className="px-3 py-6 text-center text-[12px] text-ink-muted-48">
                                        {searchQuery ? 'No results' : 'No notes yet'}
                                    </p>
                                )}
                            </div>
                        </aside>
                    )}

                    {/* --- Editor Panel --- */}
                    <div className="flex min-w-0 flex-1 flex-col bg-canvas">

                        {/* Template picker */}
                        {isTemplatePickerOpen && (
                            <div className="border-b border-hairline">
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

                        {/* Title bar (Notepad-style — inside the editor area) */}
                        <div className="flex shrink-0 items-center border-b border-hairline bg-canvas px-2 py-1">
                            <input
                                type="text"
                                value={editor.title}
                                onChange={(e) => editor.setTitle(e.target.value)}
                                placeholder="Untitled"
                                className="min-w-0 flex-1 bg-transparent text-[13px] font-semibold text-ink outline-none placeholder:text-ink-muted-48"
                                style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}
                            />
                            <span className="ml-3 shrink-0 text-[11px] text-ink-muted-48">
                                {activeRecord
                                    ? new Date(activeRecord.updatedAt || activeRecord.createdAt || Date.now()).toLocaleString('en-US', {
                                        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                                    })
                                    : ''}
                            </span>
                        </div>

                        {/* Textarea — full-bleed, Windows Notepad style */}
                        <div className={`flex-1 overflow-auto`}>
                            <textarea
                                ref={editorRef}
                                value={editor.body}
                                onChange={(e) => editor.setBody(e.target.value)}
                                onKeyDown={handleClipboardShortcut}
                                placeholder="Start typing…"
                                spellCheck
                                className="h-full w-full resize-none bg-canvas p-3 text-ink outline-none placeholder:text-ink-muted-48"
                                style={editorFontStyle}
                            />
                        </div>

                        {/* Attachments / links tray */}
                        {(showMetaPanel || hasAttachmentsOrLinks) && (
                            <div className="border-t border-hairline bg-canvas p-3 space-y-3">
                                <div ref={linksRef} tabIndex={-1} className="outline-none">
                                    <LinkedRecordsPanel records={editor.linkedRecords} variant="light" />
                                </div>
                                <div ref={attachmentsRef} tabIndex={-1} className="outline-none">
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

                {/* === STATUS BAR (Windows Notepad style) === */}
                <div className="flex shrink-0 items-center justify-between border-t border-hairline bg-canvas px-3 py-px">
                    <span className="text-[11px] text-ink-muted-48">{editor.statusLabel}</span>
                    <div className="flex items-center gap-3 text-[11px] text-ink-muted-48">
                        <span>Ln {lineCount}, Col 1</span>
                        <span>|</span>
                        <span>{wordCount} words</span>
                        <span>|</span>
                        <span>{charCount} chars</span>
                        <span>|</span>
                        <span>{fontFamily === 'mono' ? 'Monospace' : 'Sans-serif'}</span>
                        <span>|</span>
                        <span>UTF-8</span>
                    </div>
                </div>
            </div>
        </Window>
    )
}
