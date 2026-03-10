import { describe, expect, it } from 'vitest';
import { AetherVFS } from './vfsCore';
import { VfsNodeType } from './types';

function seedUserTree(vfs: AetherVFS) {
    vfs.createNode('/', 'home', VfsNodeType.DIR, '', '', true);
    vfs.createNode('/home', 'user', VfsNodeType.DIR, '', '', true);
    vfs.createNode('/home/user', 'Documents', VfsNodeType.DIR, '', '', true);
    vfs.createNode('/home/user', 'Downloads', VfsNodeType.DIR, '', '', true);
    vfs.createNode('/home/user/Documents', 'notes.txt', VfsNodeType.FILE, 'hello world', 'text/plain', true);
}

describe('AetherVFS core operations', () => {
    it('moves files between directories and updates path lookup', () => {
        const vfs = new AetherVFS();
        seedUserTree(vfs);

        vfs.move('/home/user/Documents/notes.txt', '/home/user/Downloads');

        const moved = vfs.resolvePath('/home/user/Downloads/notes.txt');
        expect(moved.name).toBe('notes.txt');
        expect(vfs.readDir('/home/user/Documents').map((entry) => entry.name)).not.toContain('notes.txt');
    });

    it('prevents moving a directory into its own descendant', () => {
        const vfs = new AetherVFS();
        seedUserTree(vfs);

        expect(() => vfs.move('/home/user/Documents', '/home/user/Documents')).toThrow();
    });

    it('copies directories recursively into another directory', () => {
        const vfs = new AetherVFS()
        seedUserTree(vfs)

        vfs.copy('/home/user/Documents', '/home/user/Downloads')

        expect(vfs.resolvePath('/home/user/Downloads/Documents').name).toBe('Documents')
        expect(vfs.readFile('/home/user/Downloads/Documents/notes.txt')).toBe('hello world')
        expect(vfs.readFile('/home/user/Documents/notes.txt')).toBe('hello world')
    })

    it('deletes directories recursively', () => {
        const vfs = new AetherVFS();
        seedUserTree(vfs);

        vfs.delete('/home/user/Documents', true);

        const trashed = vfs.resolvePath('/home/user/.Trash/Documents');
        expect(trashed.name).toBe('Documents');
        expect(trashed.trash?.originalPath).toBe('/home/user/Documents');
        expect(vfs.resolvePath('/home/user/.Trash/Documents/notes.txt').name).toBe('notes.txt');
    });

    it('restores trashed items and resolves name conflicts by keeping both', () => {
        const vfs = new AetherVFS();
        seedUserTree(vfs);

        vfs.delete('/home/user/Documents/notes.txt', true);
        vfs.createNode('/home/user/Documents', 'notes.txt', VfsNodeType.FILE, 'new', 'text/plain', true);
        vfs.createNode('/home/user/Documents', 'notes (restored 1).txt', VfsNodeType.FILE, 'existing', 'text/plain', true);
        const restored = vfs.restoreFromTrash('/home/user/.Trash/notes.txt', 'keep-both', true);

        expect(restored.name).toBe('notes (restored 2).txt');
        expect(restored.trash).toBeNull();
        expect(vfs.resolvePath('/home/user/Documents/notes (restored 2).txt').name).toBe('notes (restored 2).txt');
    });

    it('permanently deletes items from trash', () => {
        const vfs = new AetherVFS();
        seedUserTree(vfs);

        vfs.delete('/home/user/Documents/notes.txt', true);
        vfs.deletePermanently('/home/user/.Trash/notes.txt', true);

        expect(() => vfs.resolvePath('/home/user/.Trash/notes.txt')).toThrow();
    });

    it('restores to home when original parent is missing', () => {
        const vfs = new AetherVFS();
        seedUserTree(vfs);

        vfs.delete('/home/user/Documents/notes.txt', true);
        vfs.deletePermanently('/home/user/Documents', true);
        const restored = vfs.restoreFromTrash('/home/user/.Trash/notes.txt', 'keep-both', true);

        expect(vfs.getPath(restored.id)).toBe('/home/user/notes.txt');
    });

    it('supports indexed search under a root path', () => {
        const vfs = new AetherVFS();
        seedUserTree(vfs);
        vfs.createNode('/home/user/Downloads', 'notes-backup.txt', VfsNodeType.FILE, '', 'text/plain', true);

        const results = vfs.search('notes', { rootPath: '/home/user/Downloads' });

        expect(results.map((entry) => entry.name)).toEqual(['notes-backup.txt']);
    });

    it('restores full state from a snapshot', () => {
        const vfs = new AetherVFS();
        seedUserTree(vfs);

        const snapshot = vfs.getSnapshot();
        vfs.rename('/home/user/Documents/notes.txt', 'draft.txt', true);
        expect(vfs.resolvePath('/home/user/Documents/draft.txt').name).toBe('draft.txt');

        vfs.restoreSnapshot(snapshot);

        expect(vfs.resolvePath('/home/user/Documents/notes.txt').name).toBe('notes.txt');
        expect(() => vfs.resolvePath('/home/user/Documents/draft.txt')).toThrow();
    });
});
