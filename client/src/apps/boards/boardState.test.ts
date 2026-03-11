import { describe, expect, it } from 'vitest'
import type { BoardState } from './boardModel'
import { findCardLocation, moveCard, reorderColumns, updateCardDescription } from './boardState'

function createBoard(): BoardState {
    return {
        columns: [
            {
                id: 'todo',
                title: 'To Do',
                cards: [
                    { id: 'a', title: 'A', description: '' },
                    { id: 'b', title: 'B', description: '' },
                ],
            },
            {
                id: 'doing',
                title: 'Doing',
                cards: [
                    { id: 'c', title: 'C', description: '' },
                ],
            },
            {
                id: 'done',
                title: 'Done',
                cards: [],
            },
        ],
    }
}

describe('boardState', () => {
    it('moves a card between columns at an explicit drop slot', () => {
        const next = moveCard(createBoard(), {
            cardId: 'a',
            sourceColumnId: 'todo',
            destinationColumnId: 'doing',
            destinationIndex: 1,
        })

        expect(next.columns[0].cards.map((card) => card.id)).toEqual(['b'])
        expect(next.columns[1].cards.map((card) => card.id)).toEqual(['c', 'a'])
    })

    it('reorders a card within the same column', () => {
        const next = moveCard(createBoard(), {
            cardId: 'a',
            sourceColumnId: 'todo',
            destinationColumnId: 'todo',
            destinationIndex: 2,
        })

        expect(next.columns[0].cards.map((card) => card.id)).toEqual(['b', 'a'])
    })

    it('reorders columns using drop slot positions', () => {
        const next = reorderColumns(createBoard(), {
            columnId: 'todo',
            destinationIndex: 2,
        })

        expect(next.columns.map((column) => column.id)).toEqual(['doing', 'todo', 'done'])
    })

    it('finds a card location for keyboard fallback actions', () => {
        expect(findCardLocation(createBoard(), 'c')).toEqual({
            columnId: 'doing',
            columnIndex: 1,
            cardIndex: 0,
        })
    })

    it('updates card descriptions without mutating other cards', () => {
        const next = updateCardDescription(createBoard(), 'todo', 'b', 'Detailed follow-up')

        expect(next.columns[0].cards[1].description).toBe('Detailed follow-up')
        expect(next.columns[1].cards[0].description).toBe('')
    })
})
