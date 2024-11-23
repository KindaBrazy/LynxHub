import {isEmpty} from 'lodash';
import {useEffect, useState} from 'react';

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
          const {id, repoUrl, title, description, avatarUrl, updateDate, version, changeLog} = ext;
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
