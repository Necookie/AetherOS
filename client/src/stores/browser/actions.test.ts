import { describe, expect, it } from 'vitest';
import { createBrowserActions } from './actions';
import { initialBrowserStoreState } from './initialState';
import type { BrowserStore } from './types';

type StoreSet = (
    partial:
        | BrowserStore
        | Partial<BrowserStore>
        | ((state: BrowserStore) => BrowserStore | Partial<BrowserStore>),
    replace?: boolean,
) => void;

function createHarness() {
    let state = { ...initialBrowserStoreState } as BrowserStore;

    const set: StoreSet = (partial) => {
        const next = typeof partial === 'function' ? partial(state) : partial;
        state = {
            ...state,
            ...next,
        };
    };

    const get = () => state;
    const actions = createBrowserActions(set, get);
    state = {
        ...state,
        ...actions,
    };

    return {
        getState: () => state,
    };
}

describe('browser tab management actions', () => {
    it('keeps one tab alive when the last tab is closed', () => {
        const harness = createHarness();
        const state = harness.getState();

        state.newTab();
        const onlyTabId = harness.getState().activeTabId;
        expect(onlyTabId).toBeTruthy();
        if (!onlyTabId) {
            return;
        }

        state.closeTab(onlyTabId);

        const next = harness.getState();
        expect(next.tabOrder).toHaveLength(1);
        expect(next.activeTabId).toBe(next.tabOrder[0]);
    });

    it('activates the previous tab when closing the active tab', () => {
        const harness = createHarness();
        const state = harness.getState();

        state.newTab({ url: 'https://first.com', mode: 'embed' });
        const firstId = harness.getState().activeTabId!;
        state.newTab({ url: 'https://second.com', mode: 'embed' });
        const secondId = harness.getState().activeTabId!;
        state.newTab({ url: 'https://third.com', mode: 'embed' });
        const thirdId = harness.getState().activeTabId!;

        expect(harness.getState().tabOrder).toEqual([firstId, secondId, thirdId]);
        state.closeTab(thirdId);
        expect(harness.getState().activeTabId).toBe(secondId);
    });
});
