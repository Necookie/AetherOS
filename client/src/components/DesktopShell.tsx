import Taskbar from './Taskbar'
import DesktopIcons from './desktop/DesktopIcons'
import DesktopWindows from './desktop/DesktopWindows'
import { DESKTOP_WALLPAPER_URL } from '../config/desktop'

export default function DesktopShell() {
    return (
        <div
            className="relative w-full h-full flex flex-col overflow-hidden bg-[#e0dbea] bg-cover bg-center"
            style={{ backgroundImage: `url('${DESKTOP_WALLPAPER_URL}')` }}
        >
            <DesktopIcons />
            <DesktopWindows />

            {/* Taskbar */}
            <div className="relative z-[9999] pointer-events-none flex justify-center pb-4">
                <div className="pointer-events-auto">
                    <Taskbar />
                </div>
            </div>
        </div>
    )
}
