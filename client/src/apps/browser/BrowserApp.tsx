import { useCallback, useEffect, useState } from 'react';
import Window from '../../components/system/Window';
import { useBrowserStore } from '../../stores/browserStore';
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

    const [focusTrigger, setFocusTrigger] = useState(0);

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
                <TabStrip />
                <Toolbar
                    activeTabId={activeTabId}
                    focusTrigger={focusTrigger}
                    onNavigate={handleNavigate}
                />
                <div className="flex-1 relative overflow-hidden">
                    {activeTab?.isLoading && (
                        <div className="absolute top-0 left-0 right-0 h-0.5 z-50">
                            <div className="h-full bg-indigo-400 rounded-r animate-pulse" style={{ width: '60%' }} />
                        </div>
                    )}
                    {renderContent()}
                </div>
                <Toasts toasts={toasts} onDismiss={dismissToast} />
            </div>
        </Window>
    );
}
