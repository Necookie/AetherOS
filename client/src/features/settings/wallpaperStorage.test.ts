import { beforeEach, describe, expect, it } from 'vitest'
import {
    clearCustomWallpapersCache,
    deleteCustomWallpaper,
    getCachedCustomWallpaper,
    loadCustomWallpapersFromStorage,
    registerCustomWallpaperInMemory,
    saveCustomWallpaper,
} from './wallpaperStorage'

describe('wallpaperStorage', () => {
    beforeEach(() => {
        clearCustomWallpapersCache()
    })

    it('registers and retrieves custom wallpapers from in-memory cache', () => {
        registerCustomWallpaperInMemory({
            id: 'custom-1',
            label: 'Test Wallpaper',
            kind: 'image',
            value: 'data:image/png;base64,abc',
        })

        const cached = getCachedCustomWallpaper('custom-1')
        expect(cached).toBeDefined()
        expect(cached?.label).toBe('Test Wallpaper')
        expect(cached?.value).toBe('data:image/png;base64,abc')
    })

    it('deletes custom wallpaper from in-memory cache', async () => {
        registerCustomWallpaperInMemory({
            id: 'custom-2',
            label: 'To Delete',
            kind: 'image',
            value: 'data:image/png;base64,def',
        })

        expect(getCachedCustomWallpaper('custom-2')).toBeDefined()
        await deleteCustomWallpaper('custom-2')
        expect(getCachedCustomWallpaper('custom-2')).toBeUndefined()
    })

    it('saves a file and stores it in cache', async () => {
        const file = new File(['fake-image-bytes'], 'desktop-hero.png', { type: 'image/png' })
        const saved = await saveCustomWallpaper(file)

        expect(saved.id).toMatch(/^custom-/)
        expect(saved.label).toBe('desktop-hero')
        expect(saved.kind).toBe('image')
        expect(saved.value).toContain('data:')

        const cached = getCachedCustomWallpaper(saved.id)
        expect(cached).toEqual(saved)
    })

    it('loads custom wallpapers from storage fallback when idb is absent', async () => {
        registerCustomWallpaperInMemory({
            id: 'custom-fallback',
            label: 'Fallback',
            kind: 'image',
            value: 'data:image/png;base64,xyz',
        })

        const list = await loadCustomWallpapersFromStorage()
        expect(list.some((w) => w.id === 'custom-fallback')).toBe(true)
    })
})
