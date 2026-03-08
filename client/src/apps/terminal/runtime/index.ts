import { fsService } from '../../../vfs/vfsService'
import { createBuiltInCommands } from './commands'
import { TerminalCommandEngine } from './engine'
import { CommandRegistry } from './registry'
import { TerminalSession } from './session'

export function createTerminalRuntime() {
  const registry = new CommandRegistry()
  registry.registerMany(createBuiltInCommands(fsService))

  return {
    engine: new TerminalCommandEngine(fsService, registry),
    session: new TerminalSession(),
  }
}
