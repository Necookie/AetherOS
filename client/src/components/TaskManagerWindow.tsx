import { useEffect, useMemo, useState } from 'react'
import { shallow } from 'zustand/shallow'
import { useDeepLinkIntentStore } from '../features/deep-links/store'
import type { TaskManagerTab } from '../features/deep-links/types'
import { useKernelStore } from '../stores/useKernelStore'
import Window from './system/Window'

const tabClasses = (active: boolean) =>
    `rounded-sm px-3 py-1.5 text-xs font-semibold transition-colors ${active ? 'bg-tile-2 text-on-dark border border-white/10' : 'text-on-dark-muted hover:bg-tile-2 hover:text-on-dark'}`

function severityClass(value: number) {
    if (value >= 85) {
        return 'bg-danger'
    }
    if (value >= 65) {
        return 'bg-warning'
    }
    return 'bg-success'
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
    const taskManagerIntent = useDeepLinkIntentStore((state) => state.taskManager)

    const totals = useMemo(() => ({
        procCount: processes.length,
        cpu: cpuUsage,
        mem: memUsage,
        disk: diskUsage,
        net: netUsage,
    }), [processes.length, cpuUsage, memUsage, diskUsage, netUsage])

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
            <div className="flex h-full w-full flex-col bg-tile-1 text-sm text-on-dark">
                <div className="border-b border-white/10 bg-tile-2 px-5 py-4">
                    <div className="flex items-center justify-between">
                        <div className="text-xs font-semibold text-on-dark-muted">AetherOS Monitor</div>
                        <div className="flex gap-2 rounded-sm border border-white/10 bg-tile-1 p-1">
                            <button className={tabClasses(tab === 'Processes')} onClick={() => setTab('Processes')}>Processes</button>
                            <button className={tabClasses(tab === 'Performance')} onClick={() => setTab('Performance')}>Performance</button>
                            <button className={tabClasses(tab === 'Network')} onClick={() => setTab('Network')}>Internet</button>
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-4 gap-3 text-xs">
                        <div className="rounded-sm border border-white/10 bg-tile-1 px-3 py-2">
                            <div className="mb-1 text-on-dark-muted">Processes</div>
                            <div className="text-lg font-semibold text-on-dark">{totals.procCount}</div>
                        </div>
                        <div className="rounded-sm border border-white/10 bg-tile-1 px-3 py-2">
                            <div className="mb-1 text-on-dark-muted">CPU</div>
                            <div className="text-lg font-semibold text-primary-on-dark">{totals.cpu.toFixed(1)}%</div>
                        </div>
                        <div className="rounded-sm border border-white/10 bg-tile-1 px-3 py-2">
                            <div className="mb-1 text-on-dark-muted">Memory</div>
                            <div className="text-lg font-semibold text-on-dark">{totals.mem.toFixed(1)}%</div>
                        </div>
                        <div className="rounded-sm border border-white/10 bg-tile-1 px-3 py-2">
                            <div className="mb-1 text-on-dark-muted">Disk</div>
                            <div className="text-lg font-semibold text-on-dark">{totals.disk.toFixed(1)}%</div>
                        </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-[12px] text-on-dark-muted">
                        <span className="rounded-sm border border-white/10 bg-tile-1 px-2 py-1">CPU spike +{recentSpikes.cpu.toFixed(1)}%</span>
                        <span className="rounded-sm border border-white/10 bg-tile-1 px-2 py-1">Mem spike +{recentSpikes.mem.toFixed(0)} MB</span>
                        <span className="rounded-sm border border-white/10 bg-tile-1 px-2 py-1">Disk spike +{recentSpikes.disk.toFixed(1)}</span>
                        <span className="rounded-sm border border-white/10 bg-tile-1 px-2 py-1">Net spike +{recentSpikes.net.toFixed(1)}</span>
                    </div>
                </div>

                {tab === 'Processes' && (
                    <div className="flex-1 overflow-auto">
                        <div className="sticky top-0 grid grid-cols-7 gap-2 border-b border-white/10 bg-tile-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-on-dark-muted">
                            <div>PID</div>
                            <div>Name</div>
                            <div>CPU %</div>
                            <div>Mem (MB)</div>
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
                                className="grid grid-cols-7 items-center gap-2 border-b border-white/10 px-5 py-2.5 transition-colors hover:bg-tile-2 focus:bg-tile-2 focus:outline-none"
                            >
                                <div className="font-term text-on-dark-muted">{process.pid}</div>
                                <div className="font-semibold text-on-dark">{process.name}</div>
                                <div className="font-term text-on-dark-muted">{process.cpu.toFixed(1)}</div>
                                <div className="font-term text-on-dark-muted">{process.mem.toFixed(1)}</div>
                                <div className="font-term text-on-dark-muted">{process.disk.toFixed(1)}</div>
                                <div className="font-term text-on-dark-muted">{process.net.toFixed(1)}</div>
                                <div>
                                    <button
                                        onClick={() => killProcess(process.pid)}
                                        className="rounded-sm border border-white/10 px-3 py-1 text-xs font-semibold text-danger transition-colors hover:bg-tile-2"
                                    >
                                        Kill
                                    </button>
                                </div>
                            </div>
                        ))}
                        {processes.length === 0 && (
                            <div className="p-4 text-center italic text-on-dark-muted">No processes running.</div>
                        )}
                    </div>
                )}

                {tab === 'Performance' && (
                    <div className="flex-1 space-y-4 overflow-auto p-5">
                        {[
                            { label: 'CPU', value: totals.cpu },
                            { label: 'Memory', value: totals.mem },
                            { label: 'Disk', value: totals.disk },
                            { label: 'Network', value: totals.net },
                        ].map((stat) => (
                            <div key={stat.label} className="rounded-sm border border-white/10 bg-tile-2 p-4">
                                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-on-dark-muted">
                                    <span>{stat.label}</span>
                                    <span className="font-semibold text-on-dark">{stat.value.toFixed(1)}%</span>
                                </div>
                                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-tile-1">
                                    <div
                                        className={`h-full rounded-full ${severityClass(stat.value)}`}
                                        style={{ width: `${Math.min(100, stat.value)}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                        <div className="rounded-sm border border-white/10 bg-tile-2 p-4">
                            <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-on-dark-muted">Top Event Contributors</div>
                            {topContributors.length > 0 ? (
                                <div className="space-y-2">
                                    {topContributors.slice(0, 5).map((entry, index) => (
                                        <div key={`${entry.pid}-${entry.metric}-${index}`} className="flex items-center justify-between rounded-sm border border-white/10 bg-tile-1 px-3 py-2 text-xs">
                                            <div className="text-on-dark-muted">
                                                <span className="font-semibold text-on-dark">{entry.name}</span> [{entry.metric}] {entry.source}
                                            </div>
                                            <div className="font-term text-on-dark-muted">+{entry.delta.toFixed(1)}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-xs text-on-dark-muted">No recent event spikes detected.</div>
                            )}
                        </div>
                    </div>
                )}

                {tab === 'Network' && (
                    <div className="flex-1 space-y-4 overflow-auto p-5">
                        <div className="rounded-sm border border-white/10 bg-tile-2 p-6">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-on-dark-muted">
                                <div className="h-2 w-2 animate-pulse rounded-full bg-success"></div>
                                Live Latency
                            </div>
                            <div className="mt-3 text-4xl font-light text-on-dark">{networkLatencyMs} <span className="text-xl text-on-dark-muted">ms</span></div>
                            <div className="mt-2 text-xs text-on-dark-muted">
                                Simulated ping to AetherOS backbone infrastructure.
                            </div>
                        </div>
                        <div className="rounded-sm border border-white/10 bg-tile-2 p-5">
                            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-on-dark-muted">
                                <span>Network Utilization</span>
                                <span className="font-semibold text-primary-on-dark">{totals.net.toFixed(1)}%</span>
                            </div>
                            <div className="mt-4 h-3 overflow-hidden rounded-full bg-tile-1">
                                <div
                                    className="h-full rounded-full bg-primary-on-dark"
                                    style={{ width: `${Math.min(100, totals.net)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Window>
    )
}
