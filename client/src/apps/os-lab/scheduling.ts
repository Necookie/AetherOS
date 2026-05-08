export interface CpuProcessInput {
    pid: string
    arrivalTime: number
    burstTime: number
    priority: number
}

export interface CpuExecutionSegment {
    pid: string
    start: number
    end: number
}

export interface CpuProcessMetrics {
    pid: string
    arrivalTime: number
    burstTime: number
    priority: number
    completionTime: number
    turnaroundTime: number
    waitingTime: number
}

export interface CpuSimulationResult {
    segments: CpuExecutionSegment[]
    metrics: CpuProcessMetrics[]
    averageTurnaroundTime: number
    averageWaitingTime: number
    totalTime: number
}

export type CpuAlgorithm = 'fcfs' | 'sjf' | 'srtf' | 'rr' | 'priority-np' | 'priority-p'
export type DiskAlgorithm = 'fcfs' | 'sstf' | 'scan' | 'c-scan'
export type ScanDirection = 'left' | 'right'

export interface DiskSimulationResult {
    order: number[]
    points: number[]
    totalSeekDistance: number
}

interface RuntimeProcess extends CpuProcessInput {
    order: number
    remainingTime: number
    completionTime: number | null
}

function sanitizeProcesses(processes: CpuProcessInput[]) {
    return processes
        .map((process, order) => ({
            ...process,
            pid: process.pid.trim(),
            arrivalTime: Number.isFinite(process.arrivalTime) ? Math.max(0, Math.floor(process.arrivalTime)) : 0,
            burstTime: Number.isFinite(process.burstTime) ? Math.max(1, Math.floor(process.burstTime)) : 1,
            priority: Number.isFinite(process.priority) ? Math.floor(process.priority) : 0,
            order,
            remainingTime: Number.isFinite(process.burstTime) ? Math.max(1, Math.floor(process.burstTime)) : 1,
            completionTime: null,
        }))
        .filter((process) => process.pid.length > 0)
}

function appendSegment(segments: CpuExecutionSegment[], pid: string, start: number, end: number) {
    if (end <= start) {
        return
    }

    const last = segments[segments.length - 1]
    if (last && last.pid === pid && last.end === start) {
        last.end = end
        return
    }

    segments.push({ pid, start, end })
}

function sortByArrival(processes: RuntimeProcess[]) {
    return [...processes].sort((left, right) => (
        left.arrivalTime - right.arrivalTime
        || left.order - right.order
    ))
}

function buildCpuResult(processes: RuntimeProcess[], segments: CpuExecutionSegment[]): CpuSimulationResult {
    const metrics = [...processes]
        .sort((left, right) => left.order - right.order)
        .map((process) => {
            const completionTime = process.completionTime ?? process.arrivalTime
            const turnaroundTime = completionTime - process.arrivalTime
            const waitingTime = turnaroundTime - process.burstTime

            return {
                pid: process.pid,
                arrivalTime: process.arrivalTime,
                burstTime: process.burstTime,
                priority: process.priority,
                completionTime,
                turnaroundTime,
                waitingTime,
            }
        })

    const totalTurnaround = metrics.reduce((sum, process) => sum + process.turnaroundTime, 0)
    const totalWaiting = metrics.reduce((sum, process) => sum + process.waitingTime, 0)
    const totalTime = segments[segments.length - 1]?.end ?? 0

    return {
        segments,
        metrics,
        averageTurnaroundTime: metrics.length > 0 ? totalTurnaround / metrics.length : 0,
        averageWaitingTime: metrics.length > 0 ? totalWaiting / metrics.length : 0,
        totalTime,
    }
}

export function simulateCpuScheduling(
    sourceProcesses: CpuProcessInput[],
    algorithm: CpuAlgorithm,
    quantum = 2,
): CpuSimulationResult {
    const processes = sanitizeProcesses(sourceProcesses)
    if (processes.length === 0) {
        return buildCpuResult([], [])
    }

    if (algorithm === 'fcfs') {
        return simulateFirstComeFirstServed(processes)
    }

    if (algorithm === 'sjf') {
        return simulateShortestJobFirst(processes)
    }

    if (algorithm === 'srtf') {
        return simulateShortestRemainingTimeFirst(processes)
    }

    if (algorithm === 'rr') {
        return simulateRoundRobin(processes, quantum)
    }

    return simulatePriority(processes, algorithm === 'priority-p')
}

