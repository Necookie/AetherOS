import { describe, expect, it } from 'vitest'
import { normalizeApiBaseUrl } from './apiUrl'

describe('normalizeApiBaseUrl', () => {
    it('keeps an empty base URL for same-origin Worker routes', () => {
        expect(normalizeApiBaseUrl('')).toBe('')
    })

    it('removes trailing slashes from configured development API URLs', () => {
        expect(normalizeApiBaseUrl('http://localhost:3000///')).toBe('http://localhost:3000')
    })
})
