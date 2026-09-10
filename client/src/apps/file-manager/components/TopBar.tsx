import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowUp, Search, FolderPlus, FilePlus, ArrowUpDown, RotateCcw, Trash2, Copy, ClipboardPaste, Scissors } from 'lucide-react';
import { useClipboardSnapshot } from '../../../features/clipboard';
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
        selectedIds,
        restoreItems,
        permanentlyDeleteItems,
        emptyTrash,
        copyItemsToClipboard,
        cutItemsToClipboard,
        pasteClipboard,
    } = useFsStore();
    const clipboard = useClipboardSnapshot()
    const inTrash = currentPath === '/home/user/.Trash';
    const hasFileClipboard = clipboard.payload?.kind === 'files' && clipboard.payload.entries.length > 0

    const canGoBack = historyIndex > 0;
    const canGoForward = historyIndex < history.length - 1;
    const canGoUp = currentPath !== '/';

    const [searchInput, setSearchInput] = useState(searchQuery);

    useEffect(() => {
        setSearchInput(searchQuery);
    }, [searchQuery]);

    const navBtnClass = 'rounded-sm p-1 text-ink-muted transition-colors hover:bg-parchment disabled:opacity-30 disabled:hover:bg-transparent';

    return (
        <div className="flex flex-wrap items-center gap-2 border-b border-hairline bg-parchment p-2">
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
                    <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-ink-muted-48" />
                    <input
                        type="text"
                        placeholder="Search in current folder"
                        value={searchInput}
                        onChange={(event) => {
                            const query = event.target.value;
                            setSearchInput(query);
                            setSearchQuery(query);
                        }}
                        className="w-full rounded-pill border border-hairline bg-canvas py-1 pl-7 pr-2 text-sm text-ink placeholder:text-ink-muted-48 focus:border-primary-focus focus:outline-none focus:ring-1 focus:ring-primary-focus"
                    />
                </div>

                <div className="flex items-center gap-1 rounded-sm border border-hairline bg-canvas px-2 py-1">
                    <ArrowUpDown size={14} className="text-ink-muted" />
                    <select
                        value={sortBy}
                        onChange={(event) => setSort(event.target.value as typeof sortBy, sortDirection)}
                        className="bg-transparent text-xs text-ink outline-none"
                    >
                        <option value="name">Name</option>
                        <option value="modified">Modified</option>
                        <option value="type">Type</option>
                        <option value="size">Size</option>
                    </select>
                    <button
                        onClick={() => setSort(sortBy)}
                        className="rounded-sm px-1.5 py-0.5 text-xs text-ink-muted transition-colors hover:bg-parchment"
                        title="Toggle sort direction"
                    >
                        {sortDirection.toUpperCase()}
                    </button>
                </div>

                <button
                    onClick={() => copyItemsToClipboard(selectedIds)}
                    disabled={isMutating || inTrash || selectedIds.length === 0}
                    className="rounded-sm border border-hairline bg-canvas px-2 py-1 text-xs text-ink transition-colors hover:bg-parchment disabled:opacity-50"
                    title="Copy"
                >
                    <Copy size={14} />
                </button>
                <button
                    onClick={() => cutItemsToClipboard(selectedIds)}
                    disabled={isMutating || inTrash || selectedIds.length === 0}
                    className="rounded-sm border border-hairline bg-canvas px-2 py-1 text-xs text-ink transition-colors hover:bg-parchment disabled:opacity-50"
                    title="Cut"
                >
                    <Scissors size={14} />
                </button>
                <button
                    onClick={() => pasteClipboard()}
                    disabled={isMutating || inTrash || !hasFileClipboard}
                    className="rounded-sm border border-hairline bg-canvas px-2 py-1 text-xs text-ink transition-colors hover:bg-parchment disabled:opacity-50"
                    title="Paste into current folder"
                >
                    <ClipboardPaste size={14} />
                </button>
                <button
                    onClick={() => createFolder('New Folder')}
                    disabled={isMutating || inTrash}
                    className="rounded-sm border border-hairline bg-canvas px-2 py-1 text-xs text-ink transition-colors hover:bg-parchment disabled:opacity-50"
                    title="New folder"
                >
                    <FolderPlus size={14} />
                </button>
                <button
                    onClick={() => createFile('New File.txt', '')}
                    disabled={isMutating || inTrash}
                    className="rounded-sm border border-hairline bg-canvas px-2 py-1 text-xs text-ink transition-colors hover:bg-parchment disabled:opacity-50"
                    title="New file"
                >
                    <FilePlus size={14} />
                </button>
                {inTrash && (
                    <>
                        <button
                            onClick={() => restoreItems(selectedIds)}
                            disabled={isMutating || selectedIds.length === 0}
                            className="rounded-sm border border-hairline bg-canvas px-2 py-1 text-xs text-ink transition-colors hover:bg-parchment disabled:opacity-50"
                            title="Restore selected"
                        >
                            <RotateCcw size={14} />
                        </button>
                        <button
                            onClick={() => {
                                if (selectedIds.length === 0) {
                                    return;
                                }
                                if (confirm(`Permanently delete ${selectedIds.length} item(s)? This cannot be undone.`)) {
                                    permanentlyDeleteItems(selectedIds);
                                }
                            }}
                            disabled={isMutating || selectedIds.length === 0}
                            className="rounded-sm border border-hairline bg-canvas px-2 py-1 text-xs text-danger transition-colors hover:bg-parchment disabled:opacity-50"
                            title="Delete permanently"
                        >
                            <Trash2 size={14} />
                        </button>
                        <button
                            onClick={() => {
                                if (confirm('Empty Trash permanently? This cannot be undone.')) {
                                    emptyTrash();
                                }
                            }}
                            disabled={isMutating}
                            className="rounded-sm border border-hairline bg-canvas px-2 py-1 text-xs text-danger transition-colors hover:bg-parchment disabled:opacity-50"
                            title="Empty trash"
                        >
                            Empty Trash
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
