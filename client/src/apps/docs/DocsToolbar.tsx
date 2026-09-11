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
    { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
    { label: 'Roboto', value: '"Roboto", sans-serif' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
    { label: 'Courier New', value: '"Courier New", Courier, monospace' },
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
        if (!editor) return 'Normal text'
        if (editor.isActive('heading', { level: 1 })) return 'Heading 1'
        if (editor.isActive('heading', { level: 2 })) return 'Heading 2'
        if (editor.isActive('heading', { level: 3 })) return 'Heading 3'
        return 'Normal text'
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
        <div className="flex flex-wrap items-center gap-1 border-b border-white/10 bg-tile-2/80 px-3 py-1.5 backdrop-blur-sm">
            {/* History actions */}
            <button
                type="button"
                title="Undo (Ctrl+Z)"
                disabled={!editor.can().undo()}
                onClick={() => editor.chain().focus().undo().run()}
                className="rounded p-1 text-on-dark-muted transition-colors hover:bg-white/10 hover:text-on-dark disabled:opacity-40"
            >
                <Undo2 className="h-4 w-4" />
            </button>
            <button
                type="button"
                title="Redo (Ctrl+Y)"
                disabled={!editor.can().redo()}
                onClick={() => editor.chain().focus().redo().run()}
                className="rounded p-1 text-on-dark-muted transition-colors hover:bg-white/10 hover:text-on-dark disabled:opacity-40"
            >
                <Redo2 className="h-4 w-4" />
            </button>
            {onPrint && (
                <button
                    type="button"
                    title="Print document (Ctrl+P)"
                    onClick={onPrint}
                    className="rounded p-1 text-on-dark-muted transition-colors hover:bg-white/10 hover:text-on-dark"
                >
                    <Printer className="h-4 w-4" />
                </button>
            )}

            <div className="mx-1 h-4 w-px bg-white/15" />

            {/* Paragraph / Heading Styles Dropdown */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => {
                        setStyleOpen((prev) => !prev)
                        setFontOpen(false)
                    }}
                    className="flex h-7 items-center gap-1.5 rounded px-2 text-xs font-medium text-on-dark transition-colors hover:bg-white/10"
                >
                    <span>{getCurrentStyleLabel()}</span>
                    <ChevronDown className="h-3 w-3 text-on-dark-muted" />
                </button>
                {isStyleOpen && (
                    <div className="absolute left-0 top-full z-50 mt-1 w-36 rounded-md border border-white/10 bg-tile-2 py-1 shadow-xl">
                        <button
                            type="button"
                            onClick={() => {
                                editor.chain().focus().setParagraph().run()
                                setStyleOpen(false)
                            }}
                            className={`w-full px-3 py-1.5 text-left text-xs ${editor.isActive('paragraph') ? 'bg-primary-on-dark/20 text-primary-on-dark font-medium' : 'text-on-dark hover:bg-white/10'}`}
                        >
                            Normal text
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                editor.chain().focus().toggleHeading({ level: 1 }).run()
                                setStyleOpen(false)
                            }}
                            className={`w-full px-3 py-1.5 text-left text-sm font-bold ${editor.isActive('heading', { level: 1 }) ? 'bg-primary-on-dark/20 text-primary-on-dark' : 'text-on-dark hover:bg-white/10'}`}
                        >
                            Heading 1
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                editor.chain().focus().toggleHeading({ level: 2 }).run()
                                setStyleOpen(false)
                            }}
                            className={`w-full px-3 py-1.5 text-left text-xs font-semibold ${editor.isActive('heading', { level: 2 }) ? 'bg-primary-on-dark/20 text-primary-on-dark' : 'text-on-dark hover:bg-white/10'}`}
                        >
                            Heading 2
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                editor.chain().focus().toggleHeading({ level: 3 }).run()
                                setStyleOpen(false)
                            }}
                            className={`w-full px-3 py-1.5 text-left text-xs font-medium ${editor.isActive('heading', { level: 3 }) ? 'bg-primary-on-dark/20 text-primary-on-dark' : 'text-on-dark hover:bg-white/10'}`}
                        >
                            Heading 3
                        </button>
                    </div>
                )}
            </div>

            <div className="mx-1 h-4 w-px bg-white/15" />

            {/* Font Family selector */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => {
                        setFontOpen((prev) => !prev)
                        setStyleOpen(false)
                    }}
                    className="flex h-7 items-center gap-1.5 rounded px-2 text-xs font-medium text-on-dark transition-colors hover:bg-white/10"
                >
                    <span>{FONT_OPTIONS.find((f) => f.value === fontFamily)?.label || 'Arial'}</span>
                    <ChevronDown className="h-3 w-3 text-on-dark-muted" />
                </button>
                {isFontOpen && (
                    <div className="absolute left-0 top-full z-50 mt-1 w-40 rounded-md border border-white/10 bg-tile-2 py-1 shadow-xl">
                        {FONT_OPTIONS.map((f) => (
                            <button
                                key={f.label}
                                type="button"
                                style={{ fontFamily: f.value }}
                                onClick={() => {
                                    onFontFamilyChange(f.value)
                                    setFontOpen(false)
                                }}
                                className={`w-full px-3 py-1.5 text-left text-xs ${fontFamily === f.value ? 'bg-primary-on-dark/20 text-primary-on-dark font-medium' : 'text-on-dark hover:bg-white/10'}`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="mx-1 h-4 w-px bg-white/15" />

            {/* Font Size Stepper */}
            <div className="flex items-center gap-0.5 rounded bg-tile-1 px-1 py-0.5">
                <button
                    type="button"
                    title="Decrease font size"
                    onClick={() => onFontSizeChange(Math.max(9, fontSize - 1))}
                    className="rounded p-0.5 text-on-dark-muted hover:bg-white/10 hover:text-on-dark"
                >
                    <Minus className="h-3 w-3" />
                </button>
                <span className="min-w-[1.5rem] text-center text-xs font-medium text-on-dark">
                    {fontSize}
                </span>
                <button
                    type="button"
                    title="Increase font size"
                    onClick={() => onFontSizeChange(Math.min(32, fontSize + 1))}
                    className="rounded p-0.5 text-on-dark-muted hover:bg-white/10 hover:text-on-dark"
                >
                    <Plus className="h-3 w-3" />
                </button>
            </div>

            <div className="mx-1 h-4 w-px bg-white/15" />

            {/* Formatting buttons */}
            <button
                type="button"
                title="Bold (Ctrl+B)"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`rounded p-1.5 transition-colors ${editor.isActive('bold') ? 'bg-primary-on-dark/25 text-primary-on-dark' : 'text-on-dark-muted hover:bg-white/10 hover:text-on-dark'}`}
            >
                <Bold className="h-3.5 w-3.5" />
            </button>
            <button
                type="button"
                title="Italic (Ctrl+I)"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`rounded p-1.5 transition-colors ${editor.isActive('italic') ? 'bg-primary-on-dark/25 text-primary-on-dark' : 'text-on-dark-muted hover:bg-white/10 hover:text-on-dark'}`}
            >
                <Italic className="h-3.5 w-3.5" />
            </button>
            <button
                type="button"
                title="Underline (Ctrl+U)"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`rounded p-1.5 transition-colors ${editor.isActive('underline') ? 'bg-primary-on-dark/25 text-primary-on-dark' : 'text-on-dark-muted hover:bg-white/10 hover:text-on-dark'}`}
            >
                <UnderlineIcon className="h-3.5 w-3.5" />
            </button>
            <button
                type="button"
                title="Strikethrough"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`rounded p-1.5 transition-colors ${editor.isActive('strike') ? 'bg-primary-on-dark/25 text-primary-on-dark' : 'text-on-dark-muted hover:bg-white/10 hover:text-on-dark'}`}
            >
                <Strikethrough className="h-3.5 w-3.5" />
            </button>
            <button
                type="button"
                title="Inline code"
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={`rounded p-1.5 transition-colors ${editor.isActive('code') ? 'bg-primary-on-dark/25 text-primary-on-dark' : 'text-on-dark-muted hover:bg-white/10 hover:text-on-dark'}`}
            >
                <Code className="h-3.5 w-3.5" />
            </button>

            <div className="mx-1 h-4 w-px bg-white/15" />

            {/* Link */}
            <button
                type="button"
                title="Insert link (Ctrl+K)"
                onClick={handleApplyLink}
                className={`rounded p-1.5 transition-colors ${editor.isActive('link') ? 'bg-primary-on-dark/25 text-primary-on-dark' : 'text-on-dark-muted hover:bg-white/10 hover:text-on-dark'}`}
            >
                <Link2 className="h-3.5 w-3.5" />
            </button>

            <div className="mx-1 h-4 w-px bg-white/15" />

            {/* Alignment */}
            <button
                type="button"
                title="Align left"
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={`rounded p-1.5 transition-colors ${editor.isActive({ textAlign: 'left' }) ? 'bg-primary-on-dark/25 text-primary-on-dark' : 'text-on-dark-muted hover:bg-white/10 hover:text-on-dark'}`}
            >
                <AlignLeft className="h-3.5 w-3.5" />
            </button>
            <button
                type="button"
                title="Align center"
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={`rounded p-1.5 transition-colors ${editor.isActive({ textAlign: 'center' }) ? 'bg-primary-on-dark/25 text-primary-on-dark' : 'text-on-dark-muted hover:bg-white/10 hover:text-on-dark'}`}
            >
                <AlignCenter className="h-3.5 w-3.5" />
            </button>
            <button
                type="button"
                title="Align right"
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={`rounded p-1.5 transition-colors ${editor.isActive({ textAlign: 'right' }) ? 'bg-primary-on-dark/25 text-primary-on-dark' : 'text-on-dark-muted hover:bg-white/10 hover:text-on-dark'}`}
            >
                <AlignRight className="h-3.5 w-3.5" />
            </button>
            <button
                type="button"
                title="Justify"
                onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                className={`rounded p-1.5 transition-colors ${editor.isActive({ textAlign: 'justify' }) ? 'bg-primary-on-dark/25 text-primary-on-dark' : 'text-on-dark-muted hover:bg-white/10 hover:text-on-dark'}`}
            >
                <AlignJustify className="h-3.5 w-3.5" />
            </button>

            <div className="mx-1 h-4 w-px bg-white/15" />

            {/* Lists */}
            <button
                type="button"
                title="Checklist / Task list"
                onClick={() => editor.chain().focus().toggleTaskList().run()}
                className={`rounded p-1.5 transition-colors ${editor.isActive('taskList') ? 'bg-primary-on-dark/25 text-primary-on-dark' : 'text-on-dark-muted hover:bg-white/10 hover:text-on-dark'}`}
            >
                <CheckSquare className="h-3.5 w-3.5" />
            </button>
            <button
                type="button"
                title="Bulleted list"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`rounded p-1.5 transition-colors ${editor.isActive('bulletList') ? 'bg-primary-on-dark/25 text-primary-on-dark' : 'text-on-dark-muted hover:bg-white/10 hover:text-on-dark'}`}
            >
                <List className="h-3.5 w-3.5" />
            </button>
            <button
                type="button"
                title="Numbered list"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`rounded p-1.5 transition-colors ${editor.isActive('orderedList') ? 'bg-primary-on-dark/25 text-primary-on-dark' : 'text-on-dark-muted hover:bg-white/10 hover:text-on-dark'}`}
            >
                <ListOrdered className="h-3.5 w-3.5" />
            </button>

            <div className="mx-1 h-4 w-px bg-white/15" />

            {/* Clear Formatting */}
            <button
                type="button"
                title="Clear formatting"
                onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
                className="rounded p-1.5 text-on-dark-muted transition-colors hover:bg-white/10 hover:text-on-dark"
            >
                <RemoveFormatting className="h-3.5 w-3.5" />
            </button>
        </div>
    )
}
