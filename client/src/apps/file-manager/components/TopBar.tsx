import { useEffect, useState } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    ArrowUp,
    Search,
    FolderPlus,
    FilePlus,
    ArrowUpDown,
    RotateCcw,
    Trash2,
    Copy,
    ClipboardPaste,
    Scissors,
    LayoutGrid,
    List,
    X,
} from 'lucide-react';
import { useClipboardSnapshot } from '../../../features/clipboard';
import { useFsStore } from '../../../stores/fsStore';
import AddressBar from './AddressBar';
import { fileManagerDialogs } from '../dialogStore';

export default function TopBar() {
    const {
        goBack,
        goForward,
        goUp,
        history,
        historyIndex,
        currentPath,
        viewMode,
        setViewMode,
        setSearchQuery,
        searchQuery,
        createFolder,
        createFile,
        sortBy,
        sortDirection,
        setSort,
        isMutating,
        selectedIds,
        restoreItems,
        permanentlyDeleteItems,
        emptyTrash,
        copyItemsToClipboard,
        cutItemsToClipboard,
        pasteClipboard,
    } = useFsStore();
    const clipboard = useClipboardSnapshot();
    const inTrash = currentPath === '/home/user/.Trash';
    const hasFileClipboard = clipboard.payload?.kind === 'files' && clipboard.payload.entries.length > 0;
    const clipboardCount = clipboard.payload?.kind === 'files' ? clipboard.payload.entries.length : 0;

    const canGoBack = historyIndex > 0;
    const canGoForward = historyIndex < history.length - 1;
    const canGoUp = currentPath !== '/';

    const [searchInput, setSearchInput] = useState(searchQuery);

    useEffect(() => {
        setSearchInput(searchQuery);
    }, [searchQuery]);

    const navBtnClass =
        'flex h-7 w-7 items-center justify-center rounded-md border border-hairline/70 bg-canvas/80 text-ink-muted transition-all hover:bg-canvas hover:text-ink hover:border-hairline disabled:opacity-30 disabled:pointer-events-none active:scale-95 shadow-2xs';

    const actionBtnClass =
        'flex h-7 items-center gap-1.5 rounded-md border border-hairline/70 bg-canvas/80 px-2 text-xs font-medium text-ink transition-all hover:bg-canvas hover:border-hairline disabled:opacity-40 disabled:pointer-events-none active:scale-95 shadow-2xs';

    return (
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline bg-parchment/70 px-3 py-2 select-none">
            {/* Left navigation & path */}
            <div className="flex flex-1 items-center gap-2 min-w-[320px]">
                <div className="flex items-center gap-1">
                    <button onClick={goBack} disabled={!canGoBack} className={navBtnClass} title="Back">
                        <ChevronLeft size={16} />
                    </button>
                    <button onClick={goForward} disabled={!canGoForward} className={navBtnClass} title="Forward">
                        <ChevronRight size={16} />
                    </button>
                    <button onClick={goUp} disabled={!canGoUp} className={navBtnClass} title="Enclosing Folder">
                        <ArrowUp size={15} />
                    </button>
                </div>

                <AddressBar />
            </div>

            {/* Right controls: View toggle, Sort, Actions, Search */}
            <div className="flex flex-wrap items-center gap-2 ml-auto">
                {/* View Mode Toggle */}
                <div className="flex h-7 items-center rounded-md border border-hairline/70 bg-canvas/80 p-0.5 shadow-2xs">
                    <button
                        type="button"
                        onClick={() => setViewMode('icons')}
                        className={`flex h-6 w-6 items-center justify-center rounded transition-colors ${
                            viewMode === 'icons'
                                ? 'bg-primary/10 text-primary font-semibold shadow-2xs'
                                : 'text-ink-muted hover:text-ink'
                        }`}
                        title="Grid View (Ctrl+1)"
                    >
                        <LayoutGrid size={14} />
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('details')}
                        className={`flex h-6 w-6 items-center justify-center rounded transition-colors ${
                            viewMode === 'details'
                                ? 'bg-primary/10 text-primary font-semibold shadow-2xs'
                                : 'text-ink-muted hover:text-ink'
                        }`}
                        title="Details View (Ctrl+2)"
                    >
                        <List size={14} />
                    </button>
                </div>

                {/* Sort Dropdown */}
                <div className="flex h-7 items-center gap-1 rounded-md border border-hairline/70 bg-canvas/80 px-2 shadow-2xs">
                    <ArrowUpDown size={12} className="text-ink-muted-48" />
                    <select
                        value={sortBy}
                        onChange={(event) => setSort(event.target.value as typeof sortBy, sortDirection)}
                        className="bg-transparent text-xs text-ink outline-none cursor-pointer"
                    >
                        <option value="name">Name</option>
                        <option value="modified">Modified</option>
                        <option value="type">Type</option>
                        <option value="size">Size</option>
                    </select>
                    <button
                        type="button"
                        onClick={() => setSort(sortBy)}
                        className="ml-1 rounded px-1 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-muted transition-colors hover:bg-black/[0.05]"
                        title="Toggle Sort Direction"
                    >
                        {sortDirection}
                    </button>
                </div>

                {/* Standard Actions (when not in Trash) */}
                {!inTrash && (
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => createFolder('New Folder')}
                            disabled={isMutating}
                            className={actionBtnClass}
                            title="Create New Folder"
                        >
                            <FolderPlus size={14} className="text-primary" />
                            <span className="hidden xl:inline">New Folder</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => createFile('New File.txt', '')}
                            disabled={isMutating}
                            className={actionBtnClass}
                            title="Create New File"
                        >
                            <FilePlus size={14} className="text-ink-muted" />
                            <span className="hidden xl:inline">New File</span>
                        </button>

                        <div className="h-4 w-[1px] bg-hairline mx-0.5" />

                        {/* Clipboard Actions */}
                        <button
                            type="button"
                            onClick={() => copyItemsToClipboard(selectedIds)}
                            disabled={isMutating || selectedIds.length === 0}
                            className={actionBtnClass}
                            title="Copy selected (Ctrl+C)"
                        >
                            <Copy size={13} className="text-ink-muted" />
                            <span className="hidden xl:inline">Copy</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => cutItemsToClipboard(selectedIds)}
                            disabled={isMutating || selectedIds.length === 0}
                            className={actionBtnClass}
                            title="Cut selected (Ctrl+X)"
                        >
                            <Scissors size={13} className="text-ink-muted" />
                            <span className="hidden xl:inline">Cut</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => pasteClipboard()}
                            disabled={isMutating || !hasFileClipboard}
                            className={`${actionBtnClass} ${hasFileClipboard ? 'text-primary' : ''}`}
                            title="Paste clipboard contents (Ctrl+V)"
                        >
                            <ClipboardPaste size={13} />
                            <span className="hidden xl:inline">Paste</span>
                            {clipboardCount > 0 && (
                                <span className="ml-0.5 rounded-full bg-primary/15 px-1 py-0.2 text-[10px] font-bold text-primary">
                                    {clipboardCount}
                                </span>
                            )}
                        </button>
                    </div>
                )}

                {/* Trash Actions (when in Trash) */}
                {inTrash && (
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => restoreItems(selectedIds)}
                            disabled={isMutating || selectedIds.length === 0}
                            className={actionBtnClass}
                            title="Restore Selected Items"
                        >
                            <RotateCcw size={13} className="text-primary" />
                            <span>Restore</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                if (selectedIds.length === 0) return;
                                fileManagerDialogs.confirmPermanentDelete(selectedIds.length, () => {
                                    permanentlyDeleteItems(selectedIds);
                                });
                            }}
                            disabled={isMutating || selectedIds.length === 0}
                            className="flex h-7 items-center gap-1.5 rounded-md border border-hairline/70 bg-canvas/80 px-2 text-xs font-medium text-danger transition-all hover:bg-danger/10 hover:border-danger/30 disabled:opacity-40 disabled:pointer-events-none active:scale-95 shadow-2xs"
                            title="Delete Permanently"
                        >
                            <Trash2 size={13} />
                            <span>Delete</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                fileManagerDialogs.confirmEmptyTrash(() => {
                                    emptyTrash();
                                });
                            }}
                            disabled={isMutating}
                            className="flex h-7 items-center gap-1.5 rounded-md border border-hairline/70 bg-canvas/80 px-2 text-xs font-medium text-danger transition-all hover:bg-danger/10 hover:border-danger/30 disabled:opacity-40 disabled:pointer-events-none active:scale-95 shadow-2xs"
                            title="Empty Trash"
                        >
                            <span>Empty Trash</span>
                        </button>
                    </div>
                )}

                {/* Search Bar */}
                <div className="relative w-44 sm:w-52">
                    <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted-48" />
                    <input
                        type="text"
                        placeholder="Search folder..."
                        value={searchInput}
                        onChange={(event) => {
                            const query = event.target.value;
                            setSearchInput(query);
                            setSearchQuery(query);
                        }}
                        className="h-7 w-full rounded-md border border-hairline/70 bg-canvas/80 pl-8 pr-7 text-xs text-ink placeholder:text-ink-muted-48 shadow-2xs outline-none transition-colors focus:border-primary focus:bg-canvas focus:ring-2 focus:ring-primary/20"
                    />
                    {searchInput && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchInput('');
                                setSearchQuery('');
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-muted-48 hover:text-ink"
                        >
                            <X size={12} />
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}

