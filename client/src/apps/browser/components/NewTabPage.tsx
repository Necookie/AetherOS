import { useState } from 'react';
import { Search } from 'lucide-react';

interface NewTabPageProps {
    onSearch: (query: string) => void;
}

export default function NewTabPage({ onSearch }: NewTabPageProps) {
    const [query, setQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query.trim());
        }
    };

    return (
        <div className="flex h-full w-full select-none flex-col items-center justify-center bg-[radial-gradient(1100px_500px_at_50%_-20%,rgba(99,102,241,0.18),transparent_55%),linear-gradient(180deg,#111827_0%,#0b1222_100%)]">
            <div className="mb-8 flex flex-col items-center gap-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-400 text-2xl font-bold text-white shadow-lg">
                    A
                </div>
                <h1 className="text-lg font-semibold tracking-tight text-slate-100">Aether Browser</h1>
            </div>

            <form onSubmit={handleSubmit} className="w-full max-w-md px-6">
                <div className="relative group">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-indigo-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search the web or enter a URL..."
                        autoFocus
                        className="w-full rounded-lg border border-slate-700 bg-slate-900/90 py-3 pl-10 pr-4 text-sm
                            text-slate-100 placeholder-slate-500 shadow-sm
                            focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30
                            transition-all duration-200"
                    />
                </div>
            </form>

            <p className="mt-4 text-xs text-slate-500">
                Press <kbd className="font-term rounded border border-slate-700 bg-slate-900 px-1.5 py-0.5 text-[10px] text-slate-400">Enter</kbd> to search
            </p>
        </div>
    );
}
