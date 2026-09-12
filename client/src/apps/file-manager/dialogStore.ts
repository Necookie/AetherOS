import { create } from 'zustand';

export type DialogVariant = 'danger' | 'warning' | 'primary';
export type DialogIconType = 'trash' | 'alert' | 'folder' | 'file' | 'move';

export interface FileManagerDialogConfig {
    title: string;
    description: string;
    detail?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: DialogVariant;
    icon?: DialogIconType;
    promptInput?: {
        defaultValue?: string;
        placeholder?: string;
        selectAll?: boolean;
    };
    onConfirm: (inputValue?: string) => void;
    onCancel?: () => void;
}

interface FileManagerDialogStore {
    dialog: FileManagerDialogConfig | null;
    openDialog: (config: FileManagerDialogConfig) => void;
    closeDialog: () => void;
}

export const useFileManagerDialogStore = create<FileManagerDialogStore>((set) => ({
    dialog: null,
    openDialog: (config) => set({ dialog: config }),
    closeDialog: () => set({ dialog: null }),
}));

export const fileManagerDialogs = {
    confirmTrash: (count: number, onConfirm: () => void) => {
        useFileManagerDialogStore.getState().openDialog({
            title: 'Move to Trash?',
            description: `Are you sure you want to move ${count} item${count === 1 ? '' : 's'} to Trash?`,
            detail: 'You can restore items anytime from the Trash folder.',
            confirmLabel: 'Move to Trash',
            variant: 'danger',
            icon: 'trash',
            onConfirm,
        });
    },
    confirmPermanentDelete: (count: number, onConfirm: () => void) => {
        useFileManagerDialogStore.getState().openDialog({
            title: 'Delete Permanently?',
            description: `Permanently delete ${count} item${count === 1 ? '' : 's'}?`,
            detail: 'This action cannot be undone. Files will be completely removed.',
            confirmLabel: 'Delete Permanently',
            variant: 'danger',
            icon: 'alert',
            onConfirm,
        });
    },
    confirmEmptyTrash: (onConfirm: () => void) => {
        useFileManagerDialogStore.getState().openDialog({
            title: 'Empty Trash?',
            description: 'Empty all items in Trash permanently?',
            detail: 'This action cannot be undone. All items in the Trash will be permanently lost.',
            confirmLabel: 'Empty Trash',
            variant: 'danger',
            icon: 'trash',
            onConfirm,
        });
    },
    promptRename: (currentName: string, onConfirm: (newName: string) => void) => {
        useFileManagerDialogStore.getState().openDialog({
            title: 'Rename Item',
            description: `Enter a new name for "${currentName}":`,
            confirmLabel: 'Rename',
            variant: 'primary',
            icon: 'file',
            promptInput: {
                defaultValue: currentName,
                placeholder: 'Enter new name',
                selectAll: true,
            },
            onConfirm: (val) => {
                const trimmed = val?.trim();
                if (trimmed && trimmed !== currentName) {
                    onConfirm(trimmed);
                }
            },
        });
    },
    promptNewFolder: (onConfirm: (name: string) => void) => {
        useFileManagerDialogStore.getState().openDialog({
            title: 'New Folder',
            description: 'Enter a name for the new folder:',
            confirmLabel: 'Create Folder',
            variant: 'primary',
            icon: 'folder',
            promptInput: {
                defaultValue: 'New Folder',
                placeholder: 'Folder name',
                selectAll: true,
            },
            onConfirm: (val) => {
                const trimmed = val?.trim();
                if (trimmed) {
                    onConfirm(trimmed);
                }
            },
        });
    },
    promptNewFile: (onConfirm: (name: string) => void) => {
        useFileManagerDialogStore.getState().openDialog({
            title: 'New File',
            description: 'Enter a name for the new text file:',
            confirmLabel: 'Create File',
            variant: 'primary',
            icon: 'file',
            promptInput: {
                defaultValue: 'New Text Document.txt',
                placeholder: 'File name',
                selectAll: true,
            },
            onConfirm: (val) => {
                const trimmed = val?.trim();
                if (trimmed) {
                    onConfirm(trimmed);
                }
            },
        });
    },
    promptMove: (count: number, onConfirm: (path: string) => void) => {
        useFileManagerDialogStore.getState().openDialog({
            title: 'Move Items',
            description: `Move ${count} item${count === 1 ? '' : 's'} to destination path:`,
            confirmLabel: 'Move Here',
            variant: 'primary',
            icon: 'move',
            promptInput: {
                defaultValue: '/home/user',
                placeholder: '/home/user/Documents',
                selectAll: false,
            },
            onConfirm: (val) => {
                const trimmed = val?.trim();
                if (trimmed) {
                    onConfirm(trimmed);
                }
            },
        });
    },
};
