import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import {
    Check,
    Cloud,
    Download,
    FileText,
    Moon,
    PanelLeft,
    PanelLeftClose,
    Printer,
    Sparkles,
    Sun,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import Window from '../../components/system/Window'
import AttachmentPanel from '../productivity/components/AttachmentPanel'
import LinkedRecordsPanel from '../productivity/components/LinkedRecordsPanel'
import RecordListPane from '../productivity/components/RecordListPane'
import TemplatePicker from '../productivity/components/TemplatePicker'
import { useProductivityDeepLink } from '../productivity/hooks/useProductivityDeepLink'
import { useProductivityEditor } from '../productivity/hooks/useProductivityEditor'
import DocsToolbar from './DocsToolbar'
import {
    extractMarkdownLinks,
    htmlToMarkdown,
    markdownToHtml,
} from './documentModel'

export default function DocsApp({ id }: { id: string }) {
    const editorRef = useRef<HTMLDivElement>(null)
    const linksRef = useRef<HTMLDivElement>(null)
    const attachmentsRef = useRef<HTMLDivElement>(null)
    const [isTemplatePickerOpen, setTemplatePickerOpen] = useState(false)
    const [isSidebarOpen, setSidebarOpen] = useState(true)
    const [paperTheme, setPaperTheme] = useState<'white' | 'dark'>('white')
    const [fontFamily, setFontFamily] = useState('Arial, Helvetica, sans-serif')
    const [fontSize, setFontSize] = useState(11)
    const [activeMenu, setActiveMenu] = useState<'file' | 'edit' | 'view' | 'insert' | null>(null)

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
                    class: 'text-[#1a73e8] underline cursor-pointer hover:text-[#174ea6]',
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

    const handlePrint = () => {
        window.print()
    }

    const handleDownload = (format: 'md' | 'txt') => {
        const content = format === 'md' ? editor.body : editor.body.replace(/[#*`_~[\]]/g, '')
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${editor.title.trim() || 'Untitled document'}.${format}`
        a.click()
        URL.revokeObjectURL(url)
        setActiveMenu(null)
    }

    return (
        <Window id={id} title="Docs">
            <div className="flex h-full flex-col bg-tile-1 text-on-dark md:flex-row">
                {/* Collapsible Sidebar for Document List & Metadata */}
                {isSidebarOpen && (
                    <aside className="flex w-full flex-col border-r border-white/10 md:w-64 lg:w-72">
                        <RecordListPane
                            label="Documents"
                            records={editor.records}
                            activeId={editor.activeId}
                            onCreate={editor.createRecord}
                            onOpenTemplates={() => setTemplatePickerOpen((open) => !open)}
                            onSelect={editor.selectRecord}
                        />
                        <div className="flex-1 space-y-3 overflow-y-auto p-3">
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
                    </aside>
                )}

                {/* Main Google Docs Editor Area */}
                <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-tile-1" onClick={() => setActiveMenu(null)}>
                    {/* Google Docs Top Header Bar */}
                    <header
                        className="flex flex-wrap items-center justify-between border-b border-white/10 bg-tile-2 px-3 py-2"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                title={isSidebarOpen ? 'Hide document sidebar' : 'Show document sidebar'}
                                onClick={() => setSidebarOpen((prev) => !prev)}
                                className="rounded p-1.5 text-on-dark-muted transition-colors hover:bg-white/10 hover:text-on-dark"
                            >
                                {isSidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
                            </button>

                            {/* Google Docs Icon */}
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4285F4] text-white shadow-sm">
                                <FileText className="h-5 w-5" />
                            </div>

                            {/* Document Title & Menus */}
                            <div className="flex flex-col">
                                <input
                                    value={editor.title}
                                    onChange={(event) => editor.setTitle(event.target.value)}
                                    placeholder="Untitled document"
                                    className="max-w-[260px] rounded px-1.5 py-0.5 text-sm font-medium text-on-dark outline-none transition hover:bg-white/10 focus:bg-white/10 focus:ring-1 focus:ring-primary-on-dark sm:max-w-md"
                                />
                                {/* Classic Google Docs Menus */}
                                <div className="flex items-center gap-2 text-xs text-on-dark-muted">
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
                                            className="rounded px-1.5 py-0.5 hover:bg-white/10 hover:text-on-dark"
                                        >
                                            File
                                        </button>
                                        {activeMenu === 'file' && (
                                            <div className="absolute left-0 top-full z-50 mt-1 w-44 rounded-md border border-white/10 bg-tile-2 py-1 shadow-2xl">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        editor.createRecord()
                                                        setActiveMenu(null)
                                                    }}
                                                    className="w-full px-3 py-1.5 text-left hover:bg-white/10"
                                                >
                                                    New document
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setTemplatePickerOpen(true)
                                                        setActiveMenu(null)
                                                    }}
                                                    className="w-full px-3 py-1.5 text-left hover:bg-white/10"
                                                >
                                                    From template...
                                                </button>
                                                <div className="my-1 border-t border-white/10" />
                                                <button
                                                    type="button"
                                                    onClick={() => handleDownload('md')}
                                                    className="flex w-full items-center justify-between px-3 py-1.5 text-left hover:bg-white/10"
                                                >
                                                    <span>Download (.md)</span>
                                                    <Download className="h-3 w-3 text-on-dark-muted" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDownload('txt')}
                                                    className="flex w-full items-center justify-between px-3 py-1.5 text-left hover:bg-white/10"
                                                >
                                                    <span>Download (.txt)</span>
                                                    <Download className="h-3 w-3 text-on-dark-muted" />
                                                </button>
                                                <div className="my-1 border-t border-white/10" />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        handlePrint()
                                                        setActiveMenu(null)
                                                    }}
                                                    className="flex w-full items-center justify-between px-3 py-1.5 text-left hover:bg-white/10"
                                                >
                                                    <span>Print</span>
                                                    <Printer className="h-3 w-3 text-on-dark-muted" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setActiveMenu(activeMenu === 'edit' ? null : 'edit')}
                                            className="rounded px-1.5 py-0.5 hover:bg-white/10 hover:text-on-dark"
                                        >
                                            Edit
                                        </button>
                                        {activeMenu === 'edit' && (
                                            <div className="absolute left-0 top-full z-50 mt-1 w-36 rounded-md border border-white/10 bg-tile-2 py-1 shadow-2xl">
                                                <button
                                                    type="button"
                                                    disabled={!tiptap?.can().undo()}
                                                    onClick={() => {
                                                        tiptap?.chain().focus().undo().run()
                                                        setActiveMenu(null)
                                                    }}
                                                    className="w-full px-3 py-1.5 text-left hover:bg-white/10 disabled:opacity-40"
                                                >
                                                    Undo
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={!tiptap?.can().redo()}
                                                    onClick={() => {
                                                        tiptap?.chain().focus().redo().run()
                                                        setActiveMenu(null)
                                                    }}
                                                    className="w-full px-3 py-1.5 text-left hover:bg-white/10 disabled:opacity-40"
                                                >
                                                    Redo
                                                </button>
                                                <div className="my-1 border-t border-white/10" />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        tiptap?.chain().focus().selectAll().run()
                                                        setActiveMenu(null)
                                                    }}
                                                    className="w-full px-3 py-1.5 text-left hover:bg-white/10"
                                                >
                                                    Select all
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        tiptap?.chain().focus().clearNodes().unsetAllMarks().run()
                                                        setActiveMenu(null)
                                                    }}
                                                    className="w-full px-3 py-1.5 text-left hover:bg-white/10"
                                                >
                                                    Clear format
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setActiveMenu(activeMenu === 'view' ? null : 'view')}
                                            className="rounded px-1.5 py-0.5 hover:bg-white/10 hover:text-on-dark"
                                        >
                                            View
                                        </button>
                                        {activeMenu === 'view' && (
                                            <div className="absolute left-0 top-full z-50 mt-1 w-44 rounded-md border border-white/10 bg-tile-2 py-1 shadow-2xl">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSidebarOpen((prev) => !prev)
                                                        setActiveMenu(null)
                                                    }}
                                                    className="w-full px-3 py-1.5 text-left hover:bg-white/10"
                                                >
                                                    {isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setPaperTheme((curr) => (curr === 'white' ? 'dark' : 'white'))
                                                        setActiveMenu(null)
                                                    }}
                                                    className="w-full px-3 py-1.5 text-left hover:bg-white/10"
                                                >
                                                    Paper: {paperTheme === 'white' ? 'Switch to Dark' : 'Switch to White'}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setActiveMenu(activeMenu === 'insert' ? null : 'insert')}
                                            className="rounded px-1.5 py-0.5 hover:bg-white/10 hover:text-on-dark"
                                        >
                                            Insert
                                        </button>
                                        {activeMenu === 'insert' && (
                                            <div className="absolute left-0 top-full z-50 mt-1 w-40 rounded-md border border-white/10 bg-tile-2 py-1 shadow-2xl">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const url = window.prompt('URL link', 'https://')
                                                        if (url) tiptap?.chain().focus().setLink({ href: url }).run()
                                                        setActiveMenu(null)
                                                    }}
                                                    className="w-full px-3 py-1.5 text-left hover:bg-white/10"
                                                >
                                                    Link
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        tiptap?.chain().focus().setHorizontalRule().run()
                                                        setActiveMenu(null)
                                                    }}
                                                    className="w-full px-3 py-1.5 text-left hover:bg-white/10"
                                                >
                                                    Horizontal line
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Save status & Right Actions */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 text-xs text-on-dark-muted">
                                <Cloud className="h-3.5 w-3.5 text-primary-on-dark" />
                                <span className="hidden sm:inline">
                                    {editor.statusLabel === 'Ready' ? 'Saved to Drive' : editor.statusLabel}
                                </span>
                                <Check className="h-3 w-3 text-emerald-400" />
                            </div>

                            <button
                                type="button"
                                title="Toggle paper theme (Light / Dark)"
                                onClick={() => setPaperTheme((prev) => (prev === 'white' ? 'dark' : 'white'))}
                                className="rounded p-1.5 text-on-dark-muted transition hover:bg-white/10 hover:text-on-dark"
                            >
                                {paperTheme === 'white' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                            </button>

                            <button
                                type="button"
                                onClick={() => setTemplatePickerOpen((open) => !open)}
                                className="flex items-center gap-1.5 rounded-md border border-primary-on-dark/30 bg-primary-on-dark/10 px-2.5 py-1 text-xs font-medium text-primary-on-dark transition hover:bg-primary-on-dark/20"
                            >
                                <Sparkles className="h-3.5 w-3.5" />
                                <span>Templates</span>
                            </button>
                        </div>
                    </header>

                    {/* Google Docs Ribbon Toolbar */}
                    <DocsToolbar
                        editor={tiptap}
                        fontFamily={fontFamily}
                        fontSize={fontSize}
                        onFontFamilyChange={setFontFamily}
                        onFontSizeChange={setFontSize}
                        onPrint={handlePrint}
                    />

                    {/* Editor Canvas: Neutral Desk with Centered Paper Page */}
                    <div
                        ref={editorRef}
                        className="relative flex min-h-0 flex-1 justify-center overflow-y-auto bg-[#141517] p-4 sm:p-8"
                        onClick={() => tiptap?.chain().focus().run()}
                    >
                        <style>{`
                            .tiptap {
                                outline: none;
                                min-height: 800px;
                            }
                            .tiptap p {
                                margin: 0.35rem 0;
                                line-height: 1.6;
                            }
                            .tiptap h1 {
                                font-size: 2.15rem;
                                font-weight: 700;
                                margin-top: 1.5rem;
                                margin-bottom: 0.5rem;
                                line-height: 1.25;
                            }
                            .tiptap h2 {
                                font-size: 1.55rem;
                                font-weight: 600;
                                margin-top: 1.25rem;
                                margin-bottom: 0.4rem;
                                line-height: 1.3;
                            }
                            .tiptap h3 {
                                font-size: 1.25rem;
                                font-weight: 600;
                                margin-top: 1rem;
                                margin-bottom: 0.3rem;
                                line-height: 1.4;
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
                                margin: 0.2rem 0;
                            }
                            .tiptap ul[data-type="taskList"] {
                                list-style: none;
                                padding-left: 0;
                                margin: 0.5rem 0;
                            }
                            .tiptap ul[data-type="taskList"] li {
                                display: flex;
                                align-items: flex-start;
                                gap: 0.5rem;
                                margin: 0.25rem 0;
                            }
                            .tiptap ul[data-type="taskList"] li > label {
                                user-select: none;
                                margin-top: 0.2rem;
                                cursor: pointer;
                            }
                            .tiptap ul[data-type="taskList"] li > label input[type="checkbox"] {
                                cursor: pointer;
                                width: 1rem;
                                height: 1rem;
                                border-radius: 4px;
                            }
                            .tiptap ul[data-type="taskList"] li > div {
                                flex: 1;
                            }
                            .tiptap ul[data-type="taskList"] li[data-checked="true"] > div {
                                text-decoration: line-through;
                                opacity: 0.6;
                            }
                            .tiptap hr {
                                border: none;
                                border-top: 1px solid rgba(150, 150, 150, 0.3);
                                margin: 1.5rem 0;
                            }
                            .tiptap blockquote {
                                border-left: 3px solid #1a73e8;
                                padding-left: 1rem;
                                margin: 0.75rem 0;
                                font-style: italic;
                                opacity: 0.85;
                            }
                            .tiptap code {
                                background: rgba(125, 125, 125, 0.15);
                                padding: 0.15rem 0.35rem;
                                border-radius: 4px;
                                font-size: 0.9em;
                                font-family: monospace;
                            }
                        `}</style>

                        {/* Centered Realistic Document Sheet (Paper) */}
                        <div
                            style={{
                                fontFamily,
                                fontSize: `${fontSize}pt`,
                            }}
                            className={`w-full max-w-[816px] min-h-[1056px] ${
                                paperTheme === 'white'
                                    ? 'bg-white text-[#1f1f1f] shadow-[0_1px_3px_1px_rgba(0,0,0,0.25),0_1px_2px_0_rgba(0,0,0,0.40)]'
                                    : 'bg-tile-2 text-on-dark border border-white/10 shadow-2xl'
                            } cursor-text rounded-sm px-10 sm:px-16 py-14 transition-colors duration-200`}
                        >
                            <EditorContent editor={tiptap} />
                        </div>
                    </div>

                    {/* Google Docs Minimalist Footer / Status Bar */}
                    <footer className="flex flex-wrap items-center justify-between border-t border-white/10 bg-tile-2 px-4 py-1.5 text-xs text-on-dark-muted">
                        <div className="flex items-center gap-3">
                            <span>{metrics.words} words</span>
                            <span>•</span>
                            <span>{metrics.chars} characters</span>
                            <span>•</span>
                            <span>Page 1 of 1</span>
                        </div>

                        {inlineLinks.length > 0 && (
                            <div className="flex items-center gap-1.5 overflow-hidden">
                                <span className="text-[10px] uppercase tracking-wider text-on-dark-muted">Links:</span>
                                {inlineLinks.slice(0, 3).map((link) => (
                                    <a
                                        key={link.href}
                                        href={link.href}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="rounded bg-tile-1 px-1.5 py-0.5 text-[11px] text-primary-on-dark hover:underline"
                                    >
                                        {link.label}
                                    </a>
                                ))}
                            </div>
                        )}
                    </footer>
                </main>
            </div>

            {/* Template Picker Modal */}
            {isTemplatePickerOpen && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-lg rounded-xl border border-white/10 bg-tile-2 p-4 shadow-2xl">
                        <TemplatePicker
                            appLabel="Docs"
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
