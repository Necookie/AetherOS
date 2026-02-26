import type { Process } from '../../stores/useKernelStore'
import type { Terminal } from 'xterm'

export type TerminalContext = {
    term: Terminal
    writePrompt: () => void
    spawnProcess: (name: string) => void
    killProcess: (pid: number) => void
    getProcesses: () => Process[]
    queryAi: (prompt: string) => Promise<{ reply: string; mode: string }>
}
