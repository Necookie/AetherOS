/// <reference lib="webworker" />

import { KERNEL_PROTOCOL_VERSION, createTickMessage, isKernelCommandMessage, type KernelActivityEventPayload, type KernelMetric, type KernelTopContributor } from '../features/kernel/protocol'
import { addResourceVectors, clampResourceVector, sampleDecayedVector, ZERO_VECTOR, type ResourceVector } from '../features/kernel/impactDecay'
import { MAX_EVENT_DELTA, resolveImpactProfile } from '../features/kernel/impactProfiles'
import type { Process } from '../features/kernel/types'

type Range = [number, number]
type ActivityLevel = 'idle' | 'active' | 'spike'
type MetricProfile = {
    idle: Range
    active: Range
    spike: Range
}
type ProcessProfile = {
    label: string
    cpu: MetricProfile
    mem: MetricProfile
    disk: MetricProfile
    net: MetricProfile
    idleChance: number
    spikeChance: number
}

type ActiveImpact = ReturnType<typeof resolveImpactProfile> & {
    startTick: number
}

const TOTAL_MEMORY_MB = 16_384
const STEP_INTERVAL_MS = 1000
const SMOOTHING_FACTOR = 0.34
const RECENT_SPIKE_WINDOW_TICKS = 6
const CONTRIBUTOR_EPSILON = 0.08

const DEFAULT_PROFILE: ProcessProfile = {
    label: 'Background Task',
    cpu: { idle: [0.2, 1.2], active: [1.2, 4.8], spike: [4.8, 10] },
    mem: { idle: [60, 120], active: [120, 260], spike: [260, 380] },
    disk: { idle: [0, 0.4], active: [0.4, 2], spike: [2, 4.2] },
    net: { idle: [0, 0.2], active: [0.2, 1.6], spike: [1.6, 3.8] },
    idleChance: 0.4,
    spikeChance: 0.08,
}

const APP_PROFILES: Record<string, ProcessProfile> = {
    term: {
        label: 'Terminal',
        cpu: { idle: [0.4, 1.6], active: [1.6, 8], spike: [8, 18] },
        mem: { idle: [85, 150], active: [150, 260], spike: [260, 390] },
        disk: { idle: [0.1, 0.7], active: [0.7, 2.6], spike: [2.6, 5] },
        net: { idle: [0, 0.4], active: [0.4, 2], spike: [2, 4.5] },
        idleChance: 0.5,
        spikeChance: 0.07,
    },
    taskmgr: {
        label: 'Task Manager',
        cpu: { idle: [0.8, 2.6], active: [2.6, 7], spike: [7, 13] },
        mem: { idle: [95, 170], active: [170, 290], spike: [290, 420] },
        disk: { idle: [0.1, 0.8], active: [0.8, 1.8], spike: [1.8, 3.2] },
        net: { idle: [0.1, 0.5], active: [0.5, 1.8], spike: [1.8, 3.3] },
        idleChance: 0.42,
        spikeChance: 0.1,
    },
    explorer: {
        label: 'File Manager',
        cpu: { idle: [0.6, 2], active: [2, 7.5], spike: [7.5, 16] },
        mem: { idle: [130, 220], active: [220, 430], spike: [430, 690] },
        disk: { idle: [0.2, 1.1], active: [1.1, 5.4], spike: [5.4, 11] },
        net: { idle: [0, 0.3], active: [0.3, 1.4], spike: [1.4, 3] },
        idleChance: 0.35,
        spikeChance: 0.14,
    },
    browser: {
        label: 'Aether Browser',
        cpu: { idle: [1.8, 5], active: [5, 18], spike: [18, 42] },
        mem: { idle: [260, 420], active: [420, 920], spike: [920, 1680] },
        disk: { idle: [0.4, 2], active: [2, 8.5], spike: [8.5, 16] },
        net: { idle: [0.4, 2], active: [2, 12], spike: [12, 28] },
        idleChance: 0.2,
        spikeChance: 0.23,
    },
}

const SYSTEM_PROFILES: Record<string, ProcessProfile> = {
    init: {
        label: 'init',
        cpu: { idle: [0.2, 0.8], active: [0.8, 1.8], spike: [1.8, 3] },
        mem: { idle: [45, 80], active: [80, 100], spike: [100, 130] },
        disk: { idle: [0, 0.3], active: [0.3, 0.8], spike: [0.8, 1.6] },
        net: { idle: [0, 0.1], active: [0.1, 0.4], spike: [0.4, 0.9] },
        idleChance: 0.7,
        spikeChance: 0.03,
    },
    compositor: {
        label: 'compositor',
        cpu: { idle: [0.6, 1.8], active: [1.8, 4], spike: [4, 7] },
        mem: { idle: [90, 140], active: [140, 220], spike: [220, 300] },
        disk: { idle: [0, 0.2], active: [0.2, 0.8], spike: [0.8, 1.4] },
        net: { idle: [0, 0.2], active: [0.2, 0.7], spike: [0.7, 1.2] },
        idleChance: 0.45,
        spikeChance: 0.05,
    },
}

