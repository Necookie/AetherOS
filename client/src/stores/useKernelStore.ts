import { create } from 'zustand'
import {
    isKernelCommandMessage,
    isKernelEventMessage,
    type KernelCommandMessage,
} from '../features/kernel/protocol'
import type { Process } from '../features/kernel/types'

export type { Process } from '../features/kernel/types'

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
        if (get().worker) {
            return
        }

        const worker = new Worker(new URL('../worker/kernel.worker.ts', import.meta.url), {
            type: 'module',
        })

        worker.onmessage = (e) => {
            if (!isKernelEventMessage(e.data)) {
                return
            }

            const { payload } = e.data
            set({
                processes: payload.processes,
                cpuUsage: payload.cpuUsage,
                memUsage: payload.memUsage,
                diskUsage: payload.diskUsage,
                netUsage: payload.netUsage,
                networkLatencyMs: payload.networkLatencyMs,
            })
        }

        set({ worker })
    },
    killProcess: (pid) => {
        const message: KernelCommandMessage = { type: 'KILL_PROCESS', payload: { pid } }
        if (isKernelCommandMessage(message)) {
            get().worker?.postMessage(message)
        }
    },
    spawnProcess: (name) => {
        const message: KernelCommandMessage = { type: 'SPAWN_PROCESS', payload: { name } }
        if (isKernelCommandMessage(message)) {
            get().worker?.postMessage(message)
        }
    },
}))
