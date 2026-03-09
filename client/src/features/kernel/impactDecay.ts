export type ResourceVector = {
    cpu: number
    mem: number
    disk: number
    net: number
}

export type ImpactCurve = {
    halfLifeTicks: number
    maxAgeTicks: number
}

const LN2 = Math.log(2)

export function decayMultiplier(ageTicks: number, curve: ImpactCurve) {
    if (ageTicks < 0 || ageTicks > curve.maxAgeTicks) {
        return 0
    }

    return Math.exp(-(LN2 * ageTicks) / Math.max(1, curve.halfLifeTicks))
}

export function sampleDecayedVector(base: ResourceVector, ageTicks: number, curve: ImpactCurve): ResourceVector {
    const multiplier = decayMultiplier(ageTicks, curve)
    return {
        cpu: base.cpu * multiplier,
        mem: base.mem * multiplier,
        disk: base.disk * multiplier,
        net: base.net * multiplier,
    }
}

export function addResourceVectors(left: ResourceVector, right: ResourceVector): ResourceVector {
    return {
        cpu: left.cpu + right.cpu,
        mem: left.mem + right.mem,
        disk: left.disk + right.disk,
        net: left.net + right.net,
    }
}

export function clampResourceVector(value: ResourceVector, max: ResourceVector): ResourceVector {
    return {
        cpu: Math.min(value.cpu, max.cpu),
        mem: Math.min(value.mem, max.mem),
        disk: Math.min(value.disk, max.disk),
        net: Math.min(value.net, max.net),
    }
}

export const ZERO_VECTOR: ResourceVector = {
    cpu: 0,
    mem: 0,
    disk: 0,
    net: 0,
}
