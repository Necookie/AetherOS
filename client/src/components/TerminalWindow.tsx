import { useEffect, useMemo, useRef } from 'react'
import { selectWindowById } from '../features/window-manager/selectors'
import { useWindowStore } from '../stores/windowStore'
import { createTerminalRuntime } from '../apps/terminal/runtime'
import Window from './system/Window'
import { useTerminal } from './terminal/useTerminal'

export default function TerminalWindow({ id }: { id: string }) {
    const terminalRef = useRef<HTMLDivElement>(null)
    const termInstance = useRef<import('xterm').Terminal | null>(null)
    const fitTerminal = useRef<(() => void) | null>(null)
    const windowData = useWindowStore(selectWindowById(id))
    const runtime = useMemo(() => createTerminalRuntime(), [])

    useTerminal({
        terminalRef,
        engine: runtime.engine,
        session: runtime.session,
        onReady: (term, fit) => {
            termInstance.current = term
            fitTerminal.current = fit
        },
    })

    useEffect(() => {
        if (!windowData || windowData.state.isMinimized) {
            return
        }

        const runFit = () => fitTerminal.current?.()
        let timeoutId: number | null = null
        const raf = window.requestAnimationFrame(() => {
            runFit()
            timeoutId = window.setTimeout(runFit, 120)
        })

        return () => {
            window.cancelAnimationFrame(raf)
            if (timeoutId !== null) {
                window.clearTimeout(timeoutId)
            }
        }
    }, [
        windowData,
        windowData?.state.isMinimized,
        windowData?.state.isMaximized,
        windowData?.bounds.width,
        windowData?.bounds.height,
    ])

    return (
        <Window id={id} title="Terminal">
            <div ref={terminalRef} className="w-full h-full p-2" />
        </Window>
    )
}
