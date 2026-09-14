import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Box, ChevronDown, ChevronLeft, ChevronRight, ChevronsDown, Pause, Play, RotateCcw } from 'lucide-react'
import Window from '../../components/system/Window'
import { useWindowStore } from '../../stores/windowStore'
import './TetrisApp.css'

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

function PiecePreview({ name, compact = false }: { name: PieceName | null; compact?: boolean }) {
    return (
        <div className={`grid grid-cols-4 grid-rows-3 gap-[2px] bg-[#101418] ${compact ? 'h-14 p-2' : 'h-20 p-3'}`}>
            {Array.from({ length: 12 }, (_, index) => {
                const x = index % 4
                const y = Math.floor(index / 4)
                const filled = name ? previewCells(name).some(([px, py]) => px === x && py === y) : false
                return <div key={index} className={filled && name ? CELL_COLORS[PIECE_VALUE[name]] : 'bg-transparent'} />
            })}
        </div>
    )
}

export default function TetrisApp({ id }: { id: string }) {
    const isFocused = useWindowStore((state) => Boolean(state.windows[id]?.state.isFocused))
    const [board, setBoard] = useState<Board>(emptyBoard)
    const [active, setActive] = useState<ActivePiece>(() => spawnPiece(randomPiece()))
    const [queue, setQueue] = useState<PieceName[]>(() => [randomPiece(), randomPiece(), randomPiece()])
    const [held, setHeld] = useState<PieceName | null>(null)
    const [canHold, setCanHold] = useState(true)
    const [score, setScore] = useState(0)
    const [lines, setLines] = useState(0)
    const [running, setRunning] = useState(false)
    const [gameOver, setGameOver] = useState(false)
    const boardRef = useRef(board)
    const activeRef = useRef(active)
    const queueRef = useRef(queue)

    useEffect(() => { boardRef.current = board }, [board])
    useEffect(() => { activeRef.current = active }, [active])
    useEffect(() => { queueRef.current = queue }, [queue])

    const level = Math.floor(lines / 10) + 1

    const reset = useCallback(() => {
        const pieces = [randomPiece(), randomPiece(), randomPiece(), randomPiece()]
        setBoard(emptyBoard())
        setActive(spawnPiece(pieces[0]))
        setQueue(pieces.slice(1))
        setHeld(null)
        setCanHold(true)
        setScore(0)
        setLines(0)
        setGameOver(false)
        setRunning(true)
    }, [])

    const lockPiece = useCallback((piece: ActivePiece) => {
        const landed = mergedBoard(boardRef.current, piece)
        const result = clearLines(landed)
        const lineScores = [0, 100, 300, 500, 800]
        const incoming = spawnPiece(queueRef.current[0])
        const nextQueue = [...queueRef.current.slice(1), randomPiece()]

        setBoard(result.board)
        boardRef.current = result.board
        if (result.cleared > 0) {
            setLines((value) => value + result.cleared)
            setScore((value) => value + lineScores[result.cleared] * level)
        }
        setQueue(nextQueue)
        queueRef.current = nextQueue
        setActive(incoming)
        activeRef.current = incoming
        setCanHold(true)

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

    const holdPiece = useCallback(() => {
        if (!running || !canHold) return

        const currentName = activeRef.current.name
        let incoming: ActivePiece
        if (held) {
            incoming = spawnPiece(held)
        } else {
            incoming = spawnPiece(queueRef.current[0])
            const nextQueue = [...queueRef.current.slice(1), randomPiece()]
            setQueue(nextQueue)
            queueRef.current = nextQueue
        }

        setHeld(currentName)
        setActive(incoming)
        activeRef.current = incoming
        setCanHold(false)
    }, [canHold, held, running])

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
            if (event.key.toLowerCase() === 'c') holdPiece()
            if (event.key.toLowerCase() === 'p') setRunning((value) => !gameOver && !value)
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [gameOver, hardDrop, holdPiece, isFocused, move, rotate])

    const activeCells = useMemo(() => new Set(cellsFor(active).map(([x, y]) => `${x}:${y}`)), [active])
    const ghost = useMemo(() => {
        let landing = active
        while (!collides(board, { ...landing, y: landing.y + 1 })) landing = { ...landing, y: landing.y + 1 }
        return landing
    }, [active, board])
    const ghostCells = useMemo(() => new Set(cellsFor(ghost).map(([x, y]) => `${x}:${y}`)), [ghost])

    return (
        <Window id={id} title="Falling Light">
            <div className="tetris-app h-full min-h-0 overflow-hidden bg-[#181c20] text-[#edf1f3]">
                <div className="tetris-layout">
                    <aside className="tetris-left min-h-0 bg-[#20252a] p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8ea0b2]">Hold</p>
                        <div className={`mt-3 transition-opacity ${canHold ? 'opacity-100' : 'opacity-45'}`}><PiecePreview name={held} /></div>
                        <button onClick={holdPiece} disabled={!running || !canHold} className="mt-3 flex w-full items-center justify-center gap-2 rounded-[3px] bg-[#2b3137] px-3 py-2 text-xs font-semibold transition-colors hover:bg-[#343b42] active:scale-95 disabled:opacity-35">
                            <Box className="h-3.5 w-3.5" /> Hold piece
                        </button>
                        <div className="mt-6 border-t border-white/[0.08] pt-4 text-[10px] leading-6 text-[#8394a6]">
                            <p className="font-semibold uppercase tracking-[0.16em] text-[#b6c2cd]">Keys</p>
                            <p><span className="text-[#edf4f8]">← →</span> move</p>
                            <p><span className="text-[#edf4f8]">↑</span> rotate</p>
                            <p><span className="text-[#edf4f8]">Space</span> hard drop</p>
                            <p><span className="text-[#edf4f8]">C</span> hold</p>
                        </div>
                    </aside>

                    <main className="tetris-board-column relative flex min-h-0 min-w-0 flex-col items-center justify-center gap-3">
                        <div className="tetris-board-shell relative bg-[#0d1115] p-1">
                            <div className="grid h-full grid-cols-10 grid-rows-20 gap-px" aria-label="Tetris board">
                                {board.flatMap((row, y) => row.map((settledCell, x) => {
                                    const key = `${x}:${y}`
                                    const isActive = activeCells.has(key)
                                    const isGhost = running && !isActive && !settledCell && ghostCells.has(key)
                                    const cell = settledCell || (isActive ? PIECE_VALUE[active.name] : 0)
                                    return (
                                        <div
                                            key={key}
                                            className={`relative min-h-0 min-w-0 ${cell ? CELL_COLORS[cell] : isGhost ? 'border border-[#aab4bc]/65 bg-[#aab4bc]/10' : 'bg-[#171c21]'}`}
                                        />
                                    )
                                }))}
                            </div>

                            {!running && (
                                <div className="absolute inset-0 flex items-center justify-center bg-[#0d1115]/90 p-4">
                                    <div className="w-full bg-[#e8ecee] px-5 py-6 text-center text-[#161a1d]">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#4f6378]">{gameOver ? 'Stack complete' : score > 0 ? 'Game paused' : 'Falling Light'}</p>
                                        <h2 className="mt-2 text-xl font-semibold tracking-tight">{gameOver ? `${score.toLocaleString()} points` : score > 0 ? 'Hold that thought' : 'Shape the skyline'}</h2>
                                        <p className="mx-auto mt-2 max-w-[25ch] text-xs leading-relaxed text-[#526173]">{gameOver ? `You cleared ${lines} lines. Ready for a cleaner run?` : 'Stack cleanly, plan ahead, and chase the light.'}</p>
                                        <button onClick={score > 0 && !gameOver ? () => setRunning(true) : reset} className="mt-4 inline-flex items-center gap-2 rounded-[3px] bg-[#2f70a5] px-5 py-2 text-xs font-semibold text-[#f2f5f6] transition-colors hover:bg-[#286492] active:scale-95">
                                            <Play className="h-3.5 w-3.5 fill-current" /> {score > 0 && !gameOver ? 'Resume' : 'Start game'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="tetris-controls flex items-center justify-center gap-1.5 text-[#b2bfcb]">
                            <button onClick={() => move(-1, 0)} className="rounded-[3px] bg-[#2b3137] p-2.5 hover:bg-[#343b42] active:scale-95" aria-label="Move left"><ChevronLeft className="h-4 w-4" /></button>
                            <button onClick={rotate} className="rounded-[3px] bg-[#2b3137] px-3 py-2 text-sm font-semibold hover:bg-[#343b42] active:scale-95" aria-label="Rotate">↻</button>
                            <button onClick={() => move(1, 0)} className="rounded-[3px] bg-[#2b3137] p-2.5 hover:bg-[#343b42] active:scale-95" aria-label="Move right"><ChevronRight className="h-4 w-4" /></button>
                            <button onClick={() => move(0, 1)} className="rounded-[3px] bg-[#2b3137] p-2.5 hover:bg-[#343b42] active:scale-95" aria-label="Soft drop"><ChevronDown className="h-4 w-4" /></button>
                            <button onClick={hardDrop} className="rounded-[3px] bg-[#2b3137] p-2.5 hover:bg-[#343b42] active:scale-95" aria-label="Hard drop"><ChevronsDown className="h-4 w-4" /></button>
                            <button onClick={holdPiece} disabled={!running || !canHold} className="rounded-[3px] bg-[#2b3137] p-2.5 hover:bg-[#343b42] active:scale-95 disabled:opacity-35" aria-label="Hold piece"><Box className="h-4 w-4" /></button>
                        </div>
                    </main>

                    <aside className="tetris-right flex min-h-0 flex-col bg-[#20252a] p-4">
                        <div className="tetris-score">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8ea0b2]">Score</p>
                            <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">{score.toLocaleString()}</p>
                        </div>
                        <div className="tetris-stats mt-4 grid grid-cols-2 gap-3 border-y border-white/10 py-3">
                            <div><p className="text-[10px] uppercase tracking-wider text-[#8ea0b2]">Lines</p><p className="mt-1 text-lg font-semibold tabular-nums">{lines}</p></div>
                            <div><p className="text-[10px] uppercase tracking-wider text-[#8ea0b2]">Level</p><p className="mt-1 text-lg font-semibold tabular-nums">{level}</p></div>
                        </div>
                        <div className="tetris-queue mt-4 min-h-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8ea0b2]">Next queue</p>
                            <div className="mt-3 space-y-2">
                                {queue.map((name, index) => <div key={`${name}-${index}`} className={index > 0 ? 'opacity-65' : ''}><PiecePreview name={name} compact={index > 0} /></div>)}
                            </div>
                        </div>
                        <div className="tetris-actions mt-auto space-y-2 pt-4">
                            <button onClick={() => setRunning((value) => !gameOver && !value)} disabled={gameOver || (!running && score === 0)} className="flex w-full items-center justify-center gap-2 rounded-[3px] bg-[#2b3137] px-3 py-2 text-xs font-semibold transition-colors hover:bg-[#343b42] active:scale-95 disabled:opacity-35">
                                {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />} {running ? 'Pause' : 'Resume'}
                            </button>
                            <button onClick={reset} className="flex w-full items-center justify-center gap-2 rounded-[3px] bg-[#2f70a5] px-3 py-2 text-xs font-semibold transition-colors hover:bg-[#286492] active:scale-95">
                                <RotateCcw className="h-3.5 w-3.5" /> New game
                            </button>
                        </div>
                    </aside>
                </div>
            </div>
        </Window>
    )
}
