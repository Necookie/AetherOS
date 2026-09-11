import {
    Fragment,
    useEffect,
    useRef,
    useState,
    type DragEvent,
    type KeyboardEvent,
    type ChangeEvent,
} from 'react'
import {
    ChevronDown,
    ChevronRight,
    Circle,
    CheckCircle2,
    GripVertical,
    LayoutList,
    Plus,
    Sparkles,
    Trash2,
    X,
} from 'lucide-react'
import Window from '../../components/system/Window'
import AttachmentPanel from '../productivity/components/AttachmentPanel'
import LinkedRecordsPanel from '../productivity/components/LinkedRecordsPanel'
import TemplatePicker from '../productivity/components/TemplatePicker'
import { useProductivityDeepLink } from '../productivity/hooks/useProductivityDeepLink'
import { useProductivityEditor } from '../productivity/hooks/useProductivityEditor'
import { createBoardTemplate, parseBoardState, type BoardState } from './boardModel'
import { addCardToColumn, findCardLocation, moveCard, reorderColumns, updateCardDescription } from './boardState'
import { safeRandomUUID } from '../../lib/uuid'

function nextId() {
    return safeRandomUUID().slice(0, 8)
}

type DragState =
    | { type: 'card'; cardId: string; sourceColumnId: string }
    | { type: 'column'; columnId: string }

// ─── Inline add-task form ───────────────────────────────────────────────────
function AddTaskRow({
    onAdd,
    onCancel,
}: {
    onAdd: (title: string) => void
    onCancel: () => void
}) {
    const [value, setValue] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    const commit = () => {
        const trimmed = value.trim()
        if (trimmed) onAdd(trimmed)
        else onCancel()
    }

    const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') commit()
        if (e.key === 'Escape') onCancel()
    }

    return (
        <div className="mx-2 mb-2 rounded-lg border border-primary-on-dark/40 bg-tile-2 p-2.5">
            <input
                ref={inputRef}
                value={value}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Task name…"
                className="w-full bg-transparent text-sm text-on-dark outline-none placeholder:text-on-dark-muted"
            />
            <div className="mt-2 flex items-center gap-2">
                <button
                    type="button"
                    onClick={commit}
                    className="rounded-md bg-primary-on-dark px-3 py-1 text-[12px] font-semibold text-white transition-opacity hover:opacity-90 active:scale-95"
                >
                    Add task
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-md px-2 py-1 text-[12px] text-on-dark-muted transition-colors hover:text-on-dark"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    )
}

// ─── Single task row ────────────────────────────────────────────────────────
interface TaskRowProps {
    title: string
    description: string
    isDragging: boolean
    isDropTarget: boolean
    onDragStart: (e: DragEvent<HTMLElement>) => void
    onDragEnd: () => void
    onDragOver: (e: DragEvent<HTMLDivElement>) => void
    onDrop: (e: DragEvent<HTMLDivElement>) => void
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => void
    onDescriptionChange: (v: string) => void
    onDelete: () => void
}

