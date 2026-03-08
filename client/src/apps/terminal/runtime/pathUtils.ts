import { ErrorCodes, VfsError, VfsNodeType, type VfsNode } from '../../../vfs/types'
import type { TerminalVfs } from './types'

export function resolveInputPath(vfs: TerminalVfs, cwd: string, inputPath: string): string {
  if (!inputPath) {
    return cwd
  }

  const path = inputPath.startsWith('/') ? inputPath : `${cwd}/${inputPath}`
  return vfs.normalizePath(path)
}

export function splitParent(path: string): { parentPath: string; name: string } {
  const parts = path.split('/').filter(Boolean)
  const name = parts.pop()
  if (!name) {
    throw new VfsError(ErrorCodes.EINVAL, `Invalid path: ${path}`)
  }

  const parentPath = parts.length === 0 ? '/' : `/${parts.join('/')}`
  return { parentPath, name }
}

export function assertDirectory(node: VfsNode, path: string) {
  if (node.type !== VfsNodeType.DIR) {
    throw new VfsError(ErrorCodes.ENOTDIR, `Not a directory: ${path}`)
  }
}

