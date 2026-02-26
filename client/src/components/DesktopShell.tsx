import { useState } from 'react'
import Taskbar from './Taskbar'
import DesktopIcons from './desktop/DesktopIcons'
import DesktopWindows from './desktop/DesktopWindows'
import { DEFAULT_WINDOWS } from '../config/windows'
import { DESKTOP_WALLPAPER_URL } from '../config/desktop'
import type { DesktopWindowDef } from '../types/window'

export default function DesktopShell() {
    const [windows, setWindows] = useState<DesktopWindowDef[]>(DEFAULT_WINDOWS)

    const toggleWindow = (id: string) => {
        setWindows(ws => ws.map(w => w.id === id ? { ...w, isOpen: !w.isOpen } : w))
    }

    return (
        <div
            className="relative w-full h-full flex flex-col overflow-hidden bg-[#e0dbea] bg-cover bg-center"
            style={{ backgroundImage: `url('${DESKTOP_WALLPAPER_URL}')` }}
        >
            <DesktopIcons />
            <DesktopWindows windows={windows} onToggle={toggleWindow} />

            {/* Taskbar */}
            <div className="z-50 pointer-events-auto pointer-events-none flex justify-center pb-4">
                <div className="pointer-events-auto">
                    <Taskbar windows={windows} toggleWindow={toggleWindow} />
                </div>
            </div>
        </div>
    )
}
