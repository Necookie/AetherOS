import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, Copy, Download, FolderOpen, Minus, X } from 'lucide-react'
import Window from '../../components/system/Window';
import { DEFAULT_APPS } from '../../config/windows'
import { useFsStore } from '../../stores/fsStore'
import { useBrowserStore } from '../../stores/browserStore';
import { useWindowStore } from '../../stores/windowStore'
import { useDownloadManagerSnapshot } from '../../features/downloads'
import BrowserSidebar from './components/BrowserSidebar';
import ExternalPage from './components/ExternalPage';
import NewTabPage from './components/NewTabPage';
import SearchResultsPage from './components/SearchResultsPage';
import SimulatedPage from './components/SimulatedPage';
import TabStrip from './components/TabStrip';
import Toasts from './components/Toasts';
import Toolbar from './components/Toolbar';
import WebView from './components/WebView';
import { useBrowserKeyboard } from './hooks/useBrowserKeyboard';
import { useBrowserTabs } from './hooks/useBrowserTabs';
import { createResultNavigationUrl, createSimulatedPageModel, getSimulatedResultById, mergeSearchResults, type SimulatedSearchResult } from './simulation/searchSimulation';
import { parseSimulationUrl } from './simulation/simulationUrls';
import { browserDownloadPresets } from './services/browserDownloadService'
import { querySearch, type BrowserSearchResponse } from '../../services/searchClient';

const explorerApp = DEFAULT_APPS.find((app) => app.id === 'explorer')
const downloadsApp = DEFAULT_APPS.find((app) => app.id === 'downloads')

function getParentPath(path: string) {
    const normalized = path.replace(/\\/g, '/')
    const segments = normalized.split('/').filter(Boolean)
    if (segments.length <= 1) {
        return '/'
    }

    return `/${segments.slice(0, -1).join('/')}`
}

