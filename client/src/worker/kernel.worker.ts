/// <reference lib="webworker" />

import { createTickMessage, isKernelCommandMessage } from '../features/kernel/protocol'
import type { Process } from '../features/kernel/types'

let processes: Process[] = [
    { pid: 1, name: 'init', cpu: 0.4, mem: 6, disk: 0.2, net: 0.1, status: 'running' },
    { pid: 2, name: 'terminal', cpu: 2, mem: 18, disk: 0.6, net: 0.2, status: 'running' },
    { pid: 3, name: 'taskmgr', cpu: 3, mem: 12, disk: 0.4, net: 0.3, status: 'running' },
]

let nextPid = 4
let networkLatencyMs = 24

const processTemplates: Record<string, { memBase: number; cpuBase: number; diskBase: number; netBase: number }> = {
    terminal: { memBase: 18, cpuBase: 2, diskBase: 0.6, netBase: 0.2 },
    taskmgr: { memBase: 12, cpuBase: 3, diskBase: 0.4, netBase: 0.3 },
    settings: { memBase: 14, cpuBase: 1.5, diskBase: 0.5, netBase: 0.2 },
    default: { memBase: 10, cpuBase: 1, diskBase: 0.3, netBase: 0.1 },
}

function tick() {
    processes = processes.map((process) => ({
        ...process,
        cpu: Math.max(0, Math.min(100, process.cpu + (Math.random() - 0.5) * 4)),
        mem: Math.max(4, Math.min(128, process.mem + (Math.random() - 0.5) * 2)),
        disk: Math.max(0, Math.min(20, process.disk + (Math.random() - 0.5) * 1)),
        net: Math.max(0, Math.min(20, process.net + (Math.random() - 0.5) * 1.2)),
    }))

    const cpuUsage = Math.min(100, processes.reduce((sum, process) => sum + process.cpu, 0))
    const memUsage = Math.min(100, processes.reduce((sum, process) => sum + process.mem, 0))
    const diskUsage = Math.min(100, processes.reduce((sum, process) => sum + process.disk, 0))
    const netUsage = Math.min(100, processes.reduce((sum, process) => sum + process.net, 0))

    networkLatencyMs = Math.max(8, Math.min(140, networkLatencyMs + (Math.random() - 0.5) * 8))

    postMessage(createTickMessage({
        processes,
        cpuUsage,
        memUsage,
        diskUsage,
        netUsage,
        networkLatencyMs: Math.round(networkLatencyMs),
    }))
}

setInterval(tick, 1000)

self.onmessage = (e) => {
    if (!isKernelCommandMessage(e.data)) {
        return
    }

    const { type, payload } = e.data

    if (type === 'KILL_PROCESS') {
        processes = processes.filter((process) => process.pid !== payload.pid)
        return
    }

    const template = processTemplates[payload.name] ?? processTemplates.default
    processes.push({
        pid: nextPid++,
        name: payload.name,
        cpu: template.cpuBase + Math.random() * 2,
        mem: template.memBase + Math.random() * 6,
        disk: template.diskBase + Math.random() * 2,
        net: template.netBase + Math.random() * 2,
        status: 'running',
    })
}
