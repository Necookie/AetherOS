/// <reference lib="webworker" />

interface Process {
    pid: number
    name: string
    cpu: number
    mem: number
    status: 'running' | 'waiting' | 'terminated'
}

let processes: Process[] = [
    { pid: 1, name: 'init', cpu: 0, mem: 5, status: 'running' },
    { pid: 2, name: 'terminal', cpu: 2, mem: 15, status: 'running' },
    { pid: 3, name: 'taskmgr', cpu: 5, mem: 10, status: 'running' },
]

let nextPid = 4

function tick() {
    // simulate some CPU usage jitter
    processes = processes.map(p => ({
        ...p,
        cpu: Math.max(0, Math.min(100, p.cpu + (Math.random() - 0.5) * 5))
    }))

    const cpuUsage = Math.min(100, processes.reduce((acc, p) => acc + p.cpu, 0))
    const memUsage = Math.min(100, processes.reduce((acc, p) => acc + p.mem, 0))

    postMessage({
        type: 'TICK',
        payload: {
            processes,
            cpuUsage,
            memUsage,
            diskUsage: 45 // fake static
        }
    })
}

setInterval(tick, 1000)

self.onmessage = (e) => {
    const { type, payload } = e.data
    if (type === 'KILL_PROCESS') {
        processes = processes.filter(p => p.pid !== payload.pid)
    } else if (type === 'SPAWN_PROCESS') {
        processes.push({
            pid: nextPid++,
            name: payload.name,
            cpu: Math.random() * 10,
            mem: Math.random() * 20 + 5,
            status: 'running'
        })
    }
}
