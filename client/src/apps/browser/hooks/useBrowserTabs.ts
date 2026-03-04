import { useCallback, useState } from 'react';
import { useBrowserStore } from '../../../stores/browserStore';
import {
    resolveBrowserNavigation,
    updateTabForNavigation,
} from '../browserNavigation';
import type { ToastMessage } from '../components/Toasts';
import type { BrowserSettings } from '../../../types/browser';

export function useBrowserTabs(activeTabId: string | null, settings: BrowserSettings) {
    const tabsById = useBrowserStore((state) => state.tabsById);
    const recordHistory = useBrowserStore((state) => state.recordHistory);

    const [toasts, setToasts] = useState<ToastMessage[]>([]);

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

    return {
        toasts,
        dismissToast,
        handleNavigate,
        handleWebViewLoad,
        handleWebViewError,
        handleOpenAgain,
        handleTryEmbed,
    };
}
