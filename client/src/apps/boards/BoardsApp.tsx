import { Fragment, useEffect, useRef, useState, type DragEvent, type KeyboardEvent } from 'react'
import Window from '../../components/system/Window'
import AttachmentPanel from '../productivity/components/AttachmentPanel'
import LinkedRecordsPanel from '../productivity/components/LinkedRecordsPanel'
import RecordListPane from '../productivity/components/RecordListPane'
import TemplatePicker from '../productivity/components/TemplatePicker'
import { useProductivityDeepLink } from '../productivity/hooks/useProductivityDeepLink'
import { useProductivityEditor } from '../productivity/hooks/useProductivityEditor'
import { createBoardTemplate, parseBoardState, type BoardState } from './boardModel'
import { addCardToColumn, findCardLocation, moveCard, reorderColumns, updateCardDescription } from './boardState'

function nextId() {
    return crypto.randomUUID().slice(0, 8)
}

type DragState =
    | { type: 'card'; cardId: string; sourceColumnId: string }
    | { type: 'column'; columnId: string }

export default function BoardsApp({ id }: { id: string }) {
    const boardRef = useRef<HTMLElement>(null)
    const linksRef = useRef<HTMLDivElement>(null)
    const attachmentsRef = useRef<HTMLDivElement>(null)
    const [isTemplatePickerOpen, setTemplatePickerOpen] = useState(false)
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

    const addCard = (columnId: string) => {
        const title = prompt('Card title')
        if (!title) {
            return
        }

        setBoard((current) => addCardToColumn(current, columnId, {
            id: nextId(),
            title,
            description: '',
        }))
    }

    const editDescription = (columnId: string, cardId: string, description: string) => {
        setBoard((current) => updateCardDescription(current, columnId, cardId, description))
    }

    const handleCardDragStart = (event: DragEvent<HTMLElement>, sourceColumnId: string, cardId: string) => {
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData('text/plain', cardId)
        setDragState({ type: 'card', sourceColumnId, cardId })
        setColumnDropTarget(null)
    }

    const handleColumnDragStart = (event: DragEvent<HTMLElement>, columnId: string) => {
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData('text/plain', columnId)
        setDragState({ type: 'column', columnId })
        setCardDropTarget(null)
    }

    const handleCardDrop = (columnId: string, index: number) => {
        if (!dragState || dragState.type !== 'card') {
            return
        }

        setBoard((current) => moveCard(current, {
            cardId: dragState.cardId,
            sourceColumnId: dragState.sourceColumnId,
            destinationColumnId: columnId,
            destinationIndex: index,
        }))
        clearDragState()
    }

    const handleColumnDrop = (index: number) => {
        if (!dragState || dragState.type !== 'column') {
            return
        }

        setBoard((current) => reorderColumns(current, {
            columnId: dragState.columnId,
            destinationIndex: index,
        }))
        clearDragState()
    }

    const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>, cardId: string) => {
        if (!event.altKey) {
            return
        }

        const location = findCardLocation(board, cardId)
        if (!location) {
            return
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault()
            setBoard((current) => moveCard(current, {
                cardId,
                sourceColumnId: location.columnId,
                destinationColumnId: location.columnId,
                destinationIndex: location.cardIndex - 1,
            }))
            return
        }

        if (event.key === 'ArrowDown') {
            event.preventDefault()
            setBoard((current) => moveCard(current, {
                cardId,
                sourceColumnId: location.columnId,
                destinationColumnId: location.columnId,
                destinationIndex: location.cardIndex + 2,
            }))
            return
        }

        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            const delta = event.key === 'ArrowLeft' ? -1 : 1
            const destinationColumn = board.columns[location.columnIndex + delta]
            if (!destinationColumn) {
                return
            }

            event.preventDefault()
            setBoard((current) => moveCard(current, {
                cardId,
                sourceColumnId: location.columnId,
                destinationColumnId: destinationColumn.id,
                destinationIndex: destinationColumn.cards.length,
            }))
        }
    }

    const handleColumnKeyDown = (event: KeyboardEvent<HTMLElement>, columnId: string) => {
        if (!event.altKey || !event.shiftKey) {
            return
        }

        const columnIndex = board.columns.findIndex((column) => column.id === columnId)
        if (columnIndex === -1) {
            return
        }

        if (event.key === 'ArrowLeft') {
            event.preventDefault()
            setBoard((current) => reorderColumns(current, {
                columnId,
                destinationIndex: columnIndex - 1,
            }))
            return
        }

        if (event.key === 'ArrowRight') {
            event.preventDefault()
            setBoard((current) => reorderColumns(current, {
                columnId,
                destinationIndex: columnIndex + 2,
            }))
        }
    }

    return (
        <Window id={id} title="Boards">
            <div className="flex h-full flex-col bg-tile-1 text-on-dark md:flex-row">
                <RecordListPane
                    label="Boards"
                    records={editor.records}
                    activeId={editor.activeId}
                    onCreate={editor.createRecord}
                    onOpenTemplates={() => setTemplatePickerOpen((open) => !open)}
                    onSelect={editor.selectRecord}
                />
                <main className="flex min-h-0 flex-1 flex-col">
                    <header className="border-b border-white/10 px-4 py-3">
                        <input
                            value={editor.title}
                            onChange={(event) => editor.setTitle(event.target.value)}
                            placeholder="Board title"
                            className="w-full rounded-md border border-white/10 bg-tile-2 px-3 py-2 text-sm text-on-dark outline-none focus:border-[var(--os-accent)]"
                        />
                        <div className="mt-2 flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs text-on-dark-muted">{editor.statusLabel}</p>
                                <p className="mt-1 text-[11px] uppercase tracking-[0.24em] text-on-dark-muted">
                                    Drag handles to move cards and columns. Keyboard fallback: card handle `Alt` + arrows, column handle `Alt` + `Shift` + arrows.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setTemplatePickerOpen((open) => !open)}
                                className="rounded-pill border border-primary-on-dark px-3 py-1 text-[12px] font-semibold text-primary-on-dark transition-transform active:scale-95"
                            >
                                Templates
                            </button>
                        </div>
                    </header>
                    <div className="grid min-h-0 flex-1 gap-3 p-3 xl:grid-cols-[minmax(0,1fr),18rem]">
                        <div className="min-h-0 space-y-3">
                            {isTemplatePickerOpen ? (
                                <TemplatePicker
                                    appLabel="Boards"
                                    templates={editor.templates}
                                    onClose={() => setTemplatePickerOpen(false)}
                                    onSelect={(templateId) => {
                                        editor.createRecord(templateId)
                                        setTemplatePickerOpen(false)
                                    }}
                                />
                            ) : null}
                            <section ref={boardRef} tabIndex={-1} className="overflow-auto rounded-xl border border-white/10 bg-tile-1 p-3 outline-none focus:ring-2 focus:ring-[var(--os-accent)]">
                                <div className="flex min-h-full items-start gap-3">
                                <div
                                    onDragOver={(event) => {
                                        if (dragState?.type !== 'column') {
                                            return
                                        }
                                        event.preventDefault()
                                        setColumnDropTarget(0)
                                    }}
                                    onDrop={(event) => {
                                        event.preventDefault()
                                        handleColumnDrop(0)
                                    }}
                                    className={`mt-1 hidden h-[calc(100%-0.5rem)] w-3 rounded-full border transition md:block ${
                                        dragState?.type === 'column' && columnDropTarget === 0
                                            ? 'border-primary-on-dark bg-primary-on-dark'
                                            : 'border-transparent bg-tile-2'
                                    }`}
                                />
                                {board.columns.map((column, columnIndex) => (
                                    <Fragment key={column.id}>
                                        <div className="min-w-[18rem] flex-1 rounded-xl border border-white/10 bg-tile-2 p-2.5">
                                            <div className="mb-2 flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-tile-1 px-2.5 py-2">
                                                <div className="flex min-w-0 items-center gap-2">
                                                    <button
                                                        type="button"
                                                        draggable
                                                        aria-label={`Reorder ${column.title} column`}
                                                        onDragStart={(event) => handleColumnDragStart(event, column.id)}
                                                        onDragEnd={clearDragState}
                                                        onKeyDown={(event) => handleColumnKeyDown(event, column.id)}
                                                        className={`rounded-md border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] transition focus:outline-none focus:ring-2 focus:ring-[var(--os-accent)] ${
                                                            dragState?.type === 'column' && dragState.columnId === column.id
                                                                ? 'border-primary-on-dark bg-[rgba(41,151,255,0.16)] text-primary-on-dark'
                                                                : 'border-white/10 bg-tile-1 text-on-dark-muted hover:border-white/20'
                                                        }`}
                                                    >
                                                        Drag
                                                    </button>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-semibold text-on-dark">{column.title}</p>
                                                        <p className="text-[11px] uppercase tracking-[0.2em] text-on-dark-muted">{column.cards.length} cards</p>
                                                    </div>
                                                </div>
                                                <button
                                                    className="rounded-md border border-white/10 bg-tile-1 px-2 py-1 text-xs transition-colors hover:bg-tile-2"
                                                    onClick={() => addCard(column.id)}
                                                >
                                                    Add
                                                </button>
                                            </div>
                                            <div className="space-y-1.5">
                                                {column.cards.map((card, cardIndex) => (
                                                    <Fragment key={card.id}>
                                                        <div
                                                            onDragOver={(event) => {
                                                                if (dragState?.type !== 'card') {
                                                                    return
                                                                }
                                                                event.preventDefault()
                                                                setCardDropTarget({ columnId: column.id, index: cardIndex })
                                                            }}
                                                            onDrop={(event) => {
                                                                event.preventDefault()
                                                                handleCardDrop(column.id, cardIndex)
                                                            }}
                                                            className={`h-2 rounded-full border transition ${
                                                                dragState?.type === 'card' && cardDropTarget?.columnId === column.id && cardDropTarget.index === cardIndex
                                                                    ? 'border-primary-on-dark bg-primary-on-dark'
                                                                    : 'border-transparent bg-tile-2'
                                                            }`}
                                                        />
                                                        <article className={`rounded-lg border p-2.5 transition ${
                                                            dragState?.type === 'card' && dragState.cardId === card.id
                                                                ? 'border-primary-on-dark bg-tile-1'
                                                                : 'border-white/10 bg-tile-1'
                                                        }`}>
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div className="min-w-0">
                                                                    <p className="truncate text-xs font-semibold uppercase tracking-[0.16em] text-on-dark">{card.title}</p>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    draggable
                                                                    aria-label={`Move ${card.title}`}
                                                                    onDragStart={(event) => handleCardDragStart(event, column.id, card.id)}
                                                                    onDragEnd={clearDragState}
                                                                    onKeyDown={(event) => handleCardKeyDown(event, card.id)}
                                                                    className={`rounded border px-1.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] transition focus:outline-none focus:ring-2 focus:ring-[var(--os-accent)] ${
                                                                        dragState?.type === 'card' && dragState.cardId === card.id
                                                                            ? 'border-primary-on-dark bg-[rgba(41,151,255,0.16)] text-primary-on-dark'
                                                                            : 'border-white/10 bg-tile-1 text-on-dark-muted hover:border-white/20'
                                                                    }`}
                                                                >
                                                                    Grip
                                                                </button>
                                                            </div>
                                                            <textarea
                                                                value={card.description}
                                                                onChange={(event) => editDescription(column.id, card.id, event.target.value)}
                                                                placeholder="Card details. Link with [[notes:abc123]]."
                                                                className="mt-2 h-24 w-full resize-none rounded-md border border-white/10 bg-tile-1 p-2 text-xs text-on-dark outline-none focus:border-primary-on-dark"
                                                            />
                                                            <p className="mt-2 text-[11px] text-on-dark-muted">Drag to reorder or move across columns.</p>
                                                        </article>
                                                    </Fragment>
                                                ))}
                                                <div
                                                    onDragOver={(event) => {
                                                        if (dragState?.type !== 'card') {
                                                            return
                                                        }
                                                        event.preventDefault()
                                                        setCardDropTarget({ columnId: column.id, index: column.cards.length })
                                                    }}
                                                    onDrop={(event) => {
                                                        event.preventDefault()
                                                        handleCardDrop(column.id, column.cards.length)
                                                    }}
                                                    className={`flex min-h-[1rem] items-center justify-center rounded-lg border border-dashed px-2 py-3 text-[11px] uppercase tracking-[0.2em] transition ${
                                                        dragState?.type === 'card' && cardDropTarget?.columnId === column.id && cardDropTarget.index === column.cards.length
                                                            ? 'border-primary-on-dark bg-[rgba(41,151,255,0.12)] text-primary-on-dark'
                                                            : 'border-white/10 bg-tile-1 text-on-dark-muted'
                                                    }`}
                                                >
                                                    {column.cards.length === 0 ? 'Drop first card here' : 'Drop at end'}
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            onDragOver={(event) => {
                                                if (dragState?.type !== 'column') {
                                                    return
                                                }
                                                event.preventDefault()
                                                setColumnDropTarget(columnIndex + 1)
                                            }}
                                            onDrop={(event) => {
                                                event.preventDefault()
                                                handleColumnDrop(columnIndex + 1)
                                            }}
                                            className={`mt-1 hidden h-[calc(100%-0.5rem)] w-3 rounded-full border transition md:block ${
                                                dragState?.type === 'column' && columnDropTarget === columnIndex + 1
                                                    ? 'border-primary-on-dark bg-primary-on-dark'
                                                    : 'border-transparent bg-tile-2'
                                            }`}
                                        />
                                    </Fragment>
                                ))}
                                </div>
                            </section>
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
