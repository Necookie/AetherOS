import { memo } from 'react'
import { selectSnapPreview, selectWindowById, selectWindowComponentById, selectWindowOrder } from '../../features/window-manager/selectors'
import { useWindowShortcuts } from '../../features/window-manager/useWindowShortcuts'
import { useWindowStore } from '../../stores/windowStore'
import { WindowRecoveryBoundaryInner } from '../system/WindowRecoveryBoundary'

import { SnapPreviewOverlay } from '../../features/window-manager/components/SnapPreviewOverlay'

const WindowRenderer = memo(function WindowRenderer({ id }: { id: string }) {
    const WindowComponent = useWindowStore(selectWindowComponentById(id))
    const windowData = useWindowStore(selectWindowById(id))
    const closeWindow = useWindowStore((state) => state.closeWindow)

    if (!WindowComponent || !windowData) {
        return null
    }

    return (
        <WindowRecoveryBoundaryInner
            windowId={id}
            appTitle={windowData.title}
            onClose={() => closeWindow(id)}
        >
            <WindowComponent id={id} />
        </WindowRecoveryBoundaryInner>
    )
})

export default function DesktopWindows() {
    const windowOrder = useWindowStore(selectWindowOrder)
    const snapPreview = useWindowStore(selectSnapPreview)
    useWindowShortcuts()

    return (
        <div className="pointer-events-none relative z-20 h-full w-full">
            {windowOrder.map((windowId) => (
                <WindowRenderer key={windowId} id={windowId} />
            ))}
            <SnapPreviewOverlay preview={snapPreview} />
        </div>
    )
}
