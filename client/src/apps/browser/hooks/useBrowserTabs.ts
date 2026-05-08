import { useCallback, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import { useBrowserStore } from '../../../stores/browserStore';
import {
    resolveBrowserNavigation,
    updateTabForNavigation,
} from '../browserNavigation';
import type { ToastMessage } from '../components/Toasts';
import type { BrowserSettings } from '../../../types/browser';
import { browserConnectivityService } from '../services/browserServices';
import {
    resolveBrowserDownload,
    startBrowserDownload,
    type BrowserDownloadRequest,
} from '../services/browserDownloadService';
import { parseInputToUrl } from '../security/urlUtils';
import { buildSimulationSearchUrl, isSimulationUrl, parseSimulationUrl } from '../simulation/simulationUrls';

function nextToken(tokens: MutableRefObject<Map<string, number>>, tabId: string) {
    const current = tokens.current.get(tabId) || 0;
    const next = current + 1;
    tokens.current.set(tabId, next);
    return next;
}

function isLatestToken(tokens: MutableRefObject<Map<string, number>>, tabId: string, token: number) {
    return tokens.current.get(tabId) === token;
}

export function useBrowserTabs(activeTabId: string | null, settings: BrowserSettings) {
    const tabsById = useBrowserStore((state) => state.tabsById);
    const connectivity = useBrowserStore((state) => state.connectivity);
    const recordHistory = useBrowserStore((state) => state.recordHistory);

    const requestTokensRef = useRef<Map<string, number>>(new Map());
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = useCallback((message: string, type: ToastMessage['type'] = 'warning') => {
        const toastId = `toast_${Math.random().toString(36).substring(2, 7)}`;
        setToasts((currentToasts) => [...currentToasts, { id: toastId, message, type }]);
    }, []);

    const dismissToast = useCallback((toastId: string) => {
        setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== toastId));
    }, []);

    const handleNavigate = useCallback(async (input: string) => {
        if (!activeTabId) {
            return;
        }

        const parsedInput = parseInputToUrl(input, settings.defaultSearchEngine);
        if (parsedInput.isUnsafe) {
            addToast('Blocked: unsafe URL scheme', 'error');
            return;
        }

        if (!parsedInput.url) {
            return;
        }

        if (parsedInput.isSearch) {
            const internalSearchUrl = buildSimulationSearchUrl(input);
            useBrowserStore.setState((state) => {
                const tab = state.tabsById[activeTabId];
                if (!tab) {
                    return state;
                }

                return {
                    tabsById: {
                        ...state.tabsById,
                        [activeTabId]: updateTabForNavigation(tab, {
                            url: internalSearchUrl,
                            title: `Search - ${input.trim()}`,
                            mode: 'internal',
                            isLoading: false,
                        }),
                    },
                };
            });

            recordHistory({ url: internalSearchUrl, title: `Search - ${input.trim()}` });
            return;
        }

        if (isSimulationUrl(parsedInput.url)) {
            const simulationLocation = parseSimulationUrl(parsedInput.url);
            if (!simulationLocation) {
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
                        [activeTabId]: updateTabForNavigation(tab, {
                            url: parsedInput.url,
                            title: simulationLocation.kind === 'search'
                                ? `Search - ${simulationLocation.query}`
                                : simulationLocation.targetUrl,
                            mode: 'internal',
                            isLoading: false,
                        }),
                    },
                };
            });

            recordHistory({
                url: parsedInput.url,
                title: simulationLocation.kind === 'search'
                    ? `Search - ${simulationLocation.query}`
                    : simulationLocation.targetUrl,
            });
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

        const requestToken = nextToken(requestTokensRef, activeTabId);

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
                        isLoading: true,
                        displayUrl: nextNavigation.url,
                    },
                },
            };
        });

        try {
            const connectivityResult = await browserConnectivityService.resolveNavigation({
                url: nextNavigation.url,
                title: nextNavigation.title,
                mode: nextNavigation.kind,
                connectivity,
            });

            if (!isLatestToken(requestTokensRef, activeTabId, requestToken)) {
                return;
            }

            if (connectivityResult.servedOffline) {
                addToast('Offline mode: loaded from cache', 'info');
            }

            const downloadRequest = resolveBrowserDownload(nextNavigation.url);
            if (downloadRequest) {
                startBrowserDownload(downloadRequest);
                addToast(`Downloading ${downloadRequest.fileName}...`, 'info');

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
                                title: downloadRequest.fileName,
                                displayUrl: nextNavigation.url,
                                isLoading: false,
                                lastError: undefined,
                            },
                        },
                    };
                });

                recordHistory({
                    url: nextNavigation.url,
                    title: `Download: ${downloadRequest.fileName}`,
                });
                return;
            }

            if (nextNavigation.kind === 'external' && connectivity.online) {
                const win = window.open(nextNavigation.url, '_blank', 'noopener,noreferrer');
                if (!win) {
                    addToast("Pop-up blocked. Click 'Open again' to retry.", 'warning');
                }
            }

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
                            mode: connectivityResult.mode,
                            isLoading: connectivityResult.mode === 'embed',
                            externalUrl: connectivityResult.mode === 'external'
                                ? nextNavigation.url
                                : undefined,
                        }),
                    },
                };
            });

            recordHistory({ url: nextNavigation.url, title: nextNavigation.title });
        } catch (error) {
            if (!isLatestToken(requestTokensRef, activeTabId, requestToken)) {
                return;
            }

            const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
            if (message === 'NETWORK_OFFLINE_NO_CACHE') {
                addToast('Offline and no cached page is available for this URL.', 'error');
            } else {
                addToast('Navigation failed. Please try again.', 'error');
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
                            isLoading: false,
                            lastError: message,
                        },
                    },
                };
            });
        }
    }, [activeTabId, settings, addToast, recordHistory, connectivity]);

    const handleTriggerDownload = useCallback((request: BrowserDownloadRequest) => {
        startBrowserDownload(request);
        addToast(`Downloading ${request.fileName}...`, 'info');
        recordHistory({
            url: request.sourceUrl,
            title: `Download: ${request.fileName}`,
        });
    }, [addToast, recordHistory]);

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

        addToast('Attempting embed - some sites may block this.', 'info');
    }, [activeTabId, addToast]);

    return {
        toasts,
        dismissToast,
        handleNavigate,
        handleWebViewLoad,
        handleWebViewError,
        handleOpenAgain,
        handleTryEmbed,
        handleTriggerDownload,
        pushToast: addToast,
    };
}
