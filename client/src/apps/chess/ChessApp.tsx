import { useMemo, useState } from 'react'
import { Crown, RotateCcw, RotateCw, Swords } from 'lucide-react'
import Window from '../../components/system/Window'
import './ChessApp.css'

type Color = 'white' | 'black'
type Kind = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn'
type Piece = { color: Color; kind: Kind }
type Board = Record<string, Piece>

const GLYPHS: Record<Color, Record<Kind, string>> = {
    white: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' },
    black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' },
}

const BACK_RANK: Kind[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook']
const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

function square(x: number, y: number) {
    return `${FILES[x]}${y + 1}`
}

function coords(id: string): [number, number] {
    return [FILES.indexOf(id[0]), Number(id[1]) - 1]
}

function initialBoard(): Board {
    const board: Board = {}
    FILES.forEach((_, x) => {
        board[square(x, 0)] = { color: 'white', kind: BACK_RANK[x] }
        board[square(x, 1)] = { color: 'white', kind: 'pawn' }
        board[square(x, 6)] = { color: 'black', kind: 'pawn' }
        board[square(x, 7)] = { color: 'black', kind: BACK_RANK[x] }
    })
    return board
}

function isInside(x: number, y: number) {
    return x >= 0 && x < 8 && y >= 0 && y < 8
}

function rayMoves(board: Board, from: string, color: Color, directions: Array<[number, number]>) {
    const [startX, startY] = coords(from)
    const moves: string[] = []
    directions.forEach(([dx, dy]) => {
        let x = startX + dx
        let y = startY + dy
        while (isInside(x, y)) {
            const id = square(x, y)
            const occupant = board[id]
            if (!occupant) moves.push(id)
            if (occupant) {
                if (occupant.color !== color) moves.push(id)
                break
            }
            x += dx
            y += dy
        }
    })
    return moves
}

function legalMoves(board: Board, from: string): string[] {
    const piece = board[from]
    if (!piece) return []
    const [x, y] = coords(from)
    const candidate = (dx: number, dy: number) => {
        const nx = x + dx
        const ny = y + dy
        if (!isInside(nx, ny)) return null
        const id = square(nx, ny)
        return !board[id] || board[id].color !== piece.color ? id : null
    }

    if (piece.kind === 'pawn') {
        const direction = piece.color === 'white' ? 1 : -1
        const startRank = piece.color === 'white' ? 1 : 6
        const moves: string[] = []
        const one = square(x, y + direction)
        if (!board[one]) {
            moves.push(one)
            const two = square(x, y + direction * 2)
            if (y === startRank && !board[two]) moves.push(two)
        }
        ;[-1, 1].forEach((dx) => {
            if (!isInside(x + dx, y + direction)) return
            const target = square(x + dx, y + direction)
            if (board[target] && board[target].color !== piece.color) moves.push(target)
        })
        return moves
    }

    if (piece.kind === 'knight') {
        return [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]]
            .map(([dx, dy]) => candidate(dx, dy))
            .filter((id): id is string => Boolean(id))
    }

    if (piece.kind === 'king') {
        return [-1, 0, 1].flatMap((dx) => [-1, 0, 1].map((dy) => dx || dy ? candidate(dx, dy) : null))
            .filter((id): id is string => Boolean(id))
    }

    const diagonal: Array<[number, number]> = [[1, 1], [1, -1], [-1, 1], [-1, -1]]
    const straight: Array<[number, number]> = [[1, 0], [-1, 0], [0, 1], [0, -1]]
    if (piece.kind === 'bishop') return rayMoves(board, from, piece.color, diagonal)
    if (piece.kind === 'rook') return rayMoves(board, from, piece.color, straight)
    return rayMoves(board, from, piece.color, [...diagonal, ...straight])
}

function moveLabel(piece: Piece, from: string, to: string, captured?: Piece) {
    const name = piece.kind[0].toUpperCase() + piece.kind.slice(1)
    return `${name} ${from.toUpperCase()}${captured ? ' × ' : ' → '}${to.toUpperCase()}`
}

