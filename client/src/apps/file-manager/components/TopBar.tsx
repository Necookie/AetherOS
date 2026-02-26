import React, { useState } from 'react';
import { useFsStore } from '../../../stores/fsStore';
import { ChevronLeft, ChevronRight, ArrowUp, Search } from 'lucide-react';
import AddressBar from './AddressBar';

export default function TopBar() {
    const { goBack, goForward, goUp, history, historyIndex, currentPath, setSearchQuery } = useFsStore();
    const canGoBack = historyIndex > 0;
    const canGoForward = historyIndex < history.length - 1;
    const canGoUp = currentPath !== '/';

    const [searchInput, setSearchInput] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchQuery(searchInput);
    };

    return (
        <div className="flex items-center gap-2 p-2 bg-[#27272a] border-b border-[#3f3f46]">
            <div className="flex items-center gap-1">
                <button
                    onClick={goBack}
                    disabled={!canGoBack}
                    className="p-1 rounded hover:bg-white/10 text-gray-300 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                    <ChevronLeft size={20} />
                </button>
                <button
                    onClick={goForward}
                    disabled={!canGoForward}
                    className="p-1 rounded hover:bg-white/10 text-gray-300 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                    <ChevronRight size={20} />
                </button>
                <button
                    onClick={goUp}
                    disabled={!canGoUp}
                    className="p-1 rounded hover:bg-white/10 text-gray-300 disabled:opacity-30 disabled:hover:bg-transparent ml-1"
                >
                    <ArrowUp size={20} />
                </button>
            </div>

            <AddressBar />

            <form onSubmit={handleSearch} className="relative ml-auto w-48">
                <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchInput}
                    onChange={(e) => {
                        setSearchInput(e.target.value);
                        if (e.target.value === '') setSearchQuery(''); // Live clear
                    }}
                    className="w-full bg-[#1e1e24] border border-[#3f3f46] text-sm pl-7 pr-2 py-1 rounded text-gray-200 focus:outline-none focus:border-blue-500"
                />
            </form>
        </div>
    );
}
