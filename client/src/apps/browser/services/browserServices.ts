import { PageCache } from '../cache/pageCache';
import { mockNetworkAdapter } from '../connectivity/mockNetworkAdapter';
import { BrowserConnectivityService } from './browserConnectivityService';

const pageCache = new PageCache();

export const browserConnectivityService = new BrowserConnectivityService(
    mockNetworkAdapter,
    pageCache,
);
