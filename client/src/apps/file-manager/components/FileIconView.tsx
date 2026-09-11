import { Home, Monitor, FileText, Download, Image as Img, Trash2, Folder as LucideFolder } from 'lucide-react';
import { VfsNodeType } from '../../../vfs/types';

interface FileIconProps {
    type: VfsNodeType;
    name: string;
    path?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

// Map extensions to metadata
function getFileExtensionMeta(name: string) {
    const ext = name.includes('.') ? name.split('.').pop()?.toLowerCase() ?? '' : '';

    switch (ext) {
        case 'ts':
        case 'tsx':
            return { label: 'TS', bg: 'bg-blue-600', text: 'text-white', category: 'code' };
        case 'js':
        case 'jsx':
            return { label: 'JS', bg: 'bg-amber-500', text: 'text-black', category: 'code' };
        case 'json':
            return { label: '{ }', bg: 'bg-emerald-600', text: 'text-white', category: 'code' };
        case 'html':
            return { label: '</>', bg: 'bg-orange-600', text: 'text-white', category: 'code' };
        case 'css':
            return { label: 'CSS', bg: 'bg-sky-500', text: 'text-white', category: 'code' };
        case 'py':
            return { label: 'PY', bg: 'bg-indigo-600', text: 'text-white', category: 'code' };
        case 'sh':
        case 'bash':
            return { label: '>_', bg: 'bg-stone-700', text: 'text-white', category: 'code' };
        case 'md':
            return { label: 'MD', bg: 'bg-slate-700', text: 'text-white', category: 'doc' };
        case 'txt':
        case 'text':
            return { label: 'TXT', bg: 'bg-stone-500', text: 'text-white', category: 'doc' };
        case 'pdf':
            return { label: 'PDF', bg: 'bg-rose-600', text: 'text-white', category: 'doc' };
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'svg':
        case 'webp':
        case 'gif':
            return { label: 'IMG', bg: 'bg-teal-600', text: 'text-white', category: 'image' };
        case 'mp3':
        case 'wav':
        case 'ogg':
            return { label: 'AUD', bg: 'bg-purple-600', text: 'text-white', category: 'audio' };
        case 'mp4':
        case 'webm':
        case 'mkv':
            return { label: 'VID', bg: 'bg-red-600', text: 'text-white', category: 'video' };
        case 'zip':
        case 'tar':
        case 'gz':
            return { label: 'ZIP', bg: 'bg-yellow-600', text: 'text-white', category: 'archive' };
        default:
            return { label: ext ? ext.slice(0, 3).toUpperCase() : 'DOC', bg: 'bg-stone-400', text: 'text-white', category: 'generic' };
    }
}

// Check if folder is a special known directory
function getSpecialFolderGlyph(name: string, path?: string) {
    const checkStr = (path ?? name).toLowerCase();
    if (checkStr.includes('desktop')) return <Monitor className="text-white/90" size={14} />;
    if (checkStr.includes('document')) return <FileText className="text-white/90" size={14} />;
    if (checkStr.includes('download')) return <Download className="text-white/90" size={14} />;
    if (checkStr.includes('picture')) return <Img className="text-white/90" size={14} />;
    if (checkStr.includes('.trash') || checkStr.includes('trash')) return <Trash2 className="text-white/90" size={14} />;
    if (checkStr.endsWith('/home/user') || name === 'user' || name === 'Home') return <Home className="text-white/90" size={14} />;
    return null;
}

export function FileIconView({ type, name, path, size = 'lg', className = '' }: FileIconProps) {
    const isDir = type === VfsNodeType.DIR;

    if (isDir) {
        const specialGlyph = getSpecialFolderGlyph(name, path);

        if (size === 'sm') {
            return (
                <div className={`relative flex items-center justify-center text-primary ${className}`}>
                    <LucideFolder size={16} fill="currentColor" fillOpacity={0.25} />
                </div>
            );
        }

        if (size === 'md') {
            return (
                <div className={`relative flex items-center justify-center text-primary ${className}`}>
                    <LucideFolder size={22} fill="currentColor" fillOpacity={0.25} />
                </div>
            );
        }

        // Large icon (for grid)
        return (
            <div className={`relative flex h-14 w-16 items-center justify-center drop-shadow-xs select-none ${className}`}>
                <svg viewBox="0 0 64 52" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Back Tab */}
                    <path
                        d="M4 10C4 7.79086 5.79086 6 8 6H24.5C26.0913 6 27.6174 6.63214 28.7426 7.75736L31.5 10.5147C32.6253 11.6399 34.1513 12.2721 35.7426 12.2721H56C58.2091 12.2721 60 14.063 60 16.2721V42C60 44.2091 58.2091 46 56 46H8C5.79086 46 4 44.2091 4 42V10Z"
                        fill="#0052a3"
                    />
                    {/* Inner Paper Sheet Peak */}
                    <rect x="10" y="10" width="44" height="12" rx="2" fill="#eae7df" />
                    {/* Front Flap */}
                    <path
                        d="M4 17C4 14.7909 5.79086 13 8 13H56C58.2091 13 60 14.7909 60 17V42C60 45.3137 57.3137 48 54 48H10C6.68629 48 4 45.3137 4 42V17Z"
                        fill="#0066cc"
                    />
                    {/* Front Flap Subtle Highlight Line */}
                    <path
                        d="M6 17C6 15.3431 7.34315 14 9 14H55C56.6569 14 58 15.3431 58 17V18H6V17Z"
                        fill="white"
                        fillOpacity="0.15"
                    />
                </svg>

                {/* Special Icon Badge inside folder */}
                {specialGlyph && (
                    <div className="absolute inset-0 flex items-center justify-center pt-3 pointer-events-none">
                        {specialGlyph}
                    </div>
                )}
            </div>
        );
    }

