import { AetherVFS } from './vfsCore';
import { VfsNodeType, type VfsNode, type VfsRestoreConflictStrategy, type VfsSnapshot, type VfsSearchOptions, type VfsTreeOptions } from './types';
import { getScopedStorageKey, onActiveUserChange } from '../features/accounts/services/userScope';

const PERSIST_KEY = 'aether.vfs.snapshot.v1';

class VfsService {
    private vfs: AetherVFS;

    constructor() {
        const persisted = this.loadPersistedSnapshot();
        this.vfs = persisted ? new AetherVFS(persisted) : new AetherVFS();

        if (!persisted) {
            this.seedDefaults();
            this.persist();
        }

        onActiveUserChange(() => {
            this.loadForActiveUser();
        });
    }

    public getRootId(): string {
        return this.vfs.getRootId();
    }

    public getNodes(): Record<string, VfsNode> {
        return this.vfs.getNodes();
    }

    public getNodeById(id: string): VfsNode | null {
        return this.vfs.getNodeById(id);
    }

    public normalizePath(path: string): string {
        return this.vfs.normalizePath(path);
    }

    public resolvePath(path: string): VfsNode {
        return this.vfs.resolvePath(path);
    }

    public readDir(path: string): VfsNode[] {
        return this.vfs.readDir(path);
    }

    public readFile(path: string): string {
        return this.vfs.readFile(path);
    }

    public writeFile(path: string, content: string, systemOverride = false) {
        this.vfs.writeFile(path, content, systemOverride);
        this.persist();
    }

    public createNode(
        parentPath: string,
        name: string,
        type: VfsNodeType,
        content: string = '',
        mime: string = '',
        systemOverride: boolean = false,
    ) {
        const node = this.vfs.createNode(parentPath, name, type, content, mime, systemOverride);
        this.persist();
        return node;
    }

    public rename(path: string, newName: string, systemOverride = false) {
        const node = this.vfs.rename(path, newName, systemOverride);
        this.persist();
        return node;
    }

    public move(sourcePath: string, destinationDirectoryPath: string, newName?: string, systemOverride = false) {
        const node = this.vfs.move(sourcePath, destinationDirectoryPath, newName, systemOverride);
        this.persist();
        return node;
    }

    public delete(path: string, systemOverride = false) {
        this.vfs.delete(path, systemOverride);
        this.persist();
    }

    public restoreFromTrash(path: string, conflictStrategy: VfsRestoreConflictStrategy = 'keep-both', systemOverride = false) {
        const node = this.vfs.restoreFromTrash(path, conflictStrategy, systemOverride);
        this.persist();
        return node;
    }

    public deletePermanently(path: string, systemOverride = false) {
        this.vfs.deletePermanently(path, systemOverride);
        this.persist();
    }

    public emptyTrash(systemOverride = false) {
        this.vfs.emptyTrash(systemOverride);
        this.persist();
    }

    public listTrash(): VfsNode[] {
        return this.vfs.listTrash();
    }

    public getPath(nodeId: string): string {
        return this.vfs.getPath(nodeId);
    }

    public search(query: string, options: VfsSearchOptions = {}): VfsNode[] {
        return this.vfs.search(query, options);
    }

    public listTree(path: string, options: VfsTreeOptions = {}): VfsNode[] {
        return this.vfs.listTree(path, options);
    }

    public createSnapshot(): VfsSnapshot {
        return this.vfs.getSnapshot();
    }

    public restoreSnapshot(snapshot: VfsSnapshot) {
        this.vfs.restoreSnapshot(snapshot);
        this.persist();
    }

    public resetToDefaults() {
        this.vfs = new AetherVFS();
        this.seedDefaults();
        this.persist();
    }

    private loadForActiveUser() {
        const persisted = this.loadPersistedSnapshot();
        this.vfs = persisted ? new AetherVFS(persisted) : new AetherVFS();

        if (!persisted) {
            this.seedDefaults();
            this.persist();
        }
    }

    private seedDefaults() {
        this.mkdirP('/etc');
        this.touch('/etc/hosts', '127.0.0.1 localhost\n::1 localhost');

        this.mkdirP('/var/log');
        this.touch('/var/log/system.log', 'Kernel started...\nVFS initialized.\n');

        this.mkdirP('/home/user/Desktop');
        this.mkdirP('/home/user/Documents');
        this.mkdirP('/home/user/Downloads');
        this.mkdirP('/home/user/Pictures');
        this.mkdirP('/home/user/.config/aether');
        this.mkdirP('/home/user/.Trash');

        this.touch('/home/user/Documents/readme.txt', 'Welcome to AetherOS!\nEnjoy the deterministic filesystem.');
        this.touch('/home/user/.bashrc', '# ~/.bashrc\nexport PS1="\\u@aether:\\w\\$ "');
        this.touch('/home/user/.config/aether/settings.json', '{\n  "theme": "dark"\n}');

        this.mkdirP('/data');
    }

    private mkdirP(path: string) {
        const parts = path.split('/').filter(Boolean);
        let current = '/';

        for (const part of parts) {
            const next = current === '/' ? `/${part}` : `${current}/${part}`;
            try {
                this.vfs.resolvePath(next);
            } catch {
                this.vfs.createNode(current, part, VfsNodeType.DIR, '', '', true);
            }
            current = next;
        }
    }

    private touch(path: string, content: string = '') {
        const parts = path.split('/').filter(Boolean);
        if (parts.length === 0) {
            return;
        }

        const parent = `/${parts.slice(0, -1).join('/')}`;
        const name = parts[parts.length - 1];
        this.mkdirP(parent);

        try {
            this.vfs.createNode(parent, name, VfsNodeType.FILE, content, '', true);
        } catch {
            this.vfs.writeFile(path, content, true);
        }
    }

    private persist() {
        if (typeof window === 'undefined' || !window.localStorage) {
            return;
        }

        try {
            const serialized = JSON.stringify(this.vfs.getSnapshot());
            window.localStorage.setItem(getScopedStorageKey(PERSIST_KEY), serialized);
        } catch {
            // Ignore persistence failures and keep runtime state active.
        }
    }

    private loadPersistedSnapshot(): VfsSnapshot | null {
        if (typeof window === 'undefined' || !window.localStorage) {
            return null;
        }

        const serialized = window.localStorage.getItem(getScopedStorageKey(PERSIST_KEY));
        if (!serialized) {
            return null;
        }

        try {
            const snapshot = JSON.parse(serialized) as VfsSnapshot;
            if (!snapshot || !Array.isArray(snapshot.nodes) || typeof snapshot.rootId !== 'string') {
                return null;
            }
            return snapshot;
        } catch {
            return null;
        }
    }
}

export const fsService = new VfsService();
