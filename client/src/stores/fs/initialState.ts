import { getVisibleItems } from '../../vfs/fsState';
import type { FsStoreState } from './types';

export const HOME_PATH = '/home/user';

export const initialFsState: FsStoreState = {
    currentPath: HOME_PATH,
    history: [HOME_PATH],
    historyIndex: 0,
    viewMode: 'icons',
    selectedIds: [],
    showHidden: false,
    searchQuery: '',
    items: getVisibleItems(HOME_PATH, ''),
    error: null,
};