    // File rendering
    const meta = getFileExtensionMeta(name);

    if (size === 'sm') {
        return (
            <div className={`relative flex items-center justify-center ${className}`}>
                <div className="flex h-4 w-3.5 items-center justify-center rounded-[2px] border border-hairline bg-white shadow-2xs">
                    <span className="text-[7px] font-bold tracking-tighter text-ink-muted">
                        {meta.label.slice(0, 2)}
                    </span>
                </div>
            </div>
        );
    }

    if (size === 'md') {
        return (
            <div className={`relative flex items-center justify-center ${className}`}>
                <div className="flex h-5 w-4.5 flex-col items-center justify-between rounded-[2px] border border-hairline bg-white p-0.5 shadow-xs">
                    <div className="h-0.5 w-full rounded-[1px] bg-slate-200" />
                    <span className={`w-full rounded-[1px] ${meta.bg} ${meta.text} py-0.2 text-center text-[7px] font-semibold leading-tight`}>
                        {meta.label.slice(0, 2)}
                    </span>
                </div>
            </div>
        );
    }

    // Large file icon (for grid)
    return (
        <div className={`relative flex h-14 w-12 items-center justify-center drop-shadow-xs select-none ${className}`}>
            <svg viewBox="0 0 48 56" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Document Base */}
                <path
                    d="M4 6C4 3.79086 5.79086 2 8 2H32L44 14V50C44 52.2091 42.2091 54 40 54H8C5.79086 54 4 52.2091 4 50V6Z"
                    fill="#FFFFFF"
                    stroke="#DCD8CF"
                    strokeWidth="1.5"
                />
                {/* Dog-ear Fold Corner */}
                <path
                    d="M32 2V12C32 13.1046 32.8954 14 34 14H44"
                    fill="#F7F6F2"
                    stroke="#DCD8CF"
                    strokeWidth="1.5"
                />
                {/* Document preview lines */}
                <rect x="10" y="18" width="18" height="2.5" rx="1" fill="#EAE7DF" />
                <rect x="10" y="24" width="28" height="2.5" rx="1" fill="#EAE7DF" />
                <rect x="10" y="30" width="24" height="2.5" rx="1" fill="#EAE7DF" />
            </svg>

            {/* Extension Badge */}
            <div
                className={`absolute bottom-2.5 left-1/2 -translate-x-1/2 rounded-[3px] px-1.5 py-0.5 text-[9px] font-bold tracking-tight shadow-xs ${meta.bg} ${meta.text}`}
            >
                {meta.label}
            </div>
        </div>
    );
}

// Utility to format timestamps realistically for user-facing UI
export function formatFileTimestamp(ts: number): string {
    if (!ts || ts === 0) return 'Just now';

    const now = Date.now();
    let date: Date;

    if (ts > 1000000000000) {
        // Unix ms timestamp
        date = new Date(ts);
    } else if (ts > 1000000000) {
        // Unix seconds timestamp
        date = new Date(ts * 1000);
    } else {
        // Relative simulation tick / performance.now()
        const secondsAgo = Math.min(Math.floor(ts / 10), 3600 * 24);
        date = new Date(now - secondsAgo * 1000);
    }

    const isToday = date.toDateString() === new Date().toDateString();
    if (isToday) {
        return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}
