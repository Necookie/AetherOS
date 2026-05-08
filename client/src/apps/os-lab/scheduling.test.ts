import { describe, expect, it } from 'vitest'
import { simulateCpuScheduling, simulateDiskScheduling } from './scheduling'

describe('simulateCpuScheduling', () => {
    it('runs round robin with queued arrivals and time slicing', () => {
        const result = simulateCpuScheduling([
            { pid: 'P1', arrivalTime: 0, burstTime: 5, priority: 2 },
            { pid: 'P2', arrivalTime: 0, burstTime: 3, priority: 1 },
        ], 'rr', 2)

        expect(result.segments).toEqual([
            { pid: 'P1', start: 0, end: 2 },
            { pid: 'P2', start: 2, end: 4 },
            { pid: 'P1', start: 4, end: 6 },
            { pid: 'P2', start: 6, end: 7 },
            { pid: 'P1', start: 7, end: 8 },
        ])
        expect(result.metrics).toEqual([
            {
                pid: 'P1',
                arrivalTime: 0,
                burstTime: 5,
                priority: 2,
                completionTime: 8,
                turnaroundTime: 8,
                waitingTime: 3,
            },
            {
                pid: 'P2',
                arrivalTime: 0,
                burstTime: 3,
                priority: 1,
                completionTime: 7,
                turnaroundTime: 7,
                waitingTime: 4,
            },
        ])
    })

    it('preempts by shortest remaining time first', () => {
        const result = simulateCpuScheduling([
            { pid: 'P1', arrivalTime: 0, burstTime: 8, priority: 2 },
            { pid: 'P2', arrivalTime: 1, burstTime: 4, priority: 1 },
            { pid: 'P3', arrivalTime: 2, burstTime: 2, priority: 3 },
        ], 'srtf')

        expect(result.segments).toEqual([
            { pid: 'P1', start: 0, end: 1 },
            { pid: 'P2', start: 1, end: 2 },
            { pid: 'P3', start: 2, end: 4 },
            { pid: 'P2', start: 4, end: 7 },
            { pid: 'P1', start: 7, end: 14 },
        ])
        expect(result.metrics.map((process) => ({ pid: process.pid, waitingTime: process.waitingTime }))).toEqual([
            { pid: 'P1', waitingTime: 6 },
            { pid: 'P2', waitingTime: 2 },
            { pid: 'P3', waitingTime: 0 },
        ])
    })

    it('honors higher priority values as lower precedence numbers', () => {
        const result = simulateCpuScheduling([
            { pid: 'P1', arrivalTime: 0, burstTime: 5, priority: 3 },
            { pid: 'P2', arrivalTime: 1, burstTime: 2, priority: 1 },
            { pid: 'P3', arrivalTime: 2, burstTime: 1, priority: 2 },
        ], 'priority-p')

        expect(result.segments).toEqual([
            { pid: 'P1', start: 0, end: 1 },
            { pid: 'P2', start: 1, end: 3 },
            { pid: 'P3', start: 3, end: 4 },
            { pid: 'P1', start: 4, end: 8 },
        ])
        expect(result.metrics.map((process) => ({ pid: process.pid, completionTime: process.completionTime }))).toEqual([
            { pid: 'P1', completionTime: 8 },
            { pid: 'P2', completionTime: 3 },
            { pid: 'P3', completionTime: 4 },
        ])
    })
})

describe('simulateDiskScheduling', () => {
    it('follows fcfs request order and seek distance', () => {
        const result = simulateDiskScheduling([98, 183, 37, 122], 'fcfs', 53, 199, 'right')

        expect(result.points).toEqual([53, 98, 183, 37, 122])
        expect(result.totalSeekDistance).toBe(361)
    })

    it('uses sstf to service the nearest request each step', () => {
        const result = simulateDiskScheduling([98, 183, 37, 122, 14, 124, 65, 67], 'sstf', 53, 199, 'right')

        expect(result.points).toEqual([53, 65, 67, 37, 14, 98, 122, 124, 183])
        expect(result.totalSeekDistance).toBe(236)
    })

    it('extends to the boundary for scan-style traversal', () => {
        const result = simulateDiskScheduling([98, 183, 37, 122, 14, 124, 65, 67], 'scan', 53, 199, 'right')

        expect(result.points).toEqual([53, 65, 67, 98, 122, 124, 183, 199, 37, 14])
        expect(result.totalSeekDistance).toBe(331)
    })

    it('wraps back to the start for c-scan traversal', () => {
        const result = simulateDiskScheduling([98, 183, 37, 122, 14, 124, 65, 67], 'c-scan', 53, 199, 'right')

        expect(result.points).toEqual([53, 65, 67, 98, 122, 124, 183, 199, 0, 14, 37])
        expect(result.totalSeekDistance).toBe(382)
    })
})
