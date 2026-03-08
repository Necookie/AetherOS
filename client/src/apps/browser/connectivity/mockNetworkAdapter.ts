import type { NetworkAdapter, NetworkRequest, NetworkResponse } from './types';
import type { ConnectivityState } from '../../../types/browser';

function sleep(ms: number) {
    return new Promise<void>((resolve) => {
        setTimeout(resolve, ms);
    });
}

function getDelay(connectivity: ConnectivityState): number {
    if (connectivity.latencyMs <= 0 && connectivity.jitterMs <= 0) {
        return 0;
    }

    const jitter = connectivity.jitterMs > 0
        ? Math.round((Math.random() * 2 - 1) * connectivity.jitterMs)
        : 0;

    return Math.max(0, connectivity.latencyMs + jitter);
}

export const mockNetworkAdapter: NetworkAdapter = {
    async request(request: NetworkRequest, connectivity: ConnectivityState): Promise<NetworkResponse> {
        const delay = getDelay(connectivity);
        if (delay > 0) {
            await sleep(delay);
        }

        if (!connectivity.online) {
            throw new Error('NETWORK_OFFLINE');
        }

        return {
            ok: true,
            url: request.url,
            resolvedAt: Date.now(),
        };
    },
};
