import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react'
import Window from '../../components/system/Window'
import { useWindowStore } from '../../stores/windowStore'

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20

type Cell = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7
type Board = Cell[][]
type PieceName = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z'
type Point = [number, number]

interface ActivePiece {
    name: PieceName
    rotation: number
    x: number
    y: number
}

const PIECES: Record<PieceName, Point[][]> = {
    I: [
        [[0, 1], [1, 1], [2, 1], [3, 1]],
        [[2, 0], [2, 1], [2, 2], [2, 3]],
    ],
    J: [
        [[0, 0], [0, 1], [1, 1], [2, 1]],
        [[1, 0], [2, 0], [1, 1], [1, 2]],
        [[0, 1], [1, 1], [2, 1], [2, 2]],
        [[1, 0], [1, 1], [0, 2], [1, 2]],
    ],
    L: [
        [[2, 0], [0, 1], [1, 1], [2, 1]],
        [[1, 0], [1, 1], [1, 2], [2, 2]],
        [[0, 1], [1, 1], [2, 1], [0, 2]],
        [[0, 0], [1, 0], [1, 1], [1, 2]],
    ],
    O: [[[1, 0], [2, 0], [1, 1], [2, 1]]],
    S: [
        [[1, 0], [2, 0], [0, 1], [1, 1]],
        [[1, 0], [1, 1], [2, 1], [2, 2]],
    ],
    T: [
        [[1, 0], [0, 1], [1, 1], [2, 1]],
        [[1, 0], [1, 1], [2, 1], [1, 2]],
        [[0, 1], [1, 1], [2, 1], [1, 2]],
        [[1, 0], [0, 1], [1, 1], [1, 2]],
    ],
    Z: [
        [[0, 0], [1, 0], [1, 1], [2, 1]],
        [[2, 0], [1, 1], [2, 1], [1, 2]],
    ],
}

const PIECE_VALUE: Record<PieceName, Cell> = { I: 1, J: 2, L: 3, O: 4, S: 5, T: 6, Z: 7 }
const CELL_COLORS = [
    'bg-transparent',
    'bg-[#48c6e8]',
    'bg-[#4579d9]',
    'bg-[#ed9a3b]',
    'bg-[#e5ca52]',
    'bg-[#65bb77]',
    'bg-[#9976cf]',
    'bg-[#dc6268]',
]
const NAMES = Object.keys(PIECES) as PieceName[]

function emptyBoard(): Board {
    return Array.from({ length: BOARD_HEIGHT }, () => Array<Cell>(BOARD_WIDTH).fill(0))
}

function randomPiece(): PieceName {
    return NAMES[Math.floor(Math.random() * NAMES.length)]
}

function spawnPiece(name: PieceName): ActivePiece {
    return { name, rotation: 0, x: 3, y: -1 }
}

function cellsFor(piece: ActivePiece): Point[] {
    const rotations = PIECES[piece.name]
    return rotations[piece.rotation % rotations.length].map(([x, y]) => [x + piece.x, y + piece.y])
}

function collides(board: Board, piece: ActivePiece) {
    return cellsFor(piece).some(([x, y]) => x < 0 || x >= BOARD_WIDTH || y >= BOARD_HEIGHT || (y >= 0 && board[y][x] !== 0))
}

function mergedBoard(board: Board, piece: ActivePiece): Board {
    const next = board.map((row) => [...row])
    cellsFor(piece).forEach(([x, y]) => {
        if (y >= 0 && y < BOARD_HEIGHT) next[y][x] = PIECE_VALUE[piece.name]
    })
    return next
}

function clearLines(board: Board) {
    const remaining = board.filter((row) => row.some((cell) => cell === 0))
    const cleared = BOARD_HEIGHT - remaining.length
    return {
        board: [...Array.from({ length: cleared }, () => Array<Cell>(BOARD_WIDTH).fill(0)), ...remaining],
        cleared,
    }
}

function previewCells(name: PieceName) {
    return PIECES[name][0]
}