const EMPTY_SPIKES: Record<KernelMetric, number> = {
    cpu: 0,
    mem: 0,
    disk: 0,
    net: 0,
}

let processes: Process[] = [
    { pid: 1, name: 'init', cpu: 0.5, mem: 62, disk: 0.1, net: 0, status: 'running' },
    { pid: 2, name: 'compositor', cpu: 1.4, mem: 128, disk: 0.2, net: 0.1, status: 'running' },
]
let nextPid = 3
let networkLatencyMs = 24
let tickCount = 0
let activeImpacts: ActiveImpact[] = []
let recentDeltaHistory: ResourceVector[] = []

function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value))
}

function randomInRange([min, max]: Range) {
    return min + Math.random() * (max - min)
}

function chooseActivity(profile: ProcessProfile): ActivityLevel {
    const roll = Math.random()
    if (roll < profile.spikeChance) {
        return 'spike'
    }

    if (roll < profile.spikeChance + profile.idleChance) {
        return 'idle'
    }

    return 'active'
}

function resolveProfile(process: Process): ProcessProfile {
    if (process.appId) {
        return APP_PROFILES[process.appId] ?? DEFAULT_PROFILE
    }

    return SYSTEM_PROFILES[process.name] ?? DEFAULT_PROFILE
}

function updateMetric(current: number, range: Range) {
    const target = randomInRange(range)
    const drift = (Math.random() - 0.5) * 0.6
    return Math.max(0, current + (target - current) * SMOOTHING_FACTOR + drift)
}

function updateProcessUsage(process: Process): Process {
    const profile = resolveProfile(process)
    const activity = chooseActivity(profile)

    return {
        ...process,
        cpu: clamp(updateMetric(process.cpu, profile.cpu[activity]), 0, 100),
        mem: clamp(updateMetric(process.mem, profile.mem[activity]), 16, 2_048),
        disk: clamp(updateMetric(process.disk, profile.disk[activity]), 0, 100),
        net: clamp(updateMetric(process.net, profile.net[activity]), 0, 100),
    }
}

function queueImpactFromEvent(event: KernelActivityEventPayload) {
    activeImpacts.push({
        ...resolveImpactProfile(event),
        startTick: tickCount,
    })
}

function impactMatchesProcess(impact: ActiveImpact, process: Process) {
    if (impact.target.appId) {
        return process.appId === impact.target.appId
    }

    if (impact.target.processName) {
        return process.name === impact.target.processName
    }

    return false
}

function pruneExpiredImpacts() {
    activeImpacts = activeImpacts.filter((impact) => {
        const ageTicks = tickCount - impact.startTick
        return ageTicks <= impact.curve.maxAgeTicks
    })
}

function emptyVector(): ResourceVector {
    return { cpu: 0, mem: 0, disk: 0, net: 0 }
}

function collectEventDeltas() {
    const topContributors: KernelTopContributor[] = []
    const deltaByPid = new Map<number, ResourceVector>()
    let systemDelta = emptyVector()

    for (const process of processes) {
        let processDelta = emptyVector()

        for (const impact of activeImpacts) {
            if (!impactMatchesProcess(impact, process)) {
                continue
            }

            const ageTicks = tickCount - impact.startTick
            const decayed = sampleDecayedVector(impact.vector, ageTicks, impact.curve)
            processDelta = addResourceVectors(processDelta, decayed)

            ;(['cpu', 'mem', 'disk', 'net'] as const).forEach((metric) => {
                const delta = decayed[metric]
                if (delta < CONTRIBUTOR_EPSILON) {
                    return
                }

                topContributors.push({
                    metric,
                    pid: process.pid,
                    name: process.name,
                    source: impact.label,
                    delta,
                })
            })
        }

        const bounded = clampResourceVector(processDelta, MAX_EVENT_DELTA)
        deltaByPid.set(process.pid, bounded)
        systemDelta = addResourceVectors(systemDelta, bounded)
    }

    const sortedContributors = topContributors
        .sort((left, right) => right.delta - left.delta)
        .slice(0, 8)
        .map((contributor) => ({
            ...contributor,
            delta: Number(contributor.delta.toFixed(1)),
        }))

    return {
        deltaByPid,
        systemDelta,
        topContributors: sortedContributors,
    }
}

function getRecentSpikes() {
    if (recentDeltaHistory.length === 0) {
        return EMPTY_SPIKES
    }

    return recentDeltaHistory.reduce((acc, next) => ({
        cpu: Math.max(acc.cpu, next.cpu),
        mem: Math.max(acc.mem, next.mem),
        disk: Math.max(acc.disk, next.disk),
        net: Math.max(acc.net, next.net),
    }), { ...EMPTY_SPIKES })
}

