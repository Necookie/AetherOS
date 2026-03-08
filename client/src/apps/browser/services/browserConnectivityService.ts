import type { ConnectivityState, TabMode } from '../../../types/browser';
import type { CacheSource, NetworkAdapter } from '../connectivity/types';
import { PageCache } from '../cache/pageCache';

export interface ConnectivityResolution {
    mode: Extract<TabMode, 'embed' | 'external'>;
    source: CacheSource;
    servedOffline: boolean;
}

interface ResolveArgs {
    url: string;
    title: string;
    mode: Extract<TabMode, 'embed' | 'external'>;
    connectivity: ConnectivityState;
}

export class BrowserConnectivityService {
    constructor(
        private readonly adapter: NetworkAdapter,
        private readonly cache: PageCache,
    ) {}

    async resolveNavigation(args: ResolveArgs): Promise<ConnectivityResolution> {
        const cached = this.cache.get(args.url);

        if (!args.connectivity.online) {
            if (!cached) {
                throw new Error('NETWORK_OFFLINE_NO_CACHE');
            }

            return {
                mode: cached.payload.mode,
                source: 'cache',
                servedOffline: true,
            };
        }

        await this.adapter.request({ url: args.url }, args.connectivity);
        this.cache.set({
            url: args.url,
            title: args.title,
            mode: args.mode,
        });

        return {
            mode: args.mode,
            source: 'network',
            servedOffline: false,
        };
    }
}
