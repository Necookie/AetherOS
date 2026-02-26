import type { DesktopWindowDef } from '../../types/window'

interface DesktopWindowsProps {
    windows: DesktopWindowDef[]
    onToggle: (id: string) => void
}

export default function DesktopWindows({ windows, onToggle }: DesktopWindowsProps) {
    return (
        <div className="flex-1 relative z-20 pointer-events-auto">
            {windows.map(w =>
                w.isOpen ? (
                    <w.component key={w.id} onClose={() => onToggle(w.id)} />
                ) : null
            )}
        </div>
    )
}