function simulateFirstComeFirstServed(processes: RuntimeProcess[]) {
    const segments: CpuExecutionSegment[] = []
    const queue = sortByArrival(processes)
    let time = 0

    for (const process of queue) {
        if (time < process.arrivalTime) {
            appendSegment(segments, 'Idle', time, process.arrivalTime)
            time = process.arrivalTime
        }

        appendSegment(segments, process.pid, time, time + process.burstTime)
        time += process.burstTime
        process.remainingTime = 0
        process.completionTime = time
    }

    return buildCpuResult(processes, segments)
}

function simulateShortestJobFirst(processes: RuntimeProcess[]) {
    const segments: CpuExecutionSegment[] = []
    let time = Math.min(...processes.map((process) => process.arrivalTime))
    let completed = 0

    while (completed < processes.length) {
        const available = processes
            .filter((process) => process.remainingTime > 0 && process.arrivalTime <= time)
            .sort((left, right) => (
                left.burstTime - right.burstTime
                || left.arrivalTime - right.arrivalTime
                || left.order - right.order
            ))

        const current = available[0]
        if (!current) {
            const nextArrival = Math.min(...processes.filter((process) => process.remainingTime > 0).map((process) => process.arrivalTime))
            appendSegment(segments, 'Idle', time, nextArrival)
            time = nextArrival
            continue
        }

        appendSegment(segments, current.pid, time, time + current.remainingTime)
        time += current.remainingTime
        current.remainingTime = 0
        current.completionTime = time
        completed += 1
    }

    return buildCpuResult(processes, segments)
}

function simulateShortestRemainingTimeFirst(processes: RuntimeProcess[]) {
    const segments: CpuExecutionSegment[] = []
    let time = Math.min(...processes.map((process) => process.arrivalTime))
    let completed = 0

    while (completed < processes.length) {
        const available = processes
            .filter((process) => process.remainingTime > 0 && process.arrivalTime <= time)
            .sort((left, right) => (
                left.remainingTime - right.remainingTime
                || left.arrivalTime - right.arrivalTime
                || left.order - right.order
            ))

        const current = available[0]
        if (!current) {
            const nextArrival = Math.min(...processes.filter((process) => process.remainingTime > 0).map((process) => process.arrivalTime))
            appendSegment(segments, 'Idle', time, nextArrival)
            time = nextArrival
            continue
        }

        appendSegment(segments, current.pid, time, time + 1)
        current.remainingTime -= 1
        time += 1

        if (current.remainingTime === 0) {
            current.completionTime = time
            completed += 1
        }
    }

    return buildCpuResult(processes, segments)
}

function simulateRoundRobin(processes: RuntimeProcess[], quantum: number) {
    const segments: CpuExecutionSegment[] = []
    const sorted = sortByArrival(processes)
    const readyQueue: RuntimeProcess[] = []
    const slice = Math.max(1, Math.floor(quantum))
    let time = sorted[0]?.arrivalTime ?? 0
    let nextIndex = 0
    let completed = 0

    const enqueueArrivals = (limit: number) => {
        while (nextIndex < sorted.length && sorted[nextIndex].arrivalTime <= limit) {
            readyQueue.push(sorted[nextIndex])
            nextIndex += 1
        }
    }

    enqueueArrivals(time)

    while (completed < processes.length) {
        if (readyQueue.length === 0) {
            const nextArrival = sorted[nextIndex]?.arrivalTime
            if (nextArrival === undefined) {
                break
            }

            appendSegment(segments, 'Idle', time, nextArrival)
            time = nextArrival
            enqueueArrivals(time)
            continue
        }

        const current = readyQueue.shift()
        if (!current) {
            continue
        }

        const runTime = Math.min(slice, current.remainingTime)
        appendSegment(segments, current.pid, time, time + runTime)
        time += runTime
        current.remainingTime -= runTime
        enqueueArrivals(time)

        if (current.remainingTime > 0) {
            readyQueue.push(current)
            continue
        }

        current.completionTime = time
        completed += 1
    }

    return buildCpuResult(processes, segments)
}

