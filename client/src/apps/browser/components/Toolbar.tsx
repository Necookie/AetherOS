import { Bookmark, ChevronLeft, ChevronRight, Cloud, CloudOff, History, RotateCw } from 'lucide-react';
import { useBrowserStore } from '../../../stores/browserStore';
import AddressBar from './AddressBar';

interface ToolbarProps {
    activeTabId: string | null;
    focusTrigger: number;
    onNavigate: (input: string) => void;
    onToggleBookmarks: () => void;
    onToggleHistory: () => void;
}

export default function Toolbar({
    activeTabId,
    focusTrigger,
    onNavigate,
    onToggleBookmarks,
    onToggleHistory,
}: ToolbarProps) {
    const tabsById = useBrowserStore((s) => s.tabsById);
    const bookmarks = useBrowserStore((s) => s.bookmarks);
    const back = useBrowserStore((s) => s.back);
    const forward = useBrowserStore((s) => s.forward);
    const reload = useBrowserStore((s) => s.reload);
    const toggleBookmark = useBrowserStore((s) => s.toggleBookmark);
    const connectivity = useBrowserStore((s) => s.connectivity);
    const setConnectivityOnline = useBrowserStore((s) => s.setConnectivityOnline);
    const setConnectivityLatency = useBrowserStore((s) => s.setConnectivityLatency);

    const tab = activeTabId ? tabsById[activeTabId] : null;
    const canGoBack = tab ? tab.backStack.length > 0 : false;
    const canGoForward = tab ? tab.forwardStack.length > 0 : false;
    const isBookmarked = tab?.url ? bookmarks.some((entry) => entry.url === tab.url) : false;

    const navBtnClass = (enabled: boolean) =>
        `rounded-sm p-1.5 transition-transform ${enabled ? 'text-ink hover:bg-canvas active:scale-95' : 'cursor-default text-ink-muted-48'}`;

    const iconBtnClass =
        'rounded-sm p-1.5 text-ink-muted transition-colors hover:bg-canvas hover:text-ink';

    return (
        <div className="flex items-center gap-1 border-b border-hairline bg-parchment px-2 py-1.5">
            <button className={navBtnClass(canGoBack)} onClick={() => activeTabId && canGoBack && back(activeTabId)} disabled={!canGoBack}>
                <ChevronLeft className="h-4 w-4" />
            </button>
            <button className={navBtnClass(canGoForward)} onClick={() => activeTabId && canGoForward && forward(activeTabId)} disabled={!canGoForward}>
                <ChevronRight className="h-4 w-4" />
            </button>
            <button className={navBtnClass(!!activeTabId)} onClick={() => activeTabId && reload(activeTabId)}>
                <RotateCw className="h-3.5 w-3.5" />
            </button>

            <AddressBar
                displayUrl={tab?.displayUrl || ''}
                onSubmit={onNavigate}
                focusTrigger={focusTrigger}
            />

            <button
                className={`${iconBtnClass} ${isBookmarked ? 'text-primary hover:text-primary' : ''}`}
                onClick={() => tab?.url && toggleBookmark({ url: tab.url, title: tab.title || tab.url })}
                disabled={!tab?.url}
                title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
                <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>

            <button className={iconBtnClass} onClick={onToggleBookmarks} title="Bookmarks">
                <Bookmark className="h-3.5 w-3.5" />
            </button>
            <button className={iconBtnClass} onClick={onToggleHistory} title="History">
                <History className="h-3.5 w-3.5" />
            </button>

            <button
                className={`${iconBtnClass} ${connectivity.online ? 'text-success' : 'text-danger'}`}
                onClick={() => setConnectivityOnline(!connectivity.online)}
                title={connectivity.online ? 'Go offline' : 'Go online'}
            >
                {connectivity.online ? <Cloud className="h-3.5 w-3.5" /> : <CloudOff className="h-3.5 w-3.5" />}
            </button>

            <select
                aria-label="Latency"
                value={connectivity.latencyMs}
                onChange={(event) => setConnectivityLatency(Number(event.target.value))}
                className="rounded-sm border border-hairline bg-canvas px-1.5 py-1 text-[12px] text-ink-muted focus:border-primary-focus focus:outline-none"
            >
                <option value={0}>0ms</option>
                <option value={200}>200ms</option>
                <option value={600}>600ms</option>
                <option value={1200}>1200ms</option>
            </select>
        </div>
    );
}