function TaskRow({
    title,
    description,
    isDragging,
    isDropTarget,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDrop,
    onKeyDown,
    onDescriptionChange,
    onDelete,
}: TaskRowProps) {
    const [done, setDone] = useState(false)
    const [expanded, setExpanded] = useState(false)

    return (
        <div
            onDragOver={onDragOver}
            onDrop={onDrop}
        >
            {/* drop zone above */}
            <div
                className={`mx-3 h-0.5 rounded-full transition-all ${
                    isDropTarget ? 'bg-primary-on-dark' : 'bg-transparent'
                }`}
            />

            <div
                className={`group mx-2 flex items-start gap-2 rounded-lg px-2 py-2 transition-colors ${
                    isDragging
                        ? 'opacity-40'
                        : 'hover:bg-tile-2'
                }`}
            >
                {/* Drag handle */}
                <button
                    type="button"
                    draggable
                    aria-label={`Move task: ${title}`}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    onKeyDown={onKeyDown}
                    className="mt-0.5 cursor-grab touch-none text-on-dark-muted opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 focus:outline-none active:cursor-grabbing"
                    title="Drag to reorder · Alt+↑↓←→"
                >
                    <GripVertical className="h-4 w-4" />
                </button>

                {/* Done checkbox */}
                <button
                    type="button"
                    onClick={() => setDone((d) => !d)}
                    className="mt-0.5 shrink-0 text-on-dark-muted transition-colors hover:text-primary-on-dark"
                    aria-label={done ? 'Mark undone' : 'Mark done'}
                >
                    {done ? (
                        <CheckCircle2 className="h-4 w-4 text-primary-on-dark" />
                    ) : (
                        <Circle className="h-4 w-4" />
                    )}
                </button>

                {/* Content */}
                <div className="min-w-0 flex-1">
                    <button
                        type="button"
                        onClick={() => setExpanded((e) => !e)}
                        className={`text-left text-sm leading-snug transition-colors ${
                            done
                                ? 'text-on-dark-muted line-through'
                                : 'text-on-dark'
                        }`}
                    >
                        {title}
                    </button>

                    {expanded && (
                        <textarea
                            value={description}
                            onChange={(e) => onDescriptionChange(e.target.value)}
                            placeholder="Add a description… Link with [[notes:id]] or [[boards:id]]"
                            className="mt-1.5 w-full resize-none rounded-md border border-white/10 bg-tile-1 p-2 text-xs text-on-dark outline-none placeholder:text-on-dark-muted focus:border-primary-on-dark"
                            rows={3}
                        />
                    )}
                </div>

                {/* Delete */}
                <button
                    type="button"
                    onClick={onDelete}
                    className="mt-0.5 shrink-0 text-on-dark-muted opacity-0 transition-opacity hover:text-ds-danger group-hover:opacity-100 focus:opacity-100"
                    aria-label={`Delete task: ${title}`}
                    title="Delete task"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    )
}

