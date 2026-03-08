import { describe, expect, it } from 'vitest'
import { AetherVFS } from '../../../vfs/vfsCore'
import { VfsNodeType } from '../../../vfs/types'
import { createBuiltInCommands } from './commands'
import { TerminalCommandEngine } from './engine'
import { CommandRegistry } from './registry'

function createRuntimeHarness() {
  const vfs = new AetherVFS()
  vfs.createNode('/', 'home', VfsNodeType.DIR, '', '', true)
  vfs.createNode('/home', 'user', VfsNodeType.DIR, '', '', true)
  vfs.createNode('/home/user', 'docs', VfsNodeType.DIR, '', '', true)
  vfs.createNode('/home/user/docs', 'readme.txt', VfsNodeType.FILE, 'hello', 'text/plain', true)

  const registry = new CommandRegistry()
  registry.registerMany(createBuiltInCommands({
    normalizePath: (path) => vfs.normalizePath(path),
    resolvePath: (path) => vfs.resolvePath(path),
    readDir: (path) => vfs.readDir(path),
    readFile: (path) => vfs.readFile(path),
    writeFile: (path, content) => vfs.writeFile(path, content, true),
    createNode: (parentPath, name, type, content = '', mime = '') =>
      vfs.createNode(parentPath, name, type, content, mime, true),
    delete: (path) => vfs.delete(path, true),
    move: (sourcePath, destinationDirectoryPath, newName) =>
      vfs.move(sourcePath, destinationDirectoryPath, newName, true),
  }))

  return {
    engine: new TerminalCommandEngine({
      normalizePath: (path) => vfs.normalizePath(path),
      resolvePath: (path) => vfs.resolvePath(path),
      readDir: (path) => vfs.readDir(path),
      readFile: (path) => vfs.readFile(path),
      writeFile: (path, content) => vfs.writeFile(path, content, true),
      createNode: (parentPath, name, type, content = '', mime = '') =>
        vfs.createNode(parentPath, name, type, content, mime, true),
      delete: (path) => vfs.delete(path, true),
      move: (sourcePath, destinationDirectoryPath, newName) =>
        vfs.move(sourcePath, destinationDirectoryPath, newName, true),
    }, registry),
  }
}

describe('terminal command engine', () => {
  it('supports filesystem command flow with cwd changes', async () => {
    const { engine } = createRuntimeHarness()
    let cwd = '/home/user'

    const cdResult = await engine.execute('cd docs', { cwd })
    cwd = cdResult.cwd
    expect(cwd).toBe('/home/user/docs')

    const pwdResult = await engine.execute('pwd', { cwd })
    expect(pwdResult.output).toEqual(['/home/user/docs'])

    await engine.execute('touch notes.txt', { cwd })
    const catResult = await engine.execute('cat notes.txt', { cwd })
    expect(catResult.output).toEqual([''])
  })

  it('returns clear result for clear command', async () => {
    const { engine } = createRuntimeHarness()
    const result = await engine.execute('clear', { cwd: '/home/user' })
    expect(result.clear).toBe(true)
  })

  it('reports errors for invalid rm and unknown commands', async () => {
    const { engine } = createRuntimeHarness()

    const rmResult = await engine.execute('rm docs', { cwd: '/home/user' })
    expect(rmResult.output[0]).toContain('error:')
    expect(rmResult.output[0]).toContain('EISDIR')

    const unknown = await engine.execute('doesnotexist', { cwd: '/home/user' })
    expect(unknown.output[0]).toContain('command not found')
  })

  it('offers command and path autocomplete suggestions', () => {
    const { engine } = createRuntimeHarness()
    const commandSuggestions = engine.suggest('c', '/home/user')
    expect(commandSuggestions).toEqual(expect.arrayContaining(['cat', 'cd', 'clear', 'cp']))

    const pathSuggestions = engine.suggest('cat docs/re', '/home/user')
    expect(pathSuggestions).toContain('docs/readme.txt')
  })
})
