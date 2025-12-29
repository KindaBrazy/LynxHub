import {useEffect} from 'react';

import rendererIpc from '../RendererIpc';

export const useMigrateCardTitles = () => {
  useEffect(() => {
    const checkAndMigrate = async () => {
      const isMigrated = await rendererIpc.storage.getCustom('migration_titles_done');
      if (isMigrated) return;

      const keysToMigrate: string[] = [];

      // First pass: identify keys to avoid modifying localStorage while iterating
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.endsWith('_title_edited')) {
          keysToMigrate.push(key);
        }
      }

      // Second pass: migrate and remove
      keysToMigrate.forEach(key => {
        const value = window.localStorage.getItem(key);
        if (value) {
          rendererIpc.storage.setCustom(key, value);
          window.localStorage.removeItem(key);
          console.log(`Migrated ${key} to rendererIpc storage`);
        }
      });

      rendererIpc.storage.setCustom('migration_titles_done', true);
    };

    checkAndMigrate();
  }, []);
};

/**
 * Clears old favicon cache from localStorage.
 * Previously, favicons were cached as base64 data URLs in localStorage.
 * Now they use the lynxcache:// protocol with disk-based caching.
 */
export const useClearOldFaviconCache = () => {
  useEffect(() => {
    const migrationKey = 'migration_favicon_cache_cleared';

    // Check if already migrated
    if (window.localStorage.getItem(migrationKey)) return;

    const keysToRemove: string[] = [];

    // Find all old favicon cache entries (pattern: *_favicon_http* or *_favicon_https*)
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.includes('_favicon_http')) {
        keysToRemove.push(key);
      }
    }

    // Remove old cache entries
    if (keysToRemove.length > 0) {
      keysToRemove.forEach(key => window.localStorage.removeItem(key));
      console.log(`[Migration] Cleared ${keysToRemove.length} old favicon cache entries from localStorage`);
    }

    // Mark migration as done
    window.localStorage.setItem(migrationKey, 'true');
  }, []);
};
