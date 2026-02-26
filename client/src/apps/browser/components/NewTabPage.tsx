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
        <div className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-b from-white/60 to-gray-100/40 select-none">
            {/* Logo */}
            <div className="mb-8 flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-blue-500 shadow-lg flex items-center justify-center text-white text-2xl font-bold">
                    A
                </div>
                <h1 className="text-lg font-semibold text-gray-700 tracking-tight">Aether Browser</h1>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSubmit} className="w-full max-w-md px-6">
                <div className="relative group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search the web or enter a URL..."
                        autoFocus
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/80 backdrop-blur border border-gray-200/80 shadow-sm
                            text-sm text-gray-800 placeholder-gray-400
                            focus:outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-300
                            transition-all duration-200"
                    />
                </div>
            </form>

            {/* Subtle hint */}
            <p className="mt-4 text-xs text-gray-400">
                Press <kbd className="px-1.5 py-0.5 rounded bg-gray-200/70 text-gray-500 text-[10px] font-mono">Enter</kbd> to search
            </p>
        </div>
    );
}
