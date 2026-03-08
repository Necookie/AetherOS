export class TerminalSession {
  private cwd = '/home/user'
  private readonly history: string[] = []
  private historyCursor: number | null = null
  private draftInput = ''

  public getCwd(): string {
    return this.cwd
  }

  public setCwd(path: string) {
    this.cwd = path
  }

  public pushHistory(input: string) {
    const trimmed = input.trim()
    if (!trimmed) {
      this.historyCursor = null
      return
    }

    this.history.push(trimmed)
    this.historyCursor = null
    this.draftInput = ''
  }

  public previousHistory(currentInput: string): string {
    if (this.history.length === 0) {
      return currentInput
    }

    if (this.historyCursor === null) {
      this.draftInput = currentInput
      this.historyCursor = this.history.length - 1
      return this.history[this.historyCursor]
    }

    if (this.historyCursor > 0) {
      this.historyCursor -= 1
    }

    return this.history[this.historyCursor]
  }

  public nextHistory(): string {
    if (this.historyCursor === null) {
      return this.draftInput
    }

    if (this.historyCursor < this.history.length - 1) {
      this.historyCursor += 1
      return this.history[this.historyCursor]
    }

    this.historyCursor = null
    return this.draftInput
  }
}
