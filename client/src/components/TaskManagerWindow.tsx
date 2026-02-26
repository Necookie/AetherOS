import { useState, useMemo } from 'react'
import { useKernelStore } from '../stores/useKernelStore'
import Window from './system/Window'

const TABS = ['Processes', 'Performance', 'Network', 'Disk'] as const
type Tab = typeof TABS[number]

const tabClasses = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${active ? 'bg-white/80 text-gray-900 shadow' : 'text-gray-200 hover:bg-white/10'}`

export default function TaskManagerWindow({ id }: { id: string }) {
    const { processes, killProcess, cpuUsage, memUsage, diskUsage, netUsage, networkLatencyMs } = useKernelStore()
    const [tab, setTab] = useState<Tab>('Processes')

    const totals = useMemo(() => {
        const procCount = processes.length
        return {
            procCount,
            cpu: cpuUsage,
            mem: memUsage,
            disk: diskUsage,
            net: netUsage
        }
    }, [processes.length, cpuUsage, memUsage, diskUsage, netUsage])

    return (
        <Window id={id} title="Task Manager">
            <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-sm text-gray-300 flex flex-col">
                <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                    <div className="flex items-center justify-between">
                        <div className="text-xs uppercase tracking-[0.25em] text-gray-300/70">AetherOS Monitor</div>
                        <div className="flex gap-2">
                            <button className={tabClasses(tab === 'Processes')} onClick={() => setTab('Processes')}>Processes</button>
                            <button className={tabClasses(tab === 'Performance')} onClick={() => setTab('Performance')}>Performance</button>
                            <button className={tabClasses(tab === 'Network')} onClick={() => setTab('Network')}>Internet</button>
                        </div>
                    </div>
                    <div className="mt-3 grid grid-cols-4 gap-2 text-[11px]">
                        <div className="rounded-lg bg-white/10 px-2 py-1.5">
                            <div className="text-gray-300/70">Processes</div>
                            <div className="text-white font-semibold">{totals.procCount}</div>
                        </div>
                        <div className="rounded-lg bg-white/10 px-2 py-1.5">
                            <div className="text-gray-300/70">CPU</div>
                            <div className="text-white font-semibold">{totals.cpu.toFixed(1)}%</div>
                        </div>
                        <div className="rounded-lg bg-white/10 px-2 py-1.5">
                            <div className="text-gray-300/70">Memory</div>
                            <div className="text-white font-semibold">{totals.mem.toFixed(1)}%</div>
                        </div>
                        <div className="rounded-lg bg-white/10 px-2 py-1.5">
                            <div className="text-gray-300/70">Disk</div>
                            <div className="text-white font-semibold">{totals.disk.toFixed(1)}%</div>
                        </div>
                    </div>
                </div>

                {tab === 'Processes' && (
                    <div className="flex-1 overflow-auto p-2">
                        <div className="grid grid-cols-7 gap-2 font-semibold border-b border-white/10 px-4 py-2 bg-white/5 sticky top-0">
                            <div>PID</div>
                            <div>Name</div>
                            <div>CPU %</div>
                            <div>Mem (MB)</div>
                            <div>Disk</div>
                            <div>Net</div>
                            <div>Action</div>
                        </div>
                        {processes.map(p => (
                            <div key={p.pid} className="grid grid-cols-7 gap-2 items-center px-3 py-2 hover:bg-white/5 rounded">
                                <div className="font-mono">{p.pid}</div>
                                <div>{p.name}</div>
                                <div className="font-mono">{p.cpu.toFixed(1)}</div>
                                <div className="font-mono">{p.mem.toFixed(1)}</div>
                                <div className="font-mono">{p.disk.toFixed(1)}</div>
                                <div className="font-mono">{p.net.toFixed(1)}</div>
                                <div>
                                    <button
                                        onClick={() => killProcess(p.pid)}
                                        className="text-red-300 hover:text-red-200 hover:bg-red-400/10 px-2 py-1 rounded text-xs transition-colors"
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
                    <div className="flex-1 overflow-auto p-4 space-y-4">
                        {[
                            { label: 'CPU', value: totals.cpu },
                            { label: 'Memory', value: totals.mem },
                            { label: 'Disk', value: totals.disk },
                            { label: 'Network', value: totals.net }
                        ].map(stat => (
                            <div key={stat.label} className="rounded-xl bg-white/5 p-4 border border-white/10">
                                <div className="flex items-center justify-between text-xs uppercase tracking-widest text-gray-300/70">
                                    <span>{stat.label}</span>
                                    <span className="text-white font-semibold">{stat.value.toFixed(1)}%</span>
                                </div>
                                <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500"
                                        style={{ width: `${Math.min(100, stat.value)}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {tab === 'Network' && (
                    <div className="flex-1 overflow-auto p-4 space-y-4">
                        <div className="rounded-2xl bg-white/5 p-5 border border-white/10">
                            <div className="text-xs uppercase tracking-[0.3em] text-gray-300/70">Latency</div>
                            <div className="mt-2 text-3xl font-semibold text-white">{networkLatencyMs} ms</div>
                            <div className="mt-2 text-[11px] text-gray-300/60">
                                Simulated ping to AetherOS backbone.
                            </div>
                        </div>
                        <div className="rounded-xl bg-white/5 p-4 border border-white/10">
                            <div className="flex items-center justify-between text-xs uppercase tracking-widest text-gray-300/70">
                                <span>Network Utilization</span>
                                <span className="text-white font-semibold">{totals.net.toFixed(1)}%</span>
                            </div>
                            <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500"
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
