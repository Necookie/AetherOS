import type { Process } from './types'

export const KERNEL_PROTOCOL_VERSION = 3
const METRICS = ['cpu', 'mem', 'disk', 'net'] as const
const KERNEL_ACTIVITY_TYPES = [
    'app-launch',
    'app-close',
    'file-copy',
    'file-move',
    'file-delete',
    'file-restore',
    'browser-navigate',
    'browser-download',
    'productivity-autosave',
] as const

export type KernelMetric = typeof METRICS[number]
export type KernelActivityType = typeof KERNEL_ACTIVITY_TYPES[number]

export type KernelTopContributor = {
    metric: KernelMetric
    pid: number
    name: string
    source: string
    delta: number
}

export type KernelActivityEventPayload = {
    protocolVersion: number
    type: KernelActivityType
    sourceAppId?: string
    targetAppId?: string
    units?: number
}

export type KernelTickPayload = {
    protocolVersion: number
    tickCount: number
    processes: Process[]
    cpuUsage: number
    memUsage: number
    diskUsage: number
    netUsage: number
    networkLatencyMs: number
    recentSpikes: Record<KernelMetric, number>
    topContributors: KernelTopContributor[]
}

export type KernelEventMessage = {
    type: 'TICK'
    payload: KernelTickPayload
}

export type KernelCommandMessage =
    | { type: 'KILL_PROCESS'; payload: { protocolVersion: number; pid: number } }
    | { type: 'SPAWN_PROCESS'; payload: { protocolVersion: number; name: string } }
    | { type: 'SPAWN_APP_PROCESS'; payload: { protocolVersion: number; appId: string; name: string } }
    | { type: 'KILL_APP_PROCESS'; payload: { protocolVersion: number; appId: string } }
    | { type: 'REPORT_ACTIVITY'; payload: KernelActivityEventPayload }

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
        return Boolean(
            candidate.payload
            && candidate.payload.protocolVersion === KERNEL_PROTOCOL_VERSION
            && typeof candidate.payload.pid === 'number',
        )
    }

    if (candidate.type === 'SPAWN_PROCESS') {
        return Boolean(
            candidate.payload
            && candidate.payload.protocolVersion === KERNEL_PROTOCOL_VERSION
            && typeof candidate.payload.name === 'string',
        )
    }

    if (candidate.type === 'SPAWN_APP_PROCESS') {
        return Boolean(
            candidate.payload
            && candidate.payload.protocolVersion === KERNEL_PROTOCOL_VERSION
            && typeof candidate.payload.appId === 'string'
            && typeof candidate.payload.name === 'string',
        )
    }

    if (candidate.type === 'KILL_APP_PROCESS') {
        return Boolean(
            candidate.payload
            && candidate.payload.protocolVersion === KERNEL_PROTOCOL_VERSION
            && typeof candidate.payload.appId === 'string',
        )
    }

    if (candidate.type === 'REPORT_ACTIVITY') {
        return isKernelActivityEventPayload(candidate.payload)
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
        && typeof payload.tickCount === 'number'
        && typeof payload.cpuUsage === 'number'
        && typeof payload.memUsage === 'number'
        && typeof payload.diskUsage === 'number'
        && typeof payload.netUsage === 'number'
        && typeof payload.networkLatencyMs === 'number'
        && isRecentSpikes(payload.recentSpikes)
        && Array.isArray(payload.topContributors)
        && payload.topContributors.every(isKernelTopContributor)
}

function isRecentSpikes(value: unknown): value is Record<KernelMetric, number> {
    if (!value || typeof value !== 'object') {
        return false
    }

    return METRICS.every((metric) => typeof (value as Record<KernelMetric, unknown>)[metric] === 'number')
}

function isKernelTopContributor(value: unknown): value is KernelTopContributor {
    if (!value || typeof value !== 'object') {
        return false
    }

    const contributor = value as Partial<KernelTopContributor>
    return Boolean(
        contributor.metric
        && METRICS.includes(contributor.metric)
        && typeof contributor.pid === 'number'
        && typeof contributor.name === 'string'
        && typeof contributor.source === 'string'
        && typeof contributor.delta === 'number',
    )
}

function isKernelActivityEventPayload(value: unknown): value is KernelActivityEventPayload {
    if (!value || typeof value !== 'object') {
        return false
    }

    const payload = value as Partial<KernelActivityEventPayload>
    return Boolean(
        payload.protocolVersion === KERNEL_PROTOCOL_VERSION
        && payload.type
        && KERNEL_ACTIVITY_TYPES.includes(payload.type)
        && (payload.sourceAppId === undefined || typeof payload.sourceAppId === 'string')
        && (payload.targetAppId === undefined || typeof payload.targetAppId === 'string')
        && (payload.units === undefined || typeof payload.units === 'number'),
    )
}
