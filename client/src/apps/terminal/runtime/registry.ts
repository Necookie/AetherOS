import type { CommandDefinition } from './types'

export class CommandRegistry {
  private readonly byName = new Map<string, CommandDefinition>()

  public register(command: CommandDefinition) {
    this.byName.set(command.name, command)
  }

  public registerMany(commands: CommandDefinition[]) {
    for (const command of commands) {
      this.register(command)
    }
  }

  public get(name: string): CommandDefinition | undefined {
    return this.byName.get(name)
  }

  public list(): CommandDefinition[] {
    return Array.from(this.byName.values()).sort((left, right) => left.name.localeCompare(right.name))
  }

  public names(): string[] {
    return this.list().map((command) => command.name)
  }
}
