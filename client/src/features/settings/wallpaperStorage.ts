import type { WallpaperOption } from './types'
import { safeRandomUUID } from '../../lib/uuid'

const DB_NAME = 'aether_wallpapers_db'
const DB_VERSION = 1
const STORE_NAME = 'custom_wallpapers'

// In-memory cache for fast synchronous access by resolveWallpaper / getWallpaperCss
const inMemoryCache = new Map<string, WallpaperOption>()

function getIndexedDB(): IDBFactory | undefined {
    if (typeof window !== 'undefined' && window.indexedDB) {
        return window.indexedDB
    }
    return undefined
}

function openDatabase(): Promise<IDBDatabase> {
    const idb = getIndexedDB()
    if (!idb) {
        return Promise.reject(new Error('IndexedDB is not available in this environment'))
    }

    return new Promise((resolve, reject) => {
        const request = idb.open(DB_NAME, DB_VERSION)

        request.onupgradeneeded = () => {
            const db = request.result
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' })
            }
        }

        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
    })
}

export async function loadCustomWallpapersFromStorage(): Promise<WallpaperOption[]> {
    const idb = getIndexedDB()
    if (!idb) {
        return Array.from(inMemoryCache.values())
    }

    try {
        const db = await openDatabase()
        return await new Promise<WallpaperOption[]>((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly')
            const store = tx.objectStore(STORE_NAME)
            const request = store.getAll()

            request.onsuccess = () => {
                const results = (request.result as WallpaperOption[]) || []
                for (const item of results) {
                    inMemoryCache.set(item.id, item)
                }
                resolve(results)
            }
            request.onerror = () => reject(request.error)
        })
    } catch (err) {
        console.warn('Failed to load custom wallpapers from IndexedDB:', err)
        return Array.from(inMemoryCache.values())
    }
}

async function readFileAsDataUrl(file: File): Promise<string> {
    if (typeof FileReader !== 'undefined') {
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = () => reject(reader.error)
            reader.readAsDataURL(file)
        })
    }

    const buffer = await file.arrayBuffer()
    const base64 = typeof Buffer !== 'undefined'
        ? Buffer.from(buffer).toString('base64')
        : btoa(String.fromCharCode(...new Uint8Array(buffer)))
    const mimeType = file.type || 'image/png'
    return `data:${mimeType};base64,${base64}`
}

export async function saveCustomWallpaper(file: File): Promise<WallpaperOption> {
    const dataUrl = await readFileAsDataUrl(file)

    const id = `custom-${safeRandomUUID().slice(0, 8)}`
    const label = file.name.replace(/\.[^/.]+$/, '').slice(0, 24) || 'Custom Wallpaper'
    const wallpaper: WallpaperOption = {
        id,
        label,
        kind: 'image',
        value: dataUrl,
    }

    inMemoryCache.set(id, wallpaper)

    const idb = getIndexedDB()
    if (idb) {
        try {
            const db = await openDatabase()
            await new Promise<void>((resolve, reject) => {
                const tx = db.transaction(STORE_NAME, 'readwrite')
                const store = tx.objectStore(STORE_NAME)
                const request = store.put(wallpaper)
                request.onsuccess = () => resolve()
                request.onerror = () => reject(request.error)
            })
        } catch (err) {
            console.warn('Failed to persist wallpaper to IndexedDB:', err)
        }
    }

    return wallpaper
}

export async function deleteCustomWallpaper(id: string): Promise<void> {
    inMemoryCache.delete(id)

    const idb = getIndexedDB()
    if (!idb) return

    try {
        const db = await openDatabase()
        await new Promise<void>((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite')
            const store = tx.objectStore(STORE_NAME)
            const request = store.delete(id)
            request.onsuccess = () => resolve()
            request.onerror = () => reject(request.error)
        })
    } catch (err) {
        console.warn('Failed to delete wallpaper from IndexedDB:', err)
    }
}

export function getCachedCustomWallpaper(id: string): WallpaperOption | undefined {
    return inMemoryCache.get(id)
}

export function registerCustomWallpaperInMemory(wallpaper: WallpaperOption): void {
    inMemoryCache.set(wallpaper.id, wallpaper)
}

export function clearCustomWallpapersCache(): void {
    inMemoryCache.clear()
}
