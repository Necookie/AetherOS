import { create } from 'zustand';
import { createFsActions } from './fs/actions';
import { initialFsState } from './fs/initialState';
import type { FsStore, ViewMode } from './fs/types';

export type { FsStore, ViewMode };

export const useFsStore = create<FsStore>((set, get) => ({
    ...initialFsState,
    ...createFsActions(set, get),
}));
