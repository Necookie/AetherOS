import { Monitor, Terminal, Settings, LayoutGrid, Search, Wifi, Volume2, BatteryCharging, Activity, Globe } from 'lucide-react'
import { useWindowStore } from '../stores/windowStore'
import { DEFAULT_APPS } from '../config/windows'

export default function Taskbar() {
    const windows = useWindowStore(state => state.windows)
    const toggleMinimize = useWindowStore(state => state.toggleMinimize)
    const openWindow = useWindowStore(state => state.openWindow)

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

                {DEFAULT_APPS.map(app => {
                    const isOpen = !!windows[app.id]
                    const winState = windows[app.id]?.state
                    const isFocused = winState?.isFocused
                    const isMinimized = winState?.isMinimized

                    const handleClick = () => {
                        if (!isOpen) {
                            openWindow(app)
                        } else {
                            toggleMinimize(app.id)
                        }
                    }

                    return (
                        <button
                            key={app.id}
                            onClick={handleClick}
                            className={`p-2 rounded-xl transition-all relative ${isFocused ? 'bg-white/50 border border-white/60 shadow-sm hover:bg-white/70' : 'hover:bg-white/40'}`}
                            title={app.title}
                        >
                            {app.id === 'term' ? (
                                <Terminal className={`w-5 h-5 ${isOpen && !isMinimized ? 'text-gray-800' : 'text-gray-600'}`} />
                            ) : app.id === 'explorer' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${isOpen && !isMinimized ? 'text-gray-800' : 'text-gray-600'}`}><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" /></svg>
                            ) : app.id === 'taskmgr' ? (
                                <Activity className={`w-5 h-5 ${isOpen && !isMinimized ? 'text-gray-800' : 'text-gray-600'}`} />
                            ) : app.id === 'browser' ? (
                                <Globe className={`w-5 h-5 ${isOpen && !isMinimized ? 'text-gray-800' : 'text-gray-600'}`} />
                            ) : (
                                <Settings className={`w-5 h-5 ${isOpen && !isMinimized ? 'text-gray-800' : 'text-gray-600'}`} />
                            )}
                            {isOpen && (
                                <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 rounded-full ${isFocused ? 'w-2 bg-gray-600' : 'w-1 bg-gray-400'}`}></div>
                            )}
                        </button>
                    )
                })}
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
