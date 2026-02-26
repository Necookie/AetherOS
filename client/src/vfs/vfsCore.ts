import { VfsNode, VfsNodeType, VfsError, ErrorCodes } from './types';
import { kernelClock } from '../lib/kernelClock';

export class AetherVFS {
    private nodes: Map<string, VfsNode> = new Map();
    private rootId: string;

    constructor() {
        this.rootId = this.generateId();
        const now = kernelClock.now();
        this.nodes.set(this.rootId, {
            id: this.rootId,
            type: VfsNodeType.DIR,
            name: '/',
            parentId: null,
            createdAt: now,
            modifiedAt: now,
            owner: 'root',
            group: 'root',
            mode: 0o755,
            size: 4096,
            mime: 'inode/directory',
            content: '',
            childrenIds: []
        });
    }

    public getNodes(): Record<string, VfsNode> {
        const result: Record<string, VfsNode> = {};
        for (const [id, node] of this.nodes.entries()) {
            result[id] = node;
        }
        return result;
    }

    public getNodeById(id: string): VfsNode | null {
        return this.nodes.get(id) || null;
    }

    public getRootId(): string {
        return this.rootId;
    }

    private generateId(): string {
        return crypto.randomUUID();
    }

    public normalizePath(path: string): string {
        if (!path.startsWith('/')) path = '/' + path;
        const parts = path.split('/').filter(p => p.length > 0);
        const resolved: string[] = [];

        for (const part of parts) {
            if (part === '.') continue;
            if (part === '..') {
                resolved.pop();
            } else {
                resolved.push(part);
            }
        }
        return '/' + resolved.join('/');
    }

    public resolvePath(path: string): VfsNode {
        const normalized = this.normalizePath(path);
        if (normalized === '/') return this.nodes.get(this.rootId)!;

        const parts = normalized.split('/').filter(p => p.length > 0);
        let current = this.nodes.get(this.rootId)!;

        for (const part of parts) {
            if (current.type !== VfsNodeType.DIR) {
                throw new VfsError(ErrorCodes.ENOTDIR, `Not a directory: ${part}`);
            }

            let found = false;
            for (const childId of current.childrenIds) {
                const child = this.nodes.get(childId)!;
                if (child.name === part) {
                    current = child;
                    found = true;
                    break;
                }
            }

            if (!found) {
                throw new VfsError(ErrorCodes.ENOENT, `No such file or directory: ${normalized}`);
            }
        }

        return current;
    }

    private isSystemPath(path: string): boolean {
        const normalized = this.normalizePath(path);
        const sysPaths = ['/etc', '/bin', '/usr', '/var'];
        return sysPaths.some(sys => normalized === sys || normalized.startsWith(sys + '/'));
    }

    public checkWritePermission(path: string) {
        if (this.isSystemPath(path)) {
            throw new VfsError(ErrorCodes.EPERM, `Operation not permitted on system path: ${path}`);
        }
    }

    public createNode(
        parentPath: string,
        name: string,
        type: VfsNodeType,
        content: string = '',
        mime: string = '',
        systemOverride: boolean = false
    ): VfsNode {
        const parent = this.resolvePath(parentPath);
        if (parent.type !== VfsNodeType.DIR) {
            throw new VfsError(ErrorCodes.ENOTDIR, `Parent is not a directory: ${parentPath}`);
        }

        const fullPath = this.normalizePath(`${parentPath}/${name}`);
        if (!systemOverride) this.checkWritePermission(fullPath);

        // Check for duplicates
        if (this.childExists(parent.id, name)) {
            throw new VfsError(ErrorCodes.EEXIST, `File exists: ${name}`);
        }

        const now = kernelClock.now();
        const newNode: VfsNode = {
            id: this.generateId(),
            type,
            name,
            parentId: parent.id,
            createdAt: now,
            modifiedAt: now,
            owner: 'user',
            group: 'user',
            mode: type === VfsNodeType.DIR ? 0o755 : 0o644,
            size: type === VfsNodeType.DIR ? 4096 : new Blob([content]).size,
            mime: type === VfsNodeType.DIR ? 'inode/directory' : mime || 'text/plain',
            content: content,
            childrenIds: []
        };

        this.nodes.set(newNode.id, newNode);
        parent.childrenIds.push(newNode.id);
        parent.modifiedAt = now;

        return newNode;
    }

    private childExists(parentId: string, name: string): boolean {
        const parent = this.nodes.get(parentId)!;
        return parent.childrenIds.some(childId => this.nodes.get(childId)!.name === name);
    }

    public rename(path: string, newName: string, systemOverride: boolean = false): VfsNode {
        const node = this.resolvePath(path);
        if (node.id === this.rootId) {
            throw new VfsError(ErrorCodes.EINVAL, 'Cannot rename root');
        }

        if (!systemOverride) this.checkWritePermission(path); // check current path

        const parent = this.nodes.get(node.parentId!)!;
        const newPath = this.normalizePath(`${this.getPath(parent.id)}/${newName}`);
        if (!systemOverride) this.checkWritePermission(newPath); // check target path

        if (this.childExists(parent.id, newName)) {
            throw new VfsError(ErrorCodes.EEXIST, `File exists: ${newName}`);
        }

        const now = kernelClock.now();
        node.name = newName;
        node.modifiedAt = now;
        parent.modifiedAt = now;

        return node;
    }

    public delete(path: string, systemOverride: boolean = false) {
        const node = this.resolvePath(path);
        if (node.id === this.rootId) {
            throw new VfsError(ErrorCodes.EPERM, 'Cannot delete root');
        }

        if (!systemOverride) this.checkWritePermission(path);

        const parent = this.nodes.get(node.parentId!)!;
        parent.childrenIds = parent.childrenIds.filter(id => id !== node.id);
        parent.modifiedAt = kernelClock.now();

        this.deleteRecursive(node.id);
    }

    private deleteRecursive(nodeId: string) {
        const node = this.nodes.get(nodeId);
        if (!node) return;

        if (node.type === VfsNodeType.DIR) {
            for (const childId of node.childrenIds) {
                this.deleteRecursive(childId);
            }
        }
        this.nodes.delete(nodeId);
    }

    public readDir(path: string): VfsNode[] {
        const node = this.resolvePath(path);
        if (node.type !== VfsNodeType.DIR) {
            throw new VfsError(ErrorCodes.ENOTDIR, `Not a directory: ${path}`);
        }

        return node.childrenIds.map(id => this.nodes.get(id)!);
    }

    public readFile(path: string): string {
        const node = this.resolvePath(path);
        if (node.type === VfsNodeType.DIR) {
            throw new VfsError(ErrorCodes.EISDIR, `Is a directory: ${path}`);
        }
        return node.content;
    }

    public writeFile(path: string, content: string, systemOverride: boolean = false) {
        const node = this.resolvePath(path);
        if (node.type === VfsNodeType.DIR) {
            throw new VfsError(ErrorCodes.EISDIR, `Is a directory: ${path}`);
        }
        if (!systemOverride) this.checkWritePermission(path);

        const now = kernelClock.now();
        node.content = content;
        node.size = new Blob([content]).size;
        node.modifiedAt = now;
    }

    public getPath(nodeId: string): string {
        const node = this.nodes.get(nodeId);
        if (!node) throw new VfsError(ErrorCodes.ENOENT, 'Node not found');
        if (node.id === this.rootId) return '/';

        let current = node;
        const parts: string[] = [];

        while (current.parentId) {
            parts.unshift(current.name);
            current = this.nodes.get(current.parentId)!;
        }

        return '/' + parts.join('/');
    }
}
