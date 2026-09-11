import type { Editor } from '@tiptap/react'
import '@tiptap/starter-kit'
import '@tiptap/extension-underline'
import '@tiptap/extension-text-align'
import '@tiptap/extension-link'
import '@tiptap/extension-task-list'
import '@tiptap/extension-task-item'
import {
    AlignCenter,
    AlignJustify,
    AlignLeft,
    AlignRight,
    Bold,
    CheckSquare,
    ChevronDown,
    Code,
    Italic,
    Link2,
    List,
    ListOrdered,
    Minus,
    Plus,
    Printer,
    Redo2,
    RemoveFormatting,
    Strikethrough,
    Underline as UnderlineIcon,
    Undo2,
} from 'lucide-react'
import { useCallback, useState } from 'react'

interface DocsToolbarProps {
    editor: Editor | null
    fontFamily: string
    fontSize: number
    onFontFamilyChange: (font: string) => void
    onFontSizeChange: (size: number) => void
    onPrint?: () => void
}

const FONT_OPTIONS = [
    { label: 'System (SF Pro)', value: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", system-ui, sans-serif' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
    { label: 'Monospace', value: '"JetBrains Mono", "Cascadia Code", "Fira Code", monospace' },
]

export default function DocsToolbar({
    editor,
    fontFamily,
    fontSize,
    onFontFamilyChange,
    onFontSizeChange,
    onPrint,
}: DocsToolbarProps) {
    const [isStyleOpen, setStyleOpen] = useState(false)
    const [isFontOpen, setFontOpen] = useState(false)

    const getCurrentStyleLabel = useCallback(() => {
        if (!editor) return 'Body'
        if (editor.isActive('heading', { level: 1 })) return 'Title (H1)'
        if (editor.isActive('heading', { level: 2 })) return 'Section (H2)'
        if (editor.isActive('heading', { level: 3 })) return 'Subsection (H3)'
        return 'Body text'
    }, [editor])

    const handleApplyLink = useCallback(() => {
        if (!editor) return

        const previousUrl = editor.getAttributes('link').href || ''
        const url = window.prompt('URL link', previousUrl || 'https://')

        if (url === null) {
            return
        }

        if (url.trim() === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
            return
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run()
    }, [editor])

    if (!editor) {
        return null
    }

    return (
        <div className="flex flex-wrap items-center gap-0.5 border-b border-hairline bg-canvas px-2 py-1 text-ink">
            {/* History actions */}
            <button
                type="button"
                title="Undo (Ctrl+Z)"
                disabled={!editor.can().undo()}
                onClick={() => editor.chain().focus().undo().run()}
                className="rounded-sm p-1.5 text-ink-muted transition-colors hover:bg-canvas-elevated hover:text-ink active:scale-95 disabled:pointer-events-none disabled:opacity-30"
            >
                <Undo2 className="h-3.5 w-3.5" />
            </button>
            <button
                type="button"
                title="Redo (Ctrl+Y)"
                disabled={!editor.can().redo()}
                onClick={() => editor.chain().focus().redo().run()}
                className="rounded-sm p-1.5 text-ink-muted transition-colors hover:bg-canvas-elevated hover:text-ink active:scale-95 disabled:pointer-events-none disabled:opacity-30"
            >
                <Redo2 className="h-3.5 w-3.5" />
            </button>
            {onPrint && (
                <button
                    type="button"
                    title="Print document (Ctrl+P)"
                    onClick={onPrint}
                    className="rounded-sm p-1.5 text-ink-muted transition-colors hover:bg-canvas-elevated hover:text-ink active:scale-95"
                >
                    <Printer className="h-3.5 w-3.5" />
                </button>
            )}

            <div className="mx-1 h-4 w-px bg-hairline" />

            {/* Paragraph / Heading Styles Dropdown */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => {
                        setStyleOpen((prev) => !prev)
                        setFontOpen(false)
                    }}
                    className="flex h-7 items-center gap-1.5 rounded-sm border border-hairline bg-canvas px-2 text-[12px] font-normal text-ink transition-colors hover:bg-canvas-elevated active:scale-95"
                >
                    <span>{getCurrentStyleLabel()}</span>
                    <ChevronDown className="h-3 w-3 text-ink-muted" />
                </button>
                {isStyleOpen && (
                    <div
                        className="absolute left-0 top-full z-50 mt-1 min-w-[160px] rounded-sm border border-hairline bg-canvas py-1 shadow-[0_4px_16px_rgba(0,0,0,0.14)]"
                        onMouseLeave={() => setStyleOpen(false)}
                    >
                        <button
                            type="button"
                            onClick={() => {
                                editor.chain().focus().setParagraph().run()
                                setStyleOpen(false)
                            }}
                            className={`flex w-full items-center px-3 py-1.5 text-left text-[13px] transition-colors ${
                                editor.isActive('paragraph')
                                    ? 'bg-primary text-white font-medium'
                                    : 'text-ink hover:bg-primary hover:text-white'
                            }`}
                        >
                            Body text
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                editor.chain().focus().toggleHeading({ level: 1 }).run()
                                setStyleOpen(false)
                            }}
                            className={`flex w-full items-center px-3 py-1.5 text-left text-[14px] font-semibold transition-colors ${
                                editor.isActive('heading', { level: 1 })
                                    ? 'bg-primary text-white'
                                    : 'text-ink hover:bg-primary hover:text-white'
                            }`}
                        >
                            Title (Heading 1)
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                editor.chain().focus().toggleHeading({ level: 2 }).run()
                                setStyleOpen(false)
                            }}
                            className={`flex w-full items-center px-3 py-1.5 text-left text-[13px] font-semibold transition-colors ${
                                editor.isActive('heading', { level: 2 })
                                    ? 'bg-primary text-white'
                                    : 'text-ink hover:bg-primary hover:text-white'
                            }`}
                        >
                            Section (Heading 2)
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                editor.chain().focus().toggleHeading({ level: 3 }).run()
                                setStyleOpen(false)
                            }}
                            className={`flex w-full items-center px-3 py-1.5 text-left text-[13px] font-medium transition-colors ${
                                editor.isActive('heading', { level: 3 })
                                    ? 'bg-primary text-white'
                                    : 'text-ink hover:bg-primary hover:text-white'
                            }`}
                        >
                            Subsection (Heading 3)
                        </button>
                    </div>
                )}
            </div>

            <div className="mx-1 h-4 w-px bg-hairline" />

            {/* Font Family selector */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => {
                        setFontOpen((prev) => !prev)
                        setStyleOpen(false)
                    }}
                    className="flex h-7 items-center gap-1.5 rounded-sm border border-hairline bg-canvas px-2 text-[12px] font-normal text-ink transition-colors hover:bg-canvas-elevated active:scale-95"
                >
                    <span>{FONT_OPTIONS.find((f) => f.value === fontFamily)?.label || 'System'}</span>
                    <ChevronDown className="h-3 w-3 text-ink-muted" />
                </button>
                {isFontOpen && (
                    <div
                        className="absolute left-0 top-full z-50 mt-1 min-w-[180px] rounded-sm border border-hairline bg-canvas py-1 shadow-[0_4px_16px_rgba(0,0,0,0.14)]"
                        onMouseLeave={() => setFontOpen(false)}
                    >
                        {FONT_OPTIONS.map((f) => (
                            <button
                                key={f.label}
                                type="button"
                                style={{ fontFamily: f.value }}
                                onClick={() => {
                                    onFontFamilyChange(f.value)
                                    setFontOpen(false)
                                }}
                                className={`flex w-full items-center px-3 py-1.5 text-left text-[13px] transition-colors ${
                                    fontFamily === f.value
                                        ? 'bg-primary text-white font-medium'
                                        : 'text-ink hover:bg-primary hover:text-white'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="mx-1 h-4 w-px bg-hairline" />

            {/* Font Size Stepper */}
            <div className="flex items-center gap-0.5 rounded-sm border border-hairline bg-canvas px-1 py-0.5">
                <button
                    type="button"
                    title="Decrease font size"
                    onClick={() => onFontSizeChange(Math.max(12, fontSize - 1))}
                    className="rounded-sm p-0.5 text-ink-muted hover:bg-canvas-elevated hover:text-ink active:scale-95"
                >
                    <Minus className="h-3 w-3" />
                </button>
                <span className="min-w-[1.75rem] text-center text-[12px] font-normal text-ink">
                    {fontSize}
                </span>
                <button
                    type="button"
                    title="Increase font size"
                    onClick={() => onFontSizeChange(Math.min(32, fontSize + 1))}
                    className="rounded-sm p-0.5 text-ink-muted hover:bg-canvas-elevated hover:text-ink active:scale-95"
                >
                    <Plus className="h-3 w-3" />
                </button>
            </div>

            <div className="mx-1 h-4 w-px bg-hairline" />

            {/* Formatting buttons */}
            <button
                type="button"
                title="Bold (Ctrl+B)"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`rounded-sm p-1.5 transition-colors active:scale-95 ${
                    editor.isActive('bold')
                        ? 'bg-primary text-white'
                        : 'text-ink-muted hover:bg-canvas-elevated hover:text-ink'
                }`}
            >
                <Bold className="h-3.5 w-3.5" />
            </button>
            <button
                type="button"
                title="Italic (Ctrl+I)"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`rounded-sm p-1.5 transition-colors active:scale-95 ${
                    editor.isActive('italic')
                        ? 'bg-primary text-white'
                        : 'text-ink-muted hover:bg-canvas-elevated hover:text-ink'
                }`}
            >
                <Italic className="h-3.5 w-3.5" />
            </button>
            <button
                type="button"
                title="Underline (Ctrl+U)"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`rounded-sm p-1.5 transition-colors active:scale-95 ${
                    editor.isActive('underline')
                        ? 'bg-primary text-white'
                        : 'text-ink-muted hover:bg-canvas-elevated hover:text-ink'
                }`}
            >
                <UnderlineIcon className="h-3.5 w-3.5" />
            </button>
            <button
                type="button"
                title="Strikethrough"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`rounded-sm p-1.5 transition-colors active:scale-95 ${
                    editor.isActive('strike')
                        ? 'bg-primary text-white'
                        : 'text-ink-muted hover:bg-canvas-elevated hover:text-ink'
                }`}
            >
                <Strikethrough className="h-3.5 w-3.5" />
            </button>
            <button
                type="button"
                title="Inline code"
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={`rounded-sm p-1.5 transition-colors active:scale-95 ${
                    editor.isActive('code')
                        ? 'bg-primary text-white'
                        : 'text-ink-muted hover:bg-canvas-elevated hover:text-ink'
                }`}
            >
                <Code className="h-3.5 w-3.5" />
            </button>

            <div className="mx-1 h-4 w-px bg-hairline" />

            {/* Link */}
            <button
                type="button"
                title="Insert link (Ctrl+K)"
                onClick={handleApplyLink}
                className={`rounded-sm p-1.5 transition-colors active:scale-95 ${
                    editor.isActive('link')
                        ? 'bg-primary text-white'
                        : 'text-ink-muted hover:bg-canvas-elevated hover:text-ink'
                }`}
            >
                <Link2 className="h-3.5 w-3.5" />
            </button>

            <div className="mx-1 h-4 w-px bg-hairline" />

            {/* Alignment */}
            <button
                type="button"
                title="Align left"
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={`rounded-sm p-1.5 transition-colors active:scale-95 ${
                    editor.isActive({ textAlign: 'left' })
                        ? 'bg-primary text-white'
                        : 'text-ink-muted hover:bg-canvas-elevated hover:text-ink'
                }`}
            >
                <AlignLeft className="h-3.5 w-3.5" />
            </button>
            <button
                type="button"
                title="Align center"
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={`rounded-sm p-1.5 transition-colors active:scale-95 ${
                    editor.isActive({ textAlign: 'center' })
                        ? 'bg-primary text-white'
                        : 'text-ink-muted hover:bg-canvas-elevated hover:text-ink'
                }`}
            >
                <AlignCenter className="h-3.5 w-3.5" />
            </button>
            <button
                type="button"
                title="Align right"
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={`rounded-sm p-1.5 transition-colors active:scale-95 ${
                    editor.isActive({ textAlign: 'right' })
                        ? 'bg-primary text-white'
                        : 'text-ink-muted hover:bg-canvas-elevated hover:text-ink'
                }`}
            >
                <AlignRight className="h-3.5 w-3.5" />
            </button>
            <button
                type="button"
                title="Justify"
                onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                className={`rounded-sm p-1.5 transition-colors active:scale-95 ${
                    editor.isActive({ textAlign: 'justify' })
                        ? 'bg-primary text-white'
                        : 'text-ink-muted hover:bg-canvas-elevated hover:text-ink'
                }`}
            >
                <AlignJustify className="h-3.5 w-3.5" />
            </button>

            <div className="mx-1 h-4 w-px bg-hairline" />

            {/* Lists */}
            <button
                type="button"
                title="Checklist / Task list"
                onClick={() => editor.chain().focus().toggleTaskList().run()}
                className={`rounded-sm p-1.5 transition-colors active:scale-95 ${
                    editor.isActive('taskList')
                        ? 'bg-primary text-white'
                        : 'text-ink-muted hover:bg-canvas-elevated hover:text-ink'
                }`}
            >
                <CheckSquare className="h-3.5 w-3.5" />
            </button>
            <button
                type="button"
                title="Bulleted list"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`rounded-sm p-1.5 transition-colors active:scale-95 ${
                    editor.isActive('bulletList')
                        ? 'bg-primary text-white'
                        : 'text-ink-muted hover:bg-canvas-elevated hover:text-ink'
                }`}
            >
                <List className="h-3.5 w-3.5" />
            </button>
            <button
                type="button"
                title="Numbered list"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`rounded-sm p-1.5 transition-colors active:scale-95 ${
                    editor.isActive('orderedList')
                        ? 'bg-primary text-white'
                        : 'text-ink-muted hover:bg-canvas-elevated hover:text-ink'
                }`}
            >
                <ListOrdered className="h-3.5 w-3.5" />
            </button>

            <div className="mx-1 h-4 w-px bg-hairline" />

            {/* Clear Formatting */}
            <button
                type="button"
                title="Clear formatting"
                onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
                className="rounded-sm p-1.5 text-ink-muted transition-colors hover:bg-canvas-elevated hover:text-ink active:scale-95"
            >
                <RemoveFormatting className="h-3.5 w-3.5" />
            </button>
        </div>
    )
}
