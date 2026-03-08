import { describe, expect, it } from 'vitest'
import { getCalendarGrid, isSameDay } from './calendar'

describe('calendar', () => {
    it('builds a 6x7 calendar grid anchored on the first weekday', () => {
        const month = new Date(2026, 2, 1)
        const grid = getCalendarGrid(month)

        expect(grid).toHaveLength(42)
        expect(grid[0].getDay()).toBe(0)
        expect(grid[0].getFullYear()).toBe(2026)
        expect(grid[0].getMonth()).toBe(2)
        expect(grid[0].getDate()).toBe(1)
    })

    it('compares dates by day only', () => {
        const a = new Date('2026-03-08T09:00:00')
        const b = new Date('2026-03-08T20:00:00')
        const c = new Date('2026-03-09T09:00:00')
        expect(isSameDay(a, b)).toBe(true)
        expect(isSameDay(a, c)).toBe(false)
    })
})
