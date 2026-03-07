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
    const navBtnClass = 'os-hover-motion rounded p-1 text-slate-300 transition-colors hover:bg-slate-800/70 disabled:opacity-30 disabled:hover:bg-transparent';

    return (
        <div className="os-panel-motion flex items-center gap-2 border-b border-slate-700 bg-slate-900/85 p-2">
            <div className="flex items-center gap-1">
                <button
                    onClick={goBack}
                    disabled={!canGoBack}
                    className={navBtnClass}
                >
                    <ChevronLeft size={20} />
                </button>
                <button
                    onClick={goForward}
                    disabled={!canGoForward}
                    className={navBtnClass}
                >
                    <ChevronRight size={20} />
                </button>
                <button
                    onClick={goUp}
                    disabled={!canGoUp}
                    className={`${navBtnClass} ml-1`}
                >
                    <ArrowUp size={20} />
                </button>
            </div>

            <AddressBar />

            <form onSubmit={handleSearch} className="relative ml-auto w-48">
                <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchInput}
                    onChange={(e) => {
                        setSearchInput(e.target.value);
                        if (e.target.value === '') setSearchQuery(''); // Live clear
                    }}
                    className="w-full rounded border border-slate-700 bg-slate-950 py-1 pl-7 pr-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
            </form>
        </div>
    );
}
