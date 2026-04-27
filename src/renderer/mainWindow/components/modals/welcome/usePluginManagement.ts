import {topToast} from '@lynx/layouts/ToastProviders';
import {MAIN_MODULE_URL} from '@lynx_common/consts';
import {extractGitUrl} from '@lynx_common/utils';
import {getPluginIconUrl} from '@lynx_common/utils/plugins';
import pluginsIpc from '@lynx_shared/ipc/plugins';
import {compact, isEmpty} from 'lodash';
import {Dispatch, SetStateAction, useEffect, useState} from 'react';

import {ExtensionItem} from './types';

export function useAvailablePlugins() {
  const [plugins, setPlugins] = useState<ExtensionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    pluginsIpc.getList('public').then(list => {
      const compatibleList = list.filter(item => item.isCompatible && item.url !== MAIN_MODULE_URL);
      const finalList: ExtensionItem[] = compatibleList.map(item => ({
        id: item.metadata.id,
        name: item.metadata.title,
        description: item.metadata.description,
        url: item.url,
        icon: getPluginIconUrl(item.url),
      }));
      setPlugins(finalList);
      setIsLoading(false);
    });
  }, []);

  return {plugins, setPlugins, isLoading};
}

export function usePluginInstaller(
  plugins: ExtensionItem[],
  setPlugins: Dispatch<SetStateAction<ExtensionItem[]>>,
  setInstalledPlugins: Dispatch<SetStateAction<string[]>>,
  setInstalling: (value: boolean) => void,
) {
  const installPlugins = async (selectedIds: Set<string>, clearSelection: () => void) => {
    setInstalling(true);
    const urlsToInstall = compact(Array.from(selectedIds).map(id => plugins.find(ext => ext.id === id)?.url));

    if (isEmpty(urlsToInstall)) {
      setInstalledPlugins([]);
      setInstalling(false);
      return;
    }

    for (const extension of urlsToInstall) {
      const pluginName = plugins.find(item => item.url === extension)?.name || extractGitUrl(extension).repo;

      try {
        const isInstalled = await pluginsIpc.install(extension);

        if (isInstalled) {
          setInstalledPlugins(prevState => [...prevState, pluginName]);
          setPlugins(prevState => prevState.filter(item => item.url !== extension));
          topToast.success(`${pluginName} extension installed successfully.`);
        } else {
          topToast.danger(`Failed to install ${pluginName} extension.`);
        }
      } catch (e) {
        topToast.danger(`Failed to install ${pluginName} extension.`);
        console.warn(e);
      }
    }

    setInstalling(false);
    clearSelection();
  };

  return {installPlugins};
}