function simulatePriority(processes: RuntimeProcess[], isPreemptive: boolean) {
    const segments: CpuExecutionSegment[] = []
    let time = Math.min(...processes.map((process) => process.arrivalTime))
    let completed = 0

    while (completed < processes.length) {
        const available = processes
            .filter((process) => process.remainingTime > 0 && process.arrivalTime <= time)
            .sort((left, right) => (
                left.priority - right.priority
                || (isPreemptive ? left.remainingTime - right.remainingTime : left.burstTime - right.burstTime)
                || left.arrivalTime - right.arrivalTime
                || left.order - right.order
            ))

        const current = available[0]
        if (!current) {
            const nextArrival = Math.min(...processes.filter((process) => process.remainingTime > 0).map((process) => process.arrivalTime))
            appendSegment(segments, 'Idle', time, nextArrival)
            time = nextArrival
            continue
        }

        const runTime = isPreemptive ? 1 : current.remainingTime
        appendSegment(segments, current.pid, time, time + runTime)
        time += runTime
        current.remainingTime -= runTime

        if (current.remainingTime === 0) {
            current.completionTime = time
            completed += 1
        }
    }

    return buildCpuResult(processes, segments)
}

function sanitizeRequests(requests: number[]) {
    return requests
        .map((request) => Math.floor(request))
        .filter((request) => Number.isFinite(request) && request >= 0)
}

function buildDiskResult(points: number[]): DiskSimulationResult {
    const totalSeekDistance = points.slice(1).reduce((sum, point, index) => sum + Math.abs(point - points[index]), 0)

    return {
        order: points.slice(1).filter((point, index) => point !== points[index]),
        points,
        totalSeekDistance,
    }
}

export function simulateDiskScheduling(
    sourceRequests: number[],
    algorithm: DiskAlgorithm,
    headStart: number,
    maxCylinder: number,
    direction: ScanDirection,
): DiskSimulationResult {
    const requests = sanitizeRequests(sourceRequests).map((request) => Math.min(request, maxCylinder))
    const initialHead = Math.max(0, Math.min(Math.floor(headStart), maxCylinder))

    if (requests.length === 0) {
        return buildDiskResult([initialHead])
    }

    if (algorithm === 'fcfs') {
        return buildDiskResult([initialHead, ...requests])
    }

    if (algorithm === 'sstf') {
        return simulateShortestSeekTimeFirst(requests, initialHead)
    }

    if (algorithm === 'scan') {
        return simulateScan(requests, initialHead, maxCylinder, direction)
    }

    return simulateCircularScan(requests, initialHead, maxCylinder, direction)
}

function simulateShortestSeekTimeFirst(requests: number[], initialHead: number) {
    const remaining = [...requests]
    const points = [initialHead]
    let head = initialHead

    while (remaining.length > 0) {
        let bestIndex = 0
        let bestDistance = Math.abs(remaining[0] - head)

        for (let index = 1; index < remaining.length; index += 1) {
            const distance = Math.abs(remaining[index] - head)
            if (distance < bestDistance) {
                bestDistance = distance
                bestIndex = index
            }
        }

        head = remaining.splice(bestIndex, 1)[0]
        points.push(head)
    }

    return buildDiskResult(points)
}

function simulateScan(requests: number[], initialHead: number, maxCylinder: number, direction: ScanDirection) {
    const left = requests.filter((request) => request < initialHead).sort((a, b) => b - a)
    const right = requests.filter((request) => request >= initialHead).sort((a, b) => a - b)
    const points = [initialHead]

    if (direction === 'right') {
        points.push(...right)
        if (left.length > 0) {
            if (points[points.length - 1] !== maxCylinder) {
                points.push(maxCylinder)
            }
            points.push(...left)
        }
        return buildDiskResult(points)
    }

    points.push(...left)
    if (right.length > 0) {
        if (points[points.length - 1] !== 0) {
            points.push(0)
        }
        points.push(...right)
    }

    return buildDiskResult(points)
}

function simulateCircularScan(requests: number[], initialHead: number, maxCylinder: number, direction: ScanDirection) {
    const left = requests.filter((request) => request < initialHead).sort((a, b) => a - b)
    const right = requests.filter((request) => request >= initialHead).sort((a, b) => a - b)
    const points = [initialHead]

    if (direction === 'right') {
        points.push(...right)
        if (left.length > 0) {
            if (points[points.length - 1] !== maxCylinder) {
                points.push(maxCylinder)
            }
            points.push(0)
            points.push(...left)
        }
        return buildDiskResult(points)
    }

    const descendingLeft = [...left].reverse()
    const descendingRight = [...right].reverse()
    points.push(...descendingLeft)
    if (right.length > 0) {
        if (points[points.length - 1] !== 0) {
            points.push(0)
        }
        points.push(maxCylinder)
        points.push(...descendingRight)
    }

    return buildDiskResult(points)
}
