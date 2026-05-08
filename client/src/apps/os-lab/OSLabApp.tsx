import { useState, type FormEvent } from 'react'
import Window from '../../components/system/Window'
import {
    simulateCpuScheduling,
    simulateDiskScheduling,
    type CpuAlgorithm,
    type CpuExecutionSegment,
    type CpuProcessInput,
    type CpuSimulationResult,
    type DiskAlgorithm,
    type DiskSimulationResult,
    type ScanDirection,
} from './scheduling'

const CPU_PRESET: CpuProcessInput[] = [
    { pid: 'P1', arrivalTime: 0, burstTime: 7, priority: 2 },
    { pid: 'P2', arrivalTime: 2, burstTime: 4, priority: 1 },
    { pid: 'P3', arrivalTime: 4, burstTime: 1, priority: 3 },
    { pid: 'P4', arrivalTime: 5, burstTime: 4, priority: 2 },
]

const DISK_PRESET = '98, 183, 37, 122, 14, 124, 65, 67'

const CPU_ALGORITHM_OPTIONS: Array<{ value: CpuAlgorithm; label: string; note: string }> = [
    { value: 'fcfs', label: 'FCFS', note: 'Arrival order, simple baseline' },
    { value: 'sjf', label: 'SJF', note: 'Shortest burst first, non-preemptive' },
    { value: 'srtf', label: 'SRTF', note: 'Shortest remaining time, preemptive' },
    { value: 'rr', label: 'Round Robin', note: 'Time-sliced fairness with configurable quantum' },
    { value: 'priority-np', label: 'Priority', note: 'Non-preemptive, lower number means higher priority' },
    { value: 'priority-p', label: 'Priority (Preemptive)', note: 'Preemptive priority scheduling' },
]

const DISK_ALGORITHM_OPTIONS: Array<{ value: DiskAlgorithm; label: string; note: string }> = [
    { value: 'fcfs', label: 'FCFS', note: 'Queue order only' },
    { value: 'sstf', label: 'SSTF', note: 'Nearest next cylinder' },
    { value: 'scan', label: 'SCAN', note: 'Elevator sweep with reversal at the boundary' },
    { value: 'c-scan', label: 'C-SCAN', note: 'Single-direction sweep with circular wrap' },
]

function formatNumber(value: number) {
    return value.toFixed(2).replace(/\.00$/, '')
}

function parseQueue(value: string) {
    return value
        .split(',')
        .map((item) => Number(item.trim()))
        .filter((item) => Number.isFinite(item))
}

function getCpuInsight(result: CpuSimulationResult) {
    const heaviestWait = [...result.metrics].sort((left, right) => right.waitingTime - left.waitingTime)[0]
    if (!heaviestWait) {
        return 'Add a process set to compare scheduling behavior.'
    }

    return `${heaviestWait.pid} experiences the largest queue delay at ${formatNumber(heaviestWait.waitingTime)} time units.`
}

function getDiskInsight(result: DiskSimulationResult) {
    if (result.order.length === 0) {
        return 'Enter a request queue to trace head movement.'
    }

    return `The head services ${result.order.length} moves with a total seek distance of ${result.totalSeekDistance} cylinders.`
}

function GanttChart({ segments }: { segments: CpuExecutionSegment[] }) {
    const total = segments[segments.length - 1]?.end ?? 0

    if (segments.length === 0 || total === 0) {
        return <div className="os-subtle-panel rounded-2xl border border-dashed p-5 text-sm os-text-muted">No execution timeline yet.</div>
    }

    return (
        <div className="space-y-3">
            <div className="flex min-h-[5.5rem] overflow-hidden rounded-2xl border border-white/10 bg-[color-mix(in_oklab,var(--os-bg-1)_82%,transparent)]">
                {segments.map((segment, index) => {
                    const width = `${(segment.end - segment.start) / total * 100}%`
                    const isIdle = segment.pid === 'Idle'
                    return (
                        <div
                            key={`${segment.pid}-${segment.start}-${segment.end}-${index}`}
                            className={`flex min-w-[3.5rem] flex-col justify-between border-r px-3 py-3 text-xs last:border-r-0 ${isIdle ? 'bg-white/5 text-[var(--os-text-1)]' : 'bg-[linear-gradient(180deg,color-mix(in_oklab,var(--os-accent)_20%,transparent),color-mix(in_oklab,var(--os-surface-1)_90%,transparent))] text-[var(--os-text-0)]'}`}
                            style={{ width }}
                        >
                            <span className="font-semibold uppercase tracking-[0.18em]">{segment.pid}</span>
                            <span className="text-[11px] opacity-75">{segment.end - segment.start} units</span>
                        </div>
                    )
                })}
            </div>
            <div className="flex items-center justify-between text-[11px] os-text-muted">
                {segments.map((segment, index) => (
                    <span key={`${segment.pid}-tick-${segment.start}-${index}`}>{segment.start}</span>
                ))}
                <span>{segments[segments.length - 1].end}</span>
            </div>
        </div>
    )
}

