import { describe, expect, it, vi } from 'vitest';
import { BrowserConnectivityService } from './browserConnectivityService';
import type { NetworkAdapter } from '../connectivity/types';
import { PageCache } from '../cache/pageCache';
import type { ConnectivityState } from '../../../types/browser';

const onlineProfile: ConnectivityState = {
    online: true,
    latencyMs: 0,
    jitterMs: 0,
};

const offlineProfile: ConnectivityState = {
    online: false,
    latencyMs: 0,
    jitterMs: 0,
};

describe('BrowserConnectivityService', () => {
    it('serves cached page when offline after a successful online request', async () => {
        const adapter: NetworkAdapter = {
            request: vi.fn(async (request, _connectivity) => ({
                ok: true as const,
                url: request.url,
                resolvedAt: 1,
            })),
        };
        const service = new BrowserConnectivityService(adapter, new PageCache());

        const first = await service.resolveNavigation({
            url: 'https://duckduckgo.com/?q=aether',
            title: 'Search - aether',
            mode: 'embed',
            connectivity: onlineProfile,
        });

        expect(first.source).toBe('network');
        expect(first.servedOffline).toBe(false);

        const second = await service.resolveNavigation({
            url: 'https://duckduckgo.com/?q=aether',
            title: 'Search - aether',
            mode: 'embed',
            connectivity: offlineProfile,
        });

        expect(second.source).toBe('cache');
        expect(second.servedOffline).toBe(true);
        expect(adapter.request).toHaveBeenCalledTimes(1);
    });

    it('throws when offline and no cache entry exists', async () => {
        const adapter: NetworkAdapter = {
            request: vi.fn(async (_request, _connectivity) => ({
                ok: true as const,
                url: 'https://example.com',
                resolvedAt: 1,
            })),
        };
        const service = new BrowserConnectivityService(adapter, new PageCache());

        await expect(
            service.resolveNavigation({
                url: 'https://example.com',
                title: 'Example',
                mode: 'external',
                connectivity: offlineProfile,
            }),
        ).rejects.toThrowError('NETWORK_OFFLINE_NO_CACHE');
    });
});
