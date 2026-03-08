import { beforeEach, describe, expect, it } from 'vitest';
import { fsService } from '../../vfs/vfsService';
import { createFsActions } from './actions';
import { initialFsState, HOME_PATH } from './initialState';
import type { FsStore } from './types';
import { useSessionStore } from '../useSessionStore';
import { setActiveUserId } from '../../features/accounts/services/userScope';

type StoreSet = (
    partial:
        | FsStore
        | Partial<FsStore>
        | ((state: FsStore) => FsStore | Partial<FsStore>),
    replace?: boolean,
) => void;

function createHarness() {
    let state = { ...initialFsState } as FsStore;

    const set: StoreSet = (partial) => {
        const next = typeof partial === 'function' ? partial(state) : partial;
        state = {
            ...state,
            ...next,
        };
    };

    const get = () => state;
    const actions = createFsActions(set, get);
    state = {
        ...state,
        ...actions,
    };

    return {
        getState: () => state,
    };
}

describe('filesystem actions optimistic behavior', () => {
    beforeEach(() => {
        setActiveUserId('admin');
        useSessionStore.setState((state) => ({
            ...state,
            activeUserId: 'admin',
            selectedLoginUserId: 'admin',
            isLocked: false,
            error: null,
            isAuthenticating: false,
        }));
        fsService.resetToDefaults();
    });

    it('applies successful mutations and refreshes current view', () => {
        const harness = createHarness();
        const state = harness.getState();

        state.navigate('/home/user/Documents');
        state.createFolder('Projects');

        const names = harness.getState().items.map((item) => item.name);
        expect(names).toContain('Projects');
        expect(harness.getState().error).toBeNull();
    });

    it('rolls back failed move operation and preserves source node', () => {
        const harness = createHarness();
        const state = harness.getState();

        state.navigate('/home/user/Documents');
        const readme = harness.getState().items.find((item) => item.name === 'readme.txt');
        expect(readme).toBeTruthy();
        if (!readme) {
            return;
        }

        state.selectItem(readme.id, false, false);
        state.moveItems([readme.id], '/etc');

        const recovered = fsService.resolvePath('/home/user/Documents/readme.txt');
        expect(recovered.name).toBe('readme.txt');
        expect(harness.getState().error).toContain('EPERM');
        expect(harness.getState().isMutating).toBe(false);
        expect(harness.getState().currentPath).toBe(HOME_PATH + '/Documents');
    });

    it('blocks guest profile from deleting files', () => {
        setActiveUserId('guest');
        useSessionStore.setState((state) => ({
            ...state,
            activeUserId: 'guest',
            selectedLoginUserId: 'guest',
            isLocked: false,
        }));

        const harness = createHarness();
        const state = harness.getState();
        state.navigate('/home/user/Documents');
        const readme = harness.getState().items.find((item) => item.name === 'readme.txt');
        expect(readme).toBeTruthy();
        if (!readme) {
            return;
        }

        state.deleteItems([readme.id]);

        const recovered = fsService.resolvePath('/home/user/Documents/readme.txt');
        expect(recovered.name).toBe('readme.txt');
        expect(harness.getState().error).toContain('read-only');
    });
});
