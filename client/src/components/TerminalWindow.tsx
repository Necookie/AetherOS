import { useCallback, useEffect, useRef } from 'react'
import { shallow } from 'zustand/shallow'
import { selectWindowById } from '../features/window-manager/selectors'
import { useKernelStore } from '../stores/useKernelStore'
import { useWindowStore } from '../stores/windowStore'
import { queryAi } from '../services/aiClient'
import Window from './system/Window'
import { handleTerminalCommand } from './terminal/terminalCommands'
import { useTerminal } from './terminal/useTerminal'

export default function TerminalWindow({ id }: { id: string }) {
    const terminalRef = useRef<HTMLDivElement>(null)
    const termInstance = useRef<import('xterm').Terminal | null>(null)
    const fitTerminal = useRef<(() => void) | null>(null)
    const windowData = useWindowStore(selectWindowById(id))
    const { spawnProcess, killProcess } = useKernelStore((state) => ({
        spawnProcess: state.spawnProcess,
        killProcess: state.killProcess,
    }), shallow)

    const onCommand = useCallback(
        async (input: string) => {
            const term = termInstance.current
            if (!term) {
                return
            }

            await handleTerminalCommand(
                {
                    term,
                    writePrompt: () => term.write('\r\naetheros> '),
                    spawnProcess,
                    killProcess,
                    getProcesses: () => useKernelStore.getState().processes,
                    queryAi,
                },
                input,
            )
        },
        [killProcess, spawnProcess],
    )

    useTerminal({
        terminalRef,
        onCommand,
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