function DiskChart({ points, maxCylinder }: { points: number[]; maxCylinder: number }) {
    if (points.length < 2) {
        return <div className="os-subtle-panel rounded-2xl border border-dashed p-5 text-sm os-text-muted">No head movement to plot yet.</div>
    }

    const width = 760
    const height = 260
    const paddingX = 34
    const paddingY = 22
    const plotWidth = width - paddingX * 2
    const plotHeight = height - paddingY * 2
    const xStep = points.length > 1 ? plotWidth / (points.length - 1) : 0
    const safeMax = Math.max(1, maxCylinder)

    const coordinates = points.map((point, index) => {
        const x = paddingX + index * xStep
        const y = paddingY + (1 - point / safeMax) * plotHeight
        return { x, y, value: point, index }
    })

    const polyline = coordinates.map((point) => `${point.x},${point.y}`).join(' ')

    return (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[color-mix(in_oklab,var(--os-bg-1)_82%,transparent)] p-3">
            <svg viewBox={`0 0 ${width} ${height}`} className="h-[18rem] w-full" role="img" aria-label="Disk head movement chart">
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                    const y = paddingY + ratio * plotHeight
                    const label = Math.round((1 - ratio) * safeMax)
                    return (
                        <g key={ratio}>
                            <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="rgb(148 163 184 / 0.2)" strokeWidth="1" />
                            <text x={8} y={y + 4} fontSize="10" fill="var(--os-text-1)">{label}</text>
                        </g>
                    )
                })}
                <polyline fill="none" stroke="var(--os-accent)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" points={polyline} />
                {coordinates.map((point) => (
                    <g key={`${point.index}-${point.value}`}>
                        <circle cx={point.x} cy={point.y} r="4.5" fill="color-mix(in oklab, var(--os-accent) 78%, white 22%)" />
                        <text x={point.x} y={height - 6} textAnchor="middle" fontSize="10" fill="var(--os-text-1)">{point.index}</text>
                    </g>
                ))}
            </svg>
        </div>
    )
}

