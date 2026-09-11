import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import {
    Check,
    Download,
    FileText,
    FolderDown,
    PanelLeft,
    Paperclip,
    PenSquare,
    Search,
    Sparkles,
    Upload,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import Window from '../../components/system/Window'
import AttachmentPanel from '../productivity/components/AttachmentPanel'
import LinkedRecordsPanel from '../productivity/components/LinkedRecordsPanel'
import TemplatePicker from '../productivity/components/TemplatePicker'
import { useProductivityDeepLink } from '../productivity/hooks/useProductivityDeepLink'
import { useProductivityEditor } from '../productivity/hooks/useProductivityEditor'
import { fsService } from '../../vfs/vfsService'
import { VfsNodeType } from '../../vfs/types'
import DocsToolbar from './DocsToolbar'
import {
    extractMarkdownLinks,
    htmlToMarkdown,
    markdownToHtml,
} from './documentModel'

function formatDocDate(timestamp?: number): string {
    if (!timestamp) return 'Today'
    const date = new Date(timestamp)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    if (isToday) {
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

// --- Menu Bar Types & Component (Matching NotesApp) ---
type MenuId = 'file' | 'edit' | 'format' | 'view' | 'insert' | null

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
            className="absolute top-full left-0 z-50 mt-px min-w-[190px] rounded-sm border border-hairline bg-canvas shadow-[0_4px_16px_rgba(0,0,0,0.14)] py-1"
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

export default function DocsApp({ id }: { id: string }) {
    const editorRef = useRef<HTMLDivElement>(null)
    const linksRef = useRef<HTMLDivElement>(null)
    const attachmentsRef = useRef<HTMLDivElement>(null)
    const importFileInputRef = useRef<HTMLInputElement>(null)

    const [openMenu, setOpenMenu] = useState<MenuId>(null)
    const [isTemplatePickerOpen, setTemplatePickerOpen] = useState(false)
    const [isSidebarOpen, setSidebarOpen] = useState(true)
    const [showMetaPanel, setShowMetaPanel] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [fontFamily, setFontFamily] = useState('-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", system-ui, sans-serif')
    const [fontSize, setFontSize] = useState(17)

    const editor = useProductivityEditor({ appId: 'docs' })
    const lastSavedBodyRef = useRef(editor.body)
    const isInternalUpdateRef = useRef(false)

    useProductivityDeepLink({
        appId: 'docs',
        createRecord: editor.createRecord,
        selectRecord: editor.selectRecord,
        refs: {
            editor: editorRef,
            links: linksRef,
            attachments: attachmentsRef,
        },
    })

    const tiptap = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline cursor-pointer hover:opacity-80',
                },
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
        ],
        content: markdownToHtml(editor.body),
        onUpdate: ({ editor: currentEditor }) => {
            isInternalUpdateRef.current = true
            const markdown = htmlToMarkdown(currentEditor.getHTML())
            lastSavedBodyRef.current = markdown
            editor.setBody(markdown)
            setTimeout(() => {
                isInternalUpdateRef.current = false
            }, 50)
        },
    })

    // Synchronize body when switching records or loading templates externally
    useEffect(() => {
        if (!tiptap) return
        if (isInternalUpdateRef.current) return
        if (editor.body === lastSavedBodyRef.current) return

        lastSavedBodyRef.current = editor.body
        const nextHtml = markdownToHtml(editor.body)
        tiptap.commands.setContent(nextHtml, { emitUpdate: false })
    }, [editor.body, tiptap])

    // Compute word & character counts
    const metrics = useMemo(() => {
        const text = tiptap ? tiptap.getText() : editor.body
        const trimmed = text.trim()
        const words = trimmed ? trimmed.split(/\s+/).length : 0
        const chars = text.length
        return { words, chars }
    }, [editor.body, tiptap])

    const inlineLinks = useMemo(() => {
        return extractMarkdownLinks(editor.body)
    }, [editor.body])

    const filteredRecords = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()
        if (!query) return editor.records
        return editor.records.filter((record) => {
            const titleMatch = (record.title || '').toLowerCase().includes(query)
            const bodyMatch = (record.body || '').toLowerCase().includes(query)
            return titleMatch || bodyMatch
        })
    }, [editor.records, searchQuery])

    const handlePrint = () => {
        window.print()
    }

    const handleDownload = (format: 'md' | 'txt') => {
        const titleText = editor.title.trim() || 'Untitled Document'
        const safeName = titleText.replace(/[/\\?%*:|"<>]/g, '_').slice(0, 50)
        const content = format === 'md' ? editor.body : editor.body.replace(/[#*`_~[\]]/g, '')
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${safeName}.${format}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        editor.setStatusLabel(`Downloaded ${safeName}.${format}`)
        setOpenMenu(null)
    }

    const handleSaveToDocuments = () => {
        const titleText = editor.title.trim() || 'Untitled Document'
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
            const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '').slice(0, 50) || 'Imported Document'
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

    // --- Menu Definitions (Following design.md & NotesApp) ---
    const fileMenuItems: MenuItem[] = [
        { label: 'New Document', shortcut: 'Ctrl+N', action: () => editor.createRecord() },
        { separator: true },
        { label: 'Import File…', action: () => importFileInputRef.current?.click() },
        { label: 'Save to Documents', shortcut: 'Ctrl+S', action: handleSaveToDocuments },
        { label: 'Download as .md', action: () => handleDownload('md') },
        { label: 'Download as .txt', action: () => handleDownload('txt') },
        { separator: true },
        { label: 'Print Document', shortcut: 'Ctrl+P', action: handlePrint },
        { separator: true },
        { label: 'Templates…', action: () => setTemplatePickerOpen(true) },
    ]

    const editMenuItems: MenuItem[] = [
        { label: 'Undo', shortcut: 'Ctrl+Z', disabled: !tiptap?.can().undo(), action: () => tiptap?.chain().focus().undo().run() },
        { label: 'Redo', shortcut: 'Ctrl+Y', disabled: !tiptap?.can().redo(), action: () => tiptap?.chain().focus().redo().run() },
        { separator: true },
        { label: 'Select All', shortcut: 'Ctrl+A', action: () => tiptap?.chain().focus().selectAll().run() },
        { label: 'Clear Formatting', action: () => tiptap?.chain().focus().clearNodes().unsetAllMarks().run() },
    ]

    const formatMenuItems: MenuItem[] = [
        { label: 'Bold', shortcut: 'Ctrl+B', action: () => tiptap?.chain().focus().toggleBold().run() },
        { label: 'Italic', shortcut: 'Ctrl+I', action: () => tiptap?.chain().focus().toggleItalic().run() },
        { label: 'Underline', shortcut: 'Ctrl+U', action: () => tiptap?.chain().focus().toggleUnderline().run() },
        { label: 'Strikethrough', action: () => tiptap?.chain().focus().toggleStrike().run() },
        { label: 'Inline Code', action: () => tiptap?.chain().focus().toggleCode().run() },
        { separator: true },
        { label: 'Increase Font Size', shortcut: 'Ctrl++', action: () => setFontSize((s) => Math.min(s + 1, 28)) },
        { label: 'Decrease Font Size', shortcut: 'Ctrl+-', action: () => setFontSize((s) => Math.max(s - 1, 12)) },
        { label: 'Reset Font Size (17px)', action: () => setFontSize(17) },
    ]

    const viewMenuItems: MenuItem[] = [
        {
            label: isSidebarOpen ? '✓ Show Documents List' : 'Show Documents List',
            action: () => setSidebarOpen((o) => !o),
        },
        {
            label: showMetaPanel ? '✓ Show Attachments & Links' : 'Show Attachments & Links',
            action: () => setShowMetaPanel((o) => !o),
        },
    ]

    const insertMenuItems: MenuItem[] = [
        {
            label: 'Link…',
            shortcut: 'Ctrl+K',
            action: () => {
                const url = window.prompt('URL link', 'https://')
                if (url) tiptap?.chain().focus().setLink({ href: url }).run()
            },
        },
        {
            label: 'Checklist Item',
            action: () => tiptap?.chain().focus().toggleTaskList().run(),
        },
        {
            label: 'Bullet Point',
            action: () => tiptap?.chain().focus().toggleBulletList().run(),
        },
        {
            label: 'Horizontal Rule',
            action: () => tiptap?.chain().focus().setHorizontalRule().run(),
        },
    ]

    const menus: Array<{ id: MenuId; label: string; items: MenuItem[] }> = [
        { id: 'file', label: 'File', items: fileMenuItems },
        { id: 'edit', label: 'Edit', items: editMenuItems },
        { id: 'format', label: 'Format', items: formatMenuItems },
        { id: 'view', label: 'View', items: viewMenuItems },
        { id: 'insert', label: 'Insert', items: insertMenuItems },
    ]

    const totalDocsCount = editor.records.length
    const hasAttachmentsOrLinks = editor.attachments.length > 0 || editor.linkedRecords.length > 0

    return (
        <Window id={id} title="Docs">
            {/* System Visual Shell matching NotesApp and design.md */}
            <div className="flex h-full w-full flex-col overflow-hidden bg-canvas text-ink font-sans">
                {/* === MENU BAR === */}
                <div
                    className="flex shrink-0 items-center border-b border-hairline bg-canvas px-1 select-none"
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

                    {/* Autosave status indicator right-aligned in menu bar */}
                    <div className="ml-auto flex items-center gap-1.5 px-2 text-[11px] text-ink-muted">
                        <Check className="h-3 w-3 text-success" />
                        <span>{editor.statusLabel === 'Ready' ? 'Saved to Documents' : editor.statusLabel}</span>
                    </div>
                </div>

                {/* === PRIMARY ACTION BAR === */}
                <div className="flex shrink-0 items-center justify-between gap-2 border-b border-hairline bg-canvas px-2 py-1.5">
                    <div className="flex items-center gap-1.5">
                        {/* Toggle sidebar */}
                        <button
                            type="button"
                            onClick={() => setSidebarOpen((o) => !o)}
                            className={`rounded-sm p-1.5 transition-colors active:scale-95 ${
                                isSidebarOpen ? 'text-ink bg-canvas-elevated' : 'text-ink-muted hover:bg-canvas-elevated hover:text-ink'
                            }`}
                            title="Toggle document list"
                            aria-label="Toggle sidebar"
                        >
                            <PanelLeft className="h-4 w-4" />
                        </button>

                        {/* New document button */}
                        <button
                            type="button"
                            onClick={() => editor.createRecord()}
                            className="rounded-sm p-1.5 text-ink-muted transition-colors hover:bg-canvas-elevated hover:text-ink active:scale-95"
                            title="New Document (Ctrl+N)"
                            aria-label="New document"
                        >
                            <PenSquare className="h-4 w-4" />
                        </button>

                        <div className="mx-1 h-5 w-px bg-hairline" />

                        {/* Document Title Input */}
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            <input
                                value={editor.title}
                                onChange={(event) => editor.setTitle(event.target.value)}
                                placeholder="Untitled document"
                                className="w-56 sm:w-72 rounded-sm border border-transparent px-2 py-0.5 text-[14px] font-semibold text-ink outline-none transition hover:border-hairline hover:bg-canvas-elevated focus:border-primary-focus focus:bg-canvas"
                            />
                        </div>
                    </div>

                    {/* Right Action Icons */}
                    <div className="flex items-center gap-0.5">
                        {/* Save to Documents */}
                        <button
                            type="button"
                            onClick={handleSaveToDocuments}
                            className="rounded-sm p-1.5 text-ink-muted transition-colors hover:bg-canvas-elevated hover:text-ink active:scale-95"
                            title="Save to AetherOS Documents (Ctrl+S)"
                        >
                            <FolderDown className="h-4 w-4" />
                        </button>

                        {/* Download as Markdown */}
                        <button
                            type="button"
                            onClick={() => handleDownload('md')}
                            className="rounded-sm p-1.5 text-ink-muted transition-colors hover:bg-canvas-elevated hover:text-ink active:scale-95"
                            title="Download as .md"
                        >
                            <Download className="h-4 w-4" />
                        </button>

                        {/* Import File */}
                        <button
                            type="button"
                            onClick={() => importFileInputRef.current?.click()}
                            className="rounded-sm p-1.5 text-ink-muted transition-colors hover:bg-canvas-elevated hover:text-ink active:scale-95"
                            title="Import .txt/.md file"
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

                        {/* Templates modal button */}
                        <button
                            type="button"
                            onClick={() => setTemplatePickerOpen(true)}
                            className="ml-1 inline-flex items-center gap-1 rounded-pill border border-hairline bg-canvas px-2.5 py-1 text-[12px] font-normal text-ink transition hover:bg-canvas-elevated active:scale-95"
                            title="Browse starter templates"
                        >
                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                            <span>Templates</span>
                        </button>

                        {/* Attachments / Metadata toggle */}
                        <button
                            type="button"
                            onClick={() => setShowMetaPanel((o) => !o)}
                            className={`ml-1 rounded-sm p-1.5 transition-colors active:scale-95 ${
                                showMetaPanel || hasAttachmentsOrLinks
                                    ? 'text-primary bg-primary/10'
                                    : 'text-ink-muted hover:bg-canvas-elevated hover:text-ink'
                            }`}
                            title="Attachments & Links"
                        >
                            <Paperclip className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* === FORMATTING RIBBON TOOLBAR === */}
                <DocsToolbar
                    editor={tiptap}
                    fontFamily={fontFamily}
                    fontSize={fontSize}
                    onFontFamilyChange={setFontFamily}
                    onFontSizeChange={setFontSize}
                    onPrint={handlePrint}
                />

                {/* === BODY AREA (Sidebar + Canvas) === */}
                <div className="flex min-h-0 flex-1">
                    {/* --- Documents List Sidebar (Matching NotesApp) --- */}
                    {isSidebarOpen && (
                        <aside className="flex w-60 shrink-0 flex-col border-r border-hairline bg-canvas">
                            {/* Sidebar Header */}
                            <div className="flex items-center justify-between border-b border-hairline px-2.5 py-2">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[12px] font-semibold text-ink">Documents</span>
                                    <span className="rounded bg-canvas-elevated px-1.5 py-px text-[10px] font-semibold text-ink-muted">
                                        {totalDocsCount}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => editor.createRecord()}
                                    className="rounded p-1 text-ink-muted hover:bg-canvas-elevated hover:text-ink active:scale-95"
                                    title="New Document"
                                >
                                    <PenSquare className="h-3.5 w-3.5" />
                                </button>
                            </div>

                            {/* Search Box */}
                            <div className="border-b border-hairline px-2 py-1.5">
                                <div className="relative">
                                    <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-ink-muted-48" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search documents…"
                                        className="w-full rounded border border-hairline bg-canvas-elevated py-1 pl-6 pr-2 text-[12px] text-ink outline-none placeholder:text-ink-muted-48 focus:border-primary-focus"
                                    />
                                </div>
                            </div>

                            {/* Document Cards List */}
                            <div className="flex-1 overflow-y-auto">
                                {filteredRecords.map((record) => {
                                    const isSelected = editor.activeId === record.id
                                    const snippet = record.body.replace(/\n+/g, ' ').replace(/[#*`~_]/g, '').trim() || 'Empty document'
                                    return (
                                        <button
                                            key={record.id}
                                            type="button"
                                            onClick={() => editor.selectRecord(record.id)}
                                            className={`block w-full border-b border-hairline px-2.5 py-2 text-left transition-colors ${
                                                isSelected
                                                    ? 'bg-primary text-white'
                                                    : 'text-ink hover:bg-canvas-elevated'
                                            }`}
                                        >
                                            <p className="truncate text-[12px] font-semibold">
                                                {record.title || 'Untitled Document'}
                                            </p>
                                            <p className={`mt-0.5 truncate text-[11px] ${isSelected ? 'text-white/70' : 'text-ink-muted'}`}>
                                                {formatDocDate(record.updatedAt || record.createdAt)}
                                                &nbsp;·&nbsp;
                                                {snippet}
                                            </p>
                                        </button>
                                    )
                                })}
                                {filteredRecords.length === 0 && (
                                    <p className="px-3 py-4 text-xs text-ink-muted">No documents found.</p>
                                )}
                            </div>
                        </aside>
                    )}

                    {/* --- Attachments & Linked Records Slide-out Panel --- */}
                    {showMetaPanel && (
                        <aside className="w-64 shrink-0 border-r border-hairline bg-canvas p-3 space-y-3 overflow-y-auto">
                            <div className="flex items-center justify-between pb-1 border-b border-hairline">
                                <span className="text-[12px] font-semibold text-ink">Metadata & Attachments</span>
                                <button
                                    type="button"
                                    onClick={() => setShowMetaPanel(false)}
                                    className="text-[11px] text-ink-muted hover:text-ink"
                                >
                                    Close
                                </button>
                            </div>
                            <div ref={linksRef} tabIndex={-1} className="rounded-lg focus:outline-none">
                                <LinkedRecordsPanel records={editor.linkedRecords} />
                            </div>
                            <div ref={attachmentsRef} tabIndex={-1} className="rounded-lg focus:outline-none">
                                <AttachmentPanel
                                    attachments={editor.attachments}
                                    attachmentInput={editor.attachmentInput}
                                    onAttachmentInputChange={editor.setAttachmentInput}
                                    onAddAttachment={editor.addAttachment}
                                    onRemoveAttachment={editor.removeAttachment}
                                />
                            </div>
                        </aside>
                    )}

                    {/* --- DESK WORKSPACE (Parchment background per design.md) --- */}
                    <div
                        ref={editorRef}
                        className="relative flex min-h-0 flex-1 justify-center overflow-y-auto bg-parchment p-4 sm:p-10"
                        onClick={() => tiptap?.chain().focus().run()}
                    >
                        {/* Authentic Typography and Styling from design.md */}
                        <style>{`
                            .tiptap {
                                outline: none;
                                min-height: 850px;
                            }
                            .tiptap p {
                                margin: 0.5rem 0;
                                line-height: 1.47;
                                letter-spacing: -0.374px;
                            }
                            .tiptap h1 {
                                font-size: 34px;
                                font-weight: 600;
                                line-height: 1.2;
                                letter-spacing: -0.374px;
                                margin-top: 1.5rem;
                                margin-bottom: 0.5rem;
                                color: #1d1d1f;
                            }
                            .tiptap h2 {
                                font-size: 24px;
                                font-weight: 600;
                                line-height: 1.25;
                                letter-spacing: -0.28px;
                                margin-top: 1.25rem;
                                margin-bottom: 0.4rem;
                                color: #1d1d1f;
                            }
                            .tiptap h3 {
                                font-size: 19px;
                                font-weight: 600;
                                line-height: 1.3;
                                letter-spacing: -0.224px;
                                margin-top: 1rem;
                                margin-bottom: 0.3rem;
                                color: #1d1d1f;
                            }
                            .tiptap ul:not([data-type="taskList"]) {
                                list-style-type: disc;
                                padding-left: 1.5rem;
                                margin: 0.5rem 0;
                            }
                            .tiptap ol {
                                list-style-type: decimal;
                                padding-left: 1.5rem;
                                margin: 0.5rem 0;
                            }
                            .tiptap li {
                                margin: 0.25rem 0;
                                line-height: 1.47;
                            }
                            .tiptap ul[data-type="taskList"] {
                                list-style: none;
                                padding-left: 0;
                                margin: 0.5rem 0;
                            }
                            .tiptap ul[data-type="taskList"] li {
                                display: flex;
                                align-items: flex-start;
                                gap: 0.6rem;
                                margin: 0.35rem 0;
                            }
                            .tiptap ul[data-type="taskList"] li > label {
                                user-select: none;
                                margin-top: 0.25rem;
                                cursor: pointer;
                            }
                            .tiptap ul[data-type="taskList"] li > label input[type="checkbox"] {
                                cursor: pointer;
                                width: 1.05rem;
                                height: 1.05rem;
                                border-radius: 4px;
                                accent-color: #0066cc;
                            }
                            .tiptap ul[data-type="taskList"] li > div {
                                flex: 1;
                            }
                            .tiptap ul[data-type="taskList"] li[data-checked="true"] > div {
                                text-decoration: line-through;
                                color: #7a7a7a;
                            }
                            .tiptap hr {
                                border: none;
                                border-top: 1px solid #e0e0e0;
                                margin: 1.75rem 0;
                            }
                            .tiptap blockquote {
                                border-left: 3px solid #0066cc;
                                padding-left: 1rem;
                                margin: 1rem 0;
                                color: #7a7a7a;
                                font-style: italic;
                            }
                            .tiptap code {
                                background: #fafafc;
                                border: 1px solid #e0e0e0;
                                padding: 0.15rem 0.35rem;
                                border-radius: 5px;
                                font-size: 0.9em;
                                font-family: "JetBrains Mono", "Cascadia Code", monospace;
                            }
                        `}</style>

                        {/* Centered Document Page Sheet — Elevated with design.md single shadow */}
                        <div
                            style={{
                                fontFamily,
                                fontSize: `${fontSize}px`,
                            }}
                            className="w-full max-w-[816px] min-h-[1056px] bg-canvas text-ink border border-hairline shadow-[3px_5px_30px_0_rgba(0,0,0,0.22)] rounded-sm px-10 sm:px-16 py-14 cursor-text select-text transition-shadow"
                        >
                            <EditorContent editor={tiptap} />
                        </div>
                    </div>
                </div>

                {/* === FOOTER / STATUS BAR (Matching NotesApp) === */}
                <footer className="flex shrink-0 items-center justify-between border-t border-hairline bg-canvas px-3 text-[12px] text-ink-muted select-none" style={{ height: '24px' }}>
                    <div className="flex items-center gap-3">
                        <span>{metrics.words} words</span>
                        <span>·</span>
                        <span>{metrics.chars} characters</span>
                        <span>·</span>
                        <span>Page 1 of 1</span>
                    </div>

                    {inlineLinks.length > 0 && (
                        <div className="flex items-center gap-1.5 overflow-hidden">
                            <span className="text-[11px] text-ink-muted">Links:</span>
                            {inlineLinks.slice(0, 3).map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[11px] text-primary hover:underline"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    )}
                </footer>
            </div>

            {/* Template Picker Modal (Light variant per design.md) */}
            {isTemplatePickerOpen && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-2xl rounded-lg border border-hairline bg-canvas p-2 shadow-[0_12px_40px_rgba(0,0,0,0.25)]">
                        <TemplatePicker
                            appLabel="Docs"
                            variant="light"
                            templates={editor.templates}
                            onClose={() => setTemplatePickerOpen(false)}
                            onSelect={(templateId) => {
                                editor.createRecord(templateId)
                                setTemplatePickerOpen(false)
                            }}
                        />
                    </div>
                </div>
            )}
        </Window>
    )
}
