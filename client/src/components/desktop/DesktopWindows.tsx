import { memo } from 'react'
import { selectWindowComponentById, selectWindowOrder } from '../../features/window-manager/selectors'
import { useWindowShortcuts } from '../../features/window-manager/useWindowShortcuts'
import { useWindowStore } from '../../stores/windowStore'

const WindowRenderer = memo(function WindowRenderer({ id }: { id: string }) {
    const WindowComponent = useWindowStore(selectWindowComponentById(id))
    if (!WindowComponent) {
        return null
    }

    return <WindowComponent id={id} />
})

export default function DesktopWindows() {
    const windowOrder = useWindowStore(selectWindowOrder)
    useWindowShortcuts()

    return (
        <div className="relative z-20 h-full w-full pointer-events-auto">
            {windowOrder.map((windowId) => (
                <WindowRenderer key={windowId} id={windowId} />
            ))}
        </div>
    )
}
