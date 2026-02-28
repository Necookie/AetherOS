import { useCallback, useRef } from 'react'
import { shallow } from 'zustand/shallow'
import { useKernelStore } from '../stores/useKernelStore'
import { queryAi } from '../services/aiClient'
import Window from './system/Window'
import { handleTerminalCommand } from './terminal/terminalCommands'
import { useTerminal } from './terminal/useTerminal'

export default function TerminalWindow({ id }: { id: string }) {
    const terminalRef = useRef<HTMLDivElement>(null)
    const termInstance = useRef<import('xterm').Terminal | null>(null)
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
        onReady: (term) => {
            termInstance.current = term
        },
    })

    return (
        <Window id={id} title="Terminal">
            <div ref={terminalRef} className="w-full h-full p-2" />
        </Window>
    )
}
