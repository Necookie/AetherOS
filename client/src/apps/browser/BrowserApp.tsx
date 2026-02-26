import { useEffect, useState, useCallback } from 'react';
import Window from '../../components/system/Window';
import { useBrowserStore } from '../../stores/browserStore';
import { parseInputToUrl } from './security/urlUtils';
import { isEmbeddableUrl } from './security/embedPolicy';
import TabStrip from './components/TabStrip';
import Toolbar from './components/Toolbar';
import NewTabPage from './components/NewTabPage';
import WebView from './components/WebView';
import ExternalPage from './components/ExternalPage';
import Toasts, { ToastMessage } from './components/Toasts';

export default function BrowserApp({ id }: { id: string }) {
    const activeTabId = useBrowserStore(s => s.activeTabId);
    const tabsById = useBrowserStore(s => s.tabsById);
    const tabOrder = useBrowserStore(s => s.tabOrder);
    const settings = useBrowserStore(s => s.settings);
    const newTab = useBrowserStore(s => s.newTab);
    const closeTab = useBrowserStore(s => s.closeTab);
    const setActiveTab = useBrowserStore(s => s.setActiveTab);
    const back = useBrowserStore(s => s.back);
    const forward = useBrowserStore(s => s.forward);
    const reload = useBrowserStore(s => s.reload);
    const recordHistory = useBrowserStore(s => s.recordHistory);

    const [focusTrigger, setFocusTrigger] = useState(0);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    // Ensure at least one tab exists on mount
    useEffect(() => {
        if (tabOrder.length === 0) {
            newTab();
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Toast helpers
    const addToast = useCallback((message: string, type: ToastMessage['type'] = 'warning') => {
        const id = `toast_${Math.random().toString(36).substring(2, 7)}`;
        setToasts(prev => [...prev, { id, message, type }]);
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    // Core navigation handler
    const handleNavigate = useCallback((input: string) => {
        if (!activeTabId) return;

        const { url, isSearch, isUnsafe } = parseInputToUrl(input, settings.defaultSearchEngine);

        if (isUnsafe) {
            addToast('Blocked: unsafe URL scheme', 'error');
            return;
        }

        if (!url) return;

        if (isSearch || isEmbeddableUrl(url)) {
            // Embed mode — update the tab
            useBrowserStore.setState(state => {
                const tab = state.tabsById[activeTabId];
                if (!tab) return state;
                let hostname = '';
                try { hostname = new URL(url).hostname; } catch { hostname = url; }
                return {
                    tabsById: {
                        ...state.tabsById,
                        [activeTabId]: {
                            ...tab,
                            backStack: tab.url ? [...tab.backStack, tab.url] : tab.backStack,
                            forwardStack: [],
                            url,
                            displayUrl: url,
                            title: isSearch ? `Search — ${input}` : hostname,
                            mode: 'embed',
                            isLoading: true,
                        }
                    }
                };
            });
            recordHistory({ url, title: isSearch ? `Search — ${input}` : url });
        } else {
            // External mode — open real tab + show placeholder
            const win = window.open(url, '_blank', 'noopener,noreferrer');
            if (!win) {
                addToast("Pop-up blocked. Click 'Open again' to retry.", 'warning');
            }

            // Convert/update tab to external mode
            useBrowserStore.setState(state => {
                const tab = state.tabsById[activeTabId];
                if (!tab) return state;
                let hostname = '';
                try { hostname = new URL(url).hostname; } catch { hostname = url; }
                return {
                    tabsById: {
                        ...state.tabsById,
                        [activeTabId]: {
                            ...tab,
                            backStack: tab.url && tab.mode !== 'external' ? [...tab.backStack, tab.url] : tab.backStack,
                            forwardStack: [],
                            url,
                            displayUrl: url,
                            title: hostname,
                            mode: 'external',
                            externalUrl: url,
                            isLoading: false,
                        }
                    }
                };
            });
            recordHistory({ url, title: url });
        }
    }, [activeTabId, settings.defaultSearchEngine, addToast, recordHistory]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only handle shortcuts when this browser window is relevant
            // (in a real OS we'd check focus, here we just handle globally)
            const isCtrl = e.ctrlKey || e.metaKey;

            if (isCtrl && e.key === 't') {
                e.preventDefault();
                newTab();
            } else if (isCtrl && e.key === 'w') {
                e.preventDefault();
                if (activeTabId) closeTab(activeTabId);
            } else if (isCtrl && e.key === 'l') {
                e.preventDefault();
                setFocusTrigger(prev => prev + 1);
            } else if (isCtrl && e.key === 'r') {
                e.preventDefault();
                if (activeTabId) reload(activeTabId);
            } else if (e.ctrlKey && e.key === 'Tab') {
                e.preventDefault();
                // Cycle to next tab
                if (tabOrder.length > 1 && activeTabId) {
                    const idx = tabOrder.indexOf(activeTabId);
                    const nextIdx = (idx + 1) % tabOrder.length;
                    setActiveTab(tabOrder[nextIdx]);
                }
            } else if (e.altKey && e.key === 'ArrowLeft') {
                e.preventDefault();
                if (activeTabId) back(activeTabId);
            } else if (e.altKey && e.key === 'ArrowRight') {
                e.preventDefault();
                if (activeTabId) forward(activeTabId);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeTabId, tabOrder, newTab, closeTab, setActiveTab, back, forward, reload]);

    // Handle iframe load complete
    const handleWebViewLoad = useCallback(() => {
        if (!activeTabId) return;
        useBrowserStore.setState(state => {
            const tab = state.tabsById[activeTabId];
            if (!tab) return state;
            return {
                tabsById: {
                    ...state.tabsById,
                    [activeTabId]: { ...tab, isLoading: false }
                }
            };
        });
    }, [activeTabId]);

    // Handle iframe error — fallback to external
    const handleWebViewError = useCallback((reason: string) => {
        if (!activeTabId) return;
        const tab = tabsById[activeTabId];
        if (!tab) return;

        addToast(`Embed failed (${reason}). Opening externally.`, 'warning');

        // Open externally
        const win = window.open(tab.url, '_blank', 'noopener,noreferrer');
        if (!win) {
            addToast("Pop-up blocked. Click 'Open again' to retry.", 'warning');
        }

        // Convert tab to external mode
        useBrowserStore.setState(state => {
            const t = state.tabsById[activeTabId];
            if (!t) return state;
            return {
                tabsById: {
                    ...state.tabsById,
                    [activeTabId]: {
                        ...t,
                        mode: 'external',
                        externalUrl: t.url,
                        isLoading: false,
                    }
                }
            };
        });
    }, [activeTabId, tabsById, addToast]);

    // Handlers for external page actions
    const handleOpenAgain = useCallback(() => {
        const tab = activeTabId ? tabsById[activeTabId] : null;
        if (!tab?.externalUrl) return;
        const win = window.open(tab.externalUrl, '_blank', 'noopener,noreferrer');
        if (!win) {
            addToast("Pop-up blocked. Click 'Open again' to retry.", 'warning');
        }
    }, [activeTabId, tabsById, addToast]);

    const handleTryEmbed = useCallback(() => {
        if (!activeTabId) return;
        useBrowserStore.setState(state => {
            const tab = state.tabsById[activeTabId];
            if (!tab) return state;
            return {
                tabsById: {
                    ...state.tabsById,
                    [activeTabId]: {
                        ...tab,
                        mode: 'embed',
                        isLoading: true,
                    }
                }
            };
        });
        addToast('Attempting embed — some sites may block this.', 'info');
    }, [activeTabId, addToast]);

    const activeTab = activeTabId ? tabsById[activeTabId] : null;

    // Render the current tab's content
    const renderContent = () => {
        if (!activeTab) return null;

        switch (activeTab.mode) {
            case 'internal':
                return <NewTabPage onSearch={handleNavigate} />;
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
            <div className="flex flex-col h-full w-full bg-white/80 backdrop-blur-md text-gray-800 text-sm select-none font-sans overflow-hidden rounded-b-xl">
                {/* Tab Strip */}
                <TabStrip />

                {/* Toolbar */}
                <Toolbar
                    activeTabId={activeTabId}
                    focusTrigger={focusTrigger}
                    onNavigate={handleNavigate}
                />

                {/* Content Area */}
                <div className="flex-1 relative overflow-hidden">
                    {/* Loading indicator */}
                    {activeTab?.isLoading && (
                        <div className="absolute top-0 left-0 right-0 h-0.5 z-50">
                            <div className="h-full bg-indigo-400 rounded-r animate-pulse" style={{ width: '60%' }} />
                        </div>
                    )}
                    {renderContent()}
                </div>

                {/* Toasts */}
                <Toasts toasts={toasts} onDismiss={dismissToast} />
            </div>
        </Window>
    );
}
