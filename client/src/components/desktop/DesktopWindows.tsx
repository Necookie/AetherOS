import { useWindowStore } from '../../stores/windowStore'

export default function DesktopWindows() {
    const windows = useWindowStore(state => state.windows)

    return (
        <div className="flex-1 relative z-20 pointer-events-auto">
            {Object.values(windows).map(w => (
                <w.component key={w.id} id={w.id} />
            ))}
        </div>
    )
}

