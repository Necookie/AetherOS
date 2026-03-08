import type { VfsNode } from '../../../vfs/types'

export type CommandResult = {
  output?: string[]
  clear?: boolean
  cwd?: string
}

export type ParsedCommand = {
  name: string
  args: string[]
}

export type CommandContext = {
  cwd: string
  commands: CommandDefinition[]
}

export type CommandDefinition = {
  name: string
  description: string
  usage?: string
  execute: (ctx: CommandContext, args: string[]) => CommandResult | Promise<CommandResult>
}

export interface TerminalVfs {
  normalizePath: (path: string) => string
  resolvePath: (path: string) => VfsNode
  readDir: (path: string) => VfsNode[]
  readFile: (path: string) => string
  writeFile: (path: string, content: string) => void
  createNode: (
    parentPath: string,
    name: string,
    type: VfsNode['type'],
    content?: string,
    mime?: string,
  ) => VfsNode
  delete: (path: string) => void
  move: (sourcePath: string, destinationDirectoryPath: string, newName?: string) => VfsNode
}

export type TerminalSessionState = {
  cwd: string
}

export type CommandExecution = {
  output: string[]
  clear: boolean
  cwd: string
}
