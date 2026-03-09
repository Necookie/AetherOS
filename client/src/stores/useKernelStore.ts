import { create } from 'zustand'
import {
    KERNEL_PROTOCOL_VERSION,
    isKernelCommandMessage,
    isKernelEventMessage,
    type KernelActivityEventPayload,
    type KernelCommandMessage,
    type KernelTopContributor,
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
    recentSpikes: Record<'cpu' | 'mem' | 'disk' | 'net', number>
    topContributors: KernelTopContributor[]
    worker: Worker | null
    initKernel: () => void
    killProcess: (pid: number) => void
    spawnProcess: (name: string) => void
    spawnAppProcess: (appId: string, name: string) => void
    killAppProcess: (appId: string) => void
    reportActivity: (activity: Omit<KernelActivityEventPayload, 'protocolVersion'>) => void
}

export const useKernelStore = create<KernelState>((set, get) => ({
    processes: [],
    cpuUsage: 0,
    memUsage: 0,
    diskUsage: 0,
    netUsage: 0,
    networkLatencyMs: 0,
    recentSpikes: { cpu: 0, mem: 0, disk: 0, net: 0 },
    topContributors: [],
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
                recentSpikes: payload.recentSpikes,
                topContributors: payload.topContributors,
            })
        }

        set({ worker })
    },
    killProcess: (pid) => {
        const message: KernelCommandMessage = {
            type: 'KILL_PROCESS',
            payload: { protocolVersion: KERNEL_PROTOCOL_VERSION, pid },
        }
        if (isKernelCommandMessage(message)) {
            get().worker?.postMessage(message)
        }
    },
    spawnProcess: (name) => {
        const message: KernelCommandMessage = {
            type: 'SPAWN_PROCESS',
            payload: { protocolVersion: KERNEL_PROTOCOL_VERSION, name },
        }
        if (isKernelCommandMessage(message)) {
            get().worker?.postMessage(message)
        }
    },
    spawnAppProcess: (appId, name) => {
        const message: KernelCommandMessage = {
            type: 'SPAWN_APP_PROCESS',
            payload: { protocolVersion: KERNEL_PROTOCOL_VERSION, appId, name },
        }
        if (isKernelCommandMessage(message)) {
            get().worker?.postMessage(message)
        }
    },
    killAppProcess: (appId) => {
        const message: KernelCommandMessage = {
            type: 'KILL_APP_PROCESS',
            payload: { protocolVersion: KERNEL_PROTOCOL_VERSION, appId },
        }
        if (isKernelCommandMessage(message)) {
            get().worker?.postMessage(message)
        }
    },
    reportActivity: (activity) => {
        const message: KernelCommandMessage = {
            type: 'REPORT_ACTIVITY',
            payload: {
                protocolVersion: KERNEL_PROTOCOL_VERSION,
                ...activity,
            },
        }
        if (isKernelCommandMessage(message)) {
            get().worker?.postMessage(message)
        }
    },
}))
