import { beforeEach, describe, expect, it, vi } from 'vitest'
import { KERNEL_PROTOCOL_VERSION } from '../features/kernel/protocol'
import { useKernelStore } from './useKernelStore'

class MockWorker {
    public onmessage: ((event: MessageEvent<unknown>) => void) | null = null
    public postMessage = vi.fn()

    public emit(data: unknown) {
        this.onmessage?.({ data } as MessageEvent<unknown>)
    }
}

const workers: MockWorker[] = []
const WorkerMock = vi.fn(() => {
    const instance = new MockWorker()
    workers.push(instance)
    return instance
})

vi.stubGlobal('Worker', WorkerMock)

describe('kernel store worker integration', () => {
    beforeEach(() => {
        workers.length = 0
        WorkerMock.mockClear()
        useKernelStore.setState({
            processes: [],
            tickCount: 0,
            cpuUsage: 0,
            memUsage: 0,
            diskUsage: 0,
            netUsage: 0,
            networkLatencyMs: 0,
            recentSpikes: { cpu: 0, mem: 0, disk: 0, net: 0 },
            topContributors: [],
            worker: null,
        })
    })

    it('applies valid tick payloads from worker', () => {
        useKernelStore.getState().initKernel()
        const worker = workers[0]
        expect(worker).toBeTruthy()
        if (!worker) {
            return
        }

        worker.emit({
            type: 'TICK',
            payload: {
                protocolVersion: KERNEL_PROTOCOL_VERSION,
                tickCount: 5,
                processes: [{
                    pid: 9,
                    name: 'Aether Browser',
                    appId: 'browser',
                    cpu: 6,
                    mem: 220,
                    disk: 3,
                    net: 8,
                    status: 'running',
                    lastTransition: 'Ready -> Running',
                    lastTransitionTick: 5,
                }],
                cpuUsage: 26,
                memUsage: 42,
                diskUsage: 14,
                netUsage: 19,
                networkLatencyMs: 33,
                recentSpikes: { cpu: 8, mem: 120, disk: 4, net: 12 },
                topContributors: [{ metric: 'net', pid: 9, name: 'Aether Browser', source: 'Browser navigation', delta: 7.4 }],
            },
        })

        const state = useKernelStore.getState()
        expect(state.processes).toHaveLength(1)
        expect(state.tickCount).toBe(5)
        expect(state.cpuUsage).toBe(26)
        expect(state.recentSpikes.net).toBe(12)
        expect(state.topContributors[0]?.source).toBe('Browser navigation')
    })

    it('ignores tick payloads with mismatched protocol version', () => {
        useKernelStore.getState().initKernel()
        const worker = workers[0]
        expect(worker).toBeTruthy()
        if (!worker) {
            return
        }

        worker.emit({
            type: 'TICK',
            payload: {
                protocolVersion: 1,
                tickCount: 1,
                processes: [],
                cpuUsage: 99,
                memUsage: 99,
                diskUsage: 99,
                netUsage: 99,
                networkLatencyMs: 99,
                recentSpikes: { cpu: 99, mem: 99, disk: 99, net: 99 },
                topContributors: [],
            },
        })

        const state = useKernelStore.getState()
        expect(state.cpuUsage).toBe(0)
        expect(state.processes).toHaveLength(0)
    })

    it('sends versioned activity command messages to worker', () => {
        useKernelStore.getState().initKernel()
        const worker = workers[0]
        expect(worker).toBeTruthy()
        if (!worker) {
            return
        }

        useKernelStore.getState().reportActivity({
            type: 'file-copy',
            sourceAppId: 'term',
            targetAppId: 'term',
            units: 1.5,
        })

        expect(worker.postMessage).toHaveBeenCalledWith({
            type: 'REPORT_ACTIVITY',
            payload: {
                protocolVersion: KERNEL_PROTOCOL_VERSION,
                type: 'file-copy',
                sourceAppId: 'term',
                targetAppId: 'term',
                units: 1.5,
            },
        })
    })
})
