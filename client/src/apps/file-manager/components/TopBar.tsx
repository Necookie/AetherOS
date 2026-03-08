import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowUp, Search, FolderPlus, FilePlus, ArrowUpDown } from 'lucide-react';
import { useFsStore } from '../../../stores/fsStore';
import AddressBar from './AddressBar';

export default function TopBar() {
    const {
        goBack,
        goForward,
        goUp,
        history,
        historyIndex,
        currentPath,
        setSearchQuery,
        searchQuery,
        createFolder,
        createFile,
        sortBy,
        sortDirection,
        setSort,
        isMutating,
    } = useFsStore();

    const canGoBack = historyIndex > 0;
    const canGoForward = historyIndex < history.length - 1;
    const canGoUp = currentPath !== '/';

    const [searchInput, setSearchInput] = useState(searchQuery);

    useEffect(() => {
        setSearchInput(searchQuery);
    }, [searchQuery]);

    const navBtnClass = 'os-hover-motion rounded p-1 text-slate-300 transition-colors hover:bg-slate-800/70 disabled:opacity-30 disabled:hover:bg-transparent';

    return (
        <div className="os-panel-motion flex flex-wrap items-center gap-2 border-b border-slate-700 bg-slate-900/85 p-2">
            <div className="flex items-center gap-1">
                <button onClick={goBack} disabled={!canGoBack} className={navBtnClass} title="Back">
                    <ChevronLeft size={20} />
                </button>
                <button onClick={goForward} disabled={!canGoForward} className={navBtnClass} title="Forward">
                    <ChevronRight size={20} />
                </button>
                <button onClick={goUp} disabled={!canGoUp} className={`${navBtnClass} ml-1`} title="Up">
                    <ArrowUp size={20} />
                </button>
            </div>

            <AddressBar />

            <div className="flex items-center gap-2 ml-auto">
                <div className="relative w-52">
                    <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search in current folder"
                        value={searchInput}
                        onChange={(event) => {
                            const query = event.target.value;
                            setSearchInput(query);
                            setSearchQuery(query);
                        }}
                        className="w-full rounded border border-slate-700 bg-slate-950 py-1 pl-7 pr-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    />
                </div>

                <div className="flex items-center gap-1 rounded border border-slate-700 bg-slate-950 px-2 py-1">
                    <ArrowUpDown size={14} className="text-slate-400" />
                    <select
                        value={sortBy}
                        onChange={(event) => setSort(event.target.value as typeof sortBy, sortDirection)}
                        className="bg-transparent text-xs text-slate-200 outline-none"
                    >
                        <option value="name">Name</option>
                        <option value="modified">Modified</option>
                        <option value="type">Type</option>
                        <option value="size">Size</option>
                    </select>
                    <button
                        onClick={() => setSort(sortBy)}
                        className="rounded px-1.5 py-0.5 text-xs text-slate-300 hover:bg-slate-800"
                        title="Toggle sort direction"
                    >
                        {sortDirection.toUpperCase()}
                    </button>
                </div>

                <button
                    onClick={() => createFolder('New Folder')}
                    disabled={isMutating}
                    className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800 disabled:opacity-50"
                    title="New folder"
                >
                    <FolderPlus size={14} />
                </button>
                <button
                    onClick={() => createFile('New File.txt', '')}
                    disabled={isMutating}
                    className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800 disabled:opacity-50"
                    title="New file"
                >
                    <FilePlus size={14} />
                </button>
            </div>
        </div>
    );
}
