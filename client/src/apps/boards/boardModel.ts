export interface BoardCard {
    id: string
    title: string
    description: string
}

export interface BoardColumn {
    id: string
    title: string
    cards: BoardCard[]
}

export interface BoardState {
    columns: BoardColumn[]
}

export function createBoardTemplate(): BoardState {
    return {
        columns: [
            { id: 'todo', title: 'To Do', cards: [] },
            { id: 'doing', title: 'In Progress', cards: [] },
            { id: 'done', title: 'Done', cards: [] },
        ],
    }
}

export function parseBoardState(value: string): BoardState {
    try {
        const parsed = JSON.parse(value) as BoardState
        if (!parsed || !Array.isArray(parsed.columns)) {
            return createBoardTemplate()
        }
        return parsed
    } catch {
        return createBoardTemplate()
    }
}
