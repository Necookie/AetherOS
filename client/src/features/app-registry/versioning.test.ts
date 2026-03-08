import { describe, expect, it } from 'vitest'
import { compareSemver, pickLatestVersion, satisfiesVersionRange } from './versioning'

describe('versioning', () => {
    it('compares semantic versions by major/minor/patch', () => {
        expect(compareSemver('1.2.0', '1.1.9')).toBeGreaterThan(0)
        expect(compareSemver('1.1.0', '1.1.0')).toBe(0)
        expect(compareSemver('1.0.9', '1.1.0')).toBeLessThan(0)
    })

    it('supports chained comparator ranges', () => {
        expect(satisfiesVersionRange('1.3.0', '>=1.2.0 <2.0.0')).toBe(true)
        expect(satisfiesVersionRange('2.0.0', '>=1.2.0 <2.0.0')).toBe(false)
    })

    it('supports caret and tilde shorthand', () => {
        expect(satisfiesVersionRange('1.4.2', '^1.2.0')).toBe(true)
        expect(satisfiesVersionRange('2.0.0', '^1.2.0')).toBe(false)
        expect(satisfiesVersionRange('1.2.8', '~1.2.1')).toBe(true)
        expect(satisfiesVersionRange('1.3.0', '~1.2.1')).toBe(false)
    })

    it('picks the newest available version', () => {
        expect(pickLatestVersion(['1.0.0', '1.2.0', '1.1.9'])).toBe('1.2.0')
    })
})
