import { useEffect, useRef } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'
import type { TerminalCommandEngine } from '../../apps/terminal/runtime/engine'
import type { TerminalSession } from '../../apps/terminal/runtime/session'

type UseTerminalOptions = {
    terminalRef: React.RefObject<HTMLDivElement>
    engine: TerminalCommandEngine
    session: TerminalSession
    onReady: (term: Terminal, fit: () => void) => void
}

const BANNER_LINES = ['AetherOS Terminal v1.0', 'Type "help" for a list of commands.']
const RESET_COLOR = '\u001b[0m'

function readThemeColor(name: string, fallback: string): string {
    if (typeof window === 'undefined') {
        return fallback
    }

    const value = window.getComputedStyle(document.documentElement).getPropertyValue(name).trim()
    return value || fallback
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const clean = hex.trim().replace('#', '')
    const normalized = clean.length === 3
        ? clean.split('').map((char) => `${char}${char}`).join('')
        : clean
    if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
        return null
    }

    return {
        r: Number.parseInt(normalized.slice(0, 2), 16),
        g: Number.parseInt(normalized.slice(2, 4), 16),
        b: Number.parseInt(normalized.slice(4, 6), 16),
    }
}

export function useTerminal({ terminalRef, engine, session, onReady }: UseTerminalOptions) {
    const engineRef = useRef(engine)
    const sessionRef = useRef(session)
    const onReadyRef = useRef(onReady)

    useEffect(() => {
        engineRef.current = engine
        sessionRef.current = session
    }, [engine, session])

    useEffect(() => {
        onReadyRef.current = onReady
    }, [onReady])

    useEffect(() => {
        if (!terminalRef.current) return

        const surfaceColor = readThemeColor('--os-surface-1', '#ecf4ff')
        const textColor = readThemeColor('--os-text-0', '#172033')
        const accentColor = readThemeColor('--os-accent', '#0a84ff')
        const borderColor = readThemeColor('--os-border', '#b9cae2')

        const term = new Terminal({
            theme: {
                background: surfaceColor,
                foreground: textColor,
                cursor: accentColor,
                selectionBackground: borderColor,
            },
            cursorBlink: true,
            fontFamily: 'JetBrains Mono, Cascadia Code, Fira Code, monospace',
        })
        const fitAddon = new FitAddon()
        term.loadAddon(fitAddon)
        term.open(terminalRef.current)
        requestAnimationFrame(() => fitAddon.fit())
        onReadyRef.current(term, () => fitAddon.fit())

        BANNER_LINES.forEach(line => term.writeln(line))
        term.writeln('')

        let currentInput = ''
        let executionQueue = Promise.resolve()
        const accentRgb = hexToRgb(accentColor)
        const promptColor = accentRgb
            ? `\u001b[38;2;${accentRgb.r};${accentRgb.g};${accentRgb.b}m`
            : '\u001b[38;5;33m'

        const writePrompt = () => {
            const cwd = sessionRef.current.getCwd()
            term.write(`${promptColor}user@aether${RESET_COLOR}:${cwd}$ `)
        }

        const replaceInput = (nextInput: string) => {
            while (currentInput.length > 0) {
                term.write('\b \b')
                currentInput = currentInput.slice(0, -1)
            }
            currentInput = nextInput
            if (currentInput.length > 0) {
                term.write(currentInput)
            }
        }

        writePrompt()

        const handleKey = ({ key, domEvent }: { key: string; domEvent: KeyboardEvent }) => {
            if (domEvent.key === 'Enter') {
                const commandInput = currentInput
                sessionRef.current.pushHistory(commandInput)
                currentInput = ''
                term.writeln('')

                executionQueue = executionQueue.then(async () => {
                    const result = await engineRef.current.execute(commandInput, { cwd: sessionRef.current.getCwd() })
                    sessionRef.current.setCwd(result.cwd)
                    if (result.clear) {
                        term.clear()
                    }
                    result.output.forEach(line => term.writeln(line))
                    writePrompt()
                })
                return
            }

            if (domEvent.key === 'ArrowUp') {
                domEvent.preventDefault()
                replaceInput(sessionRef.current.previousHistory(currentInput))
                return
            }

            if (domEvent.key === 'ArrowDown') {
                domEvent.preventDefault()
                replaceInput(sessionRef.current.nextHistory())
                return
            }

            if (domEvent.key === 'Tab') {
                domEvent.preventDefault()
                const suggestions = engineRef.current.suggest(currentInput, sessionRef.current.getCwd())
                if (suggestions.length === 1) {
                    const suggestion = suggestions[0]
                    const base = currentInput.match(/^(.*\s)?([^\s]*)$/)
                    const prefix = base?.[1] ?? ''
                    replaceInput(`${prefix}${suggestion}`)
                    return
                }

                if (suggestions.length > 1) {
                    term.writeln('')
                    term.writeln(suggestions.join('  '))
                    writePrompt()
                    term.write(currentInput)
                }
                return
            }

            if (domEvent.key === 'Backspace') {
                if (currentInput.length > 0) {
                    currentInput = currentInput.slice(0, -1)
                    term.write('\b \b')
                }
                return
            }

            if (
                key.length === 1
                && currentInput.length < 200
                && !domEvent.altKey
                && !domEvent.ctrlKey
                && !domEvent.metaKey
            ) {
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
    }, [terminalRef])
}
