import { Bookmark, History, Pin, X } from 'lucide-react';
import type { BookmarkEntry, HistoryEntry } from '../../../types/browser';

interface BrowserSidebarProps {
    open: boolean;
    mode: 'bookmarks' | 'history';
    bookmarks: BookmarkEntry[];
    history: HistoryEntry[];
    onClose: () => void;
    onSelectUrl: (url: string) => void;
}

function formatTime(timestamp: number) {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function BrowserSidebar({
    open,
    mode,
    bookmarks,
    history,
    onClose,
    onSelectUrl,
}: BrowserSidebarProps) {
    if (!open) {
        return null;
    }

    const items = mode === 'bookmarks' ? bookmarks : [...history].reverse().slice(0, 40);

    return (
        <aside className="absolute right-2 top-2 z-20 flex h-[calc(100%-1rem)] w-72 flex-col rounded-xl border border-white/75 bg-white/90 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/70 px-3 py-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-700">
                    {mode === 'bookmarks' ? <Bookmark className="h-3.5 w-3.5" /> : <History className="h-3.5 w-3.5" />}
                    {mode}
                </div>
                <button
                    onClick={onClose}
                    className="rounded-md p-1 text-slate-500 transition-colors hover:bg-white hover:text-slate-800"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto px-2 py-2">
                {items.length === 0 && (
                    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-3 text-xs text-slate-500">
                        No {mode} yet.
                    </div>
                )}
                <div className="space-y-1.5">
                    {items.map((item) => {
                        const title = item.title || item.url;
                        const meta = 'createdAt' in item ? formatTime(item.createdAt) : formatTime(item.timestamp);
                        return (
                            <button
                                key={'id' in item ? item.id : `${item.timestamp}-${item.url}`}
                                onClick={() => onSelectUrl(item.url)}
                                className="group flex w-full items-start gap-2 rounded-lg border border-transparent bg-white/65 p-2 text-left transition-colors hover:border-sky-200 hover:bg-white"
                            >
                                <Pin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-400 group-hover:text-sky-500" />
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-xs font-medium text-slate-700">{title}</span>
                                    <span className="block truncate text-[11px] text-slate-500">{item.url}</span>
                                </span>
                                <span className="text-[10px] text-slate-400">{meta}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </aside>
    );
}