export default function BrowserApp({ id }: { id: string }) {
    const activeTabId = useBrowserStore((state) => state.activeTabId);
    const tabsById = useBrowserStore((state) => state.tabsById);
    const tabOrder = useBrowserStore((state) => state.tabOrder);
    const settings = useBrowserStore((state) => state.settings);
    const newTab = useBrowserStore((state) => state.newTab);
    const closeTab = useBrowserStore((state) => state.closeTab);
    const setActiveTab = useBrowserStore((state) => state.setActiveTab);
    const back = useBrowserStore((state) => state.back);
    const forward = useBrowserStore((state) => state.forward);
    const reload = useBrowserStore((state) => state.reload);
    const bookmarks = useBrowserStore((state) => state.bookmarks);
    const historyGlobal = useBrowserStore((state) => state.historyGlobal);
    const revealPath = useFsStore((state) => state.revealPath)
    const openWindow = useWindowStore((state) => state.openWindow)
    const downloadSnapshot = useDownloadManagerSnapshot()

    const [focusTrigger, setFocusTrigger] = useState(0);
    const [sidebarMode, setSidebarMode] = useState<'bookmarks' | 'history'>('bookmarks');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchResponse, setSearchResponse] = useState<BrowserSearchResponse | null>(null)
    const [searchError, setSearchError] = useState<string | null>(null)
    const [searchPending, setSearchPending] = useState(false)

    useEffect(() => {
        if (tabOrder.length === 0) {
            newTab();
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const {
        toasts,
        dismissToast,
        handleNavigate,
        handleWebViewLoad,
        handleWebViewError,
        handleOpenAgain,
        handleTryEmbed,
        handleTriggerDownload,
        pushToast,
    } = useBrowserTabs(activeTabId, settings);

    useBrowserKeyboard({
        activeTabId,
        tabOrder,
        newTab,
        closeTab,
        setActiveTab,
        back,
        forward,
        reload,
        focusAddressBar: useCallback(() => setFocusTrigger((v) => v + 1), []),
    });

    const activeTab = activeTabId ? tabsById[activeTabId] : null;
    const browserDownloads = downloadSnapshot.items
        .filter((item) => item.source === 'browser' && item.status !== 'canceled')
        .slice(0, 3)

    const [downloadsDismissed, setDownloadsDismissed] = useState(false);
    const [downloadsMinimized, setDownloadsMinimized] = useState(false);
    const prevDownloadsCountRef = useRef(browserDownloads.length);

    useEffect(() => {
        if (browserDownloads.length > prevDownloadsCountRef.current) {
            setDownloadsDismissed(false);
            setDownloadsMinimized(false);
        }
        prevDownloadsCountRef.current = browserDownloads.length;
    }, [browserDownloads.length]);

    const simulationLocation = activeTab ? parseSimulationUrl(activeTab.url) : null
    const simulationQuery = simulationLocation?.query ?? ''

    const resolvedSearch = useMemo(() => mergeSearchResults({
        query: simulationQuery,
        response: searchResponse,
        bookmarks,
        history: historyGlobal,
    }), [bookmarks, historyGlobal, searchResponse, simulationQuery])
    const searchResults = resolvedSearch.results

    const handleOpenSimulatedResult = useCallback((result: SimulatedSearchResult, query: string) => {
        void handleNavigate(createResultNavigationUrl(result, query))
    }, [handleNavigate])

    useEffect(() => {
        if (!simulationQuery) {
            setSearchResponse(null)
            setSearchError(null)
            setSearchPending(false)
            return
        }

        let cancelled = false
        setSearchPending(true)
        void querySearch(simulationQuery)
            .then((response) => {
                if (!cancelled) {
                    setSearchResponse(response)
                    setSearchError(null)
                }
            })
            .catch((error) => {
                if (!cancelled) {
                    setSearchResponse(null)
                    setSearchError(error instanceof Error ? error.message : 'Search request failed.')
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setSearchPending(false)
                }
            })

        return () => {
            cancelled = true
        }
    }, [simulationQuery])

    const handleCopyPath = useCallback(async (path: string) => {
        try {
            await navigator.clipboard.writeText(path)
            pushToast('Path copied to clipboard.', 'info')
        } catch {
            pushToast('Could not copy the file path.', 'error')
        }
    }, [pushToast])

    const renderContent = () => {
        if (!activeTab) {
            return null;
        }

        switch (activeTab.mode) {
            case 'internal':
                {
                    if (simulationLocation?.kind === 'search') {
                        return (
                            <SearchResultsPage
                                query={simulationLocation.query}
                                mode={resolvedSearch.mode}
                                results={searchResults}
                                isLoading={searchPending}
                                error={searchError}
                                onSearch={handleNavigate}
                                onOpenResult={(result) => handleOpenSimulatedResult(result, simulationLocation.query)}
                            />
                        )
                    }

                    if (simulationLocation?.kind === 'result') {
                        const selectedResult = searchResults.find((result) => (
                            result.id === simulationLocation.id
                            && result.targetUrl === simulationLocation.targetUrl
                        )) ?? getSimulatedResultById({
                            query: simulationLocation.query,
                            id: simulationLocation.id,
                            targetUrl: simulationLocation.targetUrl,
                            bookmarks,
                            history: historyGlobal,
                        })

                        if (selectedResult) {
                            return (
                                <SimulatedPage
                                    page={createSimulatedPageModel(selectedResult, simulationLocation.query)}
                                    relatedResults={searchResults.filter((result) => result.id !== selectedResult.id).slice(0, 4)}
                                    onOpenResult={(result) => handleOpenSimulatedResult(result, simulationLocation.query)}
                                />
                            )
                        }
                    }

                return (
                    <NewTabPage
                        onSearch={handleNavigate}
                        bookmarks={bookmarks.slice(-8).reverse()}
                        downloads={browserDownloadPresets}
                        onStartDownload={handleTriggerDownload}
                    />
                );
                }
            case 'embed':
                return (
                    <WebView
                        url={activeTab.url}
                        onLoad={handleWebViewLoad}
                        onError={handleWebViewError}
                    />
                );
            case 'external':
                return (
                    <ExternalPage
                        url={activeTab.externalUrl || activeTab.url}
                        onOpenAgain={handleOpenAgain}
                        onTryEmbed={handleTryEmbed}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <Window id={id} title="Aether Browser">
            <div className="flex h-full w-full select-none flex-col overflow-hidden bg-canvas text-sm text-ink">
                <TabStrip />
                <Toolbar
                    activeTabId={activeTabId}
                    focusTrigger={focusTrigger}
                    onNavigate={handleNavigate}
                    onToggleBookmarks={() => {
                        setSidebarMode('bookmarks');
                        setSidebarOpen((open) => (sidebarMode === 'bookmarks' ? !open : true));
                    }}
                    onToggleHistory={() => {
                        setSidebarMode('history');
                        setSidebarOpen((open) => (sidebarMode === 'history' ? !open : true));
                    }}
                    hasDownloads={browserDownloads.length > 0}
                    isDownloadsOpen={!downloadsDismissed}
                    onToggleDownloads={() => {
                        if (downloadsDismissed) {
                            setDownloadsDismissed(false);
                            setDownloadsMinimized(false);
                        } else {
                            setDownloadsDismissed(true);
                        }
                    }}
                />
                <div className="relative flex-1 overflow-hidden">
                    {activeTab?.isLoading && (
                        <div className="absolute left-0 right-0 top-0 z-50 h-0.5">
                            <div className="h-full animate-pulse rounded-r bg-primary" style={{ width: '60%' }} />
                        </div>
                    )}
                    {browserDownloads.length > 0 && !downloadsDismissed && downloadsMinimized && (
                        <div className="pointer-events-none absolute right-4 top-4 z-40">
                            <div className="pointer-events-auto flex items-center gap-2 rounded-lg border border-white/10 bg-tile-1 px-3 py-1.5 text-on-dark shadow-xl backdrop-blur-md">
                                <button
                                    type="button"
                                    onClick={() => setDownloadsMinimized(false)}
                                    className="flex items-center gap-2 text-xs font-medium text-on-dark transition-opacity hover:opacity-80"
                                    title="Click to expand transfers"
                                >
                                    <div className="rounded bg-tile-2 p-1 text-primary-on-dark">
                                        <Download className="h-3.5 w-3.5" />
                                    </div>
                                    <span>
                                        {browserDownloads.length} {browserDownloads.length === 1 ? 'transfer' : 'transfers'}
                                    </span>
                                </button>
                                <div className="h-3 w-[1px] bg-white/10" />
                                <div className="flex items-center gap-0.5">
                                    <button
                                        type="button"
                                        onClick={() => setDownloadsMinimized(false)}
                                        className="rounded p-1 text-on-dark-muted transition-colors hover:bg-tile-2 hover:text-on-dark"
                                        title="Expand"
                                        aria-label="Expand transfers"
                                    >
                                        <ChevronDown className="h-3 w-3" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDownloadsDismissed(true)}
                                        className="rounded p-1 text-on-dark-muted transition-colors hover:bg-tile-2 hover:text-on-dark"
                                        title="Close"
                                        aria-label="Close transfers"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {browserDownloads.length > 0 && !downloadsDismissed && !downloadsMinimized && (
                        <div className="pointer-events-none absolute right-4 top-4 z-40 w-[min(24rem,calc(100%-2rem))]">
                            <div className="pointer-events-auto rounded-lg border border-white/10 bg-tile-1 p-3 text-on-dark shadow-xl">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-2">
                                        <div className="rounded-lg bg-tile-2 p-2 text-primary-on-dark shrink-0">
                                            <Download className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs uppercase tracking-[0.18em] text-on-dark-muted">Browser transfers</p>
                                            <p className="truncate text-sm font-semibold text-on-dark">
                                                {browserDownloads.some((d) => d.status === 'downloading' || d.status === 'queued')
                                                    ? 'Downloads in progress'
                                                    : 'Downloads completed'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-1">
                                        {downloadsApp ? (
                                            <button
                                                type="button"
                                                onClick={() => openWindow(downloadsApp)}
                                                className="rounded-pill border border-white/10 bg-tile-2 px-2.5 py-1 text-[11px] font-semibold text-on-dark transition-transform hover:bg-tile-3 active:scale-95"
                                            >
                                                Open manager
                                            </button>
                                        ) : null}
                                        <button
                                            type="button"
                                            onClick={() => setDownloadsMinimized(true)}
                                            className="rounded-sm p-1 text-on-dark-muted transition-colors hover:bg-tile-2 hover:text-on-dark active:scale-90"
                                            title="Minimize"
                                            aria-label="Minimize transfers"
                                        >
                                            <Minus className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDownloadsDismissed(true)}
                                            className="rounded-sm p-1 text-on-dark-muted transition-colors hover:bg-tile-2 hover:text-on-dark active:scale-90"
                                            title="Close"
                                            aria-label="Close transfers"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-3 space-y-2">
                                    {browserDownloads.map((item) => {
                                        const progress = Math.min(100, Math.round((item.receivedBytes / item.totalBytes) * 100))
                                        return (
                                            <div key={item.id} className="rounded-lg border border-white/10 bg-tile-2 p-3">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-semibold text-on-dark">{item.fileName}</p>
                                                        <p className="mt-1 truncate text-xs text-on-dark-muted">{item.destinationPath}</p>
                                                    </div>
                                                    {item.status === 'complete' ? (
                                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                                                    ) : item.status === 'failed' ? (
                                                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                                                    ) : (
                                                        <span className="text-xs text-primary-on-dark">{progress}%</span>
                                                    )}
                                                </div>

                                                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-tile-1">
                                                    <div
                                                        className={`h-full rounded-full transition-[width] duration-500 ${
                                                            item.status === 'complete'
                                                                ? 'bg-success'
                                                                : item.status === 'failed'
                                                                    ? 'bg-danger'
                                                                    : 'bg-primary-on-dark'
                                                        }`}
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>

                                                {item.status === 'complete' && explorerApp ? (
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        <button
                                                            onClick={() => {
                                                                openWindow(explorerApp)
                                                                revealPath(item.destinationPath)
                                                            }}
                                                            className="rounded-pill border border-white/10 bg-tile-2 px-3 py-1 text-[12px] font-semibold text-on-dark transition-transform active:scale-95"
                                                        >
                                                            <span className="inline-flex items-center gap-1">
                                                                <FolderOpen className="h-3 w-3" />
                                                                Open file
                                                            </span>
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                openWindow(explorerApp)
                                                                revealPath(getParentPath(item.destinationPath))
                                                            }}
                                                            className="rounded-pill border border-white/10 bg-tile-2 px-3 py-1 text-[12px] font-semibold text-on-dark transition-transform active:scale-95"
                                                        >
                                                            Open folder
                                                        </button>
                                                        <button
                                                            onClick={() => void handleCopyPath(item.destinationPath)}
                                                            className="rounded-pill border border-white/10 bg-tile-2 px-3 py-1 text-[12px] font-semibold text-on-dark transition-transform active:scale-95"
                                                        >
                                                            <span className="inline-flex items-center gap-1">
                                                                <Copy className="h-3 w-3" />
                                                                Copy path
                                                            </span>
                                                        </button>
                                                    </div>
                                                ) : item.status === 'failed' ? (
                                                    <p className="mt-3 text-xs text-danger">{item.errorMessage ?? 'The file could not be written to Downloads.'}</p>
                                                ) : null}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                    {renderContent()}
                    <BrowserSidebar
                        open={sidebarOpen}
                        mode={sidebarMode}
                        bookmarks={bookmarks}
                        history={historyGlobal}
                        onClose={() => setSidebarOpen(false)}
                        onSelectUrl={(url) => {
                            setSidebarOpen(false);
                            void handleNavigate(url);
                        }}
                    />
                </div>
                <Toasts toasts={toasts} onDismiss={dismissToast} />
            </div>
        </Window>
    );
}
