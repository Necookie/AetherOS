import { useEffect, useState } from 'react'
import Window from '../../components/system/Window'
import AttachmentPanel from '../productivity/components/AttachmentPanel'
import LinkedRecordsPanel from '../productivity/components/LinkedRecordsPanel'
import RecordListPane from '../productivity/components/RecordListPane'
import { useProductivityEditor } from '../productivity/hooks/useProductivityEditor'
import { createBoardTemplate, parseBoardState, type BoardState } from './boardModel'

function nextId() {
    return crypto.randomUUID().slice(0, 8)
}

export default function BoardsApp({ id }: { id: string }) {
    const editor = useProductivityEditor({
        appId: 'boards',
        createDefaults: () => ({
            title: `Board ${new Date().toLocaleDateString()}`,
            body: JSON.stringify(createBoardTemplate(), null, 2),
        }),
    })
    const [board, setBoard] = useState<BoardState>(createBoardTemplate())

    useEffect(() => {
        setBoard(parseBoardState(editor.body))
    }, [editor.activeId, editor.body])

    useEffect(() => {
        editor.setBody(JSON.stringify(board, null, 2))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [board])

    const addCard = (columnId: string) => {
        const title = prompt('Card title')
        if (!title) {
            return
        }

        setBoard((current) => ({
            columns: current.columns.map((column) => (
                column.id === columnId
                    ? {
                        ...column,
                        cards: [...column.cards, { id: nextId(), title, description: '' }],
                    }
                    : column
            )),
        }))
    }

    const moveCard = (columnIndex: number, cardId: string, direction: -1 | 1) => {
        const nextColumnIndex = columnIndex + direction
        setBoard((current) => {
            if (nextColumnIndex < 0 || nextColumnIndex >= current.columns.length) {
                return current
            }

            const sourceColumn = current.columns[columnIndex]
            const destinationColumn = current.columns[nextColumnIndex]
            if (!sourceColumn || !destinationColumn) {
                return current
            }

            const card = sourceColumn.cards.find((item) => item.id === cardId)
            if (!card) {
                return current
            }

            return {
                columns: current.columns.map((column, index) => {
                    if (index === columnIndex) {
                        return {
                            ...column,
                            cards: column.cards.filter((item) => item.id !== cardId),
                        }
                    }

                    if (index === nextColumnIndex) {
                        return {
                            ...column,
                            cards: [...column.cards, card],
                        }
                    }

                    return column
                }),
            }
        })
    }

    const editDescription = (columnId: string, cardId: string, description: string) => {
        setBoard((current) => ({
            columns: current.columns.map((column) => (
                column.id === columnId
                    ? {
                        ...column,
                        cards: column.cards.map((card) => (
                            card.id === cardId
                                ? { ...card, description }
                                : card
                        )),
                    }
                    : column
            )),
        }))
    }

    return (
        <Window id={id} title="Boards">
            <div className="flex h-full flex-col bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/55 text-slate-100 md:flex-row">
                <RecordListPane
                    label="Boards"
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
                            placeholder="Board title"
                            className="w-full rounded-md border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-[var(--os-accent)]"
                        />
                        <p className="mt-2 text-xs text-slate-400">{editor.statusLabel}</p>
                    </header>
                    <div className="grid min-h-0 flex-1 gap-3 p-3 xl:grid-cols-[minmax(0,1fr),18rem]">
                        <section className="grid min-h-[260px] grid-cols-1 gap-3 overflow-auto rounded-lg border border-slate-700 bg-slate-950/60 p-3 md:grid-cols-3">
                            {board.columns.map((column, columnIndex) => (
                                <div key={column.id} className="rounded-lg border border-slate-700 bg-slate-900/70 p-2">
                                    <div className="mb-2 flex items-center justify-between">
                                        <p className="text-sm font-semibold">{column.title}</p>
                                        <button
                                            className="rounded-md border border-slate-600 bg-slate-800 px-2 py-0.5 text-xs transition hover:bg-slate-700"
                                            onClick={() => addCard(column.id)}
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {column.cards.map((card) => (
                                            <article key={card.id} className="rounded-md border border-slate-700 bg-slate-950/70 p-2">
                                                <p className="text-xs font-semibold text-slate-100">{card.title}</p>
                                                <textarea
                                                    value={card.description}
                                                    onChange={(event) => editDescription(column.id, card.id, event.target.value)}
                                                    placeholder="Card details. Link with [[notes:abc123]]."
                                                    className="mt-1 h-20 w-full resize-none rounded border border-slate-700 bg-slate-900 p-1.5 text-xs text-slate-200 outline-none focus:border-[var(--os-accent)]"
                                                />
                                                <div className="mt-2 flex justify-between">
                                                    <button
                                                        className="rounded border border-slate-700 px-1.5 py-0.5 text-[11px] text-slate-300 disabled:opacity-35"
                                                        onClick={() => moveCard(columnIndex, card.id, -1)}
                                                        disabled={columnIndex === 0}
                                                    >
                                                        Left
                                                    </button>
                                                    <button
                                                        className="rounded border border-slate-700 px-1.5 py-0.5 text-[11px] text-slate-300 disabled:opacity-35"
                                                        onClick={() => moveCard(columnIndex, card.id, 1)}
                                                        disabled={columnIndex === board.columns.length - 1}
                                                    >
                                                        Right
                                                    </button>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </section>
                        <div className="space-y-3">
                            <LinkedRecordsPanel records={editor.linkedRecords} />
                            <AttachmentPanel
                                attachments={editor.attachments}
                                attachmentInput={editor.attachmentInput}
                                onAttachmentInputChange={editor.setAttachmentInput}
                                onAddAttachment={editor.addAttachment}
                                onRemoveAttachment={editor.removeAttachment}
                            />
                        </div>
                    </div>
                </main>
            </div>
        </Window>
    )
}
