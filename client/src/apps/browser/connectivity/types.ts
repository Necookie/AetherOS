import type { ConnectivityState, TabMode } from '../../../types/browser';

export interface NetworkRequest {
    url: string;
}

export interface NetworkResponse {
    ok: true;
    url: string;
    resolvedAt: number;
}

export interface NetworkAdapter {
    request: (request: NetworkRequest, connectivity: ConnectivityState) => Promise<NetworkResponse>;
}

export type CacheSource = 'network' | 'cache';

export interface CachedNavigationPayload {
    url: string;
    title: string;
    mode: Extract<TabMode, 'embed' | 'external'>;
    cachedAt: number;
}