function CpuTab() {
    const [algorithm, setAlgorithm] = useState<CpuAlgorithm>('srtf')
    const [quantum, setQuantum] = useState(2)
    const [processes, setProcesses] = useState<CpuProcessInput[]>(CPU_PRESET)
    const [draft, setDraft] = useState<CpuProcessInput>({ pid: 'P5', arrivalTime: 6, burstTime: 3, priority: 2 })

    const result = simulateCpuScheduling(processes, algorithm, quantum)

    const handleAddProcess = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!draft.pid.trim()) {
            return
        }

        setProcesses((current) => [...current, {
            pid: draft.pid.trim(),
            arrivalTime: Math.max(0, draft.arrivalTime),
            burstTime: Math.max(1, draft.burstTime),
            priority: draft.priority,
        }])
        setDraft((current) => ({
            pid: `P${processes.length + 2}`,
            arrivalTime: current.arrivalTime + 1,
            burstTime: current.burstTime,
            priority: current.priority,
        }))
    }

    return (
        <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[22rem,minmax(0,1fr)]">
            <section className="os-panel os-panel-motion rounded-[1.75rem] p-4">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] os-text-muted">CPU Scheduling</p>
                        <h2 className="mt-1 text-lg font-semibold text-[var(--os-text-0)]">Process queue lab</h2>
                    </div>
                    <button type="button" className="os-button os-interactive" onClick={() => setProcesses(CPU_PRESET)}>Load preset</button>
                </div>

                <div className="mt-4 space-y-3">
                    <label className="block">
                        <span className="mb-1.5 block text-xs font-medium text-[var(--os-text-0)]">Algorithm</span>
                        <select value={algorithm} onChange={(event) => setAlgorithm(event.target.value as CpuAlgorithm)} className="os-input">
                            {CPU_ALGORITHM_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </label>

                    <p className="rounded-2xl bg-white/5 px-3 py-2 text-xs os-text-muted">
                        {CPU_ALGORITHM_OPTIONS.find((option) => option.value === algorithm)?.note}
                    </p>

                    {algorithm === 'rr' ? (
                        <label className="block">
                            <span className="mb-1.5 block text-xs font-medium text-[var(--os-text-0)]">Time quantum</span>
                            <input type="number" min={1} value={quantum} onChange={(event) => setQuantum(Number(event.target.value) || 1)} className="os-input" />
                        </label>
                    ) : null}
                </div>

                <form className="mt-5 space-y-3" onSubmit={handleAddProcess}>
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-[var(--os-text-0)]">Add process</h3>
                        <span className="text-[11px] uppercase tracking-[0.16em] os-text-muted">PID, arrival, burst, priority</span>
                    </div>

                    <input value={draft.pid} onChange={(event) => setDraft((current) => ({ ...current, pid: event.target.value }))} className="os-input" placeholder="PID" />
                    <div className="grid grid-cols-3 gap-2">
                        <input type="number" min={0} value={draft.arrivalTime} onChange={(event) => setDraft((current) => ({ ...current, arrivalTime: Number(event.target.value) || 0 }))} className="os-input" placeholder="Arrival" />
                        <input type="number" min={1} value={draft.burstTime} onChange={(event) => setDraft((current) => ({ ...current, burstTime: Number(event.target.value) || 1 }))} className="os-input" placeholder="Burst" />
                        <input type="number" value={draft.priority} onChange={(event) => setDraft((current) => ({ ...current, priority: Number(event.target.value) || 0 }))} className="os-input" placeholder="Priority" />
                    </div>
                    <button type="submit" className="os-button os-interactive w-full">Append process</button>
                </form>

                <div className="mt-5 space-y-2">
                    {processes.map((process, index) => (
                        <div key={`${process.pid}-${index}`} className="os-subtle-panel rounded-2xl px-3 py-2.5 text-xs text-[var(--os-text-0)]">
                            <div className="flex items-center justify-between gap-2">
                                <span className="font-semibold uppercase tracking-[0.16em]">{process.pid}</span>
                                <button type="button" className="text-[11px] os-text-muted transition hover:text-[var(--os-danger)]" onClick={() => setProcesses((current) => current.filter((_, currentIndex) => currentIndex !== index))}>Remove</button>
                            </div>
                            <p className="mt-1 os-text-muted">Arrival {process.arrivalTime}, Burst {process.burstTime}, Priority {process.priority}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="flex min-h-0 flex-col gap-4">
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="os-panel os-panel-motion rounded-[1.6rem] p-4">
                        <p className="text-[11px] uppercase tracking-[0.18em] os-text-muted">Average Waiting</p>
                        <p className="mt-2 text-3xl font-semibold text-[var(--os-text-0)]">{formatNumber(result.averageWaitingTime)}</p>
                    </div>
                    <div className="os-panel os-panel-motion rounded-[1.6rem] p-4">
                        <p className="text-[11px] uppercase tracking-[0.18em] os-text-muted">Average Turnaround</p>
                        <p className="mt-2 text-3xl font-semibold text-[var(--os-text-0)]">{formatNumber(result.averageTurnaroundTime)}</p>
                    </div>
                    <div className="os-panel os-panel-motion rounded-[1.6rem] p-4">
                        <p className="text-[11px] uppercase tracking-[0.18em] os-text-muted">Scheduler Readout</p>
                        <p className="mt-2 text-sm leading-6 text-[var(--os-text-0)]">{getCpuInsight(result)}</p>
                    </div>
                </div>

                <div className="os-panel os-panel-motion rounded-[1.75rem] p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.18em] os-text-muted">Execution Timeline</p>
                            <h3 className="mt-1 text-base font-semibold text-[var(--os-text-0)]">Gantt chart</h3>
                        </div>
                        <span className="rounded-full bg-white/6 px-3 py-1 text-[11px] uppercase tracking-[0.14em] os-text-muted">Total {formatNumber(result.totalTime)} units</span>
                    </div>
                    <div className="mt-4">
                        <GanttChart segments={result.segments} />
                    </div>
                </div>

                <div className="os-panel os-panel-motion min-h-0 flex-1 overflow-hidden rounded-[1.75rem] p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.18em] os-text-muted">Per-process Metrics</p>
                            <h3 className="mt-1 text-base font-semibold text-[var(--os-text-0)]">Waiting and turnaround analysis</h3>
                        </div>
                    </div>
                    <div className="mt-4 overflow-auto">
                        <table className="min-w-full text-left text-sm text-[var(--os-text-0)]">
                            <thead className="text-[11px] uppercase tracking-[0.16em] os-text-muted">
                                <tr>
                                    <th className="pb-3 pr-4 font-medium">PID</th>
                                    <th className="pb-3 pr-4 font-medium">Arrival</th>
                                    <th className="pb-3 pr-4 font-medium">Burst</th>
                                    <th className="pb-3 pr-4 font-medium">Priority</th>
                                    <th className="pb-3 pr-4 font-medium">Completion</th>
                                    <th className="pb-3 pr-4 font-medium">Turnaround</th>
                                    <th className="pb-3 font-medium">Waiting</th>
                                </tr>
                            </thead>
                            <tbody>
                                {result.metrics.map((process) => (
                                    <tr key={process.pid} className="border-t border-white/8">
                                        <td className="py-3 pr-4 font-semibold">{process.pid}</td>
                                        <td className="py-3 pr-4">{process.arrivalTime}</td>
                                        <td className="py-3 pr-4">{process.burstTime}</td>
                                        <td className="py-3 pr-4">{process.priority}</td>
                                        <td className="py-3 pr-4">{process.completionTime}</td>
                                        <td className="py-3 pr-4">{formatNumber(process.turnaroundTime)}</td>
                                        <td className="py-3">{formatNumber(process.waitingTime)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    )
}

function DiskTab() {
    const [algorithm, setAlgorithm] = useState<DiskAlgorithm>('scan')
    const [direction, setDirection] = useState<ScanDirection>('right')
    const [headStart, setHeadStart] = useState(53)
    const [maxCylinder, setMaxCylinder] = useState(199)
    const [queueInput, setQueueInput] = useState(DISK_PRESET)

    const queue = parseQueue(queueInput)
    const result = simulateDiskScheduling(queue, algorithm, headStart, maxCylinder, direction)

    return (
        <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[22rem,minmax(0,1fr)]">
            <section className="os-panel os-panel-motion rounded-[1.75rem] p-4">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] os-text-muted">Disk Scheduling</p>
                        <h2 className="mt-1 text-lg font-semibold text-[var(--os-text-0)]">Head movement lab</h2>
                    </div>
                    <button type="button" className="os-button os-interactive" onClick={() => setQueueInput(DISK_PRESET)}>Load preset</button>
                </div>

                <div className="mt-4 space-y-3">
                    <label className="block">
                        <span className="mb-1.5 block text-xs font-medium text-[var(--os-text-0)]">Algorithm</span>
                        <select value={algorithm} onChange={(event) => setAlgorithm(event.target.value as DiskAlgorithm)} className="os-input">
                            {DISK_ALGORITHM_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </label>
                    <p className="rounded-2xl bg-white/5 px-3 py-2 text-xs os-text-muted">
                        {DISK_ALGORITHM_OPTIONS.find((option) => option.value === algorithm)?.note}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        <label className="block">
                            <span className="mb-1.5 block text-xs font-medium text-[var(--os-text-0)]">Initial head</span>
                            <input type="number" min={0} value={headStart} onChange={(event) => setHeadStart(Number(event.target.value) || 0)} className="os-input" />
                        </label>
                        <label className="block">
                            <span className="mb-1.5 block text-xs font-medium text-[var(--os-text-0)]">Max cylinder</span>
                            <input type="number" min={1} value={maxCylinder} onChange={(event) => setMaxCylinder(Math.max(1, Number(event.target.value) || 1))} className="os-input" />
                        </label>
                    </div>
                    <label className="block">
                        <span className="mb-1.5 block text-xs font-medium text-[var(--os-text-0)]">Sweep direction</span>
                        <select value={direction} onChange={(event) => setDirection(event.target.value as ScanDirection)} className="os-input">
                            <option value="left">Toward cylinder 0</option>
                            <option value="right">Toward max cylinder</option>
                        </select>
                    </label>
                    <label className="block">
                        <span className="mb-1.5 block text-xs font-medium text-[var(--os-text-0)]">Request queue</span>
                        <textarea value={queueInput} onChange={(event) => setQueueInput(event.target.value)} className="os-input min-h-[7.5rem] resize-none py-2.5 text-sm leading-6" placeholder="98, 183, 37, 122, 14, 124, 65, 67" />
                    </label>
                </div>
            </section>

            <section className="flex min-h-0 flex-col gap-4">
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="os-panel os-panel-motion rounded-[1.6rem] p-4">
                        <p className="text-[11px] uppercase tracking-[0.18em] os-text-muted">Total Seek</p>
                        <p className="mt-2 text-3xl font-semibold text-[var(--os-text-0)]">{result.totalSeekDistance}</p>
                    </div>
                    <div className="os-panel os-panel-motion rounded-[1.6rem] p-4">
                        <p className="text-[11px] uppercase tracking-[0.18em] os-text-muted">Requests Served</p>
                        <p className="mt-2 text-3xl font-semibold text-[var(--os-text-0)]">{queue.length}</p>
                    </div>
                    <div className="os-panel os-panel-motion rounded-[1.6rem] p-4">
                        <p className="text-[11px] uppercase tracking-[0.18em] os-text-muted">Traversal Readout</p>
                        <p className="mt-2 text-sm leading-6 text-[var(--os-text-0)]">{getDiskInsight(result)}</p>
                    </div>
                </div>

                <div className="os-panel os-panel-motion rounded-[1.75rem] p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.18em] os-text-muted">Cylinder Graph</p>
                            <h3 className="mt-1 text-base font-semibold text-[var(--os-text-0)]">Head movement path</h3>
                        </div>
                        <span className="rounded-full bg-white/6 px-3 py-1 text-[11px] uppercase tracking-[0.14em] os-text-muted">0..{maxCylinder}</span>
                    </div>
                    <div className="mt-4">
                        <DiskChart points={result.points} maxCylinder={maxCylinder} />
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr),20rem]">
                    <div className="os-panel os-panel-motion rounded-[1.75rem] p-4">
                        <p className="text-[11px] uppercase tracking-[0.18em] os-text-muted">Service Order</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {result.points.map((point, index) => (
                                <div key={`${point}-${index}`} className="os-subtle-panel rounded-full px-3 py-2 text-xs text-[var(--os-text-0)]">
                                    {index === 0 ? `Head ${point}` : point}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="os-panel os-panel-motion rounded-[1.75rem] p-4">
                        <p className="text-[11px] uppercase tracking-[0.18em] os-text-muted">Queue Snapshot</p>
                        <p className="mt-3 text-sm leading-6 text-[var(--os-text-0)]">
                            {queue.length > 0 ? queue.join(', ') : 'No valid cylinder requests parsed from the current input.'}
                        </p>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default function OSLabApp({ id }: { id: string }) {
    const [activeTab, setActiveTab] = useState<'cpu' | 'disk'>('cpu')

    return (
        <Window id={id} title="OS Simulation Lab">
            <div className="flex h-full min-h-0 flex-col bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--os-accent)_16%,transparent),transparent_34%),linear-gradient(180deg,color-mix(in_oklab,var(--os-surface-0)_94%,transparent),color-mix(in_oklab,var(--os-bg-1)_90%,transparent))] text-[var(--os-text-0)]">
                <header className="border-b border-white/10 px-5 py-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.22em] os-text-muted">CMSC-314 Lab Surface</p>
                            <h1 className="mt-1 text-2xl font-semibold">OS Simulation Lab</h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 os-text-muted">
                                Compare scheduler behavior visually, inspect turnaround and waiting costs, and trace disk head movement across cylinders.
                            </p>
                        </div>
                        <div className="os-subtle-panel inline-flex rounded-2xl p-1">
                            <button type="button" onClick={() => setActiveTab('cpu')} className={`os-interactive rounded-[1rem] px-4 py-2 text-sm font-medium transition ${activeTab === 'cpu' ? 'bg-[color-mix(in_oklab,var(--os-accent)_18%,white_10%)] text-[var(--os-text-0)] shadow-[0_12px_28px_rgb(15_23_42_/_0.12)]' : 'text-[var(--os-text-1)] hover:text-[var(--os-text-0)]'}`}>
                                CPU Scheduling
                            </button>
                            <button type="button" onClick={() => setActiveTab('disk')} className={`os-interactive rounded-[1rem] px-4 py-2 text-sm font-medium transition ${activeTab === 'disk' ? 'bg-[color-mix(in_oklab,var(--os-accent)_18%,white_10%)] text-[var(--os-text-0)] shadow-[0_12px_28px_rgb(15_23_42_/_0.12)]' : 'text-[var(--os-text-1)] hover:text-[var(--os-text-0)]'}`}>
                                Disk Scheduling
                            </button>
                        </div>
                    </div>
                </header>

                <main className="min-h-0 flex-1 overflow-auto px-5 py-5">
                    {activeTab === 'cpu' ? <CpuTab /> : <DiskTab />}
                </main>
            </div>
        </Window>
    )
}
