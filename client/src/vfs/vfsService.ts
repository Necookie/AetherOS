import { AetherVFS } from './vfsCore';
import { VfsNodeType } from './types';

export const vfs = new AetherVFS();

function mkdirP(path: string) {
    const parts = path.split('/').filter(Boolean);
    let current = '/';
    for (const part of parts) {
        try {
            vfs.resolvePath(current === '/' ? `/${part}` : `${current}/${part}`);
        } catch (e: any) {
            if (e.code === 'ENOENT') {
                vfs.createNode(current, part, VfsNodeType.DIR, '', '', true); // true for systemOverride
            }
        }
        current = current === '/' ? `/${part}` : `${current}/${part}`;
    }
}

function touch(path: string, content: string = '') {
    const parts = path.split('/').filter(Boolean);
    const parent = '/' + parts.slice(0, -1).join('/');
    const name = parts[parts.length - 1];
    mkdirP(parent);
    try {
        vfs.createNode(parent, name, VfsNodeType.FILE, content, '', true);
    } catch (e: any) {
        if (e.code !== 'EEXIST') throw e;
    }
}

// System required paths
mkdirP('/etc');
touch('/etc/hosts', '127.0.0.1 localhost\n::1 localhost');

mkdirP('/var/log');
touch('/var/log/system.log', 'Kernel started...\nVFS initialized.\n');

// User space
mkdirP('/home/user/Desktop');
mkdirP('/home/user/Documents');
mkdirP('/home/user/Downloads');
mkdirP('/home/user/Pictures');
mkdirP('/home/user/.config/aether');

// User files
touch('/home/user/Documents/readme.txt', 'Welcome to AetherOS!\nEnjoy the deterministic filesystem.');
touch('/home/user/.bashrc', '# ~/.bashrc\nexport PS1="\\u@aether:\\w\\$ "');
touch('/home/user/.config/aether/settings.json', '{\n  "theme": "dark"\n}');

// Extra drives mapping
mkdirP('/data'); // represents D:
