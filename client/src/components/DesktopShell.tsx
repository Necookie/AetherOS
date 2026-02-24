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
        <div className="relative w-full h-full flex flex-col overflow-hidden bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070')] bg-cover bg-center">
            <div className="flex-1 relative">
                {windows.map(w =>
                    w.isOpen && <w.component key={w.id} onClose={() => toggleWindow(w.id)} />
                )}
            </div>
            <Taskbar windows={windows} toggleWindow={toggleWindow} />
        </div>
    )
}
