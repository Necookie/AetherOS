export interface SelectionRect {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

export function createSelectionRect(startX: number, startY: number, endX: number, endY: number): SelectionRect {
    return {
        left: Math.min(startX, endX),
        top: Math.min(startY, endY),
        right: Math.max(startX, endX),
        bottom: Math.max(startY, endY),
    };
}

export function rectIntersects(a: SelectionRect, b: SelectionRect): boolean {
    return a.left <= b.right && a.right >= b.left && a.top <= b.bottom && a.bottom >= b.top;
}

export function rectFromDomRect(rect: DOMRect): SelectionRect {
    return {
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
    };
}
