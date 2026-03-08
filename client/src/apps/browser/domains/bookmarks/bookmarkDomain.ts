import type { BookmarkEntry } from '../../../../types/browser';
import { getKernelTime } from '../../../../lib/kernelClock';

function createBookmarkId() {
    return `bm_${Math.random().toString(36).slice(2, 9)}`;
}

export function upsertBookmark(
    bookmarks: BookmarkEntry[],
    bookmark: Omit<BookmarkEntry, 'id' | 'createdAt'>,
): BookmarkEntry[] {
    const existing = bookmarks.find((entry) => entry.url === bookmark.url);
    if (existing) {
        return bookmarks.map((entry) =>
            entry.id === existing.id ? { ...entry, title: bookmark.title } : entry,
        );
    }

    return [
        ...bookmarks,
        {
            id: createBookmarkId(),
            url: bookmark.url,
            title: bookmark.title,
            createdAt: getKernelTime(),
        },
    ];
}

export function removeBookmark(bookmarks: BookmarkEntry[], url: string): BookmarkEntry[] {
    return bookmarks.filter((entry) => entry.url !== url);
}

export function hasBookmark(bookmarks: BookmarkEntry[], url: string): boolean {
    return bookmarks.some((entry) => entry.url === url);
}
