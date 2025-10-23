import {Button, Checkbox, cn, User} from '@heroui/react';
import {compact, isEmpty} from 'lodash';
import {Dispatch, SetStateAction, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {MAIN_MODULE_URL} from '../../../../../../cross/CrossConstants';
import {extractGitUrl} from '../../../../../../cross/CrossUtils';
import {getPluginIconUrl} from '../../../../../../cross/plugin/CrossPluginUtils';
import {AppDispatch} from '../../../Redux/Store';
import rendererIpc from '../../../RendererIpc';
import {lynxTopToast} from '../../../Utils/UtilHooks';

type ExtensionItem = {id: string; name: string; description?: string; icon?: string; url: string};

type Props = {
  requirementsSatisfied: boolean;
  isInstalling: boolean;
  setInstalling: (value: boolean) => void;
  setInstalledPlugins: Dispatch<SetStateAction<string[]>>;
  installedPlugins: string[];
};

export default function PluginSelector({
  requirementsSatisfied,
  isInstalling,
  setInstalling,
  setInstalledPlugins,
  installedPlugins,
}: Props) {
  const [plugins, setPlugins] = useState<ExtensionItem[]>([]);
  const [selectedPlugins, setSelectedPlugins] = useState<Set<string>>(new Set());

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    rendererIpc.plugins.getList('public').then(list => {
      const compatibleList = list.filter(item => item.isCompatible && item.url !== MAIN_MODULE_URL);
      const finalList: ExtensionItem[] = compatibleList.map(item => ({
        id: item.metadata.id,
        name: item.metadata.title,
        description: item.metadata.description,
        url: item.url,
        icon: getPluginIconUrl(item.url),
      }));
      setPlugins(finalList);
    });
  }, []);

  const handleSelectionChange = (id: string) => {
    setSelectedPlugins(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const installSelected = async () => {
    setInstalling(true);
    const urlsToInstall = compact(Array.from(selectedPlugins).map(id => plugins.find(ext => ext.id === id)?.url));

    if (isEmpty(urlsToInstall)) {
      setInstalledPlugins([]);
      setInstalling(false);
      return;
    }

    for (const extension of urlsToInstall) {
      const pluginName = plugins.find(item => item.url === extension)?.name || extractGitUrl(extension).repo;

      try {
        const isInstalled = await rendererIpc.plugins.install(extension);

        if (isInstalled) {
          setInstalledPlugins(prevState => [...prevState, pluginName]);
          setPlugins(prevState => prevState.filter(item => item.url !== extension));
          lynxTopToast(dispatch).success(`${pluginName} extension installed successfully.`);
        } else {
          lynxTopToast(dispatch).error(`Failed to install ${pluginName} extension.`);
        }
      } catch (e) {
        lynxTopToast(dispatch).error(`Failed to install ${pluginName} extension.`);
        console.warn(e);
      }
    }

    setInstalling(false);
    setSelectedPlugins(new Set());
  };

  return (
    <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100">Optional Extensions</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">Choose which to install</p>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 -mr-2 mb-4">
        {isEmpty(plugins) ? (
          isEmpty(installedPlugins) ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-500 text-sm">No optional extensions available.</span>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-500 text-sm">
                You're all set! All optional extensions are currently installed.
              </span>
            </div>
          )
        ) : (
          <div className="flex flex-col p-2 gap-y-6 overflow-hidden size-full">
            {plugins.map(ext => (
              <Checkbox
                classNames={{
                  base: cn(
                    'inline-flex w-full max-w-full bg-white dark:bg-gray-900/50',
                    'hover:bg-gray-100 dark:hover:bg-gray-900/80 items-center justify-start',
                    'cursor-pointer rounded-lg gap-2 p-4 border-2 border-foreground-100',
                    'data-[selected=true]:border-primary data-[selected=true]:ring-blue-500/20',
                    'transition-all duration-200',
                  ),
                  label: 'w-full',
                }}
                key={ext.id}
                aria-label={ext.name}
                isDisabled={!requirementsSatisfied}
                isSelected={selectedPlugins.has(ext.id)}
                onValueChange={() => handleSelectionChange(ext.id)}>
                <User
                  name={<span className="font-medium text-gray-800 dark:text-gray-100">{ext.name}</span>}
                  avatarProps={{size: 'md', radius: 'sm', className: 'shrink-0 bg-transparent', src: ext.icon}}
                  description={<span className="text-xs text-gray-500 dark:text-gray-400">{ext.description}</span>}
                />
              </Checkbox>
            ))}
          </div>
        )}
      </div>

      <Button
        isLoading={isInstalling}
        onPress={installSelected}
        isDisabled={!requirementsSatisfied || isEmpty(selectedPlugins)}>
        {requirementsSatisfied ? 'Install Selected' : 'Complete Requirements First'}
      </Button>
    </div>
  );
}
