import { selectOrderedWindows } from '../../features/window-manager/selectors'
import { useWindowStore } from '../../stores/windowStore'

export default function DesktopWindows() {
    const windows = useWindowStore(selectOrderedWindows)

    return (
        <div className="flex-1 relative z-20 pointer-events-auto">
            {windows.map((windowData) => (
                <windowData.component key={windowData.id} id={windowData.id} />
            ))}
        </div>
    )
}
