import type { HistoryEntry } from '../../../../types/browser';
import { getKernelTime } from '../../../../lib/kernelClock';

const HISTORY_LIMIT = 250;

export function createHistoryEntry(entry: Omit<HistoryEntry, 'timestamp'>): HistoryEntry {
    return {
        ...entry,
        timestamp: getKernelTime(),
    };
}

export function appendHistory(
    history: HistoryEntry[],
    entry: Omit<HistoryEntry, 'timestamp'>,
): HistoryEntry[] {
    const next = [...history, createHistoryEntry(entry)];
    if (next.length <= HISTORY_LIMIT) {
        return next;
    }

    return next.slice(next.length - HISTORY_LIMIT);
}