// ─── Main component ─────────────────────────────────────────────────────────
export default function BoardsApp({ id }: { id: string }) {
    const boardRef = useRef<HTMLElement>(null)
    const linksRef = useRef<HTMLDivElement>(null)
    const attachmentsRef = useRef<HTMLDivElement>(null)
    const [isTemplatePickerOpen, setTemplatePickerOpen] = useState(false)
    const [collapsedColumns, setCollapsedColumns] = useState<Set<string>>(new Set())
    const [addingToColumn, setAddingToColumn] = useState<string | null>(null)
    const [showMeta, setShowMeta] = useState(false)

    const editor = useProductivityEditor({ appId: 'boards' })
    const [board, setBoard] = useState<BoardState>(createBoardTemplate())
    const [dragState, setDragState] = useState<DragState | null>(null)
    const [cardDropTarget, setCardDropTarget] = useState<{ columnId: string; index: number } | null>(null)
    const [columnDropTarget, setColumnDropTarget] = useState<number | null>(null)

    useProductivityDeepLink({
        appId: 'boards',
        createRecord: editor.createRecord,
        selectRecord: editor.selectRecord,
        refs: {
            editor: boardRef,
            links: linksRef,
            attachments: attachmentsRef,
        },
    })

    useEffect(() => {
        setBoard(parseBoardState(editor.body))
    }, [editor.activeId, editor.body])

    useEffect(() => {
        editor.setBody(JSON.stringify(board, null, 2))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [board])

    const clearDragState = () => {
        setDragState(null)
        setCardDropTarget(null)
        setColumnDropTarget(null)
    }

    const addCard = (columnId: string, title: string) => {
        setBoard((current) =>
            addCardToColumn(current, columnId, {
                id: nextId(),
                title,
                description: '',
            }),
        )
    }

    const deleteCard = (columnId: string, cardId: string) => {
        setBoard((current) => {
            const col = current.columns.find((c) => c.id === columnId)
            if (!col) return current
            return {
                ...current,
                columns: current.columns.map((c) =>
                    c.id === columnId ? { ...c, cards: c.cards.filter((card) => card.id !== cardId) } : c,
                ),
            }
        })
    }

    const editDescription = (columnId: string, cardId: string, description: string) => {
        setBoard((current) => updateCardDescription(current, columnId, cardId, description))
    }

    const addColumn = () => {
        const title = prompt('Section name')
        if (!title) return
        setBoard((current) => ({
            ...current,
            columns: [
                ...current.columns,
                { id: nextId(), title, cards: [] },
            ],
        }))
    }

    const deleteColumn = (columnId: string) => {
        if (!confirm('Delete this section and all its tasks?')) return
        setBoard((current) => ({
            ...current,
            columns: current.columns.filter((c) => c.id !== columnId),
        }))
    }

    const toggleCollapse = (columnId: string) => {
        setCollapsedColumns((prev) => {
            const next = new Set(prev)
            if (next.has(columnId)) next.delete(columnId)
            else next.add(columnId)
            return next
        })
    }

    // ─── Drag handlers ───────────────────────────────────────────────────────
    const handleCardDragStart = (e: DragEvent<HTMLElement>, sourceColumnId: string, cardId: string) => {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', cardId)
        setDragState({ type: 'card', sourceColumnId, cardId })
        setColumnDropTarget(null)
    }

    const handleColumnDragStart = (e: DragEvent<HTMLElement>, columnId: string) => {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', columnId)
        setDragState({ type: 'column', columnId })
        setCardDropTarget(null)
    }

    const handleCardDrop = (columnId: string, index: number) => {
        if (!dragState || dragState.type !== 'card') return
        setBoard((current) =>
            moveCard(current, {
                cardId: dragState.cardId,
                sourceColumnId: dragState.sourceColumnId,
                destinationColumnId: columnId,
                destinationIndex: index,
            }),
        )
        clearDragState()
    }

    const handleColumnDrop = (index: number) => {
        if (!dragState || dragState.type !== 'column') return
        setBoard((current) =>
            reorderColumns(current, { columnId: dragState.columnId, destinationIndex: index }),
        )
        clearDragState()
    }

    const handleCardKeyDown = (e: KeyboardEvent<HTMLElement>, cardId: string) => {
        if (!e.altKey) return
        const location = findCardLocation(board, cardId)
        if (!location) return

        if (e.key === 'ArrowUp') {
            e.preventDefault()
            setBoard((cur) =>
                moveCard(cur, {
                    cardId,
                    sourceColumnId: location.columnId,
                    destinationColumnId: location.columnId,
                    destinationIndex: location.cardIndex - 1,
                }),
            )
        } else if (e.key === 'ArrowDown') {
            e.preventDefault()
            setBoard((cur) =>
                moveCard(cur, {
                    cardId,
                    sourceColumnId: location.columnId,
                    destinationColumnId: location.columnId,
                    destinationIndex: location.cardIndex + 2,
                }),
            )
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            const delta = e.key === 'ArrowLeft' ? -1 : 1
            const dest = board.columns[location.columnIndex + delta]
            if (!dest) return
            e.preventDefault()
            setBoard((cur) =>
                moveCard(cur, {
                    cardId,
                    sourceColumnId: location.columnId,
                    destinationColumnId: dest.id,
                    destinationIndex: dest.cards.length,
                }),
            )
        }
    }

    const handleColumnKeyDown = (e: KeyboardEvent<HTMLElement>, columnId: string) => {
        if (!e.altKey || !e.shiftKey) return
        const columnIndex = board.columns.findIndex((c) => c.id === columnId)
        if (columnIndex === -1) return
        if (e.key === 'ArrowLeft') {
            e.preventDefault()
            setBoard((cur) => reorderColumns(cur, { columnId, destinationIndex: columnIndex - 1 }))
        } else if (e.key === 'ArrowRight') {
            e.preventDefault()
            setBoard((cur) => reorderColumns(cur, { columnId, destinationIndex: columnIndex + 2 }))
        }
    }

    // ─── Stats ───────────────────────────────────────────────────────────────
    const totalTasks = board.columns.reduce((sum, c) => sum + c.cards.length, 0)
    const hasAttachmentsOrLinks = editor.attachments.length > 0 || editor.linkedRecords.length > 0

    return (
        <Window id={id} title="Boards">
            <div className="flex h-full w-full overflow-hidden bg-tile-1 text-on-dark">

                {/* ── Left sidebar: board list ──────────────────────────── */}
                <aside className="flex w-56 shrink-0 flex-col border-r border-white/10 bg-tile-3">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-white/10 px-3 py-3">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-on-dark-muted">
                            My Boards
                        </span>
                        <button
                            type="button"
                            onClick={() => editor.createRecord()}
                            className="rounded-md p-1 text-on-dark-muted transition-colors hover:bg-tile-2 hover:text-on-dark"
                            title="New board"
                            aria-label="New board"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Board list */}
                    <div className="flex-1 overflow-y-auto py-1">
                        {editor.records.map((record) => {
                            const isActive = editor.activeId === record.id
                            return (
                                <button
                                    key={record.id}
                                    type="button"
                                    onClick={() => editor.selectRecord(record.id)}
                                    className={`flex w-full items-center gap-2.5 rounded-md mx-1 px-2.5 py-2 text-left transition-colors ${
                                        isActive
                                            ? 'bg-tile-1 text-on-dark'
                                            : 'text-on-dark-muted hover:bg-tile-2 hover:text-on-dark'
                                    }`}
                                    style={{ width: 'calc(100% - 0.5rem)' }}
                                >
                                    <LayoutList
                                        className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary-on-dark' : ''}`}
                                    />
                                    <span className="truncate text-[13px] font-medium">
                                        {record.title || 'Untitled'}
                                    </span>
                                </button>
                            )
                        })}
                        {editor.records.length === 0 && (
                            <p className="px-4 py-4 text-[12px] text-on-dark-muted">No boards yet.</p>
                        )}
                    </div>

                    {/* Template shortcut */}
                    <div className="border-t border-white/10 p-2">
                        <button
                            type="button"
                            onClick={() => setTemplatePickerOpen((o) => !o)}
                            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-[12px] text-on-dark-muted transition-colors hover:bg-tile-2 hover:text-on-dark"
                        >
                            <Sparkles className="h-3.5 w-3.5" />
                            Templates
                        </button>
                    </div>
                </aside>

                {/* ── Main area ─────────────────────────────────────────── */}
                <main className="flex min-w-0 flex-1 flex-col overflow-hidden">

                    {/* Board title bar */}
                    <header className="flex shrink-0 items-center gap-3 border-b border-white/10 px-5 py-3">
                        <input
                            value={editor.title}
                            onChange={(e) => editor.setTitle(e.target.value)}
                            placeholder="Board title"
                            className="min-w-0 flex-1 bg-transparent text-lg font-semibold text-on-dark outline-none placeholder:text-on-dark-muted/50"
                        />
                        <span className="shrink-0 rounded-pill bg-tile-2 px-2.5 py-0.5 text-[11px] font-semibold text-on-dark-muted">
                            {totalTasks} task{totalTasks !== 1 ? 's' : ''}
                        </span>
                        <button
                            type="button"
                            onClick={() => setShowMeta((o) => !o)}
                            className={`rounded-md p-1.5 text-[12px] transition-colors ${
                                showMeta || hasAttachmentsOrLinks
                                    ? 'bg-tile-2 text-primary-on-dark'
                                    : 'text-on-dark-muted hover:bg-tile-2 hover:text-on-dark'
                            }`}
                            title="Attachments & links"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                            </svg>
                        </button>
                    </header>

                    {/* Template picker */}
                    {isTemplatePickerOpen && (
                        <div className="border-b border-white/10">
                            <TemplatePicker
                                appLabel="Boards"
                                templates={editor.templates}
                                onClose={() => setTemplatePickerOpen(false)}
                                onSelect={(templateId) => {
                                    editor.createRecord(templateId)
                                    setTemplatePickerOpen(false)
                                }}
                            />
                        </div>
                    )}

                    {/* Task list + meta panel */}
                    <div className="flex min-h-0 flex-1 overflow-hidden">

                        {/* Task list */}
                        <section
                            ref={boardRef}
                            tabIndex={-1}
                            className="min-h-0 flex-1 overflow-y-auto outline-none focus:ring-2 focus:ring-primary-on-dark/60"
                        >
                            <div className="mx-auto max-w-2xl px-4 py-4 space-y-1">

                                {board.columns.map((column, columnIndex) => {
                                    const isCollapsed = collapsedColumns.has(column.id)
                                    const isColDragging = dragState?.type === 'column' && dragState.columnId === column.id
                                    const completedCount = column.cards.length // we can't track true "done" in model, so show total

                                    return (
                                        <Fragment key={column.id}>
                                            {/* Column drop zone above (before first column or between) */}
                                            {columnIndex === 0 && (
                                                <div
                                                    onDragOver={(e) => {
                                                        if (dragState?.type !== 'column') return
                                                        e.preventDefault()
                                                        setColumnDropTarget(0)
                                                    }}
                                                    onDrop={(e) => {
                                                        e.preventDefault()
                                                        handleColumnDrop(0)
                                                    }}
                                                    className={`h-1 rounded-full transition-all ${
                                                        dragState?.type === 'column' && columnDropTarget === 0
                                                            ? 'bg-primary-on-dark'
                                                            : 'bg-transparent'
                                                    }`}
                                                />
                                            )}

                                            {/* Section */}
                                            <div className={`rounded-xl transition-opacity ${isColDragging ? 'opacity-40' : ''}`}>

                                                {/* Section header */}
                                                <div className="flex items-center gap-1 py-1 group/section">
                                                    {/* Collapse toggle */}
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleCollapse(column.id)}
                                                        className="rounded p-0.5 text-on-dark-muted transition-colors hover:text-on-dark"
                                                        aria-label={isCollapsed ? `Expand ${column.title}` : `Collapse ${column.title}`}
                                                    >
                                                        {isCollapsed ? (
                                                            <ChevronRight className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronDown className="h-4 w-4" />
                                                        )}
                                                    </button>

                                                    {/* Section drag handle */}
                                                    <button
                                                        type="button"
                                                        draggable
                                                        aria-label={`Reorder section: ${column.title}`}
                                                        onDragStart={(e) => handleColumnDragStart(e, column.id)}
                                                        onDragEnd={clearDragState}
                                                        onKeyDown={(e) => handleColumnKeyDown(e, column.id)}
                                                        className="cursor-grab text-on-dark-muted opacity-0 transition-opacity group-hover/section:opacity-100 focus:opacity-100 focus:outline-none active:cursor-grabbing"
                                                        title="Drag to reorder section · Alt+Shift+←→"
                                                    >
                                                        <GripVertical className="h-3.5 w-3.5" />
                                                    </button>

                                                    {/* Title */}
                                                    <h2 className="flex-1 text-[13px] font-semibold text-on-dark">
                                                        {column.title}
                                                    </h2>

                                                    {/* Count badge */}
                                                    <span className="rounded-full bg-tile-2 px-2 py-0.5 text-[11px] font-medium text-on-dark-muted">
                                                        {completedCount}
                                                    </span>

                                                    {/* Delete section */}
                                                    <button
                                                        type="button"
                                                        onClick={() => deleteColumn(column.id)}
                                                        className="ml-1 rounded p-0.5 text-on-dark-muted opacity-0 transition-opacity hover:text-ds-danger group-hover/section:opacity-100 focus:opacity-100"
                                                        title="Delete section"
                                                        aria-label={`Delete section: ${column.title}`}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>

                                                {/* Divider */}
                                                <div className="mb-1 ml-6 h-px bg-white/10" />

                                                {/* Task rows */}
                                                {!isCollapsed && (
                                                    <div>
                                                        {column.cards.map((card, cardIndex) => (
                                                            <TaskRow
                                                                key={card.id}
                                                                title={card.title}
                                                                description={card.description}
                                                                isDragging={
                                                                    dragState?.type === 'card' && dragState.cardId === card.id
                                                                }
                                                                isDropTarget={
                                                                    dragState?.type === 'card' &&
                                                                    cardDropTarget?.columnId === column.id &&
                                                                    cardDropTarget.index === cardIndex
                                                                }
                                                                onDragStart={(e) => handleCardDragStart(e, column.id, card.id)}
                                                                onDragEnd={clearDragState}
                                                                onDragOver={(e) => {
                                                                    if (dragState?.type !== 'card') return
                                                                    e.preventDefault()
                                                                    setCardDropTarget({ columnId: column.id, index: cardIndex })
                                                                }}
                                                                onDrop={(e) => {
                                                                    e.preventDefault()
                                                                    handleCardDrop(column.id, cardIndex)
                                                                }}
                                                                onKeyDown={(e) => handleCardKeyDown(e, card.id)}
                                                                onDescriptionChange={(v) => editDescription(column.id, card.id, v)}
                                                                onDelete={() => deleteCard(column.id, card.id)}
                                                            />
                                                        ))}

                                                        {/* End-of-list drop zone */}
                                                        <div
                                                            onDragOver={(e) => {
                                                                if (dragState?.type !== 'card') return
                                                                e.preventDefault()
                                                                setCardDropTarget({ columnId: column.id, index: column.cards.length })
                                                            }}
                                                            onDrop={(e) => {
                                                                e.preventDefault()
                                                                handleCardDrop(column.id, column.cards.length)
                                                            }}
                                                            className={`mx-3 h-1 rounded-full transition-all ${
                                                                dragState?.type === 'card' &&
                                                                cardDropTarget?.columnId === column.id &&
                                                                cardDropTarget.index === column.cards.length
                                                                    ? 'bg-primary-on-dark'
                                                                    : 'bg-transparent'
                                                            }`}
                                                        />

                                                        {/* Add task row or button */}
                                                        {addingToColumn === column.id ? (
                                                            <AddTaskRow
                                                                onAdd={(title) => {
                                                                    addCard(column.id, title)
                                                                    setAddingToColumn(null)
                                                                }}
                                                                onCancel={() => setAddingToColumn(null)}
                                                            />
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => setAddingToColumn(column.id)}
                                                                className="group/add mx-2 mb-2 flex w-[calc(100%-1rem)] items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] text-on-dark-muted transition-colors hover:bg-tile-2 hover:text-on-dark"
                                                            >
                                                                <Plus className="h-3.5 w-3.5 text-primary-on-dark opacity-60 group-hover/add:opacity-100" />
                                                                Add task
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Column drop zone after */}
                                            <div
                                                onDragOver={(e) => {
                                                    if (dragState?.type !== 'column') return
                                                    e.preventDefault()
                                                    setColumnDropTarget(columnIndex + 1)
                                                }}
                                                onDrop={(e) => {
                                                    e.preventDefault()
                                                    handleColumnDrop(columnIndex + 1)
                                                }}
                                                className={`h-1 rounded-full transition-all ${
                                                    dragState?.type === 'column' && columnDropTarget === columnIndex + 1
                                                        ? 'bg-primary-on-dark'
                                                        : 'bg-transparent'
                                                }`}
                                            />
                                        </Fragment>
                                    )
                                })}

                                {/* Add section */}
                                <button
                                    type="button"
                                    onClick={addColumn}
                                    className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] text-on-dark-muted transition-colors hover:bg-tile-2 hover:text-on-dark"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Add section
                                </button>

                                {board.columns.length === 0 && (
                                    <div className="flex flex-col items-center gap-4 py-16 text-center">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-tile-2">
                                            <LayoutList className="h-7 w-7 text-primary-on-dark" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-on-dark">No sections yet</p>
                                            <p className="mt-1 text-[12px] text-on-dark-muted">
                                                Add a section to start organizing your tasks
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addColumn}
                                            className="rounded-pill border border-primary-on-dark px-4 py-1.5 text-[13px] font-semibold text-primary-on-dark transition-opacity hover:opacity-80 active:scale-95"
                                        >
                                            + Add first section
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Meta panel: links + attachments */}
                        {(showMeta || hasAttachmentsOrLinks) && (
                            <aside className="w-64 shrink-0 overflow-y-auto border-l border-white/10 bg-tile-3 p-3 space-y-3">
                                <div ref={linksRef} tabIndex={-1} className="rounded-lg outline-none focus:ring-2 focus:ring-primary-on-dark/60">
                                    <LinkedRecordsPanel records={editor.linkedRecords} />
                                </div>
                                <div ref={attachmentsRef} tabIndex={-1} className="rounded-lg outline-none focus:ring-2 focus:ring-primary-on-dark/60">
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
                    </div>

                    {/* Status bar */}
                    <div className="flex shrink-0 items-center justify-between border-t border-white/10 bg-tile-3 px-5 py-1.5">
                        <span className="text-[11px] text-on-dark-muted">{editor.statusLabel || 'Ready'}</span>
                        <span className="text-[11px] text-on-dark-muted">
                            {board.columns.length} section{board.columns.length !== 1 ? 's' : ''} · {totalTasks} task{totalTasks !== 1 ? 's' : ''}
                        </span>
                    </div>
                </main>
            </div>
        </Window>
    )
}
