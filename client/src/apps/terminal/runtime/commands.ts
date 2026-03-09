import { ErrorCodes, VfsError, VfsNodeType } from '../../../vfs/types'
import { reportKernelActivity } from '../../../features/kernel/activityReporter'
import { assertDirectory, resolveInputPath, splitParent } from './pathUtils'
import type { CommandDefinition, CommandResult, TerminalVfs } from './types'

function formatError(error: unknown): string {
  if (error instanceof VfsError) {
    return `${error.code}: ${error.message.replace(/^\[[A-Z]+\]\s*/, '')}`
  }
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}

function withResult(action: () => CommandResult): CommandResult {
  try {
    return action()
  } catch (error: unknown) {
    return { output: [`error: ${formatError(error)}`] }
  }
}

function copyRecursive(vfs: TerminalVfs, sourcePath: string, destinationPath: string) {
  const sourceNode = vfs.resolvePath(sourcePath)
  if (sourceNode.type === VfsNodeType.DIR) {
    const { parentPath, name } = splitParent(destinationPath)
    vfs.createNode(parentPath, name, VfsNodeType.DIR)

    const children = vfs.readDir(sourcePath)
    for (const child of children) {
      copyRecursive(vfs, `${sourcePath}/${child.name}`, `${destinationPath}/${child.name}`)
    }
    return
  }

  const { parentPath, name } = splitParent(destinationPath)
  vfs.createNode(parentPath, name, VfsNodeType.FILE, sourceNode.content, sourceNode.mime)
}

function mkdirP(vfs: TerminalVfs, targetPath: string) {
  const parts = targetPath.split('/').filter(Boolean)
  let current = '/'

  for (const part of parts) {
    const next = current === '/' ? `/${part}` : `${current}/${part}`
    try {
      const node = vfs.resolvePath(next)
      assertDirectory(node, next)
    } catch (error) {
      if (error instanceof VfsError && error.code === ErrorCodes.ENOENT) {
        const { parentPath, name } = splitParent(next)
        vfs.createNode(parentPath, name, VfsNodeType.DIR)
      } else {
        throw error
      }
    }
    current = next
  }
}

