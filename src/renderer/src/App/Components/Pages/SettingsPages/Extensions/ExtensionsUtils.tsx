import {isEmpty} from 'lodash';
import {useEffect, useMemo, useState} from 'react';

import {EXTENSION_CONTAINER} from '../../../../../../../cross/CrossConstants';
import {Extension_ListData, ExtensionsInfo} from '../../../../../../../cross/CrossTypes';
import {extractGitUrl} from '../../../../../../../cross/CrossUtils';

export function useFetchExtensions() {
  const [data, setData] = useState<Extension_ListData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);

    async function fetchExtensionsList() {
      try {
        const response = await fetch(EXTENSION_CONTAINER);
        const extensions = (await response.json()) as ExtensionsInfo[];

        const data: Extension_ListData[] = extensions.map(ext => {
          const {id, repoUrl, title, description, avatarUrl, updateDate, version, changeLog, tag} = ext;
          const {owner} = extractGitUrl(repoUrl);

          return {
            id,
            url: repoUrl,
            title,
            description,
            changeLog,
            updateDate,
            version,
            avatarUrl,
            developer: owner,
            tag,
          };
        });

        if (!isEmpty(data)) setData(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    fetchExtensionsList();
  }, []);

  return {data, loading};
}

export function useFilteredList(
  list: Extension_ListData[],
  selectedFilters: Set<'installed' | Extension_ListData['tag']> | 'all',
  installed: string[],
) {
  return useMemo(() => {
    if (selectedFilters === 'all' || selectedFilters.size === 4) return list;

    const isInstalledFilterActive = selectedFilters.has('installed');
    return list.filter(item => {
      const isInstalled = installed.includes(item.id);
      const matchesTag = selectedFilters.has(item.tag);

      if (!isInstalledFilterActive) {
        return !isInstalled && matchesTag;
      }

      return isInstalled || matchesTag;
    });
  }, [list, selectedFilters, installed]);
}

export function useSortedList(list: Extension_ListData[], installed: string[]) {
  return useMemo(
    () =>
      [...list].sort((a, b) => {
        const aInstalled = installed.includes(a.id);
        const bInstalled = installed.includes(b.id);

        if (aInstalled && !bInstalled) return -1;
        if (!aInstalled && bInstalled) return 1;
        return 0;
      }),
    [list, installed],
  );
}
