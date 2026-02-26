import { useEffect } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'

type UseTerminalOptions = {
    terminalRef: React.RefObject<HTMLDivElement>
    onCommand: (input: string) => void | Promise<void>
    onReady: (term: Terminal) => void
}

const BANNER_LINES = ['AetherOS Terminal v1.0', 'Type "help" for a list of commands.']

export function useTerminal({ terminalRef, onCommand, onReady }: UseTerminalOptions) {
    useEffect(() => {
        if (!terminalRef.current) return

        const term = new Terminal({
            theme: { background: '#00000000' },
            cursorBlink: true,
            fontFamily: 'monospace'
        })
        const fitAddon = new FitAddon()
        term.loadAddon(fitAddon)
        term.open(terminalRef.current)
        fitAddon.fit()
        onReady(term)

        BANNER_LINES.forEach(line => term.writeln(line))
        term.write('\r\naetheros> ')

        let currentInput = ''

        const handleKey = ({ key, domEvent }: { key: string; domEvent: KeyboardEvent }) => {
            if (domEvent.key === 'Enter') {
                onCommand(currentInput)
                currentInput = ''
                return
            }

            if (domEvent.key === 'Backspace') {
                if (currentInput.length > 0) {
                    currentInput = currentInput.slice(0, -1)
                    term.write('\b \b')
                }
                return
            }

            if (currentInput.length < 50 && !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey) {
                currentInput += key
                term.write(key)
            }
        }

        term.onKey(handleKey)

        const resizeObserver = new ResizeObserver(() => fitAddon.fit())
        resizeObserver.observe(terminalRef.current)

        return () => {
            resizeObserver.disconnect()
            term.dispose()
        }
    }, [onCommand, onReady, terminalRef])
}
