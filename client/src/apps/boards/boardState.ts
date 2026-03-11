import type { BoardCard, BoardState } from './boardModel'

export interface BoardCardMove {
    cardId: string
    sourceColumnId: string
    destinationColumnId: string
    destinationIndex: number
}

export interface BoardColumnMove {
    columnId: string
    destinationIndex: number
}

export interface BoardCardLocation {
    columnId: string
    columnIndex: number
    cardIndex: number
}

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value))
}

export function addCardToColumn(board: BoardState, columnId: string, card: BoardCard): BoardState {
    return {
        columns: board.columns.map((column) => (
            column.id === columnId
                ? {
                    ...column,
                    cards: [...column.cards, card],
                }
                : column
        )),
    }
}

export function updateCardDescription(
    board: BoardState,
    columnId: string,
    cardId: string,
    description: string,
): BoardState {
    return {
        columns: board.columns.map((column) => (
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
    }
}

export function findCardLocation(board: BoardState, cardId: string): BoardCardLocation | null {
    for (let columnIndex = 0; columnIndex < board.columns.length; columnIndex += 1) {
        const cardIndex = board.columns[columnIndex].cards.findIndex((card) => card.id === cardId)
        if (cardIndex !== -1) {
            return {
                columnId: board.columns[columnIndex].id,
                columnIndex,
                cardIndex,
            }
        }
    }

    return null
}

export function moveCard(board: BoardState, move: BoardCardMove): BoardState {
    const sourceColumnIndex = board.columns.findIndex((column) => column.id === move.sourceColumnId)
    const destinationColumnIndex = board.columns.findIndex((column) => column.id === move.destinationColumnId)
    if (sourceColumnIndex === -1 || destinationColumnIndex === -1) {
        return board
    }

    const sourceColumn = board.columns[sourceColumnIndex]
    const destinationColumn = board.columns[destinationColumnIndex]
    const sourceCardIndex = sourceColumn.cards.findIndex((card) => card.id === move.cardId)
    if (sourceCardIndex === -1) {
        return board
    }

    const card = sourceColumn.cards[sourceCardIndex]

    if (sourceColumn.id === destinationColumn.id) {
        const cards = [...sourceColumn.cards]
        cards.splice(sourceCardIndex, 1)
        const adjustedIndex = clamp(
            sourceCardIndex < move.destinationIndex ? move.destinationIndex - 1 : move.destinationIndex,
            0,
            cards.length,
        )
        if (adjustedIndex === sourceCardIndex) {
            return board
        }

        cards.splice(adjustedIndex, 0, card)
        return {
            columns: board.columns.map((column) => (
                column.id === sourceColumn.id
                    ? { ...column, cards }
                    : column
            )),
        }
    }

    const nextSourceCards = sourceColumn.cards.filter((item) => item.id !== move.cardId)
    const nextDestinationCards = [...destinationColumn.cards]
    nextDestinationCards.splice(clamp(move.destinationIndex, 0, nextDestinationCards.length), 0, card)

    return {
        columns: board.columns.map((column) => {
            if (column.id === sourceColumn.id) {
                return { ...column, cards: nextSourceCards }
            }

            if (column.id === destinationColumn.id) {
                return { ...column, cards: nextDestinationCards }
            }

            return column
        }),
    }
}

export function reorderColumns(board: BoardState, move: BoardColumnMove): BoardState {
    const sourceIndex = board.columns.findIndex((column) => column.id === move.columnId)
    if (sourceIndex === -1) {
        return board
    }

    const columns = [...board.columns]
    const [column] = columns.splice(sourceIndex, 1)
    const adjustedIndex = clamp(
        sourceIndex < move.destinationIndex ? move.destinationIndex - 1 : move.destinationIndex,
        0,
        columns.length,
    )

    if (adjustedIndex === sourceIndex) {
        return board
    }

    columns.splice(adjustedIndex, 0, column)
    return { columns }
}
