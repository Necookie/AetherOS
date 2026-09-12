import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fileManagerDialogs, useFileManagerDialogStore } from './dialogStore';

describe('FileManager Dialog Suite', () => {
    beforeEach(() => {
        useFileManagerDialogStore.getState().closeDialog();
    });

    it('initializes with null dialog', () => {
        expect(useFileManagerDialogStore.getState().dialog).toBeNull();
    });

    it('opens confirmTrash card with correct configuration and confirms', () => {
        const onConfirmSpy = vi.fn();
        fileManagerDialogs.confirmTrash(3, onConfirmSpy);

        const currentDialog = useFileManagerDialogStore.getState().dialog;
        expect(currentDialog).not.toBeNull();
        expect(currentDialog?.title).toBe('Move to Trash?');
        expect(currentDialog?.description).toBe('Are you sure you want to move 3 items to Trash?');
        expect(currentDialog?.variant).toBe('danger');
        expect(currentDialog?.icon).toBe('trash');
        expect(currentDialog?.confirmLabel).toBe('Move to Trash');

        // Confirm
        currentDialog?.onConfirm();
        expect(onConfirmSpy).toHaveBeenCalledTimes(1);
    });

    it('opens confirmPermanentDelete card with destructive warning', () => {
        const onConfirmSpy = vi.fn();
        fileManagerDialogs.confirmPermanentDelete(1, onConfirmSpy);

        const currentDialog = useFileManagerDialogStore.getState().dialog;
        expect(currentDialog).not.toBeNull();
        expect(currentDialog?.title).toBe('Delete Permanently?');
        expect(currentDialog?.description).toBe('Permanently delete 1 item?');
        expect(currentDialog?.detail).toContain('cannot be undone');
        expect(currentDialog?.variant).toBe('danger');

        currentDialog?.onConfirm();
        expect(onConfirmSpy).toHaveBeenCalledTimes(1);
    });

    it('opens confirmEmptyTrash card and confirms', () => {
        const onConfirmSpy = vi.fn();
        fileManagerDialogs.confirmEmptyTrash(onConfirmSpy);

        const currentDialog = useFileManagerDialogStore.getState().dialog;
        expect(currentDialog?.title).toBe('Empty Trash?');
        expect(currentDialog?.variant).toBe('danger');

        currentDialog?.onConfirm();
        expect(onConfirmSpy).toHaveBeenCalledTimes(1);
    });

    it('opens promptRename with pre-filled default value and validates trimmed input', () => {
        const onConfirmSpy = vi.fn();
        fileManagerDialogs.promptRename('old_notes.txt', onConfirmSpy);

        const currentDialog = useFileManagerDialogStore.getState().dialog;
        expect(currentDialog?.title).toBe('Rename Item');
        expect(currentDialog?.promptInput?.defaultValue).toBe('old_notes.txt');

        // If user enters same name, does not call callback
        currentDialog?.onConfirm('old_notes.txt');
        expect(onConfirmSpy).not.toHaveBeenCalled();

        // If user enters new name, calls callback with trimmed string
        currentDialog?.onConfirm('  new_notes.txt  ');
        expect(onConfirmSpy).toHaveBeenCalledWith('new_notes.txt');
    });

    it('opens promptNewFolder and promptNewFile with default values', () => {
        const folderSpy = vi.fn();
        fileManagerDialogs.promptNewFolder(folderSpy);

        let currentDialog = useFileManagerDialogStore.getState().dialog;
        expect(currentDialog?.title).toBe('New Folder');
        expect(currentDialog?.promptInput?.defaultValue).toBe('New Folder');
        currentDialog?.onConfirm('Projects');
        expect(folderSpy).toHaveBeenCalledWith('Projects');

        const fileSpy = vi.fn();
        fileManagerDialogs.promptNewFile(fileSpy);

        currentDialog = useFileManagerDialogStore.getState().dialog;
        expect(currentDialog?.title).toBe('New File');
        expect(currentDialog?.promptInput?.defaultValue).toBe('New Text Document.txt');
        currentDialog?.onConfirm('readme.md');
        expect(fileSpy).toHaveBeenCalledWith('readme.md');
    });

    it('opens promptMove and validates destination path', () => {
        const moveSpy = vi.fn();
        fileManagerDialogs.promptMove(2, moveSpy);

        const currentDialog = useFileManagerDialogStore.getState().dialog;
        expect(currentDialog?.title).toBe('Move Items');
        expect(currentDialog?.description).toBe('Move 2 items to destination path:');
        expect(currentDialog?.promptInput?.defaultValue).toBe('/home/user');

        currentDialog?.onConfirm('/home/user/Documents');
        expect(moveSpy).toHaveBeenCalledWith('/home/user/Documents');
    });

    it('closes dialog correctly', () => {
        fileManagerDialogs.confirmTrash(1, () => {});
        expect(useFileManagerDialogStore.getState().dialog).not.toBeNull();

        useFileManagerDialogStore.getState().closeDialog();
        expect(useFileManagerDialogStore.getState().dialog).toBeNull();
    });
});
