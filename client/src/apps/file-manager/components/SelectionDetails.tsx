import { Folder, FileText, Shield, Clock3 } from 'lucide-react';
import { useMemo } from 'react';
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

    const selectedNode = useMemo(() => {
        if (selectedIds.length !== 1) {
            return null;
        }
        return items.find((item) => item.id === selectedIds[0]) ?? null;
    }, [items, selectedIds]);

    if (!selectedNode) {
        return (
            <aside className="hidden w-64 shrink-0 border-l border-slate-700/80 bg-slate-950/50 p-3 lg:block">
                <div className="text-xs uppercase tracking-wide text-slate-500">Details</div>
                <p className="mt-3 text-xs text-slate-400">Select one file or folder to view metadata.</p>
            </aside>
        );
    }

    return (
        <aside className="hidden w-64 shrink-0 border-l border-slate-700/80 bg-slate-950/50 p-3 lg:block">
            <div className="mb-4 flex items-center gap-2">
                {selectedNode.type === VfsNodeType.DIR ? <Folder size={16} className="text-indigo-300" /> : <FileText size={16} className="text-slate-300" />}
                <span className="truncate text-sm font-medium text-slate-100">{selectedNode.name}</span>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                    <span className="text-slate-500">Type</span>
                    <span>{selectedNode.type === VfsNodeType.DIR ? 'Folder' : 'File'}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-slate-500">Size</span>
                    <span>{selectedNode.size} bytes</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-slate-500"><Clock3 size={12} />Modified</span>
                    <span>{Math.floor(selectedNode.modifiedAt)}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-slate-500"><Shield size={12} />Mode</span>
                    <span>{formatMode(selectedNode.mode)}</span>
                </div>
            </div>
        </aside>
    );
}
