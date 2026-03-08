import { DESKTOP_ICONS } from '../../config/desktop'
import { Folder, Monitor, Settings } from 'lucide-react'
import type { ComponentType } from 'react'

const DESKTOP_ICON_ASSETS: Record<string, string> = {
    pc: '/assets/candy-icons/pc.svg',
    settings: '/assets/candy-icons/settings.svg',
}

const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
    pc: Monitor,
    settings: Settings,
}

export default function DesktopIcons() {
    return (
        <div className="absolute left-3 top-2 z-20 grid grid-cols-1 gap-2 sm:left-5 sm:top-5 sm:gap-3">
            {DESKTOP_ICONS.map(icon => (
                <button
                    key={icon.id}
                    className="group flex w-20 flex-col items-center rounded-lg p-2 transition-colors hover:bg-white/35 sm:w-24"
                >
                    {(() => {
                        const iconSrc = DESKTOP_ICON_ASSETS[icon.id]
                        const Icon = ICON_MAP[icon.id] ?? Folder
                        return (
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/70 bg-white/58 text-slate-800 shadow-lg">
                                {iconSrc
                                    ? <img src={iconSrc} alt="" aria-hidden className="h-9 w-9" />
                                    : <Icon className="h-6 w-6" />}
                            </div>
                        )
                    })()}
                    <span className="mt-1.5 text-center text-[11px] font-medium text-slate-900 sm:text-[12px]">
                        {icon.label}
                    </span>
                </button>
            ))}
        </div>
    )
}
