import { VfsNodeType } from '../../../vfs/types'
import { parseCommand, splitInputForAutocomplete } from './parser'
import { resolveInputPath } from './pathUtils'
import { CommandRegistry } from './registry'
import type { CommandExecution, TerminalSessionState, TerminalVfs } from './types'

export class TerminalCommandEngine {
  constructor(
    private readonly vfs: TerminalVfs,
    private readonly registry: CommandRegistry,
  ) {}

  public async execute(input: string, session: TerminalSessionState): Promise<CommandExecution> {
    const parsed = parseCommand(input)
    if (!parsed) {
      return { output: [], clear: false, cwd: session.cwd }
    }

    const command = this.registry.get(parsed.name)
    if (!command) {
      return {
        output: [`command not found: ${parsed.name}`, 'Type "help" to list available commands.'],
        clear: false,
        cwd: session.cwd,
      }
    }

    const result = await command.execute(
      {
        cwd: session.cwd,
        commands: this.registry.list(),
      },
      parsed.args,
    )

    return {
      output: result.output ?? [],
      clear: result.clear ?? false,
      cwd: result.cwd ?? session.cwd,
    }
  }

  public suggest(input: string, cwd: string): string[] {
    const { tokens, endsWithSpace } = splitInputForAutocomplete(input)
    if (tokens.length === 0) {
      return this.registry.names()
    }

    if (tokens.length === 1 && !endsWithSpace) {
      const currentToken = tokens[0]
      return this.registry.names().filter((name) => name.startsWith(currentToken))
    }

    const pathToken = endsWithSpace ? '' : tokens[tokens.length - 1]
    const basePath = pathToken.includes('/') ? pathToken.slice(0, pathToken.lastIndexOf('/') + 1) : ''
    const partialName = pathToken.slice(basePath.length)
    const targetDir = resolveInputPath(this.vfs, cwd, basePath || '.')

    try {
      const entries = this.vfs.readDir(targetDir)
        .filter((entry) => entry.name.startsWith(partialName))
        .sort((left, right) => left.name.localeCompare(right.name))
        .map((entry) => {
          const suffix = entry.type === VfsNodeType.DIR ? '/' : ''
          return `${basePath}${entry.name}${suffix}`
        })
      return entries
    } catch {
      return []
    }
  }
}
