import { DESKTOP_ICONS } from '../../config/desktop'
import { Folder, Monitor, Settings } from 'lucide-react'
import type { ComponentType } from 'react'

const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
    pc: Monitor,
    settings: Settings,
}

export default function DesktopIcons() {
    return (
        <div className="absolute left-5 top-5 z-20 grid grid-cols-1 gap-3">
            {DESKTOP_ICONS.map(icon => (
                <button
                    key={icon.id}
                    className="group flex w-24 flex-col items-center rounded-lg p-2 transition-colors hover:bg-white/10"
                >
                    {(() => {
                        const Icon = ICON_MAP[icon.id] ?? Folder
                        return (
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-600/80 bg-slate-900/70 text-slate-200 shadow-lg">
                                <Icon className="h-6 w-6" />
                            </div>
                        )
                    })()}
                    <span className="mt-1.5 text-center text-[12px] font-medium text-slate-100">
                        {icon.label}
                    </span>
                </button>
            ))}
        </div>
    )
}
