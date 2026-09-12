import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { AlertTriangle, FileText, FolderInput, FolderPlus, Trash2, X } from 'lucide-react';
import { useFileManagerDialogStore, type DialogIconType, type DialogVariant } from '../dialogStore';

function getDialogIcon(type?: DialogIconType, variant?: DialogVariant) {
    const iconClass = 'h-5 w-5';
    switch (type) {
        case 'trash':
            return <Trash2 className={iconClass} />;
        case 'alert':
            return <AlertTriangle className={iconClass} />;
        case 'folder':
            return <FolderPlus className={iconClass} />;
        case 'file':
            return <FileText className={iconClass} />;
        case 'move':
            return <FolderInput className={iconClass} />;
        default:
            return variant === 'danger' ? <AlertTriangle className={iconClass} /> : <FileText className={iconClass} />;
    }
}

export default function FileManagerDialog() {
    const dialog = useFileManagerDialogStore((state) => state.dialog);
    const closeDialog = useFileManagerDialogStore((state) => state.closeDialog);

    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const confirmButtonRef = useRef<HTMLButtonElement>(null);

    // Initialize prompt input value whenever dialog opens
    useEffect(() => {
        if (!dialog) {
            return;
        }

        if (dialog.promptInput) {
            setInputValue(dialog.promptInput.defaultValue ?? '');
            window.setTimeout(() => {
                inputRef.current?.focus();
                if (dialog.promptInput?.selectAll) {
                    inputRef.current?.select();
                }
            }, 50);
        } else {
            window.setTimeout(() => {
                confirmButtonRef.current?.focus();
            }, 50);
        }
    }, [dialog]);

    if (!dialog) {
        return null;
    }

    const {
        title,
        description,
        detail,
        confirmLabel = 'Confirm',
        cancelLabel = 'Cancel',
        variant = 'primary',
        icon,
        promptInput,
        onConfirm,
        onCancel,
    } = dialog;

    const handleCancel = () => {
        onCancel?.();
        closeDialog();
    };

    const handleConfirm = () => {
        onConfirm(promptInput ? inputValue : undefined);
        closeDialog();
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            handleCancel();
        } else if (event.key === 'Enter') {
            event.preventDefault();
            event.stopPropagation();
            handleConfirm();
        }
    };

    const isDanger = variant === 'danger';

    return (
        <div
            className="absolute inset-0 z-[100] flex items-center justify-center bg-black/35 p-4 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={handleCancel}
            onKeyDown={handleKeyDown}
            role="dialog"
            aria-modal="true"
            aria-labelledby="file-manager-dialog-title"
        >
            <div
                className="relative w-full max-w-sm rounded-2xl border border-hairline/80 bg-canvas/95 p-5 text-ink shadow-elevated backdrop-blur-xl animate-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close 'X' Button */}
                <button
                    type="button"
                    onClick={handleCancel}
                    className="absolute right-3.5 top-3.5 flex h-6 w-6 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-black/5 hover:text-ink active:scale-95"
                    aria-label="Close dialog"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="flex items-start gap-3.5">
                    {/* Squircle Badge Icon */}
                    <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                            isDanger
                                ? 'border-danger/20 bg-danger/10 text-danger'
                                : variant === 'warning'
                                    ? 'border-warning/20 bg-warning/10 text-warning'
                                    : 'border-primary/20 bg-primary/10 text-primary'
                        }`}
                    >
                        {getDialogIcon(icon, variant)}
                    </div>

                    <div className="min-w-0 flex-1 pt-0.5">
                        <h3 id="file-manager-dialog-title" className="text-sm font-bold text-ink">
                            {title}
                        </h3>
                        <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                            {description}
                        </p>

                        {detail && (
                            <div className="mt-2.5 rounded-lg border border-hairline/60 bg-parchment/80 px-2.5 py-1.5 text-[11px] text-ink-muted-48">
                                {detail}
                            </div>
                        )}
                    </div>
                </div>

                {/* Prompt Text Input (if applicable) */}
                {promptInput && (
                    <div className="mt-3.5">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={promptInput.placeholder}
                            className="w-full rounded-lg border border-hairline bg-parchment px-3 py-2 text-xs font-medium text-ink placeholder:text-ink-muted-48 focus:border-primary focus:bg-canvas focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                )}

                {/* Action Buttons */}
                <div className="mt-5 flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="rounded-lg border border-hairline bg-parchment px-3.5 py-1.5 text-xs font-medium text-ink transition-all hover:bg-canvas active:scale-95"
                    >
                        {cancelLabel}
                    </button>

                    <button
                        ref={confirmButtonRef}
                        type="button"
                        onClick={handleConfirm}
                        className={`rounded-lg px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition-all active:scale-95 ${
                            isDanger
                                ? 'bg-danger hover:bg-danger/90 focus:ring-2 focus:ring-danger/30'
                                : 'bg-primary hover:bg-primary/90 focus:ring-2 focus:ring-primary/30'
                        }`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
