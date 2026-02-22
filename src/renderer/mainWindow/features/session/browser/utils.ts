import {FavIcons} from '@lynx_common/types/ipc';
import {storageUtilsIpc} from '@lynx_shared/ipc/storage';

// Cache for browser history data to avoid repeated IPC calls
let cachedHistoryData: {favoriteAddress: string[]; recentAddress: string[]; favIcons: FavIcons[]} | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5000; // 5 seconds cache

export async function getCachedHistoryData() {
  const now = Date.now();
  if (cachedHistoryData && now - cacheTimestamp < CACHE_TTL) {
    return cachedHistoryData;
  }
  cachedHistoryData = await storageUtilsIpc.invoke.getBrowserHistoryData();
  cacheTimestamp = now;
  return cachedHistoryData;
}

export function invalidateHistoryCache() {
  cachedHistoryData = null;
  cacheTimestamp = 0;
}
