export interface ClickSelectionInput {
    currentSelection: string[];
    orderedIds: string[];
    clickedId: string;
    anchorId: string | null;
    multi: boolean;
    range: boolean;
}

export interface SelectionResult {
    selectedIds: string[];
    anchorId: string | null;
}

export type MarqueeSelectionMode = 'replace' | 'add' | 'subtract' | 'toggle';

export interface MarqueeSelectionInput {
    currentSelection: string[];
    hitIds: string[];
    mode: MarqueeSelectionMode;
}

function uniqueOrdered(ids: string[]): string[] {
    const seen = new Set<string>();
    const ordered: string[] = [];

    for (const id of ids) {
        if (!seen.has(id)) {
            seen.add(id);
            ordered.push(id);
        }
    }

    return ordered;
}

function buildRange(orderedIds: string[], fromId: string, toId: string): string[] {
    const fromIndex = orderedIds.indexOf(fromId);
    const toIndex = orderedIds.indexOf(toId);
    if (fromIndex === -1 || toIndex === -1) {
        return [toId];
    }

    const start = Math.min(fromIndex, toIndex);
    const end = Math.max(fromIndex, toIndex);
    return orderedIds.slice(start, end + 1);
}

export function resolveClickSelection(input: ClickSelectionInput): SelectionResult {
    const {
        currentSelection,
        orderedIds,
        clickedId,
        anchorId,
        multi,
        range,
    } = input;

    if (range) {
        const effectiveAnchor = anchorId ?? currentSelection[currentSelection.length - 1] ?? clickedId;
        const rangeSelection = buildRange(orderedIds, effectiveAnchor, clickedId);

        if (multi) {
            return {
                selectedIds: uniqueOrdered([...currentSelection, ...rangeSelection]),
                anchorId: effectiveAnchor,
            };
        }

        return {
            selectedIds: rangeSelection,
            anchorId: effectiveAnchor,
        };
    }

    if (multi) {
        const exists = currentSelection.includes(clickedId);
        return {
            selectedIds: exists
                ? currentSelection.filter((id) => id !== clickedId)
                : [...currentSelection, clickedId],
            anchorId: clickedId,
        };
    }

    return {
        selectedIds: [clickedId],
        anchorId: clickedId,
    };
}

export function resolveMarqueeSelection(input: MarqueeSelectionInput): string[] {
    const { currentSelection, hitIds, mode } = input;

    if (mode === 'replace') {
        return uniqueOrdered(hitIds);
    }

    if (mode === 'add') {
        return uniqueOrdered([...currentSelection, ...hitIds]);
    }

    if (mode === 'subtract') {
        const hitSet = new Set(hitIds);
        return currentSelection.filter((id) => !hitSet.has(id));
    }

    const currentSet = new Set(currentSelection);
    const hitSet = new Set(hitIds);
    const toggled: string[] = [];

    for (const id of currentSelection) {
        if (!hitSet.has(id)) {
            toggled.push(id);
        }
    }

    for (const id of hitIds) {
        if (!currentSet.has(id)) {
            toggled.push(id);
        }
    }

    return toggled;
}
