import { useState } from 'react';
import { Search } from 'lucide-react';
import type { BookmarkEntry } from '../../../types/browser';
import type { BrowserDownloadPreset } from '../services/browserDownloadService';

interface NewTabPageProps {
    onSearch: (query: string) => void;
    bookmarks: BookmarkEntry[];
    downloads: BrowserDownloadPreset[]
    onStartDownload: (download: BrowserDownloadPreset) => void
}

export default function NewTabPage({ onSearch, bookmarks, downloads, onStartDownload }: NewTabPageProps) {
    const [query, setQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query.trim());
        }
    };

    return (
        <div className="flex h-full w-full select-none flex-col items-center justify-center bg-parchment px-6">
            <div className="mb-8 flex flex-col items-center gap-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary text-2xl font-bold text-white">
                    A
                </div>
                <h1 className="text-lg font-semibold tracking-tight text-ink">Aether Browser</h1>
            </div>

            <form onSubmit={handleSubmit} className="w-full max-w-md">
                <div className="group relative">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted-48 transition-colors group-focus-within:text-primary" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search the web or enter a URL..."
                        autoFocus
                        className="w-full rounded-pill border border-hairline bg-canvas py-3 pl-11 pr-4 text-sm
                            text-ink placeholder-ink-muted-48
                            transition-colors duration-200
                            focus:border-primary-focus focus:outline-none focus:ring-1 focus:ring-primary-focus"
                    />
                </div>
            </form>

            <p className="mt-4 text-xs text-ink-muted">
                Press <kbd className="font-term rounded-sm border border-hairline bg-canvas px-1.5 py-0.5 text-[10px] text-ink-muted">Enter</kbd> to search
            </p>

            {bookmarks.length > 0 && (
                <div className="mt-8 flex w-full max-w-2xl flex-wrap justify-center gap-2">
                    {bookmarks.map((bookmark) => (
                        <button
                            key={bookmark.id}
                            onClick={() => onSearch(bookmark.url)}
                            className="truncate rounded-pill border border-hairline bg-canvas px-3 py-1.5 text-xs text-ink-muted transition-colors hover:bg-parchment"
                            title={bookmark.url}
                        >
                            {bookmark.title}
                        </button>
                    ))}
                </div>
            )}

            {downloads.length > 0 && (
                <div className="mt-8 w-full max-w-3xl rounded-lg border border-hairline bg-canvas p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-[12px] text-ink-muted">Quick exports</p>
                            <h2 className="mt-1 text-sm font-semibold text-ink">Simulated browser downloads</h2>
                        </div>
                        <span className="rounded-pill bg-[rgba(0,102,204,0.1)] px-3 py-1 text-[12px] font-semibold text-primary">
                            Saves to Downloads
                        </span>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {downloads.map((download) => (
                            <button
                                key={download.id}
                                onClick={() => onStartDownload(download)}
                                className="rounded-lg border border-hairline bg-parchment p-4 text-left transition-colors hover:bg-canvas"
                            >
                                <p className="text-sm font-semibold text-ink">{download.label}</p>
                                <p className="mt-1 text-xs text-ink-muted">{download.description}</p>
                                <p className="mt-3 text-[12px] text-ink-muted-48">{download.fileName}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
