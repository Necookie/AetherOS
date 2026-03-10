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

    it('soft-deletes files into trash for admin profile', () => {
        const harness = createHarness();
        const state = harness.getState();
        state.navigate('/home/user/Documents');
        const readme = harness.getState().items.find((item) => item.name === 'readme.txt');
        expect(readme).toBeTruthy();
        if (!readme) {
            return;
        }

        state.deleteItems([readme.id]);

        expect(() => fsService.resolvePath('/home/user/Documents/readme.txt')).toThrow();
        const trashed = fsService.resolvePath('/home/user/.Trash/readme.txt');
        expect(trashed.trash?.originalPath).toBe('/home/user/Documents/readme.txt');
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

    it('restores files from trash back to original location', () => {
        const harness = createHarness();
        const state = harness.getState();

        state.navigate('/home/user/Documents');
        const readme = harness.getState().items.find((item) => item.name === 'readme.txt');
        expect(readme).toBeTruthy();
        if (!readme) {
            return;
        }
        state.deleteItems([readme.id]);

        state.navigate('/home/user/.Trash');
        const trashed = harness.getState().items.find((item) => item.name === 'readme.txt');
        expect(trashed).toBeTruthy();
        if (!trashed) {
            return;
        }

        state.restoreItems([trashed.id]);
        const restored = fsService.resolvePath('/home/user/Documents/readme.txt');
        expect(restored.name).toBe('readme.txt');
    });

    it('rolls back permanent-delete request when target is outside trash', () => {
        const harness = createHarness();
        const state = harness.getState();
        state.navigate('/home/user/Documents');
        const readme = harness.getState().items.find((item) => item.name === 'readme.txt');
        expect(readme).toBeTruthy();
        if (!readme) {
            return;
        }

        state.permanentlyDeleteItems([readme.id]);

        const recovered = fsService.resolvePath('/home/user/Documents/readme.txt');
        expect(recovered.name).toBe('readme.txt');
        expect(harness.getState().error).toContain('only available for items in Trash');
    });

    it('supports single to multi and range selection transitions', () => {
        const harness = createHarness();
        const state = harness.getState();

        state.navigate('/home/user');
        const ids = harness.getState().items.map((item) => item.id);
        expect(ids.length).toBeGreaterThanOrEqual(2);
        if (ids.length < 2) {
            return;
        }

        state.selectItem(ids[0], false, false);
        expect(harness.getState().selectedIds).toEqual([ids[0]]);

        state.selectItem(ids[1], true, false);
        expect(harness.getState().selectedIds).toEqual([ids[0], ids[1]]);

        state.selectItem(ids[ids.length - 1], false, true);
        const expectedRange = ids.slice(1);
        expect(harness.getState().selectedIds).toEqual(expectedRange);
    });

    it('clears selection and anchor together', () => {
        const harness = createHarness();
        const state = harness.getState();
        state.navigate('/home/user/Documents');
        const firstId = harness.getState().items[0]?.id;
        expect(firstId).toBeTruthy();
        if (!firstId) {
            return;
        }

        state.selectItem(firstId, false, false);
        expect(harness.getState().selectionAnchorId).toBe(firstId);

        state.clearSelection();
        expect(harness.getState().selectedIds).toEqual([]);
        expect(harness.getState().selectionAnchorId).toBeNull();
    });

    it('reveals a file path by navigating to its parent and selecting it', () => {
        const harness = createHarness();
        const state = harness.getState();

        const revealed = state.revealPath('/home/user/Documents/readme.txt');

        expect(revealed).toBe(true);
        expect(harness.getState().currentPath).toBe('/home/user/Documents');
        expect(harness.getState().selectedIds).toHaveLength(1);
        expect(fsService.getNodeById(harness.getState().selectedIds[0])?.name).toBe('readme.txt');
    });
});
