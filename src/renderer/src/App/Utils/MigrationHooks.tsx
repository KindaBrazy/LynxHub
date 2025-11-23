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
