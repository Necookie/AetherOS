import { memo } from 'react'
import { selectSnapPreview, selectWindowComponentById, selectWindowOrder } from '../../features/window-manager/selectors'
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
    const snapPreview = useWindowStore(selectSnapPreview)
    useWindowShortcuts()

    return (
        <div className="relative z-20 h-full w-full pointer-events-auto">
            {windowOrder.map((windowId) => (
                <WindowRenderer key={windowId} id={windowId} />
            ))}
            {snapPreview && (
                <div
                    className="pointer-events-none absolute rounded-xl border border-white/70 bg-white/20 shadow-[0_12px_28px_rgb(15_23_42_/_0.24)] backdrop-blur-sm"
                    style={{
                        left: snapPreview.region.bounds.x,
                        top: snapPreview.region.bounds.y,
                        width: snapPreview.region.bounds.width,
                        height: snapPreview.region.bounds.height,
                    }}
                />
            )}
        </div>
    )
}
