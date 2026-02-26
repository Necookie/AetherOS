import { create } from 'zustand'

export interface Process {
    pid: number
    name: string
    cpu: number
    mem: number
    disk: number
    net: number
    status: 'running' | 'waiting' | 'terminated'
}

interface KernelState {
    processes: Process[]
    cpuUsage: number
    memUsage: number
    diskUsage: number
    netUsage: number
    networkLatencyMs: number
    worker: Worker | null
    initKernel: () => void
    killProcess: (pid: number) => void
    spawnProcess: (name: string) => void
}

export const useKernelStore = create<KernelState>((set, get) => ({
    processes: [],
    cpuUsage: 0,
    memUsage: 0,
    diskUsage: 0,
    netUsage: 0,
    networkLatencyMs: 0,
    worker: null,
    initKernel: () => {
        if (get().worker) return

        const worker = new Worker(new URL('../worker/kernel.worker.ts', import.meta.url), {
            type: 'module'
        })

        worker.onmessage = (e) => {
            const { type, payload } = e.data
            if (type === 'TICK') {
                set({
                    processes: payload.processes,
                    cpuUsage: payload.cpuUsage,
                    memUsage: payload.memUsage,
                    diskUsage: payload.diskUsage,
                    netUsage: payload.netUsage,
                    networkLatencyMs: payload.networkLatencyMs
                })
            }
        }

        set({ worker })
    },
    killProcess: (pid: number) => {
        get().worker?.postMessage({ type: 'KILL_PROCESS', payload: { pid } })
    },
    spawnProcess: (name: string) => {
        get().worker?.postMessage({ type: 'SPAWN_PROCESS', payload: { name } })
    }
}))
