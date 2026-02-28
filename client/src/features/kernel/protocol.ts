import type { Process } from './types'

export const KERNEL_PROTOCOL_VERSION = 1

export type KernelTickPayload = {
    protocolVersion: number
    processes: Process[]
    cpuUsage: number
    memUsage: number
    diskUsage: number
    netUsage: number
    networkLatencyMs: number
}

export type KernelEventMessage = {
    type: 'TICK'
    payload: KernelTickPayload
}

export type KernelCommandMessage =
    | { type: 'KILL_PROCESS'; payload: { pid: number } }
    | { type: 'SPAWN_PROCESS'; payload: { name: string } }

export function createTickMessage(payload: Omit<KernelTickPayload, 'protocolVersion'>): KernelEventMessage {
    return {
        type: 'TICK',
        payload: {
            protocolVersion: KERNEL_PROTOCOL_VERSION,
            ...payload,
        },
    }
}

export function isKernelEventMessage(value: unknown): value is KernelEventMessage {
    if (!value || typeof value !== 'object') {
        return false
    }

    const candidate = value as Partial<KernelEventMessage>
    return candidate.type === 'TICK' && isKernelTickPayload(candidate.payload)
}

export function isKernelCommandMessage(value: unknown): value is KernelCommandMessage {
    if (!value || typeof value !== 'object') {
        return false
    }

    const candidate = value as Partial<KernelCommandMessage>
    if (candidate.type === 'KILL_PROCESS') {
        return Boolean(candidate.payload && typeof candidate.payload.pid === 'number')
    }

    if (candidate.type === 'SPAWN_PROCESS') {
        return Boolean(candidate.payload && typeof candidate.payload.name === 'string')
    }

    return false
}

function isKernelTickPayload(value: unknown): value is KernelTickPayload {
    if (!value || typeof value !== 'object') {
        return false
    }

    const payload = value as Partial<KernelTickPayload>
    return payload.protocolVersion === KERNEL_PROTOCOL_VERSION
        && Array.isArray(payload.processes)
        && typeof payload.cpuUsage === 'number'
        && typeof payload.memUsage === 'number'
        && typeof payload.diskUsage === 'number'
        && typeof payload.netUsage === 'number'
        && typeof payload.networkLatencyMs === 'number'
}
