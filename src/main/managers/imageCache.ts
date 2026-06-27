import {createHash} from 'node:crypto';
import {existsSync, mkdirSync, readdirSync, rmSync, writeFileSync} from 'node:fs';
import {readFile, stat, unlink, writeFile} from 'node:fs/promises';
import {join} from 'node:path';

import {formatBytes} from '@lynx_common/utils';
import {net, protocol} from 'electron';

import classHolder from './classHolder';
import {getAppDataPath} from './dataFolder';

/** Cache folder name inside LynxHub documents folder */
const CACHE_FOLDER_NAME = '.cache';

/** Cache metadata file name */
const CACHE_METADATA_FILE = 'cache-metadata.json';

// Cache defaults are now stored in user settings (database).

/** Supported image MIME types */
const SUPPORTED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
  'image/ico',
  'image/x-icon',
  'image/avif',
]);

/** Cache entry metadata */
interface CacheEntry {
  /** Original URL of the cached image */
  url: string;
  /** Hash of the URL used as filename */
  hash: string;
  /** File extension */
  extension: string;
  /** MIME type of the cached image */
  mimeType: string;
  /** Timestamp when the entry was cached */
  cachedAt: number;
  /** Timestamp when the entry was last accessed */
  lastAccessed: number;
  /** Size of the cached file in bytes */
  size: number;
  /** ETag from the server response (for revalidation) */
  etag?: string;
  /** Last-Modified header from the server response */
  lastModified?: string;
}

/** Cache metadata structure */
interface CacheMetadata {
  /** Version of the cache format */
  version: number;
  /** Timestamp of last cleanup */
  lastCleanup: number;
  /** Map of URL hash to cache entry */
  entries: Record<string, CacheEntry>;
}

/**
 * ImageCacheManager handles caching of remote images using Electron's protocol handler.
 * Images are cached in the LynxHub documents folder under 'Cache' directory.
 * Cache is automatically revalidated and cleaned up every 7 days.
 */
