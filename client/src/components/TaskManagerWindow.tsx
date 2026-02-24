import DraggableWindow from './DraggableWindow'
import { useKernelStore } from '../stores/useKernelStore'

export default function TaskManagerWindow({ onClose }: { onClose: () => void }) {
    const { processes, killProcess } = useKernelStore()

    return (
        <DraggableWindow title="Task Manager" onClose={onClose} initialPos={{ x: 700, y: 100 }} size={{ w: 500, h: 400 }}>
            <div className="w-full h-full bg-gray-900 text-sm text-gray-300 flex flex-col">
                <div className="grid grid-cols-5 gap-2 font-semibold border-b border-white/10 px-4 py-2 bg-gray-800">
                    <div>PID</div>
                    <div>Name</div>
                    <div>CPU %</div>
                    <div>Mem (MB)</div>
                    <div>Action</div>
                </div>
                <div className="flex-1 overflow-auto p-2">
                    {processes.map(p => (
                        <div key={p.pid} className="grid grid-cols-5 gap-2 items-center px-2 py-1.5 hover:bg-white/5 rounded">
                            <div className="font-mono">{p.pid}</div>
                            <div>{p.name}</div>
                            <div className="font-mono">{p.cpu.toFixed(1)}</div>
                            <div className="font-mono">{p.mem.toFixed(1)}</div>
                            <div>
                                <button
                                    onClick={() => killProcess(p.pid)}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10 px-2 py-1 rounded text-xs transition-colors"
                                >
                                    Kill
                                </button>
                            </div>
                        </div>
                    ))}
                    {processes.length === 0 && (
                        <div className="p-4 text-center text-gray-500 italic">No processes running.</div>
                    )}
                </div>
            </div>
        </DraggableWindow>
    )
}
