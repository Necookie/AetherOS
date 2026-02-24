import { useKernelStore } from '../stores/useKernelStore'
import { Terminal, Activity, Monitor } from 'lucide-react'

interface TaskbarProps {
    windows: any[]
    toggleWindow: (id: string) => void
}

export default function Taskbar({ windows, toggleWindow }: TaskbarProps) {
    const { cpuUsage, memUsage, diskUsage } = useKernelStore()

    return (
        <div className="h-12 bg-gray-900/90 backdrop-blur border-t border-white/10 flex items-center px-4 justify-between z-50">
            <div className="flex space-x-2">
                <button className="p-2 hover:bg-white/10 rounded-md transition-colors">
                    <Monitor className="w-5 h-5 text-blue-400" />
                </button>
                {windows.map(w => (
                    <button
                        key={w.id}
                        onClick={() => toggleWindow(w.id)}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${w.isOpen ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-white/10'}`}
                    >
                        {w.title}
                    </button>
                ))}
            </div>

            <div className="flex items-center space-x-4 text-xs font-mono text-gray-400">
                <div className="flex flex-col">
                    <span>CPU: {cpuUsage.toFixed(1)}%</span>
                    <span>RAM: {memUsage.toFixed(1)}MB</span>
                </div>
                <div className="w-px h-6 bg-white/10"></div>
                <div>{new Date().toLocaleTimeString()}</div>
            </div>
        </div>
    )
}
