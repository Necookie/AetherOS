import { selectOrderedWindows } from '../../features/window-manager/selectors'
import { useWindowShortcuts } from '../../features/window-manager/useWindowShortcuts'
import { useWindowStore } from '../../stores/windowStore'

export default function DesktopWindows() {
    const windows = useWindowStore(selectOrderedWindows)
    useWindowShortcuts()

    return (
        <div className="relative z-20 h-full w-full pointer-events-auto">
            {windows.map((windowData) => (
                <windowData.component key={windowData.id} id={windowData.id} />
            ))}
        </div>
    )
}
