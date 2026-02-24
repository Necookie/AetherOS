import { useKernelStore } from '../stores/useKernelStore'
import { Monitor, Terminal, Settings, LayoutGrid, Search, Wifi, Volume2, BatteryCharging } from 'lucide-react'

interface TaskbarProps {
    windows: any[]
    toggleWindow: (id: string) => void
}

export default function Taskbar({ windows, toggleWindow }: TaskbarProps) {
    const { } = useKernelStore()

    return (
        <div className="h-14 glass-panel rounded-2xl flex items-center px-4 justify-between transition-all w-max mx-auto shadow-2xl border-white/60 mb-2">

            {/* Left Side App Launchers */}
            <div className="flex items-center space-x-1 mr-8">
                <button className="p-2 hover:bg-white/40 rounded-xl transition-all group">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm group-hover:scale-110 transition-transform flex items-center justify-center">
                        <LayoutGrid className="w-4 h-4 text-white" />
                    </div>
                </button>
                <div className="w-px h-6 bg-gray-400/30 mx-2"></div>
                <button className="p-2 hover:bg-white/40 rounded-xl transition-all">
                    <Search className="w-5 h-5 text-gray-600" />
                </button>

                {/* Simulated Open Apps */}
                <button className="p-2 bg-white/50 rounded-xl shadow-sm border border-white/60 hover:bg-white/70 transition-all relative">
                    <Monitor className="w-5 h-5 text-blue-500" />
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500"></div>
                </button>

                {windows.map(w => (
                    <button
                        key={w.id}
                        onClick={() => toggleWindow(w.id)}
                        className={`p-2 rounded-xl transition-all relative ${w.isOpen ? 'bg-white/50 border border-white/60 shadow-sm hover:bg-white/70' : 'hover:bg-white/40'}`}
                        title={w.title}
                    >
                        {w.id === 'term' ? <Terminal className={`w-5 h-5 ${w.isOpen ? 'text-gray-800' : 'text-gray-600'}`} /> : <Settings className={`w-5 h-5 ${w.isOpen ? 'text-gray-800' : 'text-gray-600'}`} />}
                        {w.isOpen && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gray-600"></div>}
                    </button>
                ))}
            </div>

            {/* Right Side System Tray */}
            <div className="flex items-center space-x-2 pl-4 border-l border-gray-400/30">
                <div className="flex space-x-1 px-2 py-1 hover:bg-white/40 rounded-lg cursor-pointer transition-colors">
                    <Wifi className="w-4 h-4 text-gray-700" />
                    <Volume2 className="w-4 h-4 text-gray-700" />
                    <BatteryCharging className="w-4 h-4 text-gray-700" />
                </div>

                <div className="flex flex-col items-end px-2 py-1 hover:bg-white/40 rounded-lg cursor-pointer transition-colors text-[10px] font-medium text-gray-700 leading-tight">
                    <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>{new Date().toLocaleDateString()}</span>
                </div>
            </div>

        </div>
    )
}
