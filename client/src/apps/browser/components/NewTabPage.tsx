import { useState } from 'react';
import { Search } from 'lucide-react';
import type { BookmarkEntry } from '../../../types/browser';

interface NewTabPageProps {
    onSearch: (query: string) => void;
    bookmarks: BookmarkEntry[];
}

export default function NewTabPage({ onSearch, bookmarks }: NewTabPageProps) {
    const [query, setQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query.trim());
        }
    };

    return (
        <div className="flex h-full w-full select-none flex-col items-center justify-center bg-[radial-gradient(760px_520px_at_12%_14%,#ffd3e8_0%,transparent_65%),radial-gradient(920px_620px_at_88%_22%,#c8e2ff_0%,transparent_62%),radial-gradient(1050px_700px_at_58%_84%,#d6cbff_0%,transparent_70%),linear-gradient(165deg,#cae8ff_0%,#d9d8ff_44%,#ffd7ea_100%)] px-6">
            <div className="mb-8 flex flex-col items-center gap-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-400 text-2xl font-bold text-white shadow-lg">
                    A
                </div>
                <h1 className="text-lg font-semibold tracking-tight text-slate-800">Aether Browser</h1>
            </div>

            <form onSubmit={handleSubmit} className="w-full max-w-md">
                <div className="group relative">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-sky-500" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search the web or enter a URL..."
                        autoFocus
                        className="w-full rounded-lg border border-white/80 bg-white/75 py-3 pl-10 pr-4 text-sm
                            text-slate-800 placeholder-slate-500 shadow-sm
                            transition-all duration-200
                            focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
                    />
                </div>
            </form>

            <p className="mt-4 text-xs text-slate-600">
                Press <kbd className="font-term rounded border border-white/80 bg-white/80 px-1.5 py-0.5 text-[10px] text-slate-700">Enter</kbd> to search
            </p>

            {bookmarks.length > 0 && (
                <div className="mt-8 flex w-full max-w-2xl flex-wrap justify-center gap-2">
                    {bookmarks.map((bookmark) => (
                        <button
                            key={bookmark.id}
                            onClick={() => onSearch(bookmark.url)}
                            className="truncate rounded-full border border-white/80 bg-white/75 px-3 py-1.5 text-xs text-slate-700 transition-colors hover:bg-white"
                            title={bookmark.url}
                        >
                            {bookmark.title}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
