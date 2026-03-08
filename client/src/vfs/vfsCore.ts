import { kernelClock } from '../lib/kernelClock';
import {
    ErrorCodes,
    VfsError,
    type VfsNode,
    VfsNodeType,
    type VfsSearchOptions,
    type VfsSnapshot,
    type VfsTreeOptions,
} from './types';

export class AetherVFS {
    private nodes: Map<string, VfsNode> = new Map();
    private childrenByName: Map<string, Map<string, string>> = new Map();
    private nameTokenIndex: Map<string, Set<string>> = new Map();
    private pathCache: Map<string, string> = new Map();
    private readonly textEncoder = new TextEncoder();
    private rootId: string;

    constructor(snapshot?: VfsSnapshot) {
        if (snapshot) {
            this.rootId = snapshot.rootId;
            this.loadSnapshot(snapshot);
            return;
        }

        this.rootId = this.generateId();
        const now = kernelClock.now();
        const rootNode: VfsNode = {
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
            childrenIds: [],
        };

        this.nodes.set(rootNode.id, rootNode);
        this.childrenByName.set(rootNode.id, new Map());
        this.pathCache.set(rootNode.id, '/');
    }

    public getNodes(): Record<string, VfsNode> {
        const result: Record<string, VfsNode> = {};
        for (const [id, node] of this.nodes.entries()) {
            result[id] = this.cloneNode(node);
        }
        return result;
    }

    public getNodeById(id: string): VfsNode | null {
        const node = this.nodes.get(id);
        return node ? this.cloneNode(node) : null;
    }

    public getRootId(): string {
        return this.rootId;
    }

    public getSnapshot(): VfsSnapshot {
        return {
            rootId: this.rootId,
            nodes: Array.from(this.nodes.values(), (node) => this.cloneNode(node)),
        };
    }

    public restoreSnapshot(snapshot: VfsSnapshot) {
        this.rootId = snapshot.rootId;
        this.loadSnapshot(snapshot);
    }

    public normalizePath(path: string): string {
        if (!path || path.trim() === '') {
            return '/';
        }

        let normalized = path;
        if (!normalized.startsWith('/')) {
            normalized = `/${normalized}`;
        }

        const parts = normalized.split('/').filter((part) => part.length > 0);
        const resolved: string[] = [];

        for (const part of parts) {
            if (part === '.') {
                continue;
            }

            if (part === '..') {
                resolved.pop();
                continue;
            }

            resolved.push(part);
        }

        return `/${resolved.join('/')}`;
    }

    public resolvePath(path: string): VfsNode {
        const normalized = this.normalizePath(path);
        if (normalized === '/') {
            const root = this.nodes.get(this.rootId);
            if (!root) {
                throw new VfsError(ErrorCodes.ENOENT, 'Root missing');
            }
            return root;
        }

        const parts = normalized.split('/').filter((part) => part.length > 0);
        let current = this.nodes.get(this.rootId);
        if (!current) {
            throw new VfsError(ErrorCodes.ENOENT, 'Root missing');
        }

        for (const part of parts) {
            if (current.type !== VfsNodeType.DIR) {
                throw new VfsError(ErrorCodes.ENOTDIR, `Not a directory: ${part}`);
            }

            const childId = this.childrenByName.get(current.id)?.get(part);
            if (!childId) {
                throw new VfsError(ErrorCodes.ENOENT, `No such file or directory: ${normalized}`);
            }

            const child = this.nodes.get(childId);
            if (!child) {
                throw new VfsError(ErrorCodes.ENOENT, `Dangling child reference: ${part}`);
            }

            current = child;
        }

        return current;
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
        systemOverride: boolean = false,
    ): VfsNode {
        const cleanName = this.validateName(name);
        const parent = this.resolvePath(parentPath);
        if (parent.type !== VfsNodeType.DIR) {
            throw new VfsError(ErrorCodes.ENOTDIR, `Parent is not a directory: ${parentPath}`);
        }

        const fullPath = this.normalizePath(`${parentPath}/${cleanName}`);
        if (!systemOverride) {
            this.checkWritePermission(fullPath);
        }

        if (this.childExists(parent.id, cleanName)) {
            throw new VfsError(ErrorCodes.EEXIST, `File exists: ${cleanName}`);
        }

        const now = kernelClock.now();
        const newNode: VfsNode = {
            id: this.generateId(),
            type,
            name: cleanName,
            parentId: parent.id,
            createdAt: now,
            modifiedAt: now,
            owner: 'user',
            group: 'user',
            mode: type === VfsNodeType.DIR ? 0o755 : 0o644,
            size: type === VfsNodeType.DIR ? 4096 : this.getByteLength(content),
            mime: type === VfsNodeType.DIR ? 'inode/directory' : (mime || 'text/plain'),
            content,
            childrenIds: [],
        };

        this.nodes.set(newNode.id, newNode);
        this.childrenByName.set(newNode.id, new Map());

        const siblings = this.childrenByName.get(parent.id);
        if (!siblings) {
            throw new VfsError(ErrorCodes.EINVAL, 'Missing parent child index');
        }

        siblings.set(newNode.name, newNode.id);
        parent.childrenIds.push(newNode.id);
        parent.modifiedAt = now;

        this.addToSearchIndex(newNode);
        this.invalidatePathCacheSubtree(parent.id);

        return newNode;
    }

