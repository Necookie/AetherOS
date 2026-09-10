import { Folder, FileText, Shield, Clock3 } from 'lucide-react';
import { useMemo } from 'react';
import { useClipboardSnapshot } from '../../../features/clipboard';
import { useFsStore } from '../../../stores/fsStore';
import { VfsNodeType } from '../../../vfs/types';

function formatMode(mode: number): string {
    return `0${mode.toString(8)}`;
}

export default function SelectionDetails() {
    const { selectedIds, items } = useFsStore((state) => ({
        selectedIds: state.selectedIds,
        items: state.items,
    }));
    const clipboard = useClipboardSnapshot()

    const selectedNode = useMemo(() => {
        if (selectedIds.length !== 1) {
            return null;
        }
        return items.find((item) => item.id === selectedIds[0]) ?? null;
    }, [items, selectedIds]);
    const pendingCut = clipboard.payload?.kind === 'files'
        && clipboard.payload.operation === 'cut'
        && selectedNode
        ? clipboard.payload.entries.some((entry) => entry.nodeId === selectedNode.id)
        : false

    if (!selectedNode) {
        return (
            <aside className="hidden w-64 shrink-0 border-l border-hairline bg-parchment p-3 lg:block">
                <div className="text-xs uppercase tracking-wide text-ink-muted-48">Details</div>
                <p className="mt-3 text-xs text-ink-muted">Select one file or folder to view metadata.</p>
            </aside>
        );
    }

    return (
        <aside className="hidden w-64 shrink-0 border-l border-hairline bg-parchment p-3 lg:block">
            <div className="mb-4 flex items-center gap-2">
                {selectedNode.type === VfsNodeType.DIR ? <Folder size={16} className="text-primary" /> : <FileText size={16} className="text-ink-muted-48" />}
                <span className="truncate text-sm font-semibold text-ink">{selectedNode.name}</span>
            </div>

            <div className="space-y-2 text-xs text-ink-muted">
                {pendingCut && (
                    <div className="rounded-sm border border-hairline bg-canvas px-2 py-1 text-warning">
                        Pending move: this item will be moved on paste.
                    </div>
                )}
                <div className="flex items-center justify-between">
                    <span className="text-ink-muted-48">Type</span>
                    <span>{selectedNode.type === VfsNodeType.DIR ? 'Folder' : 'File'}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-ink-muted-48">Size</span>
                    <span>{selectedNode.size} bytes</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-ink-muted-48"><Clock3 size={12} />Modified</span>
                    <span>{Math.floor(selectedNode.modifiedAt)}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-ink-muted-48"><Shield size={12} />Mode</span>
                    <span>{formatMode(selectedNode.mode)}</span>
                </div>
            </div>
        </aside>
    );
}
