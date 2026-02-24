import { useState } from 'react'
import Taskbar from './Taskbar'
import TerminalWindow from './TerminalWindow'
import TaskManagerWindow from './TaskManagerWindow'


export default function DesktopShell() {
    const [windows, setWindows] = useState([
        { id: 'term', title: 'Terminal', component: TerminalWindow, isOpen: true },
        { id: 'taskmgr', title: 'Task Manager', component: TaskManagerWindow, isOpen: true },
    ])

    const toggleWindow = (id: string) => {
        setWindows(ws => ws.map(w => w.id === id ? { ...w, isOpen: !w.isOpen } : w))
    }

    return (
        <div
            className="relative w-full h-full flex flex-col overflow-hidden bg-[#e0dbea] bg-cover bg-center"
            style={{ backgroundImage: `url('https://res.cloudinary.com/dd6gz4moa/image/upload/v1771955925/blue-abstract-flow-3840x2160-25338_nnk3mk.jpg')` }}
        >

            {/* Desktop Icons (Left aligned) */}
            <div className="absolute left-4 top-4 bottom-24 flex flex-col space-y-4 z-10 w-24">
                <button className="flex flex-col items-center p-2 rounded-xl hover:bg-white/30 transition-colors group">
                    <img src="https://img.icons8.com/color/48/000000/monitor--v1.png" alt="This PC" className="w-10 h-10 drop-shadow-md group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold text-gray-700 mt-1 text-center drop-shadow-sm">This PC</span>
                </button>
                <button className="flex flex-col items-center p-2 rounded-xl hover:bg-white/30 transition-colors group">
                    <img src="https://img.icons8.com/color/48/000000/settings--v1.png" alt="Settings" className="w-10 h-10 drop-shadow-md group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold text-gray-700 mt-1 text-center drop-shadow-sm">Settings</span>
                </button>
            </div>

            {/* Windows Layer */}
            <div className="flex-1 relative z-20 pointer-events-auto">
                {windows.map(w =>
                    w.isOpen && <w.component key={w.id} onClose={() => toggleWindow(w.id)} />
                )}
            </div>

            {/* Taskbar */}
            <div className="z-50 pointer-events-auto pointer-events-none flex justify-center pb-4">
                <div className="pointer-events-auto">
                    <Taskbar windows={windows} toggleWindow={toggleWindow} />
                </div>
            </div>
        </div>
    )
}