    public rename(path: string, newName: string, systemOverride: boolean = false): VfsNode {
        const node = this.resolvePath(path);
        if (node.id === this.rootId) {
            throw new VfsError(ErrorCodes.EINVAL, 'Cannot rename root');
        }

        const cleanName = this.validateName(newName);
        const parentId = node.parentId;
        if (!parentId) {
            throw new VfsError(ErrorCodes.EINVAL, 'Cannot rename detached node');
        }

        if (!systemOverride) {
            this.checkWritePermission(path);
        }

        const parent = this.nodes.get(parentId);
        if (!parent) {
            throw new VfsError(ErrorCodes.ENOENT, 'Parent not found');
        }

        const destinationPath = this.normalizePath(`${this.getPath(parent.id)}/${cleanName}`);
        if (!systemOverride) {
            this.checkWritePermission(destinationPath);
        }

        if (this.childExists(parent.id, cleanName)) {
            throw new VfsError(ErrorCodes.EEXIST, `File exists: ${cleanName}`);
        }

        const siblings = this.childrenByName.get(parent.id);
        if (!siblings) {
            throw new VfsError(ErrorCodes.EINVAL, 'Missing parent child index');
        }

        const now = kernelClock.now();
        siblings.delete(node.name);
        siblings.set(cleanName, node.id);

        this.removeFromSearchIndex(node);
        node.name = cleanName;
        node.modifiedAt = now;
        parent.modifiedAt = now;
        this.addToSearchIndex(node);
        this.invalidatePathCacheSubtree(node.id);

        return node;
    }

    public move(sourcePath: string, destinationDirectoryPath: string, newName?: string, systemOverride: boolean = false): VfsNode {
        const node = this.resolvePath(sourcePath);
        if (node.id === this.rootId) {
            throw new VfsError(ErrorCodes.EPERM, 'Cannot move root');
        }

        const destination = this.resolvePath(destinationDirectoryPath);
        if (destination.type !== VfsNodeType.DIR) {
            throw new VfsError(ErrorCodes.ENOTDIR, `Not a directory: ${destinationDirectoryPath}`);
        }

        const nextName = this.validateName(newName ?? node.name);
        const sourceParentId = node.parentId;
        if (!sourceParentId) {
            throw new VfsError(ErrorCodes.EINVAL, 'Node parent missing');
        }

        if (!systemOverride) {
            this.checkWritePermission(sourcePath);
            this.checkWritePermission(this.normalizePath(`${destinationDirectoryPath}/${nextName}`));
        }

        if (destination.id === node.id || this.isDescendant(destination.id, node.id)) {
            throw new VfsError(ErrorCodes.EINVAL, 'Cannot move a directory into itself');
        }

        if (this.childExists(destination.id, nextName)) {
            throw new VfsError(ErrorCodes.EEXIST, `File exists: ${nextName}`);
        }

        const sourceParent = this.nodes.get(sourceParentId);
        if (!sourceParent) {
            throw new VfsError(ErrorCodes.ENOENT, 'Source parent missing');
        }

        const sourceIndex = this.childrenByName.get(sourceParent.id);
        const destinationIndex = this.childrenByName.get(destination.id);
        if (!sourceIndex || !destinationIndex) {
            throw new VfsError(ErrorCodes.EINVAL, 'Directory index missing');
        }

        const now = kernelClock.now();
        sourceIndex.delete(node.name);
        sourceParent.childrenIds = sourceParent.childrenIds.filter((id) => id !== node.id);

        node.parentId = destination.id;
        node.name = nextName;
        node.modifiedAt = now;

        destinationIndex.set(nextName, node.id);
        destination.childrenIds.push(node.id);

        sourceParent.modifiedAt = now;
        destination.modifiedAt = now;

        this.removeFromSearchIndex(node);
        this.addToSearchIndex(node);
        this.invalidatePathCacheSubtree(node.id);
        this.invalidatePathCacheSubtree(sourceParent.id);
        this.invalidatePathCacheSubtree(destination.id);

        return node;
    }