export default function TetrisApp({ id }: { id: string }) {
    const isFocused = useWindowStore((state) => Boolean(state.windows[id]?.state.isFocused))
    const [board, setBoard] = useState<Board>(emptyBoard)
    const [active, setActive] = useState<ActivePiece>(() => spawnPiece(randomPiece()))
    const [next, setNext] = useState<PieceName>(() => randomPiece())
    const [score, setScore] = useState(0)
    const [lines, setLines] = useState(0)
    const [running, setRunning] = useState(false)
    const [gameOver, setGameOver] = useState(false)
    const boardRef = useRef(board)
    const activeRef = useRef(active)
    const nextRef = useRef(next)

    useEffect(() => { boardRef.current = board }, [board])
    useEffect(() => { activeRef.current = active }, [active])
    useEffect(() => { nextRef.current = next }, [next])

    const level = Math.floor(lines / 10) + 1

    const reset = useCallback(() => {
        const first = randomPiece()
        const upcoming = randomPiece()
        setBoard(emptyBoard())
        setActive(spawnPiece(first))
        setNext(upcoming)
        setScore(0)
        setLines(0)
        setGameOver(false)
        setRunning(true)
    }, [])

    const lockPiece = useCallback((piece: ActivePiece) => {
        const landed = mergedBoard(boardRef.current, piece)
        const result = clearLines(landed)
        const lineScores = [0, 100, 300, 500, 800]
        const incoming = spawnPiece(nextRef.current)
        const upcoming = randomPiece()

        setBoard(result.board)
        boardRef.current = result.board
        if (result.cleared > 0) {
            setLines((value) => value + result.cleared)
            setScore((value) => value + lineScores[result.cleared] * level)
        }
        setNext(upcoming)
        nextRef.current = upcoming
        setActive(incoming)
        activeRef.current = incoming

        if (collides(result.board, incoming)) {
            setRunning(false)
            setGameOver(true)
        }
    }, [level])

    const move = useCallback((dx: number, dy: number) => {
        if (!running) return false
        const candidate = { ...activeRef.current, x: activeRef.current.x + dx, y: activeRef.current.y + dy }
        if (collides(boardRef.current, candidate)) {
            if (dy > 0) lockPiece(activeRef.current)
            return false
        }
        setActive(candidate)
        activeRef.current = candidate
        if (dy > 0) setScore((value) => value + 1)
        return true
    }, [lockPiece, running])

    const rotate = useCallback(() => {
        if (!running) return
        const current = activeRef.current
        const candidate = { ...current, rotation: (current.rotation + 1) % PIECES[current.name].length }
        const kicks = [0, -1, 1, -2, 2]
        const valid = kicks.map((kick) => ({ ...candidate, x: candidate.x + kick })).find((piece) => !collides(boardRef.current, piece))
        if (valid) {
            setActive(valid)
            activeRef.current = valid
        }
    }, [running])

    const hardDrop = useCallback(() => {
        if (!running) return
        let dropped = activeRef.current
        let distance = 0
        while (!collides(boardRef.current, { ...dropped, y: dropped.y + 1 })) {
            dropped = { ...dropped, y: dropped.y + 1 }
            distance += 1
        }
        setScore((value) => value + distance * 2)
        lockPiece(dropped)
    }, [lockPiece, running])

    useEffect(() => {
        if (!running) return undefined
        const timer = window.setInterval(() => move(0, 1), Math.max(160, 760 - (level - 1) * 60))
        return () => window.clearInterval(timer)
    }, [level, move, running])

    useEffect(() => {
        if (!isFocused) return undefined
        const onKeyDown = (event: KeyboardEvent) => {
            if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' '].includes(event.key)) event.preventDefault()
            if (event.key === 'ArrowLeft') move(-1, 0)
            if (event.key === 'ArrowRight') move(1, 0)
            if (event.key === 'ArrowDown') move(0, 1)
            if (event.key === 'ArrowUp') rotate()
            if (event.key === ' ') hardDrop()
            if (event.key.toLowerCase() === 'p') setRunning((value) => !gameOver && !value)
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [gameOver, hardDrop, isFocused, move, rotate])

    const display = useMemo(() => mergedBoard(board, active), [active, board])

    return (
        <Window id={id} title="Falling Light">
            <div className="flex h-full min-h-0 bg-[#111923] text-[#edf4f8]">
                <main className="relative flex min-w-0 flex-1 items-center justify-center overflow-hidden px-5 py-4">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[#172333]" />
                    <div className="relative h-full max-h-[620px] aspect-[1/2] border border-white/10 bg-[#0a1119] p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                        <div className="grid h-full grid-cols-10 grid-rows-20 gap-[2px]" aria-label="Tetris board">
                            {display.flatMap((row, y) => row.map((cell, x) => (
                                <div
                                    key={`${x}-${y}`}
                                    className={`relative min-h-0 min-w-0 rounded-[2px] border ${cell ? `${CELL_COLORS[cell]} border-white/15` : 'border-white/[0.035] bg-white/[0.018]'}`}
                                >
                                    {cell > 0 && <span className="absolute inset-[2px] border-l border-t border-white/20" />}
                                </div>
                            )))}
                        </div>

                        {!running && (
                            <div className="absolute inset-0 flex items-center justify-center bg-[#0a1119]/80 p-5 backdrop-blur-[2px]">
                                <div className="w-full bg-[#edf4f8] px-5 py-6 text-center text-[#111923]">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4f6378]">{gameOver ? 'Stack complete' : score > 0 ? 'Game paused' : 'Falling Light'}</p>
                                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">{gameOver ? `${score.toLocaleString()} points` : score > 0 ? 'Hold that thought' : 'Shape the skyline'}</h2>
                                    <p className="mx-auto mt-2 max-w-[26ch] text-sm leading-relaxed text-[#526173]">{gameOver ? `You cleared ${lines} lines. Ready for a cleaner run?` : 'A precise, quiet take on the block-stacking classic.'}</p>
                                    <button onClick={score > 0 && !gameOver ? () => setRunning(true) : reset} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#0066cc] px-5 py-2 text-sm font-semibold text-white transition-transform active:scale-95">
                                        <Play className="h-4 w-4 fill-current" /> {score > 0 && !gameOver ? 'Resume' : 'Start game'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </main>

                <aside className="flex w-52 shrink-0 flex-col border-l border-white/10 bg-[#172333] p-5">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8ea0b2]">Score</p>
                        <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">{score.toLocaleString()}</p>
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-3 border-y border-white/10 py-4">
                        <div><p className="text-[10px] uppercase tracking-wider text-[#8ea0b2]">Lines</p><p className="mt-1 text-lg font-semibold tabular-nums">{lines}</p></div>
                        <div><p className="text-[10px] uppercase tracking-wider text-[#8ea0b2]">Level</p><p className="mt-1 text-lg font-semibold tabular-nums">{level}</p></div>
                    </div>
                    <div className="mt-5">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8ea0b2]">Up next</p>
                        <div className="mt-3 grid h-20 grid-cols-4 grid-rows-3 gap-1 bg-[#0e1721] p-3">
                            {Array.from({ length: 12 }, (_, index) => {
                                const x = index % 4
                                const y = Math.floor(index / 4)
                                const filled = previewCells(next).some(([px, py]) => px === x && py === y)
                                return <div key={index} className={`rounded-[2px] border ${filled ? `${CELL_COLORS[PIECE_VALUE[next]]} border-white/15` : 'border-transparent'}`} />
                            })}
                        </div>
                    </div>
                    <div className="mt-auto space-y-2 pt-5">
                        <button onClick={() => setRunning((value) => !gameOver && !value)} disabled={gameOver || score === 0} className="flex w-full items-center justify-center gap-2 rounded-full border border-white/15 px-3 py-2 text-xs font-semibold transition-colors hover:bg-white/5 active:scale-95 disabled:opacity-35">
                            {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />} {running ? 'Pause' : 'Resume'}
                        </button>
                        <button onClick={reset} className="flex w-full items-center justify-center gap-2 rounded-full border border-white/15 px-3 py-2 text-xs font-semibold transition-colors hover:bg-white/5 active:scale-95">
                            <RotateCcw className="h-3.5 w-3.5" /> New game
                        </button>
                    </div>
                </aside>

                <div className="absolute bottom-4 left-5 hidden items-center gap-1 text-[#8ea0b2] lg:flex">
                    <button onClick={() => move(-1, 0)} className="rounded-md border border-white/10 bg-[#172333] p-2 active:scale-95" aria-label="Move left"><ChevronLeft className="h-4 w-4" /></button>
                    <button onClick={rotate} className="rounded-md border border-white/10 bg-[#172333] p-2 text-xs font-semibold active:scale-95" aria-label="Rotate">↻</button>
                    <button onClick={() => move(1, 0)} className="rounded-md border border-white/10 bg-[#172333] p-2 active:scale-95" aria-label="Move right"><ChevronRight className="h-4 w-4" /></button>
                    <button onClick={() => move(0, 1)} className="rounded-md border border-white/10 bg-[#172333] p-2 active:scale-95" aria-label="Soft drop"><ChevronDown className="h-4 w-4" /></button>
                </div>
            </div>
        </Window>
    )
}
