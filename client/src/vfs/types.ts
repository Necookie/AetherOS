export enum VfsNodeType {
    DIR = 'DIR',
    FILE = 'FILE',
    SYMLINK = 'SYMLINK'
}

export interface VfsNode {
    id: string;
    type: VfsNodeType;
    name: string;
    parentId: string | null;  // null for Root
    createdAt: number;        // from kernelClock.now()
    modifiedAt: number;       // from kernelClock.now()
    owner: string;
    group: string;
    mode: number;             // e.g., 0o755
    size: number;
    mime: string;
    content: string;          // string for now
    childrenIds: string[];    // only relevant for DIR
}

export class VfsError extends Error {
    constructor(public code: string, message: string = '') {
        super(`[${code}] ${message}`);
        this.name = 'VfsError';
    }
}

export const ErrorCodes = {
    ENOENT: 'ENOENT',   // No such file or directory
    EEXIST: 'EEXIST',   // File exists
    EPERM: 'EPERM',     // Operation not permitted
    ENOTDIR: 'ENOTDIR', // Not a directory
    EISDIR: 'EISDIR',   // Is a directory
    EINVAL: 'EINVAL',   // Invalid argument
} as const;
