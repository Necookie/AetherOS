import { useEffect } from 'react';

interface UseBrowserKeyboardOptions {
    activeTabId: string | null;
    tabOrder: string[];
    newTab: () => void;
    closeTab: (id: string) => void;
    setActiveTab: (id: string) => void;
    back: (id: string) => void;
    forward: (id: string) => void;
    reload: (id: string) => void;
    focusAddressBar: () => void;
}

export function useBrowserKeyboard({
    activeTabId,
    tabOrder,
    newTab,
    closeTab,
    setActiveTab,
    back,
    forward,
    reload,
    focusAddressBar,
}: UseBrowserKeyboardOptions) {
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
                focusAddressBar();
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
    }, [activeTabId, tabOrder, newTab, closeTab, setActiveTab, back, forward, reload, focusAddressBar]);
}
