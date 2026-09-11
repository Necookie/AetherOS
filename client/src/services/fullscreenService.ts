import { useEffect, useState } from 'react'

export function isFullscreen(): boolean {
    if (typeof document === 'undefined') return false
    return Boolean(
        document.fullscreenElement ||
        // vendor prefixes if needed
        (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement
    )
}

export async function toggleFullscreen(): Promise<boolean> {
    if (typeof document === 'undefined') return false

    try {
        if (!isFullscreen()) {
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen()
                return true
            } else if ((document.documentElement as unknown as { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
                await (document.documentElement as unknown as { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen()
                return true
            }
        } else {
            if (document.exitFullscreen) {
                await document.exitFullscreen()
                return false
            } else if ((document as unknown as { webkitExitFullscreen?: () => Promise<void> }).webkitExitFullscreen) {
                await (document as unknown as { webkitExitFullscreen: () => Promise<void> }).webkitExitFullscreen()
                return false
            }
        }
    } catch (err) {
        console.warn('[fullscreenService] Failed to toggle fullscreen:', err)
    }
    return isFullscreen()
}

export function useFullscreen(): boolean {
    const [fullscreen, setFullscreen] = useState(isFullscreen)

    useEffect(() => {
        const handleFullscreenChange = () => {
            setFullscreen(isFullscreen())
        }

        document.addEventListener('fullscreenchange', handleFullscreenChange)
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange)

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange)
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
        }
    }, [])

    return fullscreen
}
