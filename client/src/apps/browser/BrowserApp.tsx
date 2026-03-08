import { useCallback, useEffect, useState } from 'react';
import Window from '../../components/system/Window';
import { useBrowserStore } from '../../stores/browserStore';
import BrowserSidebar from './components/BrowserSidebar';
import ExternalPage from './components/ExternalPage';
import NewTabPage from './components/NewTabPage';
import TabStrip from './components/TabStrip';
import Toasts from './components/Toasts';
import Toolbar from './components/Toolbar';
import WebView from './components/WebView';
import { useBrowserKeyboard } from './hooks/useBrowserKeyboard';
import { useBrowserTabs } from './hooks/useBrowserTabs';

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

    const [focusTrigger, setFocusTrigger] = useState(0);
    const [sidebarMode, setSidebarMode] = useState<'bookmarks' | 'history'>('bookmarks');
    const [sidebarOpen, setSidebarOpen] = useState(false);

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

    const renderContent = () => {
        if (!activeTab) {
            return null;
        }

        switch (activeTab.mode) {
            case 'internal':
                return <NewTabPage onSearch={handleNavigate} bookmarks={bookmarks.slice(-8).reverse()} />;
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
            <div className="flex h-full w-full select-none flex-col overflow-hidden rounded-b-lg text-sm text-slate-800">
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
                />
                <div className="relative flex-1 overflow-hidden">
                    {activeTab?.isLoading && (
                        <div className="absolute left-0 right-0 top-0 z-50 h-0.5">
                            <div className="h-full animate-pulse rounded-r bg-sky-400" style={{ width: '60%' }} />
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
