import { describe, expect, it } from 'vitest'
import { decayMultiplier, sampleDecayedVector } from './impactDecay'

describe('kernel impact decay math', () => {
    it('halves the contribution at one half-life', () => {
        const value = decayMultiplier(2, { halfLifeTicks: 2, maxAgeTicks: 8 })
        expect(value).toBeCloseTo(0.5, 6)
    })

    it('returns zero once max age is exceeded', () => {
        const value = decayMultiplier(9, { halfLifeTicks: 2, maxAgeTicks: 8 })
        expect(value).toBe(0)
    })

    it('applies the decay multiplier to each resource metric', () => {
        const result = sampleDecayedVector(
            { cpu: 8, mem: 64, disk: 4, net: 10 },
            1,
            { halfLifeTicks: 1, maxAgeTicks: 5 },
        )

        expect(result.cpu).toBeCloseTo(4, 6)
        expect(result.mem).toBeCloseTo(32, 6)
        expect(result.disk).toBeCloseTo(2, 6)
        expect(result.net).toBeCloseTo(5, 6)
    })
})
