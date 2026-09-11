import { Info } from 'lucide-react';
import { useMemo } from 'react';
import { useClipboardSnapshot } from '../../../features/clipboard';
import { useFsStore } from '../../../stores/fsStore';
import { VfsNodeType } from '../../../vfs/types';
import { FileIconView, formatFileTimestamp } from './FileIconView';

function formatMode(mode: number): string {
    const octal = `0${mode.toString(8)}`;
    const r = (mode & 4) ? 'r' : '-';
    const w = (mode & 2) ? 'w' : '-';
    const x = (mode & 1) ? 'x' : '-';
    return `${octal} (${r}${w}${x})`;
}

function formatDetailSize(bytes: number, type: VfsNodeType): string {
    if (type === VfsNodeType.DIR) {
        return '--';
    }
    if (bytes < 1024) {
        return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB (${bytes.toLocaleString()} bytes)`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB (${bytes.toLocaleString()} bytes)`;
}

export default function SelectionDetails() {
    const { selectedIds, items, currentPath } = useFsStore((state) => ({
        selectedIds: state.selectedIds,
        items: state.items,
        currentPath: state.currentPath,
    }));
    const clipboard = useClipboardSnapshot();

    const selectedNode = useMemo(() => {
        if (selectedIds.length !== 1) {
            return null;
        }
        return items.find((item) => item.id === selectedIds[0]) ?? null;
    }, [items, selectedIds]);

    const pendingCut =
        clipboard.payload?.kind === 'files' &&
        clipboard.payload.operation === 'cut' &&
        selectedNode
            ? clipboard.payload.entries.some((entry) => entry.nodeId === selectedNode.id)
            : false;

    if (!selectedNode) {
        return (
            <aside className="hidden w-60 shrink-0 border-l border-hairline bg-parchment/50 p-4 lg:flex lg:flex-col lg:items-center lg:justify-center text-center select-none">
                <Info size={28} className="text-ink-muted-48/70 mb-2" strokeWidth={1.5} />
                <div className="text-xs font-semibold text-ink-muted">No Item Selected</div>
                <p className="mt-1 text-[11px] text-ink-muted-48">Select a file or folder to view its properties and metadata.</p>
            </aside>
        );
    }

    const itemPath = currentPath === '/' ? `/${selectedNode.name}` : `${currentPath}/${selectedNode.name}`;

    return (
        <aside className="hidden w-64 shrink-0 border-l border-hairline bg-parchment/50 p-4 lg:block select-none overflow-y-auto">
            {/* Header Icon & Name */}
            <div className="flex flex-col items-center pb-4 border-b border-hairline text-center">
                <div className="mb-2 flex h-20 w-20 items-center justify-center">
                    <FileIconView
                        type={selectedNode.type}
                        name={selectedNode.name}
                        path={itemPath}
                        size="lg"
                    />
                </div>
                <span className="w-full break-words text-xs font-semibold text-ink" title={selectedNode.name}>
                    {selectedNode.name}
                </span>
                <span className="mt-0.5 text-[11px] text-ink-muted-48">
                    {selectedNode.type === VfsNodeType.DIR ? 'Folder' : selectedNode.name.includes('.') ? `${selectedNode.name.split('.').pop()?.toUpperCase()} File` : 'Document'}
                </span>
            </div>

            {/* Information Grid */}
            <div className="mt-4 space-y-2.5 text-xs">
                {pendingCut && (
                    <div className="rounded-md border border-warning/30 bg-warning/10 px-2.5 py-1.5 text-[11px] text-warning">
                        Pending move: this item will be relocated when pasted.
                    </div>
                )}

                <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted-48">Size</span>
                    <div className="text-ink font-medium">{formatDetailSize(selectedNode.size, selectedNode.type)}</div>
                </div>

                <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted-48">Where</span>
                    <div className="text-ink font-medium truncate" title={currentPath}>{currentPath}</div>
                </div>

                <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted-48">Modified</span>
                    <div className="text-ink font-medium">{formatFileTimestamp(selectedNode.modifiedAt)}</div>
                </div>

                <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted-48">Permissions</span>
                    <div className="text-ink font-medium font-mono text-[11px]">{formatMode(selectedNode.mode)}</div>
                </div>

                <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted-48">Owner</span>
                    <div className="text-ink font-medium">{selectedNode.owner || 'user'}</div>
                </div>
            </div>
        </aside>
    );
}

