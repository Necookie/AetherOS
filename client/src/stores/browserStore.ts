import { create } from 'zustand';
import { createBrowserActions } from './browser/actions';
import { initialBrowserStoreState } from './browser/initialState';
import type { BrowserStore } from './browser/types';

export type { BrowserStore } from './browser/types';

export const useBrowserStore = create<BrowserStore>((set, get) => ({
    ...initialBrowserStoreState,
    ...createBrowserActions(set, get),
}));
