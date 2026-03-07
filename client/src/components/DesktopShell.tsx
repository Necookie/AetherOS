import Taskbar from './Taskbar'
import DesktopIcons from './desktop/DesktopIcons'
import DesktopWindows from './desktop/DesktopWindows'

export default function DesktopShell() {
    return (
        <div className="os-desktop-bg relative h-full w-full overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
            <DesktopIcons />
            <DesktopWindows />
            <div className="pointer-events-none absolute inset-x-0 bottom-3 z-[9999] flex justify-center px-4">
                <div className="pointer-events-auto">
                    <Taskbar />
                </div>
            </div>
        </div>
    )
}
