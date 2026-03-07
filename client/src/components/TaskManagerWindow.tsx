import { useMemo, useState } from 'react'
import { shallow } from 'zustand/shallow'
import { useKernelStore } from '../stores/useKernelStore'
import Window from './system/Window'

const TABS = ['Processes', 'Performance', 'Network', 'Disk'] as const
type Tab = typeof TABS[number]

const tabClasses = (active: boolean) =>
    `rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${active ? 'bg-slate-800 text-slate-100 border border-slate-600' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`

export default function TaskManagerWindow({ id }: { id: string }) {
    const { processes, killProcess, cpuUsage, memUsage, diskUsage, netUsage, networkLatencyMs } = useKernelStore((state) => ({
        processes: state.processes,
        killProcess: state.killProcess,
        cpuUsage: state.cpuUsage,
        memUsage: state.memUsage,
        diskUsage: state.diskUsage,
        netUsage: state.netUsage,
        networkLatencyMs: state.networkLatencyMs,
    }), shallow)
    const [tab, setTab] = useState<Tab>('Processes')

    const totals = useMemo(() => ({
        procCount: processes.length,
        cpu: cpuUsage,
        mem: memUsage,
        disk: diskUsage,
        net: netUsage,
    }), [processes.length, cpuUsage, memUsage, diskUsage, netUsage])

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
                            <div className="mb-1 font-medium text-slate-400">Processes</div>
                            <div className="text-lg font-semibold text-indigo-300">{totals.procCount}</div>
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
                </div>

                {tab === 'Processes' && (
                    <div className="flex-1 overflow-auto">
                        <div className="sticky top-0 grid grid-cols-7 gap-2 border-b border-slate-700 bg-slate-900/90 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            <div>PID</div>
                            <div>Name</div>
                            <div>CPU %</div>
                            <div>Mem (MB)</div>
                            <div>Disk</div>
                            <div>Net</div>
                            <div>Action</div>
                        </div>
                        {processes.map((process) => (
                            <div key={process.pid} className="grid grid-cols-7 items-center gap-2 border-b border-slate-800 px-5 py-2.5 transition-colors hover:bg-slate-800/45">
                                <div className="font-term text-slate-500">{process.pid}</div>
                                <div className="font-medium text-slate-200">{process.name}</div>
                                <div className="font-term text-slate-400">{process.cpu.toFixed(1)}</div>
                                <div className="font-term text-slate-400">{process.mem.toFixed(1)}</div>
                                <div className="font-term text-slate-400">{process.disk.toFixed(1)}</div>
                                <div className="font-term text-slate-400">{process.net.toFixed(1)}</div>
                                <div>
                                    <button
                                        onClick={() => killProcess(process.pid)}
                                        className="rounded-md border border-red-800/80 px-3 py-1 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200"
                                    >
                                        Kill
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