function ChessPiece({ piece }: { piece: Piece }) {
    const isWhite = piece.color === 'white'
    const glyph = GLYPHS[piece.color][piece.kind]

    return (
        <span
            className="relative z-20 flex h-[78%] w-[78%] select-none items-center justify-center font-serif text-[clamp(30px,4vw,58px)] leading-none transition-transform duration-150 [transform:translateZ(26px)_rotateX(-8deg)] group-active:scale-95"
            aria-hidden
        >
            <span
                className={`absolute translate-y-[5px] scale-[1.015] ${isWhite ? 'text-[#81796c]' : 'text-[#080b0a]'}`}
            >
                {glyph}
            </span>
            <span
                className={`relative [filter:drop-shadow(0_3px_3px_rgba(10,12,11,0.28))] ${isWhite ? 'text-[#f2ece0]' : 'text-[#242928]'}`}
            >
                {glyph}
            </span>
        </span>
    )
}

export default function ChessApp({ id }: { id: string }) {
    const [board, setBoard] = useState<Board>(initialBoard)
    const [turn, setTurn] = useState<Color>('white')
    const [selected, setSelected] = useState<string | null>(null)
    const [flipped, setFlipped] = useState(false)
    const [moves, setMoves] = useState<string[]>([])
    const [captured, setCaptured] = useState<Piece[]>([])

    const targets = useMemo(() => selected ? legalMoves(board, selected) : [], [board, selected])
    const ranks = flipped ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1]
    const files = flipped ? [...FILES].reverse() : FILES

    const chooseSquare = (target: string) => {
        const occupant = board[target]
        if (!selected) {
            if (occupant?.color === turn) setSelected(target)
            return
        }

        if (occupant?.color === turn) {
            setSelected(target)
            return
        }

        if (!targets.includes(target)) {
            setSelected(null)
            return
        }

        const moving = board[selected]
        const next = { ...board }
        delete next[selected]
        next[target] = moving
        setBoard(next)
        setMoves((history) => [moveLabel(moving, selected, target, occupant), ...history].slice(0, 12))
        if (occupant) setCaptured((pieces) => [...pieces, occupant])
        setTurn((color) => color === 'white' ? 'black' : 'white')
        setSelected(null)
    }

    const reset = () => {
        setBoard(initialBoard())
        setTurn('white')
        setSelected(null)
        setMoves([])
        setCaptured([])
    }

    return (
        <Window id={id} title="Obsidian Chess">
            <div className="chess-app h-full min-h-0 overflow-hidden bg-[#e8e5dc] text-[#20201f]">
                <div className="chess-layout flex h-full min-h-0">
                <main className="chess-board-area relative flex min-w-0 flex-1 items-center justify-center overflow-hidden px-8 py-6 [perspective:1600px]">
                    <div className="absolute bottom-[7%] h-8 w-[64%] max-w-[620px] rounded-[50%] bg-[#272b29]/15 blur-2xl" />
                    <div className="relative aspect-square w-[min(88%,660px)] max-h-[92%] [transform-style:preserve-3d] [transform:rotateX(12deg)]">
                        <div className="absolute -inset-[14px] translate-y-[18px] bg-[#121614] [transform:translateZ(-22px)]" />
                        <div className="absolute -inset-[14px] bg-[#242a27] p-2 [transform:translateZ(-4px)]">
                            <div className="h-full w-full border border-[#60675f]" />
                        </div>
                        <div className="grid h-full w-full grid-cols-8 overflow-hidden border border-[#151a18] bg-[#242a27] shadow-[0_18px_38px_rgba(27,30,28,0.22)] [transform:translateZ(0px)]">
                            {ranks.flatMap((rank, row) => files.map((file, column) => {
                                const squareId = `${file}${rank}`
                                const piece = board[squareId]
                                const isLight = (FILES.indexOf(file) + rank) % 2 === 1
                                const isSelected = selected === squareId
                                const isTarget = targets.includes(squareId)
                                return (
                                    <button
                                        key={squareId}
                                        onClick={() => chooseSquare(squareId)}
                                        className={`group relative flex items-center justify-center transition-colors duration-150 focus:z-30 ${isLight ? 'bg-[#d9d6cb]' : 'bg-[#69766f]'} ${isSelected ? '!bg-[#76a8cf]' : ''}`}
                                        aria-label={`${squareId}${piece ? ` ${piece.color} ${piece.kind}` : ''}`}
                                    >
                                        {row === 7 && <span className={`absolute bottom-1 right-1.5 text-[8px] font-semibold uppercase ${isLight ? 'text-[#69766f]' : 'text-[#d9d6cb]'}`}>{file}</span>}
                                        {column === 0 && <span className={`absolute left-1.5 top-1 text-[8px] font-semibold ${isLight ? 'text-[#69766f]' : 'text-[#d9d6cb]'}`}>{rank}</span>}
                                        {isTarget && <span className={`absolute z-10 rounded-full ${piece ? 'inset-1.5 border-[3px] border-[#0066cc]/70' : 'h-[16%] w-[16%] bg-[#0066cc]/55'}`} />}
                                        {piece && <ChessPiece piece={piece} />}
                                    </button>
                                )
                            }))}
                        </div>
                    </div>
                </main>

                <aside className="chess-sidebar flex w-64 shrink-0 flex-col border-l border-[#cbc4b5] bg-[#f5f1e8]">
                    <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#777166]">Live match</p>
                                <h2 className="mt-1 text-xl font-semibold tracking-tight">A quiet duel</h2>
                            </div>
                            <Swords className="mt-0.5 h-5 w-5 text-[#6b7766]" />
                        </div>
                        <div className="mt-5 flex items-center gap-3 border-y border-[#d8d1c3] py-4">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${turn === 'white' ? 'bg-[#272824] text-[#f7f0e4]' : 'bg-[#6b7766] text-[#20201f]'}`}><Crown className="h-5 w-5" /></div>
                            <div><p className="text-sm font-semibold capitalize">{turn} to move</p><p className="mt-0.5 text-xs text-[#777166]">{selected ? `${targets.length} legal moves` : 'Select a piece'}</p></div>
                        </div>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto border-t border-[#d8d1c3] px-5 py-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#777166]">Move ledger</p>
                        {moves.length === 0 ? (
                            <div className="mt-5 text-center"><p className="font-serif text-3xl text-[#9b9487]">♙</p><p className="mt-2 text-xs leading-relaxed text-[#777166]">White opens the match.<br />Choose a piece on the board.</p></div>
                        ) : (
                            <ol className="mt-3 space-y-1.5">
                                {moves.map((move, index) => <li key={`${move}-${index}`} className="flex gap-2 text-xs"><span className="w-5 text-[#9b9487] tabular-nums">{moves.length - index}.</span><span className="font-semibold text-[#4f4b44]">{move}</span></li>)}
                            </ol>
                        )}
                    </div>

                    <div className="border-t border-[#d8d1c3] p-5">
                        {captured.length > 0 && <div className="mb-4 flex min-h-6 flex-wrap items-center gap-0.5 text-lg text-[#6f695f]" aria-label="Captured pieces">{captured.map((piece, index) => <span key={`${piece.color}-${piece.kind}-${index}`}>{GLYPHS[piece.color][piece.kind]}</span>)}</div>}
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => setFlipped((value) => !value)} className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#c7bfae] px-3 py-2 text-xs font-semibold transition-colors hover:bg-[#ebe5d8] active:scale-95"><RotateCw className="h-3.5 w-3.5" /> Flip board</button>
                            <button onClick={reset} className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#233a43] px-3 py-2 text-xs font-semibold text-[#f7f0e4] transition-opacity hover:opacity-90 active:scale-95"><RotateCcw className="h-3.5 w-3.5" /> New match</button>
                        </div>
                    </div>
                </aside>
                </div>
            </div>
        </Window>
    )
}