export function createBuiltInCommands(vfs: TerminalVfs): CommandDefinition[] {
  const commands: CommandDefinition[] = [
    {
      name: 'help',
      description: 'List available commands',
      execute: (ctx) => ({
        output: [
          'Available commands:',
          ...ctx.commands.map((command) => {
            const usage = command.usage ? ` ${command.usage}` : ''
            return `  ${command.name}${usage} - ${command.description}`
          }),
        ],
      }),
    },
    {
      name: 'pwd',
      description: 'Print current working directory',
      execute: (ctx) => ({ output: [ctx.cwd] }),
    },
    {
      name: 'ls',
      description: 'List directory contents',
      usage: '[path]',
      execute: (ctx, args) => withResult(() => {
        const path = resolveInputPath(vfs, ctx.cwd, args[0] ?? '.')
        const node = vfs.resolvePath(path)

        if (node.type !== VfsNodeType.DIR) {
          return { output: [node.name] }
        }

        const rows = vfs.readDir(path)
          .sort((left, right) => left.name.localeCompare(right.name))
          .map((entry) => (entry.type === VfsNodeType.DIR ? `${entry.name}/` : entry.name))
        return { output: rows.length > 0 ? rows : ['(empty)'] }
      }),
    },
    {
      name: 'cd',
      description: 'Change current directory',
      usage: '[path]',
      execute: (ctx, args) => withResult(() => {
        const path = resolveInputPath(vfs, ctx.cwd, args[0] ?? '/home/user')
        const node = vfs.resolvePath(path)
        assertDirectory(node, path)
        return { cwd: path }
      }),
    },
    {
      name: 'cat',
      description: 'Print file contents',
      usage: '<path>',
      execute: (ctx, args) => withResult(() => {
        if (args.length === 0) {
          throw new VfsError(ErrorCodes.EINVAL, 'Usage: cat <path>')
        }
        const output = args.map((arg) => vfs.readFile(resolveInputPath(vfs, ctx.cwd, arg)))
        return { output }
      }),
    },
    {
      name: 'mkdir',
      description: 'Create directories',
      usage: '[-p] <path>',
      execute: (ctx, args) => withResult(() => {
        if (args.length === 0) {
          throw new VfsError(ErrorCodes.EINVAL, 'Usage: mkdir [-p] <path>')
        }

        const recursive = args[0] === '-p'
        const pathArg = recursive ? args[1] : args[0]
        if (!pathArg) {
          throw new VfsError(ErrorCodes.EINVAL, 'Usage: mkdir [-p] <path>')
        }

        const target = resolveInputPath(vfs, ctx.cwd, pathArg)
        if (recursive) {
          mkdirP(vfs, target)
          return { output: [] }
        }

        const { parentPath, name } = splitParent(target)
        vfs.createNode(parentPath, name, VfsNodeType.DIR)
        return { output: [] }
      }),
    },
    {
      name: 'touch',
      description: 'Create an empty file',
      usage: '<path>',
      execute: (ctx, args) => withResult(() => {
        if (args.length === 0) {
          throw new VfsError(ErrorCodes.EINVAL, 'Usage: touch <path>')
        }

        const target = resolveInputPath(vfs, ctx.cwd, args[0])
        try {
          const current = vfs.readFile(target)
          vfs.writeFile(target, current)
        } catch (error) {
          if (error instanceof VfsError && error.code === ErrorCodes.ENOENT) {
            const { parentPath, name } = splitParent(target)
            vfs.createNode(parentPath, name, VfsNodeType.FILE, '')
          } else {
            throw error
          }
        }

        return { output: [] }
      }),
    },
    {
      name: 'rm',
      description: 'Remove files or directories',
      usage: '[-r] <path>',
      execute: (ctx, args) => withResult(() => {
        if (args.length === 0) {
          throw new VfsError(ErrorCodes.EINVAL, 'Usage: rm [-r] <path>')
        }

        const recursive = args[0] === '-r'
        const pathArg = recursive ? args[1] : args[0]
        if (!pathArg) {
          throw new VfsError(ErrorCodes.EINVAL, 'Usage: rm [-r] <path>')
        }

        const path = resolveInputPath(vfs, ctx.cwd, pathArg)
        const node = vfs.resolvePath(path)
        if (node.type === VfsNodeType.DIR && !recursive) {
          throw new VfsError(ErrorCodes.EISDIR, 'Use -r to remove directories')
        }

        vfs.delete(path)
        reportKernelActivity({
          type: 'file-delete',
          sourceAppId: 'term',
          targetAppId: 'term',
          units: 1,
        })
        return { output: [] }
      }),
    },
    {
      name: 'mv',
      description: 'Move or rename files and directories',
      usage: '<source> <destination>',
      execute: (ctx, args) => withResult(() => {
        if (args.length < 2) {
          throw new VfsError(ErrorCodes.EINVAL, 'Usage: mv <source> <destination>')
        }

        const source = resolveInputPath(vfs, ctx.cwd, args[0])
        const destination = resolveInputPath(vfs, ctx.cwd, args[1])

        try {
          const destinationNode = vfs.resolvePath(destination)
          if (destinationNode.type === VfsNodeType.DIR) {
            vfs.move(source, destination)
            reportKernelActivity({
              type: 'file-move',
              sourceAppId: 'term',
              targetAppId: 'term',
              units: 1,
            })
            return { output: [] }
          }

          throw new VfsError(ErrorCodes.EEXIST, `File exists: ${destination}`)
        } catch (error) {
          if (!(error instanceof VfsError) || error.code !== ErrorCodes.ENOENT) {
            throw error
          }
        }

        const { parentPath, name } = splitParent(destination)
        vfs.move(source, parentPath, name)
        reportKernelActivity({
          type: 'file-move',
          sourceAppId: 'term',
          targetAppId: 'term',
          units: 1,
        })
        return { output: [] }
      }),
    },
    {
      name: 'cp',
      description: 'Copy files and directories',
      usage: '<source> <destination>',
      execute: (ctx, args) => withResult(() => {
        if (args.length < 2) {
          throw new VfsError(ErrorCodes.EINVAL, 'Usage: cp <source> <destination>')
        }

        const source = resolveInputPath(vfs, ctx.cwd, args[0])
        const destination = resolveInputPath(vfs, ctx.cwd, args[1])
        const sourceNode = vfs.resolvePath(source)

        let finalDestination = destination
        try {
          const destinationNode = vfs.resolvePath(destination)
          if (destinationNode.type === VfsNodeType.DIR) {
            finalDestination = destination === '/' ? `/${sourceNode.name}` : `${destination}/${sourceNode.name}`
          } else {
            throw new VfsError(ErrorCodes.EEXIST, `File exists: ${destination}`)
          }
        } catch (error) {
          if (!(error instanceof VfsError) || error.code !== ErrorCodes.ENOENT) {
            throw error
          }
        }

        copyRecursive(vfs, source, finalDestination)
        reportKernelActivity({
          type: 'file-copy',
          sourceAppId: 'term',
          targetAppId: 'term',
          units: 1.1,
        })
        return { output: [] }
      }),
    },
    {
      name: 'clear',
      description: 'Clear terminal output',
      execute: () => ({ clear: true, output: [] }),
    },
  ]

  return commands
}