function emitTick() {
    pruneExpiredImpacts()
    const eventDeltas = collectEventDeltas()

    const renderedProcesses = processes.map((process) => {
        const delta = eventDeltas.deltaByPid.get(process.pid) ?? ZERO_VECTOR
        return {
            ...process,
            cpu: clamp(process.cpu + delta.cpu, 0, 100),
            mem: clamp(process.mem + delta.mem, 16, 2_048),
            disk: clamp(process.disk + delta.disk, 0, 100),
            net: clamp(process.net + delta.net, 0, 100),
        }
    })

    recentDeltaHistory = [...recentDeltaHistory, eventDeltas.systemDelta].slice(-RECENT_SPIKE_WINDOW_TICKS)
    const recentSpikes = getRecentSpikes()

    const cpuUsage = clamp(renderedProcesses.reduce((sum, process) => sum + process.cpu, 0), 0, 100)
    const memUsageMb = renderedProcesses.reduce((sum, process) => sum + process.mem, 0)
    const memUsage = clamp((memUsageMb / TOTAL_MEMORY_MB) * 100, 0, 100)
    const diskUsage = clamp(renderedProcesses.reduce((sum, process) => sum + process.disk, 0), 0, 100)
    const netUsage = clamp(renderedProcesses.reduce((sum, process) => sum + process.net, 0), 0, 100)

    const targetLatency = 16 + netUsage * 0.9 + recentSpikes.net * 0.3 + (Math.random() - 0.5) * 10
    networkLatencyMs = clamp(
        networkLatencyMs + (targetLatency - networkLatencyMs) * 0.35,
        8,
        220,
    )

    postMessage(createTickMessage({
        processes: renderedProcesses,
        cpuUsage,
        memUsage,
        diskUsage,
        netUsage,
        networkLatencyMs: Math.round(networkLatencyMs),
        recentSpikes: {
            cpu: Number(recentSpikes.cpu.toFixed(1)),
            mem: Number(recentSpikes.mem.toFixed(1)),
            disk: Number(recentSpikes.disk.toFixed(1)),
            net: Number(recentSpikes.net.toFixed(1)),
        },
        topContributors: eventDeltas.topContributors,
    }))
}

function tick() {
    tickCount += 1
    processes = processes.map(updateProcessUsage)
    emitTick()
}

function spawnProcess(name: string) {
    const profile = DEFAULT_PROFILE
    const activity = chooseActivity(profile)
    processes.push({
        pid: nextPid++,
        name,
        cpu: randomInRange(profile.cpu[activity]),
        mem: randomInRange(profile.mem[activity]),
        disk: randomInRange(profile.disk[activity]),
        net: randomInRange(profile.net[activity]),
        status: 'running',
    })
}

function spawnAppProcess(appId: string, name: string) {
    if (processes.some((process) => process.appId === appId)) {
        return
    }

    const profile = APP_PROFILES[appId] ?? DEFAULT_PROFILE
    const activity = chooseActivity(profile)
    processes.push({
        pid: nextPid++,
        appId,
        name: profile.label || name,
        cpu: randomInRange(profile.cpu[activity]),
        mem: randomInRange(profile.mem[activity]),
        disk: randomInRange(profile.disk[activity]),
        net: randomInRange(profile.net[activity]),
        status: 'running',
    })

    queueImpactFromEvent({
        protocolVersion: KERNEL_PROTOCOL_VERSION,
        type: 'app-launch',
        sourceAppId: appId,
        targetAppId: appId,
    })
}

setInterval(tick, STEP_INTERVAL_MS)
emitTick()

self.onmessage = (e) => {
    if (!isKernelCommandMessage(e.data)) {
        return
    }

    const { type, payload } = e.data

    if (type === 'KILL_PROCESS') {
        const process = processes.find((entry) => entry.pid === payload.pid)
        if (process?.appId) {
            queueImpactFromEvent({
                protocolVersion: KERNEL_PROTOCOL_VERSION,
                type: 'app-close',
                sourceAppId: process.appId,
                targetAppId: process.appId,
            })
        }
        processes = processes.filter((processEntry) => processEntry.pid !== payload.pid)
        emitTick()
        return
    }

    if (type === 'KILL_APP_PROCESS') {
        queueImpactFromEvent({
            protocolVersion: KERNEL_PROTOCOL_VERSION,
            type: 'app-close',
            sourceAppId: payload.appId,
            targetAppId: payload.appId,
        })
        processes = processes.filter((process) => process.appId !== payload.appId)
        emitTick()
        return
    }

    if (type === 'SPAWN_APP_PROCESS') {
        spawnAppProcess(payload.appId, payload.name)
        emitTick()
        return
    }

    if (type === 'REPORT_ACTIVITY') {
        queueImpactFromEvent(payload)
        emitTick()
        return
    }

    spawnProcess(payload.name)
    emitTick()
}
