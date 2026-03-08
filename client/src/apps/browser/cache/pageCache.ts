import type { CachedNavigationPayload } from '../connectivity/types';

export interface CacheLookupResult {
    payload: CachedNavigationPayload;
    isFresh: boolean;
}

export class PageCache {
    private entries = new Map<string, CachedNavigationPayload>();

    constructor(
        private readonly maxEntries = 120,
        private readonly ttlMs = 5 * 60 * 1000,
    ) {}

    get(url: string, now = Date.now()): CacheLookupResult | null {
        const payload = this.entries.get(url);
        if (!payload) {
            return null;
        }

        return {
            payload,
            isFresh: now - payload.cachedAt <= this.ttlMs,
        };
    }

    set(payload: Omit<CachedNavigationPayload, 'cachedAt'>, now = Date.now()): CachedNavigationPayload {
        const nextPayload: CachedNavigationPayload = {
            ...payload,
            cachedAt: now,
        };

        if (this.entries.has(nextPayload.url)) {
            this.entries.delete(nextPayload.url);
        }

        this.entries.set(nextPayload.url, nextPayload);
        this.enforceSizeLimit();
        return nextPayload;
    }

    private enforceSizeLimit() {
        while (this.entries.size > this.maxEntries) {
            const oldestKey = this.entries.keys().next().value;
            if (!oldestKey) {
                break;
            }
            this.entries.delete(oldestKey);
        }
    }
}
