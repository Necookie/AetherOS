import { useCallback, useEffect, useState } from 'react';
import Window from '../../components/system/Window';
import { useBrowserStore } from '../../stores/browserStore';
import {
    resolveBrowserNavigation,
    updateTabForNavigation,
} from './browserNavigation';
import ExternalPage from './components/ExternalPage';
import NewTabPage from './components/NewTabPage';
import TabStrip from './components/TabStrip';
import Toasts, { ToastMessage } from './components/Toasts';
import Toolbar from './components/Toolbar';
import WebView from './components/WebView';

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
    const recordHistory = useBrowserStore((state) => state.recordHistory);

    const [focusTrigger, setFocusTrigger] = useState(0);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    useEffect(() => {
        if (tabOrder.length === 0) {
            newTab();
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const addToast = useCallback((message: string, type: ToastMessage['type'] = 'warning') => {
        const toastId = `toast_${Math.random().toString(36).substring(2, 7)}`;
        setToasts((currentToasts) => [...currentToasts, { id: toastId, message, type }]);
    }, []);

    const dismissToast = useCallback((toastId: string) => {
        setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== toastId));
    }, []);

    const handleNavigate = useCallback((input: string) => {
        if (!activeTabId) {
            return;
        }

        const nextNavigation = resolveBrowserNavigation(input, settings);

        if (nextNavigation.kind === 'blocked') {
            addToast('Blocked: unsafe URL scheme', 'error');
            return;
        }

        if (nextNavigation.kind === 'noop') {
            return;
        }

        if (nextNavigation.kind === 'embed') {
            useBrowserStore.setState((state) => {
                const tab = state.tabsById[activeTabId];
                if (!tab) {
                    return state;
                }

                return {
                    tabsById: {
                        ...state.tabsById,
                        [activeTabId]: updateTabForNavigation(tab, {
                            url: nextNavigation.url,
                            title: nextNavigation.title,
                            mode: 'embed',
                            isLoading: true,
                        }),
                    },
                };
            });

            recordHistory({ url: nextNavigation.url, title: nextNavigation.title });
            return;
        }

        const win = window.open(nextNavigation.url, '_blank', 'noopener,noreferrer');
        if (!win) {
            addToast("Pop-up blocked. Click 'Open again' to retry.", 'warning');
        }

        useBrowserStore.setState((state) => {
            const tab = state.tabsById[activeTabId];
            if (!tab) {
                return state;
            }

            return {
                tabsById: {
                    ...state.tabsById,
                    [activeTabId]: {
                        ...updateTabForNavigation(tab, {
                            url: nextNavigation.url,
                            title: nextNavigation.title,
                            mode: 'external',
                            isLoading: false,
                            externalUrl: nextNavigation.url,
                        }),
                        backStack: tab.url && tab.mode !== 'external' ? [...tab.backStack, tab.url] : tab.backStack,
                    },
                },
            };
        });

        recordHistory({ url: nextNavigation.url, title: nextNavigation.url });
    }, [activeTabId, settings, addToast, recordHistory]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const isCtrl = e.ctrlKey || e.metaKey;

            if (isCtrl && e.key === 't') {
                e.preventDefault();
                newTab();
            } else if (isCtrl && e.key === 'w') {
                e.preventDefault();
                if (activeTabId) {
                    closeTab(activeTabId);
                }
            } else if (isCtrl && e.key === 'l') {
                e.preventDefault();
                setFocusTrigger((currentValue) => currentValue + 1);
            } else if (isCtrl && e.key === 'r') {
                e.preventDefault();
                if (activeTabId) {
                    reload(activeTabId);
                }
            } else if (e.ctrlKey && e.key === 'Tab') {
                e.preventDefault();
                if (tabOrder.length > 1 && activeTabId) {
                    const currentIndex = tabOrder.indexOf(activeTabId);
                    const nextIndex = (currentIndex + 1) % tabOrder.length;
                    setActiveTab(tabOrder[nextIndex]);
                }
            } else if (e.altKey && e.key === 'ArrowLeft') {
                e.preventDefault();
                if (activeTabId) {
                    back(activeTabId);
                }
            } else if (e.altKey && e.key === 'ArrowRight') {
                e.preventDefault();
                if (activeTabId) {
                    forward(activeTabId);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeTabId, tabOrder, newTab, closeTab, setActiveTab, back, forward, reload]);

    const handleWebViewLoad = useCallback(() => {
        if (!activeTabId) {
            return;
        }

        useBrowserStore.setState((state) => {
            const tab = state.tabsById[activeTabId];
            if (!tab) {
                return state;
            }

            return {
                tabsById: {
                    ...state.tabsById,
                    [activeTabId]: { ...tab, isLoading: false },
                },
            };
        });
    }, [activeTabId]);

    const handleWebViewError = useCallback((reason: string) => {
        if (!activeTabId) {
            return;
        }

        const tab = tabsById[activeTabId];
        if (!tab) {
            return;
        }

        addToast(`Embed failed (${reason}). Opening externally.`, 'warning');

        const win = window.open(tab.url, '_blank', 'noopener,noreferrer');
        if (!win) {
            addToast("Pop-up blocked. Click 'Open again' to retry.", 'warning');
        }

        useBrowserStore.setState((state) => {
            const currentTab = state.tabsById[activeTabId];
            if (!currentTab) {
                return state;
            }

            return {
                tabsById: {
                    ...state.tabsById,
                    [activeTabId]: {
                        ...currentTab,
                        mode: 'external',
                        externalUrl: currentTab.url,
                        isLoading: false,
                    },
                },
            };
        });
    }, [activeTabId, tabsById, addToast]);

    const handleOpenAgain = useCallback(() => {
        const tab = activeTabId ? tabsById[activeTabId] : null;
        if (!tab?.externalUrl) {
            return;
        }

        const win = window.open(tab.externalUrl, '_blank', 'noopener,noreferrer');
        if (!win) {
            addToast("Pop-up blocked. Click 'Open again' to retry.", 'warning');
        }
    }, [activeTabId, tabsById, addToast]);

    const handleTryEmbed = useCallback(() => {
        if (!activeTabId) {
            return;
        }

        useBrowserStore.setState((state) => {
            const tab = state.tabsById[activeTabId];
            if (!tab) {
                return state;
            }

            return {
                tabsById: {
                    ...state.tabsById,
                    [activeTabId]: {
                        ...tab,
                        mode: 'embed',
                        isLoading: true,
                    },
                },
            };
        });

        addToast('Attempting embed — some sites may block this.', 'info');
    }, [activeTabId, addToast]);

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