    public delete(path: string, systemOverride: boolean = false) {
        const node = this.resolvePath(path);
        if (node.id === this.rootId) {
            throw new VfsError(ErrorCodes.EPERM, 'Cannot delete root');
        }

        if (!systemOverride) {
            this.checkWritePermission(path);
        }

        const parentId = node.parentId;
        if (!parentId) {
            throw new VfsError(ErrorCodes.EINVAL, 'Detached node cannot be deleted');
        }

        const parent = this.nodes.get(parentId);
        if (!parent) {
            throw new VfsError(ErrorCodes.ENOENT, 'Parent not found');
        }

        parent.childrenIds = parent.childrenIds.filter((id) => id !== node.id);
        this.childrenByName.get(parent.id)?.delete(node.name);
        parent.modifiedAt = kernelClock.now();

        this.deleteRecursive(node.id);
        this.invalidatePathCacheSubtree(parent.id);
    }

    public readDir(path: string): VfsNode[] {
        const node = this.resolvePath(path);
        if (node.type !== VfsNodeType.DIR) {
            throw new VfsError(ErrorCodes.ENOTDIR, `Not a directory: ${path}`);
        }

        const result: VfsNode[] = [];
        for (const childId of node.childrenIds) {
            const child = this.nodes.get(childId);
            if (child) {
                result.push(this.cloneNode(child));
            }
        }

        return result;
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

        if (!systemOverride) {
            this.checkWritePermission(path);
        }

        const now = kernelClock.now();
        node.content = content;
        node.size = this.getByteLength(content);
        node.modifiedAt = now;
        this.invalidatePathCacheSubtree(node.id);
    }

    public getPath(nodeId: string): string {
        const cachedPath = this.pathCache.get(nodeId);
        if (cachedPath) {
            return cachedPath;
        }

        const node = this.nodes.get(nodeId);
        if (!node) {
            throw new VfsError(ErrorCodes.ENOENT, 'Node not found');
        }

        if (node.id === this.rootId) {
            this.pathCache.set(node.id, '/');
            return '/';
        }

        const parts: string[] = [];
        let current: VfsNode | undefined = node;

        while (current && current.parentId) {
            parts.unshift(current.name);
            current = this.nodes.get(current.parentId);
        }

        const path = `/${parts.join('/')}`;
        this.pathCache.set(nodeId, path);
        return path;
    }

    public search(query: string, options: VfsSearchOptions = {}): VfsNode[] {
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) {
            return [];
        }

        const rootPath = this.normalizePath(options.rootPath ?? '/');
        const includeHidden = options.includeHidden ?? true;
        const limit = options.limit ?? 200;

        const tokens = this.tokenizeName(normalizedQuery);
        const candidateIds = this.getCandidateIds(tokens);

        const results: VfsNode[] = [];
        for (const id of candidateIds) {
            const node = this.nodes.get(id);
            if (!node) {
                continue;
            }

            if (!includeHidden && node.name.startsWith('.')) {
                continue;
            }

            if (!node.name.toLowerCase().includes(normalizedQuery)) {
                continue;
            }

            const nodePath = this.getPath(node.id);
            if (!(nodePath === rootPath || nodePath.startsWith(`${rootPath}/`))) {
                continue;
            }

            results.push(this.cloneNode(node));
            if (results.length >= limit) {
                break;
            }
        }

