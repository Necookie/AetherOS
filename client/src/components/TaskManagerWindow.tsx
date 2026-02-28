import { useMemo, useState } from 'react'
import { shallow } from 'zustand/shallow'
import { useKernelStore } from '../stores/useKernelStore'
import Window from './system/Window'

const TABS = ['Processes', 'Performance', 'Network', 'Disk'] as const
type Tab = typeof TABS[number]

const tabClasses = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${active ? 'bg-white text-blue-700 shadow shadow-sm border border-gray-100' : 'text-gray-600 hover:bg-black/5'}`

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
            <div className="w-full h-full bg-gradient-to-br from-white via-slate-50 to-white text-sm text-gray-800 flex flex-col font-sans">
                <div className="px-5 py-4 border-b border-gray-200 bg-white/50 backdrop-blur-md">
                    <div className="flex items-center justify-between">
                        <div className="text-xs uppercase tracking-[0.25em] text-gray-500 font-bold">AetherOS Monitor</div>
                        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl border border-gray-200">
                            <button className={tabClasses(tab === 'Processes')} onClick={() => setTab('Processes')}>Processes</button>
                            <button className={tabClasses(tab === 'Performance')} onClick={() => setTab('Performance')}>Performance</button>
                            <button className={tabClasses(tab === 'Network')} onClick={() => setTab('Network')}>Internet</button>
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-4 gap-3 text-xs">
                        <div className="rounded-xl bg-white border border-gray-100 shadow-sm px-3 py-2">
                            <div className="text-gray-500 font-medium mb-1">Processes</div>
                            <div className="text-blue-600 font-bold text-lg">{totals.procCount}</div>
                        </div>
                        <div className="rounded-xl bg-white border border-gray-100 shadow-sm px-3 py-2">
                            <div className="text-gray-500 font-medium mb-1">CPU</div>
                            <div className="text-emerald-600 font-bold text-lg">{totals.cpu.toFixed(1)}%</div>
                        </div>
                        <div className="rounded-xl bg-white border border-gray-100 shadow-sm px-3 py-2">
                            <div className="text-gray-500 font-medium mb-1">Memory</div>
                            <div className="text-purple-600 font-bold text-lg">{totals.mem.toFixed(1)}%</div>
                        </div>
                        <div className="rounded-xl bg-white border border-gray-100 shadow-sm px-3 py-2">
                            <div className="text-gray-500 font-medium mb-1">Disk</div>
                            <div className="text-amber-600 font-bold text-lg">{totals.disk.toFixed(1)}%</div>
                        </div>
                    </div>
                </div>

                {tab === 'Processes' && (
                    <div className="flex-1 overflow-auto">
                        <div className="grid grid-cols-7 gap-2 font-semibold border-b border-gray-200 px-5 py-2.5 bg-gray-50/80 sticky top-0 text-gray-600 text-xs uppercase tracking-wider">
                            <div>PID</div>
                            <div>Name</div>
                            <div>CPU %</div>
                            <div>Mem (MB)</div>
                            <div>Disk</div>
                            <div>Net</div>
                            <div>Action</div>
                        </div>
                        {processes.map((process) => (
                            <div key={process.pid} className="grid grid-cols-7 gap-2 items-center px-5 py-2.5 hover:bg-black/5 border-b border-gray-100 last:border-0 transition-colors">
                                <div className="font-mono text-gray-500">{process.pid}</div>
                                <div className="font-medium text-gray-900">{process.name}</div>
                                <div className="font-mono text-gray-600">{process.cpu.toFixed(1)}</div>
                                <div className="font-mono text-gray-600">{process.mem.toFixed(1)}</div>
                                <div className="font-mono text-gray-600">{process.disk.toFixed(1)}</div>
                                <div className="font-mono text-gray-600">{process.net.toFixed(1)}</div>
                                <div>
                                    <button
                                        onClick={() => killProcess(process.pid)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-md text-xs font-medium transition-colors border border-transparent hover:border-red-200"
                                    >
                                        Kill
                                    </button>
                                </div>
                            </div>
                        ))}
                        {processes.length === 0 && (
                            <div className="p-4 text-center text-gray-500 italic">No processes running.</div>
                        )}
                    </div>
                )}

                {tab === 'Performance' && (
                    <div className="flex-1 overflow-auto p-5 space-y-4 bg-gray-50/50">
                        {[
                            { label: 'CPU', value: totals.cpu, color: 'from-emerald-400 to-emerald-500' },
                            { label: 'Memory', value: totals.mem, color: 'from-purple-400 to-purple-500' },
                            { label: 'Disk', value: totals.disk, color: 'from-amber-400 to-amber-500' },
                            { label: 'Network', value: totals.net, color: 'from-blue-400 to-blue-500' },
                        ].map((stat) => (
                            <div key={stat.label} className="rounded-xl bg-white p-4 border border-gray-200 shadow-sm">
                                <div className="flex items-center justify-between text-xs uppercase tracking-widest text-gray-500 font-bold">
                                    <span>{stat.label}</span>
                                    <span className="text-gray-900 font-bold">{stat.value.toFixed(1)}%</span>
                                </div>
                                <div className="mt-3 h-2.5 rounded-full bg-gray-100 overflow-hidden border border-gray-200/50">
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
                    <div className="flex-1 overflow-auto p-5 space-y-4 bg-gray-50/50">
                        <div className="rounded-xl bg-white p-6 border border-gray-200 shadow-sm">
                            <div className="text-xs uppercase tracking-[0.3em] text-gray-500 font-bold flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                Live Latency
                            </div>
                            <div className="mt-3 text-4xl font-light text-gray-900">{networkLatencyMs} <span className="text-xl text-gray-400">ms</span></div>
                            <div className="mt-2 text-xs text-gray-400">
                                Simulated ping to AetherOS backbone infrastructure.
                            </div>
                        </div>
                        <div className="rounded-xl bg-white p-5 border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between text-xs uppercase tracking-widest text-gray-500 font-bold">
                                <span>Network Utilization</span>
                                <span className="text-blue-600 font-bold">{totals.net.toFixed(1)}%</span>
                            </div>
                            <div className="mt-4 h-3 rounded-full bg-gray-100 overflow-hidden border border-gray-200/50">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 shadow-sm relative overflow-hidden"
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
