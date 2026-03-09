import { describe, expect, it } from 'vitest';
import { createSelectionRect, rectIntersects } from './geometry';
import { resolveClickSelection, resolveMarqueeSelection } from './selectionDomain';

describe('selection geometry', () => {
    it('normalizes drag coordinates into a positive rectangle', () => {
        expect(createSelectionRect(20, 30, 10, 5)).toEqual({
            left: 10,
            top: 5,
            right: 20,
            bottom: 30,
        });
    });

    it('detects intersection between marquee and item bounds', () => {
        const marquee = createSelectionRect(0, 0, 100, 100);
        const item = createSelectionRect(80, 80, 140, 140);
        expect(rectIntersects(marquee, item)).toBe(true);
    });
});

describe('selection transitions', () => {
    const orderedIds = ['a', 'b', 'c', 'd'];

    it('supports single to multi selection transitions', () => {
        const first = resolveClickSelection({
            currentSelection: [],
            orderedIds,
            clickedId: 'a',
            anchorId: null,
            multi: false,
            range: false,
        });

        const second = resolveClickSelection({
            currentSelection: first.selectedIds,
            orderedIds,
            clickedId: 'c',
            anchorId: first.anchorId,
            multi: true,
            range: false,
        });

        expect(second.selectedIds).toEqual(['a', 'c']);
    });

    it('extends range selection from anchor with shift', () => {
        const result = resolveClickSelection({
            currentSelection: ['b'],
            orderedIds,
            clickedId: 'd',
            anchorId: 'b',
            multi: false,
            range: true,
        });

        expect(result.selectedIds).toEqual(['b', 'c', 'd']);
    });

    it('clears intersected items in subtract marquee mode', () => {
        const result = resolveMarqueeSelection({
            currentSelection: ['a', 'b', 'c'],
            hitIds: ['b', 'c'],
            mode: 'subtract',
        });

        expect(result).toEqual(['a']);
    });
});
