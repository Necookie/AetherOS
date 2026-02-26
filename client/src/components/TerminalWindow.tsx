import { useCallback, useRef } from 'react'
import DraggableWindow from './DraggableWindow'
import { useKernelStore } from '../stores/useKernelStore'
import { queryAi } from '../services/aiClient'
import { handleTerminalCommand } from './terminal/terminalCommands'
import { useTerminal } from './terminal/useTerminal'

export default function TerminalWindow({ onClose }: { onClose: () => void }) {
    const terminalRef = useRef<HTMLDivElement>(null)
    const termInstance = useRef<import('xterm').Terminal | null>(null)
    const { spawnProcess, killProcess } = useKernelStore()

    const onCommand = useCallback(
        async (input: string) => {
            const term = termInstance.current
            if (!term) return

            await handleTerminalCommand(
                {
                    term,
                    writePrompt: () => term.write('\r\naetheros> '),
                    spawnProcess,
                    killProcess,
                    getProcesses: () => useKernelStore.getState().processes,
                    queryAi
                },
                input
            )
        },
        [killProcess, spawnProcess]
    )

    useTerminal({
        terminalRef,
        onCommand,
        onReady: (term) => {
            termInstance.current = term
        }
    })

    return (
        <DraggableWindow title="Terminal" onClose={onClose} initialPos={{ x: 50, y: 50 }}>
            <div ref={terminalRef} className="w-full h-full p-2" />
        </DraggableWindow>
    )
}
