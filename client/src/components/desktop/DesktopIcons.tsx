import { DESKTOP_ICONS } from '../../config/desktop'
import { Folder, Monitor, Settings } from 'lucide-react'
import type { ComponentType } from 'react'
import { shallow } from 'zustand/shallow'
import { DEFAULT_APPS } from '../../config/windows'
import { useWindowStore } from '../../stores/windowStore'

const DESKTOP_ICON_ASSETS: Record<string, string> = {
    pc: '/assets/candy-icons/pc.svg',
    settings: '/assets/candy-icons/settings.svg',
}

const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
    pc: Monitor,
    settings: Settings,
}

export default function DesktopIcons({ iconScale = 1 }: { iconScale?: number }) {
    const { windows, openWindow, restoreWindow, focusWindow } = useWindowStore((state) => ({
        windows: state.windows,
        openWindow: state.openWindow,
        restoreWindow: state.restoreWindow,
        focusWindow: state.focusWindow,
    }), shallow)

    const appLookup = new Map(DEFAULT_APPS.map((app) => [app.id, app]))

    const launchFromIcon = (iconId: string) => {
        const appId = iconId === 'pc' ? 'explorer' : iconId
        const app = appLookup.get(appId)
        if (!app) {
            return
        }

        const windowData = windows[appId]
        if (!windowData) {
            openWindow(app)
            return
        }

        if (windowData.state.isMinimized) {
            restoreWindow(appId)
            return
        }

        focusWindow(appId)
    }

    return (
        <div
            className="absolute left-3 top-2 z-20 grid grid-cols-1 gap-2 sm:left-5 sm:top-5 sm:gap-3"
            style={{ transform: `scale(${iconScale})`, transformOrigin: 'top left' }}
        >
            {DESKTOP_ICONS.map(icon => (
                <button
                    key={icon.id}
                    onClick={() => launchFromIcon(icon.id)}
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
