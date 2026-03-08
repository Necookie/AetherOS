import type { BrowserSessionState } from '../../../../types/browser';
import { getKernelTime } from '../../../../lib/kernelClock';

export function createInitialSessionState(): BrowserSessionState {
    return {
        lastActiveTabId: null,
        lastNavigationAt: null,
    };
}

export function markTabActivated(
    session: BrowserSessionState,
    activeTabId: string | null,
): BrowserSessionState {
    return {
        ...session,
        lastActiveTabId: activeTabId,
    };
}

export function markNavigation(
    _session: BrowserSessionState,
    activeTabId: string | null,
): BrowserSessionState {
    return {
        lastActiveTabId: activeTabId,
        lastNavigationAt: getKernelTime(),
    };
}
