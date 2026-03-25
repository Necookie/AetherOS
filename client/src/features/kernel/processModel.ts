import type { Process, ProcessStatus } from './types'

export interface KernelProcessRecord extends Process {
    waitTicksRemaining: number
    runTicksRemaining: number
    terminatedTicksRemaining: number
}

export const TERMINATED_RETENTION_TICKS = 4

type CreateProcessRecordInput = {
    pid: number
    name: string
    appId?: string
    cpu: number
    mem: number
    disk: number
    net: number
    status: ProcessStatus
    tickCount?: number
}

export function createProcessRecord(input: CreateProcessRecordInput): KernelProcessRecord {
    return {
        pid: input.pid,
        name: input.name,
        appId: input.appId,
        cpu: input.cpu,
        mem: input.mem,
        disk: input.disk,
        net: input.net,
        status: input.status,
        lastTransition: formatTransition(null, input.status),
        lastTransitionTick: input.tickCount ?? 0,
        waitTicksRemaining: input.status === 'waiting' ? 2 : 0,
        runTicksRemaining: input.status === 'running' ? 2 : 0,
        terminatedTicksRemaining: input.status === 'terminated' ? TERMINATED_RETENTION_TICKS : 0,
    }
}

export function transitionProcess(
    process: KernelProcessRecord,
    nextStatus: ProcessStatus,
    tickCount: number,
    reason?: string,
): KernelProcessRecord {
    if (process.status === nextStatus) {
        return process
    }

    const waitTicksRemaining = nextStatus === 'waiting'
        ? 2 + Math.floor(Math.random() * 2)
        : 0
    const runTicksRemaining = nextStatus === 'running'
        ? 1 + Math.floor(Math.random() * 3)
        : 0

    return {
        ...process,
        status: nextStatus,
        lastTransition: formatTransition(process.status, nextStatus, reason),
        lastTransitionTick: tickCount,
        waitTicksRemaining,
        runTicksRemaining,
        terminatedTicksRemaining: nextStatus === 'terminated' ? TERMINATED_RETENTION_TICKS : 0,
    }
}

export function decayTerminatedProcess(process: KernelProcessRecord): KernelProcessRecord {
    return {
        ...process,
        cpu: driftToward(process.cpu, 0, 0.6),
        mem: driftToward(process.mem, 16, 0.28),
        disk: driftToward(process.disk, 0, 0.55),
        net: driftToward(process.net, 0, 0.55),
        terminatedTicksRemaining: Math.max(0, process.terminatedTicksRemaining - 1),
    }
}

export function stepWaitingProcess(process: KernelProcessRecord): KernelProcessRecord {
    return {
        ...process,
        waitTicksRemaining: Math.max(0, process.waitTicksRemaining - 1),
    }
}

export function stepRunningProcess(process: KernelProcessRecord): KernelProcessRecord {
    return {
        ...process,
        runTicksRemaining: Math.max(0, process.runTicksRemaining - 1),
    }
}

export function isActiveProcess(process: Process): boolean {
    return process.status !== 'terminated'
}

export function formatProcessStatus(status: ProcessStatus): 'Ready' | 'Running' | 'Waiting' | 'Terminated' {
    if (status === 'ready') {
        return 'Ready'
    }

    if (status === 'running') {
        return 'Running'
    }

    if (status === 'waiting') {
        return 'Waiting'
    }

    return 'Terminated'
}

function formatTransition(previousStatus: ProcessStatus | null, nextStatus: ProcessStatus, reason?: string): string {
    const nextLabel = formatProcessStatus(nextStatus)
    if (!previousStatus) {
        return `Initialized as ${nextLabel}`
    }

    const previousLabel = formatProcessStatus(previousStatus)
    return reason ? `${previousLabel} -> ${nextLabel} (${reason})` : `${previousLabel} -> ${nextLabel}`
}

function driftToward(current: number, target: number, factor: number): number {
    return current + (target - current) * factor
}
