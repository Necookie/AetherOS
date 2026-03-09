import { describe, expect, it } from 'vitest'
import { resolveImpactProfile } from './impactProfiles'

describe('kernel impact profile resolution', () => {
    it('scales vector magnitude by units and targets app id from payload', () => {
        const profile = resolveImpactProfile({
            protocolVersion: 2,
            type: 'browser-download',
            sourceAppId: 'browser',
            targetAppId: 'browser',
            units: 2,
        })

        expect(profile.target.appId).toBe('browser')
        expect(profile.vector.net).toBeCloseTo(30, 6)
        expect(profile.vector.disk).toBeCloseTo(10.4, 6)
    })

    it('clamps very large units to keep impacts bounded', () => {
        const profile = resolveImpactProfile({
            protocolVersion: 2,
            type: 'productivity-autosave',
            sourceAppId: 'notes',
            units: 100,
        })

        expect(profile.vector.cpu).toBeCloseTo(20.4, 6)
        expect(profile.vector.disk).toBeCloseTo(39, 6)
    })
})