export class ImageCacheManager {
  private readonly cacheDir: string;
  private readonly metadataPath: string;
  private metadata: CacheMetadata;
  private initialized: boolean = false;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.cacheDir = join(getAppDataPath(), CACHE_FOLDER_NAME);
    this.metadataPath = join(this.cacheDir, CACHE_METADATA_FILE);
    this.metadata = this.createEmptyMetadata();
  }

  /** Gets dynamic cache interval in milliseconds from settings */
  private getCacheInterval(): number {
    try {
      const days = classHolder.storageManager.getData('app').imageCacheIntervalDays;
      if (days !== undefined) {
        if (days <= 0) return Infinity;
        return days * 24 * 60 * 60 * 1000;
      }
    } catch (e) {
      console.warn('[ImageCache] Failed to get cache interval from storage:', e);
    }
    return 30 * 24 * 60 * 60 * 1000; // 30 days default
  }

  /** Gets dynamic maximum cache size in bytes from settings */
  private getMaxCacheSize(): number {
    try {
      const size = classHolder.storageManager.getData('app').imageCacheMaxSize;
      if (size !== undefined) {
        return size;
      }
    } catch (e) {
      console.warn('[ImageCache] Failed to get max cache size from storage:', e);
    }
    return 536870912; // 512MB default
  }

  /** Creates empty metadata structure */
  private createEmptyMetadata(): CacheMetadata {
    return {
      version: 1,
      lastCleanup: Date.now(),
      entries: {},
    };
  }

  /** Generates a SHA-256 hash of the URL for use as filename */
  private hashUrl(url: string): string {
    return createHash('sha256').update(url).digest('hex');
  }

  /** Extracts file extension from URL or Content-Type header */
  private getExtension(url: string, contentType?: string): string {
    // Try to get extension from Content-Type first
    if (contentType) {
      const mimeToExt: Record<string, string> = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'image/webp': '.webp',
        'image/svg+xml': '.svg',
        'image/bmp': '.bmp',
        'image/ico': '.ico',
        'image/x-icon': '.ico',
        'image/avif': '.avif',
      };
      const ext = mimeToExt[contentType.split(';')[0].trim()];
      if (ext) return ext;
    }

    // Fallback to URL parsing
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const lastDot = pathname.lastIndexOf('.');
      if (lastDot !== -1) {
        const ext = pathname.substring(lastDot).toLowerCase().split('?')[0];
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico', '.avif'].includes(ext)) {
          return ext === '.jpeg' ? '.jpg' : ext;
        }
      }
    } catch {
      // Invalid URL, use default
    }

    return '.bin';
  }

  /** Gets the cache file path for a given hash and extension */
  private getCacheFilePath(hash: string, extension: string): string {
    return join(this.cacheDir, `${hash}${extension}`);
  }

  /** Ensures the cache directory exists */
  private ensureCacheDir(): void {
    if (!existsSync(this.cacheDir)) {
      mkdirSync(this.cacheDir, {recursive: true});
    }
  }

  /** Loads metadata from disk */
  private async loadMetadata(): Promise<void> {
    try {
      if (existsSync(this.metadataPath)) {
        const data = await readFile(this.metadataPath, 'utf-8');
        const parsed = JSON.parse(data) as CacheMetadata;

        // Validate metadata version
        if (parsed.version === 1) {
          this.metadata = parsed;
        } else {
          console.warn('[ImageCache] Incompatible cache version, resetting cache');
          this.metadata = this.createEmptyMetadata();
        }
      }
    } catch (error) {
      console.warn('[ImageCache] Failed to load metadata, creating new:', error);
      this.metadata = this.createEmptyMetadata();
    }
  }

  /** Saves metadata to disk */
  private async saveMetadata(): Promise<void> {
    try {
      await writeFile(this.metadataPath, JSON.stringify(this.metadata, null, 2), 'utf-8');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn('[ImageCache] Failed to save metadata:', errorMessage);
      // Don't crash on OOM, just log and continue
    }
  }

  /** Saves metadata synchronously (for cleanup operations) */
  private saveMetadataSync(): void {
    try {
      writeFileSync(this.metadataPath, JSON.stringify(this.metadata, null, 2), 'utf-8');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn('[ImageCache] Failed to save metadata sync:', errorMessage);
      // Don't crash on OOM, just log and continue
    }
  }

  /** Calculates total cache size from metadata */
  private calculateCacheSize(): number {
    return Object.values(this.metadata.entries).reduce((total, entry) => total + entry.size, 0);
  }

  /** Removes oldest entries until cache is under max size */
  private async enforceMaxCacheSize(): Promise<void> {
    const currentSize = this.calculateCacheSize();
    const maxSize = this.getMaxCacheSize();
    if (currentSize <= maxSize) return;

    // Sort entries by last accessed time (oldest first)
    const sortedEntries = Object.values(this.metadata.entries).sort((a, b) => a.lastAccessed - b.lastAccessed);

    let sizeToFree = currentSize - maxSize;
    const entriesToRemove: string[] = [];

    for (const entry of sortedEntries) {
      if (sizeToFree <= 0) break;
      entriesToRemove.push(entry.hash);
      sizeToFree -= entry.size;
    }

    // Remove entries
    for (const hash of entriesToRemove) {
      await this.removeEntry(hash);
    }

    console.log(`[ImageCache] Removed ${entriesToRemove.length} entries to enforce max cache size`);
  }

  /** Removes a single cache entry */
  private async removeEntry(hash: string): Promise<void> {
    const entry = this.metadata.entries[hash];
    if (!entry) return;

    const filePath = this.getCacheFilePath(hash, entry.extension);
    try {
      if (existsSync(filePath)) {
        await unlink(filePath);
      }
    } catch (error) {
      console.warn(`[ImageCache] Failed to delete cache file ${filePath}:`, error);
    }

    delete this.metadata.entries[hash];
  }

  /** Removes all cache entries and files */
  private async clearAllEntries(): Promise<number> {
    const entryCount = Object.keys(this.metadata.entries).length;

    for (const entry of Object.values(this.metadata.entries)) {
      const filePath = this.getCacheFilePath(entry.hash, entry.extension);
      try {
        if (existsSync(filePath)) {
          await unlink(filePath);
        }
      } catch {
        // Ignore individual file errors
      }
    }

    this.metadata = this.createEmptyMetadata();
    await this.saveMetadata();
    this.cleanupOrphanedFiles();

    return entryCount;
  }

  /** Cleans up expired cache entries (older than configured interval) */
  private async cleanupExpiredEntries(): Promise<void> {
    const now = Date.now();
    const interval = this.getCacheInterval();
    if (interval === Infinity) {
      console.log('[ImageCache] Auto cleanup is disabled (interval set to never)');
      return;
    }

    const expiredHashes: string[] = [];

    for (const [hash, entry] of Object.entries(this.metadata.entries)) {
      const age = now - entry.cachedAt;
      if (age > interval) {
        expiredHashes.push(hash);
      }
    }

    if (expiredHashes.length === 0) {
      console.log('[ImageCache] No expired entries to clean up');
      return;
    }

    console.log(`[ImageCache] Cleaning up ${expiredHashes.length} expired entries`);

    for (const hash of expiredHashes) {
      await this.removeEntry(hash);
    }

    this.metadata.lastCleanup = now;
    await this.saveMetadata();
  }

  /** Removes orphaned cache files that don't have metadata entries */
  private cleanupOrphanedFiles(): void {
    try {
      const files = readdirSync(this.cacheDir);
      const validHashes = new Set(Object.keys(this.metadata.entries));

      for (const file of files) {
        if (file === CACHE_METADATA_FILE) continue;

        const hash = file.split('.')[0];
        if (!validHashes.has(hash)) {
          const filePath = join(this.cacheDir, file);
          try {
            rmSync(filePath);
            console.log(`[ImageCache] Removed orphaned file: ${file}`);
          } catch (error) {
            console.warn(`[ImageCache] Failed to remove orphaned file ${file}:`, error);
          }
        }
      }
    } catch (error) {
      console.warn('[ImageCache] Failed to cleanup orphaned files:', error);
    }
  }

  /** Performs full cache cleanup */
  private async performCleanup(): Promise<void> {
    if (!classHolder.isOnline) {
      console.log('[ImageCache] App is offline. Skipping cache cleanup.');
      return;
    }
    console.log('[ImageCache] Starting cache cleanup...');
    await this.cleanupExpiredEntries();
    this.cleanupOrphanedFiles();
    await this.enforceMaxCacheSize();
    console.log('[ImageCache] Cache cleanup completed');
  }

  /** Schedules periodic cleanup */
  private scheduleCleanup(): void {
    // Check if cleanup is needed on startup
    const timeSinceLastCleanup = Date.now() - this.metadata.lastCleanup;
    const interval = this.getCacheInterval();
    if (interval !== Infinity && timeSinceLastCleanup >= interval) {
      this.performCleanup().catch(err => console.error('[ImageCache] Cleanup failed:', err));
    }

    // Schedule periodic cleanup (check every hour)
    this.cleanupTimer = setInterval(
      () => {
        const currentInterval = this.getCacheInterval();
        if (currentInterval === Infinity) return;
        const timeSince = Date.now() - this.metadata.lastCleanup;
        if (timeSince >= currentInterval) {
          this.performCleanup().catch(err => console.error('[ImageCache] Scheduled cleanup failed:', err));
        }
      },
      60 * 60 * 1000,
    ); // Check every hour
  }

  /** Fetches image from network and caches it */
  private async fetchAndCache(url: string, hash: string): Promise<Response> {
    try {
      // Extract origin for Referer header to avoid 403 errors
      let referer = '';
      try {
        const urlObj = new URL(url);
        referer = urlObj.origin;
      } catch {
        // Invalid URL, skip referer
      }

      // Use browser-like User-Agent to avoid 403 blocks
      const userAgent =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

      const response = await net.fetch(url, {
        headers: {
          'User-Agent': userAgent,
          Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          ...(referer && {Referer: referer}),
        },
      });

      if (!response.ok) {
        return new Response('Failed to fetch image', {status: response.status});
      }

      const contentType = response.headers.get('content-type') || 'application/octet-stream';

      // Validate content type
      const mimeType = contentType.split(';')[0].trim();
      if (!SUPPORTED_MIME_TYPES.has(mimeType)) {
        // Unsupported content type, return without caching
        return response;
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const extension = this.getExtension(url, contentType);
      const filePath = this.getCacheFilePath(hash, extension);

      // Write to cache
      await writeFile(filePath, buffer);

      // Update metadata

      this.metadata.entries[hash] = {
        url,
        hash,
        extension,
        mimeType,
        cachedAt: Date.now(),
        lastAccessed: Date.now(),
        size: buffer.length,
        etag: response.headers.get('etag') || undefined,
        lastModified: response.headers.get('last-modified') || undefined,
      };

      await this.saveMetadata();

      // Enforce max cache size asynchronously
      this.enforceMaxCacheSize().catch(err => console.error('[ImageCache] Failed to enforce cache size:', err));

      return new Response(buffer, {
        status: 200,
        headers: {'Content-Type': mimeType, 'X-Cache': 'MISS'},
      });
    } catch (error) {
      console.warn(`[ImageCache] Error fetching ${url}:`, error);
      return new Response('Failed to fetch image', {status: 500});
    }
  }

  /** Serves image from cache */
  private async serveFromCache(entry: CacheEntry): Promise<Response | null> {
    const filePath = this.getCacheFilePath(entry.hash, entry.extension);

    try {
      const fileStats = await stat(filePath);
      if (!fileStats.isFile()) {
        return null;
      }

      const buffer = await readFile(filePath);

      // Update last accessed time
      entry.lastAccessed = Date.now();
      // Don't await metadata save to avoid blocking response
      this.saveMetadata().catch(() => {});

      return new Response(buffer, {
        status: 200,
        headers: {
          'Content-Type': entry.mimeType,
          'Content-Length': String(buffer.length),
          'X-Cache': 'HIT',
          'X-Cache-Age': String(Math.floor((Date.now() - entry.cachedAt) / 1000)),
        },
      });
    } catch {
      return null;
    }
  }

  /** Checks if cached entry needs revalidation */
  private needsRevalidation(entry: CacheEntry): boolean {
    const age = Date.now() - entry.cachedAt;
    return age > this.getCacheInterval();
  }

  /** Revalidates a cached entry with the server */
  private async revalidateEntry(entry: CacheEntry): Promise<Response> {
    try {
      // Extract origin for Referer header
      let referer = '';
      try {
        const urlObj = new URL(entry.url);
        referer = urlObj.origin;
      } catch {
        // Invalid URL, skip referer
      }

      // Use browser-like User-Agent
      const userAgent =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

      const headers: Record<string, string> = {
        'User-Agent': userAgent,
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      };

      if (referer) headers['Referer'] = referer;

      // Add conditional headers for revalidation
      if (entry.etag) {
        headers['If-None-Match'] = entry.etag;
      }
      if (entry.lastModified) {
        headers['If-Modified-Since'] = entry.lastModified;
      }

      const response = await net.fetch(entry.url, {headers});

      // 304 Not Modified - cache is still valid
      if (response.status === 304) {
        // Update cache timestamp
        entry.cachedAt = Date.now();
        entry.lastAccessed = Date.now();
        await this.saveMetadata();

        // Serve from cache
        const cachedResponse = await this.serveFromCache(entry);
        if (cachedResponse) {
          return cachedResponse;
        }
      }

      // Resource has changed, fetch new version
      if (response.ok) {
        const contentType = response.headers.get('content-type') || entry.mimeType;
        const buffer = Buffer.from(await response.arrayBuffer());
        const extension = this.getExtension(entry.url, contentType);
        const filePath = this.getCacheFilePath(entry.hash, extension);

        // Remove old file if extension changed
        if (extension !== entry.extension) {
          const oldPath = this.getCacheFilePath(entry.hash, entry.extension);
          try {
            if (existsSync(oldPath)) {
              await unlink(oldPath);
            }
          } catch {
            // Ignore errors
          }
        }

        // Write new file
        await writeFile(filePath, buffer);

        // Update metadata
        entry.extension = extension;
        entry.mimeType = contentType.split(';')[0].trim();
        entry.cachedAt = Date.now();
        entry.lastAccessed = Date.now();
        entry.size = buffer.length;
        entry.etag = response.headers.get('etag') || undefined;
        entry.lastModified = response.headers.get('last-modified') || undefined;

        await this.saveMetadata();

        return new Response(buffer, {
          status: 200,
          headers: {'Content-Type': entry.mimeType, 'X-Cache': 'REVALIDATED'},
        });
      }

      // Revalidation failed, serve stale cache
      const cachedResponse = await this.serveFromCache(entry);
      if (cachedResponse) {
        return cachedResponse;
      }

      return new Response('Failed to revalidate', {status: 500});
    } catch (error) {
      console.warn(`[ImageCache] Revalidation failed for ${entry.url}:`, error);

      // On error, serve stale cache if available
      const cachedResponse = await this.serveFromCache(entry);
      if (cachedResponse) {
        return cachedResponse;
      }

      return new Response('Revalidation failed', {status: 500});
    }
  }

  /** Handles protocol requests */
  private async handleRequest(request: Request): Promise<Response> {
    try {
      const requestUrl = new URL(request.url);

      // URL format: lynxcache://fetch/<encoded-url>
      // or lynxcache://info for cache stats
      // or lynxcache://clear to clear cache

      const command = requestUrl.hostname;

      if (command === 'info') {
        return this.handleInfoRequest();
      }

      if (command === 'clear') {
        return this.handleClearRequest();
      }

      if (command === 'fetch') {
        // Get the original URL from the path (URL encoded)
        const encodedUrl = requestUrl.pathname.slice(1); // Remove leading /
        if (!encodedUrl) {
          return new Response('Missing URL parameter', {status: 400});
        }

        const originalUrl = decodeURIComponent(encodedUrl);
        return this.handleFetchRequest(originalUrl);
      }

      return new Response('Invalid command', {status: 400});
    } catch (error) {
      console.error('[ImageCache] Request handling error:', error);
      return new Response('Internal error', {status: 500});
    }
  }

  /** Allowed URL schemes for fetching images */
  private static readonly ALLOWED_SCHEMES = new Set(['http:', 'https:']);

  /** Handles fetch requests for images */
  private async handleFetchRequest(url: string): Promise<Response> {
    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return new Response('Invalid URL', {status: 400});
    }

    // Block dangerous schemes (file://, javascript:, data:, etc.)
    if (!ImageCacheManager.ALLOWED_SCHEMES.has(parsedUrl.protocol)) {
      console.warn(`[ImageCache] Blocked request with dangerous scheme: ${parsedUrl.protocol}`);
      return new Response('URL scheme not allowed', {status: 403});
    }

    const hash = this.hashUrl(url);
    const entry = this.metadata.entries[hash];

    // Check if we have a cached entry
    if (entry) {
      // Check if revalidation is needed
      if (this.needsRevalidation(entry)) {
        return this.revalidateEntry(entry);
      }

      // Serve from cache
      const cachedResponse = await this.serveFromCache(entry);
      if (cachedResponse) {
        return cachedResponse;
      }

      // Cache file missing, remove entry and fetch fresh
      delete this.metadata.entries[hash];
      await this.saveMetadata();
    }

    const {isOnline} = classHolder;
    if (isOnline) {
      // Fetch and cache
      return this.fetchAndCache(url, hash);
    } else {
      return new Response('Connection is offline', {status: 403});
    }
  }

  /** Returns cache statistics */
  private handleInfoRequest(): Response {
    const entries = Object.values(this.metadata.entries);
    const totalSize = this.calculateCacheSize();
    const oldestEntry = entries.reduce(
      (oldest, entry) => (entry.cachedAt < oldest ? entry.cachedAt : oldest),
      Date.now(),
    );
    const newestEntry = entries.reduce((newest, entry) => (entry.cachedAt > newest ? entry.cachedAt : newest), 0);
    const maxSize = this.getMaxCacheSize();
    const interval = this.getCacheInterval();

    const info = {
      version: this.metadata.version,
      entryCount: entries.length,
      totalSize,
      totalSizeFormatted: formatBytes(totalSize),
      maxSize: maxSize,
      maxSizeFormatted: formatBytes(maxSize),
      usagePercent: Math.round((totalSize / maxSize) * 100),
      lastCleanup: this.metadata.lastCleanup,
      lastCleanupFormatted: new Date(this.metadata.lastCleanup).toISOString(),
      oldestEntry: oldestEntry < Date.now() ? new Date(oldestEntry).toISOString() : null,
      newestEntry: newestEntry > 0 ? new Date(newestEntry).toISOString() : null,
      revalidationInterval: interval,
      revalidationIntervalDays: interval === Infinity ? 0 : interval / (24 * 60 * 60 * 1000),
    };

    return new Response(JSON.stringify(info, null, 2), {
      status: 200,
      headers: {'Content-Type': 'application/json'},
    });
  }

  /** Clears all cache entries */
  private async handleClearRequest(): Promise<Response> {
    try {
      const entryCount = await this.clearAllEntries();

      return new Response(JSON.stringify({success: true, clearedEntries: entryCount}), {
        status: 200,
        headers: {'Content-Type': 'application/json'},
      });
    } catch (error) {
      console.warn('[ImageCache] Failed to clear cache:', error);
      return new Response(JSON.stringify({success: false, error: String(error)}), {
        status: 500,
        headers: {'Content-Type': 'application/json'},
      });
    }
  }

  /**
   * Initializes the cache manager and registers the protocol handler.
   * Must be called after app.whenReady() but before protocol.handle() for other schemes.
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      console.warn('[ImageCache] Already initialized');
      return;
    }

    this.ensureCacheDir();
    await this.loadMetadata();
    this.scheduleCleanup();

    // Register protocol handler
    protocol.handle('lynxcache', request => this.handleRequest(request));

    this.initialized = true;
  }

  /** Stops the cache manager and cleans up resources */
  public stop(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }

    // Save metadata synchronously on shutdown
    this.saveMetadataSync();
    console.log('[ImageCache] Stopped');
  }

  /** Gets cache statistics */
  public getStats(): {entryCount: number; totalSize: number; lastCleanup: number} {
    return {
      entryCount: Object.keys(this.metadata.entries).length,
      totalSize: this.calculateCacheSize(),
      lastCleanup: this.metadata.lastCleanup,
    };
  }

  /** Manually triggers cache cleanup */
  public async triggerCleanup(): Promise<void> {
    await this.performCleanup();
  }

  /** Clears all cached entries */
  public async clearCache(): Promise<number> {
    return this.clearAllEntries();
  }
}

// Singleton instance
let imageCacheManager: ImageCacheManager | null = null;

/** Gets or creates the ImageCacheManager singleton */
export function getImageCacheManager(): ImageCacheManager {
  if (!imageCacheManager) {
    imageCacheManager = new ImageCacheManager();
  }
  return imageCacheManager;
}

/** Registers the lynxcache:// protocol scheme as privileged (must be called before app.ready) */
export function registerImageCacheScheme(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'lynxcache',
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        corsEnabled: true,
        stream: true,
      },
    },
  ]);
}
