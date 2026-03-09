import type { KernelActivityEventPayload } from './protocol'
import type { ImpactCurve, ResourceVector } from './impactDecay'

export type ImpactTarget = {
    appId?: string
    processName?: string
}

export type EventImpactProfile = {
    label: string
    vector: ResourceVector
    curve: ImpactCurve
    defaultTarget: ImpactTarget
}

const DEFAULT_CURVE: ImpactCurve = {
    halfLifeTicks: 2,
    maxAgeTicks: 8,
}

const FILE_CURVE: ImpactCurve = {
    halfLifeTicks: 2,
    maxAgeTicks: 7,
}

const BROWSER_CURVE: ImpactCurve = {
    halfLifeTicks: 2,
    maxAgeTicks: 9,
}

const AUTOSAVE_CURVE: ImpactCurve = {
    halfLifeTicks: 1.5,
    maxAgeTicks: 6,
}

const IMPACT_BY_TYPE: Record<KernelActivityEventPayload['type'], EventImpactProfile> = {
    'app-launch': {
        label: 'App launch burst',
        vector: { cpu: 7, mem: 120, disk: 3.5, net: 1.2 },
        curve: DEFAULT_CURVE,
        defaultTarget: {},
    },
    'app-close': {
        label: 'App shutdown',
        vector: { cpu: 2.2, mem: 36, disk: 1, net: 0.4 },
        curve: { halfLifeTicks: 1.4, maxAgeTicks: 5 },
        defaultTarget: {},
    },
    'file-copy': {
        label: 'File copy',
        vector: { cpu: 3.2, mem: 24, disk: 8.5, net: 0.3 },
        curve: FILE_CURVE,
        defaultTarget: { appId: 'explorer' },
    },
    'file-move': {
        label: 'File move',
        vector: { cpu: 2.4, mem: 16, disk: 5.2, net: 0.2 },
        curve: FILE_CURVE,
        defaultTarget: { appId: 'explorer' },
    },
    'file-delete': {
        label: 'File delete',
        vector: { cpu: 2, mem: 12, disk: 4, net: 0.1 },
        curve: FILE_CURVE,
        defaultTarget: { appId: 'explorer' },
    },
    'file-restore': {
        label: 'File restore',
        vector: { cpu: 2.4, mem: 14, disk: 4.8, net: 0.2 },
        curve: FILE_CURVE,
        defaultTarget: { appId: 'explorer' },
    },
    'browser-navigate': {
        label: 'Browser navigation',
        vector: { cpu: 5.5, mem: 48, disk: 1.5, net: 8.5 },
        curve: BROWSER_CURVE,
        defaultTarget: { appId: 'browser' },
    },
    'browser-download': {
        label: 'Browser download',
        vector: { cpu: 2.8, mem: 24, disk: 5.2, net: 15 },
        curve: BROWSER_CURVE,
        defaultTarget: { appId: 'browser' },
    },
    'productivity-autosave': {
        label: 'Autosave burst',
        vector: { cpu: 3.4, mem: 22, disk: 6.5, net: 0.4 },
        curve: AUTOSAVE_CURVE,
        defaultTarget: {},
    },
}

function clampUnits(units: number | undefined) {
    if (units === undefined || Number.isNaN(units)) {
        return 1
    }

    return Math.min(6, Math.max(0.25, units))
}

export function resolveImpactProfile(event: KernelActivityEventPayload) {
    const base = IMPACT_BY_TYPE[event.type]
    const units = clampUnits(event.units)
    const target: ImpactTarget = {
        appId: event.targetAppId || event.sourceAppId || base.defaultTarget.appId,
        processName: base.defaultTarget.processName,
    }

    return {
        label: base.label,
        target,
        curve: base.curve,
        vector: {
            cpu: base.vector.cpu * units,
            mem: base.vector.mem * units,
            disk: base.vector.disk * units,
            net: base.vector.net * units,
        },
    }
}

export const MAX_EVENT_DELTA: ResourceVector = {
    cpu: 38,
    mem: 1_100,
    disk: 34,
    net: 44,
}
