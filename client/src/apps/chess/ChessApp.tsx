import { useMemo, useState } from 'react'
import { Crown, RotateCcw, RotateCw, Swords } from 'lucide-react'
import Window from '../../components/system/Window'

type Color = 'white' | 'black'
type Kind = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn'
type Piece = { color: Color; kind: Kind }
type Board = Record<string, Piece>

const GLYPHS: Record<Color, Record<Kind, string>> = {
    white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
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
            <div className="flex h-full min-h-0 bg-[#ede9df] text-[#20201f]">
                <main className="relative flex min-w-0 flex-1 items-center justify-center overflow-hidden px-6 py-5 [perspective:1200px]">
                    <div className="absolute inset-x-0 top-0 h-20 bg-[#ded8ca]" />
                    <div className="absolute bottom-[8%] h-10 w-[68%] max-w-[620px] rounded-[50%] bg-black/15 blur-2xl" />
                    <div className="relative w-[min(82%,620px)] max-h-full aspect-square [transform-style:preserve-3d] [transform:rotateX(44deg)_rotateZ(-1deg)]">
                        <div className="absolute -inset-3 translate-y-5 bg-[#292722] [transform:translateZ(-18px)]" />
                        <div className="grid h-full w-full grid-cols-8 border-[10px] border-[#35312b] bg-[#35312b] shadow-[0_24px_45px_rgba(30,25,18,0.26)]">
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
                                        className={`group relative flex items-center justify-center transition-colors duration-150 ${isLight ? 'bg-[#d8cfbb]' : 'bg-[#6b7766]'} ${isSelected ? '!bg-[#8fa9b8]' : ''}`}
                                        aria-label={`${squareId}${piece ? ` ${piece.color} ${piece.kind}` : ''}`}
                                    >
                                        {row === 7 && <span className={`absolute bottom-0.5 right-1 text-[8px] font-semibold ${isLight ? 'text-[#6b7766]' : 'text-[#d8cfbb]'}`}>{file}</span>}
                                        {column === 0 && <span className={`absolute left-1 top-0.5 text-[8px] font-semibold ${isLight ? 'text-[#6b7766]' : 'text-[#d8cfbb]'}`}>{rank}</span>}
                                        {isTarget && <span className={`absolute z-10 rounded-full ${piece ? 'inset-1.5 border-[3px] border-[#a64e42]/70' : 'h-[18%] w-[18%] bg-[#233a43]/40'}`} />}
                                        {piece && (
                                            <span
                                                className={`relative z-20 select-none font-serif text-[clamp(26px,4.4vw,58px)] leading-none transition-transform duration-150 [transform:translateZ(22px)_rotateX(-28deg)] group-active:scale-95 ${piece.color === 'white' ? 'text-[#f8f3e8] [text-shadow:0_2px_0_#a69d8b,0_5px_8px_rgba(0,0,0,0.38)]' : 'text-[#232522] [text-shadow:0_2px_0_#8a8e82,0_5px_8px_rgba(0,0,0,0.45)]'}`}
                                            >
                                                {GLYPHS[piece.color][piece.kind]}
                                            </span>
                                        )}
                                    </button>
                                )
                            }))}
                        </div>
                    </div>
                </main>

                <aside className="flex w-64 shrink-0 flex-col border-l border-[#cbc4b5] bg-[#f5f1e8]">
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
        </Window>
    )
}
