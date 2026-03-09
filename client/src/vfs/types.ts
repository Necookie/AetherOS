export enum VfsNodeType {
    DIR = 'DIR',
    FILE = 'FILE',
    SYMLINK = 'SYMLINK',
}

export interface VfsTrashMetadata {
    originalPath: string;
    deletedAt: number;
}

export interface VfsNode {
    id: string;
    type: VfsNodeType;
    name: string;
    parentId: string | null;
    createdAt: number;
    modifiedAt: number;
    owner: string;
    group: string;
    mode: number;
    size: number;
    mime: string;
    content: string;
    childrenIds: string[];
    trash: VfsTrashMetadata | null;
}

export interface VfsSnapshot {
    rootId: string;
    nodes: VfsNode[];
}

export interface VfsSearchOptions {
    rootPath?: string;
    includeHidden?: boolean;
    limit?: number;
}

export interface VfsTreeOptions {
    depth?: number;
    includeHidden?: boolean;
}

export type VfsRestoreConflictStrategy = 'keep-both' | 'overwrite';

export class VfsError extends Error {
    public readonly code: string;

    constructor(code: string, message: string = '') {
        super(`[${code}] ${message}`);
        this.name = 'VfsError';
        this.code = code;
    }
}

export const ErrorCodes = {
    ENOENT: 'ENOENT',
    EEXIST: 'EEXIST',
    EPERM: 'EPERM',
    ENOTDIR: 'ENOTDIR',
    EISDIR: 'EISDIR',
    EINVAL: 'EINVAL',
} as const;
