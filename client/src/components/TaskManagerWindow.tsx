import { useEffect, useMemo, useState } from 'react'
import { shallow } from 'zustand/shallow'
import { useDeepLinkIntentStore } from '../features/deep-links/store'
import type { TaskManagerTab } from '../features/deep-links/types'
import { formatProcessStatus } from '../features/kernel/processModel'
import type { ProcessStatus } from '../features/kernel/types'
import { useKernelStore } from '../stores/useKernelStore'
import Window from './system/Window'

const tabClasses = (active: boolean) =>
    `rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${active ? 'bg-slate-800 text-slate-100 border border-slate-600' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`

export default function TaskManagerWindow({ id }: { id: string }) {
    const {
        processes,
        tickCount,
        killProcess,
        cpuUsage,
        memUsage,
        diskUsage,
        netUsage,
        networkLatencyMs,
        recentSpikes,
        topContributors,
    } = useKernelStore((state) => ({
        processes: state.processes,
        tickCount: state.tickCount,
        killProcess: state.killProcess,
        cpuUsage: state.cpuUsage,
        memUsage: state.memUsage,
        diskUsage: state.diskUsage,
        netUsage: state.netUsage,
        networkLatencyMs: state.networkLatencyMs,
        recentSpikes: state.recentSpikes,
        topContributors: state.topContributors,
    }), shallow)
    const [tab, setTab] = useState<TaskManagerTab>('Processes')
    const taskManagerIntent = useDeepLinkIntentStore((state) => state.taskManager)

    const totals = useMemo(() => ({
        procCount: processes.length,
        activeCount: processes.filter((process) => process.status !== 'terminated').length,
        readyCount: processes.filter((process) => process.status === 'ready').length,
        runningCount: processes.filter((process) => process.status === 'running').length,
        waitingCount: processes.filter((process) => process.status === 'waiting').length,
        terminatedCount: processes.filter((process) => process.status === 'terminated').length,
        cpu: cpuUsage,
        mem: memUsage,
        disk: diskUsage,
        net: netUsage,
    }), [processes, cpuUsage, memUsage, diskUsage, netUsage])

    useEffect(() => {
        if (!taskManagerIntent) {
            return
        }

        setTab(taskManagerIntent.payload.tab)
    }, [taskManagerIntent])

    useEffect(() => {
        if (!taskManagerIntent || taskManagerIntent.payload.tab !== 'Processes') {
            return
        }

        const { processId, processName } = taskManagerIntent.payload
        const selector = typeof processId === 'number'
            ? `[data-process-pid="${processId}"]`
            : processName
                ? `[data-process-name="${processName}"]`
                : null

        if (!selector) {
            return
        }

        const timerId = window.setTimeout(() => {
            const target = document.querySelector<HTMLElement>(selector)
            target?.scrollIntoView({ block: 'center' })
            target?.focus()
        }, 40)

        return () => window.clearTimeout(timerId)
    }, [processes, taskManagerIntent])

    return (
        <Window id={id} title="Task Manager">
            <div className="flex h-full w-full flex-col text-sm text-slate-200">
                <div className="border-b border-slate-700/90 bg-slate-900/70 px-5 py-4">
                    <div className="flex items-center justify-between">
                        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">AetherOS Monitor</div>
                        <div className="flex gap-2 rounded-lg border border-slate-700 bg-slate-900 p-1">
                            <button className={tabClasses(tab === 'Processes')} onClick={() => setTab('Processes')}>Processes</button>
                            <button className={tabClasses(tab === 'Performance')} onClick={() => setTab('Performance')}>Performance</button>
                            <button className={tabClasses(tab === 'Network')} onClick={() => setTab('Network')}>Internet</button>
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-4 gap-3 text-xs">
                        <div className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2">
                            <div className="mb-1 font-medium text-slate-400">Tracked Processes</div>
                            <div className="text-lg font-semibold text-indigo-300">{totals.procCount}</div>
                            <div className="mt-1 text-[11px] text-slate-500">{totals.activeCount} active</div>
                        </div>
                        <div className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2">
                            <div className="mb-1 font-medium text-slate-400">CPU</div>
                            <div className="text-lg font-semibold text-emerald-400">{totals.cpu.toFixed(1)}%</div>
                        </div>
                        <div className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2">
                            <div className="mb-1 font-medium text-slate-400">Memory</div>
                            <div className="text-lg font-semibold text-indigo-300">{totals.mem.toFixed(1)}%</div>
                        </div>
                        <div className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2">
                            <div className="mb-1 font-medium text-slate-400">Disk</div>
                            <div className="text-lg font-semibold text-amber-400">{totals.disk.toFixed(1)}%</div>
                        </div>
                    </div>
                    <div className="mt-3 grid grid-cols-4 gap-2 text-[11px] text-slate-400">
                        <StateSummaryCard label="Ready" value={totals.readyCount} tone="ready" />
                        <StateSummaryCard label="Running" value={totals.runningCount} tone="running" />
                        <StateSummaryCard label="Waiting" value={totals.waitingCount} tone="waiting" />
                        <StateSummaryCard label="Terminated" value={totals.terminatedCount} tone="terminated" />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-400">
                        <span className="rounded-md border border-slate-700 bg-slate-900/80 px-2 py-1">CPU spike +{recentSpikes.cpu.toFixed(1)}%</span>
                        <span className="rounded-md border border-slate-700 bg-slate-900/80 px-2 py-1">Mem spike +{recentSpikes.mem.toFixed(0)} MB</span>
                        <span className="rounded-md border border-slate-700 bg-slate-900/80 px-2 py-1">Disk spike +{recentSpikes.disk.toFixed(1)}</span>
                        <span className="rounded-md border border-slate-700 bg-slate-900/80 px-2 py-1">Net spike +{recentSpikes.net.toFixed(1)}</span>
                    </div>
                </div>

                {tab === 'Processes' && (
                    <div className="flex-1 overflow-auto">
                        <div className="sticky top-0 grid grid-cols-[0.7fr_1.4fr_1fr_2.3fr_0.8fr_0.9fr_0.9fr_0.9fr_0.9fr] gap-2 border-b border-slate-700 bg-slate-900/90 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            <div>PID</div>
                            <div>Name</div>
                            <div>State</div>
                            <div>Transition</div>
                            <div>CPU %</div>
                            <div>Mem</div>
                            <div>Disk</div>
                            <div>Net</div>
                            <div>Action</div>
                        </div>
                        {processes.map((process) => (
                            <div
                                key={process.pid}
                                data-process-pid={process.pid}
                                data-process-name={process.name}
                                tabIndex={-1}
                                className={`grid grid-cols-[0.7fr_1.4fr_1fr_2.3fr_0.8fr_0.9fr_0.9fr_0.9fr_0.9fr] items-center gap-2 border-b border-slate-800 px-5 py-2.5 transition-colors hover:bg-slate-800/45 focus:bg-slate-800/70 focus:outline-none ${tickCount - process.lastTransitionTick <= 1 ? 'bg-slate-800/25' : ''}`}
                            >
                                <div className="font-term text-slate-500">{process.pid}</div>
                                <div className="font-medium text-slate-200">{process.name}</div>
                                <div><ProcessStateBadge status={process.status} emphasized={tickCount - process.lastTransitionTick <= 1} /></div>
                                <div className="text-xs text-slate-400">{process.lastTransition}</div>
                                <div className="font-term text-slate-400">{process.cpu.toFixed(1)}</div>
                                <div className="font-term text-slate-400">{process.mem.toFixed(0)} MB</div>
                                <div className="font-term text-slate-400">{process.disk.toFixed(1)}</div>
                                <div className="font-term text-slate-400">{process.net.toFixed(1)}</div>
                                <div>
                                    <button
                                        onClick={() => killProcess(process.pid)}
                                        disabled={process.status === 'terminated'}
                                        className="rounded-md border border-red-800/80 px-3 py-1 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-600 disabled:hover:bg-transparent"
                                    >
                                        {process.status === 'terminated' ? 'Ended' : 'Kill'}
                                    </button>
                                </div>
                            </div>
                        ))}
                        {processes.length === 0 && (
                            <div className="p-4 text-center italic text-slate-500">No processes running.</div>
                        )}
                    </div>
                )}

                {tab === 'Performance' && (
                    <div className="flex-1 space-y-4 overflow-auto bg-slate-950/20 p-5">
                        {[
                            { label: 'CPU', value: totals.cpu, color: 'from-emerald-500 to-emerald-400' },
                            { label: 'Memory', value: totals.mem, color: 'from-indigo-500 to-indigo-400' },
                            { label: 'Disk', value: totals.disk, color: 'from-amber-500 to-amber-400' },
                            { label: 'Network', value: totals.net, color: 'from-sky-500 to-sky-400' },
                        ].map((stat) => (
                            <div key={stat.label} className="rounded-lg border border-slate-700 bg-slate-900/70 p-4">
                                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-slate-400">
                                    <span>{stat.label}</span>
                                    <span className="font-semibold text-slate-100">{stat.value.toFixed(1)}%</span>
                                </div>
                                <div className="mt-3 h-2.5 overflow-hidden rounded-full border border-slate-700 bg-slate-950">
                                    <div
                                        className={`h-full rounded-full bg-gradient-to-r ${stat.color} shadow-sm`}
                                        style={{ width: `${Math.min(100, stat.value)}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                        <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-4">
                            <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Top Event Contributors</div>
                            {topContributors.length > 0 ? (
                                <div className="space-y-2">
                                    {topContributors.slice(0, 5).map((entry, index) => (
                                        <div key={`${entry.pid}-${entry.metric}-${index}`} className="flex items-center justify-between rounded border border-slate-800 bg-slate-950/50 px-3 py-2 text-xs">
                                            <div className="text-slate-300">
                                                <span className="font-semibold text-slate-100">{entry.name}</span> [{entry.metric}] {entry.source}
                                            </div>
                                            <div className="font-term text-slate-300">+{entry.delta.toFixed(1)}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-xs text-slate-500">No recent event spikes detected.</div>
                            )}
                        </div>
                    </div>
                )}

                {tab === 'Network' && (
                    <div className="flex-1 space-y-4 overflow-auto bg-slate-950/20 p-5">
                        <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-6">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                                <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400"></div>
                                Live Latency
                            </div>
                            <div className="mt-3 text-4xl font-light text-slate-100">{networkLatencyMs} <span className="text-xl text-slate-500">ms</span></div>
                            <div className="mt-2 text-xs text-slate-500">
                                Simulated ping to AetherOS backbone infrastructure.
                            </div>
                        </div>
                        <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-5">
                            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-slate-400">
                                <span>Network Utilization</span>
                                <span className="font-semibold text-sky-400">{totals.net.toFixed(1)}%</span>
                            </div>
                            <div className="mt-4 h-3 overflow-hidden rounded-full border border-slate-700 bg-slate-950">
                                <div
                                    className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 shadow-sm"
                                    style={{ width: `${Math.min(100, totals.net)}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Window>
    )
}

function StateSummaryCard({ label, value, tone }: { label: string; value: number; tone: ProcessStatus }) {
    return (
        <div className={`rounded-md border px-2.5 py-2 ${stateTone[tone].panel}`}>
            <div className="font-medium text-slate-300">{label}</div>
            <div className="mt-1 text-base font-semibold text-slate-100">{value}</div>
        </div>
    )
}

function ProcessStateBadge({ status, emphasized }: { status: ProcessStatus; emphasized?: boolean }) {
    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide ${stateTone[status].badge} ${emphasized ? 'shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_0_20px_rgba(148,163,184,0.12)]' : ''}`}
        >
            {formatProcessStatus(status)}
        </span>
    )
}

const stateTone: Record<ProcessStatus, { badge: string; panel: string }> = {
    ready: {
        badge: 'border-sky-500/40 bg-sky-500/10 text-sky-200',
        panel: 'border-sky-800/70 bg-sky-950/20',
    },
    running: {
        badge: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
        panel: 'border-emerald-800/70 bg-emerald-950/20',
    },
    waiting: {
        badge: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
        panel: 'border-amber-800/70 bg-amber-950/20',
    },
    terminated: {
        badge: 'border-rose-500/40 bg-rose-500/10 text-rose-200',
        panel: 'border-rose-900/70 bg-rose-950/20',
    },
}
