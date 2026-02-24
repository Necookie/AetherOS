import { useEffect, useRef } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'
import DraggableWindow from './DraggableWindow'
import { useKernelStore } from '../stores/useKernelStore'

export default function TerminalWindow({ onClose }: { onClose: () => void }) {
    const terminalRef = useRef<HTMLDivElement>(null)
    const termInstance = useRef<Terminal | null>(null)
    const { processes, spawnProcess, killProcess } = useKernelStore()

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
        termInstance.current = term

        term.writeln('AetherOS Terminal v1.0')
        term.writeln('Type "help" for a list of commands.')
        term.write('\r\naetheros> ')

        let currentInput = ''

        const handleCommand = async (cmd: string) => {
            const args = cmd.trim().split(' ')
            const command = args[0]

            term.writeln('')
            if (command === 'help') {
                term.writeln('Available commands: help, clear, ps, kill <pid>, spawn <name>, mem, disk, about, ai <prompt>')
            } else if (command === 'clear') {
                term.clear()
            } else if (command === 'ps') {
                term.writeln('PID\tNAME\t\tCPU\tRAM\tSTATUS')
                useKernelStore.getState().processes.forEach(p => {
                    term.writeln(`${p.pid}\t${p.name.padEnd(10, ' ')}\t${p.cpu.toFixed(1)}\t${p.mem.toFixed(1)}\t${p.status}`)
                })
            } else if (command === 'kill' && args[1]) {
                killProcess(parseInt(args[1]))
                term.writeln(`Killed process ${args[1]}`)
            } else if (command === 'spawn' && args[1]) {
                spawnProcess(args[1])
                term.writeln(`Spawned process ${args[1]}`)
            } else if (command === 'ai' && args.length > 1) {
                term.writeln('Querying AI...')
                try {
                    const res = await fetch(import.meta.env.VITE_API_URL + '/api/ai', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message: args.slice(1).join(' ') })
                    })
                    const data = await res.json()
                    term.writeln(`[AI Mode: ${data.mode}] ${data.reply}`)
                } catch (e) {
                    term.writeln('Error connecting to AI backend.')
                }
            } else if (command) {
                term.writeln(`Unknown command: ${command}`)
            }

            term.write('\r\naetheros> ')
        }

        term.onKey(({ key, domEvent }) => {
            const ev = domEvent
            if (ev.key === 'Enter') {
                handleCommand(currentInput)
                currentInput = ''
            } else if (ev.key === 'Backspace') {
                if (currentInput.length > 0) {
                    currentInput = currentInput.slice(0, -1)
                    term.write('\b \b')
                }
            } else if (currentInput.length < 50 && !ev.altKey && !ev.ctrlKey && !ev.metaKey) {
                currentInput += key
                term.write(key)
            }
        })

        const resizeObserver = new ResizeObserver(() => fitAddon.fit())
        resizeObserver.observe(terminalRef.current)

        return () => {
            resizeObserver.disconnect()
            term.dispose()
        }
    }, [killProcess, spawnProcess])

    return (
        <DraggableWindow title="Terminal" onClose={onClose} initialPos={{ x: 50, y: 50 }}>
            <div ref={terminalRef} className="w-full h-full p-2" />
        </DraggableWindow>
    )
}
