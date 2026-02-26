import type { TerminalContext } from './types'

const HELP_TEXT =
    'Available commands: help, clear, ps, kill <pid>, spawn <name>, mem, disk, about, ai <prompt>'

function writeProcesses(ctx: TerminalContext) {
    ctx.term.writeln('PID\tNAME\t\tCPU\tRAM\tDISK\tNET\tSTATUS')
    ctx.getProcesses().forEach(p => {
        ctx.term.writeln(
            `${p.pid}\t${p.name.padEnd(10, ' ')}\t${p.cpu.toFixed(1)}\t${p.mem.toFixed(1)}\t${p.disk.toFixed(1)}\t${p.net.toFixed(1)}\t${p.status}`
        )
    })
}

async function runAiCommand(ctx: TerminalContext, prompt: string) {
    ctx.term.writeln('Querying AI...')
    try {
        const data = await ctx.queryAi(prompt)
        ctx.term.writeln(`[AI Mode: ${data.mode}] ${data.reply}`)
    } catch {
        ctx.term.writeln('Error connecting to AI backend.')
    }
}

export async function handleTerminalCommand(ctx: TerminalContext, input: string) {
    const args = input.trim().split(' ').filter(Boolean)
    const command = args[0]

    ctx.term.writeln('')

    if (!command) {
        ctx.writePrompt()
        return
    }

    if (command === 'help') {
        ctx.term.writeln(HELP_TEXT)
        ctx.writePrompt()
        return
    }

    if (command === 'clear') {
        ctx.term.clear()
        ctx.writePrompt()
        return
    }

    if (command === 'ps') {
        writeProcesses(ctx)
        ctx.writePrompt()
        return
    }

    if (command === 'kill' && args[1]) {
        ctx.killProcess(parseInt(args[1], 10))
        ctx.term.writeln(`Killed process ${args[1]}`)
        ctx.writePrompt()
        return
    }

    if (command === 'spawn' && args[1]) {
        ctx.spawnProcess(args[1])
        ctx.term.writeln(`Spawned process ${args[1]}`)
        ctx.writePrompt()
        return
    }

    if (command === 'ai' && args.length > 1) {
        await runAiCommand(ctx, args.slice(1).join(' '))
        ctx.writePrompt()
        return
    }

    ctx.term.writeln(`Unknown command: ${command}`)
    ctx.writePrompt()
}
