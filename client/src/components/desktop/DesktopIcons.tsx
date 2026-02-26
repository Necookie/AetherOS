import { DESKTOP_ICONS } from '../../config/desktop'

export default function DesktopIcons() {
    return (
        <div className="absolute left-4 top-4 bottom-24 flex flex-col space-y-4 z-10 w-24">
            {DESKTOP_ICONS.map(icon => (
                <button
                    key={icon.id}
                    className="flex flex-col items-center p-2 rounded-xl hover:bg-white/30 transition-colors group"
                >
                    <img
                        src={icon.iconUrl}
                        alt={icon.alt}
                        className="w-10 h-10 drop-shadow-md group-hover:scale-110 transition-transform"
                    />
                    <span className="text-xs font-semibold text-gray-700 mt-1 text-center drop-shadow-sm">
                        {icon.label}
                    </span>
                </button>
            ))}
        </div>
    )
}