        return results.sort((left, right) => left.name.localeCompare(right.name));
    }

    public listTree(path: string, options: VfsTreeOptions = {}): VfsNode[] {
        const rootNode = this.resolvePath(path);
        if (rootNode.type !== VfsNodeType.DIR) {
            throw new VfsError(ErrorCodes.ENOTDIR, `Not a directory: ${path}`);
        }

        const includeHidden = options.includeHidden ?? false;
        const depthLimit = options.depth ?? 3;
        const result: VfsNode[] = [];
        const stack: Array<{ node: VfsNode; depth: number }> = [{ node: rootNode, depth: 0 }];

        while (stack.length > 0) {
            const current = stack.pop();
            if (!current) {
                continue;
            }

            const { node, depth } = current;
            if (depth > 0) {
                result.push(this.cloneNode(node));
            }

            if (depth >= depthLimit || node.type !== VfsNodeType.DIR) {
                continue;
            }

            const children = node.childrenIds
                .map((id) => this.nodes.get(id))
                .filter((child): child is VfsNode => child !== undefined && child.type === VfsNodeType.DIR)
                .filter((child) => includeHidden || !child.name.startsWith('.'))
                .sort((left, right) => left.name.localeCompare(right.name));

            for (let index = children.length - 1; index >= 0; index -= 1) {
                const child = children[index];
                if (child) {
                    stack.push({ node: child, depth: depth + 1 });
                }
            }
        }

        return result;
    }

    private loadSnapshot(snapshot: VfsSnapshot) {
        this.nodes.clear();
        this.childrenByName.clear();
        this.nameTokenIndex.clear();
        this.pathCache.clear();

        for (const node of snapshot.nodes) {
            this.nodes.set(node.id, this.cloneNode(node));
            this.childrenByName.set(node.id, new Map());
        }

        for (const node of this.nodes.values()) {
            this.addToSearchIndex(node);
            if (!node.parentId) {
                continue;
            }

            const parentIndex = this.childrenByName.get(node.parentId);
            if (parentIndex) {
                parentIndex.set(node.name, node.id);
            }
        }

        this.pathCache.set(this.rootId, '/');
    }

    private cloneNode(node: VfsNode): VfsNode {
        return {
            ...node,
            childrenIds: [...node.childrenIds],
        };
    }

    private generateId(): string {
        return crypto.randomUUID();
    }

    private getByteLength(content: string): number {
        return this.textEncoder.encode(content).length;
    }

    private childExists(parentId: string, name: string): boolean {
        return this.childrenByName.get(parentId)?.has(name) ?? false;
    }

    private isSystemPath(path: string): boolean {
        const normalized = this.normalizePath(path);
        const sysPaths = ['/etc', '/bin', '/usr', '/var'];
        return sysPaths.some((sysPath) => normalized === sysPath || normalized.startsWith(`${sysPath}/`));
    }

    private validateName(name: string): string {
        const cleanName = name.trim();
        if (cleanName.length === 0 || cleanName === '.' || cleanName === '..' || cleanName.includes('/')) {
            throw new VfsError(ErrorCodes.EINVAL, `Invalid name: ${name}`);
        }

        return cleanName;
    }

    private isDescendant(nodeId: string, potentialAncestorId: string): boolean {
        let current = this.nodes.get(nodeId);
        while (current?.parentId) {
            if (current.parentId === potentialAncestorId) {
                return true;
            }
            current = this.nodes.get(current.parentId);
        }

        return false;
    }

    private deleteRecursive(nodeId: string) {
        const node = this.nodes.get(nodeId);
        if (!node) {
            return;
        }

        for (const childId of node.childrenIds) {
            this.deleteRecursive(childId);
        }

        this.removeFromSearchIndex(node);
        this.childrenByName.delete(node.id);
        this.nodes.delete(node.id);
        this.pathCache.delete(node.id);
    }

    private invalidatePathCacheSubtree(nodeId: string) {
        const stack = [nodeId];
        while (stack.length > 0) {
            const currentId = stack.pop();
            if (!currentId) {
                continue;
            }

            this.pathCache.delete(currentId);
            const node = this.nodes.get(currentId);
            if (!node) {
                continue;
            }

            for (const childId of node.childrenIds) {
                stack.push(childId);
            }
        }
    }

    private tokenizeName(value: string): string[] {
        const normalized = value.toLowerCase();
        const tokenSet = new Set<string>();

        if (normalized.length > 0) {
            tokenSet.add(normalized);
        }

        for (const token of normalized.split(/[^a-z0-9]+/i).filter(Boolean)) {
            tokenSet.add(token);
        }

        if (normalized.length >= 3) {
            for (let index = 0; index < normalized.length - 2; index += 1) {
                tokenSet.add(normalized.slice(index, index + 3));
            }
        }

        return Array.from(tokenSet);
    }

    private addToSearchIndex(node: VfsNode) {
        const tokens = this.tokenizeName(node.name);
        for (const token of tokens) {
            const bucket = this.nameTokenIndex.get(token);
            if (bucket) {
                bucket.add(node.id);
            } else {
                this.nameTokenIndex.set(token, new Set([node.id]));
            }
        }
    }

    private removeFromSearchIndex(node: VfsNode) {
        const tokens = this.tokenizeName(node.name);
        for (const token of tokens) {
            const bucket = this.nameTokenIndex.get(token);
            if (!bucket) {
                continue;
            }

            bucket.delete(node.id);
            if (bucket.size === 0) {
                this.nameTokenIndex.delete(token);
            }
        }
    }

    private getCandidateIds(tokens: string[]): Set<string> {
        if (tokens.length === 0) {
            return new Set();
        }

        let current: Set<string> | null = null;
        for (const token of tokens) {
            const ids = this.nameTokenIndex.get(token);
            if (!ids) {
                return new Set();
            }

            if (!current) {
                current = new Set(ids);
                continue;
            }

            for (const id of Array.from(current)) {
                if (!ids.has(id)) {
                    current.delete(id);
                }
            }

            if (current.size === 0) {
                return current;
            }
        }

        return current ?? new Set();
    }
}
