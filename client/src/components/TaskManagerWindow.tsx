import { useEffect, useMemo, useState } from 'react'
import { shallow } from 'zustand/shallow'
import { Activity, Cpu, HardDrive, Network, Search, Wifi, X } from 'lucide-react'
import { useDeepLinkIntentStore } from '../features/deep-links/store'
import type { TaskManagerTab } from '../features/deep-links/types'
import { useKernelStore } from '../stores/useKernelStore'
import Window from './system/Window'

const tabClasses = (active: boolean) =>
    `rounded-pill px-3.5 py-1 text-xs font-semibold transition-all active:scale-95 ${
        active ? 'bg-primary text-white shadow-xs' : 'text-ink-muted hover:bg-black/5 hover:text-ink'
    }`

function severityClass(value: number) {
    if (value >= 85) {
        return 'bg-danger'
    }
    if (value >= 65) {
        return 'bg-warning'
    }
    return 'bg-primary'
}

export default function TaskManagerWindow({ id }: { id: string }) {
    const {
        processes,
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
    const [filterQuery, setFilterQuery] = useState('')
    const taskManagerIntent = useDeepLinkIntentStore((state) => state.taskManager)

    const totals = useMemo(() => ({
        procCount: processes.length,
        cpu: cpuUsage,
        mem: memUsage,
        disk: diskUsage,
        net: netUsage,
    }), [processes.length, cpuUsage, memUsage, diskUsage, netUsage])

    const filteredProcesses = useMemo(() => {
        if (!filterQuery.trim()) {
            return processes
        }
        const query = filterQuery.toLowerCase()
        return processes.filter(
            (p) => p.name.toLowerCase().includes(query) || String(p.pid).includes(query),
        )
    }, [processes, filterQuery])

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
            <div className="flex h-full w-full flex-col bg-canvas text-sm text-ink select-none">
                {/* Top Summary & Nav Bar (Sticky Bar) */}
                <div className="border-b border-hairline bg-parchment/80 px-5 py-3.5 backdrop-blur-md">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                                <Activity className="h-4 w-4" />
                            </div>
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wider text-ink">Activity Monitor</div>
                                <div className="text-[10px] text-ink-muted-48">AetherOS Kernel Telemetry</div>
                            </div>
                        </div>

                        {/* Segmented Control Tabs */}
                        <div className="flex gap-1 rounded-pill border border-hairline/80 bg-canvas p-1 shadow-2xs">
                            <button className={tabClasses(tab === 'Processes')} onClick={() => setTab('Processes')}>Processes</button>
                            <button className={tabClasses(tab === 'Performance')} onClick={() => setTab('Performance')}>Performance</button>
                            <button className={tabClasses(tab === 'Network')} onClick={() => setTab('Network')}>Internet</button>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="mt-3.5 grid grid-cols-2 gap-2.5 text-xs sm:grid-cols-4">
                        <div className="rounded-xl border border-hairline/80 bg-canvas p-3 shadow-2xs">
                            <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Processes</div>
                            <div className="mt-1 text-lg font-bold text-ink">{totals.procCount}</div>
                            <div className="mt-1.5 h-1.5 w-full rounded-full bg-parchment overflow-hidden border border-hairline/40">
                                <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, totals.procCount * 10)}%` }} />
                            </div>
                        </div>

                        <div className="rounded-xl border border-hairline/80 bg-canvas p-3 shadow-2xs">
                            <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">CPU Load</div>
                            <div className="mt-1 text-lg font-bold text-primary">{totals.cpu.toFixed(1)}%</div>
                            <div className="mt-1.5 h-1.5 w-full rounded-full bg-parchment overflow-hidden border border-hairline/40">
                                <div className={`h-full rounded-full ${severityClass(totals.cpu)}`} style={{ width: `${Math.min(100, totals.cpu)}%` }} />
                            </div>
                        </div>

                        <div className="rounded-xl border border-hairline/80 bg-canvas p-3 shadow-2xs">
                            <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Memory</div>
                            <div className="mt-1 text-lg font-bold text-ink">{totals.mem.toFixed(1)}%</div>
                            <div className="mt-1.5 h-1.5 w-full rounded-full bg-parchment overflow-hidden border border-hairline/40">
                                <div className={`h-full rounded-full ${severityClass(totals.mem)}`} style={{ width: `${Math.min(100, totals.mem)}%` }} />
                            </div>
                        </div>

                        <div className="rounded-xl border border-hairline/80 bg-canvas p-3 shadow-2xs">
                            <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Disk I/O</div>
                            <div className="mt-1 text-lg font-bold text-ink">{totals.disk.toFixed(1)}%</div>
                            <div className="mt-1.5 h-1.5 w-full rounded-full bg-parchment overflow-hidden border border-hairline/40">
                                <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, totals.disk)}%` }} />
                            </div>
                        </div>
                    </div>

                    {/* Spike Indicators */}
                    <div className="mt-2.5 flex flex-wrap gap-1.5 text-[11px] text-ink-muted">
                        <span className="rounded-pill border border-hairline bg-canvas px-2.5 py-0.5 font-medium shadow-2xs">
                            CPU spike +{recentSpikes.cpu.toFixed(1)}%
                        </span>
                        <span className="rounded-pill border border-hairline bg-canvas px-2.5 py-0.5 font-medium shadow-2xs">
                            Mem spike +{recentSpikes.mem.toFixed(0)} MB
                        </span>
                        <span className="rounded-pill border border-hairline bg-canvas px-2.5 py-0.5 font-medium shadow-2xs">
                            Disk spike +{recentSpikes.disk.toFixed(1)}
                        </span>
                        <span className="rounded-pill border border-hairline bg-canvas px-2.5 py-0.5 font-medium shadow-2xs">
                            Net spike +{recentSpikes.net.toFixed(1)}
                        </span>
                    </div>
                </div>

                {/* Processes Tab View */}
                {tab === 'Processes' && (
                    <div className="flex flex-1 flex-col overflow-hidden bg-canvas">
                        {/* Process Filter Toolbar */}
                        <div className="flex items-center justify-between border-b border-hairline bg-parchment/40 px-5 py-2">
                            <div className="relative flex items-center">
                                <Search className="absolute left-2.5 h-3.5 w-3.5 text-ink-muted-48" />
                                <input
                                    type="text"
                                    value={filterQuery}
                                    onChange={(e) => setFilterQuery(e.target.value)}
                                    placeholder="Filter by name or PID..."
                                    className="h-7 w-56 rounded-lg border border-hairline bg-canvas pl-8 pr-2.5 text-xs text-ink placeholder:text-ink-muted-48 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                                />
                                {filterQuery && (
                                    <button
                                        onClick={() => setFilterQuery('')}
                                        className="absolute right-2 text-ink-muted hover:text-ink"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                )}
                            </div>
                            <span className="text-[11px] font-medium text-ink-muted-48">
                                Showing {filteredProcesses.length} of {processes.length} tasks
                            </span>
                        </div>

                        {/* Process Table */}
                        <div className="flex-1 overflow-auto">
                            <div className="sticky top-0 z-10 grid grid-cols-7 gap-2 border-b border-hairline bg-parchment/90 px-5 py-2 text-[11px] font-bold uppercase tracking-wider text-ink-muted backdrop-blur-xs">
                                <div>PID</div>
                                <div>Process Name</div>
                                <div>CPU %</div>
                                <div>Memory (MB)</div>
                                <div>Disk</div>
                                <div>Network</div>
                                <div className="text-right">Action</div>
                            </div>

                            {filteredProcesses.map((process) => (
                                <div
                                    key={process.pid}
                                    data-process-pid={process.pid}
                                    data-process-name={process.name}
                                    tabIndex={-1}
                                    className="grid grid-cols-7 items-center gap-2 border-b border-hairline/40 px-5 py-2 text-xs transition-colors hover:bg-parchment/50 focus:bg-primary/5 focus:outline-none"
                                >
                                    <div className="font-mono text-xs text-ink-muted">{process.pid}</div>
                                    <div className="flex items-center gap-2 font-semibold text-ink truncate">
                                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                                        <span className="truncate">{process.name}</span>
                                    </div>
                                    <div className="font-mono text-xs font-medium text-ink">{process.cpu.toFixed(1)}%</div>
                                    <div className="font-mono text-xs font-medium text-ink">{process.mem.toFixed(1)} MB</div>
                                    <div className="font-mono text-xs text-ink-muted">{process.disk.toFixed(1)}</div>
                                    <div className="font-mono text-xs text-ink-muted">{process.net.toFixed(1)}</div>
                                    <div className="text-right">
                                        <button
                                            onClick={() => killProcess(process.pid)}
                                            className="rounded-md border border-danger/25 bg-danger/10 px-2.5 py-1 text-[11px] font-semibold text-danger transition-all hover:bg-danger hover:text-white active:scale-95 shadow-2xs"
                                        >
                                            End Task
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {filteredProcesses.length === 0 && (
                                <div className="p-8 text-center text-xs text-ink-muted">
                                    {filterQuery ? `No processes match "${filterQuery}".` : 'No active processes running.'}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Performance Tab View */}
                {tab === 'Performance' && (
                    <div className="flex-1 space-y-3.5 overflow-auto p-5 bg-canvas">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {[
                                { label: 'CPU Utilization', value: totals.cpu, icon: Cpu },
                                { label: 'Memory Footprint', value: totals.mem, icon: Activity },
                                { label: 'Disk Activity', value: totals.disk, icon: HardDrive },
                                { label: 'Network Throughput', value: totals.net, icon: Network },
                            ].map((stat) => {
                                const Icon = stat.icon
                                return (
                                    <div key={stat.label} className="rounded-xl border border-hairline/80 bg-parchment/40 p-4 shadow-2xs">
                                        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-ink-muted">
                                            <span className="flex items-center gap-2">
                                                <Icon className="h-4 w-4 text-primary" />
                                                {stat.label}
                                            </span>
                                            <span className="font-mono text-sm font-bold text-ink">{stat.value.toFixed(1)}%</span>
                                        </div>
                                        <div className="mt-3.5 h-2.5 overflow-hidden rounded-full bg-parchment border border-hairline/60">
                                            <div
                                                className={`h-full rounded-full transition-all duration-300 ${severityClass(stat.value)}`}
                                                style={{ width: `${Math.min(100, stat.value)}%` }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Top Contributors Card */}
                        <div className="rounded-xl border border-hairline/80 bg-parchment/40 p-4 shadow-2xs">
                            <div className="mb-3 text-xs font-bold uppercase tracking-wider text-ink">Top Event Contributors</div>
                            {topContributors.length > 0 ? (
                                <div className="space-y-2">
                                    {topContributors.slice(0, 5).map((entry, index) => (
                                        <div
                                            key={`${entry.pid}-${entry.metric}-${index}`}
                                            className="flex items-center justify-between rounded-lg border border-hairline/60 bg-canvas px-3.5 py-2 text-xs shadow-2xs"
                                        >
                                            <div className="text-ink-muted">
                                                <span className="font-semibold text-ink">{entry.name}</span>{' '}
                                                <span className="rounded bg-parchment px-1.5 py-0.5 text-[10px] font-mono border border-hairline/60 text-ink-muted-48">
                                                    [{entry.metric}]
                                                </span>{' '}
                                                {entry.source}
                                            </div>
                                            <div className="font-mono font-semibold text-primary">+{entry.delta.toFixed(1)}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-xs text-ink-muted-48">No recent event spikes detected.</div>
                            )}
                        </div>
                    </div>
                )}

                {/* Network Tab View */}
                {tab === 'Network' && (
                    <div className="flex-1 space-y-3.5 overflow-auto p-5 bg-canvas">
                        <div className="rounded-xl border border-hairline/80 bg-parchment/40 p-5 shadow-2xs">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-muted">
                                <div className="h-2 w-2 animate-pulse rounded-full bg-success" />
                                Live Mesh Latency
                            </div>
                            <div className="mt-3 text-4xl font-light tracking-tight text-ink">
                                {networkLatencyMs} <span className="text-xl font-normal text-ink-muted-48">ms</span>
                            </div>
                            <div className="mt-2 text-xs text-ink-muted">
                                Simulated round-trip ping to AetherOS distributed backbone infrastructure.
                            </div>
                        </div>

                        <div className="rounded-xl border border-hairline/80 bg-parchment/40 p-5 shadow-2xs">
                            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-ink-muted">
                                <span className="flex items-center gap-2">
                                    <Wifi className="h-4 w-4 text-primary" />
                                    Network Utilization
                                </span>
                                <span className="font-mono text-sm font-bold text-primary">{totals.net.toFixed(1)}%</span>
                            </div>
                            <div className="mt-3.5 h-3 overflow-hidden rounded-full bg-parchment border border-hairline/60">
                                <div
                                    className="h-full rounded-full bg-primary transition-all duration-300"
                                    style={{ width: `${Math.min(100, totals.net)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Window>
    )
}
